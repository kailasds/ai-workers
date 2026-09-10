import { Link } from "react-router-dom";
import { Fingerprint, ArrowUpRight, Library, BrainCircuit, ChevronRight } from "lucide-react";
import { useWorker } from "./use-worker";
import { WorkerPurposeCard } from "@/components/shared/worker-purpose-card";
import { WorkerHealth } from "@/components/shared/worker-health";
import { SentinelCard } from "@/components/shared/sentinel-status";
import { ExecutionStepper } from "@/components/shared/execution-stepper";
import { MaturityCard } from "@/components/shared/maturity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWorkerMaturity } from "@/lib/registry/maturity";
import { getLearningSummaryForWorker, getKnowledgeUsageForWorker } from "@/lib/registry/learning-summary";

export default function WorkerOverview() {
  const worker = useWorker();
  const maturity = getWorkerMaturity(worker);
  const learning = getLearningSummaryForWorker(worker.id);
  const knowledgeUsage = getKnowledgeUsageForWorker(worker.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 pb-10">
      <div className="xl:col-span-2 space-y-5">
        <WorkerPurposeCard scope={worker.scope} />

        {worker.currentWork ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{worker.currentWork.title}</CardTitle>
                <p className="mt-1 text-[12.5px] text-ink-mute">Current stage: {worker.currentWork.stage}</p>
              </div>
              <Badge variant="blue" dot>
                {worker.currentWork.status === "in-progress" ? "In Progress" : worker.currentWork.status === "awaiting-approval" ? "Awaiting Approval" : "Paused"}
              </Badge>
            </CardHeader>
            <CardContent>
              {worker.currentWork.stages.length > 0 && (
                <ExecutionStepper steps={worker.currentWork.stages.map((s) => ({ label: s.label, state: s.state }))} />
              )}
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Progress</p>
                  <p className="mt-1 text-[18px] tabular-nums text-ink font-display">{worker.currentWork.progress}%</p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Cost</p>
                  <p className="mt-1 text-[18px] tabular-nums text-ink font-display">${worker.currentWork.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Budget</p>
                  <p className="mt-1 text-[18px] tabular-nums text-ink font-display">${worker.currentWork.budget}</p>
                </div>
              </div>
              <Link
                to="../operations"
                relative="path"
                className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline underline-offset-4"
              >
                View in Operations
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center pt-10">
              <p className="text-[13px] text-ink-mute">No active work assigned right now.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryStat label="Skills" value={worker.skills.length} />
          <SummaryStat label="Agent Mesh" value={worker.agentMesh.length} />
          <SummaryStat label="Knowledge Sources" value={worker.knowledgeSources.length} />
          <SummaryStat label="Work Completed" value={worker.workHistory.length} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-card-sunken text-ink-soft">
              <Fingerprint className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-bold text-ink">Digital Identity</h3>
          </div>
          <div className="mt-4 space-y-2.5">
            <IdentityRow label="Worker ID" value={worker.identity.workerId} mono />
            <IdentityRow label="Environment" value={worker.identity.environment} />
            <IdentityRow label="Tenant" value={worker.identity.tenant} />
            <IdentityRow label="Credential Status" value={worker.identity.credentialStatus} />
            <IdentityRow label="Provisioned" value={worker.identity.createdAt} />
          </div>
        </div>

        <MaturityCard maturity={maturity} />

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-status-blue-soft text-status-blue">
              <Library className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-bold text-ink">Knowledge used</h3>
          </div>
          {knowledgeUsage.measured ? (
            <p className="mt-2.5 text-[12.5px] text-ink-soft">
              {knowledgeUsage.skillCount} Skill{knowledgeUsage.skillCount === 1 ? "" : "s"} · {knowledgeUsage.domainLanguageCount} Domain Language term{knowledgeUsage.domainLanguageCount === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-2.5 text-[12.5px] text-ink-faint">Not measured</p>
          )}
          <Link
            to={learning.knowledgeWorkerId ? `/knowledge?worker=${learning.knowledgeWorkerId}` : "/knowledge"}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline"
          >
            View knowledge
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-status-purple-soft text-status-purple">
              <BrainCircuit className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-bold text-ink">Learning activity</h3>
          </div>
          {learning.measured ? (
            <p className="mt-2.5 text-[12.5px] text-ink-soft leading-relaxed">
              {learning.observations} observation{learning.observations === 1 ? "" : "s"} · {learning.constructs} knowledge construct{learning.constructs === 1 ? "" : "s"} · {learning.candidateDecisions} candidate decision{learning.candidateDecisions === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-2.5 text-[12.5px] text-ink-faint">Not measured</p>
          )}
          <Link
            to={learning.knowledgeWorkerId ? `/learning?worker=${learning.knowledgeWorkerId}` : "/learning"}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline"
          >
            View learning
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        <WorkerHealth health={worker.health} />
        <SentinelCard state={worker.sentinel} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-1 text-[22px] leading-none tabular-nums text-ink font-display">{value}</p>
    </div>
  );
}

function IdentityRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-ink-mute shrink-0">{label}</span>
      <span className={mono ? "text-[11.5px] font-mono text-ink truncate" : "text-[12.5px] text-ink truncate"}>{value}</span>
    </div>
  );
}
