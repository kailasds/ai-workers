import { useWorker } from "./use-worker";
import { Sparkline } from "@/components/shared/sparkline";
import { HeroChart } from "@/components/shared/hero-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkerPerformance() {
  const worker = useWorker();
  const hero = worker.kpis[0];

  return (
    <div className="pb-10 space-y-5">
      <div>
        <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink font-display">Performance</h2>
        <p className="mt-1 text-[13px] text-ink-mute">How effectively this AI Worker performs its role.</p>
      </div>

      {worker.kpis.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No performance data recorded for this worker yet.</p>
        </div>
      ) : (
        <>
          {hero && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{hero.label}</CardTitle>
                  <p className="mt-1 text-[12px] text-ink-mute">Target: {hero.targetDirection === "max" ? "≥" : "≤"} {hero.target}{hero.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[40px] leading-none tabular-nums text-ink font-display">
                    {hero.value}
                    <span className="text-[20px] text-ink-mute">{hero.unit}</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <HeroChart
                  data={hero.trend}
                  labels={["7 cycles ago", "6", "5", "4", "3", "2", "Now"]}
                  suffix={hero.unit}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {worker.kpis.slice(1).map((k) => {
              const onTarget = k.targetDirection === "max" ? k.value >= k.target : k.value <= k.target;
              return (
                <div key={k.id} className="rounded-card border border-border bg-card shadow-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{k.label}</p>
                      <p className="mt-1 text-[24px] leading-none tabular-nums text-ink font-display">
                        {k.value}
                        <span className="text-[13px] text-ink-mute">{k.unit}</span>
                      </p>
                    </div>
                    <Badge variant={onTarget ? "green" : "amber"}>{onTarget ? "On target" : "Watch"}</Badge>
                  </div>
                  <div className="mt-2">
                    <Sparkline data={k.trend} width={140} height={32} targetLine={k.target} />
                  </div>
                  <p className="text-[11px] text-ink-mute">
                    Target: {k.targetDirection === "max" ? "≥" : "≤"} {k.target}
                    {k.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
