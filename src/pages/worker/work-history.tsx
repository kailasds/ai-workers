import { Link } from "react-router-dom";
import { useWorker } from "./use-worker";
import { Badge } from "@/components/ui/badge";
import { taskStatusMeta } from "@/lib/status";

export default function WorkHistory() {
  const worker = useWorker();

  return (
    <div className="pb-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-bold tracking-[-0.01em] text-ink font-display">Work History</h2>
        <p className="mt-1 text-[13px] text-ink-mute">Everything this worker has completed or attempted.</p>
      </div>

      {worker.workHistory.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No work history recorded for this worker yet.</p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
          {worker.workHistory.map((item) => {
            const meta = taskStatusMeta[item.status];
            return (
              <Link
                key={item.id}
                to={item.id}
                className="flex items-center gap-5 px-5 py-4 transition-colors hover:bg-card-sunken/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13.5px] font-medium text-ink">{item.title}</p>
                    <Badge variant={meta.color} dot>
                      {item.status === "certified-complete" ? "Certified Complete" : meta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-mute">{item.outcome}</p>
                  {item.reason && <p className="mt-0.5 text-[11.5px] text-status-amber">{item.reason}</p>}
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="text-[13px] tabular-nums font-medium text-ink">
                    {item.dodPassed} / {item.dodTotal}
                  </p>
                  <p className="text-[10.5px] text-ink-mute">DoD passed</p>
                </div>
                <div className="w-20 shrink-0 text-right">
                  <p className="text-[13px] tabular-nums text-ink-soft">${item.cost}</p>
                  <p className="text-[10.5px] text-ink-mute">{item.durationHrs}h</p>
                </div>
                <Badge variant={item.humanReview === "Approved" ? "green" : item.humanReview === "Pending" ? "amber" : item.humanReview === "Rejected" ? "red" : "neutral"} className="shrink-0">
                  {item.humanReview}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
