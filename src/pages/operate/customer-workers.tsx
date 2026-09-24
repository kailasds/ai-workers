import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deploymentCustomers, deployments, deploymentWorkerName, type DeploymentStatus } from "@/lib/deployments-data";
import { cn } from "@/lib/utils";

const statusTone: Record<DeploymentStatus, "green" | "amber" | "red" | "blue"> = {
  Healthy: "green",
  "Needs Attention": "amber",
  Degraded: "red",
  Provisioning: "blue",
};

export default function CustomerWorkers() {
  const [customerId, setCustomerId] = useState(deploymentCustomers[0].id);
  const customer = deploymentCustomers.find((c) => c.id === customerId)!;
  const customerDeployments = deployments.filter((d) => d.customerId === customerId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {deploymentCustomers.map((c) => (
          <button
            key={c.id}
            onClick={() => setCustomerId(c.id)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-left transition-colors",
              c.id === customerId ? "border-accent bg-accent-soft" : "border-border hover:bg-card-sunken"
            )}
          >
            <p className={cn("text-[13px] font-semibold", c.id === customerId ? "text-accent-ink" : "text-ink")}>{c.name}</p>
            <p className="text-[11px] text-ink-mute">
              {c.industry} · {c.region}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-ink">{customer.name}</p>
            <p className="text-[12.5px] text-ink-mute">
              {customer.industry} · {customer.region} · {customer.portal}
            </p>
          </div>
          <p className="text-[12px] text-ink-mute">{customerDeployments.length} worker{customerDeployments.length === 1 ? "" : "s"} deployed</p>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.9fr_1.2fr_0.9fr_0.7fr_1fr_0.4fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
          <span>Worker</span>
          <span>Version</span>
          <span>Status</span>
          <span>Experience Profile</span>
          <span>Budget</span>
          <span>Updates</span>
          <span>Last Activity</span>
          <span />
        </div>
        {customerDeployments.map((d) => (
          <Link
            key={d.id}
            to={`/operations/deployments/${d.id}`}
            className="grid grid-cols-[1.6fr_0.8fr_0.9fr_1.2fr_0.9fr_0.7fr_1fr_0.4fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/60"
          >
            <span className="truncate text-[13px] font-medium text-ink">{deploymentWorkerName(d)}</span>
            <span className="text-[12px] tabular-nums text-ink-mute">{d.version}</span>
            <Badge variant={statusTone[d.status]} dot>
              {d.status}
            </Badge>
            <span className="text-[12px] text-ink-soft">{d.performanceProfile} Profile</span>
            <span className="text-[12px] tabular-nums text-ink-soft">${d.budgetUsed.toLocaleString()}</span>
            <span className="text-[12px] tabular-nums text-ink-soft">{d.updateIds.length}</span>
            <span className="text-[11.5px] text-ink-mute">{new Date(d.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint justify-self-end" strokeWidth={2} />
          </Link>
        ))}
        {customerDeployments.length === 0 && <p className="px-5 py-8 text-[12.5px] text-ink-mute">No workers deployed to this customer yet.</p>}
      </div>
    </div>
  );
}
