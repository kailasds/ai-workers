import { Crown, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LearningPlanData } from "@/lib/types";

export function LearningPlan({ plan }: { plan: LearningPlanData }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-accent" strokeWidth={2} />
            <h3 className="text-[14px] font-bold text-ink">Fast Online Loop</h3>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-soft">{plan.fastLoopSummary}</p>
        </div>
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-4 w-4 text-status-purple" strokeWidth={2} />
            <h3 className="text-[14px] font-bold text-ink">Slow Offline Loop</h3>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-soft">{plan.slowLoopSummary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-card card-hero p-5 text-white">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" strokeWidth={2} />
            <span className="text-[11px] uppercase tracking-wider text-white/70">Champion</span>
          </div>
          <p className="mt-2 text-[20px] font-bold font-display">{plan.championVersion.version}</p>
          <p className="mt-1.5 text-[12.5px] text-white/85 leading-relaxed">{plan.championVersion.summary}</p>
          <Badge variant="onyx" className="mt-3 bg-white/15 text-white">
            {plan.championVersion.evaluationStatus}
          </Badge>
        </div>

        {plan.challengerVersion ? (
          <div className="rounded-card border-2 border-dashed border-status-purple/40 bg-status-purple-soft p-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-status-purple" strokeWidth={2} />
              <span className="text-[11px] uppercase tracking-wider text-status-purple">Challenger</span>
            </div>
            <p className="mt-2 text-[20px] font-bold font-display text-ink">{plan.challengerVersion.version}</p>
            <p className="mt-1.5 text-[12.5px] text-ink-soft leading-relaxed">{plan.challengerVersion.summary}</p>
            <Badge variant="purple" className="mt-3">
              {plan.challengerVersion.evaluationStatus}
            </Badge>
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border-strong p-5 grid place-items-center text-center">
            <p className="text-[12.5px] text-ink-mute">No challenger version proposed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
