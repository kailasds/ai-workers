import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ArrowUpRight, Bot, ClipboardCheck, Package, Plus, Send, type LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
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

/** A figure on a white inset card: label, one stat, one caption. Unknown is never 0. */
function Kpi({ label, icon: Icon, hue, value, unit, caption, to, children, loading, failed }: { label: string; icon: LucideIcon; hue: Hue; value: number | null | undefined; unit?: string; caption: React.ReactNode; to?: string; children?: React.ReactNode; loading: boolean; failed: boolean }) {
  const body = (
    <>
      <p className="flex items-center gap-2.5 text-meta font-medium text-muted-foreground">
        <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
        <span className="min-w-0 flex-1">{label}</span>
        {to && <ArrowUpRight className="size-4 text-subtle-foreground group-hover:text-primary group-focus-visible:text-primary" aria-hidden="true" />}
      </p>
      <div className="mt-3 flex items-baseline gap-1.5">
        {loading ? (
          <Skeleton className="h-9 w-16 bg-track" />
        ) : failed || value === null || value === undefined ? (
          <span className="text-body text-muted-foreground">Not available</span>
        ) : (
          <>
            <span className="text-stat tabular-nums">{formatCount(value)}</span>
            {unit && <span className="text-meta text-muted-foreground">{unit}</span>}
          </>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
      <p className="mt-2 text-meta text-muted-foreground">{caption}</p>
    </>
  )
  const cell = 'group relative block min-w-0 rounded-block bg-card p-4 text-card-foreground sm:p-5'
  return to ? (
    <Link to={to} className={cn(cell, 'outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary-foreground/60')}>
      {body}
    </Link>
  ) : (
    <div className={cell}>{body}</div>
  )
}

/** design.md §7.1: the navy identity panel, framing white inset cards. The screen's one navy mass. */
function KpiBand({ p }: { p: Pipeline }) {
  const totals = p.portfolio.data?.totals
  const o = p.outcomes.data
  const completed = o?.headlines.completed_runs.value ?? null
  const dod = o?.definition_of_done
  const packaged = p.drafts.data?.filter((d) => d.status === 'ACTIVE' && d.package).length
  const acked = p.packages.data ? acknowledged(p.packages.data).length : null
  return (
    <section aria-labelledby="glance-title" className="rounded-panel bg-identity p-2 text-identity-foreground">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 pt-2 pb-3">
        <h2 id="glance-title" className="text-section">The pipeline at a glance</h2>
        <p className="text-meta text-identity-foreground/80">Outcomes over the last 30 days</p>
      </div>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <Kpi label="Workers" icon={Bot} hue="blue" value={totals?.workers} loading={!p.portfolio.data && !p.portfolio.error} failed={Boolean(p.portfolio.error && !p.portfolio.data)} to="/workers" caption={totals ? <><span className="text-foreground">{formatCount(totals.serving)} serving</span> · {formatCount(totals.attention)} need attention</> : 'Every Worker on the platform'}>
          {totals && totals.workers > 0 && (
            <div role="img" aria-label={`${totals.serving} of ${totals.workers} serving`} className="flex h-1.5 gap-px overflow-hidden rounded-full bg-track">
              <span className="bg-brand" style={{ flexGrow: totals.serving, flexBasis: 0 }} />
              <span className="bg-warning/70" style={{ flexGrow: totals.attention, flexBasis: 0 }} />
              <span style={{ flexGrow: Math.max(0, totals.workers - totals.serving - totals.attention), flexBasis: 0 }} />
            </div>
          )}
        </Kpi>
        <Kpi label="Met Definition of Done" icon={ClipboardCheck} hue="violet" value={dod?.met} unit={completed !== null ? `of ${formatCount(completed)} runs` : undefined} loading={!o && !p.outcomes.error} failed={Boolean(p.outcomes.error && !o)} to="/dashboard" caption={<>Last 30 days · <span className="text-primary underline-offset-4 group-hover:underline">Outcomes report</span></>}>
          {dod && completed ? <VerdictBar counts={{ MET: dod.met, NOT_MET: dod.not_met, NOT_ADJUDICABLE: dod.not_adjudicable }} className="h-1.5 bg-track" /> : null}
        </Kpi>
        <Kpi label="Ready to package" icon={Package} hue="amber" value={p.toPackage} loading={p.toPackage === null && !p.drafts.error && !p.records.error} failed={Boolean(p.drafts.error || p.records.error)} to="/packaging" caption={packaged !== undefined ? `${formatCount(packaged)} sealed Packages so far` : 'Composed, nothing blocking'} />
        <Kpi label="With customers" icon={Send} hue="teal" value={p.packages.data?.length} loading={!p.packages.data && !p.packages.error} failed={Boolean(p.packages.error && !p.packages.data)} to="/customer-delivery?view=delivered" caption={acked !== null ? `${formatCount(acked)} acknowledged · ${p.toPrepare ?? '—'} waiting to prepare` : 'Prepared customer Packages'} />
      </div>
    </section>
  )
}

// Each stage keeps one hue and icon everywhere it appears (KPI card and tab).
const STAGES: { to: string; label: string; hint: string; icon: LucideIcon; hue: Hue }[] = [
  { to: '/workers', label: 'Workers', hint: 'Every Worker on the platform', icon: Bot, hue: 'blue' },
  { to: '/packaging', label: 'Packaging', hint: 'Seal into versioned Packages', icon: Package, hue: 'amber' },
  { to: '/customer-delivery', label: 'Customer delivery', hint: 'Prepare and track handover', icon: Send, hue: 'teal' },
]

/** design.md §7.3: the pipeline as tabs, three stages joined by a hairline; the current one is a lifted white sheet. */
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
                  'group relative flex min-w-[13rem] flex-1 items-center gap-3 rounded-block border px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive ? 'border-primary/30 bg-card' : 'border-transparent hover:bg-card/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute inset-x-4 -bottom-px h-[3px] rounded-t-full bg-primary" />}
                  <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-block [&>svg]:size-5', isActive ? HUE[s.hue].solid : cn(HUE[s.hue].soft, HUE[s.hue].text))}>
                    <s.icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-item', isActive ? 'text-primary-strong' : 'text-foreground')}>{s.label}</span>
                    <span className="block truncate text-meta text-muted-foreground">{s.hint}</span>
                  </span>
                  {counts[s.to] !== null && counts[s.to] !== undefined && (
                    <span className={cn('rounded-full px-2 py-0.5 text-meta font-medium tabular-nums', isActive ? 'bg-primary text-primary-foreground' : 'bg-chip-neutral text-foreground')}>{formatCount(counts[s.to]!)}</span>
                  )}
                </>
              )}
            </NavLink>
            {i < STAGES.length - 1 && (
              <span aria-hidden="true" className="hidden h-px w-6 shrink-0 bg-border lg:block" />
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
    <PageContainer>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page">Registry</h1>
          <p className="mt-1 max-w-2xl text-body text-muted-foreground">Every Worker on the platform, what is being sealed into a Package, and what has gone to customers.</p>
        </div>
        <Button asChild className="shrink-0 self-start sm:self-auto">
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
