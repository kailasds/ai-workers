import { useState } from "react";
import { LayoutGrid, RefreshCw, Layers, Package, Boxes, Activity, CheckCircle2, Clock, Wallet, Coins, Database, Shuffle, Gauge } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryBarChart } from "@/components/shared/delivery-bar-chart";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import {
  deliveryPulse,
  completedRunsByPeriod,
  definitionOfDoneEvidence,
  workersByIdentity,
  workersByBoundedContext,
  runsByAutonomy,
  runCost,
  modelRouting,
  workerReadiness,
  type PortfolioRow,
} from "@/lib/dashboard-data";

const ranges = ["7 days", "30 days", "90 days", "All time"] as const;

const pulseIcon: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  registered: Layers,
  packaged: Package,
  active: Activity,
  completed: CheckCircle2,
  avgRun: Clock,
};

const stageTones = ["blue", "purple", "amber", "green"] as const;

export default function Overview() {
  const [range, setRange] = useState<(typeof ranges)[number]>("30 days");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    window.setTimeout(() => setRefreshing(false), 550);
  }

  return (
    <div className="pb-12">
      <PageHeader
        title="Dashboard"
        subtitle="What Workers deliver."
        icon={LayoutGrid}
        tone="accent"
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    range === r ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={refresh}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border-strong bg-card px-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-card-sunken"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} strokeWidth={2} />
              Refresh
            </button>
          </>
        }
      />

      <div className="px-8 space-y-6" key={refreshKey}>
        {/* Delivery pulse */}
        <section className="space-y-3">
          <SectionHeading title="Delivery pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {deliveryPulse.map((m) => (
              <PulseKpi key={m.id} metric={m} />
            ))}
          </div>
        </section>

        {/* Delivery evidence */}
        <section className="space-y-3">
          <SectionHeading title="Delivery evidence" subtitle="Recorded quality checks" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            <div className="xl:col-span-2 rounded-card border border-border bg-card shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-ink">Completed runs</h3>
                  <p className="text-[12px] text-ink-mute">Daily, for the selected range</p>
                </div>
                <Badge variant="outline">Daily</Badge>
              </div>
              <div className="mt-6">
                <DeliveryBarChart data={completedRunsByPeriod} height={220} />
              </div>
            </div>

            <div className="rounded-card border border-status-green/20 bg-status-green-soft/30 shadow-card p-5">
              <h3 className="text-[14.5px] font-bold text-ink">Definition of Done evidence</h3>
              <p className="text-[11px] text-ink-mute">Recorded quality checks</p>

              <div className="mt-4 flex items-center gap-5">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Criteria</p>
                  <p className="mt-0.5 text-[20px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">
                    {definitionOfDoneEvidence.criteriaMeasured}
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Recorded checks</p>
                  <p className="mt-0.5 text-[20px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">
                    {definitionOfDoneEvidence.recordedChecks}
                  </p>
                </div>
              </div>

              <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto border-t border-border pt-4 pr-1">
                {definitionOfDoneEvidence.criteria.map((c, i) => {
                  const pct = Math.round((c.passed / c.total) * 100);
                  const tone = pct >= 90 ? "green" : pct >= 50 ? "amber" : "red";
                  return (
                    <div key={c.id}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 items-start gap-1.5 text-[12px] text-ink">
                          <StatusBullet tone={tone} />
                          <span className="truncate">{c.label}</span>
                        </span>
                        <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-ink">
                          {c.passed}/{c.total}
                        </span>
                      </div>
                      {c.hasBar && (
                        <div className="mt-1.5 ml-3.5 h-1.5 overflow-hidden rounded-full bg-card-sunken">
                          <BarFill pct={pct} tone={tone} delay={i * 80} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio view */}
        <section className="space-y-3">
          <SectionHeading title="Portfolio view" subtitle="Registered, sealed and run" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <PortfolioCard title="Workers by identity" icon={Layers} tone="blue" rows={workersByIdentity} />
            <PortfolioCard title="Workers by bounded context" icon={Boxes} tone="purple" rows={workersByBoundedContext} />
            <PortfolioCard title="Runs by autonomy" icon={Gauge} tone="green" rows={runsByAutonomy} />
          </div>
        </section>

        {/* Operations */}
        <section className="space-y-3">
          <SectionHeading title="Operations" subtitle="Cost, routing and readiness" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <h3 className="text-[12.5px] font-bold text-ink">What runs cost</h3>
              <div className="mt-3 space-y-2.5">
                <CostRow icon={Wallet} label="Model cost / run" value={`$${runCost.modelCostPerRun.toFixed(2)}`} />
                <CostRow icon={Coins} label="Tokens / run" value={runCost.tokensPerRun} />
                <CostRow icon={Database} label="Tokens this period" value={runCost.tokensInPeriod} />
              </div>
            </div>

            <div className="rounded-card border border-status-amber/20 bg-status-amber-soft/30 shadow-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[12.5px] font-bold text-ink">Model routing</h3>
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-status-amber-soft text-status-amber">
                  <Shuffle className="h-3 w-3" strokeWidth={2} />
                </div>
              </div>
              <p className="mt-2 text-[13px] font-semibold text-ink">{modelRouting.model}</p>
              <p className="text-[11px] text-ink-mute">{modelRouting.stagesRouted} stages routed here</p>
              <div className="mt-2 flex max-h-[76px] flex-wrap gap-1.5 overflow-y-auto pr-1">
                {modelRouting.stages.map((s, i) => (
                  <Badge key={s} variant={stageTones[i % stageTones.length]}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[12.5px] font-bold text-ink">Worker readiness</h3>
                <Gauge className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.9} />
              </div>
              <div className="mt-3 flex items-center gap-6">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Ready</p>
                  <p className="mt-0.5 text-[20px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">
                    {workerReadiness.ready}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Active</p>
                  <p className="mt-0.5 text-[20px] leading-none font-bold tracking-[-0.01em] tabular-nums text-status-green font-display">
                    {workerReadiness.active}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 text-[12px] font-bold uppercase tracking-wider text-ink-mute">{title}</h2>
      <div className="h-px flex-1 bg-border" />
      {subtitle && <span className="shrink-0 text-[11px] text-ink-faint">{subtitle}</span>}
    </div>
  );
}

function PulseKpi({ metric }: { metric: (typeof deliveryPulse)[number] }) {
  const Icon = pulseIcon[metric.id] ?? Activity;
  const animated = useCountUp(metric.value, { duration: 750 });
  const display = metric.suffix ? `${animated.toFixed(1)}${metric.suffix}` : String(Math.round(animated));
  return <KpiCard label={metric.label} value={display} icon={Icon} trend={metric.trend} iconPosition="left" />;
}

function PortfolioCard({
  title,
  icon: Icon,
  tone,
  rows,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "blue" | "purple" | "green";
  rows: PortfolioRow[];
}) {
  const iconTone: Record<string, string> = {
    blue: "bg-status-blue-soft text-status-blue",
    purple: "bg-status-purple-soft text-status-purple",
    green: "bg-status-green-soft text-status-green",
  };
  const barTone: Record<string, string> = {
    blue: "bg-status-blue",
    purple: "bg-status-purple",
    green: "bg-status-green",
  };
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4 h-fit">
      <div className="mb-3 flex items-center gap-2.5">
        <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", iconTone[tone])}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <h3 className="text-[13px] font-bold text-ink">{title}</h3>
      </div>
      <div className="max-h-[220px] space-y-3.5 overflow-y-auto pr-1">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[12px] font-medium text-ink">{row.label}</p>
              <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink">{row.value}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
              <div
                className={cn("h-full rounded-full transition-all duration-500", barTone[tone])}
                style={{ width: `${Math.max(row.pct, 2)}%` }}
              />
            </div>
            <p className="mt-1 truncate text-[10.5px] text-ink-mute">{row.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBullet({ tone }: { tone: "green" | "amber" | "red" }) {
  return (
    <span
      className={cn(
        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
        tone === "green" && "bg-status-green",
        tone === "amber" && "bg-status-amber",
        tone === "red" && "bg-status-red"
      )}
    />
  );
}

function BarFill({ pct, tone, delay }: { pct: number; tone: "green" | "amber" | "red"; delay: number }) {
  const width = useCountUp(pct, { duration: 700 });
  return (
    <div
      className={cn(
        "h-full rounded-full",
        tone === "green" && "bg-status-green",
        tone === "amber" && "bg-status-amber",
        tone === "red" && "bg-status-red"
      )}
      style={{ width: `${width}%`, transitionDelay: `${delay}ms` }}
    />
  );
}

function CostRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-[11.5px] text-ink-mute">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-ink">{value}</span>
    </div>
  );
}
