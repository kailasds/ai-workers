import { Eye, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { autonomyMeta } from "@/lib/status";
import type { AutonomyLevel } from "@/lib/types";

const icons: Record<AutonomyLevel, typeof Eye> = {
  supervised: Eye,
  guarded: ShieldCheck,
  autonomous: Zap,
};

export function AutonomyBadge({ level, className }: { level: AutonomyLevel; className?: string }) {
  const meta = autonomyMeta[level];
  const Icon = icons[level];
  return (
    <Badge variant={meta.color} className={className}>
      <Icon className="h-3 w-3" strokeWidth={2.25} />
      {meta.label}
    </Badge>
  );
}
