import { Link } from "react-router-dom";
import { AlertTriangle, ArrowDown, Ban, CheckCircle2, Lightbulb, Share2, ShieldCheck, TrendingUp, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningEvent, LearningEventType } from "@/lib/v2/types";
import { useV2, workerById } from "@/lib/v2/store";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const meta: Record<LearningEventType, { icon: Icon; tone: string }> = {
  "pattern-identified": { icon: Lightbulb, tone: "text-ink-soft" },
  "learning-reviewed": { icon: ShieldCheck, tone: "text-ink-soft" },
  "knowledge-gained": { icon: CheckCircle2, tone: "text-status-green" },
  "knowledge-shared": { icon: Share2, tone: "text-status-green" },
  "knowledge-revoked": { icon: Ban, tone: "text-status-red" },
  "learning-rejected": { icon: XCircle, tone: "text-status-red" },
  "evolution-proposed": { icon: AlertTriangle, tone: "text-status-amber" },
  "evolution-approved": { icon: TrendingUp, tone: "text-status-green" },
};

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function LearningEventItem({ event, showConnector }: { event: LearningEvent; showConnector?: boolean }) {
  const state = useV2();
  const m = meta[event.type];
  const worker = workerById(state, event.workerId);
  const body = (
    <div className="flex items-start gap-3">
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center", m.tone)}>
        <m.icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[14px] font-semibold text-ink">{event.title}</p>
          <span className="shrink-0 text-[12px] text-ink-faint">{timeAgo(event.timestamp)}</span>
        </div>
        {worker && <p className="text-[12px] text-ink-mute">{worker.name}</p>}
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{event.description}</p>
      </div>
    </div>
  );
  return (
    <div>
      {event.knowledgeId ? (
        <Link to={`/knowledge/${event.knowledgeId}`} className="block rounded-control p-2 -m-2 hover:bg-card-sunken">
          {body}
        </Link>
      ) : (
        body
      )}
      {showConnector && (
        <div className="ml-[15px] py-1.5 text-ink-faint">
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
