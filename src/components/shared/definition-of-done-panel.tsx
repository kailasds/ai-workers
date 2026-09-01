import { Check, X as XIcon, Clock3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dodStatusMeta } from "@/lib/status";
import type { DefinitionOfDoneContract } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  green: "card-hero",
  amber: "bg-status-amber-soft border border-status-amber/25",
  red: "bg-status-red-soft border border-status-red/25",
};

export function DefinitionOfDonePanel({ contract }: { contract: DefinitionOfDoneContract }) {
  const allRequirements = contract.sections.flatMap((s) => s.requirements);
  const passed = allRequirements.filter((r) => r.status === "passed").length;
  const total = allRequirements.length;
  const meta = dodStatusMeta[contract.overallStatus];
  const isGreen = contract.overallStatus === "certified-complete";

  return (
    <div className="space-y-5">
      <div className={cn("rounded-card p-6", toneClasses[meta.color], isGreen && "text-white")}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className={cn("text-[11px] uppercase tracking-wider", isGreen ? "text-white/60" : "text-ink-mute")}>
              Definition of Done
            </p>
            <h2 className={cn("mt-1 text-[20px] font-bold tracking-[-0.01em]", isGreen ? "text-white" : "text-ink")}>
              {contract.title}
            </h2>
            <p className={cn("mt-1.5 text-[13px]", isGreen ? "text-white/80" : "text-ink-soft")}>
              The work is not considered complete until every required checkpoint below is satisfied — completion is proof, not opinion.
            </p>
          </div>
          <div className="text-right shrink-0">
            <Badge variant={isGreen ? "onyx" : meta.color} className={cn(isGreen && "bg-white/15 text-white")}>
              <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
              {meta.label.toUpperCase()}
            </Badge>
            <p className={cn("mt-2 text-[22px] leading-none font-bold tabular-nums font-display", isGreen ? "text-white" : "text-ink")}>
              {passed} / {total}
            </p>
            <p className={cn("text-[11px]", isGreen ? "text-white/60" : "text-ink-mute")}>checkpoints passed</p>
          </div>
        </div>
      </div>

      {contract.sections.map((section, i) => {
        const sectionPassed = section.requirements.filter((r) => r.status === "passed").length;
        return (
          <div key={section.id} className="rounded-card border border-border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-[14.5px] font-bold text-ink">
                {i + 1}. {section.title}
              </h3>
              <span className="text-[12px] tabular-nums text-ink-mute">
                {sectionPassed} / {section.requirements.length}
              </span>
            </div>
            <div className="space-y-3">
              {section.requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                      req.status === "passed" && "bg-status-green text-white",
                      req.status === "failed" && "bg-status-red text-white",
                      req.status === "pending" && "border border-border-strong text-ink-faint"
                    )}
                  >
                    {req.status === "passed" && <Check className="h-3 w-3" strokeWidth={3} />}
                    {req.status === "failed" && <XIcon className="h-3 w-3" strokeWidth={3} />}
                    {req.status === "pending" && <Clock3 className="h-2.5 w-2.5" strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[13px]", req.status === "pending" ? "text-ink-mute" : "text-ink font-medium")}>
                      {req.label}
                    </p>
                    {req.evidence.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {req.evidence.map((e) => (
                          <li key={e} className="text-[11.5px] text-ink-mute flex items-start gap-1.5">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-status-green shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
