// Mirrors `dashboard-executive-v4` (GET /api/dashboard/executive). See
// docs/product-context/data-contracts.md. Field names follow the wire format.

export type Period = '7d' | '30d' | '90d' | 'all'

/** Every metric carries a state. Anything but OBSERVED is "Not measured", never zero. */
export type MeasureState = 'OBSERVED' | 'NOT_MEASURED' | 'UNAVAILABLE'

export interface Comparison {
  state: 'OBSERVED' | 'NO_PRIOR_WINDOW' | 'UNAVAILABLE'
  absolute: number | null
  percent: number | null
}

export interface Metric {
  state: MeasureState
  value: number | null
  unit?: string
  samples?: number
  previous_value?: number | null
  comparison?: Comparison
}

export interface Ratio {
  state: MeasureState
  value: number | null
  numerator: number | null
  denominator: number | null
}

export interface Coverage {
  measured_runs: number
  completed_runs: number
  complete: boolean
  ratio: number
}

export type Verdict = 'MET' | 'NOT_MET' | 'NOT_ADJUDICABLE'

export type FreshnessState = 'CURRENT' | 'DELAYED' | 'STALE' | 'UNAVAILABLE'

export interface FreshnessSource {
  key: string
  label: string
  state: FreshnessState
  observed_at: string | null
}

export interface DashboardWindow {
  key: Period
  start_at: string
  end_at: string
  previous_start_at: string
  previous_end_at: string
  bucket: 'hour' | 'day' | 'week' | 'month' | 'all'
  tz: string
  tz_fallback: boolean
}

export interface OutcomeBucket {
  key: string
  label: string
  start_at: string
  end_at: string
  met: number
  not_met: number
  not_adjudicable: number
}

/** One row of "by Worker identity" / "by bounded context". */
export interface ExecutiveCut {
  key: string
  label: string
  registered: number
  packaged: number
  completed_runs: number
  verified_outcomes: number
  dod_rate: Ratio
  model_cost_per_run: Metric
  tokens_per_run: Metric
  total_cost: Metric
  total_tokens: Metric
  cost_coverage: Coverage
  token_coverage: Coverage
}

export interface DodCriterion {
  key: string
  label: string
  /** Gating criteria stop a release; the rest are observed. */
  gating: boolean
  measured_runs: number
  passed_runs: number
  pass_rate: Ratio
  threshold: number | null
  unit: string | null
}

export interface LedgerRow {
  run_ref: string
  worker_id: string
  worker_name: string
  context_key: string
  context_label: string
  verdict: Verdict
  source_technology: string
  target_technology: string
  completed_at: string
  duration_seconds: number
  total_tokens: { state: MeasureState; value: number | null }
  /** Decimal string on the wire, e.g. "0.261650". */
  model_cost_usd: { state: MeasureState; value: string | null }
}

export interface DataQualityCheck {
  key: string
  label: string
  affected_records: number
  state: 'CLEAR' | 'ATTENTION'
}

export interface ExecutiveDashboard {
  schema_version: 'dashboard-executive-v4'
  generated_at: string
  window: DashboardWindow
  freshness: {
    state: FreshnessState
    observed_at: string | null
    sources: FreshnessSource[]
  }
  headlines: {
    registered_workers: Metric
    packaged_workers: Metric
    completed_runs: Metric
    dod_met: Metric
    active_workers: Metric
    average_run_duration: Metric
  }
  outcome_series: OutcomeBucket[]
  bounded_contexts: ExecutiveCut[]
  identities: ExecutiveCut[]
  model_routing: {
    state: 'OBSERVED' | 'SELECTIONS_ONLY'
    models: { model: string; selections: number; stages: string[]; token_samples: number }[]
  }
  definition_of_done: {
    met: number
    not_met: number
    not_adjudicable: number
    rate: Ratio
    criteria: DodCriterion[]
  }
  run_economics: {
    completed_runs: number
    cost_coverage: Coverage
    token_coverage: Coverage
    model_cost_per_run: Metric
    tokens_per_run: Metric
    total_tokens: Metric
    total_cost: Metric
    average_duration_seconds: Metric
  }
  run_ledger: {
    returned: number
    completed_runs: number
    truncated: boolean
    rows: LedgerRow[]
  }
  autonomy: { level: number; label: string; completed_runs: number; dod_met: number }[]
  governance: {
    active_workers: Metric
    data_quality: DataQualityCheck[]
  }
}
