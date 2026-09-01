import { KeyRound, ShieldAlert, GitBranch, BadgeCheck, Wallet } from "lucide-react";
import { useWorker } from "./use-worker";
import { GovernanceMatrix } from "@/components/shared/governance-matrix";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function CardIconTitle({ icon: Icon, tone, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; tone: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", tone)}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
      <CardTitle>{children}</CardTitle>
    </div>
  );
}

const policyTone: Record<string, "green" | "amber" | "red" | "neutral"> = {
  green: "green",
  amber: "amber",
  red: "red",
  neutral: "neutral",
};

export default function Governance() {
  const worker = useWorker();
  const g = worker.governance;

  return (
    <div className="pb-10 space-y-5">
      <div>
        <h2 className="text-[20px] font-bold tracking-[-0.01em] text-ink font-display">Governance</h2>
        <p className="mt-1 text-[13px] text-ink-mute">
          Governance is not optional configuration — it is built into how this worker operates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardIconTitle icon={KeyRound} tone="bg-status-blue-soft text-status-blue">Identity &amp; Access</CardIconTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GovList title="Access Scope" items={g.accessScope} />
          <GovList title="Environment Permissions" items={g.environmentPermissions} />
          <GovList title="Least Privilege Rules" items={g.leastPrivilegeRules} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardIconTitle icon={ShieldAlert} tone="bg-status-purple-soft text-status-purple">Policies &amp; Guardrails</CardIconTitle>
        </CardHeader>
        <CardContent>
          {g.policies.length === 0 ? (
            <p className="text-[12.5px] text-ink-mute">No policies configured for this worker yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.policies.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-[12px] border border-border px-4 py-3">
                  <span className="text-[13px] text-ink">{p.name}</span>
                  <Badge variant={policyTone[p.tone]}>{p.statusLabel}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <SectionHeading
          icon={GitBranch}
          tone="neutral"
          title="Approval Matrix"
          subtitle="What this worker can do on its own, and what always needs a human."
        />
        <GovernanceMatrix rows={g.approvalMatrix} />
      </div>

      <Card>
        <CardHeader>
          <CardIconTitle icon={BadgeCheck} tone="bg-status-green-soft text-status-green">Evaluation &amp; Certification</CardIconTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-mute">{g.evaluation.suiteName}</p>
            <p className="mt-1 text-[12px] text-ink-mute">Last run {g.evaluation.lastRun}</p>
            <div className="mt-3 flex items-center gap-2">
              <Progress value={g.evaluation.passRate} className="h-1.5" />
              <span className="text-[12px] tabular-nums text-ink-mute shrink-0">{g.evaluation.passRate}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <EvalPill label="LLM Judge" value={g.evaluation.llmJudgeStatus} />
            <EvalPill label="Red Team" value={g.evaluation.redTeamStatus} />
            <EvalPill label="Regression" value={g.evaluation.regressionStatus} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardIconTitle icon={Wallet} tone="bg-status-amber-soft text-status-amber">Budget Boundaries</CardIconTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Stat label="Monthly Budget" value={`$${g.budget.monthly.toLocaleString()}`} />
            <Stat label="Used" value={`$${g.budget.used.toLocaleString()}`} />
            <Stat label="Cost per Outcome" value={`$${g.budget.costPerOutcome}`} />
            <Stat label="Value Generated" value={`$${g.budget.valueGenerated.toLocaleString()}`} tone="green" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Progress value={(g.budget.used / g.budget.monthly) * 100} className="h-1.5" />
            <span className="text-[12px] tabular-nums text-ink-mute shrink-0">
              {Math.round((g.budget.used / g.budget.monthly) * 100)}% used
            </span>
          </div>
          {g.budget.breakdown.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {g.budget.breakdown.map((b) => (
                <span key={b.label} className="rounded-full bg-card-sunken px-3 py-1 text-[11.5px] text-ink-soft">
                  {b.label}: <span className="font-medium text-ink">${b.amount.toLocaleString()}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GovList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">{title}</p>
      {items.length === 0 ? (
        <p className="text-[12px] text-ink-faint">Not yet configured.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-[12.5px] text-ink-soft flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EvalPill({ label, value }: { label: string; value: string }) {
  const tone = value === "Passed" ? "text-status-green" : value === "Not Run" ? "text-ink-faint" : "text-status-amber";
  return (
    <div className="rounded-[12px] border border-border px-3 py-2.5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={cn("mt-1 text-[12.5px] font-semibold", tone)}>{value}</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={cn("mt-1 text-[19px] leading-none tabular-nums font-display", tone === "green" ? "text-status-green" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}
