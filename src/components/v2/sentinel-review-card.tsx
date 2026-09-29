import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Check, ChevronDown, ChevronRight, Hand, ShieldCheck, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/v2/confirmation-dialog";
import { ShareDialog } from "@/components/v2/knowledge-actions";
import { ReviewStatusBadge } from "@/components/v2/status-badge";
import { approveLearning, decideEvolution, holdReview, keepWithWorker, knowledgeById, rejectKnowledge, reopenReview, useV2, workerById } from "@/lib/v2/store";
import type { SentinelReview } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-ink">{children}</dd>
    </div>
  );
}

type Dialog = "share" | "reject" | "approve-evolution" | "reject-evolution" | null;

/** One decision waiting on Sentinel. The question is plain; the evidence is one click away. */
export function SentinelReviewCard({ review }: { review: SentinelReview }) {
  const state = useV2();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const close = (o: boolean) => !o && setDialog(null);

  const isEvolution = review.type === "evolution";
  const knowledge = isEvolution ? undefined : knowledgeById(state, review.subjectId);
  const worker = isEvolution ? workerById(state, review.subjectId) : workerById(state, knowledge?.sourceWorkerId);
  const open = review.status === "needs-review" || review.status === "held";

  if (!isEvolution && !knowledge) return null;
  if (isEvolution && !worker) return null;

  const question = isEvolution
    ? "Should this Worker be able to do more?"
    : review.type === "learning"
      ? "Should this Worker learn this?"
      : "Should this knowledge be shared?";

  return (
    <div className={cn("rounded-card border border-border bg-card p-5 shadow-card", !open && "bg-card-sunken/60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
            {isEvolution ? <TrendingUp className="h-3 w-3" strokeWidth={2} /> : <ShieldCheck className="h-3 w-3" strokeWidth={2} />}
            {isEvolution ? "Worker evolution request" : "Knowledge review"} · {review.level === "worker" ? "Worker Sentinel" : "Platform Sentinel"}
          </p>
          <h3 className="mt-1 text-[15px] font-bold text-ink font-display">{isEvolution ? worker!.name : knowledge!.title}</h3>
        </div>
        <ReviewStatusBadge status={review.status} className="shrink-0" />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
        {isEvolution ? (
          <>
            <Field label="Current capability">{worker!.evolution.currentCapability}</Field>
            <Field label="Proposed capability">{review.proposedCapability}</Field>
            {review.why && <Field label="Why?">{review.why}</Field>}
            {review.impact && <Field label="Impact">{review.impact}</Field>}
            {review.validation && <Field label="Validation">{review.validation}</Field>}
          </>
        ) : (
          <>
            <Field label="Learned by">{worker?.name ?? "A Worker"}</Field>
            <Field label="Question">{question}</Field>
            {review.type === "knowledge-sharing" && <Field label="Suggested scope">{review.suggestedScope?.join(", ")}</Field>}
            {knowledge!.summary && <div className="sm:col-span-2"><Field label="What was learned">{knowledge!.summary}</Field></div>}
          </>
        )}
      </dl>

      {!isEvolution && knowledge!.evidence && knowledge!.evidence.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            aria-expanded={showEvidence}
            className="flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2"
          >
            {showEvidence ? <ChevronDown className="h-3 w-3" strokeWidth={2} /> : <ChevronRight className="h-3 w-3" strokeWidth={2} />}
            Evidence
          </button>
          {showEvidence && (
            <ul className="mt-2 space-y-1.5 rounded-control bg-card-sunken p-3">
              {knowledge!.evidence.map((e) => (
                <li key={e.workerId} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="truncate text-ink-soft">{workerById(state, e.workerId)?.name ?? e.workerId}</span>
                  {e.result === "ok" ? (
                    <span className="flex shrink-0 items-center gap-1 text-status-green">
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      Agrees
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-status-amber">
                      <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
                      Mixed result
                    </span>
                  )}
                </li>
              ))}
              <li className="pt-1">
                <Link to={`/knowledge/${knowledge!.id}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
                  View full evidence
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}

      {open ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {isEvolution ? (
            <>
              <Button size="sm" onClick={() => setDialog("approve-evolution")}>Approve evolution</Button>
              {review.status !== "held" && (
                <Button size="sm" variant="secondary" onClick={() => decideEvolution(review.id, "hold")}>
                  <Hand className="h-3.5 w-3.5" strokeWidth={2} />
                  Hold
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setDialog("reject-evolution")}>
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                Reject
              </Button>
            </>
          ) : review.type === "learning" ? (
            <>
              <Button size="sm" onClick={() => approveLearning(knowledge!.id)}>Approve</Button>
              {review.status !== "held" && (
                <Button size="sm" variant="secondary" onClick={() => holdReview(review.id)}>
                  <Hand className="h-3.5 w-3.5" strokeWidth={2} />
                  Hold
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setDialog("reject")}>
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                Reject
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => setDialog("share")}>Share with platform</Button>
              <Button size="sm" variant="secondary" onClick={() => keepWithWorker(knowledge!.id)}>Keep with Worker</Button>
              {review.status !== "held" && (
                <Button size="sm" variant="secondary" onClick={() => holdReview(review.id)}>
                  <Hand className="h-3.5 w-3.5" strokeWidth={2} />
                  Hold
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setDialog("reject")}>
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                Reject
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-[12px] text-ink-mute">
          <span>{review.decision}</span>
          <button type="button" onClick={() => reopenReview(review.id)} className="font-medium text-accent-ink hover:underline underline-offset-2">
            Reopen
          </button>
        </div>
      )}

      {knowledge && dialog === "share" && (
        <ShareDialog k={knowledge} open onOpenChange={close} defaultAudience={review.suggestedScope?.[0]} />
      )}
      {knowledge && dialog === "reject" && (
        <ConfirmationDialog
          open
          onOpenChange={close}
          title="Reject learning?"
          description={<><span className="font-medium text-ink">{knowledge.title}</span> will not be kept or shared. It stays on record as rejected.</>}
          confirmLabel="Reject"
          tone="destructive"
          onConfirm={() => rejectKnowledge(knowledge.id)}
        />
      )}
      {isEvolution && dialog === "approve-evolution" && (
        <ConfirmationDialog
          open
          onOpenChange={close}
          title="Approve evolution?"
          description={<>The Worker will change from <span className="font-medium text-ink">{worker!.evolution.currentCapability}</span> to <span className="font-medium text-ink">{review.proposedCapability}</span>. {review.impact}</>}
          confirmLabel="Approve evolution"
          onConfirm={() => decideEvolution(review.id, "approve")}
        />
      )}
      {isEvolution && dialog === "reject-evolution" && (
        <ConfirmationDialog
          open
          onOpenChange={close}
          title="Reject evolution?"
          description={<>The Worker will stay at <span className="font-medium text-ink">{worker!.evolution.currentCapability}</span>.</>}
          confirmLabel="Reject"
          tone="destructive"
          onConfirm={() => decideEvolution(review.id, "reject")}
        />
      )}
    </div>
  );
}
