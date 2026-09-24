import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ConfigHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <Link
          to=".."
          relative="path"
          aria-label="Back to Configuration"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-card text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.01em] text-ink font-display">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-ink-mute">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 pt-1.5">{actions}</div>}
    </div>
  );
}
