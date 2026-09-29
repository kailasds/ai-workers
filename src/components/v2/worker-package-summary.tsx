import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Brain, ClipboardCheck, FileText, TrendingUp } from "lucide-react";
import { EvolutionPath } from "@/components/v2/evolution-path";
import { WorkerAnatomy, type AnatomyPart } from "@/components/v2/worker-anatomy";
import type { Knowledge } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export interface PackageSummaryData {
  name: string;
  intent: { summary: string; outcome?: string; extra?: React.ReactNode };
  assigned: Knowledge[];
  learningEnabled: boolean;
  brainExtra?: React.ReactNode;
  evolution: { enabled: boolean; autoEvolve: boolean; current: string; upcoming: string[] };
  dod: { count: number; extra?: React.ReactNode };
}

const learningSteps = ["Experience", "Patterns", "Worker Sentinel", "Gained Knowledge"];

function group(items: Knowledge[]) {
  return {
    skills: items.filter((k) => k.kind === "skill"),
    company: items.filter((k) => k.kind === "company"),
    rulesSafety: items.filter((k) => k.kind === "rule" || k.kind === "safety"),
  };
}

/** A visual summary of a Worker, with each part expandable for the detail behind it. */
export function WorkerPackageSummary({ data, defaultOpen = "intent" }: { data: PackageSummaryData; defaultOpen?: AnatomyPart | null }) {
  const [open, setOpen] = useState<AnatomyPart | null>(defaultOpen);
  const g = group(data.assigned);

  const brainStatus = `Assigned knowledge · Learning ${data.learningEnabled ? "enabled" : "off"}`;
  const evolutionStatus = data.evolution.enabled ? `${data.evolution.current} · Can evolve` : `${data.evolution.current} · Evolution off`;

  const sections: { id: AnatomyPart; icon: Icon; title: string; status: string; body: React.ReactNode }[] = [
    {
      id: "intent",
      icon: FileText,
      title: "Intent",
      status: data.intent.summary,
      body: (
        <>
          {data.intent.outcome && <p className="text-[12px] leading-relaxed text-ink-soft">{data.intent.outcome}</p>}
          {data.intent.extra}
        </>
      ),
    },
    {
      id: "brain",
      icon: Brain,
      title: "Brain",
      status: brainStatus,
      body: (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">What it knows</p>
            <ul className="mt-2 space-y-1.5 text-[12px] text-ink-soft">
              <li>
                <span className="font-medium text-ink">Assigned skills</span> · {g.skills.length}
              </li>
              <li>
                <span className="font-medium text-ink">Company knowledge</span> · {g.company.length}
              </li>
              <li>
                <span className="font-medium text-ink">Rules and safety</span> · {g.rulesSafety.length}
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">How it learns</p>
            {data.learningEnabled ? (
              <ol className="mt-2 flex flex-wrap items-center gap-1 text-[12px] text-ink-soft">
                {learningSteps.map((s, i) => (
                  <li key={s} className="flex items-center gap-1">
                    <span className="rounded-full bg-card-sunken px-2 py-1 font-medium">{s}</span>
                    {i < learningSteps.length - 1 && <ArrowRight className="h-3 w-3 text-ink-faint" strokeWidth={2} />}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-[12px] text-ink-mute">Learning is off. This Worker only uses what it was given.</p>
            )}
          </div>
          {data.brainExtra && <div className="sm:col-span-2">{data.brainExtra}</div>}
        </div>
      ),
    },
    {
      id: "evolution",
      icon: TrendingUp,
      title: "Evolution",
      status: evolutionStatus,
      body: data.evolution.enabled ? (
        <div className="space-y-3">
          <EvolutionPath current={data.evolution.current} upcoming={data.evolution.upcoming} />
          <p className="text-[12px] text-ink-mute">
            {data.evolution.autoEvolve ? "Evolves automatically when approved. " : "Evolves only when you ask. "}Evolution decisions are governed by Platform Sentinel.
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-ink-mute">This Worker won&rsquo;t evolve. It stays at {data.evolution.current}.</p>
      ),
    },
    {
      id: "dod",
      icon: ClipboardCheck,
      title: "Definition of Done",
      status: `${data.dod.count} release gates`,
      body: (
        <>
          <p className="text-[12px] text-ink-soft">Work counts as finished only when it clears {data.dod.count} release gates.</p>
          {data.dod.extra}
        </>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <WorkerAnatomy
        name={data.name}
        active={open}
        onSelect={(p) => setOpen(open === p ? null : p)}
        parts={{ intent: data.intent.summary, brain: brainStatus, evolution: evolutionStatus, dod: `${data.dod.count} release gates` }}
      />
      <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card shadow-card">
        {sections.map((s) => {
          const isOpen = open === s.id;
          return (
            <div key={s.id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-card-sunken"
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />}
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-brand-100 text-brand-600">
                  <s.icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-ink">{s.title}</span>
                  <span className={cn("block truncate text-[12px] text-ink-mute")}>{s.status}</span>
                </span>
              </button>
              {isOpen && <div className="px-5 pb-5 pl-[68px]">{s.body}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
