import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpDown,
  ShieldCheck,
  Users,
  UsersRound,
  CircleDot,
  Zap,
  ListChecks,
  CheckCircle2,
  Award,
  LayoutGrid,
  List,
  Boxes,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { MaturityBadge } from "@/components/shared/maturity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DonutChart, DonutLegend } from "@/components/shared/donut-chart";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workers } from "@/lib/data";
import { dodStatusMeta, workerStatusColor, workerStatusLabel } from "@/lib/status";
import { getWorkerMaturity, type MaturityTier } from "@/lib/registry/maturity";
import { getLearningSummaryForWorker } from "@/lib/registry/learning-summary";
import { cn } from "@/lib/utils";

const domains = Array.from(new Set(workers.map((w) => w.domain)));
const environments = Array.from(new Set(workers.map((w) => w.identity.environment)));

const statusColors = ["var(--color-status-blue)", "var(--color-status-amber)", "var(--color-status-red)", "var(--color-ink-faint)"];

type SortKey = "name" | "cost";
type ViewMode = "grid" | "list";

export default function WorkersDirectory() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [autonomy, setAutonomy] = useState<string>("all");
  const [environment, setEnvironment] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<ViewMode>("grid");

  const withMaturity = useMemo(() => workers.map((w) => ({ worker: w, maturity: getWorkerMaturity(w) })), []);

  const statusDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of workers) counts.set(workerStatusLabel[w.status], (counts.get(workerStatusLabel[w.status]) ?? 0) + 1);
    return Array.from(counts.entries()).map(([label, value], i) => ({ label, value, color: statusColors[i % statusColors.length] }));
  }, []);

  const tierCounts = useMemo(() => {
    const counts: Record<MaturityTier, number> = { Silver: 0, Gold: 0, Platinum: 0 };
    for (const { maturity } of withMaturity) counts[maturity.tier] += 1;
    return counts;
  }, [withMaturity]);

  const needsAttention = workers.filter((w) => w.sentinel === "policy-violation" || w.sentinel === "intervention-required").length;

  const filtered = useMemo(() => {
    let list = withMaturity.filter(({ worker: w }) => {
      const matchesQuery =
        query.trim() === "" ||
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.role.toLowerCase().includes(query.toLowerCase());
      const matchesDomain = domain === "all" || w.domain === domain;
      const matchesStatus = status === "all" || w.status === status;
      const matchesAutonomy = autonomy === "all" || w.autonomy === autonomy;
      const matchesEnv = environment === "all" || w.identity.environment === environment;
      return matchesQuery && matchesDomain && matchesStatus && matchesAutonomy && matchesEnv;
    });
    list = [...list].sort((a, b) => (sort === "cost" ? a.worker.costPerTask - b.worker.costPerTask : a.worker.name.localeCompare(b.worker.name)));
    return list;
  }, [withMaturity, query, domain, status, autonomy, environment, sort]);

  return (
    <div className="pb-10">
      <PageHeader
        title="Registry"
        subtitle="What Workers exist, what can they do, how mature are they, and how are they performing?"
        icon={Users}
        tone="blue"
        actions={
          <Button asChild>
            <Link to="/workers/new">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create AI Worker
            </Link>
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        {/* Worker Distribution — §5/§6, computed from real Worker data, no invented metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-6 rounded-card border border-border bg-card shadow-card p-5 flex flex-col gap-4">
            <h3 className="text-[12.5px] font-bold text-ink">Worker status distribution</h3>
            <div className="flex flex-1 items-center gap-6">
              <DonutChart data={statusDistribution} centerValue={workers.length} centerLabel="Workers" size={112} thickness={15} />
              <div className="min-w-0 flex-1">
                <DonutLegend data={statusDistribution} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <KpiCard label="Workers" value={workers.length} icon={Boxes} />
            <KpiCard label="Needs attention" value={needsAttention} icon={ShieldCheck} trend={needsAttention > 0 ? { direction: "up", label: "Review recommended", goodWhenUp: false } : { direction: "flat", label: "Nothing flagged" }} />
            <KpiCard label="Gold or Platinum" value={tierCounts.Gold + tierCounts.Platinum} icon={Award} trend={{ direction: "flat", label: `${tierCounts.Platinum} Platinum · ${tierCounts.Gold} Gold` }} />
            <KpiCard label="Silver (emerging)" value={tierCounts.Silver} icon={BrainCircuit} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workers…"
              className="rounded-full pl-9"
            />
          </div>

          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="review">Needs Review</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
            </SelectContent>
          </Select>

          <Select value={autonomy} onValueChange={setAutonomy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Autonomy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All autonomy levels</SelectItem>
              <SelectItem value="supervised">Supervised</SelectItem>
              <SelectItem value="guarded">Guarded</SelectItem>
              <SelectItem value="autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>

          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              {environments.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => setSort(sort === "name" ? "cost" : "name")}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft transition hover:bg-card-sunken"
          >
            <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sort: {sort === "name" ? "Name" : "Cost"}
          </button>

          <div className="flex items-center gap-0.5 rounded-control border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={cn("grid h-7 w-7 place-items-center rounded-[7px] transition-colors", view === "grid" ? "bg-accent-soft text-accent-ink" : "text-ink-faint hover:text-ink-soft")}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={cn("grid h-7 w-7 place-items-center rounded-[7px] transition-colors", view === "list" ? "bg-accent-soft text-accent-ink" : "text-ink-faint hover:text-ink-soft")}
            >
              <List className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(({ worker, maturity }) => (
              <WorkerCard key={worker.id} worker={worker} maturity={maturity} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-card border border-dashed border-border-strong py-10 text-center text-[12.5px] text-ink-mute">No workers match these filters.</div>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[980px] grid grid-cols-[2fr_0.9fr_0.9fr_0.9fr_1.4fr_1.2fr_0.9fr] items-center gap-4 border-b border-accent-border bg-accent-soft px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
                <span className="flex items-center gap-1.5"><UsersRound className="h-3 w-3 text-accent" strokeWidth={2} />Worker</span>
                <span className="flex items-center gap-1.5"><CircleDot className="h-3 w-3 text-accent" strokeWidth={2} />Status</span>
                <span className="flex items-center gap-1.5"><Award className="h-3 w-3 text-accent" strokeWidth={2} />Maturity</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-accent" strokeWidth={2} />Autonomy</span>
                <span className="flex items-center gap-1.5"><ListChecks className="h-3 w-3 text-accent" strokeWidth={2} />Active Work</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-accent" strokeWidth={2} />Definition of Done</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-accent" strokeWidth={2} />Governance</span>
              </div>

              {filtered.map(({ worker: w, maturity }) => {
                const dod = dodStatusMeta[w.definitionOfDone.overallStatus];
                return (
                  <Link
                    key={w.id}
                    to={`/workers/${w.id}`}
                    className="min-w-[980px] grid grid-cols-[2fr_0.9fr_0.9fr_0.9fr_1.4fr_1.2fr_0.9fr] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{w.avatarInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-ink">{w.name}</p>
                        <p className="truncate text-[12px] text-ink-mute">{w.role}</p>
                      </div>
                    </div>
                    <Badge variant={workerStatusColor[w.status]} dot>
                      {w.statusLabel}
                    </Badge>
                    <MaturityBadge maturity={maturity} />
                    <AutonomyBadge level={w.autonomy} />
                    <span className="truncate text-[12.5px] text-ink-soft">{w.currentWork?.title ?? "—"}</span>
                    <Badge variant={dod.color}>{dod.label}</Badge>
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                      <ShieldCheck className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
                      {w.governance.policies.length > 0 ? `${w.governance.policies.length} policies` : "Not configured"}
                    </span>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="px-5 py-14 text-center">
                <p className="text-[13px] text-ink-mute">No workers match these filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkerCard({ worker: w, maturity }: { worker: (typeof workers)[number]; maturity: ReturnType<typeof getWorkerMaturity> }) {
  const learning = getLearningSummaryForWorker(w.id);
  const dod = dodStatusMeta[w.definitionOfDone.overallStatus];

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4 transition-shadow hover:shadow-float">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback>{w.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[14px] font-bold leading-snug text-ink font-display">{w.name}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-ink-mute">{w.role}</p>
          </div>
        </div>
        <Badge variant={workerStatusColor[w.status]} dot className="shrink-0">
          {w.statusLabel}
        </Badge>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-soft">{w.purpose}</p>

      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-ink-mute">
        <span className="min-w-0 truncate">{w.scope.boundedScope}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <MaturityBadge maturity={maturity} />
        <AutonomyBadge level={w.autonomy} />
        <Badge variant={dod.color}>{dod.label}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5 text-[11px] text-ink-mute">
        <span className="flex items-center gap-1.5">
          <BrainCircuit className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
          {learning.measured ? `${learning.observations} observation${learning.observations === 1 ? "" : "s"}` : "Not measured"}
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
          {w.governance.policies.length > 0 ? `${w.governance.policies.length} policies` : "Not configured"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end border-t border-border pt-2.5">
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
