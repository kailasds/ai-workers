import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkle, ArrowRight, ChevronDown, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateRecommendations,
  recommendedUpdatesStats,
  experienceAnalysisStats,
  hubWorker,
  getLearning,
  type RecommendationStatus,
  type UpdateType,
} from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const statusTone: Record<RecommendationStatus, "neutral" | "blue" | "amber" | "green" | "purple" | "accent"> = {
  New: "blue",
  "Ready for Review": "accent",
  "In Validation": "amber",
  Approved: "green",
  Scheduled: "purple",
  Applied: "green",
  Monitoring: "purple",
  Dismissed: "neutral",
};

const updateTypeFilters: (UpdateType | "All")[] = [
  "All",
  "Decision Strategy",
  "Validation Logic",
  "Tool Usage",
  "Workflow Sequence",
  "Exception Handling",
];

const statusFilters: (RecommendationStatus | "All")[] = ["All", "New", "Ready for Review", "In Validation", "Applied"];

export default function RecommendedUpdates() {
  const [typeFilter, setTypeFilter] = useState<(typeof updateTypeFilters)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = updateRecommendations.filter(
    (u) => (typeFilter === "All" || u.updateType === typeFilter) && (statusFilter === "All" || u.status === statusFilter)
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Recommended Updates" value={recommendedUpdatesStats.total} tone="accent" />
        <SummaryCard label="Ready to Review" value={recommendedUpdatesStats.readyForReview} tone="blue" />
        <SummaryCard label="In Validation" value={recommendedUpdatesStats.inValidation} tone="amber" />
        <SummaryCard label="Applied Recently" value={recommendedUpdatesStats.appliedRecently} tone="green" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label="Type"
          value={typeFilter}
          options={updateTypeFilters}
          onChange={(v) => setTypeFilter(v as typeof typeFilter)}
        />
        <FilterPill
          label="Status"
          value={statusFilter}
          options={statusFilters}
          onChange={(v) => setStatusFilter(v as typeof statusFilter)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const target = hubWorker(u.targetWorkerId);
            const learning = getLearning(u.sourceLearningId);
            return (
              <div key={u.id} className="rounded-card border border-border bg-card shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14.5px] font-bold text-ink">{u.title}</p>
                      <Badge variant="outline">{u.updateType}</Badge>
                      <Badge variant={statusTone[u.status]}>{u.status}</Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-mute">
                      Target: <span className="font-medium text-ink-soft">{target.name}</span>
                      {learning && (
                        <>
                          {" "}
                          · Source: <span className="font-medium text-ink-soft">{learning.title}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <ImpactBadge level={u.impactLevel} />
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent-soft px-3.5 py-2.5">
                  <Sparkle className="h-3.5 w-3.5 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
                  <p className="text-[12.5px] leading-relaxed text-accent-ink">{u.aiReason}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px]">
                  <EvidenceStat label="Observed across" value={`${u.observedAcross} executions`} />
                  <EvidenceStat label="Consistent outcome" value={u.consistentOutcome} />
                  <EvidenceStat label="Applicable to" value={`${u.applicableToCount} similar workers`} />
                  <EvidenceStat label="Expected outcome" value={u.expectedOutcome} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-ink-faint">Recommended {new Date(u.recommendedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  <Button asChild size="sm">
                    <Link to={`/experience-hub/updates/${u.id}`}>
                      Review Update
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "accent" | "blue" | "amber" | "green" }) {
  const toneClass = {
    accent: "text-accent-ink",
    blue: "text-status-blue",
    amber: "text-status-amber",
    green: "text-status-green",
  }[tone];
  return (
    <div className="rounded-card border border-border bg-card shadow-card px-4 py-3.5">
      <p className="text-[11px] font-medium text-ink-mute">{label}</p>
      <p className={cn("mt-1 text-[22px] leading-none font-bold tabular-nums", toneClass)}>{value}</p>
    </div>
  );
}

function ImpactBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const tone = level === "High" ? "green" : level === "Medium" ? "amber" : "neutral";
  return (
    <Badge variant={tone} className="shrink-0">
      {level} Impact
    </Badge>
  );
}

function EvidenceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card-sunken px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[12px] font-medium text-ink truncate">{value}</p>
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

function EmptyState() {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent-ink mb-3">
        <Layers className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-[14px] font-semibold text-ink">No updates need your attention</p>
      <p className="mt-1 text-[12.5px] text-ink-mute max-w-md mx-auto">
        AI is continuing to analyze operational experiences across your deployed workers.
      </p>
      <div className="mt-4 flex items-center justify-center gap-3 text-[11.5px] text-ink-mute">
        <span>{experienceAnalysisStats.experiencesBeingAnalyzed} experiences currently being analyzed</span>
        <span className="text-ink-faint">·</span>
        <span>{experienceAnalysisStats.patternsUnderValidation} patterns under validation</span>
      </div>
    </div>
  );
}
