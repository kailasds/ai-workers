import type { AIWorker } from "../types";
import { knowledgeWorkerIdsFor } from "./worker-links";
import { allRuns, observationsForWorker, getConstructLive } from "../knowledge/service";
import { knowledgeUsage } from "../knowledge/data";

export type MaturityTier = "Silver" | "Gold" | "Platinum";

export interface MaturityEvidence {
  evaluation: { passRate: number | null; gatesPassed: number; gatesTotal: number };
  learning: { observations: number; corroborated: number; certified: number; reused: number };
  outcomes: { successful: number; total: number };
  governance: { violations: number; note: string };
}

export interface WorkerMaturity {
  tier: MaturityTier;
  measured: boolean;
  evidence: MaturityEvidence;
  reason: string;
}

const tierMeaning: Record<MaturityTier, string> = {
  Silver: "Configured Worker with limited execution history and evidence. Ready for controlled use.",
  Gold: "Worker with repeatable evaluation performance and outcomes. Proven through repeated execution.",
  Platinum: "Worker with sustained performance, strong learning, reliable outcomes and healthy governance. Trusted for broader/high-value operational use.",
};

export function getWorkerMaturity(worker: AIWorker): WorkerMaturity {
  const knowledgeIds = knowledgeWorkerIdsFor(worker.id);
  const violations = worker.sentinel === "policy-violation" || worker.sentinel === "intervention-required" ? 1 : 0;
  const governanceNote = violations > 0 ? "Active governance issue requires attention." : "No active violations.";

  if (knowledgeIds.length === 0) {
    return {
      tier: "Silver",
      measured: false,
      evidence: {
        evaluation: { passRate: null, gatesPassed: 0, gatesTotal: 0 },
        learning: { observations: 0, corroborated: 0, certified: 0, reused: 0 },
        outcomes: { successful: 0, total: 0 },
        governance: { violations, note: governanceNote },
      },
      reason: violations > 0 ? "Governance issue active; evaluation and learning history not yet measured." : "No evaluation or learning history recorded yet.",
    };
  }

  const runs = allRuns.filter((r) => knowledgeIds.includes(r.workerId));
  const observations = knowledgeIds.flatMap((id) => observationsForWorker(id));
  const gates = runs.flatMap((r) => r.dodChecks);
  const gatesPassed = gates.filter((g) => g.status === "Met").length;
  const successful = runs.filter((r) => r.outcome === "Met").length;

  const constructIds = new Set(observations.map((o) => o.constructId));
  let corroborated = 0;
  let certified = 0;
  for (const cid of constructIds) {
    const c = getConstructLive(cid);
    if (!c) continue;
    if (c.liveStatus === "Corroborated" || c.liveStatus === "Certified" || c.liveStatus === "Published") corroborated += 1;
    if (c.liveStatus === "Certified" || c.liveStatus === "Published") certified += 1;
  }
  const reused = knowledgeUsage.filter((u) => knowledgeIds.includes(u.workerId)).length;

  const passRate = gates.length > 0 ? gatesPassed / gates.length : null;

  const evidence: MaturityEvidence = {
    evaluation: { passRate, gatesPassed, gatesTotal: gates.length },
    learning: { observations: observations.length, corroborated, certified, reused },
    outcomes: { successful, total: runs.length },
    governance: { violations, note: governanceNote },
  };

  let tier: MaturityTier = "Silver";
  let reason = "Capability configured with limited evaluation and learning history so far.";

  const strongOutcomes = runs.length >= 4 && passRate !== null && passRate >= 0.75 && violations === 0;
  const veryStrongOutcomes = runs.length >= 8 && passRate !== null && passRate >= 0.9 && certified >= 1 && violations === 0;

  if (veryStrongOutcomes) {
    tier = "Platinum";
    reason = `${runs.length} runs with a ${Math.round(passRate! * 100)}% historical pass rate, ${certified} certified knowledge construct${certified === 1 ? "" : "s"}, and no active governance violations.`;
  } else if (strongOutcomes) {
    tier = "Gold";
    reason = `${runs.length} runs with a ${Math.round(passRate! * 100)}% historical pass rate and no active governance violations.`;
  } else if (violations > 0) {
    reason = "An active governance issue is limiting this Worker's maturity tier.";
  }

  return { tier, measured: true, evidence, reason };
}

export function maturityMeaning(tier: MaturityTier): string {
  return tierMeaning[tier];
}
