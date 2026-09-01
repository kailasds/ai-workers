import { useEffect, useState } from "react";
import { Check, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { provisioningSteps, draftWorker } from "./script";

export function ProvisioningStage({
  onGoToWorker,
  onAssignFirstTask,
}: {
  onGoToWorker: () => void;
  onAssignFirstTask: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const done = stepIndex >= provisioningSteps.length;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setStepIndex((i) => i + 1), 380);
    return () => window.clearTimeout(t);
  }, [stepIndex, done]);

  return (
    <div className="flex flex-col items-center px-8 pt-24 pb-16 text-center">
      {!done ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.5} />
          <h2 className="mt-5 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Provisioning Your AI Worker</h2>
          <p className="mt-1.5 text-[13px] text-ink-mute">{draftWorker.name}</p>

          <div className="mt-7 w-fit space-y-2.5 text-left">
            {provisioningSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={
                    i < stepIndex
                      ? "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-status-green text-white"
                      : i === stepIndex
                      ? "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-accent"
                      : "grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border-strong"
                  }
                >
                  {i < stepIndex && <Check className="h-3 w-3" strokeWidth={3} />}
                  {i === stepIndex && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                </div>
                <span className={i <= stepIndex ? "text-[13px] text-ink" : "text-[13px] text-ink-faint"}>{step}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full card-hero text-white">
            <Rocket className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h2 className="mt-5 text-[22px] font-bold tracking-[-0.01em] text-ink font-display">AI Worker Ready</h2>
          <p className="mt-1.5 text-[13.5px] text-ink-mute">
            {draftWorker.name} is ready to accept work.
          </p>
          <div className="mt-7 flex items-center justify-center gap-2.5">
            <Button variant="secondary" onClick={onAssignFirstTask}>
              Assign First Task
            </Button>
            <Button onClick={onGoToWorker}>Go to Worker</Button>
          </div>
        </div>
      )}
    </div>
  );
}
