import type { PortfolioWorker } from '@/lib/types/worker'

export type RuntimeFacet = 'serving' | 'stopped' | 'none' | 'attention'
export type LearningFilter = 'memory' | 'recent' | 'contradictions'
export type SentinelFilter = 'with' | 'without'
export type SortKey = 'evidence' | 'newest' | 'oldest'

export const RUNTIME_FACETS: { value: RuntimeFacet; label: string }[] = [
  { value: 'attention', label: 'Needs attention' },
  { value: 'serving', label: 'Serving' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'none', label: 'No runtime' },
]

export const SORTS: { value: SortKey; label: string; hint: string }[] = [
  { value: 'evidence', label: 'Most evidence', hint: 'Newest Worker, then those with memory records, a Met outcome, a healthy runtime. Not a Learning score.' },
  { value: 'newest', label: 'Newest composed', hint: 'By the time the Worker was composed.' },
  { value: 'oldest', label: 'Oldest composed', hint: 'By the time the Worker was composed.' },
]

export function matchesFacet(w: PortfolioWorker, facet: RuntimeFacet) {
  const r = w.runtime
  switch (facet) {
    case 'serving':
      return r.serving > 0
    case 'attention':
      return r.attention > 0
    case 'stopped':
      return r.serving === 0 && r.stopped > 0 && r.attention === 0
    case 'none':
      // "No runtime" = no runtime still exists.
      return r.serving === 0 && r.stopped === 0 && r.attention === 0
  }
}

export interface RegistryFilters {
  q: string
  facet: RuntimeFacet | null
  context: string | null
  learning: LearningFilter | null
  sentinel: SentinelFilter | null
}

export function filterWorkers(workers: PortfolioWorker[], f: RegistryFilters) {
  const q = f.q.trim().toLowerCase()
  return workers.filter((w) => {
    if (f.facet && !matchesFacet(w, f.facet)) return false
    if (f.context && w.bounded_context.key !== f.context) return false
    if (f.learning === 'memory' && w.learning.memories === 0) return false
    if (f.learning === 'recent' && w.learning.recent_delta === 0) return false
    if (f.learning === 'contradictions' && w.learning.contradictions === 0) return false
    if (f.sentinel === 'with' && w.sentinel.state !== 'CONFIGURED') return false
    if (f.sentinel === 'without' && w.sentinel.state === 'CONFIGURED') return false
    if (!q) return true
    return [w.name, w.owner ?? '', w.worker_type, w.bounded_context.label, w.bounded_context.statement, w.identity.spiffe_id, w.composition_id].some((field) =>
      field.toLowerCase().includes(q),
    )
  })
}

/** The single newest composed Worker carries a "New" tag. */
export function newestId(workers: PortfolioWorker[]) {
  return workers.reduce<PortfolioWorker | null>((best, w) => (!best || w.created_at > best.created_at ? w : best), null)?.composition_id ?? null
}

export function sortWorkers(workers: PortfolioWorker[], sort: SortKey, newest: string | null) {
  const list = [...workers]
  if (sort === 'newest') return list.sort((a, b) => b.created_at.localeCompare(a.created_at))
  if (sort === 'oldest') return list.sort((a, b) => a.created_at.localeCompare(b.created_at))
  const rank = (w: PortfolioWorker) => {
    if (w.composition_id === newest) return 0
    if (w.learning.memories > 0) return 1
    if (w.last_outcome.verdict === 'MET') return 2
    if (w.runtime.serving > 0 && w.runtime.attention === 0) return 3
    return 4
  }
  return list.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      b.learning.memories - a.learning.memories ||
      (b.last_outcome.finished_at ?? '').localeCompare(a.last_outcome.finished_at ?? '') ||
      b.created_at.localeCompare(a.created_at),
  )
}

/** The short composition id is shown only when another row shares name, owner, context, revision and day. */
export function ambiguousIds(workers: PortfolioWorker[]) {
  const key = (w: PortfolioWorker) => [w.name, w.owner, w.bounded_context.key, w.revision, w.created_at.slice(0, 10)].join('|')
  const counts = new Map<string, number>()
  for (const w of workers) counts.set(key(w), (counts.get(key(w)) ?? 0) + 1)
  return new Set(workers.filter((w) => (counts.get(key(w)) ?? 0) > 1).map((w) => w.composition_id))
}
