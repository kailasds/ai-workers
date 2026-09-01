import { useWorker } from "./use-worker";
import { DefinitionOfDonePanel } from "@/components/shared/definition-of-done-panel";

export default function DefinitionOfDone() {
  const worker = useWorker();

  if (worker.definitionOfDone.sections.length === 0) {
    return (
      <div className="pb-10">
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No Definition of Done contract configured for this worker yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <DefinitionOfDonePanel contract={worker.definitionOfDone} />
    </div>
  );
}
