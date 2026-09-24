import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Sparkle, RotateCcw, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHistoryItem, hubWorker, type HistoryStatus } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const statusTone: Record<HistoryStatus, "purple" | "green" | "neutral" | "red"> = {
  Monitoring: "purple",
  "Successful Improvement": "green",
  "No Significant Impact": "neutral",
  "Negative Impact Detected": "red",
  "Rolled Back": "neutral",
};

export default function UpdateDetail() {
  const { id } = useParams();
  const item = getHistoryItem(id ?? "");

  if (!item) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Update not found.</p>
      </div>
    );
  }

  const worker = hubWorker(item.targetWorkerId);
  const attention = item.status === "Negative Impact Detected";

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/experience-hub/history" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Update History
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={statusTone[item.status]}>{item.status}</Badge>
            </div>
            <h1 className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-ink">{item.updateTitle}</h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              {worker.name} · Applied {new Date(item.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="min-w-0 space-y-5">
          {attention && (
            <div className="rounded-card border border-status-red/25 bg-status-red-soft p-5">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-status-red">
                <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
                Attention Required
              </p>
              <p className="mt-1.5 text-[12.5px] text-ink">The applied update is showing unexpected outcomes.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="destructive">
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                  Rollback
                </Button>
                <Button size="sm" variant="secondary">
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Review Update
                </Button>
                <Button size="sm" variant="ghost">
                  Continue Monitoring
                </Button>
              </div>
            </div>
          )}

          <Section title="What Changed">
            <p className="text-[12px] text-ink-mute mb-2.5">
              Source learning: <span className="text-ink-soft font-medium">{item.sourceLearning}</span>
            </p>
            <ul className="space-y-1.5">
              {item.changesApplied.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Rollout Timeline">
            <div className="space-y-0">
              {item.timeline.map((t, i) => (
                <div key={t.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1" />
                    {i < item.timeline.length - 1 && <span className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3.5 flex items-center justify-between flex-1 min-w-0">
                    <span className="text-[12.5px] text-ink">{t.label}</span>
                    <span className="text-[11.5px] text-ink-mute tabular-nums">{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Monitoring">
            <div className="flex items-center gap-2 mb-2.5">
              <Badge variant={statusTone[item.status]}>{item.status}</Badge>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-accent-soft px-3.5 py-3">
              <Sparkle className="h-3.5 w-3.5 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
              <p className="text-[12.5px] leading-relaxed text-accent-ink">{item.monitoringObservation}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Observed Impact</p>
              <p className={cn("text-[12.5px] leading-relaxed", attention ? "text-status-red font-medium" : "text-ink-soft")}>{item.observedImpact}</p>
            </div>

            {item.issuesDetected && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Issues Detected</p>
                <p className="text-[12.5px] text-status-red leading-relaxed">{item.issuesDetected}</p>
              </div>
            )}
          </Section>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Target Worker</p>
            <p className="mt-0.5 text-[13px] font-medium text-ink">{worker.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Rollout Strategy</p>
            <p className="mt-0.5 text-[13px] text-ink">{item.rolloutMethod}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Current Outcome</p>
            <p className="mt-0.5 text-[13px] text-ink">{item.currentOutcome}</p>
          </div>
          {!attention && (
            <Button variant="secondary" className="w-full mt-2">
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Rollback Option
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <p className="text-[13.5px] font-bold text-ink mb-3">{title}</p>
      {children}
    </div>
  );
}
