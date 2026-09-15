import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiTrend {
  direction: "up" | "down" | "flat";
  label: string;
  /** Whether an "up" movement should read as good news. Defaults to true. */
  goodWhenUp?: boolean;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
  iconPosition = "top",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  trend?: KpiTrend;
  className?: string;
  /** "top" (default) places the icon top-right, above the value. "left" places it beside a stacked label+value, for a denser strip. */
  iconPosition?: "top" | "left";
}) {
  const goodWhenUp = trend?.goodWhenUp ?? true;
  const isGood = trend && trend.direction !== "flat" ? (trend.direction === "up") === goodWhenUp : null;
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;

  if (iconPosition === "left") {
    return (
      <div className={cn("rounded-card border border-border bg-card shadow-card p-4 transition-shadow hover:shadow-float", className)}>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card-sunken text-ink-soft">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium text-ink-mute truncate">{label}</p>
            <p className="mt-1 text-[22px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">{value}</p>
          </div>
        </div>
        {trend && (
          <p
            className={cn(
              "mt-2.5 flex items-center gap-1 text-[11px] font-medium",
              isGood === null ? "text-ink-mute" : isGood ? "text-status-green" : "text-status-red"
            )}
          >
            <TrendIcon className="h-3 w-3" strokeWidth={2.25} />
            {trend.label}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-card border border-border bg-card shadow-card p-4 transition-shadow hover:shadow-float", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] font-medium text-ink-mute truncate">{label}</p>
        {Icon && (
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card-sunken text-ink-soft">
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </div>
        )}
      </div>
      <p className="mt-2.5 text-[24px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink font-display">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-[11px] font-medium",
            isGood === null ? "text-ink-mute" : isGood ? "text-status-green" : "text-status-red"
          )}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={2.25} />
          {trend.label}
        </p>
      )}
    </div>
  );
}
