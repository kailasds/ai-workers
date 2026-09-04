import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLearning, updateRecommendations } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

export default function LearningDetail() {
  const { id } = useParams();
  const learning = getLearning(id ?? "");

  if (!learning) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Learning not found.</p>
      </div>
    );
  }

  const relatedUpdates = updateRecommendations.filter((u) => learning.relatedUpdateIds.includes(u.id));

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/experience-hub/library" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Experience Library
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{learning.type}</Badge>
          <Badge variant={learning.usedInCount > 0 ? "green" : "amber"}>{learning.usedInCount > 0 ? "Validated Learning" : "Under Validation"}</Badge>
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-ink">{learning.title}</h1>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <Row label="What was learned" text={learning.whatWasLearned} highlight />
            <Row label="Why it matters" text={learning.whyItMatters} />
            <Row label="Supporting evidence" text={learning.evidenceSummary} />
            <Row label="Known limitations" text={learning.knownLimitations} />
          </div>

          {relatedUpdates.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2 px-1">Related Updates</p>
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                {relatedUpdates.map((u) => (
                  <Link
                    key={u.id}
                    to={`/experience-hub/updates/${u.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition hover:bg-card-sunken/60"
                  >
                    <span className="text-[12.5px] text-ink">{u.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Derived From</p>
            <p className="text-[12.5px] text-ink">{learning.derivedFrom}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Applicable To</p>
            <p className="text-[12.5px] text-ink">{learning.applicableTo}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Used In</p>
            <p className="text-[12.5px] text-ink">
              {learning.usedInCount} worker update{learning.usedInCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Observed In</p>
            <ul className="space-y-1">
              {learning.observedIn.map((o) => (
                <li key={o} className="flex items-start gap-1.5 text-[11.5px] text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Applicable Worker Types</p>
            <div className="flex flex-wrap gap-1.5">
              {learning.applicableWorkerTypes.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {learning.appliedToWorkerNames.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Already Applied To</p>
              <div className="flex flex-wrap gap-1.5">
                {learning.appliedToWorkerNames.map((w) => (
                  <Badge key={w} variant="green">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div className={cn("px-5 py-3.5 border-b border-border last:border-b-0", highlight && "bg-accent-soft/40")}>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">{label}</p>
      <p className={cn("text-[12.5px] leading-relaxed", highlight ? "text-ink font-medium" : "text-ink-soft")}>{text}</p>
    </div>
  );
}
