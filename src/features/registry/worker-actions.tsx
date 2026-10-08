import type { PortfolioWorker } from '@/lib/types/worker'

/** Whether the Worker console can be opened, and if not, why (shown wherever the action is). */
export function consoleState(worker: PortfolioWorker): { reachable: boolean; reason: string } {
  if (worker.runtime.reachable_worker_id) return { reachable: true, reason: '' }
  if (worker.runtime.serving > 0) return { reachable: false, reason: 'Console not reachable: the serving runtime is not healthy.' }
  return { reachable: false, reason: 'Console needs a serving runtime.' }
}
