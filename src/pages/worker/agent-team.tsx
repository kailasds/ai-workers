import { useState } from "react";
import { Bot, X as XIcon, Check } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { AgentDefinition } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusMeta = {
  completed: { variant: "green" as const, label: "Completed" },
  running: { variant: "blue" as const, label: "Running" },
  waiting: { variant: "neutral" as const, label: "Waiting" },
  idle: { variant: "neutral" as const, label: "Idle" },
};

export default function AgentTeam() {
  const worker = useWorker();
  const [selected, setSelected] = useState<AgentDefinition | null>(null);

  return (
    <div className="pb-10">
      <ConfigHeader title="Agent Team" subtitle="Specialized AI agents this worker can orchestrate." />

      {worker.agents.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No agents configured for this worker yet.</p>
        </div>
      ) : (
        <div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 rounded-full bg-accent pl-2 pr-5 py-2 text-white">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-white/15 text-white">{worker.avatarInitials}</AvatarFallback>
              </Avatar>
              <span className="text-[13px] font-medium">{worker.name}</span>
            </div>
            <div className="h-6 w-px bg-border-strong" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {worker.agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="text-left rounded-card border border-border bg-card shadow-card p-4 transition-colors hover:border-border-strong hover:bg-card-sunken"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-status-blue-soft text-status-blue">
                    <Bot className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <Badge variant={statusMeta[a.status].variant} dot>
                    {statusMeta[a.status].label}
                  </Badge>
                </div>
                <p className="mt-3 text-[13px] font-medium text-ink">{a.name}</p>
                <p className="mt-1 text-[11.5px] text-ink-mute line-clamp-2">{a.purpose}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-ink-mute">
                  <span>{a.usageCount} runs</span>
                  <span className="tabular-nums">${a.costPerRun}/run</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.purpose}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Capabilities</p>
                  <ul className="space-y-1.5">
                    {selected.capabilities.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-[13px] text-ink-soft">
                        <Check className="h-3.5 w-3.5 text-status-green shrink-0" strokeWidth={2.5} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {selected.restrictions.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Restrictions</p>
                    <ul className="space-y-1.5">
                      {selected.restrictions.map((r) => (
                        <li key={r} className="flex items-center gap-2 text-[13px] text-ink-soft">
                          <XIcon className="h-3.5 w-3.5 text-status-red shrink-0" strokeWidth={2.5} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 rounded-[12px] bg-card-sunken p-3.5">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Usage</p>
                    <p className="mt-1 text-[15px] tabular-nums text-ink font-display">{selected.usageCount}</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Performance</p>
                    <p className="mt-1 text-[15px] tabular-nums text-ink font-display">{selected.performance}%</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Cost / run</p>
                    <p className="mt-1 text-[15px] tabular-nums text-ink font-display">${selected.costPerRun}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
