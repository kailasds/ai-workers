import { useMemo } from 'react'
import { useResource } from '@/hooks/use-resource'
import { useScenario } from '@/hooks/use-scenario'
import { getSentinelLearning, getSentinelOverview } from '@/lib/api/catalog'
import { attentionOf } from './sentinel-model'

/**
 * The Platform Sentinel reads every Sentinel view shares: the overview and the per-Worker
 * reporting fleet. The attention list is built once here, so the Overview and the Brain tab
 * count the same things. `?mock=` applies to the overview.
 */
export function useSentinel() {
  const scenario = useScenario()
  const overview = useResource(`sentinel-overview:${scenario}`, (signal) => getSentinelOverview({ signal, scenario }))
  const fleet = useResource('sentinel-learning', (signal) => getSentinelLearning({ signal }))
  const o = overview.data
  const attention = useMemo(() => (o ? attentionOf(o, fleet.data) : []), [o, fleet.data])
  return {
    overview,
    fleet,
    attention,
    source: o
      ? { snapshotAt: o.generated_at, updatedAt: overview.updatedAt, refreshFailed: Boolean(overview.error && o), onRetry: overview.refresh, partial: fleet.error && !fleet.data ? 'Per-Worker reporting couldn’t be read' : null }
      : undefined,
  }
}
