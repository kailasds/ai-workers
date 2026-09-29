import { AlertTriangle, Archive, Ban, CheckCircle2, Clock, PauseCircle, Repeat2, ShieldCheck, XCircle, CircleDot, FileEdit, Hand } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Knowledge, ReviewStatus, WorkerStatus } from "@/lib/v2/types";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/** One badge shape for every state: colour + icon + text, never colour alone. */
export function StatusBadge({
  tone,
  icon: Icon,
  children,
  className,
}: {
  tone: BadgeProps["variant"];
  icon?: Icon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant={tone} className={className}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
      {children}
    </Badge>
  );
}

export function knowledgeStatusLabel(k: Knowledge) {
  if (k.status === "revoked") return "Revoked";
  if (k.status === "replaced") return "Replaced";
  if (k.status === "retired") return "Retired";
  if (k.status === "rejected") return "Rejected";
  if (k.status === "under-review") return "Under review";
  if (k.health === "contradictory") return "Contradictory evidence";
  if (k.health === "outdated") return "May be outdated";
  if (k.scope === "platform") return "Trusted";
  if (k.scope === "gained") return "Validated by Worker Sentinel";
  return "Active";
}

export function KnowledgeStatusBadge({ k, className }: { k: Knowledge; className?: string }) {
  const label = knowledgeStatusLabel(k);
  if (k.status === "revoked") return <StatusBadge tone="red" icon={Ban} className={className}>{label}</StatusBadge>;
  if (k.status === "rejected") return <StatusBadge tone="red" icon={XCircle} className={className}>{label}</StatusBadge>;
  if (k.status === "replaced") return <StatusBadge tone="neutral" icon={Repeat2} className={className}>{label}</StatusBadge>;
  if (k.status === "retired") return <StatusBadge tone="neutral" icon={Archive} className={className}>{label}</StatusBadge>;
  if (k.status === "under-review") return <StatusBadge tone="amber" icon={Clock} className={className}>{label}</StatusBadge>;
  if (k.health) return <StatusBadge tone="amber" icon={AlertTriangle} className={className}>{label}</StatusBadge>;
  if (k.scope === "platform") return <StatusBadge tone="green" icon={ShieldCheck} className={className}>{label}</StatusBadge>;
  if (k.scope === "gained") return <StatusBadge tone="green" icon={CheckCircle2} className={className}>{label}</StatusBadge>;
  return <StatusBadge tone="blue" icon={CircleDot} className={className}>{label}</StatusBadge>;
}

export function WorkerStatusBadge({ status, className }: { status: WorkerStatus; className?: string }) {
  if (status === "active") return <StatusBadge tone="green" icon={CircleDot} className={className}>Active</StatusBadge>;
  if (status === "paused") return <StatusBadge tone="neutral" icon={PauseCircle} className={className}>Paused</StatusBadge>;
  return <StatusBadge tone="neutral" icon={FileEdit} className={className}>Draft</StatusBadge>;
}

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  if (status === "needs-review") return <StatusBadge tone="amber" icon={Clock} className={className}>Needs review</StatusBadge>;
  if (status === "approved") return <StatusBadge tone="green" icon={CheckCircle2} className={className}>Approved</StatusBadge>;
  if (status === "held") return <StatusBadge tone="neutral" icon={Hand} className={className}>On hold</StatusBadge>;
  return <StatusBadge tone="red" icon={XCircle} className={className}>Rejected</StatusBadge>;
}
