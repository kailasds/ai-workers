// Everything a Sentinel screen counts is derived here from the one demo state plus the snapshot's
// Workers and runs, so every screen agrees.

import { isResolved, formatOverride } from './engine'
import { isServing, LEARNING_ITEMS_SENT, POOLS, RUNS, runsOf, workerLabel, WORKERS } from './platform'
import type { Agreement, Control, Decision, DemoState, Finding } from './types'

export type Operational = 'running' | 'stopped' | 'not_running'

/** A Worker stopped by an administrator is stopped everywhere, whatever its runtime reported. */
export function operational(s: DemoState, workerId: string): Operational {
  if (s.workers[workerId]?.status === 'stopped') return 'stopped'
  return isServing(workerId) ? 'running' : 'not_running'
}

export const OPERATIONAL_LABEL: Record<Operational, string> = { running: 'Running', stopped: 'Stopped by administrator', not_running: 'Not running' }

// ── Sharing ─────────────────────────────────────────────────────────────────

export type Stage = 'eligible' | 'proposed' | 'agreed' | 'delivered' | 'used'
export type Blocked = 'suspended' | 'rejected' | 'revoked'

export const STAGES: { key: Stage; label: string; meaning: string }[] = [
  { key: 'eligible', label: 'Eligible', meaning: 'Meets the sharing rules; not offered yet.' },
  { key: 'proposed', label: 'Proposed', meaning: 'Offered to another Worker; waiting for approval.' },
  { key: 'agreed', label: 'Agreed', meaning: 'Approved on both sides; nothing delivered yet.' },
  { key: 'delivered', label: 'Delivered', meaning: 'The receiving Worker has received it.' },
  { key: 'used', label: 'Used in runs', meaning: 'A run of the receiving Worker drew on it.' },
]

export const BLOCKED: { key: Blocked; label: string; meaning: string }[] = [
  { key: 'suspended', label: 'Suspended', meaning: 'Deliveries paused, with a reason. Can be resumed.' },
  { key: 'rejected', label: 'Rejected', meaning: 'The proposal was turned down. Nothing was sent.' },
  { key: 'revoked', label: 'Revoked', meaning: 'Ended for good. Delivered items are not taken back.' },
]

/** The furthest normal stage an agreement reached, or its blocked state. */
export function stageOf(a: Agreement): Stage | Blocked {
  if (a.status === 'suspended' || a.status === 'rejected' || a.status === 'revoked') return a.status
  if (a.status === 'proposed') return 'proposed'
  if (a.used > 0) return 'used'
  if (a.delivered > 0) return 'delivered'
  return 'agreed'
}

export function sharingCounts(s: DemoState, poolKey?: string | null) {
  const ag = s.agreements.filter((a) => !poolKey || a.pool === poolKey)
  const el = s.eligible.filter((e) => !poolKey || e.pool === poolKey)
  const by = (k: Stage | Blocked) => ag.filter((a) => stageOf(a) === k).length
  return {
    eligible: el.length,
    proposed: by('proposed'),
    agreed: by('agreed'),
    delivered: by('delivered'),
    used: by('used'),
    suspended: by('suspended'),
    rejected: by('rejected'),
    revoked: by('revoked'),
    itemsDelivered: ag.reduce((n, a) => n + a.delivered, 0),
    timesUsed: ag.reduce((n, a) => n + a.used, 0),
  }
}

export const poolStats = (s: DemoState) => POOLS.map((p) => ({ ...p, ...sharingCounts(s, p.key) }))

// ── Decisions ───────────────────────────────────────────────────────────────

export const TYPE_LABEL: Record<Decision['type'], string> = {
  stop: 'Stop',
  resume: 'Resume',
  share: 'Share',
  reject_share: 'Reject sharing',
  suspend: 'Suspend sharing',
  resume_share: 'Resume sharing',
  revoke: 'Revoke sharing',
  withhold: 'Withhold from sharing',
  spread_review: 'Review spread',
  removal_review: 'Removal recommendation',
  review_outcome: 'Review outcome',
  record_only: 'Monitoring',
  harness_block: 'Harness block',
  policy_change: 'Policy change',
  override: 'Worker setting',
}

export const OUTCOME_LABEL: Record<Decision['outcome'], string> = {
  applied: 'Applied (simulated)',
  pending: 'Awaiting review',
  requested: 'Requested',
  blocked: 'Blocked',
  failed: 'Failed',
  recorded: 'Recorded, no control applied',
}

export const AUTHORITY_LABEL = { administrator: 'Administrator', platform_sentinel: 'Platform Sentinel', worker_sentinel: 'Worker Sentinel' } as const

/** Pending and not yet resolved by a later review. */
export const awaitingReview = (s: DemoState) => s.decisions.filter((d) => d.outcome === 'pending' && !isResolved(s, d.id))

export const decisionsFor = (s: DemoState, workerId: string) => s.decisions.filter((d) => d.workerIds.includes(workerId))

// ── Monitoring ──────────────────────────────────────────────────────────────

/** The cost limit in effect for one Worker: its own, else the platform's. */
export function costLimitFor(s: DemoState, workerId: string) {
  const own = s.overrides.find((o) => o.workerId === workerId && o.field === 'costPerRunLimit')
  return own ? { value: Number(own.value), source: 'worker' as const } : { value: s.policy.costPerRunLimit, source: 'platform' as const }
}

/** Run health and cost from the snapshot's real runs, plus the demo findings. */
export function findings(s: DemoState): Finding[] {
  const out: Finding[] = []
  const span = RUNS.length ? `${new Date(RUNS[0].at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(RUNS.at(-1)!.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''
  for (const w of WORKERS) {
    const runs = runsOf(w.composition_id)
    if (runs.length >= 2) {
      const missed = runs.filter((r) => r.verdict === 'NOT_MET').length
      if (missed / runs.length >= 0.5) out.push({ id: `fnd-health-${w.composition_id}`, kind: 'run_health', workerId: w.composition_id, title: `${missed} of ${runs.length} runs missed the Definition of Done`, detail: 'Half or more of this Worker’s recorded runs did not meet its Definition of Done.', period: `Snapshot runs, ${span}`, source: 'snapshot', decisionId: null })
    }
    const costed = runs.filter((r) => r.cost !== null)
    const limit = costLimitFor(s, w.composition_id)
    if (costed.length && limit.value !== null) {
      const avg = costed.reduce((n, r) => n + (r.cost ?? 0), 0) / costed.length
      if (avg > limit.value) out.push({ id: `fnd-cost-${w.composition_id}`, kind: 'cost', workerId: w.composition_id, title: `Cost per run $${avg.toFixed(2)}, above the $${limit.value.toFixed(2)} limit`, detail: `Average over ${costed.length} costed ${costed.length === 1 ? 'run' : 'runs'}. Limit set by ${limit.source === 'worker' ? 'this Worker’s own setting' : 'platform policy'}.`, period: `Snapshot runs, ${span}`, source: 'snapshot', decisionId: null })
    }
  }
  return [...out, ...s.findings]
}

export const FINDING_LABEL: Record<Finding['kind'], string> = { run_health: 'Run health', cost: 'Cost per run', contradiction: 'Contradictory learning', removal: 'Removal recommendation' }

// ── Attention ───────────────────────────────────────────────────────────────

export interface Attention {
  key: string
  priority: number
  title: string
  subject: string
  state: string
  tone: 'warning' | 'danger' | 'info'
  why: string
  /** A link (path or `?param=` that opens a drawer in place). */
  action: { label: string; to: string }
  /** Informational items can be dismissed; governance items can't. */
  dismissible: boolean
  /** The findings a dismissal hides; for a group, each Worker's own. */
  findingIds?: string[]
  workers?: string[]
}

/**
 * What a person should look at: reviews that wait on them, suspended and proposed sharing, and
 * monitoring findings. Stops and blocks are controls in force, not attention; they are listed
 * under Controls.
 */
export function attention(s: DemoState): Attention[] {
  const out: Attention[] = []
  for (const d of awaitingReview(s)) out.push({ key: `review:${d.id}`, priority: 1, title: d.title, subject: d.workerIds.map(workerLabel).join(', '), state: 'Awaiting review', tone: 'warning', why: d.reason, action: { label: 'Review', to: `/sentinel/decisions/${d.id}` }, dismissible: false })
  for (const a of s.agreements.filter((x) => x.status === 'suspended')) out.push({ key: `susp:${a.id}`, priority: 2, title: `Sharing suspended: ${a.item}`, subject: `${workerLabel(a.sourceId)} → ${workerLabel(a.targetId)}`, state: 'Suspended', tone: 'warning', why: a.reason ?? 'Reason not recorded.', action: { label: 'Open agreement', to: `?agreement=${a.id}` }, dismissible: false })
  const proposed = s.agreements.filter((x) => x.status === 'proposed')
  if (proposed.length === 1) out.push({ key: `prop:${proposed[0].id}`, priority: 3, title: `Sharing proposal: ${proposed[0].item}`, subject: `${workerLabel(proposed[0].sourceId)} → ${workerLabel(proposed[0].targetId)}`, state: 'Awaiting approval', tone: 'info', why: 'Nothing is sent until it is approved.', action: { label: 'Open proposal', to: `?agreement=${proposed[0].id}` }, dismissible: false })
  else if (proposed.length > 1) out.push({ key: 'prop', priority: 3, title: `${proposed.length} sharing proposals`, subject: proposed.map((a) => a.item).join(', '), state: 'Awaiting approval', tone: 'info', why: 'Nothing is sent until each is approved.', action: { label: 'See proposals', to: '/sentinel/sharing?view=agreements&status=proposed' }, dismissible: false })
  // Monitoring findings: one item per kind, so a busy week doesn't bury the governance items.
  const open = findings(s).filter((x) => x.kind !== 'removal' && !s.dismissed.includes(x.id))
  for (const kind of ['contradiction', 'run_health', 'cost'] as const) {
    const of = open.filter((f) => f.kind === kind)
    if (!of.length) continue
    const one = of.length === 1
    out.push({
      key: `find:${kind}`,
      priority: 4,
      title: one ? (of[0].title.toLowerCase().startsWith(FINDING_LABEL[kind].toLowerCase()) ? of[0].title : `${FINDING_LABEL[kind]}: ${of[0].title}`) : `${FINDING_LABEL[kind]}: ${of.length} Workers`,
      subject: one ? workerLabel(of[0].workerId) : of.slice(0, 2).map((f) => workerLabel(f.workerId)).join(', ') + (of.length > 2 ? ` and ${of.length - 2} more` : ''),
      state: of[0].source === 'snapshot' ? 'From snapshot runs' : 'Finding',
      tone: 'info',
      why: one ? of[0].detail : kind === 'cost' ? 'Average cost per run is above the limit that applies to each.' : kind === 'run_health' ? 'Half or more of their recorded runs missed the Definition of Done.' : 'Learning from different Workers disagrees.',
      action: { label: one ? 'Open Worker' : 'Show Workers', to: `?worker=${of[0].workerId}` },
      dismissible: true,
      findingIds: of.map((f) => f.id),
      workers: of.map((f) => f.workerId),
    })
  }
  return out.sort((a, b) => a.priority - b.priority)
}

// ── Controls ────────────────────────────────────────────────────────────────

export const CONTROL_LABEL: Record<Control['kind'], string> = { admin_stop: 'Stopped by administrator', harness_block: 'Harness block', sharing_suspension: 'Sharing suspended', recording_only: 'Recording-only mode' }
export const CONTROL_TONE: Record<Control['kind'], 'danger' | 'warning' | 'neutral'> = { admin_stop: 'danger', harness_block: 'danger', sharing_suspension: 'warning', recording_only: 'neutral' }
/** What a control does to the Workers it covers, in a sentence. */
export const CONTROL_EFFECT: Record<Control['kind'], string> = {
  admin_stop: 'The Worker may not start new runs until it is resumed.',
  harness_block: 'Runs on the blocked harness version are refused; other versions are unaffected.',
  sharing_suspension: 'No further deliveries under the agreement. Items already delivered stay with the receiving Worker.',
  recording_only: 'Sentinel decisions are written down but not applied.',
}

/** Who put a control in place: the authority on its decision, else the name recorded on it. */
export function controlSource(s: DemoState, c: Control) {
  const d = c.decisionId ? s.decisions.find((x) => x.id === c.decisionId) : null
  return d ? AUTHORITY_LABEL[d.decidedBy.kind] : c.by
}

export function controlCounts(s: DemoState) {
  const active = s.controls.filter((c) => c.active)
  const of = (k: Control['kind']) => active.filter((c) => c.kind === k).length
  return { active: active.length, stops: of('admin_stop'), harness: of('harness_block'), sharing: of('sharing_suspension'), mode: of('recording_only'), lifted: s.controls.length - active.length }
}

// ── Summary ─────────────────────────────────────────────────────────────────

export function summary(s: DemoState, sinceIso: string | null) {
  const ops = WORKERS.map((w) => operational(s, w.composition_id))
  const inPeriod = s.decisions.filter((d) => !sinceIso || d.at >= sinceIso)
  return {
    running: ops.filter((o) => o === 'running').length,
    stopped: ops.filter((o) => o === 'stopped').length,
    notRunning: ops.filter((o) => o === 'not_running').length,
    monitored: WORKERS.filter((w) => w.sentinel.state === 'CONFIGURED').length,
    total: WORKERS.length,
    learningSent: LEARNING_ITEMS_SENT,
    decisions: inPeriod.length,
    applied: inPeriod.filter((d) => d.outcome === 'applied').length,
    recorded: inPeriod.filter((d) => d.outcome === 'recorded').length,
    pending: inPeriod.filter((d) => d.outcome === 'pending' && !isResolved(s, d.id)).length,
    controls: s.controls.filter((c) => c.active).length,
  }
}

export const overrideText = (field: Parameters<typeof formatOverride>[0], value: string) => formatOverride(field, value)
