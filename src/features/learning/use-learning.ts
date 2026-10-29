import { useCallback, useMemo } from 'react'
import { useResource } from '@/hooks/use-resource'
import { useScenario } from '@/hooks/use-scenario'
import { getSentinelOverview, getSkillLibrary } from '@/lib/api/catalog'
import { getWorkerBrains, getWorkerPortfolio } from '@/lib/api/workers'
import { buildEvents, heldItems, workerRefs } from './learning-model'

/**
 * The reads every Learning view shares: the portfolio, each Worker's brain, the Platform
 * Sentinel overview and the Skill library (for titles). `?mock=` scenarios apply to the
 * portfolio, so loading / error / empty / slow can be reviewed on every view.
 */
export function useLearning() {
  const scenario = useScenario()
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const ids = useMemo(() => portfolio.data?.workers.map((w) => w.composition_id) ?? [], [portfolio.data])
  // Keyed by the Worker list, and only trusted once it answers for that list: an empty read made
  // before the portfolio arrived must never show as "nothing held".
  const brainsKey = `brains:${scenario}:${ids.length}`
  const brains = useResource(brainsKey, (signal) => (ids.length ? getWorkerBrains(ids, { signal, scenario }) : Promise.resolve([])))
  const brainData = portfolio.data && brains.dataKey === brainsKey ? brains.data : null
  const sentinel = useResource('sentinel-overview:null', (signal) => getSentinelOverview({ signal }))
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))

  const workers = useMemo(() => portfolio.data?.workers ?? [], [portfolio.data])
  const refs = useMemo(() => workerRefs(workers), [workers])
  const titles = useMemo(() => new Map((skills.data?.skills ?? []).map((s) => [s.name, s.title])), [skills.data])
  // A Skill without a library entry keeps its key; the title is a nicety, never required.
  const skillTitle = useCallback((key: string) => titles.get(key) ?? key, [titles])
  const ready = Boolean(portfolio.data && brainData)
  const events = useMemo(() => (ready ? buildEvents(workers, brainData ?? [], sentinel.data, skillTitle) : []), [ready, workers, brainData, sentinel.data, skillTitle])
  const held = useMemo(() => heldItems(brainData ?? [], refs, skillTitle), [brainData, refs, skillTitle])
  const brainsRead = brainData?.filter((b) => b.state === 'ok').length ?? 0
  const learningWorkers = useMemo(() => new Set([...workers.filter((w) => w.learning.memories > 0).map((w) => w.composition_id), ...held.map((h) => h.worker?.id).filter(Boolean)]).size, [workers, held])

  return {
    portfolio,
    brains,
    sentinel,
    workers,
    refs,
    events,
    held,
    brainsRead,
    /** Workers with any learning activity: memory records or held items. The Brain tab count. */
    learningWorkers,
    ready,
    error: portfolio.error && !portfolio.data ? portfolio.error : null,
    source: {
      snapshotAt: portfolio.data?.generated_at,
      updatedAt: portfolio.updatedAt,
      refreshFailed: Boolean(portfolio.error && portfolio.data),
      partial: brainData && brainsRead < workers.length ? `Brain details for ${brainsRead} of ${workers.length} Workers` : null,
    },
    refresh: () => {
      portfolio.refresh()
      brains.refresh()
      sentinel.refresh()
    },
  }
}
