import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkle,
  Check,
  X as XIcon,
  Pencil,
  ArrowUpCircle,
  LayoutGrid,
  Activity,
  ShieldCheck,
  Lock,
  Eye,
  Filter,
  Download,
  Settings2,
  Search,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info,
  Circle,
  AlertTriangle,
  PowerOff,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { approvals, workers } from "@/lib/data";
import { deployments, type WorkerDeployment } from "@/lib/operations-data";
import { cn } from "@/lib/utils";

const riskTone = { Low: "green", Medium: "amber", High: "red" } as const;

const liveStatusTone: Record<WorkerDeployment["liveStatus"], "green" | "neutral" | "amber" | "red"> = {
  Running: "green",
  Idle: "neutral",
  "Requires Attention": "amber",
  Offline: "red",
};

const healthIcon: Record<WorkerDeployment["health"], { icon: typeof ShieldCheck; className: string }> = {
  Healthy: { icon: ShieldCheck, className: "text-status-green" },
  Degraded: { icon: AlertTriangle, className: "text-status-amber" },
  Critical: { icon: PowerOff, className: "text-status-red" },
};

const remoteAccessMeta: Record<WorkerDeployment["remoteAccess"], { icon: typeof ShieldCheck; label: string }> = {
  Secure: { icon: ShieldCheck, label: "Secure connection" },
  "Read Only": { icon: Eye, label: "Read-only access" },
  "Approval Required": { icon: Lock, label: "Approval required" },
};

const operateTabs = [
  { key: "fleet", label: "Deployed Workers" },
  { key: "interventions", label: "Pending Interventions" },
] as const;

export default function GlobalOperations() {
  const [tab, setTab] = useState<(typeof operateTabs)[number]["key"]>("fleet");
  const [expanded, setExpanded] = useState<string | null>(approvals[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});
  const [selectedId, setSelectedId] = useState<string | null>(deployments[0]?.workerId ?? null);
  const [accessRequested, setAccessRequested] = useState<Record<string, boolean>>({});

  const selected = deployments.find((d) => d.workerId === selectedId) ?? null;
  const selectedWorker = selected ? workers.find((w) => w.id === selected.workerId) : null;

  const healthy = deployments.filter((d) => d.health === "Healthy").length;
  const attention = deployments.filter((d) => d.liveStatus === "Requires Attention").length;
  const offline = deployments.filter((d) => d.liveStatus === "Offline").length;
  const avgBudgetUsage = Math.round(
    (deployments.reduce((sum, d) => sum + d.budgetUsed / d.budgetMonthly, 0) / deployments.length) * 100
  );
  const customerCount = new Set(deployments.map((d) => d.customer)).size;

  return (
    <div className="pb-16">
      <PageHeader
        title="Operate"
        subtitle="Monitor deployed AI Workers, their performance and customer environments."
        icon={Activity}
        tone="blue"
        actions={
          <>
            <Button variant="secondary">
              <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
              Filters
            </Button>
            <Button variant="secondary" size="icon">
              <Download className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </>
        }
      />

      <div className="px-8 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Total deployed workers" value={deployments.length} subtext={`Across ${customerCount} customers`} icon={LayoutGrid} tone="accent" />
          <StatCard label="Healthy" value={healthy} subtext={`${Math.round((healthy / deployments.length) * 100)}% of workers`} icon={Activity} tone="green" />
          <StatCard label="Requires attention" value={attention} subtext={`${Math.round((attention / deployments.length) * 100)}% of workers`} icon={AlertTriangle} tone="amber" />
          <StatCard label="Offline" value={offline} subtext={`${Math.round((offline / deployments.length) * 100)}% of workers`} icon={PowerOff} tone="red" />
          <StatCard label="Avg. budget usage" value={`${avgBudgetUsage}%`} subtext="This month" icon={Wallet} tone="accent" />
        </div>

        <div className="border-b border-border">
          <div className="flex items-center gap-5">
            {operateTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative pb-3 text-[13.5px] font-medium transition-colors",
                  tab === t.key ? "text-accent-ink" : "text-ink-mute hover:text-ink"
                )}
              >
                {t.label}
                <span className="ml-1.5 text-[11px] tabular-nums text-ink-faint">
                  {t.key === "fleet" ? deployments.length : approvals.length}
                </span>
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        </div>

        {tab === "fleet" ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            <div className="min-w-0 space-y-4">
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <p className="text-[14px] font-bold text-ink">Deployed AI Workers</p>
                    <p className="text-[12px] text-ink-mute">Overview of all deployed AI Workers across customers and environments.</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Configure columns
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border bg-card-sunken/50">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-9 w-52 text-ink-faint">
                    <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <input placeholder="Search workers…" className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none" />
                  </div>
                  {["Customer", "Environment", "Status", "More filters"].map((f) => (
                    <button key={f} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 h-9 text-[12.5px] font-medium text-ink-soft hover:bg-card-sunken">
                      {f}
                      <ChevronDown className="h-3 w-3 text-ink-faint" strokeWidth={2} />
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[1.5fr_1.1fr_0.6fr_1fr_0.8fr_0.9fr_0.9fr_0.9fr_0.7fr_0.9fr_0.4fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                      <span>Worker</span>
                      <span>Customer</span>
                      <span>Version</span>
                      <span>Environment</span>
                      <span>Status</span>
                      <span>Experience shared</span>
                      <span>Budget (monthly)</span>
                      <span>Usage</span>
                      <span>Health</span>
                      <span>Last activity</span>
                      <span />
                    </div>

                    {deployments.map((d) => {
                      const isSelected = selectedId === d.workerId;
                      const HealthIcon = healthIcon[d.health].icon;
                      return (
                        <button
                          key={d.workerId}
                          onClick={() => setSelectedId(d.workerId)}
                          className={cn(
                            "grid w-full grid-cols-[1.5fr_1.1fr_0.6fr_1fr_0.8fr_0.9fr_0.9fr_0.9fr_0.7fr_0.9fr_0.4fr] items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-card-sunken/60",
                            isSelected && "bg-accent-soft/50"
                          )}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarFallback>{d.workerName.split(" ").map((w) => w[0]).slice(0, 2).join("")}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-[13px] font-medium text-ink">{d.workerName}</span>
                          </span>
                          <span className="truncate text-[12px] text-ink-soft">{d.customer}</span>
                          <span className="text-[12px] tabular-nums text-ink-mute">{d.version}</span>
                          <span className="truncate text-[12px] text-ink-soft">{d.environment}</span>
                          <Badge variant={liveStatusTone[d.liveStatus]} dot>
                            {d.health}
                          </Badge>
                          <span className="text-[12px] tabular-nums text-ink-soft">{d.experienceShared} patterns</span>
                          <span className="text-[12px] tabular-nums text-ink-soft">
                            ${d.budgetUsed.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-card-sunken">
                              <span className="block h-full rounded-full bg-accent" style={{ width: `${d.usagePct}%` }} />
                            </span>
                            <span className="text-[11px] tabular-nums text-ink-mute shrink-0">{d.usagePct}%</span>
                          </span>
                          <HealthIcon className={cn("h-4 w-4", healthIcon[d.health].className)} strokeWidth={2} />
                          <span className="text-[11.5px] tabular-nums text-ink-mute">{d.lastActivity}</span>
                          <MoreVertical className="h-4 w-4 text-ink-faint justify-self-end" strokeWidth={1.75} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
                  <p className="text-[12px] text-ink-mute">Showing 1 to {deployments.length} of {deployments.length} workers</p>
                  <div className="flex items-center gap-1.5">
                    <button className="grid h-7 w-7 place-items-center rounded-lg border border-border text-ink-mute disabled:opacity-40" disabled>
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[12px] font-semibold text-white">1</span>
                    <button className="grid h-7 w-7 place-items-center rounded-lg border border-border text-ink-mute">
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-card border border-accent-border bg-accent-soft px-4 py-3">
                <Info className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-[12px] text-accent-ink">
                  <span className="font-semibold">Tip:</span> Click on any worker row to view detailed operation status, logs, and customer environment.
                </p>
              </div>
            </div>

            {selected && selectedWorker && (
              <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5">
                <div className="flex items-start justify-between">
                  <p className="text-[15px] font-bold text-ink pr-2">{selected.workerName}</p>
                  <button onClick={() => setSelectedId(null)} className="text-ink-faint hover:text-ink">
                    <XIcon className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant={liveStatusTone[selected.liveStatus]}>{selected.health}</Badge>
                  <Badge variant="outline">Version {selected.version}</Badge>
                  <Badge variant="outline">{selected.environment}</Badge>
                </div>

                <div className="mt-4 space-y-2 text-[12.5px]">
                  <Row label="Customer" value={selected.customer} />
                  <Row label="Environment" value={selected.environment} />
                  <Row label="Deployed on" value={new Date(selected.deployedOn).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} />
                </div>

                <SectionLabel>Overview</SectionLabel>
                <div className="space-y-2 text-[12.5px]">
                  <Row label="Purpose" value={selected.purpose} multiline />
                  <Row label="Operating mode" value={selected.operatingMode} />
                  <Row label="Runtime" value={selected.runtime} />
                  <Row
                    label="Last activity"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Circle className="h-2 w-2 fill-status-green text-status-green" />
                        {selected.lastActivity}
                      </span>
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <SectionLabel className="mt-0">Live operation</SectionLabel>
                  <Link to={`/workers/${selected.workerId}/operations`} className="flex items-center gap-1 text-[11.5px] font-medium text-accent-ink hover:underline">
                    View live dashboard
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <MiniStat label="Active tasks" value={selectedWorker.activeTasks} />
                  <MiniStat label="Decisions (today)" value={selected.decisionsToday} />
                  <MiniStat label="Success rate" value={`${selected.successRate}%`} />
                  <MiniStat label="Avg response time" value={selected.avgResponseTime} />
                </div>

                <SectionLabel>Usage & budget</SectionLabel>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-mute">Budget</span>
                  <span className="font-medium text-ink">${selected.budgetMonthly.toLocaleString()} / month</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-mute">Spent</span>
                  <span className="font-medium text-status-green">
                    ${selected.budgetUsed.toLocaleString()} ({Math.round((selected.budgetUsed / selected.budgetMonthly) * 100)}%)
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
                  <div
                    className="h-full rounded-full bg-status-green"
                    style={{ width: `${Math.min(100, Math.round((selected.budgetUsed / selected.budgetMonthly) * 100))}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11.5px] text-ink-mute">
                  Remaining ${(selected.budgetMonthly - selected.budgetUsed).toLocaleString()} (
                  {100 - Math.round((selected.budgetUsed / selected.budgetMonthly) * 100)}%)
                </p>

                <SectionLabel>Experience</SectionLabel>
                <div className="rounded-lg border border-border bg-card-sunken px-3 py-2.5">
                  <p className="text-[12.5px] font-semibold text-ink">{selected.experienceShared} patterns shared</p>
                  <p className="text-[11px] text-ink-mute">Last shared 1 day ago</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {(() => {
                    const meta = remoteAccessMeta[selected.remoteAccess];
                    const AccessIcon = meta.icon;
                    const requested = accessRequested[selected.workerId];
                    return selected.remoteAccess === "Secure" ? (
                      <Button variant="secondary" size="sm">
                        <AccessIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Remote connect
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={requested}
                        onClick={() => setAccessRequested((r) => ({ ...r, [selected.workerId]: true }))}
                      >
                        <AccessIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {requested ? "Requested" : "Remote connect"}
                      </Button>
                    );
                  })()}
                  <Button size="sm" asChild>
                    <Link to={`/workers/${selected.workerId}`}>Worker actions</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-3">
              {approvals.map((a) => {
                const isOpen = expanded === a.id;
                const outcome = resolved[a.id];
                return (
                  <div key={a.id} className={cn("rounded-card border bg-card shadow-card overflow-hidden", isOpen ? "border-border-strong" : "border-border")}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpanded(isOpen ? null : a.id)}
                      onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : a.id)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13.5px] font-medium text-ink">{a.type}</p>
                          <Badge variant={riskTone[a.risk]}>{a.risk} risk</Badge>
                          {outcome && (
                            <Badge variant={outcome === "approved" ? "green" : "red"}>
                              {outcome === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] text-ink-mute">{a.workerName}</p>
                        <p className="mt-1 text-[12.5px] text-ink-soft">{a.summary}</p>
                      </div>
                      {!outcome && (
                        <span className="inline-flex h-8 shrink-0 items-center rounded-lg border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft">
                          {isOpen ? "Collapse" : "Review"}
                        </span>
                      )}
                    </div>

                    {isOpen && !outcome && (
                      <div className="border-t border-border px-5 py-4 space-y-4">
                        <div className="rounded-lg bg-accent-soft px-4 py-3 flex items-start gap-2.5">
                          <Sparkle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                          <p className="text-[12.5px] text-accent-ink">{a.aiRecommendation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Evidence</p>
                            <ul className="space-y-1.5">
                              {a.evidence.map((e) => (
                                <li key={e} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Policy</p>
                              <p className="text-[12.5px] text-ink-soft">{a.policy}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Impact</p>
                              <p className="text-[12.5px] text-ink-soft">{a.impact}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Alternatives considered</p>
                              <p className="text-[12.5px] text-ink-soft">{a.alternatives[0]}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button size="sm" onClick={() => setResolved((r) => ({ ...r, [a.id]: "approved" }))}>
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Edit then Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setResolved((r) => ({ ...r, [a.id]: "rejected" }))}>
                            <XIcon className="h-3.5 w-3.5" strokeWidth={2} />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ArrowUpCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Escalate
                          </Button>
                          <Link to={`/workers/${a.workerId}`} className="ml-auto text-[12px] text-ink-mute hover:text-ink transition-colors">
                            View worker →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-5">
              <div className="rounded-card border border-border bg-card shadow-card p-5">
                <h3 className="text-[15px] font-bold text-ink mb-3">Sentinel Across the Workforce</h3>
                <div className="space-y-2.5">
                  {workers.map((w) => (
                    <div key={w.id} className="flex items-center justify-between gap-2">
                      <Link to={`/workers/${w.id}`} className="text-[12.5px] text-ink-soft hover:text-ink truncate">
                        {w.name}
                      </Link>
                      <Badge variant="neutral">{w.sentinel}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: React.ReactNode; multiline?: boolean }) {
  return (
    <div className={cn("flex gap-2", multiline ? "flex-col" : "items-center justify-between")}>
      <span className="text-ink-mute shrink-0">{label}</span>
      <span className={cn("text-ink font-medium", multiline ? "" : "text-right truncate")}>{value}</span>
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-5 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute", className)}>{children}</p>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card-sunken px-3 py-2">
      <p className="text-[10.5px] text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[14px] font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
