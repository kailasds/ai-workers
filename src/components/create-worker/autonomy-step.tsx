import { cn } from "@/lib/utils";
import { autonomyLevels } from "./script";
import type { ComposeState } from "./types";

export function AutonomyStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const selected = autonomyLevels.find((a) => a.level === compose.autonomyLevel)!;

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Step 5 of 5</p>
      <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Autonomy</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-mute">How far this Worker may act before a person is asked.</p>

      <div className="mt-5">
        <p className="text-[13.5px] font-bold text-ink mb-1">Autonomy level</p>
        <p className="text-[12px] text-ink-mute mb-3">Each level widens what the Worker may do without being asked.</p>

        <div className="divide-y divide-border rounded-[12px] border border-border">
          {autonomyLevels.map((level) => {
            const isSelected = level.level === compose.autonomyLevel;
            return (
              <button
                key={level.level}
                onClick={() => update("autonomyLevel", level.level)}
                className={cn(
                  "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors",
                  isSelected ? "bg-accent-soft" : "hover:bg-card-sunken"
                )}
              >
                <div
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                    isSelected ? "bg-accent text-white" : "bg-card-sunken text-ink-mute"
                  )}
                >
                  {level.level}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-[13.5px] font-semibold", isSelected ? "text-accent-ink" : "text-ink")}>{level.name}</p>
                  <p className="text-[11.5px] text-ink-mute">{level.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-[12px] bg-card-sunken p-4 animate-in fade-in-0 duration-200" key={selected.level}>
        <p className="text-[12.5px] leading-relaxed text-ink">{selected.release}</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-3 text-[12px]">
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Release</p>
            <p className="mt-1 font-medium text-ink">{selected.release}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Where it may run</p>
            <p className="mt-1 font-medium text-ink">{selected.whereItMayRun}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Needs a person</p>
            <p className="mt-1 font-medium text-ink">{selected.needsAPerson}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-ink-faint">
        Drift monitoring is in the brain, under Sentinel. The monthly operating ceiling is set during deployment.
      </p>
    </div>
  );
}
