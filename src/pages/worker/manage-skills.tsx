import { Plus } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const levelTone = {
  Expert: "purple",
  Advanced: "blue",
  Intermediate: "neutral",
} as const;

export default function ManageSkills() {
  const worker = useWorker();

  return (
    <div className="pb-10">
      <ConfigHeader
        title="Worker Skills"
        subtitle="Capabilities this worker can use."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Skill
          </Button>
        }
      />

      {worker.skills.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No skills configured for this worker yet.</p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
          {worker.skills.map((s) => (
            <div key={s.id} className="flex items-center gap-5 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-medium text-ink">{s.name}</p>
                  <Badge variant={levelTone[s.level]}>{s.level}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-ink-mute">{s.scope}</p>
                {s.restrictions && (
                  <p className="mt-1 text-[11.5px] text-status-amber">Restriction: {s.restrictions}</p>
                )}
              </div>
              <div className="hidden sm:block w-48 shrink-0">
                <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Used by</p>
                <p className="mt-0.5 text-[12px] text-ink-soft truncate">{s.usedByAgents.join(", ")}</p>
              </div>
              <div className="w-24 shrink-0 text-right">
                <p className="text-[16px] tabular-nums text-ink font-display">{s.usageCount}</p>
                <p className="text-[10.5px] text-ink-mute">runs</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
