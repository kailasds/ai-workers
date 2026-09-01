import { Check, Clock, Ban } from "lucide-react";
import type { ApprovalMatrixRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const meta: Record<ApprovalMatrixRow["autonomy"], { icon: typeof Check; tone: string; label: string }> = {
  Allowed: { icon: Check, tone: "text-status-green", label: "Allowed" },
  "Approval Required": { icon: Clock, tone: "text-status-amber", label: "Approval Required" },
  Restricted: { icon: Ban, tone: "text-status-red", label: "Restricted" },
};

export function GovernanceMatrix({ rows }: { rows: ApprovalMatrixRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-strong px-5 py-10 text-center">
        <p className="text-[13px] text-ink-mute">No approval matrix configured for this worker yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
        <span>Action</span>
        <span>Autonomy</span>
      </div>
      {rows.map((r) => {
        const m = meta[r.autonomy];
        const Icon = m.icon;
        return (
          <div key={r.id} className="grid grid-cols-[2fr_1fr] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0">
            <span className="text-[13px] text-ink">{r.action}</span>
            <span className={cn("flex items-center gap-1.5 text-[12.5px] font-medium", m.tone)}>
              <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
