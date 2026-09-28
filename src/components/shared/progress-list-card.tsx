import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { PortfolioRow } from "@/lib/dashboard-data";

export function ProgressListCard({
  title,
  subtitle,
  rows,
  tone = "accent",
}: {
  title: string;
  subtitle: string;
  rows: PortfolioRow[];
  tone?: "accent" | "purple";
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5 transition-shadow hover:shadow-float">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14.5px] font-bold text-ink">{title}</h3>
        <span className="shrink-0 text-right text-[10.5px] leading-tight text-ink-faint">{subtitle}</span>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((row, i) => (
          <div key={row.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[12.5px] font-medium text-ink">{row.label}</p>
              <p className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">{row.value}</p>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
              <div
                className={cn("h-full rounded-full", tone === "purple" ? "bg-status-purple" : "bg-accent")}
                style={{
                  width: grown ? `${Math.max(row.pct, 2)}%` : "0%",
                  transition: `width 600ms cubic-bezier(.2,.8,.2,1) ${i * 90}ms`,
                }}
              />
            </div>
            <p className="mt-1 truncate text-[10.5px] text-ink-mute">{row.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
