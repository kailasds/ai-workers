import { Link } from "react-router-dom";
import { X, ArrowRight, ArrowLeft as ArrowLeftIcon, Check, XCircle, Clock3, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KnowledgeGraphNode } from "@/lib/knowledge/graph-types";
import { getWorker, getMemory, observationsForWorker, getObservation, getRun, getConstructLive, getCandidateDecisionLive, getPacks, packUsage, topicSummary } from "@/lib/knowledge/service";
import { observationsFor } from "@/lib/knowledge/data";
import { acceptCandidate, rejectCandidate, deferCandidate, useKnowledgeOverlayVersion } from "@/lib/knowledge/store";
import type { Outcome, Construct, CandidateStatus, PackStatus } from "@/lib/knowledge/types";
import { kindLabel } from "./graph-node";
import { findKnowledgeItemIdForConstruct } from "@/lib/knowledge-repo/service";

const constructMeaning: Record<Construct["status"], string> = {
  "Nothing yet": "No Worker has reported an observation against this yet.",
  Observed: "We saw this happen during a Worker run. It does not yet mean the knowledge is confirmed.",
  Corroborated: "Multiple observations independently support the same learning.",
  Certified: "This knowledge passed the required validation and admission criteria.",
  Published: "This knowledge has been made available as shared organizational knowledge, ready for reuse.",
};

const candidateMeaning: Record<CandidateStatus, string> = {
  Pending: "There isn't enough evidence yet to decide — awaiting evidence.",
  "Ready to Certify": "Evidence is sufficient for this candidate to move toward certification.",
  Contradictory: "Different Workers reported different outcomes. It will not be automatically promoted.",
  Deferred: "A decision has been postponed pending more evidence.",
  Accepted: "This candidate has been admitted for further trusted-knowledge processing — not yet fully certified.",
  Rejected: "This candidate was explicitly rejected and will not become reusable knowledge.",
};

const candidateNextStep: Record<CandidateStatus, string> = {
  Pending: "Gather more evidence",
  "Ready to Certify": "Certification",
  Contradictory: "Resolve contradicting evidence",
  Deferred: "Re-review when more evidence arrives",
  Accepted: "Certification",
  Rejected: "None — closed",
};

const outcomeTone: Record<Outcome, "green" | "amber" | "blue" | "neutral" | "red"> = {
  Met: "green",
  "Not met": "red",
  "Awaiting evidence": "amber",
  "Not adjudicable": "neutral",
  "Not measured": "neutral",
};
const constructTone: Record<Construct["status"], "neutral" | "blue" | "amber" | "green"> = {
  "Nothing yet": "neutral",
  Observed: "blue",
  Corroborated: "amber",
  Certified: "green",
  Published: "green",
};
const candidateTone: Record<CandidateStatus, "neutral" | "blue" | "amber" | "green" | "red" | "purple"> = {
  Pending: "neutral",
  "Ready to Certify": "blue",
  Contradictory: "red",
  Deferred: "purple",
  Accepted: "green",
  Rejected: "red",
};
const packTone: Record<PackStatus, "green" | "red" | "neutral"> = { Published: "green", Blocked: "red", Draft: "neutral" };

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">{title}</p>
      {children}
    </div>
  );
}

export function GraphDetailPanel({
  node,
  onClose,
  onTraceEvidence,
  onTraceUsage,
  onFocus,
}: {
  node: KnowledgeGraphNode;
  onClose: () => void;
  onTraceEvidence: (nodeId: string) => void;
  onTraceUsage: (nodeId: string) => void;
  onFocus: (nodeId: string) => void;
}) {
  useKnowledgeOverlayVersion();
  const p = node.data as Record<string, any>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">{kindLabel[node.kind]}</p>
          <p className="mt-0.5 text-[13.5px] font-bold leading-snug text-ink">{node.label}</p>
        </div>
        <button onClick={onClose} className="shrink-0 grid h-7 w-7 place-items-center rounded-full text-ink-mute hover:bg-card-sunken hover:text-ink">
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5">
        {node.kind === "worker" && <WorkerPanel refId={node.refId} />}
        {node.kind === "topic" && <TopicPanel refId={node.refId} onFocus={onFocus} />}
        {node.kind === "construct" && <ConstructPanel refId={node.refId} onFocus={onFocus} />}
        {node.kind === "run" && <RunPanel payload={p} onFocus={onFocus} />}
        {node.kind === "observation" && <ObservationPanel refId={node.refId} />}
        {node.kind === "evidence" && <EvidencePanel refId={node.refId} />}
        {(node.kind === "candidate" || node.kind === "certified") && <CandidatePanel refId={node.refId} certified={node.kind === "certified"} />}
        {node.kind === "pack" && <PackPanel refId={node.refId} />}
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onTraceEvidence(node.id)}>
          <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={2} />
          Trace evidence
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onTraceUsage(node.id)}>
          Trace usage
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function WorkerPanel({ refId }: { refId: string }) {
  const worker = getWorker(refId);
  const memory = getMemory(refId);
  const obs = observationsForWorker(refId);
  if (!worker) return null;
  return (
    <div className="space-y-0">
      <PanelSection title="Worker">
        <p className="text-[12.5px] text-ink">{worker.boundedContext}</p>
        <p className="text-[11.5px] text-ink-mute mt-0.5">Run #{worker.runNumber}</p>
      </PanelSection>
      <PanelSection title="Contribution">
        <p className="text-[12.5px] text-ink">{obs.length} observation{obs.length === 1 ? "" : "s"} recorded</p>
      </PanelSection>
      <PanelSection title="Memory">
        <div className="flex items-center gap-2">
          <Badge variant={memory?.status === "Lost on restart" ? "amber" : "neutral"}>{memory?.status}</Badge>
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-mute leading-relaxed">{memory?.note}</p>
      </PanelSection>
      <div className="mt-3 flex flex-col items-start gap-1.5">
        <Link to={`/learning/memory/${refId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          View full memory record
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </Link>
        <Link to={`/capabilities/worker/${refId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          View capabilities
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function TopicPanel({ refId, onFocus }: { refId: string; onFocus: (id: string) => void }) {
  const summary = topicSummary(refId);
  return (
    <div>
      <PanelSection title="Topic">
        <p className="text-[12.5px] text-ink leading-relaxed">
          {summary.observationCount} observations from {summary.workerCount} Worker{summary.workerCount === 1 ? "" : "s"}.
        </p>
      </PanelSection>
      <Link to={`/learning/topics/${refId}`} onClick={() => onFocus(`topic:${refId}`)} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View topic observations
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

function ConstructPanel({ refId }: { refId: string; onFocus: (id: string) => void }) {
  const c = getConstructLive(refId);
  const obs = observationsFor(refId);
  const knowledgeItemId = findKnowledgeItemIdForConstruct(refId);
  if (!c) return null;
  const workerCount = new Set(obs.map((o) => o.workerId)).size;
  return (
    <div>
      <PanelSection title="Current state">
        <Badge variant={constructTone[c.liveStatus]}>{c.liveStatus}</Badge>
        {c.blockingReason && <p className="mt-1.5 text-[11.5px] text-status-amber leading-relaxed">{c.blockingReason}</p>}
      </PanelSection>
      <PanelSection title="What this means">
        <p className="text-[12px] text-ink-mute leading-relaxed">{constructMeaning[c.liveStatus]}</p>
      </PanelSection>
      <PanelSection title="Evidence">
        <p className="text-[13px] font-semibold text-ink">
          {obs.length} observation{obs.length === 1 ? "" : "s"} · {workerCount} Worker{workerCount === 1 ? "" : "s"}
        </p>
      </PanelSection>
      <PanelSection title="Category">
        <p className="text-[12.5px] text-ink">{c.category}</p>
      </PanelSection>
      <div className="mt-3 flex flex-col items-start gap-1.5">
        <Link to={`/learning/constructs/${refId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          View full construct detail
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </Link>
        {knowledgeItemId && (
          <Link to={`/knowledge/${knowledgeItemId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
            Open knowledge
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}

function RunPanel({ payload, onFocus }: { payload: Record<string, any>; onFocus: (id: string) => void }) {
  const run = payload.run;
  const worker = payload.worker;
  if (!run) return null;
  return (
    <div>
      <PanelSection title="Outcome">
        <Badge variant={outcomeTone[run.outcome as Outcome]}>{run.outcome}</Badge>
        {run.note && <p className="mt-1.5 text-[11.5px] text-ink-mute leading-relaxed">{run.note}</p>}
      </PanelSection>
      <PanelSection title="Metrics">
        <div className="space-y-1">
          {run.metrics.map((m: any) => (
            <div key={m.label} className="flex items-center justify-between text-[11.5px]">
              <span className="text-ink-mute">{m.label}</span>
              <span className="font-medium text-ink tabular-nums">{m.value === null ? "Not measured" : `${m.value}% ≥ ${m.target}%`}</span>
            </div>
          ))}
        </div>
      </PanelSection>
      {worker && (
        <button onClick={() => onFocus(`worker:${worker.id}`)} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          Focus executing Worker
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function ObservationPanel({ refId }: { refId: string }) {
  return (
    <div>
      <PanelSection title="Summary">
        <p className="text-[12.5px] text-ink leading-relaxed">Full observation detail — result metrics, citations, and Definition of Done checks.</p>
      </PanelSection>
      <Link to={`/learning/observations/${refId}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View full observation
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

function EvidencePanel({ refId }: { refId: string }) {
  const observation = getObservation(refId);
  const run = observation ? getRun(observation.runId) : undefined;
  return (
    <div>
      <PanelSection title="Evidence type">
        <p className="text-[12.5px] text-ink">Run metrics & Definition of Done result</p>
      </PanelSection>
      {run && (
        <PanelSection title="Metrics">
          <div className="space-y-1">
            {run.metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between text-[11.5px]">
                <span className="text-ink-mute">{m.label}</span>
                <span className="font-medium text-ink tabular-nums">{m.value === null ? "Not measured" : `${m.value}% ≥ ${m.target}%`}</span>
              </div>
            ))}
          </div>
        </PanelSection>
      )}
      <Link to={`/learning/observations/${refId}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View citations & timeline
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

function CandidatePanel({ refId, certified }: { refId: string; certified: boolean }) {
  const cand = getCandidateDecisionLive(refId);
  const knowledgeItemId = cand ? findKnowledgeItemIdForConstruct(cand.constructId) : null;
  if (!cand) return null;
  const decided = cand.liveStatus === "Accepted" || cand.liveStatus === "Rejected";
  const contradictory = cand.liveStatus === "Contradictory" || cand.contradictingObservationIds.length > 0;
  return (
    <div>
      <PanelSection title="Claim">
        <p className="text-[12.5px] text-ink leading-relaxed">{cand.claim}</p>
      </PanelSection>
      <PanelSection title="Current state">
        <Badge variant={candidateTone[cand.liveStatus]}>{cand.liveStatus}</Badge>
      </PanelSection>
      <PanelSection title="What this means">
        <p className="text-[12px] text-ink-mute leading-relaxed">
          {contradictory ? "Different Workers reported different outcomes under related conditions." : candidateMeaning[cand.liveStatus]}
        </p>
      </PanelSection>
      <PanelSection title="Supporting evidence">
        <p className="text-[13px] font-semibold text-ink">
          {cand.supportingObservationIds.length} supporting
          {cand.contradictingObservationIds.length > 0 ? ` · ${cand.contradictingObservationIds.length} contradicting` : ""}
        </p>
      </PanelSection>
      {!certified && !decided && (
        <PanelSection title="Next step">
          <p className="text-[12.5px] text-ink">{candidateNextStep[cand.liveStatus]}</p>
        </PanelSection>
      )}
      <PanelSection title="Recommendation">
        <p className="text-[11.5px] text-ink-mute leading-relaxed">{cand.aiRecommendation}</p>
      </PanelSection>

      {!certified && !decided && (
        <div className="mt-3 flex items-center gap-1.5">
          <Button size="sm" variant="primary" className="flex-1" onClick={() => acceptCandidate(cand.id)}>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Accept
          </Button>
          <Button size="sm" variant="secondary" onClick={() => deferCandidate(cand.id)}>
            <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => rejectCandidate(cand.id)}>
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      )}

      <div className={cn("flex flex-col items-start gap-1.5", certified || decided ? "mt-3" : "mt-2.5")}>
        <Link to={`/learning/candidates/${refId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          View full decision record
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </Link>
        {knowledgeItemId && (
          <Link to={`/knowledge/${knowledgeItemId}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
            Open knowledge
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}

function PackPanel({ refId }: { refId: string }) {
  const pack = getPacks().find((p) => p.id === refId);
  const usage = packUsage(refId);
  if (!pack) return null;
  return (
    <div>
      <PanelSection title="Status">
        <div className="flex items-center gap-2">
          <Badge variant={packTone[pack.status]}>{pack.status}</Badge>
          <span className="text-[11.5px] text-ink-mute">v{pack.version}</span>
        </div>
      </PanelSection>
      <PanelSection title="Regression gate">
        <p className="text-[12.5px] text-ink">
          {pack.regressionGate.itemsTested}/{pack.regressionGate.itemsTotal} items tested · {pack.regressionGate.status}
        </p>
      </PanelSection>
      <PanelSection title="Reuse">
        <p className="text-[12.5px] text-ink">
          Used by {new Set(usage.map((u) => u.workerId)).size} Worker{new Set(usage.map((u) => u.workerId)).size === 1 ? "" : "s"} across {usage.length} run{usage.length === 1 ? "" : "s"}
        </p>
      </PanelSection>
      <Link to={`/learning/packs/${refId}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View full pack detail
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}
