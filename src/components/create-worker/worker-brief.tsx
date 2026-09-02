import { Check, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import type { ComposeState, StepId } from "./types";
import { draftWorker } from "./script";
import { cn } from "@/lib/utils";
import type { AutonomyLevel } from "@/lib/types";

const operatingModeLabel: Record<string, string> = {
  "propose-only": "Propose Only",
  "act-with-approval": "Act With Approval",
  "act-within-limits": "Act Within Limits",
};

const deliveryLabel: Record<string, string> = {
  "local-bundle": "Local Test Bundle",
  "content-store": "Content Store",
  "deployment-pipeline": "Deployment Pipeline",
};

export function computeReadiness(compose: ComposeState) {
  const dodSufficient = compose.dodSections.every((s) => s.requirements.length > 0);
  const capabilitiesReady = compose.capabilitiesMode === "import" ? !!compose.importedPackage : compose.skills.length > 0;
  return [
    { id: "purpose" as StepId, label: "Purpose complete", ok: !!compose.name.trim() && !!compose.objective.trim() && !!compose.inputBoundary.trim() },
    { id: "capabilities" as StepId, label: "Capabilities selected", ok: capabilitiesReady },
    { id: "models" as StepId, label: "Models configured", ok: !!compose.modelConfig.primaryModel && !!compose.modelConfig.verifierModel },
    { id: "dod" as StepId, label: "Definition of Done defined", ok: dodSufficient },
    { id: "customer" as StepId, label: "Customer configuration ready", ok: !!compose.syncMethod },
    { id: "safety" as StepId, label: "Safety defined", ok: !!compose.operatingMode },
    { id: "package" as StepId, label: "Package ready", ok: !!compose.deployment.deliveryTarget },
  ];
}

export function WorkerBrief({
  compose,
  autonomy,
  onJumpTo,
}: {
  compose: ComposeState;
  autonomy: AutonomyLevel;
  onJumpTo: (id: StepId) => void;
}) {
  const readiness = computeReadiness(compose);
  const readyCount = readiness.filter((r) => r.ok).length;
  const dodTotal = compose.dodSections.flatMap((s) => s.requirements).length;

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5 h-fit sticky top-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Worker brief</p>
        <Badge variant="accent">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          AI generated
        </Badge>
      </div>
      <p className="mt-1.5 text-[16px] font-bold text-ink truncate">{compose.name || "Untitled Worker"}</p>
      <p className="text-[12px] text-ink-mute truncate">{compose.owner || "No owner set"}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <AutonomyBadge level={autonomy} />
        <Badge variant="outline">{operatingModeLabel[compose.operatingMode]}</Badge>
        {compose.templateId && <Badge variant="accent">{compose.templateId.replace(/-/g, " ")}</Badge>}
      </div>

      <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-[12.5px]">
        <BriefRow label="Primary Agent" value={draftWorker.agentMesh.find((a) => a.isOrchestrator)?.name ?? "Orchestrator"} />
        <BriefRow
          label="Capabilities"
          value={
            compose.capabilitiesMode === "import" && compose.importedPackage
              ? `${compose.importedPackage.name} v${compose.importedPackage.version}`
              : `${compose.skills.length} skills · ${compose.tools.length} tools`
          }
        />
        <BriefRow label="Model" value={compose.modelConfig.primaryModel} />
        <BriefRow label="Definition of Done" value={`${dodTotal} checkpoints`} />
        <BriefRow label="Customer Config" value={`${compose.customerConfig.filter((c) => c.control === "customer").length} customer-configurable`} />
        <BriefRow label="Delivery" value={deliveryLabel[compose.deployment.deliveryTarget]} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Package Readiness</p>
          <span className="text-[12px] font-semibold tabular-nums text-ink">
            {readyCount} / {readiness.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(readyCount / readiness.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-mute">
          {readyCount === readiness.length ? "Ready to prepare a package." : "Complete the remaining steps to package this Worker."}
        </p>
      </div>

      <div className="mt-3 space-y-1">
        {readiness.map((r) => (
          <button
            key={r.id}
            onClick={() => onJumpTo(r.id)}
            className="flex w-full items-center gap-2 rounded-[8px] -mx-1.5 px-1.5 py-1 text-left transition-colors hover:bg-card-sunken"
          >
            <div
              className={cn(
                "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                r.ok ? "bg-status-green text-white" : "border border-border-strong text-transparent"
              )}
            >
              {r.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <Circle className="h-1.5 w-1.5 fill-current" />}
            </div>
            <span className={cn("text-[12px]", r.ok ? "text-ink-soft" : "text-ink-mute")}>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiPrepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-accent-border bg-accent-soft p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-accent-ink mb-1.5">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        {title}
      </p>
      {children}
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-mute shrink-0">{label}</span>
      <span className="text-ink font-medium text-right truncate">{value}</span>
    </div>
  );
}
