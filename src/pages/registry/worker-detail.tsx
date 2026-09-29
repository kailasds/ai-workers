import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronRight, Lightbulb, Users } from "lucide-react";
import { EmptyState } from "@/components/v2/empty-state";
import { EvolutionHistory, EvolutionPath } from "@/components/v2/evolution-path";
import { LearningEventItem } from "@/components/v2/learning-event";
import { MaturityTag, MaturityWhy } from "@/components/v2/maturity-tag";
import { KnowledgeStatusBadge, WorkerStatusBadge } from "@/components/v2/status-badge";
import { Button } from "@/components/ui/button";
import { givenTo, learnedBy, useV2, workerById } from "@/lib/v2/store";
import { workerDetail } from "@/lib/registry-data";
import type { V2Worker } from "@/lib/v2/types";
import { cn } from "@/lib/utils";
import WorkerTechnicalDetails from "@/pages/registry/worker-package-detail";

type LearnStep = "work" | "patterns" | "learning" | "sentinel" | "gained";

const learnSteps: { id: LearnStep; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "patterns", label: "Patterns" },
  { id: "learning", label: "Learning" },
  { id: "sentinel", label: "Worker Sentinel" },
  { id: "gained", label: "Gained knowledge" },
];

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">{children}</h2>
      {hint && <p className="mt-0.5 text-[12px] text-ink-mute">{hint}</p>}
    </div>
  );
}

export default function WorkerDetail() {
  const { workerId } = useParams();
  const state = useV2();
  const worker = workerById(state, workerId);
  const [showTech, setShowTech] = useState(false);

  if (!worker) {
    return (
      <div className="px-8 py-10">
        <BackLink />
        <EmptyState icon={Users} title="Worker not found" description="It may have been removed, or the link is out of date." className="mt-4" />
      </div>
    );
  }

  const recent = state.events
    .filter((e) => e.workerId === worker.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  return (
    <div className="pb-12">
      <div className="px-8 pt-6">
        <BackLink />
      </div>

      <div className="space-y-6 px-8 pt-4">
        {/* Identity */}
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <WorkerStatusBadge status={worker.status} />
            <span className="text-[12px] text-ink-faint">Revision {worker.revision}</span>
          </div>
          <h1 className="mt-2 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-ink font-display">{worker.name}</h1>
          <p className="mt-1.5 text-[14px] text-ink-mute">{worker.purpose}</p>
          <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">Learning maturity</dt>
              <dd className="mt-1 flex items-center gap-3">
                <MaturityTag maturity={worker.maturity} withDescription />
                <MaturityWhy maturity={worker.maturity} reasons={worker.maturityReasons} />
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">Current capability</dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink">{worker.evolution.currentCapability}</dd>
            </div>
          </dl>
        </header>

        <WhatItKnows worker={worker} />
        <HowItLearns worker={worker} />

        {/* How it evolves */}
        <section>
          <SectionTitle hint="Learning makes a Worker better informed. Evolution makes it capable of doing more.">How it evolves</SectionTitle>
          <HowItEvolves worker={worker} />
        </section>

        {/* Recent activity */}
        <section>
          <SectionTitle>Recent activity</SectionTitle>
          {recent.length > 0 ? (
            <div className="divide-y divide-border rounded-card border border-border bg-card px-5 shadow-card">
              {recent.map((e) => (
                <div key={e.id} className="py-4">
                  <LearningEventItem event={e} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Lightbulb} title="No activity yet" description="When this Worker notices something useful, it will show up here." />
          )}
          <Link to="/learning" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
            See all learning activity
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </section>

        {/* Technical layer */}
        <section className="border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setShowTech((v) => !v)}
            aria-expanded={showTech}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-soft hover:text-ink"
          >
            {showTech ? <ChevronDown className="h-4 w-4" strokeWidth={2} /> : <ChevronRight className="h-4 w-4" strokeWidth={2} />}
            Technical details
          </button>
          <p className="mt-1 pl-[22px] text-[12px] text-ink-mute">Package, runs, memory, runtimes and delivery.</p>
          {showTech && (
            <div className="mt-4">
              {worker.id !== workerDetail.id && (
                <p className="mb-3 rounded-control bg-status-amber-soft/50 px-3 py-2 text-[12px] text-ink-soft">
                  Runs, runtimes and delivery below are the reference Worker&rsquo;s records. Only this Worker&rsquo;s package summary is specific to it.
                </p>
              )}
              <WorkerTechnicalDetails worker={worker} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/workers" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
      Registry
    </Link>
  );
}

function WhatItKnows({ worker }: { worker: V2Worker }) {
  const state = useV2();
  const given = givenTo(state, worker);
  const learned = learnedBy(state, worker.id);
  const patterns = state.events.filter((e) => e.workerId === worker.id && e.type === "pattern-identified").length;
  const groups = [
    { label: "Skills", items: given.filter((k) => k.kind === "skill") },
    { label: "Company knowledge", items: given.filter((k) => k.kind === "company") },
    { label: "Rules", items: given.filter((k) => k.kind === "rule") },
    { label: "Safety", items: given.filter((k) => k.kind === "safety") },
  ].filter((g) => g.items.length > 0);

  return (
    <section>
      <SectionTitle>What it knows</SectionTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[14px] font-bold text-ink">Given to it</h3>
            <span className="text-[12px] font-medium tabular-nums text-ink-mute">{given.length}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-mute">Assigned during Compose.</p>
          {groups.length > 0 ? (
            <dl className="mt-4 space-y-3">
              {groups.map((g) => (
                <div key={g.label}>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
                    {g.label} · {g.items.length}
                  </dt>
                  <dd className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{g.items.map((k) => k.title).join(" · ")}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-[12px] text-ink-mute">Nothing has been assigned yet.</p>
          )}
          <Link to={`/knowledge?tab=assigned&worker=${worker.id}`} className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
            See assigned knowledge
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[14px] font-bold text-ink">Learned by it</h3>
            <span className="text-[12px] font-medium tabular-nums text-ink-mute">{learned.length}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-mute">Gained through its own experience.</p>
          {!worker.learningEnabled ? (
            <p className="mt-4 text-[12px] text-ink-mute">Learning is off for this Worker.</p>
          ) : learned.length > 0 ? (
            <>
              <p className="mt-4 text-[12px] text-ink-soft">
                <span className="font-medium text-ink">{patterns}</span> {patterns === 1 ? "pattern" : "patterns"} noticed recently
              </p>
              <ul className="mt-3 space-y-2">
                {learned.map((k) => (
                  <li key={k.id} className="flex items-center justify-between gap-2">
                    <Link to={`/knowledge/${k.id}`} className="min-w-0 truncate text-[12px] font-medium text-ink hover:underline underline-offset-2">
                      {k.title}
                    </Link>
                    <KnowledgeStatusBadge k={k} className="shrink-0" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-[12px] text-ink-mute">This Worker hasn&rsquo;t gained reusable knowledge yet.</p>
          )}
          {worker.learningEnabled && (
            <Link to={`/knowledge?tab=gained&worker=${worker.id}`} className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
              See gained knowledge
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function HowItLearns({ worker }: { worker: V2Worker }) {
  const state = useV2();
  const [step, setStep] = useState<LearnStep | null>(null);
  const learned = learnedBy(state, worker.id);
  const underReview = learned.filter((k) => k.status === "under-review");
  const patterns = state.events.filter((e) => e.workerId === worker.id && e.type === "pattern-identified").length;
  const waiting = state.reviews.filter((r) => r.status === "needs-review" && r.type === "learning" && learned.some((k) => k.id === r.subjectId)).length;
  const kept = learned.filter((k) => k.status === "active").length;

  const detail: Record<LearnStep, { text: string; link?: { to: string; label: string } }> = {
    work: { text: "The Worker does the work it was composed for. Every piece of work is a chance to notice something useful." },
    patterns: { text: `Patterns are recurring things the Worker notices across its work. ${patterns === 0 ? "None noticed recently." : `${patterns} noticed recently.`}` },
    learning: {
      text: `A pattern becomes learning when it looks useful enough to keep. ${underReview.length === 0 ? "Nothing is waiting." : `${underReview.length} waiting for review.`}`,
    },
    sentinel: {
      text: `Worker Sentinel decides whether this Worker should keep what it learned. ${waiting === 0 ? "No decisions are waiting." : `${waiting} waiting for a decision.`}`,
      link: { to: "/sentinel", label: "Open Sentinel" },
    },
    gained: {
      text: `What the Worker keeps becomes Gained Knowledge. It belongs to this Worker unless it is shared. ${kept} kept so far.`,
      link: { to: `/knowledge?tab=gained&worker=${worker.id}`, label: "See gained knowledge" },
    },
  };

  return (
    <section>
      <SectionTitle hint={worker.learningEnabled ? "Select a step to see where this Worker stands." : undefined}>How it learns</SectionTitle>
      {worker.learningEnabled ? (
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <ol className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {learnSteps.map((s, i) => (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(step === s.id ? null : s.id)}
                  aria-pressed={step === s.id}
                  className={cn(
                    "flex-1 rounded-control border px-3 py-2.5 text-left text-[12px] font-semibold sm:text-center",
                    step === s.id ? "border-brand-500 bg-brand-100 text-brand-600" : "border-border bg-card-sunken/60 text-ink-soft hover:border-brand-300"
                  )}
                >
                  {s.label}
                </button>
                {i < learnSteps.length - 1 && <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-ink-faint sm:block" strokeWidth={2} />}
              </li>
            ))}
          </ol>
          {step && (
            <div className="mt-4 rounded-control bg-card-sunken/70 p-5">
              <p className="text-[14px] leading-relaxed text-ink-soft">{detail[step].text}</p>
              {detail[step].link && (
                <Link to={detail[step].link!.to} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
                  {detail[step].link!.label}
                  <ArrowRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="Learning is off" description="This Worker only uses the knowledge it was given. Learning can be turned on when composing a Worker." />
      )}
    </section>
  );
}

function HowItEvolves({ worker }: { worker: V2Worker }) {
  const state = useV2();
  const pending = state.reviews.find((r) => r.type === "evolution" && r.subjectId === worker.id && r.status === "needs-review");
  const e = worker.evolution;

  if (!e.enabled) {
    return <EmptyState icon={Lightbulb} title="Evolution is off" description={`This Worker stays at ${e.currentCapability}.`} />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <EvolutionPath current={e.currentCapability} upcoming={e.availablePaths} pendingCapability={pending?.proposedCapability} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <p className="text-[12px] text-ink-soft">
            Auto-evolution <span className="font-semibold text-ink">{e.autoEvolve ? "On" : "Off"}</span>
          </p>
          <p className="text-[12px] text-ink-mute">Governed by Platform Sentinel</p>
        </div>
        {pending && (
          <Button asChild size="sm" variant="secondary" className="mt-3">
            <Link to="/sentinel">Review the request in Sentinel</Link>
          </Button>
        )}
      </div>
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-[14px] font-bold text-ink">Evolution history</h3>
        {e.history.length > 0 ? <EvolutionHistory history={e.history} /> : <p className="text-[12px] text-ink-mute">This Worker hasn&rsquo;t evolved yet.</p>}
      </div>
    </div>
  );
}
