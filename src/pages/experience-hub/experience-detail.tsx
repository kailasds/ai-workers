import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkle, UserCog } from "lucide-react";
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

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{experience.type}</Badge>
          <Badge variant={maturityTone[experience.maturity]}>{maturityLabel[experience.maturity]}</Badge>
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-ink">{experience.title}</h1>
        <p className="mt-1 text-[13px] text-ink-mute">
          {worker.name} · {experience.environment} ·{" "}
          {new Date(experience.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <Row label="What happened" text={experience.whatHappened} />
            <Row label="Context" list={experience.inputsContext} />
            <Row label="Worker action" text={experience.workerAction} />
            <Row label="Outcome" text={experience.outcome} highlight />
            {experience.humanIntervention && <Row label="Human intervention" text={experience.humanIntervention} icon={UserCog} />}
          </div>

          <div className="rounded-card bg-accent-soft border border-accent-border p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink mb-1.5">
              <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
              AI Analysis
            </p>
            <p className="text-[12.5px] leading-relaxed text-ink">{experience.aiAnalysis}</p>
          </div>

          {related.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2 px-1">Related Experiences</p>
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/experience-hub/stream/${r.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition hover:bg-card-sunken/60"
                  >
                    <span className="text-[12.5px] text-ink">{r.title}</span>
                    <Badge variant={maturityTone[r.maturity]}>{maturityLabel[r.maturity]}</Badge>
                  </Link>
                ))}
              </div>
            </div>
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

function Row({
  label,
  text,
  list,
  highlight,
  icon: Icon,
}: {
  label: string;
  text?: string;
  list?: string[];
  highlight?: boolean;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className={cn("px-5 py-3.5 border-b border-border last:border-b-0", highlight && "bg-status-green-soft/40")}>
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">
        {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
        {label}
      </p>
      {list ? (
        <ul className="space-y-1">
          {list.map((c) => (
            <li key={c} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn("text-[12.5px] leading-relaxed", highlight ? "text-ink font-medium" : "text-ink-soft")}>{text}</p>
      )}
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
