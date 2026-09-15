import { useState } from "react";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WorkerStepper, steps } from "@/components/create-worker/worker-stepper";
import { IdentityPanel } from "@/components/create-worker/identity-panel";
import { WorkerTypeStep } from "@/components/create-worker/worker-type-step";
import { IdentityStep } from "@/components/create-worker/identity-step";
import { IntentStep } from "@/components/create-worker/intent-step";
import { BrainStep } from "@/components/create-worker/brain-step";
import { DodStep } from "@/components/create-worker/dod-step";
import { AutonomyStep } from "@/components/create-worker/autonomy-step";
import { PackageStep } from "@/components/create-worker/package-step";
import { createComposeDefaults } from "@/components/create-worker/script";
import type { ComposeState, StepId } from "@/components/create-worker/types";

export default function CreateWorker() {
  const [currentStep, setCurrentStep] = useState<StepId>("identity");
  const [compose, setCompose] = useState<ComposeState>(() => createComposeDefaults());

  function updateCompose<K extends keyof ComposeState>(key: K, value: ComposeState[K]) {
    setCompose((prev) => ({
      ...prev,
      [key]: value,
      revision: key === "brain" || key === "revision" ? prev.revision : prev.revision + 1,
    }));
  }

  function goTo(id: StepId) {
    setCurrentStep(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setCompose(createComposeDefaults());
    setCurrentStep("identity");
  }

  const completed = new Set<StepId>(
    (
      [
        ["identity", compose.identityConfirmed],
        ["intent", compose.intentConfirmed],
        ["brain", compose.brain.status === "done"],
        ["dod", compose.dodConfirmed],
        ["autonomy", compose.autonomyConfirmed],
      ] as [StepId, boolean][]
    )
      .filter(([, ok]) => ok)
      .map(([id]) => id)
  );

  const reachable = new Set<StepId>(["identity"]);
  if (compose.identityConfirmed) reachable.add("intent");
  if (compose.intentConfirmed) reachable.add("brain");
  if (compose.brain.status === "done") reachable.add("dod");
  if (compose.dodConfirmed) reachable.add("autonomy");

  if (!compose.workerTypeId) {
    return (
      <div className="pb-16">
        <PageHeader
          title="Compose an AI Worker"
          subtitle="Choose the work. Confirm its preset. Deploy one governed Worker."
          icon={Wrench}
          tone="accent"
        />
        <div className="px-8">
          <WorkerTypeStep onSelect={(id) => updateCompose("workerTypeId", id)} />
        </div>
      </div>
    );
  }

  const showPackage = currentStep === "autonomy" && compose.autonomyConfirmed;

  return (
    <div className="pb-16">
      <PageHeader
        title="Compose an AI Worker"
        subtitle="Choose the work. Confirm its preset. Deploy one governed Worker."
        icon={Wrench}
        tone="accent"
        actions={
          <Button variant="secondary" onClick={reset}>
            Start over
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        <WorkerStepper current={currentStep} completed={completed} reachable={reachable} onSelect={goTo} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
          <div className="min-w-0">
            {showPackage ? (
              <PackageStep
                compose={compose}
                update={updateCompose}
                onReset={reset}
                onBackToWorker={() => updateCompose("autonomyConfirmed", false)}
              />
            ) : (
              <>
                {currentStep === "identity" && <IdentityStep compose={compose} update={updateCompose} />}
                {currentStep === "intent" && <IntentStep compose={compose} update={updateCompose} />}
                {currentStep === "brain" && <BrainStep compose={compose} update={updateCompose} />}
                {currentStep === "dod" && <DodStep />}
                {currentStep === "autonomy" && <AutonomyStep compose={compose} update={updateCompose} />}

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const idx = steps.findIndex((s) => s.id === currentStep);
                      if (idx === 0) updateCompose("workerTypeId", null);
                      else goTo(steps[idx - 1].id);
                    }}
                  >
                    Back
                  </Button>
                  <StepAction compose={compose} currentStep={currentStep} update={updateCompose} goTo={goTo} />
                </div>
              </>
            )}
          </div>

          <IdentityPanel compose={compose} onJumpTo={goTo} />
        </div>
      </div>
    </div>
  );
}

function StepAction({
  compose,
  currentStep,
  update,
  goTo,
}: {
  compose: ComposeState;
  currentStep: StepId;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
  goTo: (id: StepId) => void;
}) {
  switch (currentStep) {
    case "identity": {
      const disabled = !compose.identityId || !compose.boundedContextId;
      return (
        <Button
          disabled={disabled}
          onClick={() => {
            update("identityConfirmed", true);
            goTo("intent");
          }}
        >
          Confirm identity
        </Button>
      );
    }
    case "intent":
      return (
        <Button
          onClick={() => {
            update("intentConfirmed", true);
            goTo("brain");
          }}
        >
          Confirm Worker intent
        </Button>
      );
    case "brain":
      return (
        <Button disabled={compose.brain.status !== "done"} onClick={() => goTo("dod")}>
          {compose.brain.status === "done" ? "Continue" : "Assembling…"}
        </Button>
      );
    case "dod":
      return (
        <Button
          onClick={() => {
            update("dodConfirmed", true);
            goTo("autonomy");
          }}
        >
          Confirm Definition of Done
        </Button>
      );
    case "autonomy":
      return <Button onClick={() => update("autonomyConfirmed", true)}>Package and deploy</Button>;
    default:
      return null;
  }
}
