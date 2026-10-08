import { useState } from 'react'
import { ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/platform/states'
import { Progress } from '@/components/ui/progress'
import { formatCount, formatPercent } from '@/lib/format'
import type { DodCriterion } from '@/lib/types/dashboard'

const DEFAULT_VISIBLE = 6

function threshold(c: DodCriterion) {
  if (c.threshold === null) return 'No required threshold'
  return `Passes at ${c.unit === '%' ? `${c.threshold}%` : c.threshold}`
}

// Weakest measured criteria first, so the section answers "what is failing" before "what is fine";
// unmeasured criteria sit last and say so. Each criterion stands alone and is never averaged.
function sortCriteria(criteria: DodCriterion[]) {
  return [...criteria].sort((a, b) => {
    const am = a.measured_runs > 0
    const bm = b.measured_runs > 0
    if (am !== bm) return am ? -1 : 1
    return (a.pass_rate.value ?? 0) - (b.pass_rate.value ?? 0) || a.label.localeCompare(b.label)
  })
}

export function CriteriaPanel({ criteria }: { criteria: DodCriterion[] }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = sortCriteria(criteria)
  const visible = expanded ? sorted : sorted.slice(0, DEFAULT_VISIBLE)

  return (
    <div>
      <p className="text-meta text-muted-foreground">Each criterion is judged on its own and never averaged into one score. Weakest first.</p>
      {criteria.length === 0 ? (
        <EmptyState className="mt-4" icon={ListChecks} title="No criterion measurements recorded" description="Runs in this period did not report results against any Definition of Done criterion." />
      ) : (
        <>
          <ul className="mt-3 divide-y border-y">
            {visible.map((c) => {
              const measured = c.measured_runs > 0
              const rate = c.pass_rate.value
              return (
                <li key={c.key} className="grid gap-x-6 gap-y-1.5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-item">{c.label}</p>
                    <p className="text-meta text-muted-foreground">
                      {c.gating ? 'Stops a release' : 'Observed only'} · {threshold(c)}
                    </p>
                  </div>
                  {measured ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium tabular-nums">{rate !== null ? formatPercent(rate) : '—'}</span>
                        <span className="text-meta text-muted-foreground tabular-nums">
                          {formatCount(c.passed_runs)} of {formatCount(c.measured_runs)} runs passed
                        </span>
                      </div>
                      <Progress value={(rate ?? 0) * 100} aria-label={`${c.label}: ${c.passed_runs} of ${c.measured_runs} runs passed`} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-brand" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not measured in any run</p>
                  )}
                </li>
              )
            })}
          </ul>
          {sorted.length > DEFAULT_VISIBLE && (
            <Button variant="ghost" size="sm" className="mt-2 -ml-2.5" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
              {expanded ? 'Show the first 6' : `View all ${sorted.length} criteria`}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
