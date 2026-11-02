import { useLocation, useSearchParams } from 'react-router'
import { periodOf, type PeriodKey } from './model'
import type { From } from './ui'

// Context kept while moving through Learning: the period (in the URL) and where a reader came from.

export function usePeriod(): [PeriodKey, (p: PeriodKey) => void] {
  const [params, setParams] = useSearchParams()
  const period = periodOf(params.get('period'))
  const set = (p: PeriodKey) =>
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        if (p === '7') n.delete('period')
        else n.set('period', p)
        for (const k of [...n.keys()]) if (k.endsWith('page')) n.delete(k)
        return n
      },
      { replace: true, preventScrollReset: true },
    )
  return [period, set]
}

/** Keeps the chosen period on links within Learning. */
export const withPeriod = (to: string, period: PeriodKey) => (period === '7' ? to : `${to}${to.includes('?') ? '&' : '?'}period=${period}`)

/** The current page as a "from", for links that leave it. */
export function useFrom(label: string): From {
  const { pathname, search } = useLocation()
  return { label, to: `${pathname}${search}` }
}
