import { useState } from "react";
import { ArrowDown, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvolutionRecord } from "@/lib/v2/types";

/** Capability growth as a vertical progression: Current → Available next → Future. */
export function EvolutionPath({
  current,
  upcoming,
  pendingCapability,
  className,
}: {
  current: string;
  upcoming: string[];
  /** A capability with an evolution request waiting for approval. */
  pendingCapability?: string;
  className?: string;
}) {
  const rows = [
    { label: "Current", capability: current, state: "current" as const },
    ...upcoming.map((capability, i) => ({ label: i === 0 ? "Available next" : "Future", capability, state: "upcoming" as const })),
  ];
  return (
    <ol className={cn("space-y-0", className)}>
      {rows.map((r, i) => {
        const pending = r.capability === pendingCapability;
        return (
          <li key={r.capability}>
            {i > 0 && (
              <div className="ml-[9px] py-1 text-ink-faint">
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            )}
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                  r.state === "current" ? "border-brand-600 bg-brand-600 text-white" : "border-border-strong bg-card text-transparent"
                )}
              >
                {r.state === "current" && <Check className="h-3 w-3" strokeWidth={2} />}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">{r.label}</p>
                <p className={cn("text-[14px]", r.state === "current" ? "font-bold text-ink" : "font-medium text-ink-soft")}>{r.capability}</p>
                {pending && <p className="mt-0.5 text-[12px] font-medium text-status-amber">Waiting for Platform Sentinel approval</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Evolution history. Reasons are shown only when the data has them. */
export function EvolutionHistory({ history }: { history: EvolutionRecord[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <ul className="divide-y divide-border rounded-control border border-border">
      {history.map((h) => {
        const open = openId === h.id;
        return (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : h.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left hover:bg-card-sunken"
            >
              {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{h.to}</span>
                <span className="block truncate text-[12px] text-ink-mute">from {h.from}</span>
              </span>
              <span className="shrink-0 text-[12px] text-ink-faint">{fmt(h.at)}</span>
            </button>
            {open && (
              <div className="border-t border-border bg-card-sunken/50 px-3.5 py-3 pl-[38px]">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">Why did this change?</p>
                {h.reasons.length > 0 ? (
                  <ul className="mt-1.5 space-y-1">
                    {h.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2} />
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[12px] text-ink-mute">No reasons were recorded.</p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
