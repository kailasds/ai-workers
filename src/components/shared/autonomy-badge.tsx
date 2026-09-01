import { Badge } from "@/components/ui/badge";
import { autonomyMeta } from "@/lib/status";
import type { AutonomyLevel } from "@/lib/types";

export function AutonomyBadge({ level, className }: { level: AutonomyLevel; className?: string }) {
  const meta = autonomyMeta[level];
  return (
    <Badge variant={meta.color} className={className} dot>
      {meta.label}
    </Badge>
  );
}
