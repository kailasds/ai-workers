import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, Sparkle, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { getWorker } from "@/lib/data";

type Stage = "idle" | "generating" | "blueprint";

const generationSteps = [
  "Analyzing the role description",
  "Defining the bounded scope and outcome",
  "Assembling the skill set and agent mesh",
  "Drafting governance policies and the Definition of Done",
];

const worker = getWorker("cobol-modernization-worker")!;

export default function CreateWorker() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("idle");
  const [prompt, setPrompt] = useState(
    "I need an AI worker that modernizes legacy COBOL applications into Java while preserving business behavior, and that proves functional equivalence before it can call the work done."
  );
  const [stepIndex, setStepIndex] = useState(0);

  function generate() {
    setStage("generating");
    setStepIndex(0);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setStepIndex(i);
      if (i >= generationSteps.length) {
        window.clearInterval(interval);
        window.setTimeout(() => setStage("blueprint"), 350);
      }
    }, 500);
  }

  const dodRequirementCount = worker.definitionOfDone.sections.flatMap((s) => s.requirements).length;

  return (
    <div className="pb-14">
      <PageHeader
        title="Create AI Worker"
        subtitle="Describe the outcome it owns. AI will help provision the worker."
        icon={UserPlus}
        tone="accent"
      />

      <div className="px-8 max-w-3xl">
        {stage === "idle" && (
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <label className="text-[13px] font-medium text-ink">What outcome should this AI Worker own?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-3"
              placeholder="Describe the role, the bounded outcome it owns, and what proves the work is done…"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[12px] text-ink-mute">
                AI will propose scope, skills, agent mesh, governance and a Definition of Done — not just a prompt.
              </p>
              <Button onClick={generate} disabled={!prompt.trim()}>
                <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
                Generate Blueprint
              </Button>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="rounded-card border border-border bg-card shadow-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={1.5} />
              <p className="text-[13.5px] font-medium text-ink">Provisioning the worker…</p>
            </div>
            <div className="space-y-3">
              {generationSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={
                      i < stepIndex
                        ? "grid h-5 w-5 place-items-center rounded-full bg-status-green text-white"
                        : i === stepIndex
                        ? "grid h-5 w-5 place-items-center rounded-full border-2 border-accent"
                        : "grid h-5 w-5 place-items-center rounded-full border border-border-strong"
                    }
                  >
                    {i < stepIndex && <Check className="h-3 w-3" strokeWidth={3} />}
                    {i === stepIndex && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                  </div>
                  <span className={i <= stepIndex ? "text-[13px] text-ink" : "text-[13px] text-ink-faint"}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === "blueprint" && (
          <div className="space-y-5">
            <div className="rounded-card border border-accent-border bg-accent-soft px-5 py-3.5 flex items-center gap-2.5">
              <Sparkle className="h-4 w-4 text-accent-ink shrink-0" strokeWidth={1.5} />
              <p className="text-[12.5px] text-accent-ink">
                Proposed from your description — every suggestion below is editable before the worker is provisioned.
              </p>
            </div>

            <BlueprintSection title="Identity">
              <p className="text-[16px] font-medium text-ink">{worker.name}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-mute">
                {worker.role} · {worker.domain}
              </p>
              <div className="mt-2">
                <AutonomyBadge level={worker.autonomy} />
              </div>
            </BlueprintSection>

            <BlueprintSection title="Purpose &amp; Bounded Outcome">
              <p className="text-[13.5px] leading-relaxed text-ink-soft">{worker.scope.primaryPurpose}</p>
              <p className="mt-2 text-[12.5px] text-ink-mute">
                <span className="font-medium text-ink">Owns:</span> {worker.scope.expectedOutcome}
              </p>
            </BlueprintSection>

            <BlueprintSection title="Suggested Skills" reason="Derived from the modernization scope you described.">
              <div className="flex flex-wrap gap-1.5">
                {worker.skills.map((s) => (
                  <Badge key={s.id} variant="green">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    {s.name}
                  </Badge>
                ))}
              </div>
            </BlueprintSection>

            <BlueprintSection title="Suggested Agent Mesh" reason="One orchestrator plus one specialist per transformation stage.">
              <div className="grid grid-cols-2 gap-2">
                {worker.agentMesh.map((a) => (
                  <div key={a.id} className="rounded-[10px] border border-border px-3 py-2 text-[12.5px] text-ink-soft">
                    {a.name}
                    {a.isOrchestrator && <span className="ml-1.5 text-[10.5px] text-accent-ink">· Orchestrator</span>}
                  </div>
                ))}
              </div>
            </BlueprintSection>

            <BlueprintSection title="Suggested Knowledge Sources">
              <div className="space-y-1.5">
                {worker.knowledgeSources.slice(0, 4).map((k) => (
                  <div key={k.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <span className="h-1 w-1 rounded-full bg-ink-faint" />
                    {k.name}
                  </div>
                ))}
              </div>
            </BlueprintSection>

            <BlueprintSection title="Suggested Governance Policies">
              <div className="flex flex-wrap gap-1.5">
                {worker.governance.policies.map((p) => (
                  <Badge key={p.id} variant="outline">
                    {p.name}
                  </Badge>
                ))}
              </div>
            </BlueprintSection>

            <BlueprintSection
              title="Suggested Definition of Done"
              reason="The worker cannot declare this work complete until every checkpoint below passes, with evidence attached."
            >
              <p className="text-[13px] text-ink-soft">{dodRequirementCount} required checkpoints across {worker.definitionOfDone.sections.length} sections.</p>
            </BlueprintSection>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setStage("idle")}>
                Review Blueprint
              </Button>
              <Button onClick={() => navigate(`/workers/${worker.id}`)}>Provision Worker</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlueprintSection({
  title,
  reason,
  children,
}: {
  title: string;
  reason?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <h3 className="text-[13.5px] font-medium text-ink">{title}</h3>
      {reason && <p className="mt-0.5 text-[11.5px] text-ink-mute italic">{reason}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
