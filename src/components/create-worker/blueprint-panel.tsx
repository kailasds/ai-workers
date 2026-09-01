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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { AgentMesh } from "@/components/shared/agent-mesh";
import { GovernanceMatrix } from "@/components/shared/governance-matrix";
import { draftWorker } from "./script";
import type { SectionId, SectionStatus } from "./types";
import type { AutonomyLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const worker = draftWorker;

const draftAgentMesh = worker.agentMesh.map((a) => ({ ...a, status: "idle" as const }));

const skillGroups = [
  { title: "Legacy System Analysis", ids: ["sk-1", "sk-2", "sk-5"] },
  { title: "Modernization Engineering", ids: ["sk-3", "sk-4", "sk-6"] },
  { title: "Validation", ids: ["sk-7", "sk-8"] },
];

const willList = [
  "Analyze COBOL source code",
  "Understand JCL execution flows",
  "Analyze copybooks",
  "Extract business rules",
  "Identify data dependencies",
  "Design the target Java architecture",
  "Generate the Java implementation",
  "Generate tests",
  "Validate behavioral equivalence",
  "Reconcile source and target outputs",
  "Generate evidence of completion",
];

const wontList = [
  ...worker.scope.outOfScope,
  "Perform irreversible infrastructure changes",
  "Access systems it does not require",
];

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
  { id: "contract", title: "Worker Contract", icon: FileText },
  { id: "knowledge", title: "Knowledge", icon: BookOpen },
  { id: "governance", title: "Governance & Autonomy", icon: ShieldCheck, wide: true },
  { id: "dod", title: "Definition of Done", icon: BadgeCheck, reason: "The worker cannot declare this work complete until every checkpoint passes, with evidence attached." },
  { id: "kpis", title: "KPIs", icon: BarChart3 },
  { id: "budget", title: "Budget & Resource Policy", icon: Wallet },
];

export function BlueprintPanel({
  status,
  justRevealed,
  autonomy,
  repoChoice,
  priorities,
}: {
  status: Record<SectionId, SectionStatus>;
  justRevealed: SectionId | null;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
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
              {status.identity === "suggested" ? worker.name : "Live Worker Blueprint"}
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
}: {
  def: SectionDef;
  status: SectionStatus;
  pulse: boolean;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
}) {
  const Icon = def.icon;

  if (status === "pending") {
    return (
      <div
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
      className={cn(
        "rounded-card border bg-card shadow-card p-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
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
        <SectionBody id={def.id} autonomy={autonomy} repoChoice={repoChoice} priorities={priorities} />
      </div>
    </div>
  );
}

function SectionBody({
  id,
  autonomy,
  repoChoice,
  priorities,
}: {
  id: SectionId;
  autonomy: AutonomyLevel;
  repoChoice: string | null;
  priorities: string[];
}) {
  switch (id) {
    case "identity":
      return (
        <div>
          <p className="text-[14px] font-medium text-ink">{worker.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-mute">
            {worker.role} · {worker.domain}
          </p>
          <div className="mt-2">
            <AutonomyBadge level={autonomy} />
          </div>
        </div>
      );

    case "purpose":
      return (
        <div>
          <p className="text-[12.5px] leading-relaxed text-ink-soft">{worker.scope.primaryPurpose}</p>
          <p className="mt-2 text-[11.5px] text-ink-mute">
            <span className="font-medium text-ink">Owns:</span> {worker.scope.expectedOutcome}
          </p>
        </div>
      );

    case "responsibilities":
      return (
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">The Worker will</p>
            <ul className="space-y-1">
              {willList.slice(0, 6).map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
              <li className="text-[11px] text-ink-faint pl-4.5">+{willList.length - 6} more</li>
            </ul>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Out of scope</p>
            <ul className="space-y-1">
              {wontList.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                  <ShieldX className="mt-0.5 h-3 w-3 shrink-0 text-status-red" strokeWidth={2.25} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "team":
      return <AgentMesh workerName={worker.name} avatarInitials={worker.avatarInitials} nodes={draftAgentMesh} />;

    case "skills":
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {skillGroups.map((g) => {
            const items = worker.skills.filter((s) => g.ids.includes(s.id));
            return (
              <div key={g.title}>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">{g.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <Popover key={s.id}>
                      <PopoverTrigger asChild>
                        <button>
                          <Badge variant="green" className="cursor-pointer hover:bg-status-green/20">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            {s.name}
                            <Info className="h-2.5 w-2.5 opacity-60" strokeWidth={2} />
                          </Badge>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 text-[12px] leading-relaxed text-ink-soft">
                        <p className="mb-1 text-[11px] font-semibold text-ink">Why this skill?</p>
                        {s.description}
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>
            );
          })}
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
          <div className="flex flex-wrap gap-1.5">
            {worker.tools.map((t) => (
              <Badge key={t.id} variant="outline" title={t.restriction}>
                {t.name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    case "contract": {
      const allowed = worker.governance.approvalMatrix.filter((r) => r.autonomy === "Allowed");
      const notAllowed = worker.governance.approvalMatrix.filter((r) => r.autonomy !== "Allowed");
      return (
        <div className="space-y-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Objective</p>
            <p className="text-[12px] text-ink-soft leading-relaxed">{worker.scope.primaryPurpose}</p>
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

    case "governance": {
      const meta = { supervised: "Supervised", guarded: "Guarded / Supervised", autonomous: "Autonomous" }[autonomy];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AutonomyBadge level={autonomy} />
            <span className="text-[11px] text-ink-mute">recommended for this scope</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            {meta}: production access is not allowed; human approval is required before merge or deployment.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {worker.governance.policies.map((p) => (
              <Badge key={p.id} variant="outline">
                {p.name}
              </Badge>
            ))}
          </div>
          <GovernanceMatrix rows={worker.governance.approvalMatrix} />
        </div>
      );
    }

    case "dod":
      return (
        <div className="space-y-1.5">
          {worker.definitionOfDone.sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-[8px] bg-card-sunken px-2.5 py-1.5">
              <span className="text-[12px] text-ink-soft">{s.title}</span>
              <Badge variant="red">{s.requirements.length} REQUIRED</Badge>
            </div>
          ))}
        </div>
      );

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
      const b = worker.governance.budget;
      const notify = Math.round(b.monthly * 0.7);
      const approve = Math.round(b.monthly * 0.9);
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[10px] bg-card-sunken px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wider text-ink-mute">Per task max</p>
              <p className="text-[15px] font-semibold text-ink tabular-nums">${b.perTaskLimit}</p>
            </div>
            <div className="rounded-[10px] bg-card-sunken px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wider text-ink-mute">Monthly max</p>
              <p className="text-[15px] font-semibold text-ink tabular-nums">${b.monthly.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-ink-soft">
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-status-amber text-status-amber" />70% (${notify.toLocaleString()}) — notify</div>
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-status-red text-status-red" />90% (${approve.toLocaleString()}) — require approval</div>
            <div className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-onyx text-onyx" />100% (${b.monthly.toLocaleString()}) — pause worker</div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
