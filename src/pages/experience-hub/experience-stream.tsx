import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
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

const maturityDot: Record<MaturityStage, string> = {
  "raw-experience": "bg-ink-faint",
  "observed-pattern": "bg-status-blue",
  "under-validation": "bg-status-amber",
  "validated-learning": "bg-status-green",
  "used-in-recommendation": "bg-accent",
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

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        {filtered.map((e) => {
          const worker = hubWorker(e.workerId);
          return (
            <Link
              key={e.id}
              to={`/experience-hub/stream/${e.id}`}
              className="flex items-start gap-3 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/60"
            >
              <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", maturityDot[e.maturity])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[12.5px] font-semibold text-ink">{worker.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {e.type}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-soft truncate">{e.whatHappened}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={maturityTone[e.maturity]}>{maturityLabel[e.maturity]}</Badge>
                <span className="text-[11px] text-ink-faint tabular-nums w-12 text-right">
                  {new Date(e.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="text-[12.5px] text-ink-mute px-5 py-8">No experiences match these filters.</p>}
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
