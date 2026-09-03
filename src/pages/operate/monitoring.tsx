import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Sparkle, GitCompare, Wallet, Zap, Check, X as XIcon, Pencil, ArrowUpCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deployments, deploymentWorkerName, deploymentCustomerName, type DeploymentStatus } from "@/lib/deployments-data";
import { approvals } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusTone: Record<DeploymentStatus, "green" | "amber" | "red" | "blue"> = {
  Healthy: "green",
  "Needs Attention": "amber",
  Degraded: "red",
  Provisioning: "blue",
};

const riskTone = { Low: "green", Medium: "amber", High: "red" } as const;

export default function Monitoring() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});

  const healthy = deployments.filter((d) => d.status === "Healthy").length;
  const withUpdates = deployments.filter((d) => d.updateIds.length > 0).length;
  const drift = deployments.filter((d) => d.changeLog.length > 0).length;
  const budgetAlerts = deployments.filter((d) => d.budgetUsed / d.budgetMonthly > 0.85).length;
  const experienceActivity = deployments.reduce((sum, d) => sum + d.experienceStats.generated, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Active Workers" value={deployments.length} icon={Activity} tone="accent" />
        <StatCard label="Healthy Deployments" value={healthy} icon={ShieldCheck} tone="green" />
        <StatCard label="Recommended Updates" value={withUpdates} icon={Sparkle} tone="purple" />
        <StatCard label="Configuration Drift" value={drift} icon={GitCompare} tone="amber" />
        <StatCard label="Budget Alerts" value={budgetAlerts} icon={Wallet} tone="red" />
        <StatCard label="Experience Activity" value={experienceActivity} icon={Zap} tone="blue" />
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-[14px] font-bold text-ink">Deployed Workers</p>
        </div>
        <div className="grid grid-cols-[1.5fr_1.1fr_0.9fr_0.9fr_0.9fr_0.9fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
          <span>Worker</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Updates</span>
          <span>Drift</span>
          <span>Budget Usage</span>
        </div>
        {deployments.map((d) => {
          const usagePct = Math.round((d.budgetUsed / d.budgetMonthly) * 100);
          return (
            <Link
              key={d.id}
              to={`/operations/deployments/${d.id}`}
              className="grid grid-cols-[1.5fr_1.1fr_0.9fr_0.9fr_0.9fr_0.9fr] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 transition-colors hover:bg-card-sunken/60"
            >
              <span className="truncate text-[13px] font-medium text-ink">{deploymentWorkerName(d)}</span>
              <span className="truncate text-[12px] text-ink-soft">{deploymentCustomerName(d)}</span>
              <Badge variant={statusTone[d.status]} dot>
                {d.status}
              </Badge>
              <span className="text-[12px] tabular-nums text-ink-soft">{d.updateIds.length}</span>
              <span className="text-[12px] tabular-nums text-ink-soft">{d.changeLog.length > 0 ? "Detected" : "None"}</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-card-sunken">
                  <span
                    className={cn("block h-full rounded-full", usagePct > 85 ? "bg-status-red" : "bg-accent")}
                    style={{ width: `${Math.min(100, usagePct)}%` }}
                  />
                </span>
                <span className="text-[11px] tabular-nums text-ink-mute shrink-0">{usagePct}%</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div>
        <h3 className="text-[15px] font-bold text-ink mb-3">Pending Interventions</h3>
        <div className="space-y-3">
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
                      {outcome && <Badge variant={outcome === "approved" ? "green" : "red"}>{outcome === "approved" ? "Approved" : "Rejected"}</Badge>}
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
