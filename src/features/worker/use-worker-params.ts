import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export type WorkerView = 'overview' | 'runs' | 'runtimes' | 'memory' | 'sentinel' | 'delivery'

export const WORKER_VIEWS: { value: WorkerView; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'runs', label: 'Runs' },
  { value: 'runtimes', label: 'Runtimes' },
  { value: 'memory', label: 'Memory and learning' },
  { value: 'sentinel', label: 'Sentinel' },
  { value: 'delivery', label: 'Delivery' },
]

// Older links keep working: the legacy view keys fold into the merged sections.
const LEGACY: Record<string, WorkerView> = {
  passport: 'overview',
  instructions: 'overview',
  dod: 'overview',
  brain: 'memory',
  knowledge: 'memory',
  learning: 'memory',
}

export function useWorkerParams() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('view') ?? 'overview'
  const view: WorkerView = (WORKER_VIEWS.some((v) => v.value === raw) ? raw : LEGACY[raw] ?? 'overview') as WorkerView
  const run = params.get('run')
  const scenario = params.get('mock')

  const update = useCallback(
    (changes: Record<string, string | null>, push = false) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || (key === 'view' && value === 'overview')) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: !push, preventScrollReset: true },
      )
    },
    [setParams],
  )

  return { view, run, scenario, update }
}
