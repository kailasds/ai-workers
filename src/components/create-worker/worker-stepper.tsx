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
  { id: "identity", index: 1, label: "Bounded context", description: "Identity · domain · scope" },
  { id: "intent", index: 2, label: "Worker intent", description: "Agent · harness · tools" },
  { id: "brain", index: 3, label: "Worker Brain", description: "Skills · DSLs · EVALs · Memory · Sentinel" },
  { id: "dod", index: 4, label: "Definition of Done", description: "Release gates" },
  { id: "autonomy", index: 5, label: "Autonomy", description: "How far it may act" },
];

export function WorkerStepper({
  current,
  completed,
  reachable,
  onSelect,
}: {
  current: StepId;
  completed: Set<StepId>;
  reachable: Set<StepId>;
  onSelect: (id: StepId) => void;
}) {
  return (
    <div className="flex overflow-x-auto rounded-card border border-border bg-card shadow-card">
      {steps.map((s) => {
        const isCurrent = s.id === current;
        const isDone = completed.has(s.id) && !isCurrent;
        const isReachable = reachable.has(s.id);
        return (
          <button
            key={s.id}
            onClick={() => isReachable && onSelect(s.id)}
            disabled={!isReachable}
            className={cn(
              "flex min-w-[150px] flex-1 items-center gap-2.5 border-b-2 px-4 py-3 text-left transition-colors",
              isCurrent ? "border-accent bg-accent-soft" : "border-transparent hover:bg-card-sunken",
              !isReachable && "cursor-not-allowed opacity-40 hover:bg-transparent"
            )}
          >
            <div
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
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
