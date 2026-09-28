import { Bot, Wrench } from "lucide-react";
import { EditableField, EditableChipList } from "@/components/shared/editable";
import type { ComposeState } from "./types";

export function IntentStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Step 2 of 5</p>
      <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Confirm what this Worker will run</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-mute">
        One agent, wired to the harness the bounded context chose, with the tools it needs and nothing else.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="flex items-start gap-3 rounded-[12px] bg-card-sunken p-4 sm:col-span-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
            <Bot className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">Orchestrator agent</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-mute">
              Plans, sequences and supervises the work against the SPEC this bounded context produces.
            </p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Harness</label>
          <div className="mt-1">
            <EditableField
              value={compose.workerIntent.harnessLabel}
              aiValue="Integration Modernization Harness"
              onChange={(v) => update("workerIntent", { ...compose.workerIntent, harnessLabel: v })}
              textClassName="text-[13.5px] font-medium text-ink"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Agent count</label>
          <p className="mt-1.5 px-1.5 text-[13.5px] font-medium text-ink tabular-nums">{compose.workerIntent.agentCount}</p>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
            <Wrench className="h-3 w-3" strokeWidth={2} />
            Preset tools
          </label>
          <div className="mt-1.5">
            <EditableChipList
              items={compose.workerIntent.tools}
              onChange={(tools) => update("workerIntent", { ...compose.workerIntent, tools })}
              addLabel="Add tool"
            />
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-border pt-4 text-[11px] text-ink-faint">
        Tools are scoped to the bounded context you selected — this Worker cannot reach outside them.
      </p>
    </div>
  );
}
