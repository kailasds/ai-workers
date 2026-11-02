import { describe, expect, it } from 'vitest'
import { RUNS, WORKERS } from '@/features/sentinel/demo/platform'
import { CATEGORIES, contributors, distribution, inPeriod, ITEM_BY_ID, ITEMS, itemsOf, related, workersWithNew } from './model'

describe('learning records', () => {
  it('have unique ids and a known category', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length)
    const keys = new Set(CATEGORIES.map((c) => c.key))
    expect(ITEMS.every((i) => keys.has(i.category))).toBe(true)
  })

  it('give each Worker one run experience per memory record, matching the Registry', () => {
    for (const w of WORKERS) expect(itemsOf(w.composition_id).filter((i) => i.category === 'experiences')).toHaveLength(w.learning.memories)
  })

  it('cite only runs of the same Worker', () => {
    const runs = new Map(RUNS.map((r) => [r.ref, r]))
    for (const i of ITEMS)
      for (const e of i.evidence)
        if (e.run) {
          expect(runs.has(e.run.ref)).toBe(true)
          expect(runs.get(e.run.ref)!.workerId).toBe(i.workerId)
        }
  })

  it('mark facts and techniques as demo content tied to the Worker’s own runs', () => {
    const demo = ITEMS.filter((i) => i.category === 'facts' || i.category === 'techniques')
    expect(demo.length).toBeGreaterThan(0)
    expect(demo.every((i) => i.demo && i.evidence.length === 1 && i.when.iso === i.evidence[0].run?.at)).toBe(true)
  })

  it('relate the same demo lesson across Workers', () => {
    const shared = ITEMS.find((i) => i.lesson && ITEMS.some((j) => j.lesson === i.lesson && j.workerId !== i.workerId))!
    expect(related(shared).some((r) => r.relation === 'same_lesson' && r.item.lesson === shared.lesson)).toBe(true)
  })
})

describe('totals', () => {
  it('add up for the platform and for each Worker', () => {
    expect(distribution(ITEMS).reduce((n, c) => n + c.count, 0)).toBe(ITEMS.length)
    for (const w of WORKERS) {
      const mine = itemsOf(w.composition_id)
      expect(distribution(mine).reduce((n, c) => n + c.count, 0)).toBe(mine.length)
    }
    const patterns = ITEMS.filter((i) => i.category === 'patterns')
    expect(contributors(patterns).reduce((n, c) => n + c.count, 0)).toBe(patterns.length)
  })
})

describe('Workers with new learning', () => {
  it('lists only Workers with learning in the period, and the counts follow the period', () => {
    const week = workersWithNew('7')
    const all = workersWithNew('all')
    expect(week.length).toBeGreaterThan(0)
    expect(week.length).toBeLessThan(all.length)
    expect(week.every((w) => w.fresh.length > 0 && w.fresh.every((i) => inPeriod(i, '7')))).toBe(true)
    expect(all.reduce((n, w) => n + w.fresh.length, 0)).toBe(ITEMS.length)
  })

  it('keeps items with only a read time out of a period', () => {
    const asOf = ITEMS.filter((i) => i.when.kind === 'as_of')
    expect(asOf.length).toBeGreaterThan(0)
    expect(asOf.some((i) => inPeriod(i, '30'))).toBe(false)
    expect(asOf.every((i) => inPeriod(i, 'all'))).toBe(true)
  })

  it('filters by Worker type and business domain', () => {
    const all = workersWithNew('all')
    const qe = workersWithNew('all', { type: 'quality-engineering' })
    expect(qe.length).toBeGreaterThan(0)
    expect(qe.every((w) => w.type === 'quality-engineering')).toBe(true)
    expect(qe.length + workersWithNew('all', { type: 'modernization' }).length).toBe(all.length)
    const domains = [...new Set(all.map((w) => w.domain))]
    const byDomain = domains.reduce((n, d) => n + workersWithNew('all', { domain: d ?? 'none' }).length, 0)
    expect(byDomain).toBe(all.length)
  })

  it('filters by type of learning and counts only that type', () => {
    const patterns = workersWithNew('all', { category: 'patterns' })
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((w) => w.fresh.length > 0 && w.fresh.every((i) => i.category === 'patterns'))).toBe(true)
    expect(patterns.reduce((n, w) => n + w.fresh.length, 0)).toBe(ITEMS.filter((i) => i.category === 'patterns').length)
    expect(workersWithNew('all', { category: 'facts' }).length).toBeGreaterThan(0)
  })

  it('searches Worker names and learning, and sorts by count', () => {
    expect(workersWithNew('all', { q: 'functional equivalence' }).length).toBeGreaterThan(0)
    expect(workersWithNew('all', { q: 'zzz-no-match' })).toHaveLength(0)
    const byCount = workersWithNew('all', { sort: 'count' })
    for (let i = 1; i < byCount.length; i++) if (Boolean(byCount[i - 1].attention) === Boolean(byCount[i].attention)) expect(byCount[i - 1].fresh.length).toBeGreaterThanOrEqual(byCount[i].fresh.length)
  })

  it('puts Workers that need attention first', () => {
    const rows = workersWithNew('all')
    const first = rows.findIndex((w) => !w.attention)
    expect(rows.filter((w) => w.attention).length).toBeGreaterThan(0)
    expect(rows.slice(first).every((w) => !w.attention)).toBe(true)
    expect(rows.find((w) => w.review > 0)?.attention).toContain('review')
  })
})

describe('related learning', () => {
  it('leads only to existing items, never to the item itself', () => {
    for (const i of ITEMS)
      for (const r of related(i)) {
        expect(ITEM_BY_ID.has(r.item.id)).toBe(true)
        expect(r.item.id).not.toBe(i.id)
        if (r.relation === 'same_lesson') expect(r.item.lesson).toBe(i.lesson)
        else if (r.relation === 'same_skill') expect(r.item.skill?.key).toBe(i.skill?.key)
        else expect(r.item.workerId).toBe(i.workerId)
      }
  })
})
