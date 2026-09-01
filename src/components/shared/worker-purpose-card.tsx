import { Target } from "lucide-react";
import type { ScopeDefinition } from "@/lib/types";

export function WorkerPurposeCard({ scope }: { scope: ScopeDefinition }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <Target className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <h3 className="text-[16px] font-bold text-ink">Purpose &amp; Responsibility</h3>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Primary Purpose</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">{scope.primaryPurpose}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Expected Outcome</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">{scope.expectedOutcome}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Bounded Scope</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{scope.boundedScope}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Out of Scope</p>
          <ul className="mt-1 space-y-1">
            {scope.outOfScope.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[12.5px] text-ink-soft">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-status-red shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
