import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepId } from "./types";

export interface StepDef {
  id: StepId;
  index: number;
  label: string;
  description: string;
}

export const steps: StepDef[] = [
  { id: "purpose", index: 1, label: "Purpose", description: "Define purpose" },
  { id: "capabilities", index: 2, label: "Capabilities", description: "Choose capabilities" },
  { id: "models", index: 3, label: "Models", description: "Set model routing" },
  { id: "dod", index: 4, label: "Definition of Done", description: "Prove completion" },
  { id: "customer", index: 5, label: "Customer Config", description: "Set configurability" },
  { id: "safety", index: 6, label: "Safety", description: "Set safety and proof" },
  { id: "package", index: 7, label: "Package", description: "Package and deploy" },
];

export function WorkerStepper({
  current,
  completed,
  onSelect,
}: {
  current: StepId;
  completed: Set<StepId>;
  onSelect: (id: StepId) => void;
}) {
  return (
    <div className="flex overflow-x-auto rounded-[14px] border border-border bg-card shadow-card">
      {steps.map((s) => {
        const isCurrent = s.id === current;
        const isDone = completed.has(s.id) && !isCurrent;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "flex min-w-[150px] flex-1 items-center gap-2.5 border-b-2 px-4 py-3 text-left transition-colors",
              isCurrent ? "border-accent bg-accent-soft" : "border-transparent hover:bg-card-sunken"
            )}
          >
            <div
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                isCurrent ? "bg-accent text-white" : isDone ? "bg-status-green text-white" : "bg-card-sunken text-ink-mute"
              )}
            >
              {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : s.index}
            </div>
            <div className="min-w-0">
              <p className={cn("text-[12.5px] font-semibold truncate", isCurrent ? "text-accent-ink" : "text-ink")}>{s.label}</p>
              <p className="text-[10.5px] text-ink-mute truncate">{s.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
