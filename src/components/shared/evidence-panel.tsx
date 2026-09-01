import type { ExecutionEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function Block({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1.5">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[12.5px] text-ink-soft">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidencePanel({ event }: { event: ExecutionEvent }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] tabular-nums text-ink-mute">{event.time}</span>
          <Badge variant="outline">{event.actor}</Badge>
        </div>
        <h3 className="mt-2 text-[17px] font-bold text-ink tracking-[-0.01em]">{event.title}</h3>
      </div>

      {event.decisionSummary && (
        <div className="rounded-card bg-accent-soft border border-accent-border p-4">
          <p className="text-[11px] uppercase tracking-wider text-accent-ink mb-1.5">Decision Summary</p>
          <p className="text-[13px] leading-relaxed text-ink">{event.decisionSummary}</p>
        </div>
      )}

      <Block label="Evidence" items={event.evidence} />
      <Block label="Inputs" items={event.inputs} />
      <Block label="Outputs" items={event.outputs} />
      <Block label="Rules Applied" items={event.rulesApplied} />
      <Block label="Policies Applied" items={event.policiesApplied} />
      <Block label="Agents Involved" items={event.agentsInvolved} />

      {event.result && (
        <div className="rounded-card bg-card-sunken p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1.5">Result</p>
          <p className="text-[13px] leading-relaxed text-ink">{event.result}</p>
        </div>
      )}
    </div>
  );
}
