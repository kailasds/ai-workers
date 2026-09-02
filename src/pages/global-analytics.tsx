import { BarChart3, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
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
      <PageHeader
        title="Workforce Analytics"
        subtitle="How the entire AI Workforce is performing — cost versus outcome value."
        icon={BarChart3}
        tone="green"
      />

      <div className="px-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 rounded-card border border-border bg-card shadow-card divide-y sm:divide-y-0 sm:divide-x divide-border">
          <Metric label="Total Workers" value={String(workers.length)} icon={BarChart3} tone="blue" />
          <Metric label="Work Items Completed" value={String(allWorkHistory.length)} icon={TrendingUp} tone="blue" />
          <Metric label="Certification Rate" value={`${certificationRate}%`} icon={ShieldCheck} tone="purple" />
          <Metric label="Value Generated" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} tone="green" />
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 rounded-[10px] bg-accent-soft px-3 py-2.5 mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
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

const metricTone: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
  purple: "bg-status-purple-soft text-status-purple",
};

function Metric({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "green" | "blue" | "purple";
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-ink-mute">{label}</p>
        {Icon && (
          <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${tone ? metricTone[tone] : "bg-card-sunken text-ink-soft"}`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className={`mt-1.5 text-[28px] leading-none tabular-nums font-display ${tone === "green" ? "text-status-green" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
