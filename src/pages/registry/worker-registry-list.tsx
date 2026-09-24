import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Activity,
  RefreshCw,
  ShieldAlert,
  Boxes,
  Sparkles,
  Brain,
  Building2,
  MoreVertical,
  Clock,
  ShieldCheck,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/shared/kpi-card";
import { DonutChart, DonutLegend } from "@/components/shared/donut-chart";
import { registryStats, tcsManagedWorkers, customerPackages, type RegistryCard, type CustomerPackageRow } from "@/lib/registry-data";
import { cn } from "@/lib/utils";

const distributionColors = ["var(--color-status-blue)", "var(--color-status-purple)", "var(--color-status-amber)"];
const distributionData = registryStats.boundedContextDistribution.map((d, i) => ({
  ...d,
  color: distributionColors[i % distributionColors.length],
}));

const statusTone: Record<RegistryCard["status"], "blue" | "amber" | "green"> = {
  New: "blue",
  Evolving: "amber",
  Learning: "green",
};

const statusIconTone: Record<RegistryCard["status"], string> = {
  New: "bg-status-blue-soft text-status-blue",
  Evolving: "bg-status-amber-soft text-status-amber",
  Learning: "bg-status-green-soft text-status-green",
};

const packageStateTone: Record<CustomerPackageRow["state"], BadgeProps["variant"]> = {
  Prepared: "blue",
  Shared: "amber",
  Acknowledged: "green",
};

type SortKey = "evidence" | "recent" | "name";

export default function WorkerRegistryList() {
  const [query, setQuery] = useState("");
  const [contextFilter, setContextFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [runtimeFilter, setRuntimeFilter] = useState("all");
  const [learningFilter, setLearningFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("evidence");
  const [view, setView] = useState<"grid" | "list">("grid");

  const contextOptions = useMemo(() => Array.from(new Set(tcsManagedWorkers.map((w) => w.boundedContextLabel))), []);
  const runtimeOptions = useMemo(() => Array.from(new Set(tcsManagedWorkers.map((w) => w.runtime))), []);

  const filteredWorkers = useMemo(() => {
    const rows = tcsManagedWorkers.filter((w) => {
      if (query.trim() && !w.identityLabel.toLowerCase().includes(query.toLowerCase())) return false;
      if (contextFilter !== "all" && w.boundedContextLabel !== contextFilter) return false;
      if (stateFilter !== "all" && w.status !== stateFilter) return false;
      if (runtimeFilter !== "all" && w.runtime !== runtimeFilter) return false;
      if (learningFilter === "learning" && w.gbrainMemories === 0) return false;
      if (learningFilter === "none" && w.gbrainMemories > 0) return false;
      return true;
    });
    return [...rows].sort((a, b) => {
      if (sortKey === "evidence") return b.gbrainMemories - a.gbrainMemories;
      if (sortKey === "recent") return b.composedAt.localeCompare(a.composedAt);
      return a.identityLabel.localeCompare(b.identityLabel);
    });
  }, [query, contextFilter, stateFilter, runtimeFilter, learningFilter, sortKey]);

  const filteredPackages = useMemo(
    () => customerPackages.filter((p) => !query.trim() || p.destination.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="pb-12">
      <PageHeader title="Worker Registry" subtitle="Manage deployed Workers and customer-ready packages." icon={Users} tone="accent" />

      <div className="px-8 space-y-5">
        <Tabs defaultValue="managed">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="managed">TCS-managed Workers</TabsTrigger>
              <TabsTrigger value="packages">Customer packages</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.9} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, owner or context" className="pl-8" />
            </div>
          </div>

          <TabsContent value="managed" className="space-y-5">
            {/* Distribution chart + KPIs — 12-col row: chart spans 6 (chart left, legend right), KPIs span the other 6 as a 3+3 (2-up) grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-6 rounded-card border border-border bg-card shadow-card p-5 flex flex-col gap-4">
                <h3 className="text-[12.5px] font-bold text-ink">Bounded-context distribution</h3>
                <div className="flex flex-1 items-center gap-6">
                  <DonutChart data={distributionData} centerValue={registryStats.workers} centerLabel="Workers" size={128} thickness={16} />
                  <div className="min-w-0 flex-1">
                    <DonutLegend data={distributionData} />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <KpiCard label="Workers" value={registryStats.workers} icon={Boxes} />
                <KpiCard
                  label="Serving now"
                  value={registryStats.servingNow}
                  icon={Activity}
                  trend={{ direction: "up", label: `${registryStats.servingNow} of ${registryStats.workers} live` }}
                />
                <KpiCard label="Ready revision" value={registryStats.readyRevision} icon={RefreshCw} />
                <KpiCard
                  label="Needs attention"
                  value={registryStats.needsAttention}
                  icon={ShieldAlert}
                  trend={registryStats.needsAttention > 0 ? { direction: "up", label: "Review recommended", goodWhenUp: false } : { direction: "flat", label: "Nothing flagged" }}
                />
              </div>
            </div>

            {/* Filter section */}
            <div className="flex flex-wrap items-center gap-2.5">
              <SelectPill
                label="Context"
                value={contextFilter}
                onChange={setContextFilter}
                options={[{ value: "all", label: "All contexts" }, ...contextOptions.map((c) => ({ value: c, label: c }))]}
              />
              <SelectPill
                label="State"
                value={stateFilter}
                onChange={setStateFilter}
                options={[
                  { value: "all", label: "All states" },
                  { value: "New", label: "New" },
                  { value: "Evolving", label: "Evolving" },
                  { value: "Learning", label: "Learning" },
                ]}
              />
              <SelectPill
                label="Runtime"
                value={runtimeFilter}
                onChange={setRuntimeFilter}
                options={[{ value: "all", label: "All" }, ...runtimeOptions.map((r) => ({ value: r, label: r }))]}
              />
              <SelectPill
                label="Learning"
                value={learningFilter}
                onChange={setLearningFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "learning", label: "Learning" },
                  { value: "none", label: "No memory" },
                ]}
              />
              <SelectPill
                label="Sort by"
                value={sortKey}
                onChange={(v) => setSortKey(v as SortKey)}
                options={[
                  { value: "evidence", label: "Most evidence" },
                  { value: "recent", label: "Most recent" },
                  { value: "name", label: "Name" },
                ]}
              />

              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-0.5 rounded-control border border-border bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-[7px] transition-colors",
                      view === "grid" ? "bg-accent-soft text-accent-ink" : "text-ink-faint hover:text-ink-soft"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-[7px] transition-colors",
                      view === "list" ? "bg-accent-soft text-accent-ink" : "text-ink-faint hover:text-ink-soft"
                    )}
                  >
                    <List className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                <span className="whitespace-nowrap text-[12px] font-medium text-ink-mute">{filteredWorkers.length} Workers</span>
              </div>
            </div>

            {/* Worker list */}
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
              {filteredWorkers.map((w) => (view === "grid" ? <WorkerCard key={w.id} w={w} /> : <WorkerRow key={w.id} w={w} />))}
              {filteredWorkers.length === 0 && <EmptyRow query={query} />}
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                    <th className="px-4 py-3 font-semibold">Worker</th>
                    <th className="px-3 py-3 font-semibold">Destination</th>
                    <th className="px-3 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPackages.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-card-sunken">
                      <td className="px-4 py-3 font-medium text-ink">{p.workerLabel}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 text-ink-soft">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.9} />
                          {p.destination}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={packageStateTone[p.state]} dot>
                          {p.state}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{p.digest}</td>
                    </tr>
                  ))}
                  {filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ink-mute">
                        No packages match “{query}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WorkerCard({ w }: { w: RegistryCard }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4 transition-shadow hover:shadow-float">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", statusIconTone[w.status])}>
            <Sparkles className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold leading-snug text-ink font-display">{w.identityLabel}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-ink-mute">{w.boundedContextLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={statusTone[w.status]} dot>
            {w.status}
          </Badge>
          <button type="button" aria-label="More actions" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-card-sunken hover:text-ink-soft">
            <MoreVertical className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
        <span className="min-w-0 truncate text-ink-mute">
          Bounded context · <span className="font-medium text-ink-soft">{w.contextTag}</span>
        </span>
        <span className="shrink-0 text-ink-faint">Rev {w.revision}</span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <StatChip icon={Brain} tone="blue" label="GBrain" value={w.gbrainMemories === 0 ? "No memory" : `${w.gbrainMemories} memories`} />
        <StatChip icon={Clock} tone="amber" label="Memory" value={w.memoryDays ? `${w.memoryDays} days` : "—"} />
        <StatChip icon={ShieldCheck} tone="green" label="Sentinel" value={w.sentinelConfigured ? "Configured" : "Not set"} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <Button variant="secondary" size="sm" className="gap-1 px-2.5">
          View runtimes
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </Button>
        <Button asChild size="sm" className="gap-1 px-2.5">
          <Link to={`/workers/${w.id}`}>
            View Worker
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "blue" | "amber" | "green";
  label: string;
  value: string;
}) {
  const toneClass = {
    blue: "bg-status-blue-soft text-status-blue",
    amber: "bg-status-amber-soft text-status-amber",
    green: "bg-status-green-soft text-status-green",
  }[tone];

  return (
    <div className="rounded-control bg-card-sunken px-2 py-1.5">
      <div className={cn("grid h-5 w-5 place-items-center rounded-full", toneClass)}>
        <Icon className="h-3 w-3" strokeWidth={2} />
      </div>
      <p className="mt-1 text-[9.5px] font-medium text-ink-mute">{label}</p>
      <p className="truncate text-[11px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function WorkerRow({ w }: { w: RegistryCard }) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-border bg-card shadow-card px-4 py-3 transition-shadow hover:shadow-float">
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", statusIconTone[w.status])}>
        <Sparkles className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant={statusTone[w.status]} dot>
            {w.status}
          </Badge>
          <span className="text-[10.5px] text-ink-faint">Revision {w.revision}</span>
        </div>
        <p className="mt-1 truncate text-[13.5px] font-semibold text-ink">{w.identityLabel}</p>
        <p className="truncate text-[11.5px] text-ink-mute">{w.boundedContextLabel}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 md:flex">
        <RowStat icon={Brain} label="GBrain" value={w.gbrainMemories === 0 ? "No memory" : `${w.gbrainMemories}`} />
        <RowStat icon={Clock} label="Memory" value={w.memoryDays ? `${w.memoryDays}d` : "—"} />
        <RowStat icon={ShieldCheck} label="Sentinel" value={w.sentinelConfigured ? "Configured" : "Not set"} />
      </div>
      <Button asChild size="sm" className="shrink-0 gap-1">
        <Link to={`/workers/${w.id}`}>
          View
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </Button>
    </div>
  );
}

function RowStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] whitespace-nowrap">
      <Icon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.9} />
      <span className="text-ink-mute">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function SelectPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-control border border-border-strong bg-card pl-3 pr-8 text-[12.5px] font-medium text-ink-soft outline-none transition-colors hover:bg-card-sunken"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
    </div>
  );
}

function EmptyRow({ query }: { query: string }) {
  return <div className="col-span-full rounded-card border border-dashed border-border-strong py-10 text-center text-[12.5px] text-ink-mute">No Workers match “{query}”.</div>;
}
