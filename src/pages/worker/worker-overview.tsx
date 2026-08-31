import { Link } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, Check } from "lucide-react";
import { useWorker } from "./use-worker";
import { ExecutionStepper } from "@/components/shared/execution-stepper";
import { DecisionEvidenceDialog } from "@/components/shared/decision-evidence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WorkerOverview() {
  const worker = useWorker();
  const runningTask = worker.tasks.find((t) => t.status === "running");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 pb-10">
      <div className="xl:col-span-2 space-y-5">
        {runningTask ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{runningTask.title}</CardTitle>
                <p className="mt-1 text-[12.5px] text-ink-mute">Current stage: {runningTask.currentStage}</p>
              </div>
              <Badge variant="blue" dot>
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <ExecutionStepper
                steps={[
                  { label: "Understand", state: "done" },
                  { label: "Plan", state: "done" },
                  { label: "Execute", state: "current" },
                  { label: "Validate", state: "pending" },
                  { label: "Approve", state: "pending" },
                  { label: "Complete", state: "pending" },
                ]}
              />
              {worker.agents.length > 0 && (
                <div className="mt-5 rounded-[12px] bg-card-sunken px-4 py-3">
                  <p className="text-[12.5px] text-ink-soft">
                    <span className="font-medium text-ink">
                      {worker.agents.find((a) => a.status === "running")?.name ?? worker.agents[0].name}
                    </span>{" "}
                    is analyzing transaction rules.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center pt-10">
              <p className="text-[13px] text-ink-mute">No active execution right now.</p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link to="work">View work history</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {worker.agents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Team Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              {worker.agents.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5">
                  <span className="text-[12.5px] text-ink-soft truncate">{a.name}</span>
                  <AgentStatusBadge status={a.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {worker.id === "legacy-modernization-engineer" && (
          <div className="rounded-card border border-accent-border bg-accent-soft p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-accent-ink">Important Discovery</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink">
                  14 critical business rules were identified in the legacy application.
                </p>
                <p className="mt-1.5 text-[12px] text-ink-soft">
                  <span className="font-medium">Impact:</span> These rules must be preserved during migration.
                </p>
                <div className="mt-3 flex gap-2">
                  <DecisionEvidenceDialog
                    trigger={
                      <Button size="sm" variant="secondary">
                        Review Evidence
                      </Button>
                    }
                  />
                  <Button size="sm" variant="ghost">
                    View Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <SummaryStat label="Skills" value={worker.skills.length} />
            <SummaryStat label="Agents" value={worker.agents.length} />
            <SummaryStat label="Knowledge Sources" value={worker.knowledge.length} />
            <SummaryStat label="Policies" value={worker.policies.length} />
            <SummaryStat label="Active Tasks" value={worker.activeTasks} />
            <SummaryStat label="Performance" value={`${worker.performance}%`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            {worker.responsibilities.length > 0 ? (
              <ul className="space-y-2">
                {worker.responsibilities.slice(0, 6).map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-green" strokeWidth={2} />
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-ink-mute">No responsibilities configured yet.</p>
            )}
          </CardContent>
        </Card>

        <Link
          to="configuration"
          className="flex items-center justify-between rounded-card border border-border bg-card shadow-card px-5 py-4 hover:bg-card-sunken transition-colors"
        >
          <span className="text-[13px] font-medium text-ink">Open Configuration Hub</span>
          <ArrowUpRight className="h-4 w-4 text-ink-mute" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-1 text-[20px] leading-none tabular-nums text-ink font-display">{value}</p>
    </div>
  );
}

function AgentStatusBadge({ status }: { status: "completed" | "running" | "waiting" | "idle" }) {
  const map = {
    completed: { variant: "green" as const, label: "Completed" },
    running: { variant: "blue" as const, label: "Running" },
    waiting: { variant: "neutral" as const, label: "Waiting" },
    idle: { variant: "neutral" as const, label: "Idle" },
  };
  const m = map[status];
  return (
    <Badge variant={m.variant} dot className={cn(status === "waiting" && "text-ink-faint")}>
      {m.label}
    </Badge>
  );
}
