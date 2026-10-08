import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Layers } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/platform/states'
import { MeasuredValue } from '@/components/platform/measured-value'
import { Progress } from '@/components/ui/progress'
import { formatCount, formatPercent, formatTokens, formatUsd, isObserved } from '@/lib/format'
import type { ExecutiveCut, ExecutiveDashboard } from '@/lib/types/dashboard'

type Cut = 'contexts' | 'identities'

// Measured rows first; a row with nothing measured stays listed (a reader comparing Worker
// types must be able to tell cheap from unmeasured), sorted below.
function ranked(rows: ExecutiveCut[]) {
  return [...rows].sort((a, b) => {
    const am = isObserved(a.model_cost_per_run)
    const bm = isObserved(b.model_cost_per_run)
    if (am !== bm) return am ? -1 : 1
    return b.completed_runs - a.completed_runs
  })
}

function DodCell({ row }: { row: ExecutiveCut }) {
  const rate = row.dod_rate
  if (rate.state !== 'OBSERVED' || rate.value === null) return <span className="text-muted-foreground">No runs</span>
  return (
    <div className="flex min-w-32 flex-col gap-1">
      <span className="text-sm tabular-nums">
        <span className="font-medium">{formatPercent(rate.value)}</span>
        <span className="ml-1.5 text-meta text-muted-foreground">{rate.numerator} of {rate.denominator}</span>
      </span>
      <Progress value={rate.value * 100} aria-label={`${rate.numerator} of ${rate.denominator} runs met the bar`} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-brand" />
    </div>
  )
}

function Reported({ row }: { row: ExecutiveCut }) {
  const c = row.cost_coverage
  if (c.completed_runs === 0) return null
  return (
    <span className="block text-meta text-muted-foreground tabular-nums">
      {c.complete ? `all ${c.completed_runs} reported` : `${c.measured_runs} of ${c.completed_runs} reported`}
    </span>
  )
}

export function ContextsPanel({ data, detailLink }: { data: ExecutiveDashboard; detailLink: (view: string, extra?: Record<string, string>) => string }) {
  const [cut, setCut] = useState<Cut>('contexts')
  const rows = useMemo(() => ranked(cut === 'contexts' ? data.bounded_contexts : data.identities), [cut, data])
  const levels = data.autonomy.filter((a) => a.completed_runs > 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-meta text-muted-foreground">Compared over the same period. Averages are over the runs that reported, beside their coverage.</p>
        <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={cut} onValueChange={(v) => v && setCut(v as Cut)} aria-label="Group by">
          <ToggleGroupItem value="contexts">Bounded context</ToggleGroupItem>
          <ToggleGroupItem value="identities">Worker identity</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {rows.length === 0 ? (
        <EmptyState className="mt-4" icon={Layers} title="No Workers are composed yet" description="Contexts and identities appear here once a Worker is composed." />
      ) : (
        <>
          <div className="mt-3 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0">{cut === 'contexts' ? 'Bounded context' : 'Worker identity'}</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead>Met the bar</TableHead>
                  <TableHead className="text-right">Cost per run</TableHead>
                  <TableHead className="pr-0 text-right">Tokens per run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="max-w-sm pl-0 font-medium whitespace-normal">
                      {cut === 'contexts' && row.completed_runs > 0 ? (
                        <Link to={detailLink('runs', { context: row.key })} className="group inline-flex items-start gap-1 rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                          {row.label}
                          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="sr-only">: view its runs</span>
                        </Link>
                      ) : (
                        row.label
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCount(row.registered)}
                      <span className="block text-meta text-muted-foreground">{formatCount(row.packaged)} packaged</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCount(row.completed_runs)}</TableCell>
                    <TableCell><DodCell row={row} /></TableCell>
                    <TableCell className="text-right">
                      <MeasuredValue metric={row.model_cost_per_run} format={formatUsd} />
                      <Reported row={row} />
                    </TableCell>
                    <TableCell className="pr-0 text-right">
                      <MeasuredValue metric={row.tokens_per_run} format={formatTokens} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="mt-3 divide-y border-y md:hidden">
            {rows.map((row) => (
              <li key={row.key} className="flex flex-col gap-3 py-3.5">
                <p className="text-item">{row.label}</p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="text-meta text-muted-foreground">Workers</dt><dd className="tabular-nums">{row.registered} · {row.packaged} packaged</dd></div>
                  <div><dt className="text-meta text-muted-foreground">Runs</dt><dd className="tabular-nums">{row.completed_runs}</dd></div>
                  <div><dt className="text-meta text-muted-foreground">Met the bar</dt><dd><DodCell row={row} /></dd></div>
                  <div><dt className="text-meta text-muted-foreground">Cost per run</dt><dd><MeasuredValue metric={row.model_cost_per_run} format={formatUsd} /><Reported row={row} /></dd></div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      {levels.length > 0 && (
        <p className="mt-3 text-meta text-muted-foreground">
          {levels.map((l) => `${formatCount(l.completed_runs)} completed ${l.completed_runs === 1 ? 'run' : 'runs'} at autonomy ${l.label.toLowerCase()}`).join('; ')}.
        </p>
      )}
    </div>
  )
}
