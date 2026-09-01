import { useState } from "react";
import { Bot, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { AgentMeshNode } from "@/lib/types";

const statusMeta = {
  completed: { variant: "green" as const, label: "Completed" },
  running: { variant: "blue" as const, label: "Running" },
  waiting: { variant: "neutral" as const, label: "Waiting" },
  idle: { variant: "neutral" as const, label: "Idle" },
};

export function AgentMesh({
  workerName,
  avatarInitials,
  nodes,
}: {
  workerName: string;
  avatarInitials: string;
  nodes: AgentMeshNode[];
}) {
  const [selected, setSelected] = useState<AgentMeshNode | null>(null);
  const orchestrator = nodes.find((n) => n.isOrchestrator);
  const specialists = nodes.filter((n) => !n.isOrchestrator);

  if (nodes.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
        <p className="text-[13px] text-ink-mute">No agent mesh configured for this worker yet.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-[12px] text-ink-mute">
        The Worker owns the outcome. The Orchestrator sequences the specialist agents that carry out the work.
      </p>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2.5 rounded-full bg-accent pl-2 pr-5 py-2 text-white">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-white/15 text-white">{avatarInitials}</AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-semibold">{workerName}</span>
          <Badge variant="onyx">Owner</Badge>
        </div>
        <div className="h-6 w-px bg-border-strong" />

        {orchestrator && (
          <>
            <button
              onClick={() => setSelected(orchestrator)}
              className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-1.5 transition hover:bg-card-sunken"
            >
              <Crown className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
              <span className="text-[12.5px] font-semibold text-ink">{orchestrator.name}</span>
              <Badge variant={statusMeta[orchestrator.status].variant} dot>
                {statusMeta[orchestrator.status].label}
              </Badge>
            </button>
            <div className="h-6 w-px bg-border-strong" />
          </>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {specialists.map((a) => (
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
              <p className="mt-1 text-[11.5px] text-ink-mute line-clamp-2">{a.role}</p>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.role}</DialogDescription>
              </DialogHeader>
              <p className="text-[13px] leading-relaxed text-ink-soft">{selected.description}</p>
              <div className="mt-4">
                <Badge variant={statusMeta[selected.status].variant} dot>
                  {statusMeta[selected.status].label}
                </Badge>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
