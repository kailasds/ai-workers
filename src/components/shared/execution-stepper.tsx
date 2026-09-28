import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "done" | "current" | "pending";

export function ExecutionStepper({
  steps,
  dark = false,
  className,
}: {
  steps: { label: string; state: StepState }[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-medium transition-colors",
                step.state === "done" &&
                  (dark
                    ? "border-white/0 bg-white text-onyx"
                    : "border-status-green/0 bg-status-green text-white"),
                step.state === "current" &&
                  (dark
                    ? "border-2 border-white bg-transparent text-white"
                    : "border-2 border-accent bg-accent-soft text-accent-ink"),
                step.state === "pending" &&
                  (dark
                    ? "border border-white/25 text-white/40"
                    : "border border-border-strong text-ink-faint")
              )}
            >
              {step.state === "done" ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : step.state === "current" ? (
                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dark ? "bg-white" : "bg-accent")} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </div>
            <span
              className={cn(
                "text-[10.5px] font-medium uppercase tracking-wider whitespace-nowrap",
                step.state === "pending"
                  ? dark
                    ? "text-white/35"
                    : "text-ink-faint"
                  : dark
                  ? "text-white/85"
                  : "text-ink-soft"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1.5 h-px flex-1 -translate-y-2.5",
                step.state === "done" ? (dark ? "bg-white/50" : "bg-status-green/50") : dark ? "bg-white/15" : "bg-border-strong"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
