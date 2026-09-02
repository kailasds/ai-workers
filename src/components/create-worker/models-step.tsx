import { useState } from "react";
import { EditableField, EditableSelect, AiImpactNote, type SelectOption } from "@/components/shared/editable";
import { AiPrepCard } from "./worker-brief";
import type { ComposeState } from "./types";

const modelOptions: SelectOption[] = [
  { value: "Claude Sonnet 5", label: "Claude Sonnet 5", description: "Balanced reasoning and cost for most transformation work." },
  { value: "Claude Opus 5", label: "Claude Opus 5", description: "Highest capability — best for the most complex reasoning." },
  { value: "Claude Opus 5 (independent)", label: "Claude Opus 5 (independent)", description: "Runs isolated from the primary model for unbiased verification." },
  { value: "Claude Haiku 4.5", label: "Claude Haiku 4.5", description: "Fast and inexpensive — good as a fallback or for simple checks." },
];

const routingOptions: SelectOption[] = [
  { value: "fixed", label: "Fixed Model", description: "Uses the same primary model for every task in this Worker's scope." },
  { value: "adaptive", label: "Adaptive Routing", description: "Routes each task to a model chosen by type, risk, latency and cost." },
];

export function ModelsStep({
  compose,
  defaults,
  update,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [showRoutingImpact, setShowRoutingImpact] = useState(false);
  const [showVerifierImpact, setShowVerifierImpact] = useState(false);
  const mc = compose.modelConfig;

  function setModelConfig(patch: Partial<typeof mc>) {
    update("modelConfig", { ...mc, ...patch });
  }

  return (
    <div className="space-y-5">
      <AiPrepCard title="Based on this Worker's workload and expected reasoning complexity, AI recommends the following model configuration.">
        <p className="text-[12px] leading-relaxed text-ink">
          A primary model does the work; an independent verifier checks it — the same model shouldn't grade its own work.
        </p>
      </AiPrepCard>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Model Routing Strategy</p>
            <EditableSelect
              value={mc.routingMode}
              aiValue={defaults.modelConfig.routingMode}
              options={routingOptions}
              onChange={(v) => {
                setModelConfig({ routingMode: v as ComposeState["modelConfig"]["routingMode"] });
                setShowRoutingImpact(v !== defaults.modelConfig.routingMode);
              }}
            />
            {showRoutingImpact && mc.routingMode !== defaults.modelConfig.routingMode && (
              <AiImpactNote
                message="Adaptive routing introduces multiple model dependencies — cost and evaluation coverage will vary by task instead of staying fixed."
                onKeep={() => setShowRoutingImpact(false)}
                onRevert={() => {
                  setModelConfig({ routingMode: defaults.modelConfig.routingMode });
                  setShowRoutingImpact(false);
                }}
              />
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Budget / Cost Control</p>
            <EditableField
              value={`$${mc.monthlyBudgetEstimate.toLocaleString()}/mo`}
              aiValue={`$${defaults.modelConfig.monthlyBudgetEstimate.toLocaleString()}/mo`}
              onChange={(v) => {
                const n = Number(v.replace(/[^0-9.]/g, ""));
                if (!Number.isNaN(n) && n > 0) setModelConfig({ monthlyBudgetEstimate: n });
              }}
              textClassName="text-[13px] text-ink"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Primary Model</p>
            <EditableSelect value={mc.primaryModel} aiValue={defaults.modelConfig.primaryModel} options={modelOptions} onChange={(v) => setModelConfig({ primaryModel: v })} />
            <p className="mt-1 text-[11px] text-ink-mute">Recommended for balanced reasoning and cost on this workload.</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Verifier / Evaluation Model</p>
            <EditableSelect
              value={mc.verifierModel}
              aiValue={defaults.modelConfig.verifierModel}
              options={modelOptions}
              onChange={(v) => {
                setModelConfig({ verifierModel: v });
                setShowVerifierImpact(v !== defaults.modelConfig.verifierModel);
              }}
            />
            <p className="mt-1 text-[11px] text-ink-mute">Required to keep evaluation independent of the primary model.</p>
            {showVerifierImpact && mc.verifierModel !== defaults.modelConfig.verifierModel && (
              <AiImpactNote
                message="Changing the verifier model may affect independent evaluation coverage — it should stay a different model family from the primary."
                onKeep={() => setShowVerifierImpact(false)}
                onRevert={() => {
                  setModelConfig({ verifierModel: defaults.modelConfig.verifierModel });
                  setShowVerifierImpact(false);
                }}
              />
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Fallback Model</p>
            <EditableSelect value={mc.fallbackModel} aiValue={defaults.modelConfig.fallbackModel} options={modelOptions} onChange={(v) => setModelConfig({ fallbackModel: v })} />
            <p className="mt-1 text-[11px] text-ink-mute">Used automatically if the primary model is unavailable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
