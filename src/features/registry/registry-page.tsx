import { useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { Bot, Plus, RefreshCw, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { FreshnessBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useResource } from '@/hooks/use-resource'
import { getWorkerTypes } from '@/lib/api/catalog'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { filterWorkers, matchesFacet, newestId, RUNTIME_FACETS, SORTS, sortWorkers, type RuntimeFacet } from './registry-model'
import { useRegistryParams } from './use-registry-params'
import { TypeShowcase, type TypeGroup } from './type-showcase'
import { WorkerGrid } from './worker-tiles'

const ALL = '__all'

function TileSkeleton() {
  return (
    <LoadingRegion label="Reading the Worker portfolio…" className="flex flex-col gap-5">
      <Skeleton className="h-56 w-full rounded-panel bg-track" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="gap-4 p-5">
            <Skeleton className="h-6 w-2/3 bg-track" />
            <Skeleton className="h-11 w-3/4 bg-track" />
            <Skeleton className="h-9 w-full bg-track" />
            <Skeleton className="h-20 w-full bg-track" />
          </Card>
        ))}
      </div>
    </LoadingRegion>
  )
}

export function RegistryPage() {
  const p = useRegistryParams()
  const { pathname, search } = useLocation()
  const portfolio = useResource(`portfolio:${p.scenario}`, (signal) => getWorkerPortfolio({ signal, scenario: p.scenario }))
  const types = useResource('worker-types', (signal) => getWorkerTypes({ signal }))

  const data = portfolio.data
  const workers = useMemo(() => data?.workers ?? [], [data])
  const newest = useMemo(() => newestId(workers), [workers])

  const { q, facet, type, context, learning, sentinel, sort } = p
  const matching = useMemo(() => sortWorkers(filterWorkers(workers, { q, facet, type, context, learning, sentinel }), sort, newest), [workers, q, facet, type, context, learning, sentinel, sort, newest])
  const facetBase = useMemo(() => filterWorkers(workers, { q, facet: null, type, context, learning, sentinel }), [workers, q, type, context, learning, sentinel])

  // The showcase always shows every Worker type with all its Workers, whatever the filters.
  const showcase: TypeGroup[] = useMemo(
    () => (types.data?.types ?? []).filter((t) => t.availability !== 'withdrawn').map((t) => ({ type: t, workers: workers.filter((w) => w.worker_type === t.key) })),
    [types.data, workers],
  )
  // Bounded contexts on offer narrow to the chosen type; choosing a type drops a context outside it.
  const inType = (key: string, ctx: string) => workers.some((w) => w.worker_type === key && w.bounded_context.key === ctx)
  const contextOptions = (data?.bounded_contexts ?? []).filter((c) => !type || inType(type, c.key))
  const chooseType = (key: string | null) => p.update({ type: key, context: key && context && !inType(key, context) ? null : context })
  const typeLabel = type ? (types.data?.types.find((t) => t.key === type)?.display_name ?? type) : null

  const filtering = Boolean(q || facet || type || context || learning || sentinel)
  const secondaryActive = [learning, sentinel].filter(Boolean).length + (sort !== 'evidence' ? 1 : 0)
  const clearAll = () => p.update({ q: null, runtime: null, type: null, context: null, brain: null, sentinel: null })
  const from = `${pathname}${search}`

  const meta = (
    <div className="flex items-center gap-2 text-meta whitespace-nowrap text-muted-foreground max-lg:hidden" aria-live="polite">
      {portfolio.pending && data ? <span>Updating…</span> : data ? <span>Updated <Timestamp iso={portfolio.updatedAt?.toISOString() ?? data.generated_at} /></span> : null}
      {data && data.freshness.state !== 'CURRENT' && <FreshnessBadge state={data.freshness.state} />}
    </div>
  )

  // Customer packages moved to the Customer delivery tab.
  if (p.view === 'customer') return <Navigate to="/customer-delivery?view=delivered" replace />
  // The old quick-look (?open=) now opens the Worker itself; Workers are cards that open on click.
  if (p.open) return <Navigate to={`/workers/${p.open}`} replace />

  return (
    <div className="flex flex-col gap-5">
          {portfolio.error && data && (
            <ErrorState title="Could not refresh the Registry." message={`${portfolio.error.message} Showing the last successful read.`} onRetry={portfolio.refresh} retrying={portfolio.pending} />
          )}

          {portfolio.error && !data ? (
            <ErrorState title="Registry unavailable." message={portfolio.error.message} onRetry={portfolio.refresh} retrying={portfolio.pending} />
          ) : !data ? (
            <TileSkeleton />
          ) : workers.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No Workers have been composed yet"
              description="A Worker appears here once it is composed."
              action={<Button asChild><Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link></Button>}
            />
          ) : (
            <>
              <TypeShowcase groups={showcase} active={type} onSelect={chooseType} />

              {/* One quiet toolbar: find, narrow by state, everything else behind Filters. */}
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                <InputGroup className="lg:w-64 lg:shrink-0">
                  <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
                  <InputGroupInput type="search" value={q} onChange={(e) => p.update({ q: e.target.value })} placeholder="Search Workers" aria-label="Search name, owner, context or identity" />
                </InputGroup>
                <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0">
                  <Select value={type ?? ALL} onValueChange={(v) => chooseType(v === ALL ? null : v)}>
                    <SelectTrigger className="w-full lg:w-52" aria-label="Worker type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All Worker types</SelectItem>
                      {showcase.filter((g) => g.workers.length > 0).map((g) => <SelectItem key={g.type.key} value={g.type.key}>{g.type.display_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={context ?? ALL} onValueChange={(v) => p.update({ context: v === ALL ? null : v })}>
                    <SelectTrigger className="w-full lg:w-60" aria-label="Bounded context"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All bounded contexts</SelectItem>
                      {contextOptions.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-w-0 items-center gap-2 lg:grow lg:basis-[30rem]">
                  <div className="no-scrollbar -mx-4 min-w-0 flex-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <ToggleGroup type="single" variant="outline" spacing={0} value={facet ?? ALL} onValueChange={(v) => v && p.update({ runtime: v === ALL ? null : v })} aria-label="Runtime" className="w-max">
                      <ToggleGroupItem value={ALL}>All</ToggleGroupItem>
                      {RUNTIME_FACETS.map((f) => {
                        const n = facetBase.filter((w) => matchesFacet(w, f.value as RuntimeFacet)).length
                        return (
                          <ToggleGroupItem key={f.value} value={f.value} disabled={n === 0 && facet !== f.value}>
                            {f.label} <span className="text-muted-foreground tabular-nums">{n}</span>
                          </ToggleGroupItem>
                        )
                      })}
                    </ToggleGroup>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="shrink-0">
                        <SlidersHorizontal aria-hidden="true" />
                        <span className="max-sm:sr-only">Filters</span>
                        {secondaryActive > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 tabular-nums">{secondaryActive}</Badge>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="flex w-80 flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="f-learning">Learning</Label>
                        <Select value={learning ?? ALL} onValueChange={(v) => p.update({ brain: v === ALL ? null : v })}>
                          <SelectTrigger id="f-learning" className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>All Workers</SelectItem>
                            <SelectItem value="memory">Has memory records</SelectItem>
                            <SelectItem value="recent">Recent memory activity</SelectItem>
                            <SelectItem value="contradictions">Has contradictions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="f-sentinel">Worker Sentinel</Label>
                        <Select value={sentinel ?? ALL} onValueChange={(v) => p.update({ sentinel: v === ALL ? null : v })}>
                          <SelectTrigger id="f-sentinel" className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>All Workers</SelectItem>
                            <SelectItem value="with">Composed with one</SelectItem>
                            <SelectItem value="without">Composed without</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5 border-t pt-4">
                        <Label htmlFor="f-sort">Order</Label>
                        <Select value={sort} onValueChange={(v) => p.update({ sort: v })}>
                          <SelectTrigger id="f-sort" className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <p className="text-meta text-muted-foreground">{SORTS.find((s) => s.value === sort)?.hint}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex shrink-0 items-center gap-3 lg:ml-auto">
                  {filtering && (
                    <p className="flex items-center gap-2 text-meta text-muted-foreground" aria-live="polite">
                      <span className="tabular-nums">{formatCount(matching.length)} of {formatCount(workers.length)}</span>
                      <Button variant="link" size="xs" className="h-auto px-0 text-meta" onClick={clearAll}>Clear</Button>
                    </p>
                  )}
                  {meta}
                  <Button variant="ghost" size="icon" aria-label="Refresh" onClick={portfolio.refresh}>
                    <RefreshCw className={portfolio.pending && data ? 'animate-spin' : undefined} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {matching.length === 0 ? (
                <EmptyState icon={SearchX} title="No Workers match" description="Try a different search, or clear the filters." action={<Button variant="outline" onClick={clearAll}>Clear filters</Button>} />
              ) : (
                <section aria-labelledby="workers-heading" aria-busy={portfolio.pending} className="flex flex-col gap-4">
                  <h2 id="workers-heading" className="text-section">
                    {typeLabel ?? 'All Workers'} <span className="text-muted-foreground tabular-nums">{formatCount(matching.length)}</span>
                  </h2>
                  <WorkerGrid workers={matching} newest={newest} from={from} />
                </section>
              )}
            </>
          )}

    </div>
  )
}
