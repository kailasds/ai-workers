import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { kindLabel } from "./graph-node";

const nodeLegend: { kind: keyof typeof kindLabel; className: string }[] = [
  { kind: "worker", className: "border-l-status-blue" },
  { kind: "topic", className: "border-l-status-purple" },
  { kind: "construct", className: "border-l-accent" },
  { kind: "run", className: "border-l-ink-faint" },
  { kind: "observation", className: "border-l-status-blue" },
  { kind: "evidence", className: "border-l-ink-faint" },
  { kind: "candidate", className: "border-l-status-amber" },
  { kind: "certified", className: "border-l-status-green" },
  { kind: "pack", className: "border-l-onyx" },
];

const statusLegend: { label: string; className: string }[] = [
  { label: "Observed", className: "bg-status-blue" },
  { label: "Corroborated", className: "bg-status-amber" },
  { label: "Awaiting evidence", className: "bg-status-amber" },
  { label: "Contradictory", className: "bg-status-red" },
  { label: "Accepted", className: "bg-status-green" },
  { label: "Certified", className: "bg-status-green" },
  { label: "Published", className: "bg-status-green" },
  { label: "Not retained", className: "bg-ink-faint" },
  { label: "Rejected", className: "bg-status-red" },
];

const edgeLegend = ["supports", "contradicts", "certified as", "included in", "used by"];

export function GraphLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-card border border-border bg-card shadow-float text-[11px]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-3 py-2 font-semibold text-ink-soft">
        Legend
        {open ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2.5 w-60">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Entity types — what is this?</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {nodeLegend.map((n) => (
              <div key={n.kind} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-1.5 rounded-sm border-l-2 bg-card-sunken", n.className)} />
                <span className="text-ink-mute">{kindLabel[n.kind]}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Statuses — what state is it in?</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {statusLegend.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.className)} />
                <span className="text-ink-mute">{s.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Relationships</p>
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
