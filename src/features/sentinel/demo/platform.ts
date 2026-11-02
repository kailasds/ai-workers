// Read-only platform facts the demo builds on: the Workers and their runs from the offline
// snapshot, so Sentinel shares Worker ids, names and run records with Registry and Learning.

import portfolio from '@/data/mock/worker-portfolio.json'
import records from '@/data/mock/worker-records.json'
import dashboard from '@/data/mock/dashboard-executive.json'
import { contextOf } from '@/features/compose/compose-model'
import type { PortfolioWorker, RuntimeRecord } from '@/lib/types/worker'

export const SNAPSHOT_AT = (portfolio as unknown as { generated_at: string }).generated_at

export const WORKERS: PortfolioWorker[] = [...(portfolio as unknown as { workers: PortfolioWorker[] }).workers].sort((a, b) => a.composition_id.localeCompare(b.composition_id))
export const WORKER_BY_ID = new Map(WORKERS.map((w) => [w.composition_id, w]))

/** Same-named Workers are told apart by a short id. */
const nameCount = new Map<string, number>()
for (const w of WORKERS) nameCount.set(w.name, (nameCount.get(w.name) ?? 0) + 1)
export const shortId = (id: string) => id.slice(0, 8)
export function workerLabel(id: string) {
  const w = WORKER_BY_ID.get(id)
  if (!w) return `Unknown Worker ${shortId(id)}`
  return (nameCount.get(w.name) ?? 0) > 1 ? `${w.name} · ${shortId(id)}` : w.name
}

/** Pools: Workers that share a bounded context. Only these may share knowledge. */
export const POOLS = [...new Set(WORKERS.map((w) => w.bounded_context.key))].map((key) => ({
  key,
  label: contextOf(key)?.scope ?? WORKERS.find((w) => w.bounded_context.key === key)!.bounded_context.label,
  context: WORKERS.find((w) => w.bounded_context.key === key)!.bounded_context.label,
  workerIds: WORKERS.filter((w) => w.bounded_context.key === key).map((w) => w.composition_id),
}))
export const poolLabel = (key: string) => POOLS.find((p) => p.key === key)?.label ?? key

export interface PlatformRun {
  ref: string
  workerId: string
  at: string
  verdict: 'MET' | 'NOT_MET' | 'NOT_ADJUDICABLE'
  cost: number | null
}

const runtimeToComposition = new Map((records as unknown as RuntimeRecord[]).map((r) => [r.id, r.composition_id]))
type LedgerRow = { run_ref: string; worker_id: string; completed_at: string; verdict: PlatformRun['verdict']; model_cost_usd: { state: string; value: string | null } }
export const RUNS: PlatformRun[] = (dashboard as unknown as { run_ledger: { rows: LedgerRow[] } }).run_ledger.rows
  .map((r) => ({ ref: r.run_ref, workerId: runtimeToComposition.get(r.worker_id) ?? '', at: r.completed_at, verdict: r.verdict, cost: r.model_cost_usd.state === 'OBSERVED' && r.model_cost_usd.value ? Number(r.model_cost_usd.value) : null }))
  .filter((r) => r.workerId)
  .sort((a, b) => a.at.localeCompare(b.at))

export const runsOf = (workerId: string) => RUNS.filter((r) => r.workerId === workerId)

/** Learning items sent to the platform: memory records in the snapshot. */
export const LEARNING_ITEMS_SENT = WORKERS.reduce((n, w) => n + w.learning.memories, 0)

/** The runtime state in the snapshot, before any governance stop. */
export const isServing = (id: string) => (WORKER_BY_ID.get(id)?.runtime.serving ?? 0) > 0
