import { NavLink, Outlet, useParams, Navigate } from "react-router-dom";
import { Play, Pause, Pencil, MoreHorizontal } from "lucide-react";
import { getWorker } from "@/lib/data";
import { workerStatusColor } from "@/lib/status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "", label: "Overview" },
  { to: "configuration", label: "Configuration" },
  { to: "work", label: "Work" },
  { to: "performance", label: "Performance" },
  { to: "learning", label: "Learning" },
  { to: "audit", label: "Audit" },
];

export default function WorkerLayout() {
  const { workerId } = useParams();
  const worker = getWorker(workerId ?? "");

  if (!worker) return <Navigate to="/workers" replace />;

  return (
    <div className="pb-10">
      <div className="px-8 pt-7 pb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="text-[15px]">{worker.avatarInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[22px] font-medium tracking-[-0.01em] text-ink font-display">{worker.name}</h1>
                <Badge variant={workerStatusColor[worker.status]} dot>
                  {worker.statusLabel}
                </Badge>
                <Badge variant="outline">{worker.version}</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-mute">
                {worker.role} · {worker.department}
              </p>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-soft">{worker.mission}</p>
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

      <div className="px-8">
        <div className="inline-flex items-center gap-1 rounded-full bg-card-sunken p-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to || "."}
              end={tab.to === ""}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-8 items-center justify-center rounded-full px-4 text-[13px] font-medium transition-colors",
                  isActive ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="px-8 mt-5">
        <Outlet context={worker} />
      </div>
    </div>
  );
}
