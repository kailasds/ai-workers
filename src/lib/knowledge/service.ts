import {
  workers,
  topics,
  constructs,
  observations,
  candidateDecisions,
  packs,
  knowledgeUsage,
  memoryRecords,
  getConstruct,
  getCandidate,
  observationsFor,
  observationsForTopic,
  observationsForWorker,
} from "./data";
import { currentCandidateStatus, currentCandidateHistory, currentConstructStatus } from "./store";
import type { Construct, ConstructStatus } from "./types";

export {
  workers,
  topics,
  observations,
  memoryRecords,
  runs as allRuns,
  getWorker,
  getObservation,
  getRun,
  getConstruct,
  getCandidate,
  getPack,
  getMemory,
  observationsFor,
  observationsForTopic,
  observationsForWorker,
} from "./data";

import { runs } from "./data";

// ---------------------------------------------------------------------------
// Live-status accessors (data + interactive overlay merged)
// ---------------------------------------------------------------------------

export function getConstructs(): (Construct & { liveStatus: ConstructStatus })[] {
  return constructs.map((c) => ({ ...c, liveStatus: currentConstructStatus(c.id) }));
}

export function getConstructLive(id: string) {
  const c = getConstruct(id);
  if (!c) return undefined;
  return { ...c, liveStatus: currentConstructStatus(id) };
}

export function getCandidateDecisions() {
  return candidateDecisions.map((c) => ({
    ...c,
    liveStatus: currentCandidateStatus(c.id),
    liveHistory: currentCandidateHistory(c.id),
  }));
}

export function getCandidateDecisionLive(id: string) {
  const c = getCandidate(id);
  if (!c) return undefined;
  return { ...c, liveStatus: currentCandidateStatus(id), liveHistory: currentCandidateHistory(id) };
}

export function getPacks() {
  return packs;
}

// ---------------------------------------------------------------------------
// Learning Landscape
// ---------------------------------------------------------------------------

export function contributingWorkers() {
  return workers.filter((w) => observationsForWorker(w.id).length > 0);
}

export function learningLandscapeStats() {
  const liveConstructs = getConstructs();
  const reusable = liveConstructs.filter((c) => c.liveStatus === "Published").length;
  const atRisk = memoryRecords.filter((m) => m.status === "Lost on restart").length;
  return {
    topicsLearned: topics.length,
    observations: observations.length,
    reusable,
    atRisk,
    contributingWorkers: contributingWorkers().length,
  };
}

export function lifecycleCounts() {
  const liveConstructs = getConstructs();
  const rank: Record<ConstructStatus, number> = { "Nothing yet": 0, Observed: 1, Corroborated: 2, Certified: 3, Published: 4 };
  const atLeast = (stage: ConstructStatus) => liveConstructs.filter((c) => rank[c.liveStatus] >= rank[stage]).length;
  return {
    observed: observations.length,
    corroborated: atLeast("Corroborated"),
    certified: atLeast("Certified"),
    published: atLeast("Published"),
    reused: knowledgeUsage.length,
  };
}

export function topicSummary(topicId: string) {
  const topic = topics.find((t) => t.id === topicId);
  const obs = observationsForTopic(topicId).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  const workerIds = new Set(obs.map((o) => o.workerId));
  const latest = obs[0];
  return {
    topic,
    observationCount: obs.length,
    workerCount: workerIds.size,
    latestAt: latest?.recordedAt ?? null,
    reusable: false,
    atRisk: true,
  };
}

export function liveArrivals(limit = 12) {
  return [...observations].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).slice(0, limit);
}

export function knowledgeGaps() {
  const liveConstructs = getConstructs().filter((c) => observationsFor(c.id).length > 0 && c.liveStatus !== "Published" && c.liveStatus !== "Certified");
  return liveConstructs.map((c) => ({
    construct: c,
    reason: c.blockingReason ?? "Insufficient evidence to progress.",
  }));
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

export function coverageSummary() {
  const liveConstructs = getConstructs();
  return {
    certified: liveConstructs.filter((c) => c.liveStatus === "Certified" || c.liveStatus === "Published").length,
    corroborated: liveConstructs.filter((c) => c.liveStatus === "Corroborated").length,
    observed: liveConstructs.filter((c) => c.liveStatus === "Observed").length,
    nothingAdmitted: liveConstructs.filter((c) => c.liveStatus === "Nothing yet").length,
  };
}

export function coverageRow(constructId: string) {
  const c = getConstructLive(constructId);
  if (!c) return undefined;
  const obs = observationsFor(constructId);
  const runIds = new Set(obs.map((o) => o.runId));
  const workerIds = new Set(obs.map((o) => o.workerId));
  const contradictions = obs.filter((o) => o.contradicts && o.contradicts.length > 0).length;
  const candidate = candidateDecisions.find((cd) => cd.constructId === constructId);
  const lastObserved = obs.length > 0 ? obs.reduce((a, b) => (new Date(a.recordedAt) > new Date(b.recordedAt) ? a : b)).recordedAt : null;
  return {
    construct: c,
    evidenceCount: obs.length,
    mappingCount: candidate?.type === "Mapping" ? 1 : 0,
    pitfallCount: candidate?.type === "Pitfall" ? 1 : 0,
    awaitingCount: obs.filter((o) => o.outcome === "Awaiting evidence").length,
    runCount: runIds.size,
    workerCount: workerIds.size,
    contradictions,
    lastObserved,
    candidate,
    observations: obs,
  };
}

export function allCoverageRows() {
  return constructs.map((c) => coverageRow(c.id)!);
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export function packUsage(packId: string) {
  return knowledgeUsage.filter((u) => u.packId === packId);
}

export function packSummary() {
  const published = packs.filter((p) => p.status === "Published");
  const knowledgeItems = new Set(published.flatMap((p) => p.knowledgeItemIds));
  const workersUsing = new Set(knowledgeUsage.map((u) => u.workerId));
  const latestPublished = published
    .filter((p) => p.publishedAt)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())[0];
  return {
    publishedPacks: published.length,
    knowledgeItems: knowledgeItems.size,
    workersUsing: workersUsing.size,
    runsInfluenced: knowledgeUsage.length,
    latestPublication: latestPublished?.publishedAt ?? null,
  };
}

export { runs };
