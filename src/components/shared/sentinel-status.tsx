import { ShieldCheck, Eye, ShieldAlert, BadgeCheck, ShieldOff, Sparkles } from "lucide-react";
import { sentinelMeta } from "@/lib/status";
import type { SentinelState } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  purple: "bg-status-purple-soft text-status-purple",
  red: "bg-status-red-soft text-status-red",
  green: "bg-status-green-soft text-status-green",
};

const icons: Record<SentinelState, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  observing: Eye,
  guarding: ShieldCheck,
  "intervention-required": ShieldAlert,
  certified: BadgeCheck,
  "policy-violation": ShieldOff,
  "learning-signal": Sparkles,
};

export function SentinelStatus({ state, className }: { state: SentinelState; className?: string }) {
  const meta = sentinelMeta[state];
  const Icon = icons[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        toneClasses[meta.color],
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {meta.label}
    </span>
  );
}

export function SentinelCard({ state, className }: { state: SentinelState; className?: string }) {
  const meta = sentinelMeta[state];
  const Icon = icons[state];
  return (
    <div className={cn("rounded-card border border-border bg-card shadow-card p-5", className)}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", toneClasses[meta.color])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-bold text-ink">AI Sentinel</p>
            <span className="text-[11px] uppercase tracking-wider text-ink-faint">{meta.label}</span>
          </div>
          <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">{meta.description}</p>
        </div>
      </div>
    </div>
  );
}
