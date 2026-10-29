import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronRight, OctagonX, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { useResource } from '@/hooks/use-resource'
import { useScenario } from '@/hooks/use-scenario'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import type { SentinelLearningFleet } from '@/lib/types/catalog'
import type { PortfolioWorker } from '@/lib/types/worker'
import { workerRefs } from '@/features/learning/learning-model'
import { WorkerName } from '@/features/learning/learning-layout'
import { SentinelLayout } from './sentinel-layout'
import { useSentinel } from './use-sentinel'

type Coverage = 'reporting' | 'unavailable' | 'no-sentinel' | 'not-running'

/**
 * Monitoring status, from facts only. A running Worker the fleet read doesn't list as answering
 * is "not reporting" — never assumed healthy — and stays a concern until it reports.
 */
function coverageOf(w: PortfolioWorker, fleet: SentinelLearningFleet | null): Coverage {
  if (w.runtime.serving === 0) return 'not-running'
  if (w.sentinel.state !== 'CONFIGURED') return 'no-sentinel'
  const live = fleet?.workers.find((x) => x.composition_id === w.composition_id)
  return live && live.status === 'answering' ? 'reporting' : 'unavailable'
}

const COVERAGE: Record<Coverage, { label: string; tone: 'success' | 'warning' | 'neutral'; meaning: string }> = {
  reporting: { label: 'Reporting', tone: 'success', meaning: 'Running, and its Sentinel answers. Sentinel can see what it learns and does.' },
  unavailable: { label: 'Running, not reporting', tone: 'warning', meaning: 'Running, but its Sentinel didn’t answer. Sentinel can’t see what it learns or does until it reports. Check the Worker’s runtime and its Sentinel settings.' },
  'no-sentinel': { label: 'No Sentinel', tone: 'warning', meaning: 'Running without a Worker Sentinel, so nothing checks what it keeps from its runs.' },
  'not-running': { label: 'Not running', tone: 'neutral', meaning: 'No runtime is serving, so there is nothing to monitor right now.' },
}

const FILTERS: { value: string; label: string; match: (c: Coverage) => boolean }[] = [
  { value: 'running', label: 'All running', match: (c) => c !== 'not-running' },
  { value: 'unavailable', label: 'Running, not reporting', match: (c) => c === 'unavailable' },
  { value: 'no-sentinel', label: 'No Sentinel', match: (c) => c === 'no-sentinel' },
  { value: 'reporting', label: 'Reporting', match: (c) => c === 'reporting' },
  { value: 'not-running', label: 'Not running', match: (c) => c === 'not-running' },
  { value: 'all', label: 'All Workers', match: () => true },
]

/**
 * Stop Worker needs a stop request the console can send. It has none wired, so the dialog
 * explains what stopping would do and why it isn't available here, instead of pretending.
 */
function StopDialog({ worker, open, onClose }: { worker: PortfolioWorker; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-section">Stop Worker</DialogTitle>
          <DialogDescription className="text-body">
            Stopping <span className="font-medium text-foreground">{worker.name}</span> would stop each serving runtime and interrupt any run in progress. Each stop is recorded as a Platform Sentinel decision, with your typed confirmation and a reason.
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-block bg-muted p-3 text-meta text-muted-foreground">
          Stopping isn’t connected in this console, so nothing can be stopped from here.
        </p>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SentinelWorkersPage() {
  const [params, setParams] = useSearchParams()
  const filter = FILTERS.find((f) => f.value === params.get('filter')) ?? FILTERS[0]
  const context = params.get('context')
  // A filter change returns to the first page; paging keeps the filters.
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (v === null) n.delete(k)
      else n.set(k, v)
      n.delete('page')
      return n
    }, { replace: true, preventScrollReset: true })
  const scenario = useScenario()
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const sentinel = useSentinel()
  const fleet = sentinel.fleet.data ?? null
  const [open, setOpen] = useState<PortfolioWorker | null>(null)
  const [stopping, setStopping] = useState(false)

  const workers = useMemo(() => portfolio.data?.workers ?? [], [portfolio.data])
  const refs = useMemo(() => workerRefs(workers), [workers])
  const coverage = useMemo(() => new Map(workers.map((w) => [w.composition_id, coverageOf(w, fleet)])), [workers, fleet])
  const inContext = useMemo(() => workers.filter((w) => !context || w.bounded_context.key === context), [workers, context])
  const count = (f: (typeof FILTERS)[number]) => inContext.filter((w) => f.match(coverage.get(w.composition_id)!)).length
  const contexts = portfolio.data?.bounded_contexts ?? []
  // Concerns first, then by name.
  const order: Coverage[] = ['unavailable', 'no-sentinel', 'reporting', 'not-running']
  const rows = inContext.filter((w) => filter.match(coverage.get(w.composition_id)!)).sort((a, b) => order.indexOf(coverage.get(a.composition_id)!) - order.indexOf(coverage.get(b.composition_id)!) || a.name.localeCompare(b.name) || a.composition_id.localeCompare(b.composition_id))
  const paged = usePaged(rows)

  const live = open ? fleet?.workers.find((x) => x.composition_id === open.composition_id) : undefined
  const openCoverage = open ? coverage.get(open.composition_id)! : null

  return (
    <SentinelLayout
      view="workers"
      source={portfolio.data ? { snapshotAt: portfolio.data.generated_at, updatedAt: portfolio.updatedAt, refreshFailed: Boolean(portfolio.error), onRetry: portfolio.refresh, partial: sentinel.fleet.error && !fleet ? 'Per-Worker reporting couldn’t be read; running Workers show as not reporting' : null } : undefined}
      utilities={
        portfolio.data && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter Workers">
            <Select value={filter.value} onValueChange={(v) => set('filter', v === 'running' ? null : v)}>
              <SelectTrigger className="w-56" aria-label="Monitoring status"><SelectValue /></SelectTrigger>
              <SelectContent align="end">{FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label} <span className="text-muted-foreground tabular-nums">{count(f)}</span></SelectItem>)}</SelectContent>
            </Select>
            <Select value={context ?? '__all'} onValueChange={(v) => set('context', v === '__all' ? null : v)}>
              <SelectTrigger className="w-56" aria-label="Bounded context"><SelectValue /></SelectTrigger>
              <SelectContent align="end"><SelectItem value="__all">All bounded contexts</SelectItem>{contexts.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )
      }
    >
      {portfolio.error && !portfolio.data ? (
        <ErrorState title="Workers couldn’t be loaded." message={portfolio.error.message} onRetry={portfolio.refresh} />
      ) : !portfolio.data ? (
        <LoadingRegion label="Loading Workers…" className="flex flex-col gap-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14 bg-track" />)}</LoadingRegion>
      ) : rows.length === 0 ? (
        filter.value === 'running' && !context ? (
          <EmptyState icon={ShieldOff} title="No Workers are running" description="Sentinel monitors running Workers. None is running right now." />
        ) : (
          <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No Workers match these filters.</p>
        )
      ) : (
        <>
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {paged.rows.map((w) => {
                const c = COVERAGE[coverage.get(w.composition_id)!]
                return (
                  <li key={w.composition_id}>
                    <button type="button" onClick={() => setOpen(w)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-item"><WorkerName worker={refs.get(w.composition_id) ?? null} link={false} /></span>
                        <span className="block truncate text-meta text-muted-foreground">{w.bounded_context.label}</span>
                      </span>
                      <StatusBadge tone={c.tone}>{c.label}</StatusBadge>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
          <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Workers" />
        </>
      )}

      <DetailSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? <WorkerName worker={refs.get(open.composition_id) ?? null} link={false} /> : ''}
        description={open ? `r${open.revision} · ${open.bounded_context.label}` : undefined}
        width="lg"
        footer={open && (
          <>
            <Button asChild variant="outline"><Link to={`/workers/${open.composition_id}?view=sentinel`}>Open Worker</Link></Button>
            <Button asChild variant="ghost"><Link to={`/learning?worker=${open.composition_id}`}>Learning activity</Link></Button>
            {open.runtime.serving > 0 && <Button variant="outline" className="ml-auto" onClick={() => setStopping(true)}><OctagonX aria-hidden="true" />Stop Worker…</Button>}
          </>
        )}
      >
        {open && openCoverage && (
          <div className="flex flex-col gap-6">
            <div className="rounded-block bg-muted p-3">
              <StatusBadge tone={COVERAGE[openCoverage].tone}>{COVERAGE[openCoverage].label}</StatusBadge>
              <p className="mt-2 text-meta text-muted-foreground">{COVERAGE[openCoverage].meaning}</p>
            </div>
            <FactList>
              {live?.detail && <Fact label="What it reported">{live.detail}</Fact>}
              <Fact label="Last report"><Timestamp iso={open.sentinel.observed_at} /></Fact>
              <Fact label="Worker Sentinel">{open.sentinel.state === 'CONFIGURED' ? 'Composed with one' : 'Composed without one'}</Fact>
              <Fact label="Running">{open.runtime.serving > 0 ? `${formatCount(open.runtime.serving)} ${open.runtime.serving === 1 ? 'runtime' : 'runtimes'} serving` : 'No runtime serving'}</Fact>
              <Fact label="Platform decisions">
                {!sentinel.overview.data ? 'Not loaded' : sentinel.overview.data.stream.length === 0 ? `None in the last ${sentinel.overview.data.window_days} days` : 'The record doesn’t say which Workers each decision affected'}
                <Link to="/sentinel/decisions" className="ml-2 text-meta text-primary-strong underline-offset-4 hover:underline">All decisions</Link>
              </Fact>
              <Fact label="Platform policy">None configured</Fact>
            </FactList>
          </div>
        )}
      </DetailSheet>
      {open && <StopDialog key={open.composition_id} worker={open} open={stopping} onClose={() => setStopping(false)} />}
    </SentinelLayout>
  )
}
