import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/platform/page-container'
import { LoadingRegion } from '@/components/platform/states'
import { VerdictBar } from '@/components/platform/verdict-meter'
import { useResource } from '@/hooks/use-resource'
import { listDrafts } from '@/lib/api/compose'
import { getExecutiveDashboard } from '@/lib/api/dashboard'
import { getCustomerPackages, getRuntimeRecords, getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { acknowledged, readyToPackage, readyToPrepare } from './pipeline-model'

// The Registry is the marketplace of Workers: every Worker, what is being sealed into a Package,
// and what has gone to customers. One header, one band of figures, then the pipeline as tabs.
// Each tab keeps its own URL (/workers, /packaging, /customer-delivery) so every old link works.

function usePipeline() {
  const { search } = useLocation()
  const scenario = new URLSearchParams(search).get('mock')
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const records = useResource('runtime-records', (signal) => getRuntimeRecords({ signal }))
  const packages = useResource('customer-packages', (signal) => getCustomerPackages({ signal }))
  const outcomes = useResource('outcomes:30d', (signal) => getExecutiveDashboard({ period: '30d', signal, scenario }))

  const d = drafts.data
  const toPackage = d && records.data ? readyToPackage(d, records.data).length : null
  const toPrepare = d && packages.data ? readyToPrepare(d, packages.data).length : null
  return { portfolio, drafts, records, packages, outcomes, toPackage, toPrepare }
}

type Pipeline = ReturnType<typeof usePipeline>

/** A figure: overline, a serif numeral, and one line saying what it counts. Unknown is never 0. */
function Kpi({ label, value, unit, caption, to, children, loading, failed }: { label: string; value: number | null | undefined; unit?: string; caption: React.ReactNode; to?: string; children?: React.ReactNode; loading: boolean; failed: boolean }) {
  const body = (
    <>
      <p className="flex items-center justify-between gap-2 text-overline text-muted-foreground uppercase">
        {label}
        {to && <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />}
      </p>
      <div className="mt-3 flex items-baseline gap-1.5">
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : failed || value === null || value === undefined ? (
          <span className="text-body text-muted-foreground">Not available</span>
        ) : (
          <>
            <span className="font-display text-[2rem] leading-none sm:text-[2.5rem] font-normal tracking-tight tabular-nums">{formatCount(value)}</span>
            {unit && <span className="text-meta text-muted-foreground">{unit}</span>}
          </>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
      <p className="mt-2 text-meta text-muted-foreground">{caption}</p>
    </>
  )
  const cell = 'group relative block min-w-0 bg-card px-4 py-4 sm:px-6 sm:py-5'
  return to ? (
    <Link to={to} className={cn(cell, 'outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset')}>
      {body}
    </Link>
  ) : (
    <div className={cell}>{body}</div>
  )
}

function KpiBand({ p }: { p: Pipeline }) {
  const totals = p.portfolio.data?.totals
  const o = p.outcomes.data
  const completed = o?.headlines.completed_runs.value ?? null
  const dod = o?.definition_of_done
  const packaged = p.drafts.data?.filter((d) => d.status === 'ACTIVE' && d.package).length
  const acked = p.packages.data ? acknowledged(p.packages.data).length : null
  return (
    <section aria-label="Registry at a glance" className="grid overflow-hidden rounded-xl border bg-border [gap:1px] grid-cols-2 xl:grid-cols-4">
      <Kpi label="Workers" value={totals?.workers} loading={!p.portfolio.data && !p.portfolio.error} failed={Boolean(p.portfolio.error && !p.portfolio.data)} to="/workers" caption={totals ? <><span className="text-foreground">{formatCount(totals.serving)} serving</span> · {formatCount(totals.attention)} need attention</> : 'Every Worker on the platform'}>
        {totals && totals.workers > 0 && (
          <div role="img" aria-label={`${totals.serving} of ${totals.workers} serving`} className="flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
            <span className="bg-primary" style={{ flexGrow: totals.serving, flexBasis: 0 }} />
            <span className="bg-warning/70" style={{ flexGrow: totals.attention, flexBasis: 0 }} />
            <span className="bg-transparent" style={{ flexGrow: Math.max(0, totals.workers - totals.serving - totals.attention), flexBasis: 0 }} />
          </div>
        )}
      </Kpi>
      <Kpi label="Met Definition of Done" value={dod?.met} unit={completed !== null ? `of ${formatCount(completed)} runs` : undefined} loading={!o && !p.outcomes.error} failed={Boolean(p.outcomes.error && !o)} to="/dashboard" caption={<>Last 30 days · <span className="text-foreground underline-offset-4 group-hover:underline">outcomes report</span></>}>
        {dod && completed ? <VerdictBar counts={{ MET: dod.met, NOT_MET: dod.not_met, NOT_ADJUDICABLE: dod.not_adjudicable }} className="h-1.5" /> : null}
      </Kpi>
      <Kpi label="Ready to package" value={p.toPackage} loading={p.toPackage === null && !p.drafts.error && !p.records.error} failed={Boolean(p.drafts.error || p.records.error)} to="/packaging" caption={packaged !== undefined ? `${formatCount(packaged)} sealed Packages so far` : 'Composed, nothing blocking'} />
      <Kpi label="With customers" value={p.packages.data?.length} loading={!p.packages.data && !p.packages.error} failed={Boolean(p.packages.error && !p.packages.data)} to="/customer-delivery?view=delivered" caption={acked !== null ? `${formatCount(acked)} acknowledged · ${p.toPrepare ?? '—'} waiting to prepare` : 'Prepared customer Packages'} />
    </section>
  )
}

const STAGES = [
  { n: '01', to: '/workers', label: 'Workers', hint: 'Every Worker on the platform' },
  { n: '02', to: '/packaging', label: 'Packaging', hint: 'Seal into versioned Packages' },
  { n: '03', to: '/customer-delivery', label: 'Customer delivery', hint: 'Prepare and track handover' },
] as const

/** The pipeline as tabs: three stages joined by a rule, the current one lifted with an ember mark. */
function StageTabs({ p }: { p: Pipeline }) {
  const counts: Record<string, number | null | undefined> = {
    '/workers': p.portfolio.data?.totals.workers,
    '/packaging': p.toPackage,
    '/customer-delivery': p.toPrepare,
  }
  return (
    <nav aria-label="Registry" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ol className="relative flex min-w-max items-stretch gap-2 sm:min-w-0">
        {STAGES.map((s, i) => (
          <li key={s.to} className="flex flex-1 items-center gap-2">
            <NavLink
              to={s.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex min-w-[13rem] flex-1 items-center gap-3 rounded-lg border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'border-border bg-card shadow-raised' : 'border-transparent hover:border-border hover:bg-card/60',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute inset-x-4 -top-px h-[2px] rounded-full bg-ember" />}
                  <span className={cn('font-mono text-meta tabular-nums', isActive ? 'text-ember' : 'text-subtle-foreground')}>{s.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-item', isActive ? 'font-semibold text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>{s.label}</span>
                    <span className="block truncate text-meta text-subtle-foreground">{s.hint}</span>
                  </span>
                  {counts[s.to] !== null && counts[s.to] !== undefined && (
                    <span className={cn('rounded-full px-2 py-0.5 text-meta font-medium tabular-nums', isActive ? 'bg-primary-soft text-primary-strong' : 'bg-muted text-muted-foreground')}>{formatCount(counts[s.to]!)}</span>
                  )}
                </>
              )}
            </NavLink>
            {i < STAGES.length - 1 && (
              <span aria-hidden="true" className="hidden h-px w-6 shrink-0 bg-[linear-gradient(90deg,var(--border)_50%,transparent_50%)] bg-[length:6px_1px] lg:block" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function RegistryLayout() {
  const p = usePipeline()
  return (
    <PageContainer className="gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-overline text-muted-foreground uppercase">Worker marketplace</p>
          <h1 className="mt-2 text-page">Registry</h1>
          <p className="mt-1 max-w-2xl text-body text-muted-foreground">Every Worker on the platform, what is being sealed into a Package, and what has gone to customers.</p>
        </div>
        <Button asChild size="lg" className="shrink-0 self-start sm:self-auto">
          <Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link>
        </Button>
      </header>

      <KpiBand p={p} />

      <div className="flex flex-col gap-6">
        <StageTabs p={p} />
        <Suspense
          fallback={
            <LoadingRegion label="Loading…" className="flex flex-col gap-3">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-64 w-full" />
            </LoadingRegion>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </PageContainer>
  )
}
