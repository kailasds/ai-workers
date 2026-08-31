import { Link } from "react-router-dom";
import { useState } from "react";
import { useWorker } from "./use-worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { taskStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { WorkTask } from "@/lib/types";

const groups: { key: string; label: string; match: WorkTask["status"][] }[] = [
  { key: "active", label: "Active", match: ["running"] },
  { key: "completed", label: "Completed", match: ["completed"] },
  { key: "scheduled", label: "Scheduled", match: ["scheduled", "awaiting-approval"] },
  { key: "failed", label: "Failed", match: ["failed"] },
];

export default function WorkerWork() {
  const worker = useWorker();
  const [tab, setTab] = useState("active");
  const active = groups.find((g) => g.key === tab)!;
  const tasks = worker.tasks.filter((t) => active.match.includes(t.status));

  return (
    <div className="pb-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink font-display">Worker Work</h2>
        <p className="mt-1 text-[13px] text-ink-mute">Tasks assigned to this AI Worker.</p>
      </div>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-card-sunken p-1">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setTab(g.key)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors",
              tab === g.key ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
            )}
          >
            {g.label}
            <span className={cn("text-[11px] tabular-nums", tab === g.key ? "text-white/60" : "text-ink-faint")}>
              {worker.tasks.filter((t) => g.match.includes(t.status)).length}
            </span>
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No {active.label.toLowerCase()} work for this worker.</p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
          {tasks.map((t) => {
            const meta = taskStatusMeta[t.status];
            return (
              <div key={t.id} className="flex items-center gap-5 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-medium text-ink truncate">{t.title}</p>
                    <Badge variant={meta.color} dot>
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-mute">
                    {t.status === "completed" ? "Completed" : "Current stage"}: {t.currentStage}
                  </p>
                  {t.status === "running" && (
                    <div className="mt-2 flex items-center gap-2 max-w-xs">
                      <Progress value={t.progress} className="h-1" />
                      <span className="text-[11px] text-ink-mute tabular-nums shrink-0">{t.progress}%</span>
                    </div>
                  )}
                </div>
                <span className="w-24 shrink-0 text-right text-[12px] tabular-nums text-ink-soft">
                  ${t.cost.toFixed(2)} / ${t.budget}
                </span>
                <Button asChild size="sm" variant="secondary" className="shrink-0">
                  <Link to={`../work/${t.id}`} relative="path">
                    {t.status === "running"
                      ? "View Execution"
                      : t.status === "completed"
                      ? "View Output"
                      : t.status === "awaiting-approval"
                      ? "Review"
                      : t.status === "failed"
                      ? "View Failure"
                      : "View"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
