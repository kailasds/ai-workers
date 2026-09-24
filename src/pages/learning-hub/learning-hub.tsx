import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Search,
  Database,
  RefreshCw,
  Users2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileSearch,
  AlertTriangle,
  Share2,
  Scale,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  learningFunnel,
  skillChanges,
  workersByWorkerLearning,
  totalLearningWorkers,
  workersKeptNothingCount,
  everyBrainSummary,
  sharingContexts,
  admissionRule,
  type WorkerLearningCard,
} from "@/lib/learning-data";

const funnelIcon: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  fed: RefreshCw,
  records: Database,
  agreed: Users2,
  changed: Sparkles,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
}

export default function LearningHub() {
  return (
    <div className="pb-12">
      <PageHeader
        title="Learning"
        subtitle="What Workers have worked out from doing the work, and what it changed."
        icon={BrainCircuit}
        tone="purple"
      />

      <div className="px-8">
        <Tabs defaultValue="learned">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="learned">What Workers have learned</TabsTrigger>
            <TabsTrigger value="brains">Every brain</TabsTrigger>
            <TabsTrigger value="sharing">Sharing a brain</TabsTrigger>
          </TabsList>

          <TabsContent value="learned">
            <LearnedTab />
          </TabsContent>
          <TabsContent value="brains">
            <EveryBrainTab />
          </TabsContent>
          <TabsContent value="sharing">
            <SharingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LearnedTab() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => workersByWorkerLearning.filter((w) => !query.trim() || w.identityLabel.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {learningFunnel.map((m) => (
          <KpiCard key={m.id} label={m.label} value={m.value} icon={funnelIcon[m.id]} iconPosition="left" />
        ))}
      </div>

      {/* What changed in a Skill */}
      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-[15px] font-bold text-ink">What changed in a Skill</h2>
          <p className="mt-0.5 text-[12px] text-ink-mute">A Worker may only add to a Skill, and only where several of its own runs agreed. Every change this estate has made is here.</p>
        </div>
        <div className="divide-y divide-border">
          {skillChanges.map((c) => (
            <div key={c.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-card-sunken px-2 py-1 font-mono text-[11px] text-ink-soft">{c.skill}</span>
                  <Badge variant={c.kind === "checks" ? "blue" : "amber"}>{c.kind}</Badge>
                </div>
                <Badge variant="accent">{c.runsAgreed} runs agreed</Badge>
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.summary}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-ink-faint">
                <span>{c.context}</span>
                <span>Its own copy · {fmtDate(c.changedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker by Worker */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-ink">Worker by Worker</h2>
            <p className="text-[12px] text-ink-mute">Open one to follow its runs into GBrain and into its Skills.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-ink-faint whitespace-nowrap">
              {filtered.length} of {totalLearningWorkers} Workers
            </span>
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.9} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Workers" className="pl-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <WorkerLearningTile key={w.id} w={w} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-[12.5px] text-ink-mute">No Workers match “{query}”.</p>
          )}
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border-strong py-3 text-[12px] font-medium text-ink-mute transition-colors hover:text-ink hover:bg-card-sunken"
        >
          {showAll ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />}
          {workersKeptNothingCount} Workers have kept nothing yet
        </button>
      </div>
    </div>
  );
}

function WorkerLearningTile({ w }: { w: WorkerLearningCard }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-status-purple-soft text-status-purple">
            <BrainCircuit className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-snug text-ink">{w.identityLabel}</p>
            <p className="text-[11px] text-ink-mute">{w.workerType}</p>
          </div>
        </div>
        <Badge variant={w.status === "Learning" ? "green" : "neutral"} dot className="shrink-0">
          {w.status}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniFact icon={Database} label="Records" value={w.recordsKept} />
        <MiniFact icon={RefreshCw} label="Runs fed" value={w.runsThatFedIt} />
        <MiniFact icon={Sparkles} label="Changed" value={w.skillsChanged} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="min-w-0 truncate text-[10.5px] text-ink-mute">{w.boundedContext}</span>
        <div className="flex shrink-0 items-center gap-2.5">
          {w.status === "Learning" && (
            <button className="flex items-center gap-1 text-[11px] font-medium text-accent-ink hover:underline underline-offset-2">
              <Terminal className="h-3 w-3" strokeWidth={2} />
              Console
            </button>
          )}
          <button className="flex items-center gap-1 text-[11px] font-medium text-accent-ink hover:underline underline-offset-2">
            <FileSearch className="h-3 w-3" strokeWidth={2} />
            Evidence
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniFact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: number }) {
  return (
    <div className="rounded-[10px] bg-card-sunken p-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-ink-faint" strokeWidth={1.9} />
      <p className="mt-1 text-[14px] leading-none font-bold tabular-nums text-ink font-display">{value}</p>
      <p className="mt-0.5 text-[9.5px] text-ink-mute">{label}</p>
    </div>
  );
}

function EveryBrainTab() {
  const groups = useMemo(() => {
    const byContext = new Map<string, WorkerLearningCard[]>();
    for (const w of workersByWorkerLearning) {
      const list = byContext.get(w.boundedContext) ?? [];
      list.push(w);
      byContext.set(w.boundedContext, list);
    }
    return Array.from(byContext.entries()).map(([context, workers]) => ({
      context,
      workers,
      records: workers.reduce((s, w) => s + w.recordsKept, 0),
    }));
  }, []);

  const [open, setOpen] = useState<string | null>(groups[0]?.context ?? null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Workers" value={everyBrainSummary.workers} icon={Users2} iconPosition="left" />
        <KpiCard label="Avg records / Worker" value={everyBrainSummary.avgRecordsPerWorker} icon={Database} iconPosition="left" />
        <KpiCard label="Total runs fed" value={everyBrainSummary.totalRunsFed} icon={RefreshCw} iconPosition="left" />
        <KpiCard label="Total skills changed" value={everyBrainSummary.totalSkillsChanged} icon={Sparkles} iconPosition="left" />
      </div>

      <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border overflow-hidden">
        {groups.map((g) => {
          const isOpen = open === g.context;
          return (
            <div key={g.context}>
              <button
                onClick={() => setOpen(isOpen ? null : g.context)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-card-sunken"
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
                )}
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
                  <Layers className="h-4 w-4" strokeWidth={1.9} />
                </div>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{g.context}</span>
                <Badge variant="neutral" className="shrink-0">
                  {g.workers.length} Workers
                </Badge>
                <Badge variant="purple" className="shrink-0">
                  {g.records} records
                </Badge>
              </button>
              {isOpen && (
                <div className="overflow-x-auto animate-in fade-in-0 slide-in-from-top-1 duration-150">
                  <table className="w-full min-w-[560px] text-left text-[12.5px]">
                    <thead>
                      <tr className="border-t border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                        <th className="px-5 py-2.5 font-semibold">Worker</th>
                        <th className="px-3 py-2.5 font-semibold text-right">Records</th>
                        <th className="px-3 py-2.5 font-semibold text-right">Runs fed</th>
                        <th className="px-3 py-2.5 font-semibold text-right">Changed</th>
                        <th className="px-5 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {g.workers.map((w) => (
                        <tr key={w.id}>
                          <td className="px-5 py-2.5 font-medium text-ink">{w.identityLabel}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink">{w.recordsKept}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink">{w.runsThatFedIt}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink">{w.skillsChanged}</td>
                          <td className="px-5 py-2.5">
                            <Badge variant={w.status === "Learning" ? "green" : "neutral"} dot>
                              {w.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SharingTab() {
  const [openContext, setOpenContext] = useState<string | null>(sharingContexts[0]?.id ?? null);

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-status-purple-soft text-status-purple">
              <Share2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink">One Worker learns it, every Worker knows it</h2>
              <p className="mt-0.5 text-[12px] text-ink-mute">Where a claim goes once several Workers reach it separately.</p>
            </div>
          </div>
          <Badge variant="amber">{admissionRule.availability}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border pt-4">
          <RuleField icon={Users2} label="Workers that must agree, separately" value={admissionRule.agreeCount} />
          <RuleField icon={Scale} label="Each must have met its Definition of Done" value={admissionRule.dodRequirement} />
          <RuleField icon={Share2} label="What travels" value={admissionRule.whatTravels} />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-status-amber-soft/50 p-3 text-[11.5px] leading-relaxed text-status-amber">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {admissionRule.note}
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-bold text-ink">Who this would apply to</h3>
        <p className="mb-3 text-[12px] text-ink-mute">Workers doing the same work are the ones that can agree with each other. A context with one Worker has nobody to agree.</p>

        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border overflow-hidden">
          {sharingContexts.map((g) => {
            const isOpen = openContext === g.id;
            return (
              <div key={g.id}>
                <button
                  onClick={() => setOpenContext(isOpen ? null : g.id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-card-sunken"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
                  )}
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
                    <Layers className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{g.label}</span>
                  <Badge variant="accent" className="shrink-0">
                    {g.workersCouldCompare} Workers could compare
                  </Badge>
                </button>
                {isOpen && (
                  <div className="divide-y divide-border animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    {g.pairs.map((p, i) => (
                      <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 pl-[52px] text-[12px]">
                        <span className="min-w-0 truncate text-ink-soft">
                          {p.a} <span className="text-ink-faint">↔</span> {p.b}
                        </span>
                        <Badge variant={p.agreedAcrossRuns > 0 ? "green" : "neutral"} className="shrink-0">
                          {p.agreedAcrossRuns} agreed across runs
                        </Badge>
                      </div>
                    ))}
                    {g.morePairs && (
                      <p className="px-5 py-2.5 pl-[52px] text-[11.5px] text-ink-faint">+ {g.morePairs} more pairs not shown</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RuleField({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card-sunken/60 p-3">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-ink">{value}</p>
    </div>
  );
}
