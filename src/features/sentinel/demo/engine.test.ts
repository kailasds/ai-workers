import { describe, expect, it } from 'vitest'
import * as engine from './engine'
import { verifyChain } from './integrity'
import { buildSeed } from './seed'
import { attention, findings, operational, sharingCounts, stageOf, summary } from './selectors'
import type { DemoState } from './types'

const ctx: engine.Ctx = { at: '2026-10-10T10:00:00Z', actor: { kind: 'administrator', name: 'Test admin' } }
const ok = (r: engine.Result): DemoState => {
  if (!r.ok) throw new Error(r.error)
  return r.state
}
const byStatus = (s: DemoState, status: string) => s.agreements.find((a) => a.status === status)!

describe('seed', () => {
  it('is deterministic', () => {
    expect(JSON.stringify(buildSeed())).toBe(JSON.stringify(buildSeed()))
  })

  it('covers the scenarios the prototype shows', () => {
    const s = buildSeed()
    const statuses = new Set(s.agreements.map((a) => a.status))
    for (const st of ['proposed', 'agreed', 'active', 'suspended', 'revoked', 'rejected']) expect(statuses).toContain(st)
    expect(Object.values(s.workers).some((w) => w.status === 'stopped')).toBe(true)
    expect(s.decisions.some((d) => d.outcome === 'pending')).toBe(true)
    expect(s.decisions.some((d) => d.evidence.headlines.length > 0)).toBe(true)
    expect(s.overrides.length).toBeGreaterThan(0)
    expect(findings(s).length).toBeGreaterThan(0)
  })

  it('has a verifiable decision chain', () => {
    expect(verifyChain(buildSeed().decisions).state).toBe('verified')
  })
})

describe('transitions', () => {
  it('refuses invalid ones and leaves state untouched', () => {
    const s = buildSeed()
    const rejected = byStatus(s, 'rejected')
    expect(engine.approveAgreement(s, rejected.id, 'try', ctx)).toMatchObject({ ok: false })
    expect(engine.resumeAgreement(s, byStatus(s, 'active').id, 'try again', ctx)).toMatchObject({ ok: false })
    expect(engine.suspendAgreement(s, byStatus(s, 'proposed').id, 'nope', ctx)).toMatchObject({ ok: false })
    const active = Object.keys(s.workers).find((id) => s.workers[id].status === 'active')!
    expect(engine.resumeWorker(s, active, 'not stopped', ctx)).toMatchObject({ ok: false })
  })

  it('requires a reason', () => {
    const s = buildSeed()
    expect(engine.approveAgreement(s, byStatus(s, 'proposed').id, '', ctx)).toMatchObject({ ok: false })
  })

  it('approves a proposal without delivering anything', () => {
    const s = buildSeed()
    const p = byStatus(s, 'proposed')
    const next = ok(engine.approveAgreement(s, p.id, 'Looks right', ctx))
    const a = next.agreements.find((x) => x.id === p.id)!
    expect(a.status).toBe('agreed')
    expect(a.delivered).toBe(0)
    expect(stageOf(a)).toBe('agreed')
  })

  it('suspends and resumes an agreement, adding and lifting its control', () => {
    const s = buildSeed()
    const a = byStatus(s, 'active')
    const suspended = ok(engine.suspendAgreement(s, a.id, 'Checking a contradiction', ctx))
    expect(suspended.controls.some((c) => c.active && c.agreementId === a.id)).toBe(true)
    const resumed = ok(engine.resumeAgreement(suspended, a.id, 'Checked', ctx))
    expect(resumed.agreements.find((x) => x.id === a.id)!.status).toBe('active')
    expect(resumed.controls.some((c) => c.active && c.agreementId === a.id)).toBe(false)
  })

  it('stops a Worker everywhere and suspends its sharing, then resumes it without un-suspending', () => {
    const s = buildSeed()
    const a = byStatus(s, 'active')
    const stopped = ok(engine.stopWorker(s, a.sourceId, 'Wrong environment', ctx))
    expect(operational(stopped, a.sourceId)).toBe('stopped')
    expect(stopped.agreements.find((x) => x.id === a.id)!.status).toBe('suspended')
    expect(engine.resumeAgreement(stopped, a.id, 'try', ctx)).toMatchObject({ ok: false })
    const resumed = ok(engine.resumeWorker(stopped, a.sourceId, 'Fixed', ctx))
    expect(operational(resumed, a.sourceId)).not.toBe('stopped')
    expect(resumed.agreements.find((x) => x.id === a.id)!.status).toBe('suspended')
    expect(resumed.decisions.at(-1)!.relatedTo).toBe(stopped.workers[a.sourceId].stopDecisionId)
  })

  it('keeps reviews immutable: a review adds a linked decision', () => {
    const s = buildSeed()
    const pending = s.decisions.find((d) => d.outcome === 'pending')!
    const next = ok(engine.reviewDecision(s, pending.id, 'approve', 'Reviewed', ctx))
    expect(next.decisions.find((d) => d.id === pending.id)).toEqual(pending)
    expect(next.decisions.at(-1)!.relatedTo).toBe(pending.id)
    expect(engine.reviewDecision(next, pending.id, 'approve', 'again', ctx)).toMatchObject({ ok: false })
  })
})

describe('decision history', () => {
  it('appends one sealed decision per action and keeps the chain verified', () => {
    const s = buildSeed()
    const next = ok(engine.approveAgreement(s, byStatus(s, 'proposed').id, 'Fine', ctx))
    expect(next.decisions).toHaveLength(s.decisions.length + 1)
    expect(next.decisions.slice(0, -1)).toEqual(s.decisions)
    expect(verifyChain(next.decisions).state).toBe('verified')
  })

  it('detects an edited record', () => {
    const s = buildSeed()
    const tampered = s.decisions.map((d, i) => (i === 3 ? { ...d, reason: 'edited' } : d))
    const r = verifyChain(tampered)
    expect(r.state).toBe('failed')
    expect(r.failedAt).toBe(s.decisions[3].id)
  })
})

describe('policy', () => {
  it('validates fields', () => {
    const s = buildSeed()
    expect(engine.validatePolicy({ ...s.policy, minIndependentWorkers: 1 })).toHaveProperty('minIndependentWorkers')
    expect(engine.validatePolicy({ ...s.policy, costPerRunLimit: 0 })).toHaveProperty('costPerRunLimit')
    expect(engine.savePolicy(s, { ...s.policy, minIndependentWorkers: 1 }, 'bad', ctx)).toMatchObject({ ok: false })
  })

  it('says the impact first, then turning sharing off suspends agreed and active agreements', () => {
    const s = buildSeed()
    const live = s.agreements.filter((a) => a.status === 'agreed' || a.status === 'active').length
    expect(engine.policyImpact(s, { ...s.policy, sharingEnabled: false })[0]).toContain(String(live))
    const next = ok(engine.savePolicy(s, { ...s.policy, sharingEnabled: false }, 'Pause sharing', ctx))
    expect(next.agreements.filter((a) => a.status === 'agreed' || a.status === 'active')).toHaveLength(0)
    expect(next.revisions.at(-1)!.rev).toBe(s.revisions.at(-1)!.rev + 1)
  })

  it('leaves Workers’ own settings alone when a default changes', () => {
    const s = buildSeed()
    const next = ok(engine.savePolicy(s, { ...s.policy, costPerRunLimit: 10 }, 'Lower limit', ctx))
    expect(next.overrides).toEqual(s.overrides)
  })
})

describe('derived counts', () => {
  it('come from the records', () => {
    const s = buildSeed()
    const c = sharingCounts(s)
    expect(c.proposed + c.agreed + c.delivered + c.used + c.suspended + c.rejected + c.revoked).toBe(s.agreements.length)
    expect(summary(s, null).controls).toBe(s.controls.filter((x) => x.active).length)
  })

  it('never let a dismissal hide a governance item', () => {
    const s = buildSeed()
    const all = findings(s).map((f) => f.id)
    const dismissed = { ...s, dismissed: all }
    expect(attention(dismissed).every((a) => !a.dismissible)).toBe(true)
    expect(attention(dismissed).some((a) => a.state === 'Awaiting review')).toBe(true)
  })
})
