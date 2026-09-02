import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WorkerStepper, steps } from "@/components/create-worker/worker-stepper";
import { WorkerBrief, computeReadiness } from "@/components/create-worker/worker-brief";
import { PurposeStep } from "@/components/create-worker/purpose-step";
import { CapabilitiesStep } from "@/components/create-worker/capabilities-step";
import { ModelsStep } from "@/components/create-worker/models-step";
import { DodStep } from "@/components/create-worker/dod-step";
import { CustomerConfigStep } from "@/components/create-worker/customer-config-step";
import { SafetyStep } from "@/components/create-worker/safety-step";
import { PackageStep } from "@/components/create-worker/package-step";
import { ProvisioningStage } from "@/components/create-worker/provisioning-stage";
import { createComposeDefaults, draftWorker } from "@/components/create-worker/script";
import type { ComposeState, StepId } from "@/components/create-worker/types";

type Stage = "composing" | "provisioning";

export default function CreateWorker() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("composing");
  const [currentStep, setCurrentStep] = useState<StepId>("purpose");

  const [compose, setCompose] = useState<ComposeState>(() => createComposeDefaults());
  const [defaults, setDefaults] = useState<ComposeState>(() => createComposeDefaults());

  function updateCompose<K extends keyof ComposeState>(key: K, value: ComposeState[K]) {
    setCompose((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplate(templateId: string) {
    const next = createComposeDefaults(templateId);
    setCompose(next);
    setDefaults(next);
  }

  function goTo(id: StepId) {
    setCurrentStep(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    const next = createComposeDefaults();
    setCompose(next);
    setDefaults(next);
    setCurrentStep("purpose");
    setStage("composing");
  }

  const readiness = computeReadiness(compose);
  const completed = new Set(readiness.filter((r) => r.ok).map((r) => r.id));
  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  if (stage === "provisioning") {
    return (
      <ProvisioningStage
        onGoToWorker={() => navigate(`/workers/${draftWorker.id}`)}
        onAssignFirstTask={() => navigate("/work/assign")}
      />
    );
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Compose Worker"
        subtitle="Choose live capabilities, set the boundaries, and prepare a test bundle."
        icon={UserPlus}
        tone="accent"
        actions={
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            New draft
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        <WorkerStepper current={currentStep} completed={completed} onSelect={goTo} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="min-w-0">
            {currentStep === "purpose" && (
              <PurposeStep compose={compose} defaults={defaults} update={updateCompose} onApplyTemplate={applyTemplate} />
            )}
            {currentStep === "capabilities" && <CapabilitiesStep compose={compose} update={updateCompose} />}
            {currentStep === "models" && <ModelsStep compose={compose} defaults={defaults} update={updateCompose} />}
            {currentStep === "dod" && <DodStep compose={compose} update={updateCompose} />}
            {currentStep === "customer" && <CustomerConfigStep compose={compose} update={updateCompose} />}
            {currentStep === "safety" && <SafetyStep compose={compose} defaults={defaults} update={updateCompose} />}
            {currentStep === "package" && (
              <PackageStep compose={compose} defaults={defaults} update={updateCompose} onJumpTo={goTo} onDeploy={() => setStage("provisioning")} />
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" disabled={stepIndex === 0} onClick={() => goTo(steps[stepIndex - 1].id)}>
                Back
              </Button>
              {currentStep !== "package" && <Button onClick={() => goTo(steps[stepIndex + 1].id)}>Continue</Button>}
            </div>
          </div>

          <WorkerBrief compose={compose} autonomy={draftWorker.autonomy} onJumpTo={goTo} />
        </div>
      </div>
    </div>
  );
}
