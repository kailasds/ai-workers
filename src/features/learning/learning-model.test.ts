import { describe, expect, it } from 'vitest'
import type { BrainRead, PackageableComposition, PortfolioWorker } from '@/lib/types/worker'
import { buildEvents, groupHeld, heldItems, inPeriod, workerRefs } from './learning-model'

const worker = (id: string, name: string, memories: number, last: string | null = null) =>
  ({
    composition_id: id,
    name,
    learning: { memories, recent_delta: 0, contradictions: 0, runs: memories, last_at: last },
    brain: { state: 'CONFIGURED', engine: 'GBrain', composed_engine_version: '1', durability: 'EPHEMERAL', observed_at: null },
  }) as unknown as PortfolioWorker

const brain = (id: string, held: { skill: string; kind: string; key: string }[]): BrainRead => ({
  id,
  state: 'ok',
  brain: {
    state: 'idle',
    detail: '',
    observed_at: '2026-10-06T08:45:00Z',
    engine: null,
    durability: { survives_restart: false, mechanism: 'ephemeral', detail: '', last_snapshot_at: null },
    unavailable: [],
    compounding: { configured: true, minimum_observations: 3, requires_dod_met: true, skill_changes: [], held_back: held.map((h) => ({ ...h, reason: '1 of 3 runs so far.' })) },
  },
})

const composition = (id: string, skillChanges: number, claims = 0) =>
  ({ composition_id: id, maturity: { runs: 4, runs_met: 3, last_run_at: '2026-09-30T00:00:00Z', skill_changes: skillChanges, claims, memories: 0, learned_at: null, memory_kinds: { episodic: 0, semantic: 0, procedural: 0 } } }) as unknown as PackageableComposition

const title = (k: string) => (k === 'qe-page' ? 'Page objects' : k)

describe('workerRefs', () => {
  it('adds a short id only when names repeat', () => {
    const refs = workerRefs([worker('aaaaaaaa-1', 'A', 0), worker('bbbbbbbb-2', 'A', 0), worker('cccccccc-3', 'B', 0)])
    expect(refs.get('aaaaaaaa-1')!.short).toBe('aaaaaaaa')
    expect(refs.get('cccccccc-3')!.short).toBeNull()
  })
})

describe('held items', () => {
  it('groups items with the same Worker, Skill and state, keeping every item', () => {
    const refs = workerRefs([worker('w1', 'W', 0)])
    const held = heldItems([brain('w1', [{ skill: 'qe-page', kind: 'discovered-path', key: 'k1' }, { skill: 'qe-page', kind: 'discovered-path', key: 'k2' }, { skill: 'other', kind: 'x', key: 'k3' }])], refs, title)
    const groups = groupHeld(held)
    expect(groups).toHaveLength(2)
    expect(groups.flat().map((h) => h.key).sort()).toEqual(['k1', 'k2', 'k3'])
    expect(held[0].skillTitle).toBe('Page objects')
    expect(held[0].reason).toBe('1 of 3 runs so far')
  })

  it('reads nothing from a brain that was not read', () => {
    expect(heldItems([{ id: 'w1', state: 'not_read', brain: null }], new Map(), title)).toEqual([])
  })
})

describe('buildEvents', () => {
  const workers = [worker('w1', 'W1', 2, '2026-09-30T12:00:00Z'), worker('w2', 'W2', 0)]

  it('turns memory records, held groups, proposals and agreed statements into separate events', () => {
    const events = buildEvents(workers, [brain('w2', [{ skill: 'qe-page', kind: 'discovered-path', key: 'k1' }])], null, title, [composition('w1', 5, 2)])
    const kinds = events.map((e) => e.kind).sort()
    expect(kinds).toEqual(['claim', 'held', 'memory', 'skill_change'])
  })

  it('marks only proposed Skill changes as needing a person', () => {
    const events = buildEvents(workers, [], null, title, [composition('w1', 5)])
    expect(events.filter((e) => e.attention).map((e) => e.kind)).toEqual(['skill_change'])
    expect(events.find((e) => e.kind === 'memory')!.status).toBe('recorded')
  })

  it('never invents an event for a Worker with nothing recorded', () => {
    expect(buildEvents([worker('w2', 'W2', 0)], [], null, title, [composition('w2', 0, 0)])).toEqual([])
  })

  it('shows a recorded decision as not applied', () => {
    const overview = { stream: [{ id: 'd1', at: '2026-10-01T00:00:00Z', dimension: 'control', severity: 'warning', headline: 'Would restrict', applied: false }] } as never
    expect(buildEvents([], [], overview, title)[0].status).toBe('recorded_decision')
  })
})

describe('inPeriod', () => {
  const now = new Date('2026-10-29T00:00:00Z').getTime()
  it('keeps events with their own time inside the period', () => {
    expect(inPeriod({ when: { iso: '2026-10-10T00:00:00Z', kind: 'at' } } as never, 30, now)).toBe(true)
    expect(inPeriod({ when: { iso: '2026-08-01T00:00:00Z', kind: 'at' } } as never, 30, now)).toBe(false)
  })
  it('leaves out read times and unknown times', () => {
    expect(inPeriod({ when: { iso: '2026-10-28T00:00:00Z', kind: 'as_of' } } as never, 30, now)).toBe(false)
    expect(inPeriod({ when: null } as never, 30, now)).toBe(false)
  })
})
