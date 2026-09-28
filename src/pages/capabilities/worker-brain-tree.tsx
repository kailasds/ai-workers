import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CapabilityTree } from "@/components/capability-graph/capability-tree";
import { getCapabilityWorker, workerBrainInventory } from "@/lib/capabilities/service";

export default function WorkerBrainTree() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const focusNodeId = searchParams.get("focus") ?? undefined;
  const worker = getCapabilityWorker(id ?? "");
  const inv = worker ? workerBrainInventory(worker.id) : null;

  if (!worker) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Worker not found.</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/capabilities" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Capability Landscape
          </Link>
          <Button asChild variant="secondary" size="sm">
            <Link to={`/learning?worker=${worker.id}`}>
              View learning
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Button>
        </div>

        <h1 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-ink">{worker.name}</h1>
        <p className="mt-1 flex items-center gap-3 text-[12.5px] text-ink-mute">
          <span>{worker.boundedContext}</span>
          {inv && (
            <>
              <span>·</span>
              <Badge variant="blue">{inv.skills} Skills</Badge>
              <Badge variant="purple">{inv.agents} Agents</Badge>
              <Badge variant="neutral">{inv.tools} Tools</Badge>
            </>
          )}
        </p>
      </div>

      <div className="px-8 mt-5">
        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="h-[660px]">
            <CapabilityTree key={`${worker.id}-${focusNodeId ?? ""}`} workerId={worker.id} focusNodeId={focusNodeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
