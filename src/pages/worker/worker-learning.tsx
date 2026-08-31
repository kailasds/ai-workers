import { useWorker } from "./use-worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X as XIcon, GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkerLearning() {
  const worker = useWorker();
  const pending = worker.learning.filter((l) => l.status === "pending-review");
  const resolved = worker.learning.filter((l) => l.status !== "pending-review");

  return (
    <div className="pb-10 space-y-6">
      <div>
        <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink font-display">Learning</h2>
        <p className="mt-1 text-[13px] text-ink-mute">
          What this worker has learned from completed work. Major learning requires review before it changes behavior.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((l) => (
            <div key={l.id} className="rounded-card border border-accent-border bg-accent-soft p-5">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-accent-ink">New Learning Candidate</p>
                <Badge variant="purple">Pattern Discovery</Badge>
              </div>
              <p className="mt-1.5 text-[13.5px] text-ink">{l.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{l.description}</p>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-ink-mute">
                <span>Evidence: {l.evidenceCount} completed projects</span>
                <span>Success rate: {l.successRate}%</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary">
                  Review
                </Button>
                <Button size="sm">Promote to Knowledge</Button>
                <Button size="sm" variant="ghost">
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-[13px] font-medium text-ink mb-2.5">Learning History</h3>
          <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
            {resolved.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                    l.status === "promoted" ? "bg-status-green-soft text-status-green" : "bg-status-red-soft text-status-red"
                  )}
                >
                  {l.status === "promoted" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <XIcon className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink truncate">{l.title}</p>
                  <p className="text-[11.5px] text-ink-mute">
                    {l.evidenceCount} evidence · {l.successRate}% success · {l.date}
                  </p>
                </div>
                <Badge variant={l.status === "promoted" ? "green" : "red"}>
                  {l.status === "promoted" ? "Promoted" : "Rejected"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {worker.versionHistory.length > 0 && (
        <div>
          <h3 className="text-[13px] font-medium text-ink mb-3">Worker Evolution</h3>
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            {worker.versionHistory.map((v, i) => (
              <div key={v.version} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      v.current ? "bg-accent text-white" : "bg-card-sunken text-ink-mute"
                    )}
                  >
                    <GitCommitHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </div>
                  {i < worker.versionHistory.length - 1 && <div className="w-px flex-1 bg-border my-0.5" />}
                </div>
                <div className={cn("min-w-0 flex-1", i < worker.versionHistory.length - 1 ? "pb-4" : "")}>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-ink">{v.version}</p>
                    {v.current && <Badge variant="accent">Current</Badge>}
                    <span className="text-[11.5px] text-ink-mute">{v.date}</span>
                  </div>
                  <p className="text-[12.5px] text-ink-soft mt-0.5">{v.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {worker.learning.length === 0 && worker.versionHistory.length === 0 && (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No learning activity recorded for this worker yet.</p>
        </div>
      )}
    </div>
  );
}
