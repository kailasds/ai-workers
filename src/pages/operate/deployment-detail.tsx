import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ExternalLink,
  Settings2,
  Sparkle,
  Share2,
  ArrowRight,
  Check,
  X as XIcon,
  RotateCcw,
  GitCompare,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDeployment,
  deploymentWorkerName,
  deploymentCustomer,
  type DeploymentStatus,
} from "@/lib/deployments-data";
import { updateRecommendations } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const statusTone: Record<DeploymentStatus, "green" | "amber" | "red" | "blue"> = {
  Healthy: "green",
  "Needs Attention": "amber",
  Degraded: "red",
  Provisioning: "blue",
};

const tabs = ["overview", "configuration", "experience", "updates", "versions", "activity"] as const;
type Tab = (typeof tabs)[number];

const tabLabel: Record<Tab, string> = {
  overview: "Overview",
  configuration: "Configuration",
  experience: "Experience",
  updates: "Updates",
  versions: "Versions",
  activity: "Activity",
};

export default function DeploymentDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const deployment = getDeployment(id ?? "");
  const initialTab = (searchParams.get("tab") as Tab) ?? "overview";
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab) ? initialTab : "overview");
  const [changeLogAction, setChangeLogAction] = useState<Record<string, "approved" | "rejected">>({});

  if (!deployment) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Deployment not found.</p>
        <Link to="/operations" className="text-[13px] text-accent-ink hover:underline">
          Back to Deployments
        </Link>
      </div>
    );
  }

  const workerName = deploymentWorkerName(deployment);
  const customer = deploymentCustomer(deployment.customerId);
  const usagePct = Math.round((deployment.budgetUsed / deployment.budgetMonthly) * 100);
  const deploymentUpdates = updateRecommendations.filter((u) => deployment.updateIds.includes(u.id));

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/operations" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          ← Back to Deployments
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink">{workerName}</h1>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-[12.5px] text-ink-mute">{customer.name}</span>
              <span className="text-ink-faint">·</span>
              <span className="text-[12.5px] text-ink-mute">{deployment.environment}</span>
              <Badge variant={statusTone[deployment.status]} dot>
                {deployment.status}
              </Badge>
              <span className="text-[12.5px] text-ink-mute">Version: {deployment.version}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
              Open Customer Portal
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTab("configuration")}>
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Configure
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTab("updates")}>
              <Sparkle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Create Update
            </Button>
            <Button size="sm" onClick={() => setTab("experience")}>
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              View Experience
            </Button>
          </div>
        </div>

        <div className="border-b border-border mt-5 mb-5">
          <div className="flex items-center gap-6">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn("relative pb-3 text-[13.5px] font-medium transition-colors", tab === t ? "text-accent-ink" : "text-ink-mute hover:text-ink")}
              >
                {tabLabel[t]}
                {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 space-y-5">
        {tab === "overview" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric label="Deployment Status" value={deployment.status} />
            <Metric label="Current Version" value={deployment.version} />
            <Metric label="Experience Contribution" value={`${deployment.experienceStats.shared} shared`} />
            <Metric label="Updates Available" value={String(deploymentUpdates.length)} />
            <Metric label="Budget Usage" value={`${usagePct}%`} />
            <Metric label="Budget" value={`$${deployment.budgetUsed.toLocaleString()} / $${deployment.budgetMonthly.toLocaleString()}`} />
            <Metric label="Performance Profile" value={deployment.performanceProfile} />
            <Metric label="Last Activity" value={deployment.activity[0] ? `${deployment.activity[0].description.slice(0, 28)}…` : "—"} />
          </div>
        )}

        {tab === "configuration" && (
          <div className="space-y-4">
            <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
              <div className="grid grid-cols-[1.4fr_1.3fr_1fr] gap-3 bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                <span>Configuration</span>
                <span>Current Value</span>
                <span>Ownership</span>
              </div>
              {deployment.configuration.map((c) => (
                <div key={c.id} className="grid grid-cols-[1.4fr_1.3fr_1fr] items-center gap-3 border-t border-border px-5 py-3">
                  <span className="text-[12.5px] font-medium text-ink">{c.label}</span>
                  <span className="text-[12.5px] text-ink-soft">{c.currentValue}</span>
                  <OwnerBadge owner={c.owner} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <GitCompare className="h-3.5 w-3.5" strokeWidth={1.75} />
                Compare against Platform Default
              </Button>
              <Button variant="secondary" size="sm">
                <GitCompare className="h-3.5 w-3.5" strokeWidth={1.75} />
                Compare against Previous Version
              </Button>
            </div>

            {deployment.changeLog.length > 0 && (
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                  <p className="text-[14px] font-bold text-ink">Configuration Sync &amp; Change Management</p>
                  <p className="text-[12px] text-ink-mute">Customer changes flow back to the platform for compatibility and risk review before taking effect.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border bg-card-sunken/50 text-[11.5px] text-ink-mute">
                  <span>Customer Portal</span>
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  <span>Configuration Change Detected</span>
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  <span>Platform Receives Change Event</span>
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  <span>Compatibility &amp; Risk Analysis</span>
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  <span className="font-medium text-ink">Approved / Requires Review / Rejected</span>
                </div>
                <div className="divide-y divide-border">
                  {deployment.changeLog.map((c) => {
                    const outcome = changeLogAction[c.id];
                    return (
                      <div key={c.id} className="px-5 py-4">
                        <p className="text-[12.5px] text-ink">
                          <span className="font-medium">{customer.name}</span> changed <span className="font-medium">{c.setting}</span>
                        </p>
                        <p className="mt-1 text-[12px] text-ink-soft">
                          From <span className="line-through text-ink-faint">{c.from}</span> to <span className="font-medium text-ink">{c.to}</span>
                        </p>
                        <p className="mt-1 text-[11.5px] text-ink-mute">Impact analysis: {c.impactAnalysis}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={outcome === "approved" ? "green" : outcome === "rejected" ? "red" : "amber"}>
                            {outcome === "approved" ? "Approved" : outcome === "rejected" ? "Rejected" : c.status}
                          </Badge>
                          {!outcome && (
                            <>
                              <Button size="sm" onClick={() => setChangeLogAction((s) => ({ ...s, [c.id]: "approved" }))}>
                                <Check className="h-3 w-3" strokeWidth={2.5} /> Approve Change
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setChangeLogAction((s) => ({ ...s, [c.id]: "rejected" }))}>
                                <XIcon className="h-3 w-3" strokeWidth={2.5} /> Reject Change
                              </Button>
                              <Button size="sm" variant="ghost">
                                <RotateCcw className="h-3 w-3" strokeWidth={2} /> Restore Previous
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "experience" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Metric label="Experiences Generated" value={String(deployment.experienceStats.generated)} />
              <Metric label="Validated Learnings" value={String(deployment.experienceStats.validated)} />
              <Metric label="Private Learnings" value={String(deployment.experienceStats.private)} />
              <Metric label="Shared Learnings" value={String(deployment.experienceStats.shared)} />
              <Metric label="Updates Received" value={String(deployment.experienceStats.updatesReceived)} />
              <Metric label="Updates Applied" value={String(deployment.experienceStats.updatesApplied)} />
            </div>
            <Link
              to="/experience-hub/stream"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-ink hover:underline"
            >
              View Experience Stream
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        )}

        {tab === "updates" && (
          <div className="space-y-3">
            {deploymentUpdates.length === 0 && <p className="text-[12.5px] text-ink-mute">No updates currently recommended for this deployment.</p>}
            {deploymentUpdates.map((u) => (
              <div key={u.id} className="rounded-card border border-border bg-card shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-bold text-ink">{u.title}</p>
                    <p className="text-[12px] text-ink-mute mt-0.5">Source: validated learning from multiple deployments</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="green">Compatible</Badge>
                    <Badge variant="neutral">{u.riskLevel}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] text-ink-soft">{u.expectedOutcome}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/experience-hub/updates/${u.id}`}>
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> Review
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary">
                    Test
                  </Button>
                  <Button size="sm">Apply Update</Button>
                  <Button size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "versions" && (
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            {deployment.versions.map((v) => (
              <div key={v.version} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-ink">{v.version}</p>
                  <p className="text-[12px] text-ink-mute">{v.changeSummary}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={v.label === "Current" ? "green" : v.label === "Rolled Back" ? "red" : "neutral"}>{v.label}</Badge>
                  <span className="text-[11.5px] text-ink-mute tabular-nums">{new Date(v.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  {v.label !== "Current" && (
                    <Button size="sm" variant="secondary">
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            {deployment.activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-[11px] text-ink-faint tabular-nums shrink-0 w-24">
                  {a.date} {a.time}
                </span>
                <div>
                  <p className="text-[12.5px] text-ink">{a.description}</p>
                  <p className="text-[11px] text-ink-mute">{a.actor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <p className="text-[11px] text-ink-mute">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-ink truncate">{value}</p>
    </div>
  );
}

function OwnerBadge({ owner }: { owner: "platform" | "customer" | "ai-recommended" | "customer-modified" }) {
  const meta = {
    platform: { label: "Platform Controlled", tone: "neutral" as const },
    customer: { label: "Customer Controlled", tone: "green" as const },
    "ai-recommended": { label: "AI Recommended", tone: "purple" as const },
    "customer-modified": { label: "Modified by Customer", tone: "amber" as const },
  }[owner];
  return <Badge variant={meta.tone}>{meta.label}</Badge>;
}
