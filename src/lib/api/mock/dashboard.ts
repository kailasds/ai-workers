// MOCK DATA LAYER. Not production data.
//
// Serves the 2026-10-06 offline capture of `dashboard-executive-v4`
// (src/data/mock/dashboard-executive.json) and re-derives every window-dependent
// aggregate from its run ledger, so the period control behaves and the figures can
// never disagree with the table. Not re-derived: Definition-of-Done criteria (the
// ledger carries no per-criterion results) and registry snapshot counts; both pass
// through from the capture unchanged.

import capture from '@/data/mock/dashboard-executive.json'
import { ApiError } from '../client'
import type {
  Coverage,
  ExecutiveCut,
  ExecutiveDashboard,
  LedgerRow,
  Metric,
  OutcomeBucket,
  Period,
} from '@/lib/types/dashboard'

const source = capture as unknown as ExecutiveDashboard
const DAY = 86_400_000
const NOW = Date.parse(source.generated_at)

let refreshes = 0

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

const observed = (value: number, extra: Partial<Metric> = {}): Metric => ({
  state: 'OBSERVED',
  value,
  comparison: { state: 'UNAVAILABLE', absolute: null, percent: null },
  ...extra,
})
const notMeasured = (unit?: string): Metric => ({ state: 'NOT_MEASURED', value: null, unit })

const coverage = (measured: number, completed: number): Coverage => ({
  measured_runs: measured,
  completed_runs: completed,
  complete: measured === completed,
  ratio: completed === 0 ? 0 : measured / completed,
})

function identityOf(contextKey: string) {
  return contextKey.startsWith('qe-') ? 'qe-test-script-generation' : 'integration-modernization'
}

function summarise(rows: LedgerRow[]) {
  const costs = rows.filter((r) => r.model_cost_usd.state === 'OBSERVED').map((r) => Number(r.model_cost_usd.value))
  const tokens = rows.filter((r) => r.total_tokens.state === 'OBSERVED').map((r) => r.total_tokens.value ?? 0)
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  return {
    runs: rows.length,
    met: rows.filter((r) => r.verdict === 'MET').length,
    costSamples: costs.length,
    totalCost: sum(costs),
    tokenSamples: tokens.length,
    totalTokens: sum(tokens),
    durationSamples: rows.length,
    totalDuration: sum(rows.map((r) => r.duration_seconds)),
  }
}

function cut(base: ExecutiveCut, rows: LedgerRow[]): ExecutiveCut {
  const s = summarise(rows)
  return {
    ...base,
    completed_runs: s.runs,
    verified_outcomes: s.met,
    dod_rate: s.runs
      ? { state: 'OBSERVED', value: s.met / s.runs, numerator: s.met, denominator: s.runs }
      : { state: 'NOT_MEASURED', value: null, numerator: null, denominator: null },
    model_cost_per_run: s.costSamples ? observed(s.totalCost / s.costSamples, { unit: 'USD/run', samples: s.costSamples }) : notMeasured('USD/run'),
    tokens_per_run: s.tokenSamples ? observed(s.totalTokens / s.tokenSamples, { unit: 'tokens/run', samples: s.tokenSamples }) : notMeasured('tokens/run'),
    total_cost: s.costSamples ? observed(s.totalCost, { unit: 'USD', samples: s.costSamples }) : notMeasured('USD'),
    total_tokens: s.tokenSamples ? observed(s.totalTokens, { unit: 'tokens', samples: s.tokenSamples }) : notMeasured('tokens'),
    cost_coverage: coverage(s.costSamples, s.runs),
    token_coverage: coverage(s.tokenSamples, s.runs),
  }
}

function buildBuckets(period: Period, start: number, rows: LedgerRow[]): { buckets: OutcomeBucket[]; bucket: ExecutiveDashboard['window']['bucket'] } {
  const bucket = period === 'all' ? 'month' : period === '90d' ? 'week' : 'day'
  const buckets: OutcomeBucket[] = []
  const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })
  const fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

  let cursor = new Date(start)
  cursor.setUTCHours(0, 0, 0, 0)
  if (bucket === 'month') cursor.setUTCDate(1)

  while (cursor.getTime() <= NOW) {
    const from = cursor.getTime()
    const next = new Date(cursor)
    if (bucket === 'month') next.setUTCMonth(next.getUTCMonth() + 1)
    else next.setTime(from + (bucket === 'week' ? 7 : 1) * DAY)
    const inside = rows.filter((r) => {
      const t = Date.parse(r.completed_at)
      return t >= from && t < next.getTime()
    })
    buckets.push({
      key: cursor.toISOString(),
      label: bucket === 'month' ? fmtMonth.format(cursor) : fmt.format(cursor),
      start_at: cursor.toISOString(),
      end_at: next.toISOString(),
      met: inside.filter((r) => r.verdict === 'MET').length,
      not_met: inside.filter((r) => r.verdict === 'NOT_MET').length,
      not_adjudicable: inside.filter((r) => r.verdict === 'NOT_ADJUDICABLE').length,
    })
    cursor = next
  }
  return { buckets, bucket }
}

function derive(period: Period, empty: boolean): ExecutiveDashboard {
  const allRows = source.run_ledger.rows
  const earliest = Math.min(...allRows.map((r) => Date.parse(r.completed_at)))
  const span = period === 'all' ? NOW - earliest : { '7d': 7, '30d': 30, '90d': 90 }[period] * DAY
  const start = period === 'all' ? earliest : NOW - span
  const prevStart = start - span

  const rows = empty ? [] : allRows.filter((r) => Date.parse(r.completed_at) >= start)
  const prevRows = allRows.filter((r) => {
    const t = Date.parse(r.completed_at)
    return t >= prevStart && t < start
  })
  const s = summarise(rows)
  const { buckets, bucket } = buildBuckets(period, start, rows)

  const completed = s.runs
  const previous = period === 'all' ? null : prevRows.length
  const completedComparison: Metric['comparison'] =
    previous === null
      ? { state: 'NO_PRIOR_WINDOW', absolute: null, percent: null }
      : { state: 'OBSERVED', absolute: completed - previous, percent: previous === 0 ? null : (completed - previous) / previous }

  const costMetric = (value: number, samples: number, unit: string) => (samples ? observed(value, { unit, samples }) : notMeasured(unit))

  const registered = source.headlines.registered_workers
  const contexts = source.bounded_contexts
    .map((c) => cut(c, rows.filter((r) => r.context_key === c.key)))
    .filter((c) => c.registered > 0 || c.completed_runs > 0)
  const identities = source.identities
    .map((i) => cut(i, rows.filter((r) => identityOf(r.context_key) === i.key)))
    .filter((i) => i.registered > 0 || i.completed_runs > 0)

  const notAdjudicable = rows.filter((r) => r.verdict === 'NOT_ADJUDICABLE').length

  return {
    ...source,
    window: {
      ...source.window,
      key: period,
      start_at: new Date(start).toISOString(),
      previous_start_at: new Date(prevStart).toISOString(),
      previous_end_at: new Date(start).toISOString(),
      bucket,
    },
    headlines: {
      ...source.headlines,
      registered_workers: registered,
      completed_runs: observed(completed, { previous_value: previous, comparison: completedComparison }),
      dod_met: observed(s.met, { previous_value: previous === null ? null : prevRows.filter((r) => r.verdict === 'MET').length }),
      average_run_duration: s.durationSamples
        ? observed(s.totalDuration / s.durationSamples, { unit: 'seconds', samples: s.durationSamples })
        : notMeasured('seconds'),
    },
    outcome_series: buckets,
    bounded_contexts: contexts,
    identities,
    definition_of_done: {
      ...source.definition_of_done,
      met: s.met,
      not_met: rows.filter((r) => r.verdict === 'NOT_MET').length,
      not_adjudicable: notAdjudicable,
      rate: completed
        ? { state: 'OBSERVED', value: s.met / completed, numerator: s.met, denominator: completed }
        : { state: 'NOT_MEASURED', value: null, numerator: null, denominator: null },
      criteria: empty ? [] : source.definition_of_done.criteria,
    },
    run_economics: {
      completed_runs: completed,
      cost_coverage: coverage(s.costSamples, completed),
      token_coverage: coverage(s.tokenSamples, completed),
      model_cost_per_run: costMetric(s.totalCost / Math.max(s.costSamples, 1), s.costSamples, 'USD/run'),
      tokens_per_run: costMetric(s.totalTokens / Math.max(s.tokenSamples, 1), s.tokenSamples, 'tokens/run'),
      total_tokens: costMetric(s.totalTokens, s.tokenSamples, 'tokens'),
      total_cost: costMetric(s.totalCost, s.costSamples, 'USD'),
      average_duration_seconds: costMetric(s.totalDuration / Math.max(s.durationSamples, 1), s.durationSamples, 'seconds'),
    },
    run_ledger: { returned: rows.length, completed_runs: completed, truncated: false, rows },
    autonomy: source.autonomy.map((a) => (a.level === 3 ? { ...a, completed_runs: completed, dod_met: s.met } : { ...a, completed_runs: 0, dod_met: 0 })),
    governance: {
      ...source.governance,
      data_quality: source.governance.data_quality.map((c) =>
        c.key === 'runs-missing-usage'
          ? { ...c, affected_records: rows.filter((r) => r.model_cost_usd.state !== 'OBSERVED').length, state: rows.some((r) => r.model_cost_usd.state !== 'OBSERVED') ? 'ATTENTION' : 'CLEAR' }
          : c,
      ),
    },
  }
}

export async function buildMockDashboard(period: Period, scenario: string | null, signal?: AbortSignal): Promise<ExecutiveDashboard> {
  await delay(scenario === 'slow' ? 2500 : 450, signal)

  if (scenario === 'loading') {
    await new Promise<never>((_, reject) => signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  }
  if (scenario === 'error') throw new ApiError(503, 'The dashboard service did not respond.', 'UPSTREAM_UNAVAILABLE')
  if (scenario === 'refresh-error' && refreshes++ > 0) throw new ApiError(503, 'The dashboard service did not respond.', 'UPSTREAM_UNAVAILABLE')

  return derive(period, scenario === 'empty')
}
