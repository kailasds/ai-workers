import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { coverageSummary, allCoverageRows } from "@/lib/knowledge/service";
import type { ConstructStatus } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const statusTone: Record<ConstructStatus, "neutral" | "blue" | "amber" | "green" | "purple"> = {
  "Nothing yet": "neutral",
  Observed: "blue",
  Corroborated: "amber",
  Certified: "green",
  Published: "purple",
};

const statusFilters: (ConstructStatus | "All")[] = ["All", "Nothing yet", "Observed", "Corroborated", "Certified", "Published"];

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function Coverage() {
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get("status") as ConstructStatus) ?? "All";
  const [status, setStatus] = useState<ConstructStatus | "All">(statusFilters.includes(initialStatus) ? initialStatus : "All");
  const [query, setQuery] = useState("");

  const summary = coverageSummary();
  const rows = allCoverageRows()
    .filter((r) => status === "All" || r.construct.liveStatus === status)
    .filter((r) => r.construct.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Context</span>
        <Badge variant="outline">tibco-to-springboot</Badge>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        <SummaryCell label="Certified" value={summary.certified} tone="text-status-green" />
        <SummaryCell label="Corroborated" value={summary.corroborated} tone="text-status-amber" />
        <SummaryCell label="Observed" value={summary.observed} tone="text-status-blue" />
        <SummaryCell label="Nothing admitted" value={summary.nothingAdmitted} tone="text-ink-mute" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-9 w-64 text-ink-faint">
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search constructs…"
            className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ConstructStatus | "All")}
            className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
          >
            {statusFilters.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.8fr_0.9fr_0.7fr_0.7fr_0.7fr_0.6fr_0.9fr_0.5fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
              <span>Construct</span>
              <span>Status</span>
              <span>Mappings</span>
              <span>Pitfalls</span>
              <span>Awaiting</span>
              <span>Runs</span>
              <span>Last observed</span>
              <span />
            </div>
            {rows.map((r) => (
              <Link
                key={r.construct.id}
                to={`/knowledge/constructs/${r.construct.id}`}
                className="grid grid-cols-[1.8fr_0.9fr_0.7fr_0.7fr_0.7fr_0.6fr_0.9fr_0.5fr] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 transition-colors hover:bg-card-sunken/60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">{r.construct.name}</span>
                  <span className="block truncate text-[10.5px] text-ink-faint font-mono">{r.construct.technicalKey}</span>
                </span>
                <Badge variant={statusTone[r.construct.liveStatus]}>{r.construct.liveStatus}</Badge>
                <span className="text-[12px] tabular-nums text-ink-soft">{r.mappingCount}</span>
                <span className="text-[12px] tabular-nums text-ink-soft">{r.pitfallCount}</span>
                <span className="text-[12px] tabular-nums text-ink-soft">{r.awaitingCount}</span>
                <span className="text-[12px] tabular-nums text-ink-soft">{r.runCount}</span>
                <span className="text-[11.5px] text-ink-mute">{timeAgo(r.lastObserved)}</span>
                <ChevronRight className="h-3.5 w-3.5 text-ink-faint justify-self-end" strokeWidth={2} />
              </Link>
            ))}
            {rows.length === 0 && <p className={cn("px-5 py-8 text-[12.5px] text-ink-mute")}>No constructs match these filters.</p>}
          </div>
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
