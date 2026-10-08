import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { Bot, Ellipsis, ExternalLink, PencilRuler, SearchX, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { IconTile } from '@/components/platform/icon-tile'
import { PageContainer } from '@/components/platform/page-container'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { IdentityBadge, RuntimeSummaryBadge, VerdictBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { ApiError } from '@/lib/api/client'
import { getWorkerWorkspace } from '@/lib/api/workers'
import { formatDay } from '@/lib/format'
import { workerTypeLabel } from '@/lib/vocabulary'
import type { WorkerWorkspace } from '@/lib/types/worker'
import { consoleState } from '../registry/worker-actions'
import { DeliveryTab } from './delivery-tab'
import { MemoryTab } from './memory-tab'
import { OverviewTab } from './overview-tab'
import { RunsTab } from './runs-tab'
import { RuntimesTab } from './runtimes-tab'
import { SentinelTab } from './sentinel-tab'
import { useWorkerParams, WORKER_VIEWS, type WorkerView } from './use-worker-params'

const ORIGIN_LABEL: Record<string, string> = { '/dashboard': 'Dashboard', '/workers': 'Registry', '/learning': 'Learning', '/sentinel': 'Sentinel' }

function BackLink() {
  const { state } = useLocation() as { state: { from?: string } | null }
  const from = state?.from ?? '/workers'
  const base = from.split('?')[0]
  const label = ORIGIN_LABEL[base] ?? 'Registry'
  return (
    <nav aria-label="Breadcrumb" className="text-meta text-muted-foreground">
      <Link to={from} className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">
        ← Back to {label}
      </Link>
    </nav>
  )
}

function Header({ ws }: { ws: WorkerWorkspace }) {
  const navigate = useNavigate()
  const w = ws.worker
  const access = consoleState(w)
  return (
    <header className="flex flex-col gap-4">
      <BackLink />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <IconTile icon={Bot} className="hidden sm:grid" />
          <div className="min-w-0">
            <h1 className="text-page text-balance">{w.name}</h1>
            <p className="mt-1 text-body text-muted-foreground">
              {w.owner ?? 'Owner not reported'} · {workerTypeLabel(w.worker_type)} · r{w.revision} · composed {formatDay(w.created_at)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <RuntimeSummaryBadge runtime={w.runtime} />
              <IdentityBadge state={w.identity.state} />
              {w.last_outcome.verdict ? <VerdictBadge verdict={w.last_outcome.verdict} /> : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/compose/guided/${w.composition_id}`}>
              <PencilRuler aria-hidden="true" />
              Create new revision
            </Link>
          </Button>
          {access.reachable ? (
            <Button>
              <ExternalLink aria-hidden="true" />
              Open Worker console
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Button disabled aria-describedby="console-reason">
                    <ExternalLink aria-hidden="true" />
                    Open Worker console
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent id="console-reason">{access.reason}</TooltipContent>
            </Tooltip>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={`More actions for ${w.name}`}>
                <Ellipsis aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate(`/learning/workers/${w.composition_id}`)}>
                <Sprout aria-hidden="true" />
                Open in Learning
              </DropdownMenuItem>
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
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-[10px]" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-1/2 max-w-sm" />
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="h-80 p-5"><Skeleton className="h-full w-full" /></Card>
        <Card className="h-80 p-5"><Skeleton className="h-full w-full" /></Card>
      </div>
    </LoadingRegion>
  )
}

export function WorkerPage() {
  const { id = '' } = useParams()
  const { search, state } = useLocation()
  const { view, run, scenario, update } = useWorkerParams()
  const { data, error, pending, refresh } = useResource(`${id}:${scenario}`, (signal) => getWorkerWorkspace(id, { signal, scenario }))

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
          <EmptyState
            icon={SearchX}
            title="Worker not found"
            description={error.message}
            action={<Button asChild variant="outline"><Link to="/workers">Go to the Registry</Link></Button>}
          />
        ) : error ? (
          <ErrorState title="This Worker could not be read." message={error.message} onRetry={refresh} retrying={pending} />
        ) : (
          <WorkerSkeleton />
        )}
      </PageContainer>
    )
  }

  const counts: Partial<Record<WorkerView, number>> = { runs: ws.runs.length, runtimes: ws.runtimes.length, delivery: ws.deliveries.length }
  const setView = (v: string) => update({ view: v, run: null }, true)

  return (
    <PageContainer aria-busy={pending}>
      <Header ws={ws} />

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
        <TabsList variant="line" className="hidden w-full justify-start border-b md:flex" aria-label="Section">
          {WORKER_VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value} className="flex-none px-3">
              {v.label}
              {counts[v.value] !== undefined && <span className="text-muted-foreground tabular-nums">{counts[v.value]}</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview"><OverviewTab ws={ws} onChanged={refresh} /></TabsContent>
        <TabsContent value="runs"><RunsTab ws={ws} selected={run} onSelect={(r) => update({ run: r }, r !== null)} /></TabsContent>
        <TabsContent value="runtimes"><RuntimesTab ws={ws} /></TabsContent>
        <TabsContent value="memory"><MemoryTab ws={ws} /></TabsContent>
        <TabsContent value="sentinel"><SentinelTab ws={ws} /></TabsContent>
        <TabsContent value="delivery"><DeliveryTab ws={ws} /></TabsContent>
      </Tabs>
    </PageContainer>
  )
}
