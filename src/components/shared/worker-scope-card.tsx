import { Check, ArrowRight, ArrowLeft, ShieldX } from "lucide-react";
import type { Responsibility } from "@/lib/types";

export function WorkerScopeCard({ responsibility }: { responsibility: Responsibility }) {
  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Primary Responsibility</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink font-medium">{responsibility.primary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-status-blue" strokeWidth={2} />
            <h3 className="text-[14px] font-bold text-ink">Inputs</h3>
          </div>
          <ul className="space-y-1.5">
            {responsibility.inputs.map((item) => (
              <li key={item} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowLeft className="h-4 w-4 text-status-green" strokeWidth={2} />
            <h3 className="text-[14px] font-bold text-ink">Expected Outputs</h3>
          </div>
          <ul className="space-y-1.5">
            {responsibility.expectedOutputs.map((item) => (
              <li key={item} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 text-status-green shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-card border border-status-red/25 bg-status-red-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldX className="h-4 w-4 text-status-red" strokeWidth={2} />
          <h3 className="text-[14px] font-bold text-ink">Boundaries</h3>
        </div>
        <ul className="space-y-1.5">
          {responsibility.boundaries.map((item) => (
            <li key={item} className="text-[12.5px] text-ink flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-status-red shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
