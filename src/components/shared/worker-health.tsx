import { Sparkles, ShieldCheck, BadgeCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkerHealthMetrics } from "@/lib/types";

function healthTone(value: number): { label: string; color: string; bar: string } {
  if (value >= 90) return { label: "Strong", color: "text-status-green", bar: "bg-status-green" };
  if (value >= 75) return { label: "Stable", color: "text-status-amber", bar: "bg-status-amber" };
  return { label: "Needs Attention", color: "text-status-red", bar: "bg-status-red" };
}

const rows: {
  key: keyof WorkerHealthMetrics;
  label: string;
  description: string;
  icon: typeof Sparkles;
  tone: string;
}[] = [
  { key: "capability", label: "Capability Health", description: "Skills, agents and tools evaluated and available.", icon: Sparkles, tone: "bg-status-blue-soft text-status-blue" },
  { key: "governance", label: "Governance Health", description: "Policy compliance and access boundaries.", icon: ShieldCheck, tone: "bg-status-purple-soft text-status-purple" },
  { key: "evaluation", label: "Evaluation Health", description: "Eval suite pass rate and regression status.", icon: BadgeCheck, tone: "bg-status-green-soft text-status-green" },
  { key: "cost", label: "Cost Health", description: "Spend against budget and cost per outcome.", icon: Wallet, tone: "bg-status-amber-soft text-status-amber" },
];

export function WorkerHealth({ health, className }: { health: WorkerHealthMetrics; className?: string }) {
  return (
    <div className={cn("rounded-card border border-border bg-card shadow-card p-5", className)}>
      <h3 className="text-[16px] font-bold text-ink">Worker Health</h3>
      <div className="mt-4 space-y-4">
        {rows.map((row) => {
          const value = health[row.key];
          const tone = healthTone(value);
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", row.tone)}>
                    <row.icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-ink">{row.label}</p>
                    <p className="text-[11px] text-ink-mute truncate">{row.description}</p>
                  </div>
                </div>
                <span className={cn("text-[12px] font-semibold shrink-0", tone.color)}>{tone.label}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-card-sunken overflow-hidden">
                <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
