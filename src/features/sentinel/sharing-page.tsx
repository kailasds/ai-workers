import { Link, useSearchParams } from 'react-router'
import { ChevronRight, Inbox, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pager } from '@/components/platform/pager'
import { Panel } from '@/components/platform/panel'
import { SectionNav } from '@/components/platform/section-nav'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDemo } from './demo/store'
import { poolLabel, POOLS, workerLabel } from './demo/platform'
import { BLOCKED, poolStats, stageOf, STAGES, type Blocked, type Stage } from './demo/selectors'
import type { Agreement } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { withParam } from './specs'
import { AgreementPill, WorkerLink } from './ui'

const ALL = '__all'
type StageFilter = Stage | Blocked | 'in_force'
const IN_FORCE: Stage[] = ['agreed', 'delivered', 'used']
const STAGE_OPTIONS: { key: StageFilter; label: string }[] = [
  { key: 'in_force', label: 'In force' },
  ...STAGES.filter((s) => s.key !== 'eligible'),
  ...BLOCKED,
]
const matchesStage = (a: Agreement, f: StageFilter | null) => !f || (f === 'in_force' ? IN_FORCE.includes(stageOf(a) as Stage) : stageOf(a) === f)

const TH = 'px-3 py-2.5 text-right font-medium'
const num = (n: number, tone?: string) => <span className={cn('tabular-nums', n === 0 ? 'text-muted-foreground' : tone)}>{formatCount(n)}</span>

/** Pool sharing: each pool's lifecycle counts, and the items eligible to be offered. */
function PoolsView({ onPool }: { onPool: (key: string) => void }) {
  const s = useDemo()
  const stats = poolStats(s)
  return (
    <>
      <Panel id="pools" title="Worker pools" icon={Users} hue="teal" count={stats.length} flush>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-body">
            <caption className="sr-only">Sharing by Worker pool</caption>
            <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-2.5 font-medium">Pool</th>
                <th scope="col" className={TH}>Eligible</th>
                <th scope="col" className={TH}>Proposed</th>
                <th scope="col" className={TH}>Agreed</th>
                <th scope="col" className={TH}>Delivered</th>
                <th scope="col" className={TH}>Used</th>
                <th scope="col" className={TH}>Suspended</th>
                <th scope="col" className="px-2 py-2.5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.map((p) => (
                <tr key={p.key} className="hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => onPool(p.key)} className="rounded-sm text-left font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{p.label}</button>
                    <span className="block text-meta text-muted-foreground">{p.workerIds.length} {p.workerIds.length === 1 ? 'Worker' : 'Workers'}</span>
                  </td>
                  <td className="px-3 py-3 text-right">{num(p.eligible)}</td>
                  <td className="px-3 py-3 text-right">{num(p.proposed, 'text-warning')}</td>
                  <td className="px-3 py-3 text-right">{num(p.agreed)}</td>
                  <td className="px-3 py-3 text-right">{num(p.delivered)}</td>
                  <td className="px-3 py-3 text-right">{num(p.used)}</td>
                  <td className="px-3 py-3 text-right">{num(p.suspended, 'text-warning')}</td>
                  <td className="px-2 py-3"><button type="button" onClick={() => onPool(p.key)} aria-label={`Agreements in ${p.label}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel id="eligible" title="Eligible, not offered yet" icon={Inbox} hue="blue" count={s.eligible.length} flush>
        {s.eligible.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No items are waiting to be offered.</p> : (
          <ul className="divide-y">
            {[...s.eligible].sort((a, b) => b.since.localeCompare(a.since)).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                <span className="min-w-0 flex-1 text-body">{e.title}<span className="block text-meta text-muted-foreground"><WorkerLink id={e.sourceId} /></span></span>
                <span className="text-meta text-muted-foreground"><Timestamp iso={e.since} /></span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}

/**
 * Knowledge sharing between Workers. Pool sharing shows where sharing can happen; agreements show
 * each Worker-to-Worker relationship. Proposal, agreement, delivery and use are separate stages.
 */
export function SentinelSharingPage() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'pools' ? 'pools' : 'agreements'
  const stage = (STAGE_OPTIONS.find((x) => x.key === params.get('stage'))?.key ?? null) as StageFilter | null
  const pool = params.get('pool')
  const q = params.get('q') ?? ''
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (!v || v === ALL) n.delete(k)
      else n.set(k, v)
      n.delete('page')
      return n
    }, { replace: true, preventScrollReset: true })

  const needle = q.trim().toLowerCase()
  const rows = s.agreements
    .filter((a) => (!pool || a.pool === pool) && matchesStage(a, stage) && (!needle || [workerLabel(a.sourceId), workerLabel(a.targetId), a.item, a.scope].some((x) => x.toLowerCase().includes(needle))))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const paged = usePaged(rows)
  const filtering = Boolean(stage || pool || q)

  return (
    <SentinelLayout view="sharing">
      <SectionNav
        value={view}
        onChange={(v) => setParams(v === 'pools' ? { view: 'pools' } : {}, { replace: true })}
        label="Sharing view"
        items={[
          { value: 'agreements', label: 'Worker-to-Worker agreements', count: s.agreements.length },
          { value: 'pools', label: 'Pool sharing', count: POOLS.length },
        ]}
      />

      {view === 'pools' ? (
        <PoolsView onPool={(key) => setParams({ pool: key }, { replace: true })} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter agreements">
            <InputGroup className="w-full sm:w-64">
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
              <InputGroupInput type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Worker or item" aria-label="Search agreements by Worker or item" />
            </InputGroup>
            <Select value={stage ?? ALL} onValueChange={(v) => set('stage', v)}>
              <SelectTrigger className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={ALL}>Any status</SelectItem>{STAGE_OPTIONS.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={pool ?? ALL} onValueChange={(v) => set('pool', v)}>
              <SelectTrigger className="w-56" aria-label="Pool"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={ALL}>All pools</SelectItem>{POOLS.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
          </div>

          <Panel id="agreements" flush>
            {rows.length === 0 ? (
              <p className="px-5 py-4 text-body text-muted-foreground">{filtering ? 'No agreements match these filters.' : 'No sharing agreements yet.'}</p>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-body">
                  <caption className="sr-only">Worker-to-Worker sharing agreements</caption>
                  <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-2.5 font-medium">Shared item</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">From → to</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                      <th scope="col" className="hidden px-3 py-2.5 text-right font-medium md:table-cell">Received</th>
                      <th scope="col" className="hidden px-3 py-2.5 text-right font-medium md:table-cell">Used</th>
                      <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Last activity</th>
                      <th scope="col" className="px-2 py-2.5"><span className="sr-only">Open</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paged.rows.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <Link to={withParam(params, 'agreement', a.id)} preventScrollReset className="rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{a.item}</Link>
                          <span className="block text-meta text-muted-foreground">{poolLabel(a.pool)}</span>
                        </td>
                        <td className="px-4 py-3 text-meta"><WorkerLink id={a.sourceId} /><span className="text-muted-foreground"> → </span><WorkerLink id={a.targetId} /></td>
                        <td className="px-4 py-3">
                          <AgreementPill status={a.status} />
                        </td>
                        <td className="hidden px-3 py-3 text-right md:table-cell">{num(a.delivered)}</td>
                        <td className="hidden px-3 py-3 text-right md:table-cell">{num(a.used)}</td>
                        <td className="hidden px-4 py-3 text-meta whitespace-nowrap text-muted-foreground lg:table-cell"><Timestamp iso={a.updatedAt} /></td>
                        <td className="px-2 py-3"><Link to={withParam(params, 'agreement', a.id)} preventScrollReset aria-label={`Open ${a.item}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
          {rows.length > 0 && <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Agreements" />}
        </>
      )}
    </SentinelLayout>
  )
}
