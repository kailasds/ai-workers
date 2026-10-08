import { formatCount, formatMoment, formatPercent } from '@/lib/format'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'

// "Signals" are observations derived from figures this page already holds. They are not
// tasks, scores or a health rating: the product has no such measure and the Dashboard is a
// read-only outcome view. Each one says what was seen, over what, and where to look.

export type SignalTone = 'danger' | 'warning' | 'info'

export interface Signal {
  id: string
  tone: SignalTone
  title: string
  detail: string
  action?: { label: string; to: string }
}

const plural = (n: number, one: string, many: string) => `${formatCount(n)} ${n === 1 ? one : many}`

export function deriveSignals(d: ExecutiveDashboard, link: (view: string, extra?: Record<string, string>) => string): Signal[] {
  const signals: Signal[] = []
  const completed = d.headlines.completed_runs.value ?? 0

  // Anything that makes every number below it less trustworthy comes first.
  for (const source of d.freshness.sources) {
    if (source.state === 'CURRENT') continue
    signals.push({
      id: `freshness-${source.key}`,
      tone: 'warning',
      title: `${source.label} are ${source.state.toLowerCase()}`,
      detail: source.observed_at ? `Last observed ${formatMoment(source.observed_at)}` : 'No observation on record',
    })
  }

  const notMet = d.definition_of_done.not_met
  if (notMet > 0) {
    signals.push({
      id: 'not-met',
      tone: 'danger',
      title: `${plural(notMet, 'run', 'runs')} did not meet the bar`,
      detail: `${formatPercent(notMet / completed)} of completed runs`,
      action: { label: 'Review these runs', to: link('runs', { verdict: 'NOT_MET' }) },
    })
  }

  for (const context of d.bounded_contexts) {
    if (context.completed_runs >= 2 && context.verified_outcomes === 0) {
      signals.push({
        id: `context-${context.key}`,
        tone: 'danger',
        title: `0 of ${context.completed_runs} runs met the bar`,
        detail: context.label,
        action: { label: 'Review these runs', to: link('runs', { context: context.key }) },
      })
    }
  }

  const failing = d.definition_of_done.criteria.filter((c) => c.measured_runs > c.passed_runs)
  if (failing.length > 0) {
    const weakest = [...failing].sort((a, b) => (a.pass_rate.value ?? 1) - (b.pass_rate.value ?? 1))[0]
    signals.push({
      id: 'criteria-failing',
      tone: 'danger',
      title: `${plural(failing.length, 'criterion', 'criteria')} failing in some runs`,
      detail: `Lowest: ${weakest.label}, ${weakest.passed_runs} of ${weakest.measured_runs}`,
      action: { label: 'See criteria', to: link('criteria') },
    })
  }

  const unmeasured = d.definition_of_done.criteria.filter((c) => c.measured_runs === 0)
  if (unmeasured.length > 0) {
    signals.push({
      id: 'criteria-unmeasured',
      tone: 'warning',
      title: `${plural(unmeasured.length, 'criterion', 'criteria')} never measured`,
      detail: 'Not measured is not passing',
      action: { label: 'See criteria', to: link('criteria') },
    })
  }

  for (const check of d.governance.data_quality) {
    if (check.state !== 'ATTENTION') continue
    signals.push({
      id: `quality-${check.key}`,
      tone: 'warning',
      title: `${formatCount(check.affected_records)} ${check.label.charAt(0).toLowerCase()}${check.label.slice(1)}`,
      detail: `Cost covers ${d.run_economics.cost_coverage.measured_runs} of ${d.run_economics.completed_runs} runs`,
      action: { label: 'See model cost', to: link('cost') },
    })
  }

  const awaiting = d.definition_of_done.not_adjudicable
  if (awaiting > 0) {
    signals.push({
      id: 'awaiting',
      tone: 'info',
      title: `${plural(awaiting, 'run is', 'runs are')} awaiting evidence`,
      detail: 'Finished, not yet judged',
      action: { label: 'Review these runs', to: link('runs', { verdict: 'NOT_ADJUDICABLE' }) },
    })
  }

  return signals
}
