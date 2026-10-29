import { describe, expect, it } from 'vitest'
import type { PlatformSentinelOverview, SentinelLearningFleet } from '@/lib/types/catalog'
import { attentionOf, openPhrase } from './sentinel-model'

const overview = (over: Partial<PlatformSentinelOverview> = {}): PlatformSentinelOverview =>
  ({
    generated_at: '2026-10-06T08:45:39Z',
    window_days: 7,
    viewer: { admin: true },
    mode: { set: null, acting: false, why: 'Records only.' },
    coverage: { running: 1, reporting: 0, no_sentinel: 0, unavailable: 1, not_running: 34, complete: true },
    chain: { verified: null, entries: 0, broken_at: null, checked: 0 },
    dimensions: [],
    in_force: [],
    stream: [],
    needs_review: 0,
    ...over,
  }) as PlatformSentinelOverview

const fleet = (status: string): SentinelLearningFleet => ({
  generated_at: '',
  workers: [{ worker_id: 'r1', name: 'W', composition_id: 'c1', target: 'ECS', state: 'RUNNING', status, detail: 'Refused the console’s request.', learning: null }],
  counts: { workers: 1, answered: 0, not_answering: 1, no_runtime: 0 },
})

describe('attentionOf', () => {
  it('keeps a running Worker that is not reporting visible even with no decisions', () => {
    const items = attentionOf(overview(), fleet('not_answering'))
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ kind: 'monitoring', worker: { id: 'c1' } })
  })

  it('names the count when per-Worker reporting could not be read', () => {
    const items = attentionOf(overview(), null)
    expect(items).toHaveLength(1)
    expect(items[0].worker).toBeNull()
  })

  it('has nothing to show when every running Worker reports and nothing is in force', () => {
    expect(attentionOf(overview({ coverage: { running: 1, reporting: 1, no_sentinel: 0, unavailable: 0, not_running: 0, complete: true } }), fleet('answering'))).toEqual([])
  })

  it('lists restrictions in force and pending reviews', () => {
    const items = attentionOf(overview({ coverage: { running: 0, reporting: 0, no_sentinel: 0, unavailable: 0, not_running: 0, complete: true }, needs_review: 2, in_force: [{ id: 'f1', kind: 'stop', title: 'Stopped', scope: 'worker', effect: 'Runs blocked', since: '', reason: 'x' }] }), null)
    expect(items.map((i) => i.kind)).toEqual(['restriction', 'review'])
  })
})

describe('openPhrase', () => {
  it('never reads as safe when nothing is open', () => {
    expect(openPhrase({ '0': 0, '1': 0, '2': 0, '3': 0, grant: 0 })).toBe('Nothing open')
    expect(openPhrase({ '0': 0, '1': 1, '2': 2, '3': 0, grant: 0 })).toBe('2 restrictions · 1 warning open')
  })
})
