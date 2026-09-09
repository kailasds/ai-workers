import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Sparkle, ArrowRight, Users2, GitCommitHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCandidateDecisions, getConstruct, getObservation } from "@/lib/knowledge/service";
import { acceptCandidate, rejectCandidate, deferCandidate, useKnowledgeOverlayVersion } from "@/lib/knowledge/store";
import type { CandidateStatus, DecisionType } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const statusTone: Record<CandidateStatus, "neutral" | "blue" | "amber" | "green" | "red" | "purple"> = {
  Pending: "blue",
  "Ready to Certify": "purple",
  Contradictory: "amber",
  Deferred: "neutral",
  Accepted: "green",
  Rejected: "red",
};

const typeFilters: (DecisionType | "All")[] = ["All", "Mapping", "Pitfall", "Procedure", "Recommendation", "Rule"];
const statusFilters: (CandidateStatus | "All")[] = ["All", "Pending", "Ready to Certify", "Contradictory", "Deferred", "Accepted", "Rejected"];

export default function CandidateDecisions() {
  useKnowledgeOverlayVersion();
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const candidates = getCandidateDecisions();
  const pending = candidates.filter((c) => c.liveStatus === "Pending" || c.liveStatus === "Ready to Certify").length;
  const contradictions = candidates.filter((c) => c.liveStatus === "Contradictory").length;
  const readyToCertify = candidates.filter((c) => c.liveStatus === "Ready to Certify").length;
  const deferred = candidates.filter((c) => c.liveStatus === "Deferred").length;

  const filtered = candidates
    .filter((c) => typeFilter === "All" || c.type === typeFilter)
    .filter((c) => statusFilter === "All" || c.liveStatus === statusFilter);

  const active = filtered.filter((c) => !["Accepted", "Rejected", "Deferred"].includes(c.liveStatus));
  const decided = filtered.filter((c) => ["Accepted", "Rejected", "Deferred"].includes(c.liveStatus));

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card shadow-card grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        <SummaryCell label="Pending decisions" value={pending} tone="text-status-blue" />
        <SummaryCell label="Contradictions" value={contradictions} tone="text-status-amber" />
        <SummaryCell label="Ready to certify" value={readyToCertify} tone="text-status-purple" />
        <SummaryCell label="Deferred" value={deferred} tone="text-ink-mute" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill label="Type" value={typeFilter} options={typeFilters} onChange={setTypeFilter} />
        <FilterPill label="Status" value={statusFilter} options={statusFilters} onChange={setStatusFilter} />
      </div>

      <div className="space-y-2.5">
        {active.map((c) => (
          <CandidateRow key={c.id} candidate={c} />
        ))}
        {active.length === 0 && (
          <div className="rounded-card border border-border bg-card shadow-card p-8 text-center">
            <p className="text-[13px] font-medium text-ink">No candidates match these filters.</p>
            <p className="mt-1 text-[12px] text-ink-mute">Deferred and decided items do not remain in this queue.</p>
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2 px-1">Decided</p>
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            {decided.map((c) => {
              const construct = getConstruct(c.constructId);
              return (
                <Link
                  key={c.id}
                  to={`/knowledge/candidates/${c.id}`}
                  className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-b-0 transition hover:bg-card-sunken/60"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-ink truncate">{c.claim}</p>
                    <p className="text-[11px] text-ink-mute">{construct?.name}</p>
                  </div>
                  <Badge variant={statusTone[c.liveStatus]} className="shrink-0">
                    {c.liveStatus}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateRow({ candidate }: { candidate: ReturnType<typeof getCandidateDecisions>[number] }) {
  const construct = getConstruct(candidate.constructId);
  const workerCount = new Set(candidate.supportingObservationIds.map((id) => getObservation(id)?.workerId).filter(Boolean)).size;
  const runCount = new Set(candidate.supportingObservationIds.map((id) => getObservation(id)?.runId).filter(Boolean)).size;
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{candidate.type}</Badge>
            <Badge variant={statusTone[candidate.liveStatus]}>{candidate.liveStatus}</Badge>
          </div>
          <p className="mt-1.5 text-[13.5px] font-medium text-ink leading-snug">{candidate.claim}</p>
          <p className="mt-1 text-[11.5px] text-ink-mute">{construct?.name}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-ink-mute">
        <span className="flex items-center gap-1">
          <GitCommitHorizontal className="h-3 w-3" strokeWidth={2} />
          {candidate.supportingObservationIds.length} observations
        </span>
        <span className="flex items-center gap-1">
          <Users2 className="h-3 w-3" strokeWidth={2} />
          {workerCount} Workers
        </span>
        <span>{runCount} runs</span>
        {candidate.contradictingObservationIds.length > 0 && (
          <span className="text-status-amber font-medium">{candidate.contradictingObservationIds.length} contradicting</span>
        )}
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-ink-soft line-clamp-2">
        <Sparkle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" strokeWidth={1.9} />
        {candidate.aiRecommendation}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link to={`/knowledge/candidates/${candidate.id}`} className="flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
          View evidence
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => deferCandidate(candidate.id)}>
            Defer
          </Button>
          <Button size="sm" variant="destructive" onClick={() => rejectCandidate(candidate.id)}>
            Reject
          </Button>
          <Button size="sm" onClick={() => acceptCandidate(candidate.id)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[11px] font-medium text-ink-mute">{label}</p>
      <p className={cn("mt-1 text-[22px] leading-none font-bold tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function FilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
    </div>
  );
}
