import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Ellipsis, Monitor, PackageCheck, Pencil, Plus, SearchX, Send, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { PageContainer } from '@/components/platform/page-container'
import { LINE_TAB, LINE_TABS_LIST, TabCount } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { ApiError } from '@/lib/api/client'
import { getWorkerWorkspace } from '@/lib/api/workers'
import type { WorkerWorkspace } from '@/lib/types/worker'
import { consoleState } from '../registry/worker-actions'
import { BrainTab, LearningTab } from './brain-tabs'
import { DeliveryTab } from './delivery-tab'
import { KnowledgeTab } from './knowledge-tab'
import { IdentityDetails, PackageTab } from './package-tab'
import { RunsTab } from './runs-tab'
import { RuntimesTab } from './runtimes-tab'
import { SentinelTab } from './sentinel-tab'
import { useComposition } from './use-composition'
import { SimilarWorkers } from './similar-workers'
import { VersionsTab } from './versions-tab'
import { WorkerKpis } from './worker-kpis'
import { useWorkerParams, WORKER_VIEWS, type WorkerView } from './use-worker-params'

const ORIGIN_LABEL: Record<string, string> = { '/dashboard': 'Outcomes', '/workers': 'Home', '/learning': 'Learning', '/sentinel': 'Sentinel' }

function BackLink() {
  const { state } = useLocation() as { state: { from?: string } | null }
  const from = state?.from ?? '/workers'
  const label = ORIGIN_LABEL[from.split('?')[0]] ?? 'Home'
  return (
    <nav aria-label="Breadcrumb">
      <Link to={from} className="inline-flex items-center gap-1.5 rounded-sm text-body font-medium text-primary outline-none hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {label}
      </Link>
    </nav>
  )
}

function Header({ ws, onIdentity, onView }: { ws: WorkerWorkspace; onIdentity: () => void; onView: (v: WorkerView) => void }) {
  const navigate = useNavigate()
  const w = ws.worker
  const access = consoleState(w)
  const consoles = ws.runtimes.filter((r) => r.state !== 'TERMINATED').length
  const pkg = ws.composition?.package
  return (
    <header className="flex flex-col gap-3">
      <BackLink />
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <h1 className="min-w-0 text-page text-balance">{w.name}</h1>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {access.reachable ? (
            <Button><Monitor aria-hidden="true" />Open console</Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Button disabled aria-describedby="console-reason"><Monitor aria-hidden="true" />Open console</Button>
                </span>
              </TooltipTrigger>
              <TooltipContent id="console-reason">{access.reason}</TooltipContent>
            </Tooltip>
          )}
          {consoles > 0 && (
            <Button variant="outline" onClick={() => onView('runtimes')}>
              All {consoles} {consoles === 1 ? 'console' : 'consoles'}
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={`/compose/guided/${w.composition_id}?mode=review`}><Pencil aria-hidden="true" />Edit Worker</Link>
          </Button>
          <Button variant="outline" onClick={onIdentity}>
            Identity details
            <Plus aria-hidden="true" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label={`More actions for ${w.name}`}>
                <Ellipsis aria-hidden="true" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => navigate(`/learning/workers/${w.composition_id}`)}>
                <Sprout aria-hidden="true" />
                Open in Learning
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/packaging')}>
                <PackageCheck aria-hidden="true" />
                Open in Packaging
              </DropdownMenuItem>
              {pkg && (
                <DropdownMenuItem onSelect={() => navigate(`/customer-delivery/prepare/${pkg.id}`)}>
                  <Send aria-hidden="true" />
                  Prepare customer package
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function WorkerSkeleton() {
  return (
    <LoadingRegion label="Loading Worker…" className="flex flex-col gap-6">
      <Skeleton className="h-4 w-20 bg-track" />
      <Skeleton className="h-9 w-2/3 max-w-md bg-track" />
      <Skeleton className="h-10 w-full bg-track" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Card className="h-80 p-5"><Skeleton className="h-full w-full bg-track" /></Card>
        <Card className="h-80 p-5"><Skeleton className="h-full w-full bg-track" /></Card>
      </div>
    </LoadingRegion>
  )
}

export function WorkerPage() {
  const { id = '' } = useParams()
  const { search, state } = useLocation()
  const { view, run, scenario, update } = useWorkerParams()
  const { data, error, pending, refresh } = useResource(`${id}:${scenario}`, (signal) => getWorkerWorkspace(id, { signal, scenario }))
  const comp = useComposition(id, scenario)
  const [identityOpen, setIdentityOpen] = useState(false)

  useEffect(() => {
    if (data && !('redirect' in data)) document.title = `${data.worker.name} · AI Worker Platform`
    return () => {
      document.title = 'AI Worker Platform'
    }
  }, [data])

  // A runtime id in the URL lands on its Worker, keeping the query (and where we came from).
  if (data && 'redirect' in data) return <Navigate to={`/workers/${data.redirect}${search}`} state={state} replace />

  const ws = data && !('redirect' in data) ? data : null
  const notFound = error instanceof ApiError && error.status === 404

  if (!ws) {
    return (
      <PageContainer>
        {notFound ? (
          <EmptyState icon={SearchX} title="Worker not found" description={error.message} action={<Button asChild variant="outline"><Link to="/workers">Go to Home</Link></Button>} />
        ) : error ? (
          <ErrorState title="This Worker could not be read." message={error.message} onRetry={refresh} retrying={pending} />
        ) : (
          <WorkerSkeleton />
        )}
      </PageContainer>
    )
  }

  const counts: Partial<Record<WorkerView, number>> = {
    versions: ws.versions.length,
    runs: ws.runs.length,
    runtimes: ws.runtimes.length,
    delivery: ws.deliveries.length,
  }
  const setView = (v: string) => update({ view: v, run: null }, true)

  return (
    <PageContainer aria-busy={pending}>
      <Header ws={ws} onIdentity={() => setIdentityOpen(true)} onView={setView} />
      <WorkerKpis ws={ws} />

      <Tabs value={view} onValueChange={setView} className="gap-6">
        {/* P-02: tabs on wide screens; one labelled select below 768px. */}
        <div className="md:hidden">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-full" aria-label="Section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKER_VIEWS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                  {counts[v.value] !== undefined ? ` (${counts[v.value]})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="no-scrollbar hidden overflow-x-auto md:block">
          <TabsList variant="line" className={LINE_TABS_LIST} aria-label="Section">
            {WORKER_VIEWS.map((v) => (
              <TabsTrigger key={v.value} value={v.value} className={LINE_TAB}>
                {v.label}
                <TabCount n={counts[v.value]} />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="package"><PackageTab ws={ws} comp={comp} /></TabsContent>
        <TabsContent value="versions"><VersionsTab ws={ws} /></TabsContent>
        <TabsContent value="runs"><RunsTab ws={ws} selected={run} onSelect={(r) => update({ run: r }, r !== null)} /></TabsContent>
        <TabsContent value="brain"><BrainTab ws={ws} /></TabsContent>
        <TabsContent value="knowledge"><KnowledgeTab comp={comp} /></TabsContent>
        <TabsContent value="learning"><LearningTab ws={ws} /></TabsContent>
        <TabsContent value="sentinel"><SentinelTab ws={ws} /></TabsContent>
        <TabsContent value="runtimes"><RuntimesTab ws={ws} /></TabsContent>
        <TabsContent value="delivery"><DeliveryTab ws={ws} /></TabsContent>
      </Tabs>

      {view === 'versions' && <SimilarWorkers worker={ws.worker} scenario={scenario} />}

      <DetailSheet open={identityOpen} onClose={() => setIdentityOpen(false)} title="Identity details">
        <IdentityDetails ws={ws} onChanged={refresh} />
      </DetailSheet>
    </PageContainer>
  )
}
