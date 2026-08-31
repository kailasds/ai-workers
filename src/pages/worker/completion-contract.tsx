import { Plus, Check, UserCheck } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CompletionContractPage() {
  const worker = useWorker();
  const requiredCount = worker.completionContract.filter((c) => c.required).length;

  return (
    <div className="pb-10">
      <ConfigHeader
        title="Completion Contract"
        subtitle="Define what success means for this AI Worker. Work cannot be marked complete until every required checkpoint passes."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Checkpoint
          </Button>
        }
      />

      {worker.completionContract.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No completion checkpoints defined yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-card card-hero px-5 py-4 flex items-center justify-between">
            <p className="text-[13px] text-white">
              Modernization is complete when all <span className="font-medium">{requiredCount}</span> required checkpoints
              pass.
            </p>
            <span className="text-[12px] tabular-nums text-white/60">
              {worker.completionContract.filter((c) => c.status === "complete").length} / {worker.completionContract.length} passed
            </span>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
            {worker.completionContract.map((c) => (
              <div key={c.id} className="flex items-start gap-4 px-5 py-4">
                <div
                  className={cn(
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
                    c.status === "complete" && "border-status-green bg-status-green text-white",
                    c.status === "in-progress" && "border-2 border-status-amber text-status-amber",
                    c.status === "pending" && "border-border-strong text-ink-faint"
                  )}
                >
                  {c.status === "complete" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : c.order}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13.5px] font-medium text-ink">{c.label}</p>
                    {c.required && <Badge variant="outline">Required</Badge>}
                    {c.humanApproval && (
                      <Badge variant="purple">
                        <UserCheck className="h-3 w-3" strokeWidth={2} />
                        Human approval
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11.5px] text-ink-mute">
                    <span>Validation: {c.validationType}</span>
                    <span>Agent: {c.responsibleAgent}</span>
                    <span>Evidence: {c.evidenceRequirement}</span>
                  </div>
                </div>
                <Badge
                  variant={c.status === "complete" ? "green" : c.status === "in-progress" ? "amber" : "neutral"}
                  dot
                  className="shrink-0"
                >
                  {c.status === "complete" ? "Complete" : c.status === "in-progress" ? "In Progress" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
