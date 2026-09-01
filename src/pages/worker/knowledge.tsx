import { BookOpen, Brain } from "lucide-react";
import { useWorker } from "./use-worker";
import { LearningPlan } from "@/components/shared/learning-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Knowledge() {
  const worker = useWorker();
  const pending = worker.learningPlan.improvementCandidates.filter((c) => c.status === "pending-review");
  const resolved = worker.learningPlan.improvementCandidates.filter((c) => c.status !== "pending-review");

  return (
    <div className="pb-10 space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-accent" strokeWidth={1.75} />
          <h2 className="text-[16px] font-bold text-ink">Knowledge Sources</h2>
        </div>
        <p className="text-[12.5px] text-ink-mute mb-3.5">Approved sources this worker is grounded in.</p>
        {worker.knowledgeSources.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong px-5 py-10 text-center">
            <p className="text-[13px] text-ink-mute">No knowledge sources connected yet.</p>
          </div>
        ) : (
          <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
            {worker.knowledgeSources.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-ink">{k.name}</p>
                    <Badge variant="outline">{k.type}</Badge>
                  </div>
                </div>
                <span className="text-[12px] tabular-nums text-ink-mute shrink-0">{k.lastUpdated}</span>
                <Badge variant={k.status === "Stale" ? "amber" : "green"} dot className="shrink-0">
                  {k.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-status-purple" strokeWidth={1.75} />
          <h2 className="text-[16px] font-bold text-ink">Memory</h2>
        </div>
        <p className="text-[12.5px] text-ink-mute mb-3.5">
          Operational memory, shown by category — not raw hidden reasoning.
        </p>
        {worker.memory.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong px-5 py-10 text-center">
            <p className="text-[13px] text-ink-mute">No memory categories recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {worker.memory.map((m) => (
              <div key={m.id} className="rounded-card border border-border bg-card shadow-card p-4">
                <p className="text-[13px] font-semibold text-ink">{m.name}</p>
                <p className="mt-1 text-[11.5px] text-ink-mute leading-relaxed">{m.description}</p>
                <p className="mt-3 text-[20px] leading-none tabular-nums text-ink font-display">{m.itemCount}</p>
                <p className="text-[10.5px] text-ink-mute">entries</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[16px] font-bold text-ink mb-1">Learning Plan</h2>
        <p className="text-[12.5px] text-ink-mute mb-3.5">Controlled continuous improvement — no silent retraining.</p>
        <LearningPlan plan={worker.learningPlan} />
      </section>

      {(pending.length > 0 || resolved.length > 0) && (
        <section>
          <h2 className="text-[16px] font-bold text-ink mb-1">Improvement Candidates</h2>
          <p className="text-[12.5px] text-ink-mute mb-3.5">Learning signals captured from execution, pending governed review.</p>

          {pending.length > 0 && (
            <div className="space-y-3 mb-3">
              {pending.map((c) => (
                <div key={c.id} className="rounded-card border border-accent-border bg-accent-soft p-5">
                  <p className="text-[13.5px] font-medium text-ink">{c.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{c.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-[12px] text-ink-mute">
                    <span>Evidence: {c.evidenceCount} runs</span>
                    <span>Success rate: {c.successRate}%</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary">Review</Button>
                    <Button size="sm">Promote to Knowledge</Button>
                    <Button size="sm" variant="ghost">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
              {resolved.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                      c.status === "promoted" ? "bg-status-green-soft text-status-green" : "bg-status-red-soft text-status-red"
                    )}
                  >
                    {c.status === "promoted" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <XIcon className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-ink truncate">{c.title}</p>
                    <p className="text-[11.5px] text-ink-mute">{c.evidenceCount} evidence · {c.successRate}% success · {c.date}</p>
                  </div>
                  <Badge variant={c.status === "promoted" ? "green" : "red"}>{c.status === "promoted" ? "Promoted" : "Rejected"}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
