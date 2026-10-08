import { useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import { Bot, MousePointerClick, Plus, RefreshCw, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { FreshnessBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useResource } from '@/hooks/use-resource'
import { getCustomerPackages, getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { CustomerPackagesTable } from './customer-packages'
import { ambiguousIds, filterWorkers, matchesFacet, newestId, RUNTIME_FACETS, SORTS, sortWorkers, type RuntimeFacet } from './registry-model'
import { useRegistryParams } from './use-registry-params'
import { WorkerList, type Group } from './worker-list'
import { WorkerPreview } from './worker-preview'

const ALL = '__all'

function ListSkeleton() {
  return (
    <LoadingRegion label="Reading the Worker portfolio…" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card className="gap-0 py-0">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 border-b px-5 py-4 last:border-0">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </Card>
      <Card className="hidden h-96 p-6 xl:flex"><Skeleton className="h-full w-full" /></Card>
    </LoadingRegion>
  )
}

export function RegistryPage() {
  const p = useRegistryParams()
  const { pathname, search } = useLocation()
  const wide = useMediaQuery('(min-width: 1280px)')
  const portfolio = useResource(`portfolio:${p.scenario}`, (signal) => getWorkerPortfolio({ signal, scenario: p.scenario }))
  // Loaded independently: one failing never empties the other.
  const packages = useResource(`packages:${p.scenario}`, (signal) => getCustomerPackages({ signal, scenario: p.scenario }))

  const data = portfolio.data
  const workers = useMemo(() => data?.workers ?? [], [data])
  const newest = useMemo(() => newestId(workers), [workers])
  const ambiguous = useMemo(() => ambiguousIds(workers), [workers])

  const { q, facet, context, learning, sentinel, sort } = p
  const matching = useMemo(() => sortWorkers(filterWorkers(workers, { q, facet, context, learning, sentinel }), sort, newest), [workers, q, facet, context, learning, sentinel, sort, newest])
  const facetBase = useMemo(() => filterWorkers(workers, { q, facet: null, context, learning, sentinel }), [workers, q, context, learning, sentinel])
  const groups: Group[] = useMemo(() => {
    const order = data?.bounded_contexts ?? []
    return order
      .map((c) => ({ key: c.key, label: c.label, workers: matching.filter((w) => w.bounded_context.key === c.key) }))
      .filter((g) => g.workers.length > 0)
  }, [data, matching])

  const filtering = Boolean(q || facet || context || learning || sentinel)
  const secondaryActive = [context, learning, sentinel].filter(Boolean).length + (sort !== 'evidence' ? 1 : 0)
  const clearAll = () => p.update({ q: null, runtime: null, context: null, brain: null, sentinel: null })
  const from = `${pathname}${search}`

  // On wide screens a Worker is always previewed (the first one if none is chosen).
  // Narrower, the preview is a sheet that opens only when asked.
  const ordered = groups.flatMap((g) => g.workers)
  const selected = (p.open && workers.find((w) => w.composition_id === p.open)) || (wide ? ordered[0] : undefined) || null
  const select = (id: string) => p.update({ open: id }, { resetPage: false, push: !wide })

  const meta = (
    <div className="flex flex-wrap items-center gap-2 text-meta text-muted-foreground" aria-live="polite">
      {portfolio.pending && data ? <span>Updating…</span> : data ? <span>Updated <Timestamp iso={portfolio.updatedAt?.toISOString() ?? data.generated_at} /></span> : null}
      {data && data.freshness.state !== 'CURRENT' && <FreshnessBadge state={data.freshness.state} />}
    </div>
  )

  return (
    <PageContainer>
      <PageHeader
        title="Workers"
        description="Every Worker, whether it is serving, and what it last did."
        meta={meta}
        utilities={
          <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => { portfolio.refresh(); packages.refresh() }}>
            <RefreshCw className={portfolio.pending && data ? 'animate-spin' : undefined} aria-hidden="true" />
          </Button>
        }
        actions={
          <Button asChild>
            <Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link>
          </Button>
        }
      />

      <Tabs value={p.view} onValueChange={(v) => p.update({ view: v, open: null }, { push: true })} className="gap-6">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="tcs" className="flex-none px-3">
            Workers {data && <span className="text-muted-foreground tabular-nums">{formatCount(data.totals.workers)}</span>}
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex-none px-3">
            Customer packages {packages.data && <span className="text-muted-foreground tabular-nums">{packages.data.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tcs" className="flex flex-col gap-5">
          {portfolio.error && data && (
            <ErrorState title="Could not refresh the Registry." message={`${portfolio.error.message} Showing the last successful read.`} onRetry={portfolio.refresh} retrying={portfolio.pending} />
          )}

          {portfolio.error && !data ? (
            <ErrorState title="Registry unavailable." message={portfolio.error.message} onRetry={portfolio.refresh} retrying={portfolio.pending} />
          ) : !data ? (
            <ListSkeleton />
          ) : workers.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No Workers have been composed yet"
              description="A Worker appears here once it is composed."
              action={<Button asChild><Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link></Button>}
            />
          ) : (
            <>
              {/* One quiet toolbar: find, narrow by state, everything else behind Filters. */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <InputGroup className="lg:max-w-xs">
                  <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
                  <InputGroupInput type="search" value={q} onChange={(e) => p.update({ q: e.target.value })} placeholder="Search Workers" aria-label="Search name, owner, context or identity" />
                </InputGroup>
                <div className="flex items-center gap-2">
                  <div className="no-scrollbar -mx-4 min-w-0 flex-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={facet ?? ALL} onValueChange={(v) => v && p.update({ runtime: v === ALL ? null : v })} aria-label="Runtime" className="w-max">
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
                      <Button variant="outline" size="sm" className="shrink-0">
                        <SlidersHorizontal aria-hidden="true" />
                        <span className="max-sm:sr-only">Filters</span>
                        {secondaryActive > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 tabular-nums">{secondaryActive}</Badge>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="flex w-80 flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="f-context">Bounded context</Label>
                        <Select value={context ?? ALL} onValueChange={(v) => p.update({ context: v === ALL ? null : v })}>
                          <SelectTrigger id="f-context" className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>All contexts</SelectItem>
                            {data.bounded_contexts.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
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
                {filtering && (
                  <p className="flex items-center gap-2 text-meta text-muted-foreground lg:ml-auto" aria-live="polite">
                    <span className="tabular-nums">{formatCount(matching.length)} of {formatCount(workers.length)}</span>
                    <Button variant="link" size="xs" className="h-auto px-0 text-meta" onClick={clearAll}>Clear</Button>
                  </p>
                )}
              </div>

              {matching.length === 0 ? (
                <EmptyState icon={SearchX} title="No Workers match" description="Try a different search, or clear the filters." action={<Button variant="outline" onClick={clearAll}>Clear filters</Button>} />
              ) : (
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <Card className="gap-0 overflow-hidden py-0" aria-busy={portfolio.pending}>
                    <WorkerList groups={groups} selectedId={selected?.composition_id ?? null} onSelect={select} newest={newest} ambiguous={ambiguous} expandAll={filtering} />
                  </Card>

                  {wide && (
                    <Card className="sticky top-6 gap-0 p-6" role="region" aria-label="Worker preview">
                      {selected ? (
                        <WorkerPreview worker={selected} from={from} />
                      ) : (
                        <EmptyState icon={MousePointerClick} title="Choose a Worker" className="border-0" />
                      )}
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="customer">
          <Card className="gap-0 py-0">
            {packages.error && !packages.data ? (
              <ErrorState className="m-5" title="Customer packages could not be read." message={packages.error.message} onRetry={packages.refresh} retrying={packages.pending} />
            ) : !packages.data ? (
              <LoadingRegion label="Reading customer packages…" className="flex flex-col gap-3 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </LoadingRegion>
            ) : (
              <CustomerPackagesTable packages={packages.data} />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {!wide && (
        <Sheet open={selected !== null} onOpenChange={(o) => !o && p.update({ open: null }, { resetPage: false })}>
          <SheetContent side="bottom" className="max-h-[88svh] gap-0 rounded-t-2xl sm:mx-auto sm:max-w-xl">
            <SheetHeader className="sr-only">
              <SheetTitle>{selected?.name ?? 'Worker'}</SheetTitle>
              <SheetDescription>Worker preview</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0">
              <div className="p-6">{selected && <WorkerPreview worker={selected} from={from} headingLevel="h3" />}</div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </PageContainer>
  )
}
