import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export default function WorkerBudget() {
  const worker = useWorker();
  const b = worker.budget;
  const remaining = b.monthly - b.used;
  const usedPct = Math.round((b.used / b.monthly) * 100);
  const onTrack = b.projected <= b.monthly;
  const maxBreakdown = Math.max(...b.breakdown.map((x) => x.amount), 1);

  return (
    <div className="pb-10 space-y-5">
      <ConfigHeader title="Worker Budget" subtitle="Execution spending limits for this worker." />

      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-mute">Monthly Budget</p>
              <p className="mt-1.5 text-[32px] leading-none tabular-nums text-ink font-display">
                ${b.monthly.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-mute">Used</p>
              <p className="mt-1.5 text-[32px] leading-none tabular-nums text-ink font-display">
                ${b.used.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-mute">Remaining</p>
              <p className="mt-1.5 text-[32px] leading-none tabular-nums text-status-green font-display">
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Progress value={usedPct} className="h-1.5" />
            <span className="text-[12px] tabular-nums text-ink-mute shrink-0">{usedPct}%</span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[12px] bg-card-sunken px-4 py-3">
            <span className="text-[12.5px] text-ink-soft">
              Projected Monthly Spend: <span className="font-medium text-ink tabular-nums">${b.projected.toLocaleString()}</span>
            </span>
            <Badge variant={onTrack ? "green" : "amber"} dot>
              {onTrack ? "On Track" : "Trending Over"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {b.breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-soft">{item.label}</span>
                  <span className="tabular-nums text-ink font-medium">${item.amount.toLocaleString()}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-card-sunken overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(item.amount / maxBreakdown) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {b.breakdown.length === 0 && <p className="text-[12px] text-ink-faint">No spend recorded yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ControlRow label="Per Task Limit" value={`$${b.perTaskLimit}`} />
            <ControlRow label="Monthly Limit" value={`$${b.monthly.toLocaleString()}`} />
            <ControlRow label="Approval Threshold" value={`$${b.approvalThreshold}`} />
            <div className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5 mt-1">
              <span className="text-[13px] text-ink-soft">Pause worker when budget limit is reached</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className="text-[13px] font-medium tabular-nums text-ink">{value}</span>
    </div>
  );
}
