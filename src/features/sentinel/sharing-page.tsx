import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pager } from '@/components/platform/pager'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { cn } from '@/lib/utils'
import { useDemo } from './demo/store'
import { poolLabel, POOLS, workerLabel } from './demo/platform'
import { BLOCKED, poolStats, sharingCounts, stageOf, STAGES, type Blocked, type Stage } from './demo/selectors'
import { SentinelLayout } from './sentinel-layout'
import { AgreementLink, AgreementPill, Section, WorkerLink } from './ui'

const ALL = '__all'

/**
 * Knowledge sharing between Workers: the lifecycle (each stage filters the list), sharing by pool,
 * and the agreements. Blocked agreements are counted on their own, never in the normal path.
 */
export function SentinelSharingPage() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const stage = ([...STAGES, ...BLOCKED].find((x) => x.key === params.get('stage'))?.key ?? null) as Stage | Blocked | null
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

  const counts = sharingCounts(s, pool)
  const needle = q.trim().toLowerCase()
  const matchesWorker = (...ids: string[]) => !needle || ids.some((id) => workerLabel(id).toLowerCase().includes(needle) || id.startsWith(needle))
  const rows = s.agreements
    .filter((a) => (!pool || a.pool === pool) && (!stage || stage === 'eligible' || stageOf(a) === stage) && (matchesWorker(a.sourceId, a.targetId) || a.item.toLowerCase().includes(needle)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const eligible = s.eligible.filter((e) => (!pool || e.pool === pool) && (matchesWorker(e.sourceId) || e.title.toLowerCase().includes(needle)))
  const paged = usePaged(stage === 'eligible' ? [] : rows)
  const filtering = Boolean(stage || pool || q)

  const stageButton = (key: Stage | Blocked, label: string, n: number, meaning: string) => (
    <button
      key={key}
      type="button"
      aria-pressed={stage === key}
      onClick={() => set('stage', stage === key ? null : key)}
      title={meaning}
      className={cn('flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-block border bg-card px-3 py-2.5 text-left outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50', stage === key && 'border-primary bg-primary-soft hover:border-primary')}
    >
      <span className="text-meta text-muted-foreground">{label}</span>
      <span className="text-item tabular-nums">{n}</span>
    </button>
  )

  return (
    <SentinelLayout view="sharing">
      <Section id="lifecycle" title="Sharing lifecycle">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
          <div className="grid flex-[5] grid-cols-2 gap-2 sm:grid-cols-5">
            {STAGES.map((st) => stageButton(st.key, st.label, counts[st.key], st.meaning))}
          </div>
          <div className="grid flex-[3] grid-cols-3 gap-2 lg:border-l lg:pl-2">
            {BLOCKED.map((b) => stageButton(b.key, b.label, counts[b.key], b.meaning))}
          </div>
        </div>
      </Section>

      <Section id="pools" title="By pool">
        <Card className="gap-0 overflow-x-auto py-0">
          <table className="w-full text-left text-body">
            <caption className="sr-only">Sharing by pool</caption>
            <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Pool</th>
                {['Eligible', 'Proposed', 'Agreed', 'Delivered', 'Used', 'Suspended'].map((h) => <th key={h} scope="col" className="px-3 py-2.5 text-right font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {poolStats(s).map((p) => (
                <tr key={p.key} className={cn('hover:bg-muted/40', pool === p.key && 'bg-primary-soft')}>
                  <td className="px-4 py-2.5">
                    <button type="button" aria-pressed={pool === p.key} onClick={() => set('pool', pool === p.key ? null : p.key)} className="rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                      {p.label}<span className="block text-meta text-muted-foreground">{p.workerIds.length} {p.workerIds.length === 1 ? 'Worker' : 'Workers'}{p.workerIds.length < s.policy.minIndependentWorkers ? ' · too few to share' : ''}</span>
                    </button>
                  </td>
                  {[p.eligible, p.proposed, p.agreed, p.delivered, p.used, p.suspended].map((n, i) => <td key={i} className="px-3 py-2.5 text-right tabular-nums">{n || <span className="text-muted-foreground">0</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section
        id="agreements"
        title={stage === 'eligible' ? `Eligible items (${eligible.length})` : `Agreements (${rows.length})`}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-56">
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
              <InputGroupInput type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Worker or item" aria-label="Search by Worker or item" />
            </InputGroup>
            <Select value={pool ?? ALL} onValueChange={(v) => set('pool', v)}>
              <SelectTrigger className="w-52" aria-label="Pool"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={ALL}>All pools</SelectItem>{POOLS.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear</Button>}
          </div>
        }
      >
        {stage === 'eligible' ? (
          eligible.length === 0 ? <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No eligible items match.</p> : (
            <Card className="gap-0 py-0">
              <ul className="divide-y">
                {eligible.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                    <span className="min-w-0 text-body">{e.title}<span className="block text-meta text-muted-foreground"><WorkerLink id={e.sourceId} /> · {poolLabel(e.pool)}</span></span>
                    <span className="text-meta text-muted-foreground">Since <Timestamp iso={e.since} /></span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        ) : rows.length === 0 ? (
          <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">{filtering ? 'No agreements match these filters.' : 'No sharing agreements yet.'}</p>
        ) : (
          <>
            <Card className="gap-0 overflow-x-auto py-0">
              <table className="w-full text-left text-body">
                <caption className="sr-only">Worker-to-Worker sharing agreements</caption>
                <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Item</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">From → to</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                    <th scope="col" className="hidden px-3 py-2.5 text-right font-medium md:table-cell">Received</th>
                    <th scope="col" className="hidden px-3 py-2.5 text-right font-medium md:table-cell">Used</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paged.rows.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/40">
                      <td className="px-4 py-2.5"><AgreementLink id={a.id} className="font-medium">{a.item}</AgreementLink><span className="block text-meta text-muted-foreground">{poolLabel(a.pool)}</span></td>
                      <td className="px-4 py-2.5 text-meta"><WorkerLink id={a.sourceId} /><span className="text-muted-foreground"> → </span><WorkerLink id={a.targetId} /></td>
                      <td className="px-4 py-2.5"><AgreementPill status={a.status} />{a.reason && a.status !== 'rejected' && <span className="mt-1 block max-w-56 truncate text-meta text-muted-foreground" title={a.reason}>{a.reason}</span>}</td>
                      <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{a.delivered}</td>
                      <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{a.used}</td>
                      <td className="hidden px-4 py-2.5 text-meta lg:table-cell"><Timestamp iso={a.updatedAt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Agreements" />
          </>
        )}
      </Section>
    </SentinelLayout>
  )
}
