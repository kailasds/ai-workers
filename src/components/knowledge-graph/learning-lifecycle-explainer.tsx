import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pipeline = [
  "Worker does work",
  "Patterns emerge",
  "Learning identified",
  "Worker Sentinel reviews",
  "Gained knowledge",
  "Platform Sentinel decides",
  "Shared with platform",
];

const alternateOutcomes = ["Needs more evidence", "Contradictory", "Not kept", "Rejected"];

export function LearningLifecycleExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border border-border bg-card shadow-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left">
        <span className="text-[12.5px] leading-relaxed">
          <span className="font-semibold text-ink">How do Workers learn? </span>
          <span className="text-ink-mute">
            Workers do work, useful patterns emerge, Worker Sentinel decides what to keep, and Platform Sentinel decides what is worth sharing.
          </span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={2} /> : <ChevronDown className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={2} />}
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {pipeline.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="rounded-full border border-border bg-card-sunken px-2.5 py-1 text-[11px] font-medium text-ink-soft whitespace-nowrap">
                  {step}
                </span>
                {i < pipeline.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint" strokeWidth={2} />}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Not every pattern is kept. Learning can instead end up as:
          </p>
          <div className={cn("mt-1.5 flex flex-wrap gap-1.5")}>
            {alternateOutcomes.map((o) => (
              <span key={o} className="rounded-full border border-status-amber-soft bg-status-amber-soft/60 px-2.5 py-1 text-[11px] font-medium text-status-amber whitespace-nowrap">
                {o}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
