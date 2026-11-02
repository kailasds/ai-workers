// Platform Sentinel demo model. Workers are the platform's own Workers (shared ids with the
// Registry and Learning); everything governance-related here is simulated demo data, kept in
// this browser. Nothing in this model is sent to, or enforced by, a platform.

export type GovStatus = 'active' | 'stopped'

export interface WorkerGov {
  status: GovStatus
  /** The decision that stopped it, while stopped. */
  stopDecisionId: string | null
}

/** Agreement status. "active" means at least one item has been delivered. */
export type AgreementStatus = 'proposed' | 'agreed' | 'active' | 'suspended' | 'revoked' | 'rejected'
export type Approval = 'approved' | 'pending' | 'rejected'

export interface Agreement {
  id: string
  /** Pool = the bounded context both Workers work in. */
  pool: string
  sourceId: string
  targetId: string
  item: string
  scope: string
  status: AgreementStatus
  /** Status to return to when a suspension is lifted. */
  resumeTo: 'agreed' | 'active' | null
  originApproval: Approval
  receiverApproval: Approval
  delivered: number
  used: number
  createdAt: string
  updatedAt: string
  reason: string | null
  decisionIds: string[]
}

export interface EligibleItem {
  id: string
  pool: string
  sourceId: string
  title: string
  since: string
}

export type DecisionType =
  | 'stop'
  | 'resume'
  | 'share'
  | 'reject_share'
  | 'suspend'
  | 'resume_share'
  | 'revoke'
  | 'withhold'
  | 'spread_review'
  | 'removal_review'
  | 'review_outcome'
  | 'record_only'
  | 'harness_block'
  | 'policy_change'
  | 'override'

/** Requested → pending review → applied; blocked and failed are explicit; recorded = monitoring only. */
export type Outcome = 'applied' | 'pending' | 'requested' | 'blocked' | 'failed' | 'recorded'
export type AuthorityKind = 'administrator' | 'platform_sentinel' | 'worker_sentinel'

export interface Decision {
  id: string
  seq: number
  at: string
  type: DecisionType
  title: string
  /** What happened, in a sentence. */
  summary: string
  reason: string
  conditions: string[]
  /** The intended effect. */
  effect: string
  outcome: Outcome
  decidedBy: { kind: AuthorityKind; name: string }
  workerIds: string[]
  /** Per affected Worker: did it confirm the effect? */
  receipts: { workerId: string; status: 'confirmed' | 'awaiting' | 'not_needed'; customer: string | null }[]
  agreementId: string | null
  /** An earlier decision this one follows up (review, resume, lift). */
  relatedTo: string | null
  evidence: { headlines: string[]; runs: string[]; refs: string[] }
  integrity: { hash: string; prev: string | null; policyHash: string; inputs: string[] } | null
}

export type ControlKind = 'admin_stop' | 'harness_block' | 'sharing_suspension' | 'recording_only'

export interface Control {
  id: string
  kind: ControlKind
  title: string
  what: string
  scope: string
  workerIds: string[]
  by: string
  since: string
  reason: string
  decisionId: string | null
  agreementId: string | null
  active: boolean
  liftedAt: string | null
}

export interface Policy {
  /** recording_only: Sentinel decisions are written down but not applied. enforce: applied. */
  mode: 'recording_only' | 'enforce'
  sharingEnabled: boolean
  requireReceiverApproval: boolean
  minIndependentWorkers: number
  /** USD; null = no limit. */
  costPerRunLimit: number | null
  suspendSharingOnStop: boolean
}

export interface PolicyRevision {
  rev: number
  at: string
  by: string
  reason: string
  changes: { field: keyof Policy; from: string; to: string }[]
  decisionId: string | null
}

export type OverrideField = 'mode' | 'costPerRunLimit' | 'requireReceiverApproval'

export interface Override {
  workerId: string
  field: OverrideField
  value: string
  reason: string
  setBy: string
  at: string
}

export type FindingKind = 'run_health' | 'cost' | 'contradiction' | 'removal'

export interface Finding {
  id: string
  kind: FindingKind
  workerId: string
  title: string
  detail: string
  period: string
  /** Real = computed from the snapshot's runs; demo = part of the demo dataset. */
  source: 'snapshot' | 'demo'
  decisionId: string | null
}

export interface DemoState {
  version: 1
  workers: Record<string, WorkerGov>
  agreements: Agreement[]
  eligible: EligibleItem[]
  decisions: Decision[]
  controls: Control[]
  policy: Policy
  revisions: PolicyRevision[]
  overrides: Override[]
  /** Demo findings (contradictions, removal recommendations). Run health and cost are computed from the snapshot. */
  findings: Finding[]
  /** Informational findings the administrator dismissed. Dismissing never lifts a control. */
  dismissed: string[]
}
