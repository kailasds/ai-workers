import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkle, Check, X as XIcon, Pencil, ArrowUpCircle, Activity, ShieldCheck, Lock, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SentinelStatus } from "@/components/shared/sentinel-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const deploymentStatusTone: Record<WorkerDeployment["deploymentStatus"], "green" | "blue" | "amber" | "neutral"> = {
  Live: "green",
  Staging: "blue",
  Provisioning: "amber",
  Paused: "neutral",
};

const healthTone: Record<WorkerDeployment["health"], "green" | "amber" | "red"> = {
  Healthy: "green",
  Degraded: "amber",
  Critical: "red",
};

const remoteAccessMeta: Record<WorkerDeployment["remoteAccess"], { icon: typeof ShieldCheck; label: string }> = {
  Secure: { icon: ShieldCheck, label: "Secure connection" },
  "Read Only": { icon: Eye, label: "Read-only access" },
  "Approval Required": { icon: Lock, label: "Approval required" },
};

const operateTabs = [
  { key: "interventions", label: "Pending Interventions" },
  { key: "fleet", label: "Deployed Workers" },
] as const;

export default function GlobalOperations() {
  const [tab, setTab] = useState<(typeof operateTabs)[number]["key"]>("interventions");
  const [expanded, setExpanded] = useState<string | null>(approvals[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});
  const [expandedDeployment, setExpandedDeployment] = useState<string | null>(null);
  const [accessRequested, setAccessRequested] = useState<Record<string, boolean>>({});

  const recentEvents = workers
    .flatMap((w) => w.executionTimeline.map((e) => ({ ...e, workerName: w.name, workerId: w.id })))
    .slice(-8)
    .reverse();

  return (
    <div className="pb-10">
      <PageHeader title="Operations" subtitle="Real-time control tower for the entire AI Workforce." icon={Activity} tone="blue" />

      <div className="px-8 mb-5">
        <div className="inline-flex items-center gap-1 rounded-full bg-card-sunken p-1">
          {operateTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors",
                tab === t.key ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
              )}
            >
              {t.label}
              <span className={cn("text-[11px] tabular-nums", tab === t.key ? "text-white/60" : "text-ink-faint")}>
                {t.key === "interventions" ? approvals.length : deployments.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === "fleet" ? (
        <div className="px-8 space-y-3">
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[1.4fr_1.1fr_0.6fr_0.9fr_1fr_0.9fr_0.9fr_0.8fr_0.9fr_0.9fr] items-center gap-3 border-b border-accent-border bg-accent-soft px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-accent-ink">
                  <span>Worker</span>
                  <span>Customer</span>
                  <span>Version</span>
                  <span>Deployment</span>
                  <span>Environment</span>
                  <span>Experience</span>
                  <span>Budget</span>
                  <span>Usage</span>
                  <span>Health</span>
                  <span>Last Activity</span>
                </div>

                {deployments.map((d) => {
                  const isOpen = expandedDeployment === d.workerId;
                  const worker = workers.find((w) => w.id === d.workerId)!;
                  const AccessIcon = remoteAccessMeta[d.remoteAccess].icon;
                  const requested = accessRequested[d.workerId];
                  return (
                    <div key={d.workerId} className="border-b border-border last:border-b-0">
                      <button
                        onClick={() => setExpandedDeployment(isOpen ? null : d.workerId)}
                        className="grid w-full grid-cols-[1.4fr_1.1fr_0.6fr_0.9fr_1fr_0.9fr_0.9fr_0.8fr_0.9fr_0.9fr] items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-card-sunken/50"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Badge variant={liveStatusTone[d.liveStatus]} dot />
                          <span className="truncate text-[13px] font-medium text-ink">{d.workerName}</span>
                        </span>
                        <span className="truncate text-[12px] text-ink-soft">{d.customer}</span>
                        <span className="text-[12px] tabular-nums text-ink-mute">{d.version}</span>
                        <Badge variant={deploymentStatusTone[d.deploymentStatus]}>{d.deploymentStatus}</Badge>
                        <span className="truncate text-[12px] text-ink-soft">{d.environment}</span>
                        <span className="text-[12px] tabular-nums text-ink-soft">{d.experienceShared} assets</span>
                        <span className="text-[12px] tabular-nums text-ink-soft">
                          ${d.budgetUsed} / ${d.budgetMonthly}
                        </span>
                        <span className="text-[12px] tabular-nums text-ink-soft">{d.usageTasks} tasks</span>
                        <Badge variant={healthTone[d.health]} dot>
                          {d.health}
                        </Badge>
                        <span className="text-[11.5px] tabular-nums text-ink-mute">{d.lastActivity}</span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border bg-card-sunken/40 px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Live Operation Status</p>
                              <Badge variant={liveStatusTone[d.liveStatus]} dot>
                                {d.liveStatus}
                              </Badge>
                              <p className="mt-2 text-[12px] text-ink-soft">
                                Deployed to <span className="font-medium text-ink">{d.environment}</span> for{" "}
                                <span className="font-medium text-ink">{d.customer}</span>.
                              </p>
                              <p className="mt-1 text-[11.5px] text-ink-mute">Last activity at {d.lastActivity}.</p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Recent Activity</p>
                              {worker.executionTimeline.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {worker.executionTimeline.slice(-3).reverse().map((e) => (
                                    <li key={e.id} className="text-[12px] text-ink-soft">
                                      <span className="tabular-nums text-ink-mute">{e.time}</span> — {e.title}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[12px] text-ink-mute">No recent execution events recorded.</p>
                              )}
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Remote Access</p>
                              <p className="flex items-center gap-1.5 text-[12px] text-ink-soft mb-2">
                                <AccessIcon className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                                {remoteAccessMeta[d.remoteAccess].label}
                              </p>
                              {d.remoteAccess === "Secure" ? (
                                <Button size="sm" variant="secondary">
                                  Connect
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={requested}
                                  onClick={() => setAccessRequested((r) => ({ ...r, [d.workerId]: true }))}
                                >
                                  {requested ? "Access Requested" : "Request Access"}
                                </Button>
                              )}
                              <Link
                                to={`/workers/${d.workerId}`}
                                className="mt-2 block text-[11.5px] text-ink-mute hover:text-ink transition-colors"
                              >
                                View worker →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="px-8 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-3">
          <h2 className="text-[16px] font-bold text-ink mb-1">Pending Interventions</h2>
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
                    <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft">
                      {isOpen ? "Collapse" : "Review"}
                    </span>
                  )}
                </div>

                {isOpen && !outcome && (
                  <div className="border-t border-border px-5 py-4 space-y-4">
                    <div className="rounded-[12px] bg-accent-soft px-4 py-3 flex items-start gap-2.5">
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
                  <SentinelStatus state={w.sentinel} className="shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <h3 className="text-[15px] font-bold text-ink mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentEvents.map((e) => (
                <Link key={`${e.workerId}-${e.id}`} to={`/workers/${e.workerId}/operations`} className="block group">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-ink-mute">{e.time}</span>
                    <span className="text-[11.5px] text-ink-mute truncate">{e.workerName}</span>
                  </div>
                  <p className="text-[12.5px] text-ink group-hover:text-accent-ink transition-colors">{e.title}</p>
                </Link>
              ))}
              {recentEvents.length === 0 && <p className="text-[12px] text-ink-mute">No recent activity.</p>}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
