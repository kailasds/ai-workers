import { Link, useParams, useSearchParams } from 'react-router'
import { ChevronRight, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import type { SentinelDecision } from '@/lib/types/catalog'
import { DIMENSIONS } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'
import { useSentinel } from './use-sentinel'

const ALL = '__all'
const SEVERITIES = ['signal', 'warning', 'restriction', 'stop']
const dimensionName = (k: string) => DIMENSIONS.find((d) => d.key === k)?.name ?? k
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Applied only once the Worker acknowledged it; a shadow decision reads "Would …" and was never sent. */
function Effect({ d }: { d: SentinelDecision }) {
  if (d.applied) return <StatusBadge tone="success">Applied</StatusBadge>
  return <StatusBadge tone="neutral">{d.mode === 'shadow' ? 'Shadow · not sent' : 'Recorded · not applied'}</StatusBadge>
}

export function SentinelDecisionsPage() {
  const sentinel = useSentinel()
  const { data, error, refresh } = sentinel.overview
  const [params, setParams] = useSearchParams()
  // A filter change returns to the first page; paging keeps the filters.
  const set = (k: string, v: string) => setParams((p) => { const n = new URLSearchParams(p); if (v === ALL) n.delete(k); else n.set(k, v); n.delete('page'); return n }, { replace: true, preventScrollReset: true })
  const dimension = params.get('dimension')
  const severity = params.get('severity')
  const effect = params.get('effect')
  const by = params.get('by')
  const all = data?.stream ?? []
  const deciders = [...new Set(all.map((d) => d.decided_by).filter(Boolean) as string[])]
  const shown = all.filter((d) => (!dimension || d.dimension === dimension) && (!severity || d.severity === severity) && (!effect || (effect === 'applied' ? d.applied : !d.applied)) && (!by || d.decided_by === by))
  const filtering = Boolean(dimension || severity || effect || by)
  const paged = usePaged(shown)

  const filters = (
    <div className="flex flex-wrap gap-2">
      <Select value={dimension ?? ALL} onValueChange={(v) => set('dimension', v)}>
        <SelectTrigger className="w-44" aria-label="What it checks"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All checks</SelectItem>{DIMENSIONS.map((d) => <SelectItem key={d.key} value={d.key}>{d.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={severity ?? ALL} onValueChange={(v) => set('severity', v)}>
        <SelectTrigger className="w-40" aria-label="Severity"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All severities</SelectItem>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{cap(s)}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={effect ?? ALL} onValueChange={(v) => set('effect', v)}>
        <SelectTrigger className="w-44" aria-label="Effect"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>Applied or recorded</SelectItem><SelectItem value="applied">Applied</SelectItem><SelectItem value="recorded">Recorded only</SelectItem></SelectContent>
      </Select>
      {deciders.length > 1 && (
        <Select value={by ?? ALL} onValueChange={(v) => set('by', v)}>
          <SelectTrigger className="w-44" aria-label="Decided by"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Anyone</SelectItem>{deciders.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      )}
    </div>
  )

  return (
    <SentinelLayout view="decisions" source={sentinel.source} utilities={data && all.length > 0 ? filters : undefined}>
      {error && !data ? (
        <ErrorState title="Decisions couldn’t be loaded." message={error.message} onRetry={refresh} />
      ) : !data ? (
        <LoadingRegion label="Loading decisions…" className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 bg-track" />)}</LoadingRegion>
      ) : all.length === 0 ? (
        <EmptyState icon={ScrollText} title="No platform decisions yet" description={`Nothing was decided in the last ${data.window_days} days, and the decision record has ${formatCount(data.chain.entries)} entries.${data.mode.acting ? '' : ' The Platform Sentinel isn’t applying decisions yet, so any it makes will show as recorded only.'}`} />
      ) : shown.length === 0 ? (
        <p className="flex flex-wrap items-center gap-2 rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">
          No decisions match these filters.
          {filtering && <Button variant="link" className="h-auto px-0" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
        </p>
      ) : (
        <>
          <Card className="gap-0 py-0">
            <p className="border-b px-5 py-2.5 text-meta text-muted-foreground">Last {data.window_days} days, newest first. “Applied” means the Worker confirmed it acted on the decision.</p>
            <ul className="divide-y">
              {paged.rows.map((d) => (
                <li key={d.id}>
                  <Link to={`/sentinel/decisions/${d.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                    <span className="min-w-0 flex-1">
                      <span className="block text-item">{d.headline}</span>
                      <span className="block text-meta text-muted-foreground">{dimensionName(d.dimension)} · {cap(d.severity)}{d.scope ? ` · ${d.scope}` : ''}</span>
                    </span>
                    <Effect d={d} />
                    <span className="text-meta text-muted-foreground"><Timestamp iso={d.at} /></span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} order="time" label="Decisions" />
        </>
      )}
    </SentinelLayout>
  )
}

export function SentinelDecisionPage() {
  const { decisionId = '' } = useParams()
  const sentinel = useSentinel()
  const { data, error, refresh } = sentinel.overview
  const d = data?.stream.find((x) => x.id === decisionId)
  return (
    <SentinelLayout view="" title={d?.headline ?? 'Decision'} crumbs={[{ label: 'Sentinel', to: '/sentinel' }, { label: 'Decisions', to: '/sentinel/decisions' }, { label: 'Decision' }]}>
      {error && !data ? (
        <ErrorState title="This decision couldn’t be loaded." message={error.message} onRetry={refresh} />
      ) : !data ? (
        <Skeleton className="h-64 bg-track" />
      ) : !d ? (
        <EmptyState icon={ScrollText} title="Decision not found" description="No decision with this ID is in the Platform Sentinel’s record." action={<Button asChild variant="outline"><Link to="/sentinel/decisions">All decisions</Link></Button>} />
      ) : (
        <Card className="gap-0 p-6">
          <FactList>
            <Fact label="Effect"><Effect d={d} /></Fact>
            <Fact label="When"><Timestamp iso={d.at} /></Fact>
            <Fact label="Decided by">{d.decided_by ?? 'Platform Sentinel'}</Fact>
            <Fact label="What it checks">{dimensionName(d.dimension)}</Fact>
            <Fact label="Severity">{cap(d.severity)}</Fact>
            <Fact label="Scope">{d.scope ?? 'Not reported'}</Fact>
            <Fact label="Workers affected">{d.workers === null || d.workers === undefined ? 'Not reported' : formatCount(d.workers)}</Fact>
            <Fact label="Reason">{d.reason ?? 'Reason not reported'}</Fact>
            <Fact label="Evidence">Not reported in this record</Fact>
          </FactList>
          <p className="mt-5 text-meta text-muted-foreground">{d.applied ? 'The affected Worker confirmed it acted on this decision.' : 'No Worker has confirmed acting on this decision. It stays in the record either way.'}</p>
        </Card>
      )}
    </SentinelLayout>
  )
}
