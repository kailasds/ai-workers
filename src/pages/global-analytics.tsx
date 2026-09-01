import { PageHeader } from "@/components/shared/page-header";
import { HeroChart } from "@/components/shared/hero-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workers, allWorkHistory } from "@/lib/data";

const costTrend = [36200, 38100, 39400, 40800, 41200, 41900, 42340];
const topWorkers = [...workers].sort((a, b) => b.health.capability - a.health.capability).slice(0, 5);

const certified = allWorkHistory.filter((w) => w.status === "certified-complete").length;
const certificationRate = allWorkHistory.length > 0 ? Math.round((certified / allWorkHistory.length) * 100) : 0;
const totalValue = workers.reduce((n, w) => n + w.governance.budget.valueGenerated, 0);

export default function GlobalAnalytics() {
  return (
    <div className="pb-10">
      <PageHeader title="Workforce Analytics" subtitle="How the entire AI Workforce is performing — cost versus outcome value." />

      <div className="px-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 rounded-card border border-border bg-card shadow-card divide-y sm:divide-y-0 sm:divide-x divide-border">
          <Metric label="Total Workers" value={String(workers.length)} />
          <Metric label="Work Items Completed" value={String(allWorkHistory.length)} />
          <Metric label="Certification Rate" value={`${certificationRate}%`} />
          <Metric label="Value Generated" value={`$${totalValue.toLocaleString()}`} tone="green" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Total Cost — Last 7 Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <HeroChart data={costTrend} labels={["Cycle -6", "-5", "-4", "-3", "-2", "-1", "Now"]} suffix="" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strongest Capability Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topWorkers.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3">
                  <span className="w-4 text-[12px] tabular-nums text-ink-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-ink truncate">{w.name}</p>
                    <p className="text-[11px] text-ink-mute">{w.domain}</p>
                  </div>
                  <span className="text-[13px] tabular-nums font-medium text-status-green">{w.health.capability}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Worker Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-border pb-2 mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
              <span>Worker</span>
              <span>Capability Health</span>
              <span>Cost / Outcome</span>
              <span>Active Work</span>
            </div>
            {workers.map((w) => (
              <div key={w.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 py-2.5 border-b border-border last:border-b-0">
                <span className="text-[12.5px] text-ink truncate">{w.name}</span>
                <span className="text-[12.5px] tabular-nums text-ink-soft">{w.health.capability}%</span>
                <span className="text-[12.5px] tabular-nums text-ink-soft">${w.governance.budget.costPerOutcome}</span>
                <Badge variant="neutral">{w.activeTasks}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className="p-5">
      <p className="text-[11px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={`mt-1.5 text-[28px] leading-none tabular-nums font-display ${tone === "green" ? "text-status-green" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
