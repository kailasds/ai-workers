import { useSyncExternalStore } from 'react'
import { getDemo } from '@/features/sentinel/demo/store'
import type { Result } from '@/features/sentinel/demo/engine'
import type { LearningItem } from './model'
import { proposedChanges } from './journey'

// Demo reviews of proposed Skill changes. The snapshot only counts the proposals, so a review here
// is simulated: saved in this browser, it changes nothing in any Skill. An approval marks the
// proposal approved; adopting it would ship in a new Worker revision, which this console can't do.

export type Verdict = 'approved' | 'declined'
export interface Review {
  verdict: Verdict
  reason: string
  at: string
}

const KEY = 'aiw.learning-reviews.v1'

function read(): Record<string, Review> {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, Review>) : {}
  } catch {
    return {}
  }
}

let reviews: Record<string, Review> = typeof window !== 'undefined' ? read() : {}
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useReviews = () => useSyncExternalStore(subscribe, () => reviews, () => reviews)

/** Records a review of one proposed Skill change. A reason is required; a review can't be redone. */
export function reviewSkillChange(item: LearningItem, verdict: Verdict, reason: string): Result {
  if (item.state !== 'proposed') return { ok: false, error: 'Only a proposed Skill change can be reviewed.' }
  if (reviews[item.id]) return { ok: false, error: 'This proposal has already been reviewed.' }
  if (!reason.trim()) return { ok: false, error: 'Give a reason.' }
  reviews = { ...reviews, [item.id]: { verdict, reason: reason.trim(), at: new Date().toISOString() } }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reviews))
  } catch {
    // Not saved; it lasts until the page is closed.
  }
  listeners.forEach((l) => l())
  return { ok: true, state: getDemo(), decisionId: null }
}

/** Proposed changes still waiting for a person, among `items`. */
export const pendingChanges = (items: LearningItem[], r: Record<string, Review>) => items.filter((i) => i.state === 'proposed' && !r[i.id]).reduce((n, i) => n + proposedChanges(i), 0)
