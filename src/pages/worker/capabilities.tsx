import { Plug, AlertTriangle } from "lucide-react";
import { useWorker } from "./use-worker";
import { SkillCard } from "@/components/shared/skill-card";
import { AgentMesh } from "@/components/shared/agent-mesh";
import { cn } from "@/lib/utils";

const permissionTone: Record<string, string> = {
  Read: "bg-status-blue-soft text-status-blue",
  Write: "bg-status-amber-soft text-status-amber",
  Execute: "bg-status-purple-soft text-status-purple",
};

export default function Capabilities() {
  const worker = useWorker();

  return (
    <div className="pb-10 space-y-8">
      <section>
        <h2 className="text-[16px] font-bold text-ink mb-1">Skills</h2>
        <p className="text-[12.5px] text-ink-mute mb-3.5">Reusable, versioned capabilities this worker draws on.</p>
        {worker.skills.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong px-5 py-10 text-center">
            <p className="text-[13px] text-ink-mute">No skills configured for this worker yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {worker.skills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[16px] font-bold text-ink mb-1">Agent Mesh</h2>
        <p className="text-[12.5px] text-ink-mute mb-3.5">The specialist agents this worker orchestrates to carry out its work.</p>
        <AgentMesh workerName={worker.name} avatarInitials={worker.avatarInitials} nodes={worker.agentMesh} />
      </section>

      <section>
        <h2 className="text-[16px] font-bold text-ink mb-1">Tools &amp; System Access</h2>
        <p className="text-[12.5px] text-ink-mute mb-3.5">Approved tools and enterprise systems this worker can use.</p>
        {worker.tools.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong px-5 py-10 text-center">
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
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {t.permissions.map((p) => (
                    <span key={p} className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-medium tracking-wide", permissionTone[p])}>
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
      </section>
    </div>
  );
}
