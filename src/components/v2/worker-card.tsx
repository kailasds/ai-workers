import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Lightbulb, TrendingUp, Users } from "lucide-react";
import { MaturityTag } from "@/components/v2/maturity-tag";
import { WorkerStatusBadge } from "@/components/v2/status-badge";
import type { V2Worker } from "@/lib/v2/types";

function Kpi({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: number }) {
  return (
    <div className="rounded-control bg-card-sunken px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-ink-mute">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="text-[12px] font-medium">{label}</span>
      </div>
      <p className="mt-1 text-[28px] font-bold leading-none tabular-nums text-ink font-display">{value}</p>
    </div>
  );
}

/** An identity card: who the Worker is, what it knows, what it can do. Not a dashboard. */
export function WorkerCard({ worker, assigned, learned }: { worker: V2Worker; assigned: number; learned: number }) {
  return (
    <Link
      to={`/workers/${worker.id}`}
      className="group flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-card hover:border-border-strong hover:shadow-float"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-800 text-white">
          <Users className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <WorkerStatusBadge status={worker.status} />
          <MaturityTag maturity={worker.maturity} />
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug tracking-[-0.01em] text-ink font-display">{worker.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2rem] text-[12px] leading-snug text-ink-mute">{worker.purpose}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Kpi icon={BookOpen} label="Assigned" value={assigned} />
        <Kpi icon={Lightbulb} label="Learned" value={learned} />
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <TrendingUp className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">Current capability</p>
          <p className="truncate text-[14px] font-medium text-ink">{worker.evolution.currentCapability}</p>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ink-faint group-hover:text-ink" strokeWidth={2} />
      </div>
    </Link>
  );
}
