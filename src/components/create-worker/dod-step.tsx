import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dodGates } from "./script";

export function DodStep() {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Step 4 of 5</p>
      <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Definition of Done</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-mute">
        3 release gates, all gating. A release cannot happen while any of these are below their threshold.
      </p>

      <div className="mt-5 divide-y divide-border rounded-[12px] border border-border">
        {dodGates.map((g) => (
          <div key={g.id} className="flex items-start justify-between gap-4 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-status-red-soft text-status-red">
                <ShieldAlert className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">{g.label}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-mute">{g.description}</p>
              </div>
            </div>
            <Badge variant="red" className="shrink-0">
              Gating
            </Badge>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-ink-faint">
        These thresholds are inherited from the bounded context and cannot be loosened here — only the customer's release owner can
        request a change.
      </p>
    </div>
  );
}
