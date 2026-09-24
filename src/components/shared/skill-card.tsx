import { Badge } from "@/components/ui/badge";
import type { SkillV2 } from "@/lib/types";

const evalTone: Record<SkillV2["evalStatus"], "green" | "amber" | "red" | "neutral"> = {
  Passed: "green",
  "Needs Review": "amber",
  Failed: "red",
  "Not Evaluated": "neutral",
};

export function SkillCard({ skill }: { skill: SkillV2 }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13.5px] font-semibold text-ink">{skill.name}</p>
        <Badge variant="outline" className="shrink-0">
          v{skill.version}
        </Badge>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mute">{skill.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant={evalTone[skill.evalStatus]} dot>
          {skill.evalStatus}
        </Badge>
        <Badge variant="neutral">{skill.status}</Badge>
      </div>
      {(skill.linkedTools.length > 0 || skill.linkedSpecs.length > 0) && (
        <div className="mt-3 pt-3 border-t border-border space-y-1 text-[11px] text-ink-mute">
          {skill.linkedTools.length > 0 && <p>Tools: {skill.linkedTools.join(", ")}</p>}
          {skill.linkedSpecs.length > 0 && <p>Specs: {skill.linkedSpecs.join(", ")}</p>}
        </div>
      )}
    </div>
  );
}
