import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { validatedLearnings, type LibraryCategory } from "@/lib/experience-hub-data";

const categories: (LibraryCategory | "All")[] = [
  "All",
  "Decision Strategies",
  "Validation Patterns",
  "Tool Strategies",
  "Workflow Improvements",
  "Failure Patterns",
  "Human Corrections",
  "Exception Handling",
  "Domain Knowledge",
];

export default function ExperienceLibrary() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = validatedLearnings
    .filter((l) => category === "All" || l.category === category)
    .filter((l) => l.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-ink-mute -mt-1">Validated operational intelligence that can inform future worker improvements.</p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-9 w-64 text-ink-faint">
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the library…"
            className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((l) => (
          <div key={l.id} className="rounded-card border border-border bg-card shadow-card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-bold text-ink">{l.title}</p>
              <Badge variant={l.usedInCount > 0 ? "green" : "amber"} className="shrink-0">
                {l.usedInCount > 0 ? "Validated Learning" : "Under Validation"}
              </Badge>
            </div>
            <Badge variant="outline" className="mt-2 w-fit">
              {l.type}
            </Badge>
            <p className="mt-2.5 text-[12.5px] text-ink-soft leading-relaxed flex-1">{l.whatWasLearned}</p>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              <span className="text-ink-mute">
                Derived from: <span className="text-ink-soft">{l.derivedFrom}</span>
              </span>
              <span className="text-ink-mute">
                Applicable to: <span className="text-ink-soft">{l.applicableTo}</span>
              </span>
              <span className="text-ink-mute">
                Used in: <span className="text-ink-soft">{l.usedInCount} worker update{l.usedInCount === 1 ? "" : "s"}</span>
              </span>
            </div>

            <Link
              to={`/experience-hub/library/${l.id}`}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline w-fit"
            >
              View Learning
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-[12.5px] text-ink-mute px-1">No learnings match these filters.</p>}
      </div>
    </div>
  );
}
