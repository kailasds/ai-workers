import { Link } from 'react-router'
import { ArrowRight, ChevronRight, Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getSentinelOverview } from '@/lib/api/catalog'
import { cn } from '@/lib/utils'
import type { PlatformSentinelOverview } from '@/lib/types/catalog'
import { DIMENSIONS, openPhrase } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'

const SEGMENTS = [
  { key: 'reporting', label: 'Reporting', filter: 'reporting', className: 'bg-brand' },
  { key: 'no_sentinel', label: 'No Sentinel', filter: 'no-sentinel', className: 'bg-warning' },
  { key: 'unavailable', label: 'Status unavailable', filter: 'unavailable', className: 'bg-muted-foreground/60' },
] as const

function Posture({ o }: { o: PlatformSentinelOverview }) {
  const running = o.coverage.running
  return (
    <Card className="gap-0 py-0">
      <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
        <div>
          <p className="text-overline text-muted-foreground uppercase">Posture · last {o.window_days} days</p>
          <h2 className="mt-3 text-balance">
            {running === 0 ? (
              <span className="text-3xl font-semibold tracking-tight">No Workers are running</span>
            ) : (
              <>
                <span className="text-5xl leading-none font-semibold tracking-tight tabular-nums">{o.coverage.reporting}</span>
                <span className="text-2xl font-medium tracking-tight text-muted-foreground tabular-nums"> of {running}</span>
                <span className="mt-2 block text-lg font-normal text-muted-foreground">running {running === 1 ? 'Worker is' : 'Workers are'} watched by a reporting Sentinel</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-body text-muted-foreground">{o.in_force.length ? `${o.in_force.length} restrictions in force` : 'No restrictions in force'} · {o.coverage.not_running} Workers not running</p>
        </div>
        <div className="flex flex-col gap-3">
          <div role="img" aria-label={`Coverage of ${running} running Workers: ${SEGMENTS.map((s) => `${s.label} ${o.coverage[s.key]}`).join(', ')}`} className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
            {SEGMENTS.filter((s) => o.coverage[s.key] > 0).map((s) => <span key={s.key} className={cn('h-full', s.className)} style={{ flexGrow: o.coverage[s.key], flexBasis: 0 }} />)}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta text-muted-foreground">
            {SEGMENTS.map((s) => (
              <li key={s.key}>
                <Link to={`/sentinel/workers?filter=${s.filter}`} className="inline-flex items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <span aria-hidden="true" className={cn('size-2 rounded-full', s.className)} />
                  {s.label} <span className="font-medium text-foreground tabular-nums">{o.coverage[s.key]}</span>
                </Link>
              </li>
            ))}
          </ul>
          {!o.coverage.complete && <p className="text-meta text-warning">Coverage is partial.</p>}
        </div>
      </div>
      <dl className="grid border-t sm:grid-cols-3 sm:divide-x max-sm:divide-y">
        <div className="px-6 py-4"><dt className="text-meta text-muted-foreground">Decides</dt><dd className="mt-1 text-item">{o.mode.set ? (o.mode.set === 'shadow' ? 'Shadow' : 'Enforce') : 'Mode not set'}</dd></div>
        <div className="px-6 py-4"><dt className="text-meta text-muted-foreground">Applies</dt><dd className="mt-1 text-item">{o.mode.acting ? 'Yes' : 'No'}</dd>{o.mode.why && <dd className="mt-0.5 text-meta text-muted-foreground">{o.mode.why}</dd>}</div>
        <div className="px-6 py-4">
          <dt className="text-meta text-muted-foreground">Decision chain</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-item">
            {o.chain.verified === null ? <><Link2Off className="size-3.5 text-muted-foreground" aria-hidden="true" />Not verified yet</> : o.chain.verified ? `Verified · ${o.chain.entries} entries` : `Broken at ${o.chain.broken_at}`}
          </dd>
          <dd className="mt-0.5 text-meta text-muted-foreground">{o.chain.entries} entries recorded</dd>
        </div>
      </dl>
    </Card>
  )
}

export function SentinelOverviewPage() {
  const { data, error, refresh } = useResource('sentinel-overview', (signal) => getSentinelOverview({ signal }))
  return (
    <SentinelLayout view="overview">
      {error ? (
        <ErrorState title="The Platform Sentinel could not be read." message={error.message} onRetry={refresh} />
      ) : !data ? (
        <LoadingRegion label="Reading the Platform Sentinel…" className="flex flex-col gap-4"><Skeleton className="h-56" /><Skeleton className="h-64" /></LoadingRegion>
      ) : (
        <>
          <Posture o={data} />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Card className="gap-0 py-0">
              <h2 className="px-5 pt-5 pb-3 text-section">Five dimensions</h2>
              <ul className="divide-y border-t">
                {DIMENSIONS.map((d) => {
                  const dim = data.dimensions.find((x) => x.key === d.key)
                  return (
                    <li key={d.key}>
                      <Link to={`/sentinel/${d.key}`} className="flex items-center gap-4 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                        <span className="min-w-0 flex-1">
                          <span className="block text-item">{d.name}</span>
                          <span className="block text-meta text-muted-foreground">{d.question}</span>
                        </span>
                        <span className="text-right">
                          <span className="block text-meta font-medium">{dim ? (dim.built ? openPhrase(dim.open) : 'Not built yet') : 'Not reported'}</span>
                          <span className="block text-meta text-muted-foreground">{dim?.last ? dim.last.title : 'Nothing recorded yet'}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
            <div className="flex flex-col gap-6">
              <Card className="gap-2 p-5">
                <h2 className="text-section">In force now</h2>
                <p className="text-body text-muted-foreground">{data.in_force.length === 0 ? 'Nothing is in force. That is a fact about restrictions, not a safety claim.' : `${data.in_force.length} restrictions`}</p>
              </Card>
              <Card className="gap-2 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-section">Latest decisions</h2>
                  <Button asChild variant="ghost" size="sm"><Link to="/sentinel/decisions">View all<ArrowRight aria-hidden="true" /></Link></Button>
                </div>
                <p className="text-body text-muted-foreground">{data.stream.length === 0 ? 'No platform decisions yet.' : `${data.stream.length} recent`}</p>
                <p className="border-t pt-3 text-meta text-muted-foreground">{data.needs_review === 0 ? 'No Workers need review.' : `${data.needs_review} Workers need review`} · <Link to="/sentinel/workers" className="underline underline-offset-4 hover:text-foreground">Workers view</Link></p>
              </Card>
            </div>
          </div>
        </>
      )}
    </SentinelLayout>
  )
}
