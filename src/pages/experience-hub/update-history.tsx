import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateHistory, hubWorker, type HistoryStatus } from "@/lib/experience-hub-data";

const statusTone: Record<HistoryStatus, "purple" | "green" | "neutral" | "red"> = {
  Monitoring: "purple",
  "Successful Improvement": "green",
  "No Significant Impact": "neutral",
  "Negative Impact Detected": "red",
  "Rolled Back": "neutral",
};

export default function UpdateHistory() {
  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-ink-mute -mt-1">What was recommended, what was applied, and what happened afterward.</p>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.6fr_1.1fr_1.3fr_1fr_0.8fr_1fr_1.3fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
              <span>Update</span>
              <span>Target Worker</span>
              <span>Source Learning</span>
              <span>Status</span>
              <span>Applied Date</span>
              <span>Rollout Method</span>
              <span>Current Outcome</span>
            </div>
            {updateHistory.map((h) => {
              const worker = hubWorker(h.targetWorkerId);
              return (
                <Link
                  key={h.id}
                  to={`/experience-hub/history/${h.id}`}
                  className="grid grid-cols-[1.6fr_1.1fr_1.3fr_1fr_0.8fr_1fr_1.3fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/60"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-[13px] font-medium text-ink">{h.updateTitle}</span>
                  </span>
                  <span className="truncate text-[12px] text-ink-soft">{worker.name}</span>
                  <span className="truncate text-[12px] text-ink-soft">{h.sourceLearning}</span>
                  <Badge variant={statusTone[h.status]}>{h.status}</Badge>
                  <span className="text-[12px] tabular-nums text-ink-mute">
                    {new Date(h.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[12px] text-ink-soft">{h.rolloutMethod}</span>
                  <span className="flex items-center justify-between gap-1 min-w-0">
                    <span className="truncate text-[12px] text-ink-soft">{h.currentOutcome}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={2} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
