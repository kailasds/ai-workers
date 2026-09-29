import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border-strong bg-card px-6 py-10 text-center", className)}>
      {Icon && (
        <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-card-sunken text-ink-mute">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      )}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-[12px] leading-relaxed text-ink-mute">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
