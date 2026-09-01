import { useWorker } from "./use-worker";
import { ExecutionStepper } from "@/components/shared/execution-stepper";
import { ExecutionTimeline } from "@/components/shared/execution-timeline";
import { SentinelCard } from "@/components/shared/sentinel-status";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Operations() {
  const worker = useWorker();
  const cw = worker.currentWork;

  const interventions = worker.executionTimeline.filter((e) => e.type === "sentinel" || e.type === "pause");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 pb-10 min-w-0">
      <div className="space-y-5 min-w-0">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.01em] text-ink font-display">Operations</h2>
          <p className="mt-1 text-[13px] text-ink-mute">Real-time visibility into this worker's activity, decisions and evidence.</p>
        </div>

        {cw && (
          <div className="rounded-card border border-border bg-card shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[15px] font-bold text-ink">{cw.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-mute">Current stage: {cw.stage}</p>
              </div>
              <Badge variant="blue" dot>
                {cw.status === "in-progress" ? "In Progress" : cw.status === "awaiting-approval" ? "Awaiting Approval" : "Paused"}
              </Badge>
            </div>
            {cw.stages.length > 0 && <ExecutionStepper steps={cw.stages.map((s) => ({ label: s.label, state: s.state }))} />}
            <div className="mt-5 flex items-center gap-2">
              <Progress value={cw.progress} className="h-1.5" />
              <span className="text-[12px] tabular-nums text-ink-mute shrink-0">{cw.progress}%</span>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[15px] font-bold text-ink mb-3">Execution Timeline</h3>
          <p className="text-[12px] text-ink-mute mb-3">
            Click any event for its decision summary, evidence and the policies that applied.
          </p>
          <ExecutionTimeline events={worker.executionTimeline} />
        </div>
      </div>

      <div className="space-y-4 min-w-0">
        <SentinelCard state={worker.sentinel} />

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <p className="text-[13px] font-semibold text-ink mb-1">Interventions</p>
          {interventions.length === 0 ? (
            <p className="text-[12px] text-ink-mute">No Sentinel interventions on this worker's current activity.</p>
          ) : (
            <div className="space-y-2.5">
              {interventions.map((e) => (
                <div key={e.id} className="rounded-[10px] bg-status-red-soft px-3 py-2.5">
                  <p className="text-[11px] tabular-nums text-status-red/70">{e.time}</p>
                  <p className="text-[12.5px] font-medium text-ink">{e.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {cw && (
          <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
            <StatRow label="Task Budget" value={`$${cw.cost.toFixed(2)} / $${cw.budget}`} />
            <StatRow label="Agents Involved" value={String(worker.agentMesh.filter((a) => a.status !== "idle").length)} />
            <StatRow label="Policies Applied" value={String(worker.governance.policies.length)} />
            <StatRow label="Evidence Items" value={String(worker.executionTimeline.reduce((n, e) => n + (e.evidence?.length ?? 0), 0))} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[12.5px] text-ink-soft">{label}</span>
      <span className="text-[13px] font-medium tabular-nums text-ink">{value}</span>
    </div>
  );
}
