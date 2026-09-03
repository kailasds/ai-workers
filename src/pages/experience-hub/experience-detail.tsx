import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getExperience, hubWorker, maturityLabel, experienceEvents, type MaturityStage } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const maturityTone: Record<MaturityStage, "neutral" | "blue" | "amber" | "green" | "accent"> = {
  "raw-experience": "neutral",
  "observed-pattern": "blue",
  "under-validation": "amber",
  "validated-learning": "green",
  "used-in-recommendation": "accent",
};

export default function ExperienceDetail() {
  const { id } = useParams();
  const experience = getExperience(id ?? "");

  if (!experience) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Experience not found.</p>
      </div>
    );
  }

  const worker = hubWorker(experience.workerId);
  const related = experienceEvents.filter((e) => experience.relatedExperienceIds.includes(e.id));

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/experience-hub/stream" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Experience Stream
        </Link>

        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{experience.type}</Badge>
            <Badge variant={maturityTone[experience.maturity]}>{maturityLabel[experience.maturity]}</Badge>
          </div>
          <h1 className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-ink">{experience.title}</h1>
          <p className="mt-1 text-[13px] text-ink-mute">
            {worker.name} · {new Date(experience.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="min-w-0 space-y-5">
          <Section title="Experience Summary">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <Field label="Worker" value={worker.name} />
              <Field label="Environment" value={experience.environment} />
            </div>
            <p className="text-[12.5px] text-ink-soft leading-relaxed">
              <span className="font-medium text-ink">What happened:</span> {experience.whatHappened}
            </p>
          </Section>

          <Section title="Inputs / Context">
            <ul className="space-y-1.5">
              {experience.inputsContext.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Worker Action">
            <p className="text-[12.5px] text-ink-soft leading-relaxed">{experience.workerAction}</p>
          </Section>

          <Section title="Observed Outcome">
            <p className="text-[12.5px] text-ink-soft leading-relaxed">{experience.outcome}</p>
          </Section>

          {experience.humanIntervention && (
            <Section title="Human Intervention">
              <p className="text-[12.5px] text-ink-soft leading-relaxed">{experience.humanIntervention}</p>
            </Section>
          )}

          <Section title="AI Analysis">
            <div className="flex items-start gap-2.5 rounded-lg bg-accent-soft px-3.5 py-3">
              <Sparkle className="h-3.5 w-3.5 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
              <p className="text-[12.5px] leading-relaxed text-accent-ink">{experience.aiAnalysis}</p>
            </div>
          </Section>

          {related.length > 0 && (
            <Section title="Related Experiences">
              <div className="space-y-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/experience-hub/stream/${r.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 transition hover:bg-card-sunken"
                  >
                    <span className="text-[12.5px] text-ink">{r.title}</span>
                    <Badge variant={maturityTone[r.maturity]}>{maturityLabel[r.maturity]}</Badge>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-3">Lifecycle Status</p>
          <MaturityLadder current={experience.maturity} />
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-medium text-ink">{value}</p>
    </div>
  );
}

const stages: MaturityStage[] = ["raw-experience", "observed-pattern", "under-validation", "validated-learning", "used-in-recommendation"];

function MaturityLadder({ current }: { current: MaturityStage }) {
  const idx = stages.indexOf(current);
  return (
    <div className="space-y-0">
      {stages.map((s, i) => (
        <div key={s} className="flex gap-2.5">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                i <= idx ? "bg-accent text-white" : "border border-border-strong bg-card"
              )}
            >
              {i <= idx && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {i < stages.length - 1 && <span className={cn("w-px flex-1 my-0.5", i < idx ? "bg-accent" : "bg-border")} style={{ minHeight: 20 }} />}
          </div>
          <p className={cn("text-[12.5px] pb-4", i === idx ? "font-semibold text-ink" : i < idx ? "text-ink-soft" : "text-ink-faint")}>
            {maturityLabel[s]}
          </p>
        </div>
      ))}
    </div>
  );
}
