import { useState } from "react";
import {
  Sparkles,
  Check,
  AlertTriangle,
  ShieldAlert,
  Wallet,
  Network,
  BadgeCheck,
  ChevronRight,
  FileJson,
  Download,
  ChevronDown,
  ChevronUp,
  Cpu,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { draftWorker } from "./script";
import type { ComposeState, SectionId } from "./types";
import type { AutonomyLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const worker = draftWorker;

const deliveryLabel: Record<string, string> = {
  "local-bundle": "Local Test Bundle",
  "content-store": "Content Store",
  "deployment-pipeline": "Deployment Pipeline",
};

const operatingModeLabel: Record<string, string> = {
  "propose-only": "Propose Only",
  "act-with-approval": "Act With Approval",
  "act-within-limits": "Act Within Limits",
};

const memoryScopeLabel: Record<string, string> = {
  worker: "Worker Memory",
  session: "Session Memory",
  enterprise: "Enterprise Memory",
};

export function ReviewStage({
  autonomy,
  priorities,
  recommendationApplied,
  riskApplied,
  onApplyRecommendation,
  onApplyRisk,
  onBack,
  onCreate,
  compose,
  onJumpTo,
}: {
  autonomy: AutonomyLevel;
  priorities: string[];
  recommendationApplied: boolean;
  riskApplied: boolean;
  onApplyRecommendation: () => void;
  onApplyRisk: () => void;
  onBack: () => void;
  onCreate: () => void;
  compose: ComposeState;
  onJumpTo: (id: SectionId) => void;
}) {
  const [manifestOpen, setManifestOpen] = useState(false);
  const allDodReqs = compose.dodSections.flatMap((s) => s.requirements);
  const dodSectionsWithCriteria = compose.dodSections.filter((s) => s.requirements.length > 0).length;
  const dodSufficient = dodSectionsWithCriteria >= compose.dodSections.length;
  const canCreate = recommendationApplied && riskApplied;

  const readyChecks: { label: string; sectionId: SectionId; ok: boolean; note?: string }[] = [
    { label: "Worker objective clearly defined", sectionId: "purpose", ok: compose.objective.trim().length > 0 },
    { label: "Responsibilities clearly defined", sectionId: "responsibilities", ok: compose.willList.length > 0 },
    { label: "Required skills identified", sectionId: "skills", ok: compose.skills.length > 0 },
    { label: "Agent responsibilities separated", sectionId: "team", ok: true },
    { label: "Required access configured", sectionId: "tools", ok: compose.tools.length > 0 },
    {
      label: dodSufficient
        ? "Definition of Done defined"
        : `Definition of Done: ${dodSectionsWithCriteria} of ${compose.dodSections.length} sections have criteria`,
      sectionId: "dod",
      ok: dodSufficient,
      note: !dodSufficient ? "requires one more section" : undefined,
    },
    { label: "Governance controls applied", sectionId: "governance", ok: true },
  ];

  return (
    <div className="px-8 pb-16 pt-8">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <Sparkles className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div>
          <h2 className="text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Your AI Worker is Ready</h2>
          <p className="text-[12.5px] text-ink-mute">I reviewed your Worker configuration — here's what I found.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="space-y-4">
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-status-green mb-3">Readiness</p>
            <div className="space-y-1">
              {readyChecks.map((c) => (
                <button
                  key={c.label}
                  onClick={() => onJumpTo(c.sectionId)}
                  className="group/check flex w-full items-center gap-2 rounded-[8px] -mx-1.5 px-1.5 py-1.5 text-left transition-colors hover:bg-card-sunken"
                >
                  <div
                    className={cn(
                      "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
                      c.ok ? "bg-status-green text-white" : "border border-status-amber text-status-amber"
                    )}
                  >
                    {c.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />}
                  </div>
                  <span className="flex-1 text-[13px] text-ink-soft">{c.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-faint opacity-0 transition-opacity group-hover/check:opacity-100" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-status-amber/25 bg-status-amber-soft p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-status-amber mb-2">
              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} /> Recommendation
            </p>
            <p className="text-[13px] font-medium text-ink">Verification Independence</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              I recommend keeping the Verification agent independent from the Implementation agent, so the same system
              never validates its own work.
            </p>
            <Button
              size="sm"
              variant={recommendationApplied ? "secondary" : "primary"}
              className="mt-3"
              disabled={recommendationApplied}
              onClick={onApplyRecommendation}
            >
              {recommendationApplied ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Applied
                </>
              ) : (
                "Apply Recommendation"
              )}
            </Button>
          </div>

          <div
            className={cn(
              "rounded-card border p-5",
              riskApplied ? "border-status-green/25 bg-status-green-soft" : "border-status-red/25 bg-status-red-soft"
            )}
          >
            <p
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2",
                riskApplied ? "text-status-green" : "text-status-red"
              )}
            >
              <ShieldAlert className="h-3 w-3" strokeWidth={2.5} />
              {riskApplied ? "Risk Resolved" : "Potential Risk"}
            </p>
            <p className="text-[13px] font-medium text-ink">Production Access Detected</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              {riskApplied
                ? "Production write access has been removed. This worker is now scoped to read-only legacy access and a sandbox target environment."
                : "Default tool permissions would have included production write access. This Worker's objective does not require it."}
            </p>
            {!riskApplied && (
              <Button size="sm" variant="destructive" className="mt-3" onClick={onApplyRisk}>
                Apply Recommendation
              </Button>
            )}
          </div>

          <ManifestPanel compose={compose} open={manifestOpen} onToggle={() => setManifestOpen((o) => !o)} />
        </div>

        <div className="rounded-card border border-border-strong bg-card shadow-card p-5 h-fit">
          <p className="text-[15px] font-bold text-ink">{compose.name}</p>
          <p className="text-[12px] text-ink-mute">{worker.role} · Owner: {compose.owner}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <AutonomyBadge level={autonomy} />
            <Badge variant="outline">{operatingModeLabel[compose.operatingMode]}</Badge>
            <Badge variant="neutral">v1.0 draft</Badge>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">{compose.objective}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <Stat icon={Network} label="Agent Team" value={`${worker.agentMesh.length}`} />
            <Stat icon={Sparkles} label="Skills" value={`${compose.skills.length}`} />
            <Stat icon={BadgeCheck} label="DoD Checkpoints" value={`${allDodReqs.length} defined`} />
            <Stat icon={Wallet} label="Budget" value={`$${compose.perTaskLimit}/task`} />
            <Stat icon={Cpu} label="Primary Model" value={compose.modelConfig.primaryModel} />
            <Stat icon={ShieldAlert} label="Learning Scope" value={memoryScopeLabel[compose.learningConfig.memoryScope]} />
          </dl>

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute mb-1.5">Delivery</p>
            <Badge variant="accent">
              <Package className="h-3 w-3" strokeWidth={2} />
              {deliveryLabel[compose.deployment.deliveryTarget]}
            </Badge>
          </div>

          {priorities.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[10.5px] uppercase tracking-wider text-ink-mute mb-1.5">Prioritizing</p>
              <div className="flex flex-wrap gap-1.5">
                {priorities.map((p) => (
                  <Badge key={p} variant="accent">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 border-t border-border pt-3 text-[11px] text-ink-mute">
            Every value above reflects your edits — nothing here is fixed once AI proposes it.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          Back to conversation
        </Button>
        <Button disabled={!canCreate} onClick={onCreate}>
          Create AI Worker
        </Button>
      </div>
      {!canCreate && (
        <p className="mt-2 text-right text-[11.5px] text-ink-mute">
          Apply the recommendation and resolve the risk above to provision this Worker.
        </p>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Network; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-mute">
        <Icon className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function ManifestPanel({ compose, open, onToggle }: { compose: ComposeState; open: boolean; onToggle: () => void }) {
  function download() {
    const manifest = {
      workerConfiguration: { name: compose.name, owner: compose.owner, objective: compose.objective, acceptedInputBoundary: compose.inputBoundary },
      agentConfiguration: { agentMesh: worker.agentMesh.map((a) => ({ name: a.name, role: a.role, isOrchestrator: !!a.isOrchestrator })) },
      capabilities: { skills: compose.skills, tools: compose.tools },
      modelConfiguration: compose.modelConfig,
      learningConfiguration: compose.learningConfig,
      safetyRules: { operatingMode: compose.operatingMode, alwaysRequireApproval: compose.alwaysRequireApproval },
      evidenceRequirements: compose.dodSections,
      runtime: { runtime: compose.deployment.runtime, architecture: compose.deployment.architecture },
      deploymentConfiguration: {
        workerProfile: compose.deployment.workerProfile,
        sizeProfile: compose.deployment.sizeProfile,
        deliveryTarget: compose.deployment.deliveryTarget,
        deploymentMethod: compose.deployment.deploymentMethod,
      },
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${compose.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-2.5 px-5 py-4 text-left transition hover:bg-card-sunken">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card-sunken text-ink-soft">
          <FileJson className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">Package Manifest</p>
          <p className="text-[11.5px] text-ink-mute">Generated configuration summary for this Worker</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-ink-faint" strokeWidth={2} /> : <ChevronDown className="h-4 w-4 text-ink-faint" strokeWidth={2} />}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 space-y-2.5">
          {[
            ["Worker Configuration", `${compose.name} · Owner: ${compose.owner}`],
            ["Agent Configuration", `${worker.agentMesh.length} agents (1 orchestrator)`],
            ["Capabilities", `${compose.skills.length} skills · ${compose.tools.length} tools`],
            ["Model Configuration", `${compose.modelConfig.primaryModel} + ${compose.modelConfig.verifierModel}`],
            ["Safety Rules", `${operatingModeLabel[compose.operatingMode]} · ${compose.alwaysRequireApproval.length} approval rules`],
            ["Evidence Requirements", `${compose.dodSections.flatMap((s) => s.requirements).length} checkpoints across ${compose.dodSections.length} sections`],
            ["Runtime", compose.deployment.runtime],
            ["Deployment Configuration", `${deliveryLabel[compose.deployment.deliveryTarget]} · ${compose.deployment.sizeProfile}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-mute">{label}</span>
              <span className="text-right text-ink">{value}</span>
            </div>
          ))}
          <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={download}>
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Download Manifest (JSON)
          </Button>
        </div>
      )}
    </div>
  );
}
