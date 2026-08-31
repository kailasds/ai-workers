import { useParams, Navigate, Link } from "react-router-dom";
import { AlertTriangle, ChevronLeft, X } from "lucide-react";
import { useWorker } from "./use-worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DecisionEvidenceDialog } from "@/components/shared/decision-evidence";
import { cn } from "@/lib/utils";

const journey = [
  { label: "Task Received", state: "done" as const },
  { label: "Understand", state: "done" as const },
  { label: "Plan", state: "done" as const },
  { label: "Execute", state: "current" as const },
  { label: "Validate", state: "pending" as const },
  { label: "Approve", state: "pending" as const },
  { label: "Complete", state: "pending" as const },
];

const activity = [
  { time: "10:32", agent: "Code Analysis Agent", text: "Repository analysis started.", done: true },
  { time: "10:34", agent: "Code Analysis Agent", text: "Identified 24 modules.", done: true },
  { time: "10:37", agent: "Dependency Agent", text: "Identified 18 dependencies.", done: true },
  { time: "10:42", agent: "Business Logic Agent", text: "Extracting transaction rules.", done: false },
];

export default function WorkExecution() {
  const worker = useWorker();
  const { taskId } = useParams();
  const task = worker.tasks.find((t) => t.id === taskId);

  if (!task) return <Navigate to="../work" relative="path" replace />;

  const isRunning = task.status === "running";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 pb-10">
      <div className="space-y-5 min-w-0">
        <div className="rounded-card border border-border bg-card shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-start gap-3.5">
              <Link
                to="../work"
                relative="path"
                aria-label="Back to Worker Work"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-card text-ink transition-colors hover:bg-ink hover:text-white"
              >
                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </Link>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink font-display">Work Execution</h2>
                <p className="mt-0.5 text-[12.5px] text-ink-mute">
                  {task.title} · {worker.name}
                </p>
              </div>
            </div>
            <Badge variant={isRunning ? "blue" : "green"} dot>
              {isRunning ? "Running" : "Complete"}
            </Badge>
          </div>

          <div className="space-y-0">
            {journey.map((step, i) => (
              <div key={step.label} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
                      step.state === "done" && "border-status-green bg-status-green text-white",
                      step.state === "current" && "border-2 border-accent bg-accent-soft text-accent-ink",
                      step.state === "pending" && "border-border-strong text-ink-faint"
                    )}
                  >
                    {step.state === "done" ? "✓" : step.state === "current" ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    ) : (
                      i
                    )}
                  </div>
                  {i < journey.length - 1 && (
                    <div className={cn("w-px flex-1 my-0.5", step.state === "done" ? "bg-status-green/40" : "bg-border-strong")} />
                  )}
                </div>
                <div className={cn("min-w-0 flex-1", i < journey.length - 1 ? "pb-4" : "pb-1")}>
                  <p
                    className={cn(
                      "text-[13px] font-medium",
                      step.state === "pending" ? "text-ink-faint" : "text-ink"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-6">
          <h3 className="text-[15px] font-medium text-ink mb-4">Live Agent Activity</h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-10 shrink-0 text-[11px] tabular-nums text-ink-mute pt-0.5">{a.time}</span>
                <div className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.done ? "bg-status-green" : "bg-accent animate-pulse")} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-ink-soft">
                    <span className="font-medium text-ink">{a.agent}</span> — {a.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {worker.id === "legacy-modernization-engineer" && (
          <div className="rounded-card border border-accent-border bg-accent-soft p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-accent-ink">Important Discovery</p>
                  <Badge variant="amber">Medium risk</Badge>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink">14 critical business rules were identified.</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  <span className="font-medium">Impact:</span> Must be preserved during migration.
                </p>
                <DecisionEvidenceDialog
                  trigger={
                    <Button size="sm" variant="secondary" className="mt-3">
                      Review Evidence
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <p className="text-[11px] uppercase tracking-wider text-ink-mute">Task Budget</p>
          <p className="mt-1.5 text-[22px] leading-none tabular-nums text-ink font-display">
            ${task.cost.toFixed(2)} <span className="text-[14px] text-ink-mute">/ ${task.budget}</span>
          </p>
          <div className="mt-2.5 h-1.5 rounded-full bg-card-sunken overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(task.cost / task.budget) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
          <StatRow label="Agents Used" value={`${activity.length} / ${worker.agents.length || 8}`} />
          <StatRow label="Policies Applied" value={String(worker.policies.length || 12)} />
          <StatRow label="Evidence Items" value="48" />
        </div>

        <Button asChild variant="secondary" className="w-full">
          <Link to="../work" relative="path">
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            Cancel Run
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[12.5px] text-ink-soft">{label}</span>
      <span className="text-[13px] font-medium tabular-nums text-ink">{value}</span>
    </div>
  );
}
