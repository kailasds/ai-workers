import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-8 pt-7 pb-6">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-ink font-display">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-ink-mute">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
    </div>
  );
}
