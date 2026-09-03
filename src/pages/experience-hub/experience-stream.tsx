import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { experienceEvents, hubWorker, maturityLabel, maturityOrder, type ExperienceType, type MaturityStage } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const typeFilters: (ExperienceType | "All")[] = [
  "All",
  "Successful Strategy",
  "Failure Pattern",
  "Human Correction",
  "New Edge Case",
  "Tool Behavior",
  "Decision Pattern",
  "Exception Handling",
  "Performance Observation",
];

const maturityTone: Record<MaturityStage, "neutral" | "blue" | "amber" | "green" | "accent"> = {
  "raw-experience": "neutral",
  "observed-pattern": "blue",
  "under-validation": "amber",
  "validated-learning": "green",
  "used-in-recommendation": "accent",
};

export default function ExperienceStream() {
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("All");
  const [maturityFilter, setMaturityFilter] = useState<MaturityStage | "All">("All");

  const filtered = experienceEvents
    .filter((e) => typeFilter === "All" || e.type === typeFilter)
    .filter((e) => maturityFilter === "All" || e.maturity === maturityFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-ink-mute -mt-1">A real-time view of operational experiences captured from deployed AI Workers.</p>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill label="Type" value={typeFilter} options={typeFilters} onChange={(v) => setTypeFilter(v as typeof typeFilter)} />
        <FilterPill
          label="Maturity"
          value={maturityFilter}
          options={["All", ...maturityOrder] as (MaturityStage | "All")[]}
          onChange={(v) => setMaturityFilter(v)}
          renderOption={(v) => (v === "All" ? "All" : maturityLabel[v])}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((e) => {
          const worker = hubWorker(e.workerId);
          return (
            <div key={e.id} className="rounded-card border border-border bg-card shadow-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{worker.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="uppercase tracking-wide">
                      {e.type}
                    </Badge>
                    <Badge variant={maturityTone[e.maturity]}>{maturityLabel[e.maturity]}</Badge>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-ink-faint tabular-nums">
                  {new Date(e.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>

              <p className="mt-3 text-[13px] text-ink leading-relaxed">{e.whatHappened}</p>
              <p className="mt-1.5 text-[12.5px] text-ink-soft">
                <span className="font-medium text-ink">Outcome:</span> {e.outcome}
              </p>

              <Link
                to={`/experience-hub/stream/${e.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline"
              >
                View Experience
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-[12.5px] text-ink-mute px-1">No experiences match these filters.</p>}
      </div>
    </div>
  );
}

function FilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
  renderOption,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  renderOption?: (v: T) => string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
    </div>
  );
}
