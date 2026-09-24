import { useParams, Navigate } from "react-router-dom";
import { CheckCircle2, FileCheck, Clock, Wallet } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { taskStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";

export default function WorkHistoryDetail() {
  const worker = useWorker();
  const { workId } = useParams();
  const item = worker.workHistory.find((w) => w.id === workId);

  if (!item) return <Navigate to=".." relative="path" replace />;

  const meta = taskStatusMeta[item.status];
  const pct = Math.round((item.dodPassed / item.dodTotal) * 100);

  return (
    <div className="pb-10">
      <ConfigHeader
        title={item.title}
        subtitle={item.outcome}
        actions={
          <Badge variant={meta.color} dot>
            {item.status === "certified-complete" ? "Certified Complete" : meta.label}
          </Badge>
        }
      />

      {item.reason && (
        <div className="mb-5 rounded-card border border-status-amber/25 bg-status-amber-soft px-4 py-3">
          <p className="text-[12.5px] text-ink">
            <span className="font-semibold">Reason:</span> {item.reason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        <Stat icon={CheckCircle2} label="Definition of Done" value={`${item.dodPassed} / ${item.dodTotal}`} />
        <Stat icon={Wallet} label="Cost" value={`$${item.cost}`} />
        <Stat icon={Clock} label="Duration" value={`${item.durationHrs}h`} />
        <Stat icon={FileCheck} label="Evidence" value={item.evidenceAvailable ? "Available" : "Not attached"} />
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-ink">Definition of Done completion</p>
          <span className="text-[12px] tabular-nums text-ink-mute">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" indicatorClassName={cn(pct === 100 ? "bg-status-green" : "bg-status-amber")} />

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[12.5px] text-ink-soft">Human Review</span>
          <Badge
            variant={item.humanReview === "Approved" ? "green" : item.humanReview === "Pending" ? "amber" : item.humanReview === "Rejected" ? "red" : "neutral"}
          >
            {item.humanReview}
          </Badge>
        </div>
        {item.completedAt && (
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12.5px] text-ink-soft">Completed</span>
            <span className="text-[12.5px] tabular-nums text-ink">{item.completedAt}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <div className="flex items-center gap-1.5 text-ink-mute">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <p className="text-[10.5px] uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-1.5 text-[18px] tabular-nums text-ink font-display">{value}</p>
    </div>
  );
}
