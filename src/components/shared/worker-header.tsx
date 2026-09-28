import { Play, Pause, Pencil, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutonomyBadge } from "./autonomy-badge";
import { SentinelStatus } from "./sentinel-status";
import { workerStatusColor } from "@/lib/status";
import { dodStatusMeta } from "@/lib/status";
import type { AIWorker } from "@/lib/types";

const ringTone: Record<string, string> = {
  blue: "ring-status-blue/30",
  green: "ring-status-green/30",
  amber: "ring-status-amber/30",
  red: "ring-status-red/30",
  purple: "ring-status-purple/30",
  neutral: "ring-border-strong",
};

export function WorkerHeader({ worker }: { worker: AIWorker }) {
  const dod = dodStatusMeta[worker.definitionOfDone.overallStatus];
  const statusColor = workerStatusColor[worker.status];

  return (
    <div className="border-b border-border bg-card px-8 pt-7 pb-6 m-8 rounded-[16px] shadow-card">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <Avatar className={`h-[52px] w-[52px] shrink-0 ring-4 ${ringTone[statusColor]}`}>
            <AvatarFallback className="text-[16px]">{worker.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink font-display">{worker.name}</h1>
              <Badge variant={statusColor} dot>
                {worker.statusLabel}
              </Badge>
              <Badge variant="outline">{worker.version}</Badge>
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-mute">
              {worker.role} · {worker.department}
            </p>
            <p className="mt-2  text-[13px] leading-relaxed text-ink-soft">{worker.purpose}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AutonomyBadge level={worker.autonomy} />
              <Badge variant={dod.color}>
                <ShieldCheck className="h-3 w-3" strokeWidth={2.25} />
                Definition of Done: {dod.label}
              </Badge>
              <SentinelStatus state={worker.sentinel} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm">
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            Run Worker
          </Button>
          <Button size="sm" variant="secondary">
            <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
            Pause
          </Button>
          <Button size="sm" variant="secondary">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            Edit
          </Button>
          <Button size="icon" variant="ghost" className="border border-border-strong">
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
