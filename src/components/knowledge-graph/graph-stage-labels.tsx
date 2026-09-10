import { ChevronRight } from "lucide-react";

const stages = ["Workers", "Topics", "Knowledge", "Candidate Knowledge", "Certified Knowledge", "Knowledge Packs"];

export function GraphStageLabels() {
  return (
    <div className="flex items-center gap-1.5 border-b border-border bg-card-sunken/60 px-4 py-1.5 overflow-x-auto">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{s}</span>
          {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-ink-faint" strokeWidth={2} />}
        </div>
      ))}
    </div>
  );
}
