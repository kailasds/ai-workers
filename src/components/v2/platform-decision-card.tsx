import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Ban, Bot, CheckCircle2, Share2, TrendingUp, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevokeDialog, ShareDialog } from "@/components/v2/knowledge-actions";
import { StatusBadge } from "@/components/v2/status-badge";
import { knowledgeById, useV2, workerById } from "@/lib/v2/store";
import type { SentinelReview } from "@/lib/v2/types";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** A decision Platform Sentinel made on its own. Nobody was asked; a person can still override it. */
export function PlatformDecisionCard({ review }: { review: SentinelReview }) {
  const state = useV2();
  const [dialog, setDialog] = useState<"share" | "revoke" | null>(null);
  const isEvolution = review.type === "evolution";
  const k = isEvolution ? undefined : knowledgeById(state, review.subjectId);
  const worker = isEvolution ? workerById(state, review.subjectId) : workerById(state, k?.sourceWorkerId);
  const shared = review.decision === "Shared with platform";
  const platformItem = knowledgeById(state, k?.sharedAsId);
  if (!isEvolution && !k) return null;

  const Icon = isEvolution ? TrendingUp : shared ? Share2 : CheckCircle2;
  const title = isEvolution ? worker?.name : k!.title;

  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center text-ai">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
              <Bot className="h-3.5 w-3.5" strokeWidth={2} />
              {review.automatic ? "Decided automatically" : "Decided by you"}
            </p>
            <span className="text-[12px] text-ink-faint">{timeAgo(review.decidedAt)}</span>
          </div>
          <h3 className="mt-1 text-[15px] font-bold text-ink font-display">{title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge tone={review.decision === "Kept with the Worker" ? "neutral" : "green"} icon={CheckCircle2}>
              {review.decision}
            </StatusBadge>
            {isEvolution && <span className="text-[12px] text-ink-mute">{review.proposedCapability}</span>}
            {!isEvolution && review.suggestedScope && shared && <span className="text-[12px] text-ink-mute">for {review.suggestedScope.join(", ")}</span>}
          </div>
          {review.reasoning && <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{review.reasoning}</p>}
          {worker && !isEvolution && <p className="mt-1 text-[12px] text-ink-mute">Learned by {worker.name}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {!isEvolution && shared && platformItem && platformItem.status === "active" && (
              <Button size="sm" variant="secondary" onClick={() => setDialog("revoke")}>
                <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                Override: revoke
              </Button>
            )}
            {!isEvolution && !shared && k!.status === "active" && !k!.sharedAsId && (
              <Button size="sm" variant="secondary" onClick={() => setDialog("share")}>
                <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
                Override: share anyway
              </Button>
            )}
            <Link
              to={isEvolution ? `/workers/${review.subjectId}` : `/knowledge/${shared && platformItem ? platformItem.id : k!.id}`}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2"
            >
              {isEvolution ? "View Worker" : "View knowledge"}
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
      {dialog === "revoke" && platformItem && <RevokeDialog k={platformItem} open onOpenChange={(o) => !o && setDialog(null)} />}
      {dialog === "share" && k && <ShareDialog k={k} open onOpenChange={(o) => !o && setDialog(null)} />}
    </div>
  );
}
