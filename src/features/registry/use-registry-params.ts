import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import type { LearningFilter, RuntimeFacet, SentinelFilter, SortKey } from './registry-model'

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | null => (allowed.includes(value as T) ? (value as T) : null)

// P-03: search, filters, sort, page, view and the open quick-look all live in the URL.
export function useRegistryParams() {
  const [params, setParams] = useSearchParams()
  const state = {
    view: params.get('view') === 'customer' ? ('customer' as const) : ('tcs' as const),
    q: params.get('q') ?? '',
    sort: pick<SortKey>(params.get('sort'), ['evidence', 'newest', 'oldest']) ?? 'evidence',
    facet: pick<RuntimeFacet>(params.get('runtime'), ['serving', 'stopped', 'none', 'attention']),
    context: params.get('context'),
    learning: pick<LearningFilter>(params.get('brain'), ['memory', 'recent', 'contradictions']),
    sentinel: pick<SentinelFilter>(params.get('sentinel'), ['with', 'without']),
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
    open: params.get('open'),
    scenario: params.get('mock'),
  }

  const update = useCallback(
    (changes: Record<string, string | null>, { push = false, resetPage = true }: { push?: boolean; resetPage?: boolean } = {}) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '' || (key === 'sort' && value === 'evidence') || (key === 'view' && value === 'tcs')) next.delete(key)
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

  return { ...state, update }
}
