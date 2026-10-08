import { apiGet, ApiError, USE_MOCK } from './client'
import { buildMockDashboard } from './mock/dashboard'
import type { ExecutiveDashboard, Period } from '@/lib/types/dashboard'

export const PERIODS: { value: Period; label: string; long: string }[] = [
  { value: '7d', label: '7 days', long: 'last 7 days' },
  { value: '30d', label: '30 days', long: 'last 30 days' },
  { value: '90d', label: '90 days', long: 'last 90 days' },
  { value: 'all', label: 'All time', long: 'all time' },
]

export const DEFAULT_PERIOD: Period = '30d'

export interface DashboardRequest {
  period: Period
  signal?: AbortSignal
  /** Mock-only scenario switch (`?mock=` in the URL), used to review non-happy states. */
  scenario?: string | null
}

/** The server answers 422 TZ_INVALID when it cannot use the reader's zone; retry without it. */
export async function getExecutiveDashboard({ period, signal, scenario }: DashboardRequest): Promise<ExecutiveDashboard> {
  if (USE_MOCK) return buildMockDashboard(period, scenario ?? null, signal)

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const base = `/dashboard/executive?window=${period}`
  let data: ExecutiveDashboard
  try {
    data = await apiGet<ExecutiveDashboard>(`${base}&tz=${encodeURIComponent(tz)}`, signal)
  } catch (error) {
    if (error instanceof ApiError && error.code === 'TZ_INVALID') data = await apiGet<ExecutiveDashboard>(base, signal)
    else throw error
  }
  // A 200 without these is a malformed reply: treat as an error, never render it.
  if (!data?.freshness || !data?.run_economics) {
    throw new ApiError(502, 'The executive dashboard could not be read from this platform.')
  }
  return data
}
