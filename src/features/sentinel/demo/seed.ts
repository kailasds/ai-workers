// The demo's starting point: a fixed timeline replayed through the same validated actions the
// administrator uses, so the initial data obeys the same rules. Worker ids are the platform's;
// agreements, decisions, controls and policy are demo data. Timestamps are fixed.

import { approveAgreement, formatPolicyValue, POLICY_LABELS, proposeAgreement, recordDecision, rejectAgreement, revokeAgreement, resumeWorker, setOverride, stopWorker, suspendAgreement, type Ctx, type Result } from './engine'
import { POOLS, runsOf, workerLabel, WORKERS } from './platform'
import type { DemoState, Policy } from './types'

const ADMIN = { kind: 'administrator' as const, name: 'Platform administrator (demo)' }
const PLATFORM = { kind: 'platform_sentinel' as const, name: 'Platform Sentinel' }
const WORKER_SENTINEL = { kind: 'worker_sentinel' as const, name: 'Worker Sentinel' }
const at = (iso: string, actor: Ctx['actor'] = ADMIN): Ctx => ({ at: iso, actor })

const RUNNING = 'a9cb82d0-4508-4a8b-bd56-fbdbb856018b'

/** Pool members, Workers with memory first, then by id; the running Worker is kept out of demo stops. */
function pool(key: string) {
  return WORKERS.filter((w) => w.bounded_context.key === key)
    .sort((a, b) => b.learning.memories - a.learning.memories || a.composition_id.localeCompare(b.composition_id))
    .map((w) => w.composition_id)
}

const INITIAL_POLICY: Policy = { mode: 'recording_only', sharingEnabled: true, requireReceiverApproval: true, minIndependentWorkers: 2, costPerRunLimit: 22, suspendSharingOnStop: true }

function step(_previous: DemoState, r: Result): DemoState {
  if (!r.ok) throw new Error(`Demo seed step failed: ${r.error}`)
  return r.state
}

export function buildSeed(): DemoState {
  const [qe, gen, unit, trace] = ['qe-testcases-to-executed-scripts', 'tibco-bw-to-spring-boot-services', 'tibco-bw-to-spring-boot-services-tests', 'tibco-bw-to-spring-boot-services-tests-traceability'].map((k) =>
    POOLS.some((p) => p.key === k) ? pool(k) : [],
  )
  const q = qe.filter((id) => id !== RUNNING)
  let s: DemoState = {
    version: 1,
    workers: Object.fromEntries(WORKERS.map((w) => [w.composition_id, { status: 'active' as const, stopDecisionId: null }])),
    agreements: [],
    eligible: [],
    decisions: [],
    controls: [],
    policy: INITIAL_POLICY,
    revisions: [],
    overrides: [],
    findings: [],
    dismissed: [],
  }

  // Platform defaults, revision 1: recording only, sharing on, both sides approve.
  const fields = Object.keys(INITIAL_POLICY) as (keyof Policy)[]
  s = step(s, recordDecision(s, { type: 'policy_change', title: 'Platform policy revision 1', summary: fields.map((f) => `${POLICY_LABELS[f]}: ${formatPolicyValue(f, INITIAL_POLICY[f])}`).join('. ') + '.', reason: 'Initial platform defaults for the pilot.', effect: 'Applies to all Workers without their own setting.', outcome: 'applied', workerIds: [] }, at('2026-09-18T09:00:00Z')))
  const policyDecision = s.decisions.at(-1)!.id
  s = {
    ...s,
    revisions: [{ rev: 1, at: '2026-09-18T09:00:00Z', by: ADMIN.name, reason: 'Initial platform defaults for the pilot.', changes: fields.map((f) => ({ field: f, from: 'Not set', to: formatPolicyValue(f, INITIAL_POLICY[f]) })), decisionId: policyDecision }],
    controls: [{ id: 'ctl-001', kind: 'recording_only', title: 'Recording-only mode', what: 'Sentinel decisions are written down but not applied.', scope: 'All Workers without their own mode', workerIds: [], by: ADMIN.name, since: '2026-09-18T09:00:00Z', reason: 'Initial platform defaults for the pilot.', decisionId: policyDecision, agreementId: null, active: true, liftedAt: null }],
  }

  s = step(s, recordDecision(s, { type: 'harness_block', title: 'Harness version 0.9.2 blocked', summary: 'Workers may not start runs on harness version 0.9.2 of the Integration Modernisation Harness.', reason: 'Conformance report showed the version drops message headers.', effect: 'Runs on that version are refused; other versions are unaffected.', outcome: 'applied', workerIds: gen.slice(10, 12), evidence: { headlines: ['Conformance check 7 failed: message headers not preserved'], runs: [], refs: ['conformance/int-mod-0.9.2'] } }, at('2026-09-19T10:30:00Z')))
  const harnessDecision = s.decisions.at(-1)!.id
  s = { ...s, controls: [...s.controls, { id: `ctl-${String(s.controls.length + 1).padStart(3, '0')}`, kind: 'harness_block', title: 'Harness version 0.9.2 blocked', what: 'Refuses runs on this harness version.', scope: 'Integration Modernisation Harness 0.9.2', workerIds: gen.slice(10, 12), by: ADMIN.name, since: '2026-09-19T10:30:00Z', reason: 'Conformance report showed the version drops message headers.', decisionId: harnessDecision, agreementId: null, active: true, liftedAt: null }] }

  // Agreements, proposed by the origin Worker's Sentinel.
  const proposals: [string, string, string, string, string, string, 'approved' | 'pending'][] = [
    ['agr-001', qe[0] === RUNNING ? q[0] : qe[0], q[1], 'Wait strategy for dynamic tables', 'Playwright locator patterns', '2026-09-20T08:10:00Z', 'pending'],
    ['agr-002', q[2], q[3], 'Page object naming convention', 'Page object structure', '2026-09-20T08:40:00Z', 'pending'],
    ['agr-003', q[4], q[5], 'Assertion style for currency fields', 'Assertion helpers', '2026-09-21T11:00:00Z', 'pending'],
    ['agr-004', q[6], q[7], 'Retry pattern for flaky login steps', 'Login step definitions', '2026-10-03T14:20:00Z', 'pending'],
    ['agr-005', q[8], q[9], 'Test data reset sequence', 'Test data set-up', '2026-09-22T09:00:00Z', 'pending'],
    ['agr-006', q[10], q[11], 'Screenshot-on-failure hook', 'Failure reporting', '2026-09-25T16:00:00Z', 'pending'],
    ['agr-007', gen[0], gen[1], 'Mapping of TIBCO XPath functions to Java', 'Expression conversion', '2026-09-20T13:00:00Z', 'pending'],
    ['agr-008', gen[2], gen[3], 'Error handler translation for JMS listeners', 'Fault handling', '2026-09-23T10:00:00Z', 'pending'],
    ['agr-009', gen[4], gen[5], 'Logging format for converted services', 'Logging conventions', '2026-10-04T09:30:00Z', 'pending'],
    ['agr-010', gen[6], gen[7], 'Configuration property mapping', 'Service configuration', '2026-09-21T15:00:00Z', 'pending'],
    ['agr-011', unit[0], unit[1], 'JUnit fixture for message listeners', 'Unit test fixtures', '2026-09-24T10:00:00Z', 'pending'],
    ['agr-012', unit[2], unit[3], 'Mocking pattern for external endpoints', 'Unit test doubles', '2026-10-05T08:00:00Z', 'pending'],
  ]
  for (const [id, sourceId, targetId, item, scope, when] of proposals) {
    if (!sourceId || !targetId) continue
    const pk = WORKERS.find((w) => w.composition_id === sourceId)!.bounded_context.key
    s = step(s, proposeAgreement(s, { id, pool: pk, sourceId, targetId, item, scope, originApproval: 'approved', createdAt: when }, at(when, WORKER_SENTINEL)))
  }
  const approve = (id: string, when: string, reason = 'Both Workers met the Definition of Done on the runs it came from.') => {
    if (s.agreements.some((a) => a.id === id)) s = step(s, approveAgreement(s, id, reason, at(when)))
  }
  approve('agr-001', '2026-09-21T09:00:00Z')
  approve('agr-002', '2026-09-21T09:20:00Z')
  approve('agr-003', '2026-09-22T10:00:00Z')
  approve('agr-005', '2026-09-23T09:00:00Z')
  approve('agr-007', '2026-09-21T14:00:00Z')
  approve('agr-008', '2026-09-24T11:00:00Z')
  approve('agr-010', '2026-09-22T16:00:00Z')
  approve('agr-011', '2026-09-25T10:00:00Z')

  // Deliveries and use, as reported by the receiving Workers.
  const deliver = (id: string, delivered: number, used: number, when: string) => {
    s = { ...s, agreements: s.agreements.map((a) => (a.id === id && a.status === 'agreed' ? { ...a, status: 'active', delivered, used, updatedAt: when } : a)) }
  }
  deliver('agr-001', 6, 4, '2026-10-02T12:00:00Z')
  deliver('agr-002', 3, 0, '2026-09-28T12:00:00Z')
  deliver('agr-005', 2, 1, '2026-09-29T12:00:00Z')
  deliver('agr-007', 5, 3, '2026-10-01T12:00:00Z')
  deliver('agr-008', 1, 0, '2026-09-27T12:00:00Z')
  deliver('agr-010', 2, 0, '2026-09-26T12:00:00Z')

  if (s.agreements.some((a) => a.id === 'agr-006')) s = step(s, rejectAgreement(s, 'agr-006', 'Duplicates a step already in the shared Skill.', at('2026-09-27T09:00:00Z')))
  if (s.agreements.some((a) => a.id === 'agr-010')) s = step(s, revokeAgreement(s, 'agr-010', 'The source mapping was corrected; the shared version is no longer valid.', at('2026-09-30T15:30:00Z')))

  // An earlier stop and resume, kept as history.
  if (q[14]) {
    s = step(s, stopWorker(s, q[14], 'Runs were writing test results to the wrong report folder.', at('2026-09-22T08:00:00Z')))
    s = step(s, resumeWorker(s, q[14], 'Report path fixed and checked on a sample run.', at('2026-09-24T17:00:00Z')))
  }

  // Monitoring-only Sentinel decisions (recording-only mode: written down, not applied).
  const recorded = (workerId: string | undefined, title: string, summary: string, reason: string, when: string, headline: string) => {
    if (!workerId) return
    const runs = runsOf(workerId).slice(-2).map((r) => r.ref)
    s = step(s, recordDecision(s, { type: 'record_only', title, summary, reason, effect: 'Recorded for monitoring. No control applied.', outcome: 'recorded', workerIds: [workerId], evidence: { headlines: [headline], runs, refs: [] } }, at(when, PLATFORM)))
  }
  const byCost = [...WORKERS].map((w) => ({ id: w.composition_id, runs: runsOf(w.composition_id).filter((r) => r.cost !== null) })).filter((x) => x.runs.length).sort((a, b) => b.runs.length - a.runs.length)
  recorded(byCost[0]?.id, `Would restrict ${workerLabel(byCost[0]?.id ?? '')}`, 'Sentinel would have limited this Worker’s runs because cost per run went above the platform limit.', 'Average cost per run above the platform limit.', '2026-09-26T07:00:00Z', 'Cost per run above limit')
  recorded(q[1], `Would pause sharing for ${workerLabel(q[1] ?? '')}`, 'Sentinel would have paused new sharing from this Worker after runs that did not meet the Definition of Done.', 'Recent runs did not meet the Definition of Done.', '2026-09-28T07:00:00Z', 'Definition of Done missed on recent runs')
  recorded(gen[0], 'Would withhold an item with too few sources', 'Sentinel would have held back an item that only one Worker had found.', 'Needs 2 independent Workers; 1 found it.', '2026-09-29T07:00:00Z', 'Not enough independent Workers')
  recorded(q[3], 'Signal: run-health dip', 'Run results for this Worker dropped compared with its earlier runs.', 'Fewer runs met the Definition of Done than before.', '2026-10-02T07:00:00Z', 'Run-health signal')

  // Worker Sentinel withheld an item before it could be offered.
  if (q[15]) s = step(s, recordDecision(s, { type: 'withhold', title: 'Withheld from sharing: customer identifier found', summary: 'The Worker’s own Sentinel kept an item private because it contained a customer identifier.', reason: 'Customer material is never shared.', effect: 'The item stays with this Worker only.', outcome: 'applied', workerIds: [q[15]] }, at('2026-09-26T13:00:00Z', WORKER_SENTINEL)))

  // A suspension after a contradiction, and an administrator stop that suspends sharing.
  if (s.agreements.some((a) => a.id === 'agr-008')) s = step(s, suspendAgreement(s, 'agr-008', 'The receiving Worker handles retries differently; the two findings contradict each other.', at('2026-10-01T10:00:00Z')))
  if (q[8]) s = step(s, stopWorker(s, q[8], 'Produced test scripts against the wrong environment URL.', at('2026-10-02T08:30:00Z')))

  // Reviews waiting on a person.
  if (s.agreements.some((a) => a.id === 'agr-001')) {
    const a = s.agreements.find((x) => x.id === 'agr-001')!
    s = step(s, recordDecision(s, { type: 'spread_review', title: `Review the spread of “${a.item}”`, summary: 'This item has been delivered to another Worker and used in its runs. Sentinel asks a person to confirm it should keep spreading.', reason: 'Used in 4 runs of the receiving Worker within a week.', effect: 'Nothing changes until reviewed.', outcome: 'pending', workerIds: [a.sourceId, a.targetId], agreementId: a.id, evidence: { headlines: ['Delivered 6 times', 'Used in 4 runs'], runs: runsOf(a.targetId).slice(-2).map((r) => r.ref), refs: [] } }, at('2026-10-04T09:00:00Z', PLATFORM)))
  }
  const removal = (workerId: string | undefined, item: string, why: string, when: string, fid: string) => {
    if (!workerId) return
    s = step(s, recordDecision(s, { type: 'removal_review', title: `Removal recommended: ${item}`, summary: `Sentinel recommends removing “${item}” from this Worker’s memory.`, reason: why, effect: 'Nothing is removed until a person approves.', outcome: 'pending', workerIds: [workerId], evidence: { headlines: [why], runs: runsOf(workerId).slice(-1).map((r) => r.ref), refs: [] } }, at(when, PLATFORM)))
    s = { ...s, findings: [...s.findings, { id: fid, kind: 'removal', workerId, title: `Removal recommended: ${item}`, detail: why, period: 'Raised 5 Oct 2026', source: 'demo', decisionId: s.decisions.at(-1)!.id }] }
  }
  removal(trace[0] ?? gen[0], 'outdated endpoint mapping', 'The endpoint it describes was retired on 1 Oct.', '2026-10-05T07:30:00Z', 'fnd-rem-1')
  removal(qe[0], 'superseded login wait time', 'A newer memory gives a different wait time for the same step.', '2026-10-05T08:00:00Z', 'fnd-rem-2')

  // A contradiction between two Workers' learning (demo).
  if (gen[2] && gen[3]) s = { ...s, findings: [...s.findings, { id: 'fnd-con-1', kind: 'contradiction', workerId: gen[3], title: 'Contradictory learning about JMS retries', detail: `${workerLabel(gen[3])} retries failed messages three times; the item from ${workerLabel(gen[2])} says never retry.`, period: 'Found 1 Oct 2026', source: 'demo', decisionId: s.agreements.find((a) => a.id === 'agr-008')?.decisionIds.at(-1) ?? null }] }

  // Items that meet the rules but haven't been offered yet.
  const eligible: [string | undefined, string, string][] = [
    [q[12], 'Table pagination helper', '2026-10-03T10:00:00Z'],
    [q[13], 'Date picker interaction', '2026-10-04T10:00:00Z'],
    [gen[8], 'SOAP fault path mapping', '2026-10-02T10:00:00Z'],
    [gen[9], 'Batch job schedule translation', '2026-10-05T10:00:00Z'],
    [trace[0], 'Traceability matrix template', '2026-10-01T10:00:00Z'],
  ]
  s = { ...s, eligible: eligible.filter(([w]) => w).map(([w, title, since], i) => ({ id: `elg-${i + 1}`, pool: WORKERS.find((x) => x.composition_id === w)!.bounded_context.key, sourceId: w!, title, since })) }

  // A Worker with its own settings.
  if (gen[0]) s = step(s, setOverride(s, { workerId: gen[0], field: 'costPerRunLimit', value: '30', reason: 'Large services; higher cost per run expected.' }, at('2026-09-25T09:00:00Z')))
  if (q[2]) s = step(s, setOverride(s, { workerId: q[2], field: 'mode', value: 'enforce', reason: 'Pilot of enforce mode on one Worker.' }, at('2026-09-27T09:00:00Z')))

  return s
}
