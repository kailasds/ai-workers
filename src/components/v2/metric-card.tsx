import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/** Stat card from design.md §7: a solid rounded-square icon, one large numeral, a caption beneath. */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "teal",
  className,
}: {
  icon: Icon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "teal" | "orange";
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-control text-white", tone === "teal" ? "bg-brand-800" : "bg-accent")}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="text-[12px] font-medium text-ink-mute">{label}</p>
      </div>
      <p className="mt-4 text-[28px] font-bold leading-none tracking-[-0.01em] tabular-nums text-ink font-display">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-ink-mute">{hint}</p>}
    </div>
  );
}
