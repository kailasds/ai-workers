import { useMemo } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { VerdictBar } from '@/components/platform/verdict-meter'
import { formatCount } from '@/lib/format'
import type { ExecutiveDashboard, Verdict } from '@/lib/types/dashboard'

// Where to investigate: one bar per bounded context, from the same ledger rows as everything else.
// The cost / token comparison table lives one click away.
export function ContextBars({ data, detailLink }: { data: ExecutiveDashboard; detailLink: (view: string, extra?: Record<string, string>) => string }) {
  const rows = useMemo(() => {
    return data.bounded_contexts
      .map((c) => {
        const runs = data.run_ledger.rows.filter((r) => r.context_key === c.key)
        const counts = { MET: 0, NOT_MET: 0, NOT_ADJUDICABLE: 0 } as Record<Verdict, number>
        for (const r of runs) counts[r.verdict] += 1
        return { key: c.key, label: c.label, workers: c.registered, runs: runs.length, counts }
      })
      .sort((a, b) => b.runs - a.runs)
  }, [data])

  return (
    <Card role="region" aria-labelledby="contexts-title" className="gap-0 py-0">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <h2 id="contexts-title" className="text-section">Where the work happened</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to={detailLink('contexts')}>Compare cost</Link>
        </Button>
      </div>
      <ul className="divide-y pb-2">
        {rows.map((row) => {
          const inner = (
            <>
              <span className="min-w-0">
                <span className="block truncate text-item" title={row.label}>{row.label}</span>
                <span className="block text-meta text-muted-foreground">{formatCount(row.workers)} {row.workers === 1 ? 'Worker' : 'Workers'}</span>
              </span>
              {row.runs === 0 ? (
                <span className="text-meta text-muted-foreground md:col-span-2">No runs in this period</span>
              ) : (
                <>
                  <VerdictBar counts={row.counts} className="h-1.5" />
                  <span className="text-right text-meta text-muted-foreground tabular-nums">
                    <span className="text-item text-foreground">{row.counts.MET}</span> of {row.runs} met
                  </span>
                </>
              )}
            </>
          )
          const grid = 'grid items-center gap-x-6 gap-y-2 px-5 py-3.5 grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_6rem] [&>[role=img]]:col-span-2 md:[&>[role=img]]:col-span-1 [&>[role=img]]:row-start-2 md:[&>[role=img]]:row-start-auto'
          return (
            <li key={row.key}>
              {row.runs > 0 ? (
                <Link to={detailLink('runs', { context: row.key })} className={`${grid} outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`}>
                  {inner}
                </Link>
              ) : (
                <div className={grid}>{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
