import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const nodeLegend: { label: string; className: string }[] = [
  { label: "Worker", className: "border-l-status-blue" },
  { label: "Topic", className: "border-l-status-purple" },
  { label: "Construct", className: "border-l-accent" },
  { label: "Run", className: "border-l-ink-faint" },
  { label: "Observation", className: "border-l-status-blue" },
  { label: "Evidence", className: "border-l-ink-faint" },
  { label: "Candidate", className: "border-l-status-amber" },
  { label: "Certified", className: "border-l-status-green" },
  { label: "Pack", className: "border-l-onyx" },
];

const edgeLegend = ["recorded", "supports", "contradicts", "certified as", "included in", "used by"];

export function GraphLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-card border border-border bg-card shadow-float text-[11px]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-3 py-2 font-semibold text-ink-soft">
        Legend
        {open ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2.5 w-56">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {nodeLegend.map((n) => (
              <div key={n.label} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-1.5 rounded-sm border-l-2 bg-card-sunken", n.className)} />
                <span className="text-ink-mute">{n.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Relationships</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-ink-mute">
            {edgeLegend.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
