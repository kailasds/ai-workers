import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getLearningWorkers } from '@/lib/api/catalog'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount, formatRelative } from '@/lib/format'
import type { FleetTerm, LearningWorkers } from '@/lib/types/catalog'
import type { PortfolioWorker } from '@/lib/types/worker'

function Term({ label, term, caption }: { label: string; term: FleetTerm | null; caption?: string }) {
  const value = term?.sum
  return (
    <div className="px-5 py-4 sm:px-6">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value === null || value === undefined ? <span className="text-body text-muted-foreground">Not reported</span> : <span className="text-xl font-semibold tabular-nums">{formatCount(value)}</span>}</dd>
      <dd className="mt-0.5 text-meta text-muted-foreground">{caption ?? (term ? `${term.reporting} of ${term.eligible} Workers reported${term.stopped ? ` · incl. ${term.stopped} stopped` : ''}` : '')}</dd>
    </div>
  )
}

function FleetSummary({ data }: { data: LearningWorkers }) {
  const t = data.totals
  return (
    <Card className="gap-0 py-0">
      <dl className="grid divide-y sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
        <Term label="Execution experiences" term={t.experiences} />
        <Term label="OKF items approved" term={t.okf_approved} caption={t.okf_approved.mode ? `Sentinel decisions · ${t.okf_approved.mode}` : 'Sentinel mode not reported'} />
        <Term label="Skills adopted" term={t.skills_adopted} />
        <Term label="Tokens per met run" term={null} caption={t.tokens_per_met_run.change === null ? `Not comparable · ${t.tokens_per_met_run.comparable_workers} Workers with comparable runs` : ''} />
      </dl>
    </Card>
  )
}

function PlatformRecord({ workers, from }: { workers: PortfolioWorker[]; from: string }) {
  const [showIdle, setShowIdle] = useState(false)
  const learned = workers.filter((w) => w.learning.memories > 0).sort((a, b) => b.learning.memories - a.learning.memories || (b.learning.last_at ?? '').localeCompare(a.learning.last_at ?? ''))
  const idle = workers.filter((w) => w.learning.memories === 0)
  const row = (w: PortfolioWorker) => (
    <li key={w.composition_id}>
      <Link to={`/learning/workers/${w.composition_id}`} state={{ from }} className="flex items-center gap-4 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-item">{w.name}</span>
          <span className="block truncate text-meta text-muted-foreground">{w.bounded_context.label}</span>
        </span>
        {w.learning.memories > 0 && (
          <span className="hidden text-right sm:block">
            <span className="block text-item tabular-nums">{w.learning.memories} memory {w.learning.memories === 1 ? 'record' : 'records'}</span>
            <span className="block text-meta text-muted-foreground">from {w.learning.runs} {w.learning.runs === 1 ? 'run' : 'runs'}{w.learning.last_at ? ` · ${formatRelative(w.learning.last_at)}` : ''}</span>
          </span>
        )}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  )
  return (
    <section aria-labelledby="record-title" className="flex flex-col gap-3">
      <div>
        <h2 id="record-title" className="text-section">What the platform holds</h2>
        <p className="text-meta text-muted-foreground">Memory records kept by the platform from each Worker’s runs. A record is not approval or adoption, and this ordering is not a Learning score.</p>
      </div>
      <Card className="gap-0 py-0">
        <ul className="divide-y">{learned.map(row)}</ul>
        <div className="border-t">
          <button type="button" onClick={() => setShowIdle((v) => !v)} aria-expanded={showIdle} className="flex w-full items-center justify-between px-5 py-3 text-left text-meta text-muted-foreground outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
            {idle.length} Workers have nothing recorded yet
            <ChevronDown className={showIdle ? 'size-4 rotate-180' : 'size-4'} aria-hidden="true" />
          </button>
          {showIdle && <ul className="divide-y border-t">{idle.map(row)}</ul>}
        </div>
      </Card>
    </section>
  )
}

function SharedView({ workers }: { workers: PortfolioWorker[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, PortfolioWorker[]>()
    for (const w of workers) m.set(w.bounded_context.label, [...(m.get(w.bounded_context.label) ?? []), w])
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [workers])
  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <Info aria-hidden="true" />
        <AlertTitle className="text-item">Sharing is declared, not active.</AlertTitle>
        <AlertDescription>No knowledge has moved between Workers.</AlertDescription>
      </Alert>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-0 py-0">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-section">Who would share with whom</h2>
            <p className="text-meta text-muted-foreground">{groups.length} bounded contexts · {workers.length} Workers</p>
          </div>
          <ul className="divide-y border-t">
            {groups.map(([label, ws]) => (
              <li key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="min-w-0 truncate text-item">{label}</span>
                <span className="shrink-0 text-meta text-muted-foreground tabular-nums">{ws.length} Workers</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="gap-0 p-5">
          <h2 className="text-item">Sharing requirements</h2>
          <FactList className="mt-3">
            <Fact label="Independent Workers" className="sm:grid-cols-[8rem_minmax(0,1fr)]">2</Fact>
            <Fact label="Definition of Done" className="sm:grid-cols-[8rem_minmax(0,1fr)]">Required</Fact>
            <Fact label="Shared material" className="sm:grid-cols-[8rem_minmax(0,1fr)]">Conversion patterns only</Fact>
            <Fact label="Customer material" className="sm:grid-cols-[8rem_minmax(0,1fr)]">Excluded</Fact>
            <Fact label="Availability" className="sm:grid-cols-[8rem_minmax(0,1fr)]">Admission path not built</Fact>
          </FactList>
        </Card>
      </div>
    </div>
  )
}

// Learning (estate): what Workers added by running. The counterpart of the Dashboard, which
// says what they delivered; no run-outcome or DoD figures here.
export function LearningPage() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const view = pathname.startsWith('/learning/shared') ? 'shared' : 'workers'
  const period = params.get('period') ?? 'all'
  const fleet = useResource(`learning:${period}`, (signal) => getLearningWorkers({ signal }))
  const portfolio = useResource('portfolio', (signal) => getWorkerPortfolio({ signal }))

  return (
    <PageContainer>
      <PageHeader
        title="Learning"
        description="What Workers added by running, and whether it was accepted."
        utilities={
          view === 'workers' ? (
            <Select value={period} onValueChange={(v) => setParams(v === 'all' ? {} : { period: v }, { replace: true })}>
              <SelectTrigger className="w-36" aria-label="Period"><SelectValue /></SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          ) : undefined
        }
      />
      <SectionNav value={view} onChange={(v) => navigate(v === 'shared' ? '/learning/shared' : '/learning')} items={[{ value: 'workers', label: 'Workers' }, { value: 'shared', label: 'Shared learning' }]} />

      {view === 'workers' ? (
        <>
          {fleet.error ? <ErrorState title="Learning could not be read." message={fleet.error.message} onRetry={fleet.refresh} /> : !fleet.data ? <Skeleton className="h-24" /> : <FleetSummary data={fleet.data} />}
          {fleet.data && fleet.data.workers.length === 0 && (
            <p className="-mt-2 text-meta text-muted-foreground">No Worker reported a Learning score for this period. Scores come from each Worker’s Runtime; none is running and answering.</p>
          )}
          {portfolio.error ? (
            <ErrorState title="The Worker portfolio could not be read." message={portfolio.error.message} onRetry={portfolio.refresh} />
          ) : !portfolio.data ? (
            <LoadingRegion label="Reading the portfolio…" className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14" />)}</LoadingRegion>
          ) : (
            <PlatformRecord workers={portfolio.data.workers} from={`${pathname}${search}`} />
          )}
        </>
      ) : !portfolio.data ? (
        <Skeleton className="h-64" />
      ) : (
        <SharedView workers={portfolio.data.workers} />
      )}
      <Button asChild variant="link" className="self-start px-0"><Link to="/knowledge/skills">Looking for what TCS knows? That is Knowledge.</Link></Button>
    </PageContainer>
  )
}
