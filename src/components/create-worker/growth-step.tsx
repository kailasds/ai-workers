import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { EvolutionPath } from "@/components/v2/evolution-path";
import { capabilityLadder } from "@/lib/v2/data";
import { useV2 } from "@/lib/v2/store";
import { cn } from "@/lib/utils";
import type { ComposeState } from "./types";

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-3 flex gap-2">
      {[
        { v: true, text: "Yes" },
        { v: false, text: "No" },
      ].map((o) => (
        <button
          key={o.text}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex h-9 min-w-20 items-center justify-center gap-2 rounded-control border px-4 text-[14px] font-semibold",
            value === o.v ? "border-accent bg-accent-soft text-accent-ink" : "border-border-strong bg-card text-ink-soft hover:bg-card-sunken"
          )}
        >
          <span className={cn("grid h-3.5 w-3.5 place-items-center rounded-full border", value === o.v ? "border-accent" : "border-border-strong")}>
            {value === o.v && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
          </span>
          {o.text}
        </button>
      ))}
    </div>
  );
}

export function GrowthStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const state = useV2();
  const assigned = state.knowledge.filter((k) => k.scope === "assigned");
  const groups = [
    { label: "Skills", items: assigned.filter((k) => k.kind === "skill") },
    { label: "Company knowledge", items: assigned.filter((k) => k.kind === "company") },
    { label: "Rules & safety", items: assigned.filter((k) => k.kind === "rule" || k.kind === "safety") },
  ];

  function toggle(id: string) {
    const set = new Set(compose.assignedKnowledgeIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update("assignedKnowledgeIds", Array.from(set));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-accent-ink">Step 4 of 6</p>
        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.01em] text-ink font-display">What should this Worker know?</h2>
        <p className="mt-1.5 text-[12px] text-ink-mute">This is the knowledge you give the Worker. It can also learn more on its own, if you allow it below.</p>

        <div className="mt-5 space-y-5">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">{g.label}</p>
              <div className="mt-2 divide-y divide-border rounded-control border border-border">
                {g.items.map((k) => (
                  <label key={k.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-card-sunken">
                    <Checkbox className="mt-0.5" checked={compose.assignedKnowledgeIds.includes(k.id)} onCheckedChange={() => toggle(k.id)} />
                    <span>
                      <span className="block text-[14px] font-medium text-ink">{k.title}</span>
                      <span className="block text-[12px] text-ink-mute">{k.summary}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-mute">{compose.assignedKnowledgeIds.length} items selected.</p>
      </div>

      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink font-display">Allow this Worker to learn?</h2>
        <YesNo label="Allow this Worker to learn" value={compose.learningEnabled} onChange={(v) => update("learningEnabled", v)} />
        <p className="mt-3 text-[12px] leading-relaxed text-ink-mute">
          {compose.learningEnabled
            ? "The Worker can identify useful patterns from its work. New learning is reviewed by Worker Sentinel before becoming Gained Knowledge."
            : "The Worker will only use the knowledge you give it."}
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink font-display">Worker Evolution</h2>
        <p className="mt-1 text-[12px] text-ink-mute">Allow this Worker to evolve?</p>
        <YesNo label="Allow this Worker to evolve" value={compose.evolutionEnabled} onChange={(v) => update("evolutionEnabled", v)} />

        {compose.evolutionEnabled && (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <EvolutionPath current={capabilityLadder[0]} upcoming={capabilityLadder.slice(1)} />
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-control border border-border p-3.5">
                <span>
                  <span className="block text-[14px] font-semibold text-ink">Allow automatic evolution</span>
                  <span className="block text-[12px] text-ink-mute">Evolve when Platform Sentinel approves, without asking each time.</span>
                </span>
                <Switch checked={compose.autoEvolve} onCheckedChange={(v) => update("autoEvolve", v)} aria-label="Allow automatic evolution" />
              </label>
              <p className="text-[12px] text-ink-mute">Evolution decisions are governed by Platform Sentinel.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
