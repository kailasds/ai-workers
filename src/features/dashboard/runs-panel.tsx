import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, ChevronLeft, ChevronRight, ListFilter, SearchX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { VerdictBadge, verdictLabel } from '@/components/platform/status-badge'
import { formatCount, formatDurationShort, formatRunName, formatTokens, formatUsd } from '@/lib/format'
import type { ExecutiveDashboard, LedgerRow, Verdict } from '@/lib/types/dashboard'
import type { Measure } from './use-dashboard-params'

const PAGE_SIZE = 20
const VERDICT_ORDER: Verdict[] = ['MET', 'NOT_MET', 'NOT_ADJUDICABLE']

function spend(row: LedgerRow, measure: Measure) {
  if (measure === 'cost') return row.model_cost_usd.state === 'OBSERVED' ? formatUsd(Number(row.model_cost_usd.value)) : null
  return row.total_tokens.state === 'OBSERVED' ? formatTokens(row.total_tokens.value ?? 0) : null
}

// A run is named by when it ran, never by its raw id (the id is in the tooltip).
function RunLink({ row, from }: { row: LedgerRow; from: string }) {
  return (
    <Link
      to={`/workers/${row.worker_id}?view=runs&run=${encodeURIComponent(row.run_ref)}`}
      state={{ from }}
      title={`Run ${row.run_ref}`}
      className="inline-flex items-center gap-1 rounded-sm font-medium tabular-nums outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      {formatRunName(row.completed_at)}
      <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">: view run</span>
    </Link>
  )
}

export interface RunsPanelProps {
  data: ExecutiveDashboard
  verdict: Verdict | null
  context: string | null
  measure: Measure
  page: number
  onChange: (changes: Record<string, string | null>, options?: { resetPage?: boolean; push?: boolean }) => void
}

export function RunsPanel({ data, verdict, context, measure, page, onChange }: RunsPanelProps) {
  const { pathname, search } = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  const rows = data.run_ledger.rows
  const contextLabel = context ? (data.bounded_contexts.find((c) => c.key === context)?.label ?? context) : null

  const inContext = useMemo(() => (context ? rows.filter((r) => r.context_key === context) : rows), [rows, context])
  const counts = useMemo(
    () => ({
      MET: inContext.filter((r) => r.verdict === 'MET').length,
      NOT_MET: inContext.filter((r) => r.verdict === 'NOT_MET').length,
      NOT_ADJUDICABLE: inContext.filter((r) => r.verdict === 'NOT_ADJUDICABLE').length,
    }),
    [inContext],
  )
  const filtered = verdict ? inContext.filter((r) => r.verdict === verdict) : inContext
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const start = (current - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)
  const filtering = verdict !== null || context !== null

  // Focus moves to the list heading on page change (P-05).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    heading.current?.focus()
  }, [current])

  const spendLabel = measure === 'cost' ? 'Model cost' : 'Tokens'
  const from = `${pathname}${search}`

  return (
    <div>
      <h3 ref={heading} tabIndex={-1} className="sr-only outline-none">Runs, page {current} of {pages}</h3>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-meta text-muted-foreground">Every completed run behind the figures, newest first.</p>
        <p className="text-meta text-muted-foreground tabular-nums" aria-live="polite">
          {filtering ? `${formatCount(filtered.length)} of ${formatCount(rows.length)} runs` : `${formatCount(rows.length)} runs`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="-mx-5 max-w-[100vw] overflow-x-auto px-5 sm:mx-0 sm:max-w-none sm:overflow-visible sm:px-0">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={verdict ?? 'ALL'}
          onValueChange={(v) => v && onChange({ verdict: v === 'ALL' ? null : v })}
          aria-label="Filter by outcome"
          className="w-max"
        >
          <ToggleGroupItem value="ALL">All <span className="ml-1 text-muted-foreground tabular-nums">{inContext.length}</span></ToggleGroupItem>
          {VERDICT_ORDER.map((v) => (
            <ToggleGroupItem key={v} value={v}>
              {verdictLabel(v)} <span className="ml-1 text-muted-foreground tabular-nums">{counts[v]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        </div>
        {contextLabel && (
          <Button variant="secondary" size="sm" onClick={() => onChange({ context: null })} className="max-w-full">
            <span className="truncate">{contextLabel}</span>
            <X aria-hidden="true" />
            <span className="sr-only">Remove context filter</span>
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState className="mt-4" icon={ListFilter} title="No runs completed in this period" description="Runs appear here as soon as a Worker reports one finished." />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={SearchX}
          title="No runs match these filters"
          description="Filters narrow the runs already loaded for this period."
          action={<Button variant="outline" onClick={() => onChange({ verdict: null, context: null })}>Clear filters</Button>}
        />
      ) : (
        <>
          <div role="region" aria-label="Runs" tabIndex={0} className="mt-3 hidden overflow-x-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0">Run</TableHead>
                  <TableHead>Worker</TableHead>
                  {verdict === null && <TableHead>Outcome</TableHead>}
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="pr-0 text-right">{spendLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => {
                  const value = spend(row, measure)
                  return (
                    <TableRow key={row.run_ref}>
                      <TableCell className="pl-0"><RunLink row={row} from={from} /></TableCell>
                      <TableCell className="max-w-md whitespace-normal">
                        <span className="block font-medium">{row.worker_name}</span>
                        <span className="block text-meta text-muted-foreground">{row.context_label}</span>
                      </TableCell>
                      {verdict === null && <TableCell><VerdictBadge verdict={row.verdict} /></TableCell>}
                      <TableCell className="text-right tabular-nums">{formatDurationShort(row.duration_seconds)}</TableCell>
                      <TableCell className="pr-0 text-right tabular-nums">{value ?? <span className="text-muted-foreground">Not measured</span>}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="mt-3 divide-y border-y md:hidden">
            {visible.map((row) => {
              const value = spend(row, measure)
              return (
                <li key={row.run_ref} className="flex flex-col gap-1.5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <RunLink row={row} from={from} />
                    {verdict === null && <VerdictBadge verdict={row.verdict} />}
                  </div>
                  <p className="text-sm">{row.worker_name}</p>
                  <p className="text-meta text-muted-foreground tabular-nums">
                    {formatDurationShort(row.duration_seconds)} · {value ?? 'Not measured'}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-meta text-muted-foreground tabular-nums">
              {data.run_ledger.truncated
                ? `Most recent ${formatCount(rows.length)} of ${formatCount(data.run_ledger.completed_runs)} completed runs. Newest first.`
                : `${formatCount(start + 1)}–${formatCount(start + visible.length)} of ${formatCount(filtered.length)}. Newest first.`}
              {' '}Last run <Timestamp iso={rows[0]?.completed_at} />.
            </p>
            {pages > 1 && (
              <nav aria-label="Runs pages" className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => onChange({ page: String(current - 1) }, { resetPage: false, push: true })}>
                  <ChevronLeft aria-hidden="true" />
                  Newer
                </Button>
                <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => onChange({ page: String(current + 1) }, { resetPage: false, push: true })}>
                  Older
                  <ChevronRight aria-hidden="true" />
                </Button>
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  )
}
