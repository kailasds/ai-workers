import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Package as PackageIcon, Rocket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sampleProjects, provisioningSteps, businessDomains, identities, boundedContexts } from "./script";
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

  const configEntries = [
    { label: "Worker identity", value: `${identity?.name} · ${domain?.name ?? "No domain"}` },
    { label: "Worker intent", value: "Rendered from every stage at build time" },
    { label: "Skills", value: `${compose.brain.skillsCount} selected` },
    { label: "Domain languages", value: `${compose.brain.dslsCount} bound` },
    { label: "EVALs", value: `${compose.brain.evalsCount} attached` },
    { label: "Definition of Done", value: "3 release gates, all gating" },
    { label: "Autonomy", value: `Level ${compose.autonomyLevel}` },
    { label: "Bounded context", value: boundedContext?.description ?? "—" },
  ];

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
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60 text-accent-ink">
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

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-bold text-ink">Configuration to be packaged</p>
            <span className="text-[12px] text-ink-mute">{configEntries.length} entries</span>
          </div>
          <p className="mt-0.5 mb-2.5 text-[11.5px] text-ink-mute">Read from the composition you confirmed.</p>
          <div className="divide-y divide-border">
            {configEntries.map((e) => (
              <div key={e.label} className="flex items-center justify-between gap-4 py-2.5 text-[12.5px]">
                <span className="text-ink-mute">{e.label}</span>
                <span className="font-medium text-ink text-right">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
      <p className="mt-1 text-[12.5px] text-ink-mute">Signing and preparing the artefact.</p>

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
      <h2 className="mt-5 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Worker Package Ready</h2>
      <p className="mt-1.5 text-[13px] text-ink-mute">
        {compose.selectedSampleProjects.length} sample project{compose.selectedSampleProjects.length === 1 ? "" : "s"} seeded ·
        {compose.publishToGitLab ? " source published to GitLab." : " source kept local."}
      </p>
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
