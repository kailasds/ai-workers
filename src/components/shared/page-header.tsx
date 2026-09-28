import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
  red: "bg-status-red-soft text-status-red",
  purple: "bg-status-purple-soft text-status-purple",
  accent: "bg-accent-soft text-accent-ink",
  neutral: "bg-card-sunken text-ink-soft",
};

export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  tone = "accent",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-8 pt-7 pb-6">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[14px]", toneClasses[tone])}>
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
        )}
        <div>
          <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-ink font-display">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-[13.5px] text-ink-mute">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
    </div>
  );
}
