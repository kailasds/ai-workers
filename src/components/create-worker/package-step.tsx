import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package as PackageIcon,
  Rocket,
  FileText,
  Brain,
  ClipboardCheck,
  ShieldCheck,
  Eye,
  BookOpen,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sampleProjects, provisioningSteps, businessDomains, identities, boundedContexts, dodGates, autonomyLevels, assemblyLog } from "./script";
import type { ComposeState } from "./types";

export function PackageStep({
  compose,
  update,
  onReset,
  onBackToWorker,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
  onReset: () => void;
  onBackToWorker: () => void;
}) {
  if (compose.packageState === "building") return <BuildingPanel onDone={() => update("packageState", "built")} />;
  if (compose.packageState === "built") return <BuiltPanel compose={compose} onReset={onReset} />;

  const identity = identities.find((i) => i.id === compose.identityId);
  const domain = businessDomains.find((d) => d.id === compose.businessDomainId);
  const boundedContext = boundedContexts.find((b) => b.id === compose.boundedContextId);

  function toggleProject(id: string) {
    const set = new Set(compose.selectedSampleProjects);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update("selectedSampleProjects", Array.from(set));
  }

  return (
    <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Composed</p>
            <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Worker composed</h2>
            <p className="mt-1.5 text-[12.5px] text-ink-mute">Build the Package to prepare this Worker for deployment.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={onBackToWorker} className="shrink-0">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to the Worker
          </Button>
        </div>

        <WorkerAnatomy compose={compose} identityLabel={`${identity?.name ?? "—"} · ${domain?.name ?? "No domain"}`} boundedContextLabel={boundedContext?.description ?? "—"} />

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-bold text-ink">Sample projects to package</p>
            <span className="text-[12px] font-medium tabular-nums text-ink-mute">
              {compose.selectedSampleProjects.length} of {sampleProjects.length} chosen
            </span>
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-mute">They are seeded into the Worker desktop, where its file chooser opens.</p>

          <div className="mt-3 divide-y divide-border rounded-[12px] border border-border">
            {sampleProjects.map((p) => {
              const checked = compose.selectedSampleProjects.includes(p.id);
              return (
                <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-card-sunken">
                  <Checkbox checked={checked} onCheckedChange={() => toggleProject(p.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{p.name}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-mute">{p.path}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[14px] border border-accent-border bg-accent-soft p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60 text-accent-foreground">
                <PackageIcon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">Build the Worker Package</p>
                <p className="mt-0.5 text-[12px] text-ink-mute">Creates the signed artefact from the configuration you confirmed.</p>
              </div>
            </div>
            <Button onClick={() => update("packageState", "building")} className="shrink-0">
              <PackageIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Build Package
            </Button>
          </div>
          <label className="mt-3 flex items-center gap-2 pl-12 cursor-pointer">
            <Checkbox checked={compose.publishToGitLab} onCheckedChange={(v) => update("publishToGitLab", !!v)} />
            <span className="text-[12px] font-medium text-ink">Publish source to GitLab</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Worker Anatomy — §36–§39: a plain, enterprise labeling of the four Worker
// Package facets (never a cartoon diagram), expanding into the same detail
// an accordion row would, with Brain split into what it knows vs how it
// learns.
function WorkerAnatomy({
  compose,
  identityLabel,
  boundedContextLabel,
}: {
  compose: ComposeState;
  identityLabel: string;
  boundedContextLabel: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const autonomy = autonomyLevels.find((a) => a.level === compose.autonomyLevel);
  const skillNames = assemblyLog.filter((e) => e.facet === "skill").map((e) => e.label);
  const dslNames = assemblyLog.filter((e) => e.facet === "dsl").map((e) => e.label);

  const facets = [
    { id: "intent", label: "Intent", icon: FileText },
    { id: "brain", label: "Brain", icon: Brain },
    { id: "dod", label: "Definition of Done", icon: ClipboardCheck },
    { id: "autonomy", label: "Autonomy", icon: ShieldCheck },
  ] as const;

  return (
    <div className="mt-6">
      <p className="text-[13.5px] font-bold text-ink">Worker Anatomy</p>
      <p className="mt-0.5 text-[11.5px] text-ink-mute">
        {identityLabel} · {boundedContextLabel}
      </p>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {facets.map((f) => (
          <button
            key={f.id}
            onClick={() => setOpen(open === f.id ? null : f.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-[12px] border px-3 py-3 text-center transition-colors",
              open === f.id ? "border-accent-border bg-accent-soft" : "border-border bg-card hover:bg-card-sunken"
            )}
          >
            <div className={cn("grid h-8 w-8 place-items-center rounded-full", open === f.id ? "bg-accent text-white" : "bg-card-sunken text-ink-soft")}>
              <f.icon className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <span className="text-[11.5px] font-semibold text-ink">{f.label}</span>
            <Check className="h-3 w-3 text-status-green" strokeWidth={3} />
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-[12px] border border-border divide-y divide-border overflow-hidden">
        <AccordionRow id="intent" open={open} onToggle={setOpen} icon={FileText} label="Worker Intent" summary={`${compose.workerIntent.agentCount} Agent · ${compose.workerIntent.harnessLabel}`}>
          <ul className="space-y-1 text-[11.5px] text-ink-soft">
            {compose.workerIntent.tools.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-ink-faint" />
                {t}
              </li>
            ))}
            {compose.workerIntent.tools.length === 0 && <li className="text-ink-faint">No tools attached.</li>}
          </ul>
        </AccordionRow>

        <AccordionRow id="brain" open={open} onToggle={setOpen} icon={Brain} label="Brain" summary={`${compose.brain.skillsCount} skills · ${compose.brain.dslsCount} DSLs · ${compose.brain.evalsCount} EVALs`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                <BookOpen className="h-3 w-3" strokeWidth={2} />
                What it knows
              </p>
              <ul className="space-y-1 text-[11.5px] text-ink-soft">
                {[...skillNames, ...dslNames].map((n) => (
                  <li key={n} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2.5} />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                <Eye className="h-3 w-3" strokeWidth={2} />
                How it learns
              </p>
              <ul className="space-y-1 text-[11.5px] text-ink-soft">
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-ink-faint" />Experience-based learning from its own runs</li>
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-ink-faint" />Keeps memory 90 days</li>
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-ink-faint" />Agrees with itself after 3 runs that corroborate</li>
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-ink-faint" />Sentinel: {compose.brain.sentinelState || "Watching"}</li>
              </ul>
            </div>
          </div>
        </AccordionRow>

        <AccordionRow id="dod" open={open} onToggle={setOpen} icon={ClipboardCheck} label="Definition of Done" summary={`${dodGates.length} release gates, all gating`}>
          <ul className="space-y-1.5 text-[11.5px] text-ink-soft">
            {dodGates.map((g) => (
              <li key={g.id} className="flex items-start gap-1.5">
                <Badge variant="red" className="shrink-0">Gating</Badge>
                <span>{g.label}</span>
              </li>
            ))}
          </ul>
        </AccordionRow>

        <AccordionRow id="autonomy" open={open} onToggle={setOpen} icon={ShieldCheck} label="Autonomy" summary={autonomy ? `Level ${autonomy.level} · ${autonomy.name}` : "Not yet resolved"}>
          <p className="text-[11.5px] leading-relaxed text-ink-soft">{autonomy?.description}</p>
          {autonomy && (
            <div className="mt-2 space-y-1 text-[11.5px] text-ink-soft">
              <p><span className="text-ink-faint">Release —</span> {autonomy.release}</p>
              <p><span className="text-ink-faint">Where it may run —</span> {autonomy.whereItMayRun}</p>
            </div>
          )}
        </AccordionRow>
      </div>
    </div>
  );
}

function AccordionRow({
  id,
  open,
  onToggle,
  icon: Icon,
  label,
  summary,
  children,
}: {
  id: string;
  open: string | null;
  onToggle: (id: string | null) => void;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  summary: string;
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div>
      <button onClick={() => onToggle(isOpen ? null : id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-card-sunken">
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />}
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
        </div>
        <span className="flex-1 text-[12.5px] font-medium text-ink">{label}</span>
        <span className="text-[11.5px] font-semibold text-ink-mute">{summary}</span>
      </button>
      {isOpen && <div className="px-3.5 pb-3.5 pl-[52px] animate-in fade-in-0 slide-in-from-top-1 duration-150">{children}</div>}
    </div>
  );
}

function BuildingPanel({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const done = stepIndex >= provisioningSteps.length;

  useEffect(() => {
    if (done) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStepIndex((i) => i + 1), 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, done]);

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-10 flex flex-col items-center text-center">
      <Loader2 className="h-7 w-7 animate-spin text-accent" strokeWidth={1.5} />
      <h2 className="mt-4 text-[17px] font-bold tracking-[-0.01em] text-ink font-display">Building the Worker Package</h2>
      <p className="mt-1 text-[12.5px] text-ink-mute">Preparing Worker anatomy…</p>

      <div className="mt-5 flex items-center gap-3 rounded-full bg-card-sunken px-4 py-2">
        {(["Intent", "Brain", "Definition of Done", "Autonomy"] as const).map((facet) => (
          <span key={facet} className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
            <Check className="h-3 w-3 text-status-green" strokeWidth={3} />
            {facet}
          </span>
        ))}
      </div>

      <div className="mt-6 w-fit space-y-2.5 text-left">
        {provisioningSteps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                i < stepIndex
                  ? "bg-status-green text-white"
                  : i === stepIndex
                  ? "border-2 border-accent"
                  : "border border-border-strong"
              )}
            >
              {i < stepIndex && <Check className="h-3 w-3" strokeWidth={3} />}
              {i === stepIndex && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
            </div>
            <span className={cn("text-[12.5px]", i <= stepIndex ? "text-ink" : "text-ink-faint")}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuiltPanel({ compose, onReset }: { compose: ComposeState; onReset: () => void }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-10 flex flex-col items-center text-center animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="grid h-14 w-14 place-items-center rounded-full card-hero text-white">
        <Rocket className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Your Worker is ready</h2>
      <p className="mt-1.5 text-[13px] text-ink-mute">
        {compose.selectedSampleProjects.length} sample project{compose.selectedSampleProjects.length === 1 ? "" : "s"} seeded ·
        {compose.publishToGitLab ? " source published to GitLab." : " source kept local."}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {(["Worker Intent", "Brain", "Definition of Done", "Autonomy"] as const).map((facet) => (
          <span key={facet} className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
            <Check className="h-3 w-3 text-status-green" strokeWidth={3} />
            {facet}
          </span>
        ))}
      </div>

      <div className="mt-7 flex items-center gap-2.5">
        <Button variant="secondary" onClick={onReset}>
          Start another Worker
        </Button>
        <Button asChild>
          <Link to="/packaging">Go to Packaging</Link>
        </Button>
      </div>
    </div>
  );
}
