import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { EditableField } from "@/components/shared/editable";
import { Badge } from "@/components/ui/badge";
import { AiPrepCard } from "./worker-brief";
import { templates } from "./script";
import type { ComposeState } from "./types";
import { cn } from "@/lib/utils";

export function PurposeStep({
  compose,
  defaults,
  update,
  onApplyTemplate,
}: {
  compose: ComposeState;
  defaults: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
  onApplyTemplate: (templateId: string) => void;
}) {
  const [justApplied, setJustApplied] = useState<string | null>(null);
  const activeTemplate = templates.find((t) => t.id === compose.templateId);

  function selectTemplate(id: string) {
    onApplyTemplate(id);
    setJustApplied(id);
    window.setTimeout(() => setJustApplied(null), 4000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <p className="text-[15px] font-bold text-ink">Start from a template</p>
        <p className="mt-0.5 text-[12.5px] text-ink-mute">
          Selecting a template proactively configures this Worker — you can review and change anything after.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => {
            const active = t.id === compose.templateId;
            return (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={cn(
                  "text-left rounded-[12px] border p-3.5 transition-colors",
                  active ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong hover:bg-card-sunken"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                  {active && <Check className="h-3.5 w-3.5 text-accent-ink shrink-0" strokeWidth={2.5} />}
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-mute">{t.description}</p>
                {t.id !== "custom" && (
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-ink-faint">
                    <span>{t.capabilityCount} capabilities</span>
                    <span>·</span>
                    <span>{t.suggestedDoDCount} DoD criteria</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {justApplied && activeTemplate && activeTemplate.id !== "custom" && (
        <AiPrepCard title={`AI has prepared this Worker using the ${activeTemplate.name} template.`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-ink">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {activeTemplate.skills.length} skills added</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {activeTemplate.capabilityCount} capabilities recommended</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> Definition of Done prepared</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> Safety configuration suggested</span>
          </div>
        </AiPrepCard>
      )}

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.9} />
          <p className="text-[15px] font-bold text-ink">What should this Worker deliver?</p>
        </div>
        <p className="text-[12.5px] text-ink-mute mb-4">Define one outcome and the inputs this Worker may accept.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Worker Name</label>
            <div className="mt-1">
              <EditableField value={compose.name} aiValue={defaults.name} onChange={(v) => update("name", v)} textClassName="text-[14px] font-medium text-ink" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Accountable Owner</label>
            <div className="mt-1">
              <EditableField value={compose.owner} aiValue={defaults.owner} onChange={(v) => update("owner", v)} textClassName="text-[14px] text-ink" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Business / Application Context</label>
            <div className="mt-1">
              <EditableField
                value={compose.businessContext}
                aiValue={defaults.businessContext}
                onChange={(v) => update("businessContext", v)}
                placeholder="Which team and system does this Worker operate in?"
                textClassName="text-[13px] text-ink-soft"
                maxLength={500}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Measurable Outcome</label>
            <div className="mt-1">
              <EditableField
                value={compose.objective}
                aiValue={defaults.objective}
                onChange={(v) => update("objective", v)}
                multiline
                placeholder="What does this Worker deliver, and what does success look like?"
                textClassName="text-[13px] leading-relaxed text-ink-soft"
                maxLength={500}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Accepted Input Boundary</label>
            <div className="mt-1">
              <EditableField
                value={compose.inputBoundary}
                aiValue={defaults.inputBoundary}
                onChange={(v) => update("inputBoundary", v)}
                multiline
                placeholder="What data or artifacts can this Worker accept, and from where?"
                textClassName="text-[13px] leading-relaxed text-ink-soft"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-ink-faint">Creates <code className="text-ink-mute">worker.yaml</code>, <code className="text-ink-mute">charter.md</code>, and the outcome contract.</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Out of scope</p>
        <div className="flex flex-wrap gap-1.5">
          {compose.wontList.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
