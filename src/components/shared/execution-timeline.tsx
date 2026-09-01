import { useState } from "react";
import { ShieldAlert, Bot, Flag, CheckCircle2, PauseCircle, ClipboardCheck } from "lucide-react";
import { SidePanel, SidePanelContent, SidePanelTitle, SidePanelDescription } from "@/components/ui/side-panel";
import { EvidencePanel } from "./evidence-panel";
import type { ExecutionEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeMeta: Record<ExecutionEvent["type"], { icon: typeof Bot; tone: string }> = {
  assignment: { icon: Flag, tone: "bg-status-blue-soft text-status-blue" },
  "agent-start": { icon: Bot, tone: "bg-status-blue-soft text-status-blue" },
  milestone: { icon: CheckCircle2, tone: "bg-status-green-soft text-status-green" },
  validation: { icon: ClipboardCheck, tone: "bg-status-purple-soft text-status-purple" },
  sentinel: { icon: ShieldAlert, tone: "bg-status-red-soft text-status-red" },
  pause: { icon: PauseCircle, tone: "bg-status-amber-soft text-status-amber" },
  completion: { icon: CheckCircle2, tone: "bg-status-green-soft text-status-green" },
};

export function ExecutionTimeline({ events }: { events: ExecutionEvent[] }) {
  const [selected, setSelected] = useState<ExecutionEvent | null>(null);

  if (events.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
        <p className="text-[13px] text-ink-mute">No execution activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      {events.map((event, i) => {
        const meta = typeMeta[event.type];
        const Icon = meta.icon;
        return (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className="flex w-full gap-3.5 text-left group"
          >
            <div className="flex flex-col items-center">
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-105", meta.tone)}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              {i < events.length - 1 && <div className="w-px flex-1 my-1 bg-border" />}
            </div>
            <div className={cn("min-w-0 flex-1 rounded-[10px] -mx-2 px-2 py-1.5 transition-colors group-hover:bg-card-sunken", i < events.length - 1 ? "pb-4" : "pb-1")}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] tabular-nums text-ink-mute">{event.time}</span>
                <span className="text-[12px] font-medium text-ink-mute">{event.actor}</span>
              </div>
              <p className="mt-0.5 text-[13.5px] font-medium text-ink">{event.title}</p>
              {event.decisionSummary && (
                <p className="mt-0.5 text-[12.5px] text-ink-soft line-clamp-1">{event.decisionSummary}</p>
              )}
            </div>
          </button>
        );
      })}

      <SidePanel open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SidePanelContent>
          <SidePanelTitle className="sr-only">Execution event detail</SidePanelTitle>
          <SidePanelDescription className="sr-only">
            Decision evidence and policy trace for the selected execution event.
          </SidePanelDescription>
          {selected && <EvidencePanel event={selected} />}
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
