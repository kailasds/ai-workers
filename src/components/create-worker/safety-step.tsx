import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { EditableSelect, EditableChipList, AiImpactNote, type SelectOption } from "@/components/shared/editable";
import { SentinelStatus } from "@/components/shared/sentinel-status";
import { Badge } from "@/components/ui/badge";
import { GovernanceMatrix } from "@/components/shared/governance-matrix";
import { AiPrepCard } from "./worker-brief";
import { draftWorker } from "./script";
import type { ComposeState } from "./types";
import type { OperatingMode } from "@/lib/types";

const operatingModeOptions: SelectOption[] = [
  { value: "propose-only", label: "Propose Only", description: "The Worker proposes changes but never executes them directly." },
  { value: "act-with-approval", label: "Act With Approval", description: "The Worker acts, but high-impact actions always pause for human approval." },
  { value: "act-within-limits", label: "Act Within Limits", description: "The Worker acts independently within pre-approved policy limits." },
];

const approvalRuleLabels: Record<OperatingMode, string> = {
  "propose-only": "Every action, since this Worker only proposes and never executes.",
  "act-with-approval": "Production access is not allowed; human approval is required before merge or deployment.",
  "act-within-limits": "The Worker acts independently within the approval matrix below — only actions marked Restricted still require a human.",
};

export function SafetyStep({
  compose,
  defaults,
  update,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [showModeImpact, setShowModeImpact] = useState(false);

  return (
    <div className="space-y-5">
      <AiPrepCard title={`Based on this Worker's ability to modify application code, AI recommends "${operatingModeOptions.find((o) => o.value === defaults.operatingMode)?.label}".`}>
        <p className="text-[12px] leading-relaxed text-ink">You can change this — but the tradeoffs below will apply.</p>
      </AiPrepCard>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Operating Mode</p>
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
        <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">{approvalRuleLabels[compose.operatingMode]}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {draftWorker.governance.policies.map((p) => (
            <Badge key={p.id} variant="outline">
              {p.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Human Approval Rules</p>
        <EditableChipList items={compose.alwaysRequireApproval} onChange={(items) => update("alwaysRequireApproval", items)} addLabel="Add approval rule" />
        <p className="mt-2 text-[11px] text-ink-mute">These actions always require a human, regardless of Operating Mode.</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Allowed Environments &amp; Restricted Actions</p>
        <GovernanceMatrix rows={draftWorker.governance.approvalMatrix} />
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.9} />
          <p className="text-[14px] font-bold text-ink">AI Sentinel &amp; Escalation</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <SentinelStatus state="observing" />
          <span className="text-[11.5px] text-ink-mute">Sentinel observes this Worker's activity from the moment it starts running.</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Escalates to a human when</p>
        <ul className="space-y-1">
          {["Business logic is ambiguous", "A policy conflict is detected", "A security violation is detected", "Budget exceeds threshold", "Validation repeatedly fails"].map((r) => (
            <li key={r} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
              <span className="h-1 w-1 rounded-full bg-ink-faint" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
