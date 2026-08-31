import { Plug, AlertTriangle } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const permissionTone: Record<string, string> = {
  READ: "bg-status-blue-soft text-status-blue",
  WRITE: "bg-status-amber-soft text-status-amber",
  EXECUTE: "bg-status-purple-soft text-status-purple",
  ADMIN: "bg-status-red-soft text-status-red",
  "CREATE PR": "bg-status-amber-soft text-status-amber",
  "RUN SCAN": "bg-status-purple-soft text-status-purple",
  "RUN PIPELINE": "bg-status-purple-soft text-status-purple",
};

export default function ToolsAccess() {
  const worker = useWorker();

  return (
    <div className="pb-10">
      <ConfigHeader title="Tools & Access" subtitle="Systems this worker can interact with." />

      {worker.tools.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No tools connected for this worker yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worker.tools.map((t) => (
            <div key={t.id} className="rounded-card border border-border bg-card shadow-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-card-sunken text-ink-soft">
                    <Plug className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{t.name}</p>
                    <p className="text-[11.5px] text-ink-mute">{t.category}</p>
                  </div>
                </div>
                <Badge variant={t.connected ? "green" : "neutral"} dot>
                  {t.connected ? "Connected" : "Not connected"}
                </Badge>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {t.permissions.map((p) => (
                  <span
                    key={p}
                    className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-medium tracking-wide", permissionTone[p])}
                  >
                    {p}
                  </span>
                ))}
              </div>

              {t.restriction && (
                <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-status-red">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  {t.restriction}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
