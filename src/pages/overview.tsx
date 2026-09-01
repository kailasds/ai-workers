import { Link } from "react-router-dom";
import { Plus, ArrowUpRight, Bot, Wallet, ClipboardList, LayoutGrid, Users, Activity, AlertTriangle, Flame } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusDot } from "@/components/shared/status-dot";
import { ExecutionStepper } from "@/components/shared/execution-stepper";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { SentinelStatus } from "@/components/shared/sentinel-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { workers, orgMetrics, attentionItems, getWorker } from "@/lib/data";
import { workerStatusColor } from "@/lib/status";
import { cn } from "@/lib/utils";

const featured = getWorker("cobol-modernization-worker")!;
const otherActive = workers.filter((w) => w.id !== featured.id && w.currentWork).slice(0, 3);
const healthy = workers.filter((w) => w.status !== "blocked" && w.status !== "review").length;
const attention = workers.filter((w) => w.status === "review").length;
const blocked = workers.filter((w) => w.status === "blocked").length;

export default function Overview() {
  const cw = featured.currentWork!;

  return (
    <div className="pb-10">
      <PageHeader
        title="AI Workforce"
        subtitle="Manage and monitor your digital workforce."
        icon={LayoutGrid}
        tone="accent"
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/work/assign">
                <ClipboardList className="h-4 w-4" strokeWidth={2} />
                Assign Work
              </Link>
            </Button>
            <Button asChild>
              <Link to="/workers/new">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create Worker
              </Link>
            </Button>
          </>
        }
      />

      <div className="px-8 space-y-5">
        {/* Metrics — equal-size cards, hierarchy signaled by color, not size */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MetricCard label="Active Workers" value={String(orgMetrics.activeWorkers)} icon={Users} hero />
          <MetricCard label="Running Work" value={String(orgMetrics.runningWork)} icon={Activity} tone="blue" />
          <MetricCard label="Requires Attention" value={String(orgMetrics.requiresAttention)} icon={AlertTriangle} tone="amber" />
          <MetricCard label="Escalations" value={String(orgMetrics.escalations)} icon={Flame} tone="red" />
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-ink-mute">Monthly Spend</p>
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-status-green-soft text-status-green">
                <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            </div>
            <p className="mt-1.5 text-[26px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">
              ${orgMetrics.monthlySpend.toLocaleString()}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Progress value={56} className="h-1" />
              <span className="text-[11px] text-ink-mute tabular-nums shrink-0">56%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Workforce activity — dominant column */}
          <div className="xl:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink font-display">
                Workforce Activity
              </h2>
            </div>

            {/* Featured active worker — the one hero card, marked by the brand gradient */}
            <div className="rounded-card card-hero p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusDot color={workerStatusColor[featured.status]} pulse={featured.status === "working"} />
                    <span className="text-[11px] uppercase tracking-wider text-white/60">{featured.statusLabel}</span>
                    <AutonomyBadge level={featured.autonomy} className="bg-white/15 text-white" />
                    <SentinelStatus state={featured.sentinel} className="bg-white/15 text-white" />
                  </div>
                  <Link to={`/workers/${featured.id}`} className="text-[19px] font-bold tracking-[-0.01em] hover:underline underline-offset-4">
                    {featured.name}
                  </Link>
                  <p className="mt-1 text-[13px] text-white/70">Current work: {cw.title}</p>
                </div>
                <Button asChild variant="secondary" className="border-white/20 bg-transparent text-white hover:bg-white/10 shrink-0">
                  <Link to={`/workers/${featured.id}/operations`}>
                    View Operations
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                </Button>
              </div>

              <div className="mt-6">
                <ExecutionStepper dark steps={cw.stages.map((s) => ({ label: s.label, state: s.state }))} />
              </div>

              <div className="mt-6 rounded-[14px] bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-[12.5px] text-white/80">
                  <span className="text-white/50">Current stage —</span> {cw.stage}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <HeroStat label="Progress" value={`${cw.progress}%`} />
                <HeroStat label="Definition of Done" value={`${featured.definitionOfDone.sections.flatMap((s) => s.requirements).filter((r) => r.status === "passed").length} / ${featured.definitionOfDone.sections.flatMap((s) => s.requirements).length}`} />
                <HeroStat label="Agent mesh" icon={<Bot className="h-3 w-3" strokeWidth={1.5} />} value={`${featured.agentMesh.filter((a) => a.status !== "idle").length} / ${featured.agentMesh.length}`} />
                <HeroStat label="Task budget" icon={<Wallet className="h-3 w-3" strokeWidth={1.5} />} value={`$${cw.cost.toFixed(2)} / $${cw.budget}`} />
              </div>
            </div>

            {/* Other active workers */}
            {otherActive.length > 0 && (
              <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
                {otherActive.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusDot color={workerStatusColor[w.status]} pulse={w.status === "working"} />
                        <Link to={`/workers/${w.id}`} className="text-[13.5px] font-medium text-ink hover:text-accent-ink truncate">
                          {w.name}
                        </Link>
                        <Badge variant={w.status === "review" ? "amber" : w.status === "blocked" ? "red" : "blue"}>
                          {w.statusLabel}
                        </Badge>
                        <AutonomyBadge level={w.autonomy} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-mute truncate">{w.currentWork?.title}</p>
                    </div>
                    <Button asChild size="sm" variant="secondary" className="shrink-0">
                      <Link to={`/workers/${w.id}`}>{w.status === "review" ? "Review" : "View"}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-5">
            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-ink">Requires Attention</h3>
                <Badge variant="amber">{attentionItems.length}</Badge>
              </div>
              <div className="mt-3 space-y-1">
                {attentionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-[12px] px-2.5 py-2.5 -mx-2.5 hover:bg-card-sunken transition-colors">
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        item.severity === "red" ? "bg-status-red" : "bg-status-amber"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium text-ink">{item.type}</p>
                      <p className="text-[11.5px] text-ink-mute truncate">{item.worker}</p>
                      <p className="mt-0.5 text-[12px] text-ink-soft">{item.detail}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 -mr-1.5" asChild>
                      <Link to="/operations">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <h3 className="text-[16px] font-bold text-ink">Workforce Health</h3>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-card-sunken">
                <div className="h-full bg-status-green" style={{ width: `${(healthy / workers.length) * 100}%` }} />
                <div className="h-full bg-status-amber" style={{ width: `${(attention / workers.length) * 100}%` }} />
                <div className="h-full bg-status-red" style={{ width: `${(blocked / workers.length) * 100}%` }} />
              </div>
              <div className="mt-4 space-y-2.5">
                <HealthRow color="green" label="Healthy" value={`${healthy} Workers`} />
                <HealthRow color="amber" label="Attention" value={`${attention} Workers`} />
                <HealthRow color="red" label="Blocked" value={`${blocked} Workers`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const metricIconTone: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  amber: "bg-status-amber-soft text-status-amber",
  red: "bg-status-red-soft text-status-red",
  green: "bg-status-green-soft text-status-green",
};

function MetricCard({
  label,
  value,
  tone,
  hero,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "blue" | "amber" | "red";
  hero?: boolean;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  if (hero) {
    return (
      <div className="rounded-card card-hero p-5 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-white/60">{label}</p>
          {Icon && (
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-white">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          )}
        </div>
        <p className="mt-1.5 text-[26px] leading-none font-bold tracking-[-0.01em] tabular-nums font-display">
          {value}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-ink-mute">{label}</p>
        {Icon && (
          <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", tone ? metricIconTone[tone] : "bg-card-sunken text-ink-soft")}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 text-[26px] leading-none font-bold tracking-[-0.01em] tabular-nums font-display",
          tone === "amber" && "text-status-amber",
          tone === "red" && "text-status-red",
          !tone && "text-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function HeroStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-white/45">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[16px] tabular-nums text-white font-display">{value}</p>
    </div>
  );
}

function HealthRow({ color, label, value }: { color: "green" | "amber" | "red"; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="flex items-center gap-2 text-ink-soft">
        <StatusDot color={color} />
        {label}
      </span>
      <span className="tabular-nums text-ink font-medium">{value}</span>
    </div>
  );
}
