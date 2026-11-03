import { describe, expect, it } from 'vitest'
import { RUNS, WORKERS } from '@/features/sentinel/demo/platform'
import { evolution, journey } from './journey'
import { ITEMS, itemsOf } from './model'

describe('learning path', () => {
  it('has exactly one current step and never marks a step done beyond the recorded state', () => {
    for (const i of ITEMS) {
      const j = journey(i)
      expect(j.steps.filter((s) => s.status === 'current')).toHaveLength(1)
      expect(j.steps.at(-1)!.status).not.toBe('done')
    }
  })

  it('sends run experiences to memory, agreed items to knowledge and Skill changes to a Skill', () => {
    for (const i of ITEMS) {
      const j = journey(i)
      if (i.category === 'experiences') expect(j.becomes).toBe('memory')
      else if (i.category === 'skill-changes') expect(j.becomes).toBe('skill')
      else expect(j.becomes).toBe(i.state === 'agreed' ? 'knowledge' : 'memory')
    }
  })
})

describe('evolution', () => {
  it('counts from the Worker’s own records and runs', () => {
    for (const w of WORKERS) {
      const e = evolution(w.composition_id)
      expect(e.runs).toHaveLength(RUNS.filter((r) => r.workerId === w.composition_id).length)
      expect(e.memory).toBe(itemsOf(w.composition_id).filter((i) => i.category === 'experiences').length)
      expect(e.effect === null).toBe(e.runs.length < 4)
    }
  })
})
