// MOCK DATA LAYER. Not production data.
//
// Serves the 2026-10-06 offline capture: worker portfolio, runtime records, packageable
// compositions, customer packages and the one captured brain read. Identity pause / resume /
// revoke change an in-memory copy so the workspace can show what a write does; nothing leaves
// the browser and a reload restores the capture.

import portfolioCapture from '@/data/mock/worker-portfolio.json'
import recordsCapture from '@/data/mock/worker-records.json'
import packageableCapture from '@/data/mock/packageable.json'
import customerCapture from '@/data/mock/customer-packages.json'
import brainCapture from '@/data/mock/worker-brain-a9cb82d0.json'
import dashboardCapture from '@/data/mock/dashboard-executive.json'
import { ApiError } from '../client'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'
import type {
  CustomerPackage,
  IdentityState,
  PackageableComposition,
  RuntimeRecord,
  WorkerBrain,
  WorkerPortfolio,
  WorkerWorkspace,
} from '@/lib/types/worker'

const clone = <T,>(value: T): T => structuredClone(value)

const portfolio = clone(portfolioCapture as unknown as WorkerPortfolio)
const records = clone(recordsCapture as unknown as RuntimeRecord[])
const packageable = clone((packageableCapture as unknown as { compositions: PackageableComposition[] }).compositions)
const customer = clone((customerCapture as unknown as { packages: CustomerPackage[] }).packages)
const brains: Record<string, WorkerBrain> = { 'a9cb82d0-4508-4a8b-bd56-fbdbb856018b': brainCapture as unknown as WorkerBrain }
const ledger = (dashboardCapture as unknown as ExecutiveDashboard).run_ledger.rows

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function scenarioGate(scenario: string | null, signal?: AbortSignal) {
  await delay(scenario === 'slow' ? 2500 : 350, signal)
  if (scenario === 'loading') await new Promise<never>((_, reject) => signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  if (scenario === 'error') throw new ApiError(503, 'The portfolio service did not respond.', 'UPSTREAM_UNAVAILABLE')
}

export async function mockPortfolio(scenario: string | null, signal?: AbortSignal): Promise<WorkerPortfolio> {
  await scenarioGate(scenario, signal)
  if (scenario === 'empty') return { ...portfolio, totals: { workers: 0, serving: 0, attention: 0 }, bounded_contexts: [], workers: [] }
  return clone(portfolio)
}

export async function mockCustomerPackages(scenario: string | null, signal?: AbortSignal): Promise<CustomerPackage[]> {
  await scenarioGate(scenario, signal)
  return scenario === 'empty' ? [] : clone(customer)
}

/** Resolves a composition id, or a runtime id (redirected to its composition, as the console does). */
export async function mockWorkspace(id: string, scenario: string | null, signal?: AbortSignal): Promise<WorkerWorkspace | { redirect: string }> {
  await scenarioGate(scenario, signal)
  let worker = portfolio.workers.find((w) => w.composition_id === id)
  if (!worker) {
    const runtime = records.find((r) => r.id === id)
    if (runtime) return { redirect: runtime.composition_id }
    throw new ApiError(404, 'It may have been archived, or the console could not reach it.', 'NOT_FOUND')
  }
  worker = clone(worker)
  const runtimes = records.filter((r) => r.composition_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const runtimeIds = new Set(runtimes.map((r) => r.id))
  return {
    read_at: new Date().toISOString(),
    worker,
    composition: clone(packageable.find((p) => p.composition_id === id) ?? null),
    runtimes: clone(runtimes),
    runs: ledger
      .filter((r) => runtimeIds.has(r.worker_id))
      .map((r) => ({
        run_ref: r.run_ref,
        runtime_id: r.worker_id,
        verdict: r.verdict,
        completed_at: r.completed_at,
        duration_seconds: r.duration_seconds,
        total_tokens: r.total_tokens,
        model_cost_usd: r.model_cost_usd,
        source_technology: r.source_technology,
        target_technology: r.target_technology,
        context_label: r.context_label,
      })),
    deliveries: clone(customer.filter((c) => c.composition_id === id)),
    brain: clone(brains[id] ?? null),
  }
}

export async function mockIdentityChange(id: string, action: 'pause' | 'resume' | 'revoke'): Promise<IdentityState> {
  await delay(600)
  const composition = packageable.find((p) => p.composition_id === id)
  const worker = portfolio.workers.find((w) => w.composition_id === id)
  if (!composition || !worker) throw new ApiError(404, 'The change could not be applied.')
  const current = composition.identity.status
  if (current === 'REVOKED') throw new ApiError(409, 'This identity is revoked. It cannot be changed or issued again.')
  const next: IdentityState = action === 'pause' ? 'PAUSED' : action === 'resume' ? 'ACTIVE' : 'REVOKED'
  composition.identity.status = next
  worker.identity.state = next
  if (next === 'REVOKED') {
    composition.identity.revoked_at = new Date().toISOString()
    composition.identity.credential_state = 'DISABLED'
    composition.identity.can_present_credential = false
  }
  return next
}

export async function mockRuntimeRecords(signal?: AbortSignal): Promise<RuntimeRecord[]> {
  await delay(250, signal)
  return clone(records)
}

/** MOCK: records an acknowledgement on a delivery record. It is a record only, never proof of deployment. */
export async function mockAcknowledge(deliveryId: string): Promise<CustomerPackage> {
  await delay(500)
  const pkg = customer.find((c) => c.delivery_id === deliveryId)
  if (!pkg) throw new ApiError(404, 'Acknowledgement could not be recorded.')
  if (pkg.state !== 'SHARED' && pkg.state !== 'DOWNLOADED') throw new ApiError(409, 'Only a shared or downloaded package can be acknowledged.')
  pkg.state = 'ACKNOWLEDGED'
  pkg.last_evidence_at = new Date().toISOString()
  return clone(pkg)
}

/** MOCK: the delivery record a finished preparation leaves behind. */
export function mockAddDelivery(pkg: CustomerPackage) {
  customer.unshift(clone(pkg))
}
