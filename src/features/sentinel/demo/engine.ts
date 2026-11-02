// Pure, validated governance actions on the demo state. Every successful action appends a new,
// sealed decision; earlier decisions are never edited. An invalid transition returns an error and
// leaves the state unchanged.

import { sealDecision } from './integrity'
import { isServing, poolLabel, workerLabel } from './platform'
import type { Agreement, AuthorityKind, Control, Decision, DemoState, Override, OverrideField, Policy } from './types'

export interface Ctx {
  at: string
  actor: { kind: AuthorityKind; name: string }
}

export type Result = { ok: true; state: DemoState; decisionId: string | null } | { ok: false; error: string }

const fail = (error: string): Result => ({ ok: false, error })
const done = (state: DemoState, decisionId: string | null = null): Result => ({ ok: true, state, decisionId })

type DecisionInput = Omit<Decision, 'id' | 'seq' | 'at' | 'integrity' | 'decidedBy' | 'receipts' | 'relatedTo' | 'agreementId' | 'conditions' | 'evidence'> &
  Partial<Pick<Decision, 'relatedTo' | 'agreementId' | 'conditions' | 'evidence' | 'receipts'>>

/** Append a sealed decision and return the new state and its id. */
export function addDecision(state: DemoState, input: DecisionInput, ctx: Ctx): [DemoState, string] {
  const seq = state.decisions.length + 1
  const id = `dec-${String(seq).padStart(4, '0')}`
  const prev = state.decisions.length ? state.decisions[state.decisions.length - 1].integrity?.hash ?? null : null
  const receipts =
    input.receipts ??
    input.workerIds.map((workerId) => ({
      workerId,
      status: input.outcome === 'applied' ? (isServing(workerId) ? ('confirmed' as const) : ('awaiting' as const)) : ('not_needed' as const),
      customer: null,
    }))
  const decision = sealDecision(
    {
      ...input,
      id,
      seq,
      at: ctx.at,
      decidedBy: ctx.actor,
      receipts,
      relatedTo: input.relatedTo ?? null,
      agreementId: input.agreementId ?? null,
      conditions: input.conditions ?? [],
      evidence: input.evidence ?? { headlines: [], runs: [], refs: [] },
    },
    prev,
    state.policy,
  )
  return [{ ...state, decisions: [...state.decisions, decision] }, id]
}

const withAgreement = (state: DemoState, id: string, patch: Partial<Agreement>): DemoState => ({ ...state, agreements: state.agreements.map((a) => (a.id === id ? { ...a, ...patch } : a)) })
const linkDecision = (state: DemoState, agreementId: string, decisionId: string): DemoState =>
  withAgreement(state, agreementId, { decisionIds: [...(state.agreements.find((a) => a.id === agreementId)?.decisionIds ?? []), decisionId] })

function addControl(state: DemoState, c: Omit<Control, 'id' | 'active' | 'liftedAt'>): DemoState {
  return { ...state, controls: [...state.controls, { ...c, id: `ctl-${String(state.controls.length + 1).padStart(3, '0')}`, active: true, liftedAt: null }] }
}
function liftControls(state: DemoState, match: (c: Control) => boolean, at: string): DemoState {
  return { ...state, controls: state.controls.map((c) => (c.active && match(c) ? { ...c, active: false, liftedAt: at } : c)) }
}

const needsReason = (reason: string) => reason.trim().length < 3

// ── Workers ─────────────────────────────────────────────────────────────────

export function stopWorker(state: DemoState, workerId: string, reason: string, ctx: Ctx): Result {
  if (state.workers[workerId]?.status === 'stopped') return fail('This Worker is already stopped.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'stop', title: `Stop ${workerLabel(workerId)}`, summary: `${workerLabel(workerId)} was stopped. It may not start new runs until it is resumed.`, reason, effect: 'No new runs; sharing that depends on it is affected by policy.', outcome: 'applied', workerIds: [workerId] },
    ctx,
  )
  s = { ...s, workers: { ...s.workers, [workerId]: { status: 'stopped', stopDecisionId: id } } }
  s = addControl(s, { kind: 'admin_stop', title: `${workerLabel(workerId)} stopped`, what: 'Blocks new runs for this Worker.', scope: 'One Worker', workerIds: [workerId], by: ctx.actor.name, since: ctx.at, reason, decisionId: id, agreementId: null })
  if (s.policy.suspendSharingOnStop) {
    for (const a of s.agreements.filter((x) => (x.status === 'agreed' || x.status === 'active') && (x.sourceId === workerId || x.targetId === workerId))) {
      const r = suspendAgreement(s, a.id, `Linked Worker ${workerLabel(workerId)} was stopped by an administrator.`, { at: ctx.at, actor: { kind: 'platform_sentinel', name: 'Platform Sentinel' } }, id)
      if (r.ok) s = r.state
    }
  }
  return done(s, id)
}

export function resumeWorker(state: DemoState, workerId: string, reason: string, ctx: Ctx): Result {
  const gov = state.workers[workerId]
  if (gov?.status !== 'stopped') return fail('Only a stopped Worker can be resumed.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'resume', title: `Resume ${workerLabel(workerId)}`, summary: `${workerLabel(workerId)} may start runs again. Sharing agreements suspended because of the stop stay suspended until resumed one by one.`, reason, effect: 'The stop is lifted.', outcome: 'applied', workerIds: [workerId], relatedTo: gov.stopDecisionId },
    ctx,
  )
  s = { ...s, workers: { ...s.workers, [workerId]: { status: 'active', stopDecisionId: null } } }
  s = liftControls(s, (c) => c.kind === 'admin_stop' && c.workerIds.includes(workerId), ctx.at)
  return done(s, id)
}

// ── Sharing ─────────────────────────────────────────────────────────────────

export function proposeAgreement(state: DemoState, a: Omit<Agreement, 'status' | 'resumeTo' | 'delivered' | 'used' | 'updatedAt' | 'reason' | 'decisionIds' | 'receiverApproval'> & { receiverApproval?: Agreement['receiverApproval'] }, ctx: Ctx): Result {
  const agreement: Agreement = { ...a, receiverApproval: a.receiverApproval ?? 'pending', status: 'proposed', resumeTo: null, delivered: 0, used: 0, updatedAt: ctx.at, reason: null, decisionIds: [] }
  let [s, id] = addDecision(
    { ...state, agreements: [...state.agreements, agreement], eligible: state.eligible.filter((e) => !(e.sourceId === a.sourceId && e.title === a.item)) },
    { type: 'share', title: `Sharing proposed: ${a.item}`, summary: `${workerLabel(a.sourceId)} offered “${a.item}” to ${workerLabel(a.targetId)}.`, reason: 'The item met the sharing rules for its pool.', effect: 'Waits for approval before anything is sent.', outcome: 'requested', workerIds: [a.sourceId, a.targetId], agreementId: a.id, conditions: [`Pool: ${poolLabel(a.pool)}`] },
    ctx,
  )
  s = linkDecision(s, a.id, id)
  return done(s, id)
}

export function approveAgreement(state: DemoState, agreementId: string, reason: string, ctx: Ctx): Result {
  const a = state.agreements.find((x) => x.id === agreementId)
  if (!a) return fail('Agreement not found.')
  if (a.status !== 'proposed') return fail('Only a proposed agreement can be approved.')
  if (!state.policy.sharingEnabled) return fail('Sharing is turned off in Policy, so nothing can be approved.')
  const stopped = [a.sourceId, a.targetId].find((w) => state.workers[w]?.status === 'stopped')
  if (stopped) return fail(`${workerLabel(stopped)} is stopped. Resume it before approving.`)
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'share', title: `Sharing approved: ${a.item}`, summary: `Both sides of “${a.item}” are approved. Nothing has been delivered yet.`, reason, effect: 'The item may now be delivered to the receiving Worker.', outcome: 'applied', workerIds: [a.sourceId, a.targetId], agreementId, relatedTo: a.decisionIds[0] ?? null },
    ctx,
  )
  s = withAgreement(s, agreementId, { status: 'agreed', originApproval: 'approved', receiverApproval: 'approved', updatedAt: ctx.at, reason: null })
  return done(linkDecision(s, agreementId, id), id)
}

export function rejectAgreement(state: DemoState, agreementId: string, reason: string, ctx: Ctx): Result {
  const a = state.agreements.find((x) => x.id === agreementId)
  if (!a) return fail('Agreement not found.')
  if (a.status !== 'proposed') return fail('Only a proposed agreement can be rejected.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'reject_share', title: `Sharing rejected: ${a.item}`, summary: `“${a.item}” will not be shared with ${workerLabel(a.targetId)}.`, reason, effect: 'The proposal is closed. Nothing was sent.', outcome: 'applied', workerIds: [a.sourceId, a.targetId], agreementId, relatedTo: a.decisionIds[0] ?? null },
    ctx,
  )
  s = withAgreement(s, agreementId, { status: 'rejected', receiverApproval: a.receiverApproval === 'pending' ? 'rejected' : a.receiverApproval, updatedAt: ctx.at, reason })
  return done(linkDecision(s, agreementId, id), id)
}

export function suspendAgreement(state: DemoState, agreementId: string, reason: string, ctx: Ctx, relatedTo: string | null = null): Result {
  const a = state.agreements.find((x) => x.id === agreementId)
  if (!a) return fail('Agreement not found.')
  if (a.status !== 'agreed' && a.status !== 'active') return fail('Only an agreed or active agreement can be suspended.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'suspend', title: `Sharing suspended: ${a.item}`, summary: `No more deliveries of “${a.item}” to ${workerLabel(a.targetId)}. What was already delivered stays with it.`, reason, effect: 'Deliveries paused until the agreement is resumed.', outcome: 'applied', workerIds: [a.sourceId, a.targetId], agreementId, relatedTo },
    ctx,
  )
  s = withAgreement(s, agreementId, { status: 'suspended', resumeTo: a.status, updatedAt: ctx.at, reason })
  s = addControl(s, { kind: 'sharing_suspension', title: `Sharing suspended: ${a.item}`, what: 'Stops further deliveries under this agreement.', scope: `One agreement · ${poolLabel(a.pool)}`, workerIds: [a.sourceId, a.targetId], by: ctx.actor.name, since: ctx.at, reason, decisionId: id, agreementId })
  return done(linkDecision(s, agreementId, id), id)
}

/** Why a suspended agreement can't be resumed right now, or null if it can. */
export function resumeBlocker(state: DemoState, a: Agreement): string | null {
  if (a.status !== 'suspended') return 'Only a suspended agreement can be resumed.'
  if (!state.policy.sharingEnabled) return 'Sharing is turned off in Policy.'
  const stopped = [a.sourceId, a.targetId].find((w) => state.workers[w]?.status === 'stopped')
  return stopped ? `${workerLabel(stopped)} is stopped. Resume the Worker first.` : null
}

export function resumeAgreement(state: DemoState, agreementId: string, reason: string, ctx: Ctx): Result {
  const a = state.agreements.find((x) => x.id === agreementId)
  if (!a) return fail('Agreement not found.')
  const blocker = resumeBlocker(state, a)
  if (blocker) return fail(blocker)
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  const suspension = [...a.decisionIds].reverse().find((d) => state.decisions.find((x) => x.id === d)?.type === 'suspend') ?? null
  let [s, id] = addDecision(
    state,
    { type: 'resume_share', title: `Sharing resumed: ${a.item}`, summary: `Deliveries of “${a.item}” to ${workerLabel(a.targetId)} may continue.`, reason, effect: 'The suspension is lifted.', outcome: 'applied', workerIds: [a.sourceId, a.targetId], agreementId, relatedTo: suspension },
    ctx,
  )
  s = withAgreement(s, agreementId, { status: a.resumeTo ?? 'agreed', resumeTo: null, updatedAt: ctx.at, reason: null })
  s = liftControls(s, (c) => c.kind === 'sharing_suspension' && c.agreementId === agreementId, ctx.at)
  return done(linkDecision(s, agreementId, id), id)
}

export function revokeAgreement(state: DemoState, agreementId: string, reason: string, ctx: Ctx): Result {
  const a = state.agreements.find((x) => x.id === agreementId)
  if (!a) return fail('Agreement not found.')
  if (!['agreed', 'active', 'suspended'].includes(a.status)) return fail('Only an agreed, active or suspended agreement can be revoked.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  let [s, id] = addDecision(
    state,
    { type: 'revoke', title: `Sharing revoked: ${a.item}`, summary: `The agreement for “${a.item}” is ended for good. Items already delivered are not taken back automatically.`, reason, effect: 'No further deliveries. The agreement can’t be resumed.', outcome: 'applied', workerIds: [a.sourceId, a.targetId], agreementId, relatedTo: a.decisionIds[a.decisionIds.length - 1] ?? null },
    ctx,
  )
  s = withAgreement(s, agreementId, { status: 'revoked', resumeTo: null, updatedAt: ctx.at, reason })
  s = liftControls(s, (c) => c.kind === 'sharing_suspension' && c.agreementId === agreementId, ctx.at)
  return done(linkDecision(s, agreementId, id), id)
}

// ── Reviews ─────────────────────────────────────────────────────────────────

/** A pending decision is resolved once a later review decision points back to it. */
export const isResolved = (state: DemoState, decisionId: string) => state.decisions.some((d) => d.relatedTo === decisionId && (d.type === 'review_outcome' || d.type === 'withhold'))

export function reviewDecision(state: DemoState, decisionId: string, verdict: 'approve' | 'reject', reason: string, ctx: Ctx): Result {
  const d = state.decisions.find((x) => x.id === decisionId)
  if (!d) return fail('Decision not found.')
  if (d.outcome !== 'pending') return fail('Only a decision awaiting review can be reviewed.')
  if (isResolved(state, decisionId)) return fail('This decision has already been reviewed.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  const removal = d.type === 'removal_review'
  if (d.type === 'spread_review' && verdict === 'reject') {
    let [s, id] = addDecision(
      state,
      { type: 'withhold', title: `Withheld from further sharing`, summary: `The item under review will not spread further. ${d.agreementId ? 'Its agreement is suspended.' : ''}`.trim(), reason, effect: 'No new deliveries of this item.', outcome: 'applied', workerIds: d.workerIds, relatedTo: decisionId, agreementId: d.agreementId },
      ctx,
    )
    if (d.agreementId) {
      const r = suspendAgreement(s, d.agreementId, `Withheld after review: ${reason}`, ctx, id)
      if (r.ok) s = r.state
    }
    return done(s, id)
  }
  const [s, id] = addDecision(
    state,
    {
      type: 'review_outcome',
      title: removal ? (verdict === 'approve' ? 'Removal approved' : 'Removal declined') : verdict === 'approve' ? 'Spread allowed' : 'Review declined',
      summary: removal
        ? verdict === 'approve'
          ? 'The Worker is told to remove the item. Copies already used in earlier runs are not undone.'
          : 'The item stays. The recommendation is closed.'
        : 'The item may keep spreading under its existing agreements.',
      reason,
      effect: removal && verdict === 'approve' ? 'Removal requested from the Worker.' : 'No change to the Worker.',
      outcome: removal && verdict === 'approve' ? 'requested' : 'applied',
      workerIds: d.workerIds,
      relatedTo: decisionId,
      agreementId: d.agreementId,
    },
    ctx,
  )
  return done(s, id)
}

// ── Policy ──────────────────────────────────────────────────────────────────

export const POLICY_LABELS: Record<keyof Policy, string> = {
  mode: 'Sentinel mode',
  sharingEnabled: 'Sharing between Workers',
  requireReceiverApproval: 'Receiving Worker must approve',
  minIndependentWorkers: 'Independent Workers needed to share',
  costPerRunLimit: 'Cost per run limit',
  suspendSharingOnStop: 'Suspend sharing when a Worker is stopped',
}

export function formatPolicyValue(field: keyof Policy, v: Policy[keyof Policy]): string {
  if (field === 'mode') return v === 'enforce' ? 'Enforce' : 'Recording only'
  if (field === 'costPerRunLimit') return v === null ? 'No limit' : `$${Number(v).toFixed(2)}`
  if (typeof v === 'boolean') return v ? 'On' : 'Off'
  return String(v)
}

export function validatePolicy(p: Policy): Partial<Record<keyof Policy, string>> {
  const e: Partial<Record<keyof Policy, string>> = {}
  if (!Number.isInteger(p.minIndependentWorkers) || p.minIndependentWorkers < 2 || p.minIndependentWorkers > 10) e.minIndependentWorkers = 'Use a whole number from 2 to 10.'
  if (p.costPerRunLimit !== null && (!(p.costPerRunLimit > 0) || p.costPerRunLimit > 100)) e.costPerRunLimit = 'Use an amount above $0 and up to $100, or no limit.'
  return e
}

/** What a policy change would do to the current state, said before it is saved. */
export function policyImpact(state: DemoState, next: Policy): string[] {
  const out: string[] = []
  const p = state.policy
  if (p.sharingEnabled && !next.sharingEnabled) {
    const n = state.agreements.filter((a) => a.status === 'agreed' || a.status === 'active').length
    out.push(`${n} agreed or active ${n === 1 ? 'agreement' : 'agreements'} will be suspended. Pending proposals can’t be approved.`)
  }
  if (!p.sharingEnabled && next.sharingEnabled) out.push('Proposals can be approved again. Suspended agreements stay suspended until resumed one by one.')
  if (p.mode !== next.mode) out.push(next.mode === 'enforce' ? 'New Sentinel decisions will be applied, not only recorded. Earlier recorded decisions are not re-applied.' : 'New Sentinel decisions will only be recorded. Controls already in force stay in force.')
  if (p.costPerRunLimit !== next.costPerRunLimit) out.push('Cost findings are re-checked against the new limit. Workers with their own limit keep it.')
  if (p.requireReceiverApproval !== next.requireReceiverApproval) out.push('Applies to new proposals only.')
  return out
}

export function savePolicy(state: DemoState, next: Policy, reason: string, ctx: Ctx): Result {
  const errors = validatePolicy(next)
  if (Object.keys(errors).length) return fail('Fix the highlighted settings first.')
  const fields = (Object.keys(next) as (keyof Policy)[]).filter((k) => next[k] !== state.policy[k])
  if (fields.length === 0) return fail('Nothing has changed.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the revision.')
  const changes = fields.map((f) => ({ field: f, from: formatPolicyValue(f, state.policy[f]), to: formatPolicyValue(f, next[f]) }))
  const rev = (state.revisions.at(-1)?.rev ?? 0) + 1
  let [s, id] = addDecision(
    { ...state, policy: next },
    { type: 'policy_change', title: `Platform policy revision ${rev}`, summary: changes.map((c) => `${POLICY_LABELS[c.field]}: ${c.from} → ${c.to}`).join('. ') + '.', reason, effect: 'Applies to all Workers without their own setting.', outcome: 'applied', workerIds: [] },
    ctx,
  )
  s = { ...s, revisions: [...s.revisions, { rev, at: ctx.at, by: ctx.actor.name, reason, changes, decisionId: id }] }
  if (state.policy.mode !== next.mode) {
    s = next.mode === 'recording_only'
      ? addControl(s, { kind: 'recording_only', title: 'Recording-only mode', what: 'Sentinel decisions are written down but not applied.', scope: 'All Workers without their own mode', workerIds: [], by: ctx.actor.name, since: ctx.at, reason, decisionId: id, agreementId: null })
      : liftControls(s, (c) => c.kind === 'recording_only', ctx.at)
  }
  if (state.policy.sharingEnabled && !next.sharingEnabled) {
    for (const a of s.agreements.filter((x) => x.status === 'agreed' || x.status === 'active')) {
      const r = suspendAgreement(s, a.id, 'Sharing was turned off in platform policy.', ctx, id)
      if (r.ok) s = r.state
    }
  }
  return done(s, id)
}

export const OVERRIDE_LABELS: Record<OverrideField, string> = { mode: 'Sentinel mode', costPerRunLimit: 'Cost per run limit', requireReceiverApproval: 'Receiving Worker must approve' }

export function validateOverride(field: OverrideField, value: string): string | null {
  if (field === 'mode' && !['recording_only', 'enforce'].includes(value)) return 'Choose recording only or enforce.'
  if (field === 'costPerRunLimit' && !(Number(value) > 0 && Number(value) <= 100)) return 'Use an amount above $0 and up to $100.'
  if (field === 'requireReceiverApproval' && !['true', 'false'].includes(value)) return 'Choose on or off.'
  return null
}

export function formatOverride(field: OverrideField, value: string) {
  if (field === 'mode') return value === 'enforce' ? 'Enforce' : 'Recording only'
  if (field === 'costPerRunLimit') return `$${Number(value).toFixed(2)}`
  return value === 'true' ? 'On' : 'Off'
}

export function setOverride(state: DemoState, o: Omit<Override, 'at' | 'setBy'>, ctx: Ctx): Result {
  const err = validateOverride(o.field, o.value)
  if (err) return fail(err)
  if (needsReason(o.reason)) return fail('Give a reason. It is saved with the decision.')
  const [s, id] = addDecision(
    state,
    { type: 'override', title: `Own setting for ${workerLabel(o.workerId)}`, summary: `${OVERRIDE_LABELS[o.field]} for this Worker is ${formatOverride(o.field, o.value)}, whatever the platform default.`, reason: o.reason, effect: 'This Worker keeps its own value when the platform default changes.', outcome: 'applied', workerIds: [o.workerId] },
    ctx,
  )
  const rest = s.overrides.filter((x) => !(x.workerId === o.workerId && x.field === o.field))
  return done({ ...s, overrides: [...rest, { ...o, at: ctx.at, setBy: ctx.actor.name }] }, id)
}

export function removeOverride(state: DemoState, workerId: string, field: OverrideField, reason: string, ctx: Ctx): Result {
  if (!state.overrides.some((x) => x.workerId === workerId && x.field === field)) return fail('This Worker has no own setting for that.')
  if (needsReason(reason)) return fail('Give a reason. It is saved with the decision.')
  const [s, id] = addDecision(
    state,
    { type: 'override', title: `Own setting removed for ${workerLabel(workerId)}`, summary: `${OVERRIDE_LABELS[field]} for this Worker now follows the platform default.`, reason, effect: 'Follows the platform default.', outcome: 'applied', workerIds: [workerId] },
    ctx,
  )
  return done({ ...s, overrides: s.overrides.filter((x) => !(x.workerId === workerId && x.field === field)) }, id)
}

/** Record a Sentinel decision that only records (monitoring) or applies, as the seed and Sentinels do. */
export function recordDecision(state: DemoState, input: DecisionInput, ctx: Ctx): Result {
  const [s, id] = addDecision(state, input, ctx)
  return done(input.agreementId ? linkDecision(s, input.agreementId, id) : s, id)
}
