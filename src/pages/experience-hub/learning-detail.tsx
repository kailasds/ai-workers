import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLearning, updateRecommendations } from "@/lib/experience-hub-data";

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

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{learning.type}</Badge>
            <Badge variant={learning.usedInCount > 0 ? "green" : "amber"}>{learning.usedInCount > 0 ? "Validated Learning" : "Under Validation"}</Badge>
          </div>
          <h1 className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-ink">{learning.title}</h1>
        </div>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="min-w-0 space-y-5">
          <Section title="What Was Learned">
            <p className="text-[13px] text-ink-soft leading-relaxed">{learning.whatWasLearned}</p>
          </Section>

          <Section title="Why It Matters">
            <p className="text-[13px] text-ink-soft leading-relaxed">{learning.whyItMatters}</p>
          </Section>

          <Section title="Supporting Evidence">
            <p className="text-[12.5px] text-ink-soft leading-relaxed">{learning.evidenceSummary}</p>
          </Section>

          <Section title="Where It Has Been Observed">
            <ul className="space-y-1.5">
              {learning.observedIn.map((o) => (
                <li key={o} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Applicable Worker Types">
            <div className="flex flex-wrap gap-1.5">
              {learning.applicableWorkerTypes.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="Known Limitations">
            <p className="text-[12.5px] text-ink-soft leading-relaxed">{learning.knownLimitations}</p>
          </Section>

          {relatedUpdates.length > 0 && (
            <Section title="Related Updates">
              <div className="space-y-2">
                {relatedUpdates.map((u) => (
                  <Link
                    key={u.id}
                    to={`/experience-hub/updates/${u.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 transition hover:bg-card-sunken"
                  >
                    <span className="text-[12.5px] text-ink">{u.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Derived From</p>
          <p className="text-[12.5px] text-ink mb-4">{learning.derivedFrom}</p>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Applicable To</p>
          <p className="text-[12.5px] text-ink mb-4">{learning.applicableTo}</p>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Used In</p>
          <p className="text-[12.5px] text-ink mb-4">{learning.usedInCount} worker update{learning.usedInCount === 1 ? "" : "s"}</p>

          {learning.appliedToWorkerNames.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Already Applied To</p>
              <div className="flex flex-wrap gap-1.5">
                {learning.appliedToWorkerNames.map((w) => (
                  <Badge key={w} variant="green">
                    {w}
                  </Badge>
                ))}
              </div>
            </>
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
