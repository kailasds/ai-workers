import { cn } from "@/lib/utils";
import type { HistoryEvent } from "@/lib/v2/types";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Compact lifecycle history. Nothing is ever removed, only added to. */
export function KnowledgeTimeline({ events }: { events: HistoryEvent[] }) {
  return (
    <ol className="relative space-y-3.5">
      <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" aria-hidden />
      {events.map((e) => (
        <li key={e.id} className="relative flex gap-3 pl-0">
          <span
            className={cn(
              "relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 bg-card",
              e.tone === "bad" ? "border-status-red" : e.tone === "warn" ? "border-status-amber" : "border-border-strong"
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p
                className={cn(
                  "text-[12px] font-semibold",
                  e.tone === "bad" ? "text-status-red" : e.tone === "warn" ? "text-status-amber" : "text-ink"
                )}
              >
                {e.tone === "warn" && <span className="sr-only">Warning: </span>}
                {e.label}
              </p>
              <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">{fmt(e.at)}</span>
            </div>
            {e.detail && <p className="mt-0.5 text-[12px] leading-relaxed text-ink-mute">{e.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
