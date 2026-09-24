import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  FileText,
  Brain,
  ClipboardCheck,
  Package,
  History,
  Server,
  Database,
  FileStack,
  Users2,
  Layers,
  Link2,
  RefreshCw,
  Clock,
  Cpu,
  CheckCircle2,
  Ban,
  FileCode2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FacetBadge } from "@/components/shared/facet-badge";
import { workerDetail } from "@/lib/registry-data";
import { cn } from "@/lib/utils";

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function WorkerPackageDetail() {
  useParams();
  const w = workerDetail;
  const [tab, setTab] = useState("package");
  const [packageOpen, setPackageOpen] = useState<string | null>("intent");

  function jumpToPackageSection(id: string) {
    setTab("package");
    setPackageOpen(id);
  }

  return (
    <div className="pb-12">
      <div className="px-8 pt-6">
        <Link to="/workers" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-ink hover:underline underline-offset-2">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Worker Registry
        </Link>
      </div>
      <PageHeader
        title={w.title}
        subtitle={w.subtitle}
        tone="accent"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setTab("runs")}>
              <History className="h-3.5 w-3.5" strokeWidth={1.9} />
              View runs
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTab("runtimes")}>
              <Server className="h-3.5 w-3.5" strokeWidth={1.9} />
              View runtimes
            </Button>
          </>
        }
      />

      <div className="px-8 grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5 items-start">
        {/* Persistent summary rail */}
        <div className="space-y-5 xl:sticky xl:top-6">
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="accent">{w.workerType}</Badge>
              <Badge variant="neutral">Revision {w.revision}</Badge>
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-ink-mute">Bounded context</p>
            <p className="text-[13px] font-medium text-ink">{w.boundedContext}</p>

            <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-[12.5px]">
              <FactRow label="Owner" value={w.owner} />
              <FactRow label="Readiness check" value={w.readinessCheck} />
              <FactRow label="Runtime" value={w.runtime} />
              <FactRow label="Last outcome" value={w.lastOutcome} tone={w.lastOutcome === "Not met" ? "red" : "green"} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-mute">{w.openException}</p>
          </div>

          <PackageHeroCard w={w} onJumpTo={jumpToPackageSection} />
        </div>

        {/* Tabbed content */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="package">Package</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="brain">Worker Brain activity</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge & learning</TabsTrigger>
            <TabsTrigger value="sentinel">Sentinel</TabsTrigger>
            <TabsTrigger value="runtimes">Runtimes</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="package">
            <PackagePanel open={packageOpen} setOpen={setPackageOpen} />
          </TabsContent>
          <TabsContent value="runs">
            <RunsPanel />
          </TabsContent>
          <TabsContent value="brain">
            <BrainActivityPanel />
          </TabsContent>
          <TabsContent value="knowledge">
            <KnowledgePanel />
          </TabsContent>
          <TabsContent value="sentinel">
            <SentinelPanel />
          </TabsContent>
          <TabsContent value="runtimes">
            <RuntimesPanel />
          </TabsContent>
          <TabsContent value="delivery">
            <DeliveryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FactRow({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-mute">{label}</span>
      <span className={cn("font-semibold text-right", tone === "red" ? "text-status-red" : tone === "green" ? "text-status-green" : "text-ink")}>{value}</span>
    </div>
  );
}

function PackageHeroCard({ w, onJumpTo }: { w: typeof workerDetail; onJumpTo: (id: string) => void }) {
  const rows = [
    { id: "intent", icon: FileText, title: "Worker intent", detail: w.package.intent.summary },
    { id: "brain", icon: Brain, title: "Worker Brain", detail: `${w.package.brain.skills} skills · ${w.package.brain.languages} DSLs · ${w.package.brain.evals} EVALs` },
    { id: "dod", icon: ClipboardCheck, title: "Definition of Done", detail: `${w.package.dodCount} release gates` },
    { id: "autonomy", icon: ShieldCheck, title: "Autonomy", detail: w.package.autonomy },
  ];

  return (
    <div className="rounded-card overflow-hidden border border-border shadow-float">
      <div className="card-hero p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
            <Package className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">Revision {w.revision}</span>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-white/60">Worker package</p>
        <p className="mt-1 text-[16px] font-bold leading-snug tracking-[-0.01em] font-display">{w.package.intent.summary}</p>
      </div>

      <div className="bg-card p-2 divide-y divide-border">
        {rows.map((row) => (
          <button
            key={row.id}
            onClick={() => onJumpTo(row.id)}
            className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-card-sunken"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
              <row.icon className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">{row.title}</p>
              <p className="truncate text-[11px] text-ink-mute">{row.detail}</p>
            </div>
            <ChevronRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <h3 className="text-[14.5px] font-bold text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[12px] text-ink-mute">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PackagePanel({ open, setOpen }: { open: string | null; setOpen: (id: string | null) => void }) {
  const w = workerDetail;

  const sections: {
    id: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    status: string;
    detail: React.ReactNode;
  }[] = [
    {
      id: "intent",
      icon: FileText,
      title: "Worker intent",
      status: `${w.package.intent.procedureStages} stages`,
      detail: (
        <>
          <p className="text-[13px] font-medium text-ink">{w.package.intent.summary}</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{w.package.intent.outcome}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {w.operatingProcedure.map((s) => (
              <div key={s.step} className="rounded-[10px] bg-card-sunken p-3">
                <p className="text-[10px] font-semibold text-accent-ink">Step {s.step}</p>
                <p className="mt-0.5 text-[12.5px] font-semibold text-ink">{s.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-mute">{s.description}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "brain",
      icon: Brain,
      title: "Worker Brain",
      status: `${w.package.brain.skills} skills · ${w.package.brain.languages} DSLs · ${w.package.brain.evals} EVALs`,
      detail: (
        <div className="flex flex-wrap gap-2">
          <FacetBadge facet="skills" value={w.package.brain.skills} />
          <FacetBadge facet="languages" value={w.package.brain.languages} />
          <FacetBadge facet="evals" value={w.package.brain.evals} />
          <Badge variant="green" dot>
            {w.package.brain.sentinel}
          </Badge>
        </div>
      ),
    },
    {
      id: "dod",
      icon: ClipboardCheck,
      title: "Definition of Done",
      status: `${w.package.dodCount} criteria`,
      detail: <FacetBadge facet="dod" value={`${w.package.dodCount} criteria`} className="text-[13px] px-2.5 py-1.5" />,
    },
    {
      id: "autonomy",
      icon: ShieldCheck,
      title: "Autonomy",
      status: w.package.autonomy,
      detail: <p className="text-[15px] font-semibold text-ink">{w.package.autonomy}</p>,
    },
    {
      id: "packaged",
      icon: Package,
      title: "Packaged for",
      status: w.package.packagedRuntime,
      detail: <p className="text-[13px] font-medium text-ink">{w.package.packagedRuntime}</p>,
    },
    {
      id: "source",
      icon: ExternalLink,
      title: "Generated source",
      status: "View path",
      detail: (
        <a href="#" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-ink hover:underline underline-offset-2 break-all">
          {w.package.sourcePath}
          <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2} />
        </a>
      ),
    },
  ];

  return (
    <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border overflow-hidden">
      {sections.map((section) => {
        const isOpen = open === section.id;
        return (
          <div key={section.id}>
            <button
              onClick={() => setOpen(isOpen ? null : section.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-card-sunken"
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
              )}
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
                <section.icon className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <span className="flex-1 text-[13.5px] font-bold text-ink">{section.title}</span>
              <span className="hidden sm:block max-w-[45%] truncate text-[11.5px] font-medium text-ink-mute">{section.status}</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pl-[56px] animate-in fade-in-0 slide-in-from-top-1 duration-150">{section.detail}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[18px] leading-none font-bold tabular-nums text-ink font-display">{value}</p>
      <p className="mt-0.5 text-[10.5px] text-ink-mute">{label}</p>
    </div>
  );
}

function RunsPanel() {
  const w = workerDetail;
  return (
    <div className="space-y-5">
      <Card title="Runs" subtitle="Active work and its Worker-owned Definition of Done verdict.">
        <div className="rounded-card border border-border overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                <th className="px-3 py-2.5 font-semibold">Run</th>
                <th className="px-3 py-2.5 font-semibold">Converted</th>
                <th className="px-3 py-2.5 font-semibold">Verdict</th>
                <th className="px-3 py-2.5 font-semibold">Finished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {w.runs.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink">{r.id}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-ink-soft">
                      <Badge variant="neutral">{r.convertedFrom}</Badge>
                      <ArrowRight className="h-3 w-3 text-ink-faint" strokeWidth={2} />
                      <Badge variant="blue">{r.convertedTo}</Badge>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={r.verdict === "Met" ? "green" : "red"} dot>
                      {r.verdict}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-ink-mute">{fmt(r.finishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {w.runs[0].criteria.length > 0 && (
        <Card title="Latest run — per-criterion verdict" subtitle={w.runs[0].id}>
          <div className="space-y-3">
            {w.runs[0].criteria.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-3 rounded-[10px] bg-card-sunken px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-[12.5px] text-ink">
                  {c.verdict === "pass" ? (
                    <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2.5} />
                  ) : (
                    <X className="h-3.5 w-3.5 text-status-red" strokeWidth={2.5} />
                  )}
                  {c.label}
                </span>
                <span className="tabular-nums text-[12px] font-medium text-ink-mute">
                  {c.score} against {c.threshold}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Runs and routing" subtitle="Did routing to cheaper models hold up.">
        <div className="rounded-card border border-border overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                <th className="px-3 py-2.5 font-semibold">Tier</th>
                <th className="px-3 py-2.5 font-semibold text-right">Steps</th>
                <th className="px-3 py-2.5 font-semibold text-right">Runs that used it</th>
                <th className="px-3 py-2.5 font-semibold text-right">Met their bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {w.routing.map((r) => (
                <tr key={r.tier}>
                  <td className="px-3 py-2.5 font-medium text-ink">{r.tier}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink">{r.steps}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink">{r.runsUsed}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink-mute">{r.metBar === null ? "—" : `${r.metBar}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "blue" | "purple" | "amber" | "green";
}) {
  const toneClass: Record<string, string> = {
    blue: "bg-status-blue-soft text-status-blue",
    purple: "bg-status-purple-soft text-status-purple",
    amber: "bg-status-amber-soft text-status-amber",
    green: "bg-status-green-soft text-status-green",
  };
  return (
    <div className="rounded-[10px] border border-border bg-card-sunken/60 p-3">
      <div className={cn("grid h-7 w-7 place-items-center rounded-full", toneClass[tone])}>
        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      </div>
      <p className="mt-2 truncate text-[16px] leading-none font-bold tabular-nums text-ink font-display">{value}</p>
      <p className="mt-1 text-[10.5px] text-ink-mute">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-card-sunken/60 p-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-card text-ink-soft">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">{label}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{value}</p>
      </div>
    </div>
  );
}

function BrainActivityPanel() {
  const b = workerDetail.brainActivity;
  return (
    <Card title="Worker Brain activity" subtitle="What this Worker's GBrain has done, in the order it did it.">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile label="Records" value={b.records} icon={Database} tone="blue" />
        <StatTile label="Documents" value={b.documents} icon={FileStack} tone="purple" />
        <StatTile label="Entities" value={b.entities ?? "Not reported"} icon={Users2} tone="amber" />
        <StatTile label="Passages" value={b.passages} icon={Layers} tone="green" />
        <StatTile label="Links" value={b.links} icon={Link2} tone="blue" />
        <StatTile label="Timeline entries" value={b.timelineEntries} icon={History} tone="purple" />
      </div>
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <InfoRow icon={RefreshCw} label="When it consolidates" value={b.consolidatesAfter} />
        <InfoRow icon={Clock} label="Last pass" value={b.lastPass} />
        <InfoRow icon={Database} label="Near memory" value={b.nearMemory} />
      </div>
    </Card>
  );
}

function KnowledgePanel() {
  const k = workerDetail.knowledgeLearning;
  return (
    <div className="space-y-5">
      <Card title="Memory engine" subtitle="This Worker's own brain, asked directly.">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Engine" value={k.engine} icon={Cpu} tone="purple" />
          <StatTile label="Status" value={k.status} icon={CheckCircle2} tone="green" />
          <StatTile label="Documents" value={k.documents} icon={FileStack} tone="blue" />
        </div>
      </Card>

      <Card title="What it compounds" subtitle="Many runs become one thing it knows. Not everything is allowed to.">
        <div className="space-y-2">
          <InfoRow icon={RefreshCw} label="Becomes knowledge after" value={k.becomesKnowledgeAfter} />
          <InfoRow icon={Clock} label="Recalled without asking" value={k.recalledWithoutAsking} />
          <InfoRow icon={FileCode2} label="Skills" value={k.skillsRule} />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[12px] border border-status-green/20 bg-status-green-soft/25 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-status-green">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              May become standing knowledge
            </p>
            <ul className="space-y-1.5 text-[12px] text-ink-soft">
              {k.mayBecomeStanding.map((i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2.5} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[12px] border border-status-red/20 bg-status-red-soft/25 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-status-red">
              <Ban className="h-3.5 w-3.5" strokeWidth={2} />
              Never does
            </p>
            <ul className="space-y-1.5 text-[12px] text-ink-soft">
              {k.neverDoes.map((i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <X className="mt-0.5 h-3 w-3 shrink-0 text-status-red" strokeWidth={2.5} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Memory" subtitle="What this Worker has learned from its own runs.">
        <div className="space-y-3">
          {k.memoryEntries.map((m) => (
            <div key={m.id} className="rounded-[10px] bg-card-sunken p-3.5">
              <p className="text-[12px] leading-relaxed text-ink-soft">{m.summary}</p>
              <p className="mt-1.5 text-[10.5px] text-ink-faint">episodic · worker · {m.age}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SentinelPanel() {
  const s = workerDetail.sentinel;
  return (
    <div className="space-y-5">
      <Card title="AI Sentinel" subtitle="Configured authority and observed supervision are separate evidence.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Configured posture</p>
            <Badge variant="green" dot>
              <ShieldCheck className="h-3 w-3" strokeWidth={2.25} />
              {s.configuredPosture}
            </Badge>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Last observed decision</p>
            <Badge variant="neutral">{s.lastObservedDecision}</Badge>
          </div>
        </div>
      </Card>

      <Card title="Policy">
        <div className="space-y-2.5 text-[12.5px]">
          <FactRow label="Mode" value={s.mode} />
          <FactRow label="What it checks" value={s.checks} />
          <FactRow label="Who it tells" value={s.tells} />
          <FactRow label="On contradiction" value={s.onContradiction} />
          <FactRow label="Held for" value={s.heldFor} />
          <FactRow label="Recall budget" value={s.recallBudget} />
          <FactRow label="On overflow" value={s.onOverflow} />
          <FactRow label="Who may stop" value={s.whoMayStop} />
          <FactRow label="Furthest it may go" value={s.furthestItMayGo} />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Nothing it learns may change</p>
            <div className="flex flex-wrap gap-1.5">
              {s.neverChanges.map((i) => (
                <Badge key={i} variant="purple">
                  <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {i}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Whatever it concludes, it never</p>
            <ul className="space-y-1 text-[12px] text-ink-soft">
              {s.neverConcludes.map((i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RuntimesPanel() {
  const w = workerDetail;
  return (
    <div className="space-y-5">
      <Card title="Test Worker" subtitle="Push a sample through this Worker and watch it convert.">
        <p className="text-[13px] font-semibold text-ink">{w.testPush.name}</p>
        <p className="text-[11.5px] text-ink-mute">
          {w.testPush.conversion} · {w.testPush.size}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{w.testPush.description}</p>
        <Button size="sm" className="mt-3">
          Test push · {w.testPush.name}
        </Button>
      </Card>

      <Card title="Runtimes">
        <div className="rounded-card border border-border overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                <th className="px-3 py-2.5 font-semibold">Runtime</th>
                <th className="px-3 py-2.5 font-semibold">State</th>
                <th className="px-3 py-2.5 font-semibold">Image</th>
                <th className="px-3 py-2.5 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {w.runtimes.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", r.state === "running" ? "bg-status-green animate-pulse" : "bg-ink-faint")} />
                      <div>
                        <p className="font-medium text-ink">{r.slot}</p>
                        <p className="text-[10.5px] text-ink-mute">{r.kind}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={r.state === "running" ? "green" : "neutral"} dot>
                      {r.state}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink-mute">{r.image}</td>
                  <td className="px-3 py-2.5 text-ink-mute">{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DeliveryPanel() {
  const d = workerDetail.delivery;
  return (
    <Card title="Delivery" subtitle="Immutable packages, customer transfer evidence and source publication.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat label="Built packages" value={d.builtPackages} />
        <MiniStat label="Customer deliveries" value={d.customerDeliveries} />
        <MiniStat label="Source publication" value={d.sourcePublication} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="text-[12px] text-ink-mute">No customer package has been prepared for this Worker.</p>
        <Button asChild size="sm">
          <Link to="/delivery">Prepare customer package</Link>
        </Button>
      </div>
    </Card>
  );
}
