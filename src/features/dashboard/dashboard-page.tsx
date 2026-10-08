import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { ErrorState } from '@/components/platform/states'
import { FreshnessBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useResource } from '@/hooks/use-resource'
import { getExecutiveDashboard, PERIODS } from '@/lib/api/dashboard'
import { formatMoment } from '@/lib/format'
import type { Period } from '@/lib/types/dashboard'
import { AttentionList } from './attention-list'
import { ContextBars } from './context-bars'
import { DrillSheet } from './drill-sheet'
import { HeroCard } from './hero-card'
import { RecentRuns } from './recent-runs'
import { DashboardSkeleton } from './dashboard-skeleton'
import { deriveSignals } from './signals'
import { useDashboardParams } from './use-dashboard-params'

const POLL_MS = 30_000
const periodLong = (p: Period) => PERIODS.find((x) => x.value === p)!.long

export function DashboardPage() {
  const { period, detail, verdict, context, measure, page, scenario, update, detailLink } = useDashboardParams()

  const { data, error, pending, updatedAt, dataKey, refresh } = useResource(
    period,
    (signal) => getExecutiveDashboard({ period, signal, scenario }),
    { pollMs: POLL_MS },
  )

  const signals = useMemo(() => (data ? deriveSignals(data, detailLink) : []), [data, detailLink])

  const switching = data !== null && dataKey !== period
  const shownPeriod = (data?.window.key ?? period) as Period
  const refreshing = pending && data !== null && !switching

  const meta = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground" aria-live="polite">
      {refreshing ? (
        <span>Updating…</span>
      ) : data ? (
        <span>
          Updated <Timestamp iso={updatedAt?.toISOString() ?? data.generated_at} />
        </span>
      ) : null}
      {data && data.freshness.state !== 'CURRENT' && <FreshnessBadge state={data.freshness.state} />}
    </div>
  )

  const utilities = (
    <>
      <Button variant="outline" size="icon" onClick={refresh} disabled={pending && data === null} aria-label="Refresh">
        <RefreshCw className={refreshing ? 'animate-spin' : undefined} aria-hidden="true" />
      </Button>
      <Select value={period} onValueChange={(v) => update({ period: v })}>
        <SelectTrigger className="w-36" aria-label="Period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.value === 'all' ? p.label : `Last ${p.label}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="What your Workers delivered, and what needs a look." meta={meta} utilities={utilities} />

      {switching && !error && (
        <p className="text-sm text-muted-foreground" role="status">
          Showing {periodLong(shownPeriod)} · loading {periodLong(period)}…
        </p>
      )}

      {error && data === null && (
        <ErrorState title="Could not load Dashboard." message={error.message} onRetry={refresh} retrying={pending} />
      )}
      {error && data !== null && (
        <ErrorState
          title={switching ? `Could not load ${periodLong(period)}.` : 'Could not refresh Dashboard.'}
          message={`${error.message} ${switching ? `Still showing ${periodLong(shownPeriod)}, from` : 'Showing data from'} ${formatMoment((updatedAt ?? new Date(data.generated_at)).toISOString())}.`}
          onRetry={refresh}
          retrying={pending}
        />
      )}

      {data === null && !error && <DashboardSkeleton />}

      {data && (
        <div aria-busy={pending} className="flex flex-col gap-6">
          <HeroCard data={data} onChoosePeriod={() => update({ period: 'all' })} detailLink={detailLink} />
          <div className="grid items-stretch gap-6 lg:grid-cols-2">
            <AttentionList signals={signals} data={data} />
            <RecentRuns data={data} detailLink={detailLink} />
          </div>
          <ContextBars data={data} detailLink={detailLink} />
          <DrillSheet data={data} detail={detail} measure={measure} detailLink={detailLink} verdict={verdict} context={context} page={page} onChange={update} />
        </div>
      )}
    </PageContainer>
  )
}
