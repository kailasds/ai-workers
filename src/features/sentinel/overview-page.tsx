import { Link } from 'react-router'
import { ChevronRight, CircleAlert, OctagonPause, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import type { PlatformSentinelOverview } from '@/lib/types/catalog'
import { ATTENTION_KIND, DIMENSIONS, openPhrase, type AttentionItem } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'
import { useSentinel } from './use-sentinel'

const ROW_LINK = 'flex items-center gap-4 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

function AttentionRow({ a }: { a: AttentionItem }) {
  const Icon = a.kind === 'restriction' ? OctagonPause : CircleAlert
  return (
    <li className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-meta font-medium text-muted-foreground">{ATTENTION_KIND[a.kind]}</p>
        <p className="text-item">{a.title}</p>
        {a.worker && (
          <p className="text-meta">
            <Link to={`/workers/${a.worker.id}`} className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{a.worker.name}</Link>
            <span className="ml-1.5 font-mono text-muted-foreground">{a.worker.id.slice(0, 8)}</span>
          </p>
        )}
        {a.detail && <p className="text-meta text-muted-foreground">Reported: {a.detail}</p>}
        <p className="mt-1 text-meta"><span className="text-muted-foreground">Impact: </span>{a.consequence}</p>
      </div>
      {a.actions.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {a.actions.map((x, i) => <Button key={x.to} asChild variant={i === 0 ? 'outline' : 'ghost'} size="sm"><Link to={x.to}>{x.label}</Link></Button>)}
        </div>
      )}
    </li>
  )
}

/** One line per area, each a fact and a destination; nothing here repeats the attention list. */
function StatusList({ o, monitoringIssues }: { o: PlatformSentinelOverview; monitoringIssues: number }) {
  const decisions = o.stream.length
  const rows = [
    { label: 'Monitoring', value: o.coverage.running === 0 ? 'No Workers are running' : `${formatCount(o.coverage.reporting)} of ${formatCount(o.coverage.running)} running Workers report`, note: monitoringIssues ? `${monitoringIssues} to look at` : null, to: '/sentinel/workers' },
    { label: 'Stops and restrictions', value: o.in_force.length === 0 ? 'None in force' : `${formatCount(o.in_force.length)} in force`, note: o.mode.acting ? null : 'Sentinel isn’t applying decisions yet', to: '/sentinel/control' },
    { label: 'Sharing between Workers', value: 'Not switched on', note: 'No agreements or suspensions', to: '/sentinel/sharing' },
    { label: `Decisions, last ${o.window_days} days`, value: decisions === 0 ? 'None recorded' : `${formatCount(decisions)} recorded`, note: decisions ? `${formatCount(o.stream.filter((d) => d.applied).length)} applied` : null, to: '/sentinel/decisions' },
  ]
  return (
    <Card className="gap-0 py-0">
      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.label}>
            <Link to={r.to} className={ROW_LINK}>
              <span className="w-44 shrink-0 text-meta text-muted-foreground">{r.label}</span>
              <span className="min-w-0 flex-1 text-body">{r.value}{r.note && <span className="text-meta text-muted-foreground"> · {r.note}</span>}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/**
 * The Platform Sentinel, decision first: what needs attention and its impact, then one status
 * line per area, then recent decisions, how the Sentinel is set up, and what it checks.
 */
export function SentinelOverviewPage() {
  const s = useSentinel()
  const o = s.overview.data
  return (
    <SentinelLayout view="overview" source={s.source}>
      {s.overview.error && !o ? (
        <ErrorState title="The Platform Sentinel couldn’t be loaded." message={s.overview.error.message} onRetry={s.overview.refresh} />
      ) : !o ? (
        <LoadingRegion label="Loading the Platform Sentinel…" className="flex flex-col gap-4"><Skeleton className="h-40 bg-track" /><Skeleton className="h-64 bg-track" /></LoadingRegion>
      ) : (
        <>
          <section aria-labelledby="attention-title" className="flex flex-col gap-3">
            <h2 id="attention-title" className="text-section">Needs attention {s.attention.length > 0 && <span className="text-muted-foreground tabular-nums">{s.attention.length}</span>}</h2>
            <Card className="gap-0 py-0">
              {s.attention.length === 0 ? (
                <p className="flex items-center gap-2 px-5 py-4 text-body"><ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />Nothing needs attention. No reviews are pending, nothing is restricted, and every running Worker reports.</p>
              ) : (
                <ul className="divide-y">{s.attention.map((a) => <AttentionRow key={a.key} a={a} />)}</ul>
              )}
              {s.fleet.error && !s.fleet.data && <p className="border-t px-5 py-3 text-meta text-warning">Per-Worker reporting couldn’t be read, so monitoring issues may be missing here.</p>}
            </Card>
          </section>

          <section aria-labelledby="status-title" className="flex flex-col gap-3">
            <h2 id="status-title" className="text-section">Status</h2>
            <StatusList o={o} monitoringIssues={s.attention.filter((a) => a.kind === 'monitoring').length} />
          </section>

          {o.stream.length > 0 && (
            <section aria-labelledby="recent-title" className="flex flex-col gap-3">
              <h2 id="recent-title" className="text-section">Recent decisions</h2>
              <Card className="gap-0 py-0">
                <ul className="divide-y">
                  {o.stream.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link to={`/sentinel/decisions/${d.id}`} className={ROW_LINK}>
                        <span className="min-w-0 flex-1 truncate text-body">{d.headline}</span>
                        <span className="text-meta text-muted-foreground">{d.applied ? 'Applied' : 'Recorded only'}</span>
                        <span className="text-meta text-muted-foreground"><Timestamp iso={d.at} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          <section aria-labelledby="setup-title" className="flex flex-col gap-3">
            <h2 id="setup-title" className="text-section">How it’s set up</h2>
            <Card className="gap-0 py-0">
              <dl className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-5"><dt className="text-meta text-muted-foreground">Decides</dt><dd className="mt-1 text-item">{o.mode.set ? (o.mode.set === 'shadow' ? 'In shadow mode' : 'Enforcing') : 'Mode not set'}</dd></div>
                <div className="p-5"><dt className="text-meta text-muted-foreground">Applies its decisions</dt><dd className="mt-1 text-item">{o.mode.acting ? 'Yes' : 'No'}</dd>{o.mode.why && <dd className="mt-0.5 text-meta text-muted-foreground">{o.mode.why}</dd>}</div>
                <div className="p-5"><dt className="text-meta text-muted-foreground">Decision record</dt><dd className="mt-1 text-item">{o.chain.verified === null ? 'Not checked yet' : o.chain.verified ? 'Intact' : 'Broken'}</dd><dd className="mt-0.5 text-meta text-muted-foreground">{formatCount(o.chain.entries)} entries{o.chain.broken_at ? ` · broken at ${o.chain.broken_at}` : ''}</dd></div>
              </dl>
            </Card>
          </section>

          <section aria-labelledby="checks-title" className="flex flex-col gap-3">
            <h2 id="checks-title" className="text-section">What it checks</h2>
            <Card className="gap-0 py-0">
              <ul className="divide-y">
                {DIMENSIONS.map((d) => {
                  const dim = o.dimensions.find((x) => x.key === d.key)
                  return (
                    <li key={d.key}>
                      <Link to={`/sentinel/${d.key}`} className={ROW_LINK}>
                        <span className="min-w-0 flex-1">
                          <span className="block text-item">{d.name}</span>
                          <span className="block text-meta text-muted-foreground">{d.question}</span>
                        </span>
                        <span className="text-right text-meta">
                          <span className="block font-medium">{dim ? (dim.built ? openPhrase(dim.open) : 'Not built yet') : 'Not reported'}</span>
                          <span className="block text-muted-foreground">{dim?.last ? dim.last.title : 'Nothing recorded yet'}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </section>
        </>
      )}
    </SentinelLayout>
  )
}
