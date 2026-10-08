import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CopyValue } from '@/components/platform/copy-value'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { EmptyState } from '@/components/platform/states'
import { VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatDuration, formatDurationShort, formatRunName, formatTokens, formatUsd } from '@/lib/format'
import type { WorkerRun, WorkerWorkspace } from '@/lib/types/worker'

const PAGE_SIZE = 20

const cost = (r: WorkerRun) => (r.model_cost_usd.state === 'OBSERVED' ? formatUsd(Number(r.model_cost_usd.value)) : null)
const tokens = (r: WorkerRun) => (r.total_tokens.state === 'OBSERVED' ? formatTokens(r.total_tokens.value ?? 0) : null)
const NotMeasured = () => <span className="text-muted-foreground">Not measured</span>

function RunDetail({ run, ws }: { run: WorkerRun; ws: WorkerWorkspace }) {
  const runtime = ws.runtimes.find((r) => r.id === run.runtime_id)
  return (
    <div className="flex flex-col gap-6 p-4">
      <VerdictBadge verdict={run.verdict} />
      <FactList>
        <Fact label="Finished"><Timestamp iso={run.completed_at} /></Fact>
        <Fact label="Duration">{formatDuration(run.duration_seconds)}</Fact>
        <Fact label="Model cost">{cost(run) ?? <NotMeasured />}</Fact>
        <Fact label="Tokens">{run.total_tokens.state === 'OBSERVED' ? formatCount(run.total_tokens.value ?? 0) : <NotMeasured />}</Fact>
        {(run.source_technology || run.target_technology) && (
          <Fact label="Converted">{run.source_technology || 'Not reported'} → {run.target_technology || 'Not reported'}</Fact>
        )}
        <Fact label="Runtime">{runtime ? `${runtime.target === 'ECS' ? 'ECS' : 'Local'} · slot ${runtime.runtime_slot}` : 'No longer listed'}</Fact>
        <Fact label="Run ID"><CopyValue value={run.run_ref} label="run ID" /></Fact>
      </FactList>
      <p className="text-meta text-muted-foreground">
        The verdict is the Worker’s own adjudication; the console keeps no copy it could later disagree with. Per-criterion results and the trace are read from the Worker’s runtime, which this capture does not include.
      </p>
    </div>
  )
}

export function RunsTab({ ws, selected, onSelect }: { ws: WorkerWorkspace; selected: string | null; onSelect: (runRef: string | null) => void }) {
  const [page, setPage] = useState(1)
  const runs = useMemo(() => [...ws.runs].sort((a, b) => b.completed_at.localeCompare(a.completed_at)), [ws.runs])
  const open = runs.find((r) => r.run_ref === selected) ?? null
  const visible = runs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const met = runs.filter((r) => r.verdict === 'MET').length

  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="border-b py-5">
        <CardTitle>Runs</CardTitle>
        <CardDescription>
          {runs.length === 0
            ? 'Kept by the platform, so they survive the runtime that produced them.'
            : `${formatCount(runs.length)} completed · ${formatCount(met)} met the Definition of Done · kept by the platform beyond the runtime that produced them`}
        </CardDescription>
      </CardHeader>
      {runs.length === 0 ? (
        <EmptyState className="m-5" icon={History} title="No completed runs recorded" description={ws.worker.runtime.serving > 0 ? 'This Worker is serving. Runs appear here as soon as one finishes.' : 'Runs appear here once the Worker is deployed and finishes one.'} />
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Run</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="pr-5 text-right">Model cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.run_ref} data-state={r.run_ref === selected ? 'selected' : undefined}>
                  <TableCell className="pl-5">
                    <button type="button" onClick={() => onSelect(r.run_ref)} title={`Run ${r.run_ref}`} className="rounded-sm text-item tabular-nums outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                      {formatRunName(r.completed_at)}
                    </button>
                  </TableCell>
                  <TableCell><VerdictBadge verdict={r.verdict} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatDurationShort(r.duration_seconds)}</TableCell>
                  <TableCell className="text-right tabular-nums">{tokens(r) ?? <NotMeasured />}</TableCell>
                  <TableCell className="pr-5 text-right tabular-nums">{cost(r) ?? <NotMeasured />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ul className="divide-y md:hidden">
            {visible.map((r) => (
              <li key={r.run_ref} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <button type="button" onClick={() => onSelect(r.run_ref)} className="flex flex-col items-start text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-item tabular-nums">{formatRunName(r.completed_at)}</span>
                  <span className="text-meta text-muted-foreground tabular-nums">{formatDurationShort(r.duration_seconds)} · {cost(r) ?? 'Not measured'}</span>
                </button>
                <VerdictBadge verdict={r.verdict} />
              </li>
            ))}
          </ul>
          <CardFooter className="px-5 py-3">
            <Pager page={page} pageSize={PAGE_SIZE} total={runs.length} onPage={setPage} order="time" label="Runs" />
          </CardFooter>
        </>
      )}

      <Sheet open={open !== null} onOpenChange={(o) => !o && onSelect(null)}>
        <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
          {open && (
            <>
              <SheetHeader className="border-b">
                <SheetTitle className="text-section">Run · {formatRunName(open.completed_at)}</SheetTitle>
                <SheetDescription>{open.context_label}</SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1">
                <RunDetail run={open} ws={ws} />
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  )
}
