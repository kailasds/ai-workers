// Wire types for the Knowledge library, Compose catalogues, Harnesses, Sentinel and Learning
// reads (docs/product-context/data-contracts.md). Only the fields the console reads are typed.

export interface KnowledgeSkill {
  name: string
  title: string
  description: string
  category: string
  status: string
  version: string
  tags: string[]
  assigned_agent_keys: string[]
  provenance: 'internal' | 'external' | string
  license: string | null
  source_url: string | null
  skill_type: 'capability' | 'definition_of_done'
  source_technology: string | null
  target_technology: string | null
  recommended_evaluation_ids: string[]
  worker_count: number
  group: 'engineering' | 'security' | 'compliance' | 'domain' | string
  grouped: boolean
}

export interface SkillGroup {
  key: string
  label: string
  summary: string
  total: number
  ungrouped: number
}

export interface SkillLibrary {
  generated_at: string
  partial: boolean
  categories: string[]
  groups: SkillGroup[]
  skills: KnowledgeSkill[]
}

export interface DslDomain {
  domain_id: string
  name: string
  path: string
  version: string
  market: string | null
  industry: string | null
  lines_of_business: string[]
  statistics: Record<string, number>
  plugin_slug: string | null
  published: boolean
}

export interface Evaluation {
  id: string
  name: string
  description: string | null
  category: string
  version: number
  pass_threshold: number | null
  hard_gate: boolean
}

export interface DodRubric {
  criterion_key: string
  display_name: string
  method: 'llm_judge' | 'harness_metric' | 'code_skill' | 'external_tool' | string
  skill_ref: string | null
  calculation: string | null
  computation: { summary: string | null; steps: string[]; rule: string | null; evaluation_slugs: string[] } | null
  aliases: string[]
  unit: string | null
  default_threshold: string | null
  gating_by_default: boolean
  availability: 'AVAILABLE' | 'REQUIRES_TOOL' | 'NOT_IMPLEMENTED' | string
  availability_detail: string | null
}

export interface ModelEntry {
  id: string
  name: string
  provider: string
  is_local: boolean
  is_fine_tuned: boolean
  availability: string
}

export interface WorkerType {
  key: string
  display_name: string
  summary: string
  availability: 'available' | 'in_build' | 'withdrawn'
  availability_detail: string
  bounded_context_count: number
}

export interface Geography {
  key: string
  display_name: string
  summary: string
  eval_count: number
  review_note: string | null
}

export interface Harness {
  key: string
  display_name: string
  vendor: string
  summary: string
  availability: 'available' | 'recipe_only' | 'planned' | string
  availability_detail: string
  image_pin: { state: string; digest: string | null }
  manifest_source: string
  manifest_digest: string | null
  manifest: {
    id: string
    name: string
    version: string
    vendor: string
    description: string
    worker_types: string[]
    contract: { major: number; minors: number[] }
    serve: { bind: string; port: number; base_path: string }
    stages: { key: string; title: string; adds: string; pipeline: string; produces: string[]; requires_sidecars: string[]; after: string | null }[]
    evidence_metrics: { id: string; title: string; type: string; higher_is_better: boolean; description: string }[]
    events: { core: string[]; core_count: number; extensions: { type: string; description: string; learning_signal: boolean }[] }
    consumes: Record<string, string | boolean>
    sidecars: string[]
    surfaces: { path: string; title: string; purpose: string }[]
    resources: { cpu: number; memory_mib: number; ephemeral_storage_gib: number }
    egress: { model_gateway: boolean; package_mirrors: string[]; other: string[] }
    licence: string
  } | null
  conformance: { state: 'admitted' | 'checked' | 'rejected' | string; report_id: string; admitted_at: string | null; admitted_by: string | null; checked_at: string | null } | null
  used_by: number | null
}

export type SeverityCounts = Record<'0' | '1' | '2' | '3' | 'grant', number>

export interface SentinelMode {
  set: 'shadow' | 'enforce' | null
  acting: boolean
  why: string | null
}

export interface PlatformSentinelOverview {
  generated_at: string
  window_days: number
  viewer: { admin: boolean }
  mode: SentinelMode
  coverage: { running: number; reporting: number; no_sentinel: number; unavailable: number; not_running: number; complete: boolean }
  chain: { verified: boolean | null; entries: number; broken_at: string | null; checked: number }
  dimensions: { key: string; mode: SentinelMode; built: boolean; built_by: string | null; open: SeverityCounts; last: { title: string; at: string } | null; counts_7d: SeverityCounts }[]
  in_force: { id: string; kind: string; title: string; scope: string; effect: string; since: string; reason: string }[]
  stream: { id: string; at: string; dimension: string; severity: string; headline: string; applied: boolean }[]
  needs_review: number
}

export interface SentinelLearningFleet {
  generated_at: string
  workers: { worker_id: string; name: string; composition_id: string; target: string; state: string; status: string; detail: string | null; learning: unknown }[]
  counts: { workers: number; answered: number; not_answering: number; no_runtime: number }
}

export interface FleetTerm {
  sum: number | null
  reporting: number
  eligible: number
  stopped: number
}

export interface LearningWorkers {
  generated_at: string
  period: string
  totals: {
    experiences: FleetTerm
    okf_approved: FleetTerm & { shadow: number; applied: number; mode: string | null }
    skills_adopted: FleetTerm
    tokens_per_met_run: { change: number | null; comparable_workers: number; method: string | null }
  }
  workers: { composition_id: string; name: string; score: number | null }[]
  truncated: boolean
}

export interface SourcePublication {
  available: boolean
  publish_by_default: boolean
  project: string | null
  project_url: string | null
  detail: string
}
