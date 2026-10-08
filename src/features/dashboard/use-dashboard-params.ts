import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_PERIOD } from '@/lib/api/dashboard'
import type { Period, Verdict } from '@/lib/types/dashboard'

export type Measure = 'cost' | 'tokens'
export type View = 'criteria' | 'cost' | 'contexts' | 'runs'
const VIEWS: View[] = ['criteria', 'cost', 'contexts', 'runs']

const PERIOD_VALUES: Period[] = ['7d', '30d', '90d', 'all']
const VERDICTS: Verdict[] = ['MET', 'NOT_MET', 'NOT_ADJUDICABLE']

// P-03: everything that selects what is shown lives in the URL, so reload, Back and a
// shared link all restore the same view. Defaults are omitted from the query string.
export function useDashboardParams() {
  const [params, setParams] = useSearchParams()

  const rawPeriod = params.get('period')
  const period = PERIOD_VALUES.includes(rawPeriod as Period) ? (rawPeriod as Period) : DEFAULT_PERIOD
  const rawDetail = params.get('detail')
  /** Which drill-down sheet is open, if any. */
  const detail: View | null = VIEWS.includes(rawDetail as View) ? (rawDetail as View) : null
  const rawVerdict = params.get('verdict')
  const verdict = VERDICTS.includes(rawVerdict as Verdict) ? (rawVerdict as Verdict) : null
  const context = params.get('context')
  const measure: Measure = params.get('measure') === 'tokens' ? 'tokens' : 'cost'
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)
  const scenario = params.get('mock')

  const update = useCallback(
    (changes: Record<string, string | null>, { resetPage = true, push = false }: { resetPage?: boolean; push?: boolean } = {}) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '' || (key === 'period' && value === DEFAULT_PERIOD) || (key === 'measure' && value === 'cost')) next.delete(key)
            else next.set(key, value)
          }
          if (resetPage && !('page' in changes)) next.delete('page')
          if (next.get('page') === '1') next.delete('page')
          return next
        },
        { replace: !push, preventScrollReset: true },
      )
    },
    [setParams],
  )

  /** Link that opens a drill-down sheet, carrying the period. */
  const detailLink = useCallback(
    (target: string, extra: Record<string, string> = {}) => {
      const next = new URLSearchParams()
      if (period !== DEFAULT_PERIOD) next.set('period', period)
      next.set('detail', target)
      for (const [key, value] of Object.entries(extra)) next.set(key, value)
      return `?${next.toString()}`
    },
    [period],
  )

  return { period, detail, verdict, context, measure, page, scenario, update, detailLink }
}
