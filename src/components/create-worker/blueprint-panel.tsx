import { useState } from "react";
import {
  UserCircle2,
  Target,
  ListChecks,
  Network,
  Sparkles,
  Plug,
  FileText,
  BookOpen,
  ShieldCheck,
  BadgeCheck,
  BarChart3,
  Wallet,
  Check,
  Info,
  ShieldX,
  ArrowRight,
  ArrowLeft,
  Zap,
  TrendingUp,
  Circle,
  BrainCircuit,
  Package,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { AgentMesh } from "@/components/shared/agent-mesh";
import { GovernanceMatrix } from "@/components/shared/governance-matrix";
import { EditableField, EditableSelect, EditableChipList, AiImpactNote, type SelectOption } from "@/components/shared/editable";
import { draftWorker } from "./script";
import type { ComposeState, SectionId, SectionStatus } from "./types";
import type { AutonomyLevel, DoDRequirement, OperatingMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const worker = draftWorker;

const draftAgentMesh = worker.agentMesh.map((a) => ({ ...a, status: "idle" as const }));

const skillDescriptions: Record<string, string> = Object.fromEntries(worker.skills.map((s) => [s.name, s.description]));

const kpiCategories: {
  id: string;
  label: string;
  icon: typeof BadgeCheck;
  tone: "green" | "blue" | "amber" | "purple";
  metrics: string[];
  priorityMatch: string[];
}[] = [
  { id: "quality", label: "Quality", icon: BadgeCheck, tone: "green", metrics: ["Modernization success rate", "Validation pass rate", "Regression rate"], priorityMatch: ["accuracy"] },
  { id: "productivity", label: "Productivity", icon: Zap, tone: "blue", metrics: ["Modernized units completed", "Average completion time", "Work completed per execution"], priorityMatch: ["speed"] },
  { id: "cost", label: "Cost", icon: Wallet, tone: "amber", metrics: ["Cost per modernization", "Compute usage", "Resource efficiency"], priorityMatch: ["cost"] },
  { id: "reliability", label: "Reliability", icon: ShieldCheck, tone: "purple", metrics: ["Failed executions", "Rework rate", "Human intervention frequency"], priorityMatch: ["risk"] },
  { id: "business", label: "Business Value", icon: TrendingUp, tone: "green", metrics: ["Legacy functionality modernized", "Applications retired", "Estimated engineering effort avoided"], priorityMatch: [] },
];

const toneClasses: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
  purple: "bg-status-purple-soft text-status-purple",
};

const modelOptions: SelectOption[] = [
  { value: "Claude Sonnet 5", label: "Claude Sonnet 5", description: "Balanced reasoning and cost for most transformation work." },
  { value: "Claude Opus 5", label: "Claude Opus 5", description: "Highest capability — best for the most complex reasoning." },
  { value: "Claude Opus 5 (independent)", label: "Claude Opus 5 (independent)", description: "Runs isolated from the primary model for unbiased verification." },
  { value: "Claude Haiku 4.5", label: "Claude Haiku 4.5", description: "Fast and inexpensive — good as a fallback or for simple checks." },
];

const routingOptions: SelectOption[] = [
  { value: "fixed", label: "Fixed Model", description: "Uses the same primary model for every task in this Worker's scope." },
  { value: "adaptive", label: "Adaptive Routing", description: "Routes each task to a model chosen by type, risk, latency and cost." },
];

const memoryScopeOptions: SelectOption[] = [
  { value: "worker", label: "Worker", description: "Memory is private to this Worker — recommended when work may contain client-specific patterns." },
  { value: "session", label: "Session", description: "Memory resets between work assignments." },
  { value: "enterprise", label: "Enterprise", description: "Shared across all Workers in the organization." },
];

const sharedLearningOptions: SelectOption[] = [
  { value: "none", label: "None", description: "Learnings stay private to this Worker." },
  { value: "team", label: "Team", description: "Approved learnings are shared with this Worker's team." },
  { value: "organization", label: "Organization", description: "Approved learnings are shared org-wide." },
];

const operatingModeOptions: SelectOption[] = [
  { value: "propose-only", label: "Propose Only", description: "The Worker proposes changes but never executes them directly." },
  { value: "act-with-approval", label: "Act With Approval", description: "The Worker acts, but high-impact actions always pause for human approval." },
  { value: "act-within-limits", label: "Act Within Limits", description: "The Worker acts independently within pre-approved policy limits." },
];

const deliveryOptions: SelectOption[] = [
  { value: "local-bundle", label: "Local Test Bundle", description: "Package for local testing before anything is shared." },
  { value: "content-store", label: "Content Store", description: "Publish to the enterprise content store for reuse." },
  { value: "deployment-pipeline", label: "Deployment Pipeline", description: "Deliver through the CI/CD pipeline for staged rollout." },
];

const sizeProfileOptions: SelectOption[] = [
  { value: "Small (2 vCPU / 4GB)", label: "Small (2 vCPU / 4GB)", description: "Lightweight tasks, low concurrency." },
  { value: "Medium (4 vCPU / 8GB)", label: "Medium (4 vCPU / 8GB)", description: "Recommended for most transformation workers." },
  { value: "Large (8 vCPU / 16GB)", label: "Large (8 vCPU / 16GB)", description: "High-concurrency or large-context workloads." },
];

interface SectionDef {
  id: SectionId;
  title: string;
  icon: typeof UserCircle2;
  reason?: string;
  wide?: boolean;
}

const sectionDefs: SectionDef[] = [
  { id: "identity", title: "Identity", icon: UserCircle2 },
  { id: "purpose", title: "Purpose & Owned Outcome", icon: Target },
  { id: "responsibilities", title: "Responsibilities", icon: ListChecks },
  { id: "team", title: "Agent Team", icon: Network, reason: "One orchestrator plus one specialist per transformation stage.", wide: true },
  { id: "skills", title: "Skills", icon: Sparkles, reason: "Derived from the modernization scope you described.", wide: true },
  { id: "tools", title: "Tools & Access", icon: Plug },
  { id: "models", title: "Models & Learning", icon: BrainCircuit, reason: "Governed by default — nothing learns or shares without approval.", wide: true },
  { id: "contract", title: "Worker Contract", icon: FileText },
  { id: "knowledge", title: "Knowledge", icon: BookOpen },
  { id: "governance", title: "Governance & Autonomy", icon: ShieldCheck, wide: true },
  { id: "dod", title: "Definition of Done", icon: BadgeCheck, reason: "The worker cannot declare this work complete until every checkpoint passes, with evidence attached.", wide: true },
  { id: "kpis", title: "KPIs", icon: BarChart3 },
  { id: "budget", title: "Budget & Resource Policy", icon: Wallet },
  { id: "deployment", title: "Package & Deployment", icon: Package, wide: true },
];

export function BlueprintPanel({
  status,
  justRevealed,
  autonomy,
  repoChoice,
  priorities,
  compose,
  defaults,
  update,
}: {
  status: Record<SectionId, SectionStatus>;
  justRevealed: SectionId | null;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const suggestedCount = sectionDefs.filter((s) => status[s.id] === "suggested").length;

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border-strong bg-card px-8 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={status.identity === "suggested" ? "" : "bg-card-sunken text-ink-faint"}>
              {status.identity === "suggested" ? worker.avatarInitials : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink truncate">
              {status.identity === "suggested" ? compose.name : "Live Worker Blueprint"}
            </p>
            <p className="text-[11.5px] text-ink-mute">
              {suggestedCount} / {sectionDefs.length} sections drafted
            </p>
          </div>
          <div className="hidden sm:block w-40 shrink-0">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${(suggestedCount / sectionDefs.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 py-6">
        {sectionDefs.map((def) => (
          <Section
            key={def.id}
            def={def}
            status={status[def.id]}
            pulse={justRevealed === def.id}
            autonomy={autonomy}
            repoChoice={repoChoice}
            priorities={priorities}
            compose={compose}
            defaults={defaults}
            update={update}
          />
        ))}
      </div>
    </div>
  );
}

function Section({
  def,
  status,
  pulse,
  autonomy,
  repoChoice,
  priorities,
  compose,
  defaults,
  update,
}: {
  def: SectionDef;
  status: SectionStatus;
  pulse: boolean;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const Icon = def.icon;

  if (status === "pending") {
    return (
      <div
        id={`section-${def.id}`}
        className={cn(
          "rounded-card border border-dashed border-border px-4 py-3 flex items-center gap-2.5 opacity-60",
          def.wide && "md:col-span-2"
        )}
      >
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card-sunken text-ink-faint">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <span className="text-[12.5px] text-ink-faint flex-1">{def.title}</span>
        <span className="text-[10.5px] text-ink-faint">Pending</span>
      </div>
    );
  }

  return (
    <div
      id={`section-${def.id}`}
      className={cn(
        "rounded-card border bg-card shadow-card p-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 scroll-mt-20",
        pulse ? "border-accent-border ring-2 ring-accent/25" : "border-border",
        def.wide && "md:col-span-2"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
        </div>
        <h3 className="text-[13.5px] font-semibold text-ink flex-1">{def.title}</h3>
        <Badge variant="accent">Suggested</Badge>
      </div>
      {def.reason && <p className="mt-1.5 pl-9.5 text-[11px] italic text-ink-mute">{def.reason}</p>}
      <div className="mt-3">
        <SectionBody
          id={def.id}
          autonomy={autonomy}
          repoChoice={repoChoice}
          priorities={priorities}
          compose={compose}
          defaults={defaults}
          update={update}
        />
      </div>
    </div>
  );
}

function SectionBody({
  id,
  autonomy,
  repoChoice,
  priorities,
  compose,
  defaults,
  update,
}: {
  id: SectionId;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  switch (id) {
    case "identity":
      return (
        <div>
          <EditableField
            value={compose.name}
            aiValue={defaults.name}
            onChange={(v) => update("name", v)}
            textClassName="text-[14px] font-medium text-ink"
          />
          <p className="mt-0.5 text-[12px] text-ink-mute">
            {worker.role} · {worker.domain}
          </p>
          <div className="mt-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Accountable Owner</p>
            <EditableField
              value={compose.owner}
              aiValue={defaults.owner}
              onChange={(v) => update("owner", v)}
              textClassName="text-[13px] text-ink"
            />
          </div>
          <div className="mt-2.5">
            <AutonomyBadge level={autonomy} />
          </div>
        </div>
      );

    case "purpose":
      return (
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">
            Worker Objective / Measurable Outcome
          </p>
          <EditableField
            value={compose.objective}
            aiValue={defaults.objective}
            onChange={(v) => update("objective", v)}
            multiline
            textClassName="text-[12.5px] leading-relaxed text-ink-soft"
          />
          <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">
            Accepted Input Boundary
          </p>
          <EditableField
            value={compose.inputBoundary}
            aiValue={defaults.inputBoundary}
            onChange={(v) => update("inputBoundary", v)}
            multiline
            textClassName="text-[12.5px] leading-relaxed text-ink-soft"
          />
        </div>
      );

    case "responsibilities":
      return (
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">The Worker will</p>
            <EditableChipList items={compose.willList} onChange={(items) => update("willList", items)} addLabel="Add capability" chipTone="green" />
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Out of scope</p>
            <EditableChipList items={compose.wontList} onChange={(items) => update("wontList", items)} addLabel="Add boundary" />
          </div>
        </div>
      );

    case "team":
      return <AgentMesh workerName={compose.name} avatarInitials={worker.avatarInitials} nodes={draftAgentMesh} />;

    case "skills":
      return (
        <div>
          <EditableChipList
            items={compose.skills}
            onChange={(items) => update("skills", items)}
            addLabel="Add skill"
            chipTone="green"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {compose.skills
              .filter((s) => skillDescriptions[s])
              .map((s) => (
                <Popover key={s}>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-[10.5px] text-ink-mute hover:text-accent-ink">
                      <Info className="h-2.5 w-2.5" strokeWidth={2} />
                      Why "{s}"?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 text-[12px] leading-relaxed text-ink-soft">
                    <p className="mb-1 text-[11px] font-semibold text-ink">Why this skill?</p>
                    {skillDescriptions[s]}
                  </PopoverContent>
                </Popover>
              ))}
          </div>
        </div>
      );

    case "tools": {
      const bySource = repoChoice ?? "GitHub";
      return (
        <div className="space-y-2.5">
          <div className="rounded-[10px] bg-status-green-soft px-3 py-2 flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-green" strokeWidth={2} />
            <p className="text-[11px] leading-relaxed text-status-green">
              Least privilege applied — no production write access. Source: {bySource}, read-only. Target: feature branch only.
            </p>
          </div>
          <EditableChipList items={compose.tools} onChange={(items) => update("tools", items)} addLabel="Add tool" />
        </div>
      );
    }

    case "models":
      return <ModelsSection compose={compose} defaults={defaults} update={update} />;

    case "contract": {
      const allowed = worker.governance.approvalMatrix.filter((r) => r.autonomy === "Allowed");
      const notAllowed = worker.governance.approvalMatrix.filter((r) => r.autonomy !== "Allowed");
      return (
        <div className="space-y-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Objective</p>
            <p className="text-[12px] text-ink-soft leading-relaxed">{compose.objective}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1 flex items-center gap-1">
                <ArrowRight className="h-2.5 w-2.5 text-status-blue" strokeWidth={2.5} /> Inputs
              </p>
              <ul className="space-y-0.5">
                {worker.responsibility.inputs.slice(0, 4).map((i) => (
                  <li key={i} className="text-[11px] text-ink-soft">{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1 flex items-center gap-1">
                <ArrowLeft className="h-2.5 w-2.5 text-status-green" strokeWidth={2.5} /> Outputs
              </p>
              <ul className="space-y-0.5">
                {worker.responsibility.expectedOutputs.slice(0, 4).map((o) => (
                  <li key={o} className="text-[11px] text-ink-soft">{o}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Execution boundaries</p>
            <ul className="space-y-0.5">
              {allowed.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                  <Check className="h-3 w-3 text-status-green shrink-0" strokeWidth={2.5} />
                  {r.action}
                </li>
              ))}
              {notAllowed.map((r) => (
                <li key={r.id} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                  <ShieldX className="h-3 w-3 text-status-red shrink-0" strokeWidth={2.25} />
                  {r.action} — {r.autonomy}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    case "knowledge":
      return (
        <div className="space-y-1.5">
          {worker.knowledgeSources.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="text-ink-soft truncate">{k.name}</span>
              <Badge variant={k.status === "Stale" ? "amber" : "green"} dot className="shrink-0">
                {k.status}
              </Badge>
            </div>
          ))}
        </div>
      );

    case "governance":
      return <GovernanceSection autonomy={autonomy} compose={compose} defaults={defaults} update={update} />;

    case "dod":
      return <DodSection compose={compose} update={update} />;

    case "kpis":
      return (
        <div className="space-y-2">
          {kpiCategories.map((c) => {
            const highlighted = c.priorityMatch.some((p) => priorities.includes(p));
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-[10px] border px-2.5 py-2",
                  highlighted ? "border-accent-border bg-accent-soft" : "border-border"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className={cn("grid h-5 w-5 place-items-center rounded-full", toneClasses[c.tone])}>
                    <Icon className="h-2.5 w-2.5" strokeWidth={2.25} />
                  </div>
                  <span className="text-[11.5px] font-semibold text-ink">{c.label}</span>
                  {highlighted && <Badge variant="accent">Prioritized</Badge>}
                </div>
                <p className="mt-1 pl-6.5 text-[10.5px] text-ink-mute leading-relaxed">{c.metrics.join(" · ")}</p>
              </div>
            );
          })}
        </div>
      );

    case "budget": {
      const notify = Math.round(compose.monthlyBudget * 0.7);
      const approve = Math.round(compose.monthlyBudget * 0.9);
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[10px] bg-card-sunken px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wider text-ink-mute">Per task max</p>
              <EditableField
                value={`$${compose.perTaskLimit}`}
                aiValue={`$${defaults.perTaskLimit}`}
                onChange={(v) => {
                  const n = Number(v.replace(/[^0-9.]/g, ""));
                  if (!Number.isNaN(n) && n > 0) update("perTaskLimit", n);
                }}
                textClassName="text-[15px] font-semibold text-ink tabular-nums"
              />
            </div>
            <div className="rounded-[10px] bg-card-sunken px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wider text-ink-mute">Monthly max</p>
              <EditableField
                value={`$${compose.monthlyBudget.toLocaleString()}`}
                aiValue={`$${defaults.monthlyBudget.toLocaleString()}`}
                onChange={(v) => {
                  const n = Number(v.replace(/[^0-9.]/g, ""));
                  if (!Number.isNaN(n) && n > 0) update("monthlyBudget", n);
                }}
                textClassName="text-[15px] font-semibold text-ink tabular-nums"
              />
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-ink-soft">
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-status-amber text-status-amber" />70% (${notify.toLocaleString()}) — notify</div>
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-status-red text-status-red" />90% (${approve.toLocaleString()}) — require approval</div>
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-onyx text-onyx" />100% (${compose.monthlyBudget.toLocaleString()}) — pause worker</div>
          </div>
        </div>
      );
    }

    case "deployment":
      return <DeploymentSection compose={compose} defaults={defaults} update={update} />;

    default:
      return null;
  }
}

function ModelsSection({
  compose,
  defaults,
  update,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [showRoutingImpact, setShowRoutingImpact] = useState(false);
  const [showVerifierImpact, setShowVerifierImpact] = useState(false);
  const mc = compose.modelConfig;

  function setModelConfig(patch: Partial<typeof mc>) {
    update("modelConfig", { ...mc, ...patch });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Model Routing</p>
        <EditableSelect
          value={mc.routingMode}
          aiValue={defaults.modelConfig.routingMode}
          options={routingOptions}
          onChange={(v) => {
            setModelConfig({ routingMode: v as ComposeState["modelConfig"]["routingMode"] });
            setShowRoutingImpact(v !== defaults.modelConfig.routingMode);
          }}
        />
        {showRoutingImpact && mc.routingMode !== defaults.modelConfig.routingMode && (
          <AiImpactNote
            message="Adaptive routing introduces multiple model dependencies — cost and evaluation coverage will vary by task instead of staying fixed."
            onKeep={() => setShowRoutingImpact(false)}
            onRevert={() => {
              setModelConfig({ routingMode: defaults.modelConfig.routingMode });
              setShowRoutingImpact(false);
            }}
          />
        )}
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Monthly Budget (est.)</p>
        <EditableField
          value={`$${mc.monthlyBudgetEstimate.toLocaleString()}`}
          aiValue={`$${defaults.modelConfig.monthlyBudgetEstimate.toLocaleString()}`}
          onChange={(v) => {
            const n = Number(v.replace(/[^0-9.]/g, ""));
            if (!Number.isNaN(n) && n > 0) setModelConfig({ monthlyBudgetEstimate: n });
          }}
          textClassName="text-[13px] text-ink"
        />
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Primary Model</p>
        <EditableSelect value={mc.primaryModel} aiValue={defaults.modelConfig.primaryModel} options={modelOptions} onChange={(v) => setModelConfig({ primaryModel: v })} />
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Verifier Model</p>
        <EditableSelect
          value={mc.verifierModel}
          aiValue={defaults.modelConfig.verifierModel}
          options={modelOptions}
          onChange={(v) => {
            setModelConfig({ verifierModel: v });
            setShowVerifierImpact(v !== defaults.modelConfig.verifierModel);
          }}
        />
        {showVerifierImpact && mc.verifierModel !== defaults.modelConfig.verifierModel && (
          <AiImpactNote
            message="Changing the verifier model may affect independent evaluation coverage — it should stay a different model family from the primary."
            onKeep={() => setShowVerifierImpact(false)}
            onRevert={() => {
              setModelConfig({ verifierModel: defaults.modelConfig.verifierModel });
              setShowVerifierImpact(false);
            }}
          />
        )}
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Fallback Model</p>
        <EditableSelect value={mc.fallbackModel} aiValue={defaults.modelConfig.fallbackModel} options={modelOptions} onChange={(v) => setModelConfig({ fallbackModel: v })} />
      </div>

      <div className="lg:col-span-2 mt-1 border-t border-border pt-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Learning</p>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Memory Scope</p>
        <EditableSelect
          value={compose.learningConfig.memoryScope}
          aiValue={defaults.learningConfig.memoryScope}
          options={memoryScopeOptions}
          onChange={(v) => update("learningConfig", { ...compose.learningConfig, memoryScope: v as ComposeState["learningConfig"]["memoryScope"] })}
        />
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Retention Period</p>
        <EditableField
          value={`${compose.learningConfig.retentionDays} days`}
          aiValue={`${defaults.learningConfig.retentionDays} days`}
          onChange={(v) => {
            const n = Number(v.replace(/[^0-9]/g, ""));
            if (!Number.isNaN(n) && n > 0) update("learningConfig", { ...compose.learningConfig, retentionDays: n });
          }}
          textClassName="text-[13px] text-ink"
        />
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Shared Learning</p>
        <EditableSelect
          value={compose.learningConfig.sharedLearning}
          aiValue={defaults.learningConfig.sharedLearning}
          options={sharedLearningOptions}
          onChange={(v) => update("learningConfig", { ...compose.learningConfig, sharedLearning: v as ComposeState["learningConfig"]["sharedLearning"] })}
        />
      </div>

      <div className="flex items-end">
        <p className="text-[11px] text-ink-mute leading-relaxed">
          {compose.learningConfig.sharedLearning === "none"
            ? "Learnings stay private to this Worker until you approve sharing."
            : "Shared learning still requires explicit approval before promotion — nothing is shared silently."}
        </p>
      </div>
    </div>
  );
}

const approvalRuleLabels: Record<OperatingMode, string> = {
  "propose-only": "Every action, since this Worker only proposes and never executes.",
  "act-with-approval": "Production access is not allowed; human approval is required before merge or deployment.",
  "act-within-limits": "The Worker acts independently within the approval matrix below — only actions marked Restricted still require a human.",
};

function GovernanceSection({
  autonomy,
  compose,
  defaults,
  update,
}: {
  autonomy: AutonomyLevel;
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [showModeImpact, setShowModeImpact] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <AutonomyBadge level={autonomy} />
        <span className="text-[11px] text-ink-mute">recommended for this scope</span>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Operating Mode</p>
        <EditableSelect
          value={compose.operatingMode}
          aiValue={defaults.operatingMode}
          options={operatingModeOptions}
          onChange={(v) => {
            update("operatingMode", v as OperatingMode);
            setShowModeImpact(v !== defaults.operatingMode);
          }}
        />
        {showModeImpact && compose.operatingMode !== defaults.operatingMode && (
          <AiImpactNote
            message="Changing Operating Mode may affect the approval workflow, deployment permissions and Sentinel rules for this Worker."
            onKeep={() => setShowModeImpact(false)}
            onRevert={() => {
              update("operatingMode", defaults.operatingMode);
              setShowModeImpact(false);
            }}
          />
        )}
      </div>

      <p className="text-[11.5px] leading-relaxed text-ink-soft">{approvalRuleLabels[compose.operatingMode]}</p>

      <div className="flex flex-wrap gap-1.5">
        {worker.governance.policies.map((p) => (
          <Badge key={p.id} variant="outline">
            {p.name}
          </Badge>
        ))}
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Always Require Approval</p>
        <EditableChipList
          items={compose.alwaysRequireApproval}
          onChange={(items) => update("alwaysRequireApproval", items)}
          addLabel="Add approval rule"
        />
      </div>

      <GovernanceMatrix rows={worker.governance.approvalMatrix} />
    </div>
  );
}

function DodSection({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const allRequirements = compose.dodSections.flatMap((s) => s.requirements);
  const sectionsWithCriteria = compose.dodSections.filter((s) => s.requirements.length > 0).length;

  function removeRequirement(sectionId: string, reqId: string) {
    update(
      "dodSections",
      compose.dodSections.map((s) => (s.id === sectionId ? { ...s, requirements: s.requirements.filter((r) => r.id !== reqId) } : s))
    );
  }

  function addRequirement(sectionId: string, label: string) {
    const newReq: DoDRequirement = { id: `custom-${Date.now()}`, label, status: "pending", evidence: [] };
    update(
      "dodSections",
      compose.dodSections.map((s) => (s.id === sectionId ? { ...s, requirements: [...s.requirements, newReq] } : s))
    );
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-[11px] text-ink-mute">
        <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        AI validation: {sectionsWithCriteria} of {compose.dodSections.length} critical completion sections have criteria defined
        {allRequirements.length > 0 && ` — ${allRequirements.length} checkpoints total`}.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {compose.dodSections.map((s) => (
          <DodSectionCard key={s.id} section={s} onRemove={(reqId) => removeRequirement(s.id, reqId)} onAdd={(label) => addRequirement(s.id, label)} />
        ))}
      </div>
    </div>
  );
}

function DodSectionCard({
  section,
  onRemove,
  onAdd,
}: {
  section: ComposeState["dodSections"][number];
  onRemove: (reqId: string) => void;
  onAdd: (label: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (v) onAdd(v);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="rounded-[10px] border border-border px-3 py-2.5">
      <p className="text-[11.5px] font-semibold text-ink mb-1.5">{section.title}</p>
      <div className="space-y-1.5">
        {section.requirements.map((r) => (
          <div key={r.id} className="group/req flex items-start gap-1.5">
            <span
              className={cn(
                "mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full",
                r.status === "passed" ? "bg-status-green text-white" : "border border-border-strong"
              )}
            >
              {r.status === "passed" && <Check className="h-2 w-2" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] text-ink-soft leading-snug">{r.label}</p>
              {(r.owner || r.adjudicator) && (
                <p className="text-[10px] text-ink-faint">
                  {r.owner && <>Owner: {r.owner}</>}
                  {r.owner && r.adjudicator && " · "}
                  {r.adjudicator && <>Adjudicator: {r.adjudicator}</>}
                </p>
              )}
            </div>
            <button onClick={() => onRemove(r.id)} className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover/req:opacity-100">
              <XIcon className="h-2.5 w-2.5 text-ink-faint hover:text-status-red" strokeWidth={2.5} />
            </button>
          </div>
        ))}
        {section.requirements.length === 0 && <p className="text-[11px] text-ink-faint italic">No criteria yet.</p>}
      </div>
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commit}
          placeholder="New criterion…"
          className="mt-2 w-full rounded-[8px] border border-accent bg-card px-2 py-1 text-[11px] text-ink outline-none"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-ink-mute transition hover:text-accent-ink"
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2.5} /> Add criterion
        </button>
      )}
    </div>
  );
}

function DeploymentSection({
  compose,
  defaults,
  update,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [showDeliveryImpact, setShowDeliveryImpact] = useState(false);
  const d = compose.deployment;

  function setDeployment(patch: Partial<typeof d>) {
    update("deployment", { ...d, ...patch });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Worker Profile</p>
          <EditableField value={d.workerProfile} aiValue={defaults.deployment.workerProfile} onChange={(v) => setDeployment({ workerProfile: v })} textClassName="text-[12.5px] text-ink" />
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Size / Resource Profile</p>
          <EditableSelect value={d.sizeProfile} aiValue={defaults.deployment.sizeProfile} options={sizeProfileOptions} onChange={(v) => setDeployment({ sizeProfile: v })} />
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Delivery Target</p>
          <EditableSelect
            value={d.deliveryTarget}
            aiValue={defaults.deployment.deliveryTarget}
            options={deliveryOptions}
            onChange={(v) => {
              setDeployment({ deliveryTarget: v as ComposeState["deployment"]["deliveryTarget"] });
              setShowDeliveryImpact(v !== defaults.deployment.deliveryTarget);
            }}
          />
          {showDeliveryImpact && d.deliveryTarget !== defaults.deployment.deliveryTarget && (
            <AiImpactNote
              message="Delivering straight to a pipeline or content store skips local verification — make sure sandbox testing has already passed."
              onKeep={() => setShowDeliveryImpact(false)}
              onRevert={() => {
                setDeployment({ deliveryTarget: defaults.deployment.deliveryTarget });
                setShowDeliveryImpact(false);
              }}
            />
          )}
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Deployment Method</p>
          <EditableField value={d.deploymentMethod} aiValue={defaults.deployment.deploymentMethod} onChange={(v) => setDeployment({ deploymentMethod: v })} textClassName="text-[12.5px] text-ink" />
        </div>
      </div>

      <button
        onClick={() => setAdvanced((a) => !a)}
        className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute transition hover:text-ink"
      >
        {advanced ? <ChevronUp className="h-3 w-3" strokeWidth={2.5} /> : <ChevronDown className="h-3 w-3" strokeWidth={2.5} />}
        Advanced
      </button>
      {advanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] bg-card-sunken p-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Runtime</p>
            <EditableField value={d.runtime} aiValue={defaults.deployment.runtime} onChange={(v) => setDeployment({ runtime: v })} textClassName="text-[12px] text-ink" />
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Architecture</p>
            <EditableField value={d.architecture} aiValue={defaults.deployment.architecture} onChange={(v) => setDeployment({ architecture: v })} textClassName="text-[12px] text-ink" />
          </div>
        </div>
      )}
    </div>
  );
}
