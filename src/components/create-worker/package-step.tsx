import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Download, FileJson, Rocket } from "lucide-react";
import { EditableField, EditableSelect, AiImpactNote, type SelectOption } from "@/components/shared/editable";
import { Button } from "@/components/ui/button";
import { computeReadiness } from "./worker-brief";
import { draftWorker } from "./script";
import type { ComposeState, StepId } from "./types";

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

const deliveryLabel: Record<string, string> = {
  "local-bundle": "Local Test Bundle",
  "content-store": "Content Store",
  "deployment-pipeline": "Deployment Pipeline",
};

export function PackageStep({
  compose,
  defaults,
  update,
  onJumpTo,
  onDeploy,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
  onJumpTo: (id: StepId) => void;
  onDeploy: () => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [showDeliveryImpact, setShowDeliveryImpact] = useState(false);
  const [manifestOpen, setManifestOpen] = useState(false);
  const d = compose.deployment;
  const readiness = computeReadiness(compose);
  const blocking = readiness.filter((r) => !r.ok);

  function setDeployment(patch: Partial<typeof d>) {
    update("deployment", { ...d, ...patch });
  }

  function download() {
    const manifest = {
      workerConfiguration: { name: compose.name, owner: compose.owner, objective: compose.objective, acceptedInputBoundary: compose.inputBoundary },
      agentConfiguration: { agentMesh: draftWorker.agentMesh.map((a) => ({ name: a.name, role: a.role, isOrchestrator: !!a.isOrchestrator })) },
      capabilities: { skills: compose.skills, tools: compose.tools, importedPackage: compose.importedPackage?.name ?? null },
      modelConfiguration: compose.modelConfig,
      safetyRules: { operatingMode: compose.operatingMode, alwaysRequireApproval: compose.alwaysRequireApproval },
      evidenceRequirements: compose.dodSections,
      customerConfiguration: compose.customerConfig,
      deploymentConfiguration: compose.deployment,
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
    <div className="space-y-5">
      {blocking.length > 0 && (
        <div className="rounded-card border border-status-amber/25 bg-status-amber-soft p-4">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-status-amber mb-2">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
            This Worker isn't ready to package yet
          </p>
          <div className="space-y-1.5">
            {blocking.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-ink">{b.label}</span>
                <Button size="sm" variant="secondary" onClick={() => onJumpTo(b.id)}>
                  Go to Configuration
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Worker Profile</p>
            <EditableField value={d.workerProfile} aiValue={defaults.deployment.workerProfile} onChange={(v) => setDeployment({ workerProfile: v })} textClassName="text-[13px] text-ink" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Deployment Size</p>
            <EditableSelect value={d.sizeProfile} aiValue={defaults.deployment.sizeProfile} options={sizeProfileOptions} onChange={(v) => setDeployment({ sizeProfile: v })} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Delivery Target</p>
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Deployment Method</p>
            <EditableField value={d.deploymentMethod} aiValue={defaults.deployment.deploymentMethod} onChange={(v) => setDeployment({ deploymentMethod: v })} textClassName="text-[13px] text-ink" />
          </div>
        </div>

        <button onClick={() => setAdvanced((a) => !a)} className="mt-4 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute transition hover:text-ink">
          {advanced ? <ChevronUp className="h-3 w-3" strokeWidth={2.5} /> : <ChevronDown className="h-3 w-3" strokeWidth={2.5} />}
          Advanced
        </button>
        {advanced && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] bg-card-sunken p-3">
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

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <button onClick={() => setManifestOpen((o) => !o)} className="flex w-full items-center gap-2.5 px-5 py-4 text-left transition hover:bg-card-sunken">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card-sunken text-ink-soft">
            <FileJson className="h-3.5 w-3.5" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-ink">Package Manifest</p>
            <p className="text-[11.5px] text-ink-mute">Generated configuration summary for this Worker</p>
          </div>
          {manifestOpen ? <ChevronUp className="h-4 w-4 text-ink-faint" strokeWidth={2} /> : <ChevronDown className="h-4 w-4 text-ink-faint" strokeWidth={2} />}
        </button>
        {manifestOpen && (
          <div className="border-t border-border px-5 py-4 space-y-2.5">
            {[
              ["Worker Configuration", `${compose.name} · Owner: ${compose.owner}`],
              ["Agent Configuration", `${draftWorker.agentMesh.length} agents (1 orchestrator)`],
              ["Capabilities", compose.importedPackage ? `Imported: ${compose.importedPackage.name}` : `${compose.skills.length} skills · ${compose.tools.length} tools`],
              ["Model Configuration", `${compose.modelConfig.primaryModel} + ${compose.modelConfig.verifierModel}`],
              ["Safety Rules", `${compose.operatingMode} · ${compose.alwaysRequireApproval.length} approval rules`],
              ["Evidence Requirements", `${compose.dodSections.flatMap((s) => s.requirements).length} checkpoints across ${compose.dodSections.length} sections`],
              ["Customer Configuration", `${compose.customerConfig.filter((c) => c.control === "customer").length} customer-configurable settings`],
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

      <div className="flex justify-end">
        <Button disabled={blocking.length > 0} onClick={onDeploy}>
          <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
          Create AI Worker
        </Button>
      </div>
    </div>
  );
}
