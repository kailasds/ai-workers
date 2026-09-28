import { useWorker } from "./use-worker";
import { WorkerScopeCard } from "@/components/shared/worker-scope-card";

export default function Responsibilities() {
  const worker = useWorker();

  return (
    <div className="pb-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-bold tracking-[-0.01em] text-ink font-display">Responsibilities</h2>
        <p className="mt-1 text-[13px] text-ink-mute">
          What this worker owns, what it can decide, and what always requires approval.
        </p>
      </div>
      <WorkerScopeCard responsibility={worker.responsibility} />
    </div>
  );
}
