import { cn } from "@/lib/utils";
import type { StatusColor } from "@/lib/types";

const colorMap: Record<StatusColor, string> = {
  blue: "bg-status-blue",
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
  purple: "bg-status-purple",
  neutral: "bg-ink-mute",
};

export function StatusDot({
  color,
  pulse = false,
  className,
}: {
  color: StatusColor;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex h-2 w-2 shrink-0", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            colorMap[color]
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", colorMap[color])} />
    </span>
  );
}
