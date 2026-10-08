import { apiGet, ApiError, USE_MOCK } from './client'
import { mockAcknowledge, mockAddDelivery, mockCustomerPackages, mockIdentityChange, mockPortfolio, mockRuntimeRecords, mockWorkspace } from './mock/workers'
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

interface Options {
  signal?: AbortSignal
  /** Mock-only scenario switch (`?mock=`). */
  scenario?: string | null
}

export async function getWorkerPortfolio({ signal, scenario }: Options = {}): Promise<WorkerPortfolio> {
  if (USE_MOCK) return mockPortfolio(scenario ?? null, signal)
  return apiGet<WorkerPortfolio>('/worker-portfolio?limit=200', signal)
}

export async function getCustomerPackages({ signal, scenario }: Options = {}): Promise<CustomerPackage[]> {
  if (USE_MOCK) return mockCustomerPackages(scenario ?? null, signal)
  const directory = await apiGet<{ packages: CustomerPackage[] }>('/customer-packages', signal)
  return directory.packages
}

/**
 * Everything the Worker workspace shows, read at one moment. A runtime id resolves to
 * `{ redirect }` naming its composition, so links from the run ledger land on the Worker.
 */
export async function getWorkerWorkspace(id: string, { signal, scenario }: Options = {}): Promise<WorkerWorkspace | { redirect: string }> {
  if (USE_MOCK) return mockWorkspace(id, scenario ?? null, signal)

  const [portfolio, records, packageable, directory, dashboard] = await Promise.all([
    apiGet<WorkerPortfolio>('/worker-portfolio?limit=200', signal),
    apiGet<RuntimeRecord[]>('/workers', signal),
    apiGet<{ compositions: PackageableComposition[] }>('/compositions/packageable', signal),
    apiGet<{ packages: CustomerPackage[] }>('/customer-packages', signal),
    apiGet<ExecutiveDashboard>('/dashboard/executive?window=all', signal),
  ])
  const worker = portfolio.workers.find((w) => w.composition_id === id)
  if (!worker) {
    const runtime = records.find((r) => r.id === id)
    if (runtime) return { redirect: runtime.composition_id }
    throw new ApiError(404, 'It may have been archived, or the console could not reach it.', 'NOT_FOUND')
  }
  const runtimes = records.filter((r) => r.composition_id === id)
  const ids = new Set(runtimes.map((r) => r.id))
  const brain = await apiGet<WorkerBrain>(`/compositions/${id}/brain`, signal).catch(() => null)
  return {
    read_at: new Date().toISOString(),
    worker,
    composition: packageable.compositions.find((p) => p.composition_id === id) ?? null,
    runtimes,
    runs: dashboard.run_ledger.rows
      .filter((r) => ids.has(r.worker_id))
      .map((r) => ({ ...r, runtime_id: r.worker_id })),
    deliveries: directory.packages.filter((p) => p.composition_id === id),
    brain,
  }
}

export async function changeIdentity(id: string, action: 'pause' | 'resume' | 'revoke'): Promise<IdentityState> {
  if (USE_MOCK) return mockIdentityChange(id, action)
  const response = await fetch(`/api/compositions/${id}/identity/${action}`, { method: 'POST', credentials: 'same-origin' })
  if (!response.ok) throw new ApiError(response.status, 'The change could not be applied.')
  const body = (await response.json()) as { status: IdentityState }
  return body.status
}

export async function getRuntimeRecords({ signal }: Options = {}): Promise<RuntimeRecord[]> {
  if (USE_MOCK) return mockRuntimeRecords(signal)
  return apiGet<RuntimeRecord[]>('/workers', signal)
}

export async function acknowledgeDelivery(deliveryId: string): Promise<CustomerPackage> {
  if (USE_MOCK) return mockAcknowledge(deliveryId)
  const response = await fetch(`/api/customer-packages/${deliveryId}/acknowledge`, { method: 'POST', credentials: 'same-origin' })
  if (!response.ok) throw new ApiError(response.status, 'Acknowledgement could not be recorded.')
  return (await response.json()) as CustomerPackage
}

export { mockAddDelivery as recordPreparedDelivery }
