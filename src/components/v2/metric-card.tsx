import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/**
 * Stat card (design.md §4): a tiny tracked-out uppercase label above one large
 * serif numeral. Size carries the hierarchy, so there is no icon container,
 * only a bare outline icon. `ai` marks a model-generated figure in orange.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  ai,
  className,
}: {
  icon: Icon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  ai?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-ink-mute">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", ai ? "text-ai" : "text-ink-faint")} strokeWidth={2} />
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none tracking-[-0.01em] tabular-nums text-ink font-display">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-ink-mute">{hint}</p>}
    </div>
  );
}
