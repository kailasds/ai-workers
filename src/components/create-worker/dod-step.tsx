import { Plus, X as XIcon, RotateCcw, AlertTriangle, BadgeCheck } from "lucide-react";
import { EditableField } from "@/components/shared/editable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiPrepCard } from "./worker-brief";
import { createComposeDefaults } from "./script";
import type { ComposeState, ComposeDoDSection } from "./types";
import type { DoDRequirement } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DodStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const allReqs = compose.dodSections.flatMap((s) => s.requirements);
  const hasPrivacyCriterion = allReqs.some((r) => /privacy|data protection/i.test(r.label));

  function setSections(sections: ComposeDoDSection[]) {
    update("dodSections", sections);
  }

  function updateRequirement(sectionId: string, reqId: string, patch: Partial<DoDRequirement>) {
    setSections(
      compose.dodSections.map((s) =>
        s.id === sectionId ? { ...s, requirements: s.requirements.map((r) => (r.id === reqId ? { ...r, ...patch } : r)) } : s
      )
    );
  }

  function removeRequirement(sectionId: string, reqId: string) {
    setSections(compose.dodSections.map((s) => (s.id === sectionId ? { ...s, requirements: s.requirements.filter((r) => r.id !== reqId) } : s)));
  }

  function addRequirement(sectionId: string) {
    const newReq: DoDRequirement = { id: `custom-${Date.now()}`, label: "New criterion", status: "pending", evidence: [], check: "", owner: "" };
    setSections(compose.dodSections.map((s) => (s.id === sectionId ? { ...s, requirements: [...s.requirements, newReq] } : s)));
  }

  function addPrivacyCriterion() {
    const newReq: DoDRequirement = {
      id: `custom-${Date.now()}`,
      label: "Data privacy validation passed",
      status: "pending",
      evidence: [],
      check: "PII handling reviewed against data privacy policy",
      owner: "AI Sentinel",
      adjudicator: "Human Reviewer",
    };
    setSections(
      compose.dodSections.map((s, i) => (i === compose.dodSections.length - 1 ? { ...s, requirements: [...s.requirements, newReq] } : s))
    );
  }

  function regenerate() {
    setSections(createComposeDefaults(compose.templateId ?? undefined).dodSections);
  }

  return (
    <div className="space-y-5">
      <AiPrepCard title={`AI has prepared ${allReqs.length} success criteria for this Worker.`}>
        <div className="flex items-center justify-between">
          <p className="text-[12px] leading-relaxed text-ink">
            This Worker cannot mark work complete until every required checkpoint below passes, with evidence attached.
          </p>
          <Button size="sm" variant="secondary" onClick={regenerate} className="shrink-0 ml-3">
            <RotateCcw className="h-3 w-3" strokeWidth={2} /> Regenerate
          </Button>
        </div>
      </AiPrepCard>

      {!hasPrivacyCriterion && (
        <div className="rounded-card border border-status-amber/25 bg-status-amber-soft px-4 py-3">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-status-amber">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
            AI Notice
          </p>
          <p className="mt-1 text-[12px] text-ink">This Worker processes customer data, but no data privacy validation has been added.</p>
          <Button size="sm" className="mt-2" onClick={addPrivacyCriterion}>
            Add Suggested Criterion
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {compose.dodSections.map((section) => (
          <div key={section.id} className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-card-sunken px-4 py-2.5">
              <p className="text-[12.5px] font-semibold text-ink">{section.title}</p>
              <span className="text-[11px] text-ink-mute">{section.requirements.length} criteria</span>
            </div>

            <div className="grid grid-cols-[1.6fr_1.6fr_1.2fr_1fr_auto] gap-3 border-b border-border px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
              <span>Success Criteria</span>
              <span>Validation Method</span>
              <span>Evidence</span>
              <span>Owner / Validator</span>
              <span />
            </div>

            {section.requirements.map((r) => (
              <div key={r.id} className="group/row grid grid-cols-[1.6fr_1.6fr_1.2fr_1fr_auto] items-start gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
                <EditableField value={r.label} aiValue={r.label} onChange={(v) => updateRequirement(section.id, r.id, { label: v })} textClassName="text-[12px] text-ink" />
                <EditableField
                  value={r.check ?? ""}
                  aiValue={r.check ?? ""}
                  onChange={(v) => updateRequirement(section.id, r.id, { check: v })}
                  placeholder="How is this validated?"
                  textClassName="text-[12px] text-ink-soft"
                />
                <EditableField
                  value={r.evidence.join(", ")}
                  aiValue={r.evidence.join(", ")}
                  onChange={(v) => updateRequirement(section.id, r.id, { evidence: v ? v.split(",").map((x) => x.trim()).filter(Boolean) : [] })}
                  placeholder="Evidence source"
                  textClassName="text-[12px] text-ink-soft"
                />
                <EditableField
                  value={r.owner ?? ""}
                  aiValue={r.owner ?? ""}
                  onChange={(v) => updateRequirement(section.id, r.id, { owner: v })}
                  placeholder="Owner"
                  textClassName="text-[12px] text-ink-soft"
                />
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant={r.status === "passed" ? "green" : "amber"}>
                    {r.status === "passed" ? "Passed" : "Suggested"}
                  </Badge>
                  <button onClick={() => removeRequirement(section.id, r.id)} className="opacity-0 transition-opacity group-hover/row:opacity-100">
                    <XIcon className="h-3 w-3 text-ink-faint hover:text-status-red" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addRequirement(section.id)}
              className="flex w-full items-center gap-1.5 px-4 py-2.5 text-[11.5px] text-ink-mute transition hover:bg-card-sunken hover:text-accent-ink"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} /> Add criterion
            </button>
          </div>
        ))}
      </div>

      <p className={cn("flex items-center gap-1.5 text-[11px]", "text-ink-mute")}>
        <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        AI validation: {compose.dodSections.filter((s) => s.requirements.length > 0).length} of {compose.dodSections.length} critical
        completion sections have criteria defined.
      </p>
    </div>
  );
}
