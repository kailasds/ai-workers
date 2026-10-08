// Wire types for the Registry and Worker workspace. Field names follow the wire format of
// `worker-portfolio-v1`, `worker-record-v1`, `packageable-compositions-v1`,
// `customer-package-directory-v1` and `worker-brain-v1` (docs/product-context/data-contracts.md).

import type { FreshnessState, Verdict } from './dashboard'

export type IdentityState = 'PROVISIONED' | 'ACTIVE' | 'PAUSED' | 'REVOKED'
export type CredentialState = 'UNISSUED' | 'ISSUED' | 'DISABLED' | 'UNAVAILABLE'

export interface PortfolioWorker {
  composition_id: string
  created_at: string
  name: string
  worker_type: string
  owner: string | null
  owner_subject: string | null
  revision: number
  outcome: string
  identity: { state: IdentityState; spiffe_id: string }
  bounded_context: { key: string; label: string; statement: string; exclusions: number }
  runtime: { serving: number; stopped: number; attention: number; substrates: string[]; reachable_worker_id: string | null }
  last_outcome: { verdict: Verdict | null; finished_at: string | null; last_run_at: string | null; runs: number }
  learning: { memories: number; recent_delta: number; contradictions: number; runs: number; last_at: string | null }
  brain: { state: string; engine: string | null; composed_engine_version: string | null; durability: string; observed_at: string | null }
  sentinel: { state: string; worker_runtime: 'WORKER_RUNTIME' | 'NOT_RUNNING' | string; last_action: string | null; observed_at: string | null }
  routing: { mode: 'pinned' | 'litellm_auto' | 'external'; router: string | null }
}

export interface WorkerPortfolio {
  schema_version: 'worker-portfolio-v1'
  generated_at: string
  freshness: { state: FreshnessState; observed_at: string | null }
  totals: { workers: number; serving: number; attention: number }
  bounded_contexts: { key: string; label: string; workers: number }[]
  workers: PortfolioWorker[]
  next_cursor: string | null
}

export type RuntimeState = 'DEPLOYING' | 'RUNNING' | 'STOPPED' | 'FAILED' | 'TERMINATED'
export type RuntimeHealth = 'STARTING' | 'HEALTHY' | 'UNHEALTHY' | 'STOPPED' | 'UNKNOWN'
export type StopReason = 'stopped' | 'expired' | 'terminated' | 'termination_failed'

/** One deployed instance of a Package ("Worker record"). */
export interface RuntimeRecord {
  id: string
  composition_id: string
  package_id: string
  name: string
  target: 'ECS' | 'LOCAL'
  state: RuntimeState
  health: RuntimeHealth
  runtime_name: string
  image: string
  restart_count: number
  runtime_slot: number
  desktop_enabled: boolean
  runtime_fronted: boolean
  created_at: string
  observed_at: string
  expires_at: string | null
  stop_reason: StopReason | null
}

export interface WorkerIdentity {
  worker_id: string
  spiffe_id: string
  status: IdentityState
  credential_state: CredentialState
  token_ttl_seconds: number
  can_present_credential: boolean
  revoked_at: string | null
  bounded_scope: string
  scope_excludes: string[]
}

export interface PackageableComposition {
  composition_id: string
  name: string
  revision: number
  identity: WorkerIdentity
  bounded_context_key: string
  created_at: string
  updated_at: string
  readiness: 'READY_FOR_UNSIGNED_DRAFT' | 'BLOCKED'
  blocking_issues: number
  issues: { code: string; message: string; section: string }[]
  contents: {
    context_label: string
    business_domain_key: string | null
    skills: number
    languages: number
    evaluations: number
    dod_criteria: number
    operating_mode: string | null
    harness: string | null
  }
  package: { id: string; status: string; composition_revision: number; created_at: string } | null
  maturity: {
    runs: number
    runs_met: number
    last_run_at: string | null
    skill_changes: number
    claims: number
    memories: number
    learned_at: string | null
    memory_kinds: { episodic: number; semantic: number; procedural: number }
  }
}

export interface CustomerPackage {
  delivery_id: string
  composition_id: string
  worker_name: string
  revision: number
  version: string
  digest: string
  state: 'PREPARING' | 'PREPARED' | 'SHARED' | 'DOWNLOADED' | 'ACKNOWLEDGED' | 'EXPIRED' | 'FAILED'
  destination_label: string | null
  expires_at: string | null
  last_evidence_at: string | null
  requirements: Record<string, string> | null
  contents: { key: string; label: string; integrity: 'VERIFIED' | 'FAILED' }[]
  callback: { configured: string; observed: string }
  source: { state: string; repository: string | null; tag: string | null }
  size_bytes: number | null
}

export interface WorkerBrain {
  state: 'not_packaged' | 'unreachable' | 'sealed' | 'idle' | 'learning'
  detail: string
  observed_at: string
  engine: unknown
  durability: { survives_restart: boolean; mechanism: string; detail: string; last_snapshot_at: string | null }
  unavailable: { section: string; reason: string }[]
  compounding: {
    configured: boolean
    minimum_observations: number
    requires_dod_met: boolean
    skill_changes: unknown[]
    held_back: { skill: string; kind: string; key: string; reason: string }[]
  } | null
}

/** A completed run attributed to this Worker (from the run ledger, joined through its runtimes). */
export interface WorkerRun {
  run_ref: string
  runtime_id: string
  verdict: Verdict
  completed_at: string
  duration_seconds: number
  total_tokens: { state: string; value: number | null }
  model_cost_usd: { state: string; value: string | null }
  source_technology: string
  target_technology: string
  context_label: string
}

/**
 * Client view model for the Worker workspace. Assembled from one moment's reads so identity,
 * scope and runtimes agree (the real console reads `worker-passport-v1` for the same reason).
 */
export interface WorkerWorkspace {
  read_at: string
  worker: PortfolioWorker
  composition: PackageableComposition | null
  runtimes: RuntimeRecord[]
  runs: WorkerRun[]
  deliveries: CustomerPackage[]
  /** null when the brain read is not available for this Worker. */
  brain: WorkerBrain | null
}
