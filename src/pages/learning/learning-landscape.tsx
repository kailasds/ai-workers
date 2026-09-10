import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkle, Layers, Eye, Share2, AlertTriangle, Users2, ChevronRight, Clock } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { KnowledgeGraph } from "@/components/knowledge-graph/knowledge-graph";
import { LearningLifecycleExplainer } from "@/components/knowledge-graph/learning-lifecycle-explainer";
import {
  topics,
  learningLandscapeStats,
  lifecycleCounts,
  topicSummary,
  liveArrivals,
  knowledgeGaps,
  getWorker,
  memoryRecords,
} from "@/lib/knowledge/service";
import { graphContexts, PRIMARY_CONTEXT, type GraphFilters } from "@/lib/knowledge/graph-types";
import { useKnowledgeOverlayVersion } from "@/lib/knowledge/store";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const lifecycleStages: { key: "observed" | "corroborated" | "certified" | "published" | "reused"; label: string; filter: GraphFilters["lifecycle"] }[] = [
  { key: "observed", label: "Observed", filter: "Observed" },
  { key: "corroborated", label: "Corroborated", filter: "Corroborated" },
  { key: "certified", label: "Certified", filter: "Certified" },
  { key: "published", label: "Published", filter: "Published" },
  { key: "reused", label: "Reused", filter: "Reused" },
];

export default function LearningLandscape() {
  useKnowledgeOverlayVersion();
  const [searchParams] = useSearchParams();
  const focusConstructId = searchParams.get("focus");
  const workerFilter = searchParams.get("worker");
  const [contextId, setContextId] = useState(PRIMARY_CONTEXT);
  const [lifecycleFilter, setLifecycleFilter] = useState<GraphFilters["lifecycle"] | null>(null);
  const [pulse, setPulse] = useState(0);

  const stats = learningLandscapeStats();
  const lifecycle = lifecycleCounts();
  const arrivals = liveArrivals(6);
  const gaps = knowledgeGaps();
  const atRiskWorkerNames = memoryRecords.filter((m) => m.status === "Lost on restart").length;

  const summary = `Workers have recorded ${stats.observations} observations across ${stats.topicsLearned} migration topics. ${
    stats.reusable === 0 ? "None has reached shared Knowledge yet." : `${stats.reusable} construct${stats.reusable === 1 ? " has" : "s have"} been published as reusable knowledge.`
  } ${atRiskWorkerNames} Worker${atRiskWorkerNames === 1 ? "" : "s"} currently hold${atRiskWorkerNames === 1 ? "s" : ""} memory that may be lost on restart.`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="rounded-card border border-accent-border bg-accent-soft p-4 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink mb-1.5">
            <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
            GBrain knowledge
          </p>
          <p className="text-[13px] leading-relaxed text-ink">{summary}</p>
        </div>
        <div className="shrink-0 pt-0.5">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">Context</p>
          <Select value={contextId} onValueChange={setContextId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {graphContexts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Topics learned" value={stats.topicsLearned} icon={Layers} tone="purple" />
        <StatCard label="Observations" value={stats.observations} icon={Eye} tone="blue" />
        <StatCard label="Reusable" value={stats.reusable} icon={Share2} tone="green" />
        <StatCard label="At risk" value={stats.atRisk} icon={AlertTriangle} tone="amber" />
        <StatCard label="Contributing Workers" value={stats.contributingWorkers} icon={Users2} tone="accent" />
      </div>

      <LearningLifecycleExplainer />

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="h-[640px]">
          <KnowledgeGraph
            key={`${contextId}-${focusConstructId ?? ""}-${workerFilter ?? ""}`}
            contextId={contextId}
            focusConstructId={focusConstructId}
            initialWorkerFilter={workerFilter}
            lifecycleFilter={lifecycleFilter}
            onLifecycleConsumed={() => setLifecycleFilter(null)}
          />
        </div>
        <div className="border-t border-border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2.5">Knowledge Lifecycle</p>
          <div className="flex items-stretch gap-2">
            {lifecycleStages.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    setLifecycleFilter(s.filter);
                    setPulse((p) => p + 1);
                  }}
                  className="flex-1 rounded-lg border border-border bg-card-sunken px-3 py-2.5 text-center transition hover:border-accent-border hover:bg-accent-soft"
                >
                  <p className="text-[18px] leading-none font-bold tabular-nums text-ink">
                    {s.key === "observed" ? lifecycle.observed : s.key === "corroborated" ? lifecycle.corroborated : s.key === "certified" ? lifecycle.certified : s.key === "published" ? lifecycle.published : lifecycle.reused}
                  </p>
                  <p className="mt-1 text-[10.5px] font-medium text-ink-mute">{s.label}</p>
                </button>
                {i < lifecycleStages.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-ink-faint shrink-0 mx-1" strokeWidth={2} />}
              </div>
            ))}
            <div className="flex items-center pl-1">
              <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2} />
              <span className="ml-1 text-[10.5px] font-medium text-accent-ink whitespace-nowrap">New observations</span>
            </div>
          </div>
          {pulse > 0 && <p className="mt-2 text-[10.5px] text-ink-faint">Graph filtered to {lifecycleFilter} knowledge above.</p>}
        </div>
      </div>

      <div>
        <p className="text-[13.5px] font-bold text-ink mb-3 px-1">Learning Topics</p>
        <div className="space-y-2.5">
          {topics.map((t) => {
            const s = topicSummary(t.id);
            return (
              <Link
                key={t.id}
                to={`/learning/topics/${t.id}`}
                className="flex items-center justify-between gap-4 rounded-card border border-border bg-card shadow-card px-5 py-3.5 transition hover:bg-card-sunken/60"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink">{t.name}</p>
                  <p className="mt-1 flex items-center gap-3 text-[11.5px] text-ink-mute">
                    <span>{s.observationCount} observations</span>
                    <span>·</span>
                    <span>{s.workerCount} Workers</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {s.latestAt ? timeAgo(s.latestAt) : "—"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="amber">Lost on restart</Badge>
                  <Badge variant="neutral">Not yet reusable</Badge>
                  <ChevronRight className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-[13.5px] font-bold text-ink mb-3 px-1">Live Arrivals</p>
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            {arrivals.map((o) => {
              const topic = topics.find((t) => t.id === o.topicId);
              const worker = getWorker(o.workerId);
              return (
                <Link
                  key={o.id}
                  to={`/learning/observations/${o.id}`}
                  className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition hover:bg-card-sunken/60"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-ink truncate">{topic?.name}</p>
                    <p className="text-[11px] text-ink-mute truncate">{worker?.name}</p>
                  </div>
                  <span className="text-[11px] text-ink-faint shrink-0">{timeAgo(o.recordedAt)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[13.5px] font-bold text-ink mb-3 px-1">Knowledge Gaps</p>
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            {gaps.map(({ construct, reason }) => (
              <Link
                key={construct.id}
                to={`/learning/constructs/${construct.id}`}
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition hover:bg-card-sunken/60"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-ink truncate">{construct.name}</p>
                  <p className="text-[11px] text-status-amber truncate">{reason}</p>
                </div>
                <ChevronRight className={cn("h-3.5 w-3.5 text-ink-faint shrink-0")} strokeWidth={2} />
              </Link>
            ))}
            {gaps.length === 0 && <p className="px-4 py-6 text-[12px] text-ink-mute">No open knowledge gaps right now.</p>}
          </div>
          <Link to="/learning/coverage" className="mt-2 inline-flex items-center gap-1 px-1 text-[12px] font-medium text-accent-ink hover:underline">
            View all coverage
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
