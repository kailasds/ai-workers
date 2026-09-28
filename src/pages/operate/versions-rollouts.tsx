import { useState } from "react";
import { Sparkle, ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deployments, deployableWorker, deploymentCustomerName } from "@/lib/deployments-data";
import { cn } from "@/lib/utils";

interface VersionGroup {
  workerId: string;
  version: string;
  deploymentIds: string[];
}

function groupByWorkerVersion(): VersionGroup[] {
  const map = new Map<string, VersionGroup>();
  for (const d of deployments) {
    const key = `${d.workerId}::${d.version}`;
    if (!map.has(key)) map.set(key, { workerId: d.workerId, version: d.version, deploymentIds: [] });
    map.get(key)!.deploymentIds.push(d.id);
  }
  return Array.from(map.values());
}

const rolloutStrategies = ["Immediate", "Phased", "Pilot", "Canary", "Manual Approval"] as const;

export default function VersionsRollouts() {
  const groups = groupByWorkerVersion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<(typeof rolloutStrategies)[number]>("Phased");
  const [selectedCustomers, setSelectedCustomers] = useState<Record<string, boolean>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-ink-mute -mt-1">Manage worker versions across customer deployments and coordinate compatibility-checked rollouts.</p>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="grid grid-cols-[1.4fr_0.7fr_1fr_1.1fr_1fr_1.1fr_1fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
          <span>Worker Version</span>
          <span>Version</span>
          <span>Customers Using</span>
          <span>Update Available</span>
          <span>Rollout Status</span>
          <span>Compatibility</span>
          <span />
        </div>

        {groups.map((g) => {
          const key = `${g.workerId}::${g.version}`;
          const worker = deployableWorker(g.workerId);
          const isOpen = expanded === key;
          const notOnLatest = g.version !== worker.version;
          return (
            <div key={key} className="border-b border-border last:border-b-0">
              <div className="grid grid-cols-[1.4fr_0.7fr_1fr_1.1fr_1fr_1.1fr_1fr] items-center gap-3 px-5 py-3.5">
                <span className="truncate text-[13px] font-medium text-ink">{worker.name}</span>
                <span className="text-[12px] tabular-nums text-ink-mute">{g.version}</span>
                <span className="text-[12px] tabular-nums text-ink-soft">{g.deploymentIds.length} customers</span>
                <span>
                  {notOnLatest ? <Badge variant="purple">{worker.version} available</Badge> : <Badge variant="neutral">Up to date</Badge>}
                </span>
                <span>
                  <Badge variant={notOnLatest ? "amber" : "green"}>{notOnLatest ? "Eligible" : "Current"}</Badge>
                </span>
                <span className="text-[12px] text-ink-soft">Mixed — see compatibility</span>
                <Button
                  size="sm"
                  variant={notOnLatest ? "primary" : "secondary"}
                  disabled={!notOnLatest}
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  {isOpen ? "Close" : "Start Rollout"}
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
                </Button>
              </div>

              {isOpen && (
                <div className="border-t border-border bg-card-sunken/40 px-5 py-4 space-y-4">
                  {confirmed[key] ? (
                    <div className="rounded-lg border border-status-green/25 bg-status-green-soft px-4 py-3 flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-status-green shrink-0" strokeWidth={2.5} />
                      <p className="text-[12.5px] text-ink">
                        Rollout to {Object.values(selectedCustomers).filter(Boolean).length} customer deployment(s) started using the{" "}
                        <span className="font-medium">{strategy}</span> strategy.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">AI Compatibility Results</p>
                        <div className="space-y-1.5">
                          {g.deploymentIds.map((did, i) => {
                            const d = deployments.find((x) => x.id === did)!;
                            const compat = i % 3 === 2 ? "not-recommended" : i % 3 === 1 ? "needs-adjustment" : "compatible";
                            return (
                              <label key={did} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5">
                                <span className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    disabled={compat === "not-recommended"}
                                    checked={!!selectedCustomers[did]}
                                    onChange={(e) => setSelectedCustomers((s) => ({ ...s, [did]: e.target.checked }))}
                                    className="h-3.5 w-3.5 rounded accent-accent"
                                  />
                                  <span className="text-[12.5px] text-ink">{deploymentCustomerName(d)}</span>
                                </span>
                                {compat === "compatible" && (
                                  <Badge variant="green" dot>
                                    Compatible
                                  </Badge>
                                )}
                                {compat === "needs-adjustment" && (
                                  <Badge variant="amber" dot>
                                    Compatible with configuration adjustment
                                  </Badge>
                                )}
                                {compat === "not-recommended" && (
                                  <Badge variant="red" dot>
                                    Not Recommended
                                  </Badge>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Rollout Strategy</p>
                        <div className="flex flex-wrap gap-2">
                          {rolloutStrategies.map((s) => (
                            <button
                              key={s}
                              onClick={() => setStrategy(s)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                                strategy === s ? "border-accent bg-accent-soft text-accent-ink" : "border-border text-ink-soft hover:bg-card"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => setConfirmed((c) => ({ ...c, [key]: true }))} disabled={Object.values(selectedCustomers).every((v) => !v)}>
                          <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
                          Confirm Rollout
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setExpanded(null)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 rounded-card border border-accent-border bg-accent-soft px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
        <p className="text-[12px] text-accent-ink">
          Updates are checked for customer-specific compatibility before rollout — not every customer can receive every update automatically.
        </p>
      </div>
    </div>
  );
}
