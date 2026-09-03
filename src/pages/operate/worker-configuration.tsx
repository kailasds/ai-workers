import { Link } from "react-router-dom";
import { Settings2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deployments, deploymentWorkerName, deploymentCustomerName, type DeploymentStatus } from "@/lib/deployments-data";

const statusTone: Record<DeploymentStatus, "green" | "amber" | "red" | "blue"> = {
  Healthy: "green",
  "Needs Attention": "amber",
  Degraded: "red",
  Provisioning: "blue",
};

export default function WorkerConfiguration() {
  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-ink-mute -mt-1">
        Select a customer deployment to manage its active configuration — capabilities, models, tools, safety, and customer controls.
      </p>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
        {deployments.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                <Settings2 className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{deploymentWorkerName(d)}</p>
                <p className="text-[11.5px] text-ink-mute">
                  {deploymentCustomerName(d)} · v{d.version.replace(/^v/, "")} · {d.environment}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant={statusTone[d.status]} dot>
                {d.status}
              </Badge>
              <Button asChild size="sm" variant="secondary">
                <Link to={`/operations/deployments/${d.id}?tab=configuration`}>
                  Configure
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
