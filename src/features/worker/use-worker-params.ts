import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export type WorkerView = 'package' | 'versions' | 'runs' | 'brain' | 'knowledge' | 'learning' | 'sentinel' | 'runtimes' | 'delivery'

export const WORKER_VIEWS: { value: WorkerView; label: string }[] = [
  { value: 'package', label: 'Package' },
  { value: 'versions', label: 'Versions and customers' },
  { value: 'runs', label: 'Runs' },
  { value: 'brain', label: 'Brain activity' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'learning', label: 'Learning' },
  { value: 'sentinel', label: 'Sentinel' },
  { value: 'runtimes', label: 'Runtimes' },
  { value: 'delivery', label: 'Delivery' },
]

const DEFAULT_VIEW: WorkerView = 'package'

// Older links keep working: the legacy view keys fold into the current sections.
const LEGACY: Record<string, WorkerView> = {
  overview: 'package',
  passport: 'package',
  instructions: 'package',
  dod: 'knowledge',
  memory: 'brain',
}

export function useWorkerParams() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('view') ?? DEFAULT_VIEW
  const view: WorkerView = WORKER_VIEWS.some((v) => v.value === raw) ? (raw as WorkerView) : (LEGACY[raw] ?? DEFAULT_VIEW)
  const run = params.get('run')
  const scenario = params.get('mock')

  const update = useCallback(
    (changes: Record<string, string | null>, push = false) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || (key === 'view' && value === DEFAULT_VIEW)) next.delete(key)
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
