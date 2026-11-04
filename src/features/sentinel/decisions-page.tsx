import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, FileSearch, Fingerprint, Lightbulb, Search, ShieldCheck, ShieldX, SlidersHorizontal, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyValue } from '@/components/platform/copy-value'
import { SECTION_SIZE } from '@/components/platform/section-pager'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { Details, Panel } from '@/components/platform/panel'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { usePaged } from '@/hooks/use-paged'
import { isResolved } from './demo/engine'
import type { ChainResult } from './demo/integrity'
import { SNAPSHOT_AT, WORKERS, workerLabel } from './demo/platform'
import { actions, useDemo } from './demo/store'
import { AUTHORITY_LABEL, OUTCOME_LABEL, TYPE_LABEL } from './demo/selectors'
import type { Decision, DemoState } from './demo/types'
import { SentinelLayout, SentinelPage } from './sentinel-layout'
import { useChain } from './specs'
import { ActionDialog, AgreementLink, OutcomePill, WorkerLink, type ActionSpec } from './ui'

const ALL = '__all'
// Periods count back from the snapshot, like Learning, so the seeded record stays in range.
const PERIODS = [{ value: '7', days: 7, label: 'Last 7 days' }, { value: '30', days: 30, label: 'Last 30 days' }]
const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'

const CHAIN_WORDS: Record<ChainResult['state'], { label: string; tone: 'success' | 'danger' | 'warning' | 'neutral' }> = {
  verified: { label: 'Verified', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  incomplete: { label: 'Incomplete', tone: 'warning' },
  not_available: { label: 'Not available', tone: 'neutral' },
}

const reviewed = (s: DemoState, d: Decision) => d.outcome === 'pending' && isResolved(s, d.id)
const StatusOf = ({ s, d }: { s: DemoState; d: Decision }) => (reviewed(s, d) ? <StatusBadge tone="neutral">Reviewed</StatusBadge> : <OutcomePill outcome={d.outcome} />)

/** Whether the record can be trusted: every decision links to the one before and none was altered. */
function IntegrityBar() {
  const chain = useChain()
  const [checkedAt, setCheckedAt] = useState(() => new Date().toISOString())
  const ok = chain.state === 'verified'
  return (
    <div id="integrity" className="flex scroll-mt-24 flex-wrap items-center gap-3 rounded-xl border bg-card px-5 py-3">
      {ok ? <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden="true" /> : <ShieldX className="size-5 shrink-0 text-destructive" aria-hidden="true" />}
      <p className="min-w-0 flex-1 text-body" aria-live="polite">
        <StatusBadge tone={CHAIN_WORDS[chain.state].tone}>Record {CHAIN_WORDS[chain.state].label.toLowerCase()}</StatusBadge>{' '}
        <span className="text-meta text-muted-foreground">
          {ok ? `${chain.checked} decisions, none altered` : chain.failedAt ? `Breaks at ${chain.failedAt}` : 'Some decisions carry no integrity data'} · checked <Timestamp iso={checkedAt} />
        </span>
      </p>
      <Button variant="outline" size="sm" onClick={() => { setCheckedAt(new Date().toISOString()); toast.success(ok ? 'Record verified' : 'Record check failed') }}>Check again</Button>
    </div>
  )
}

/** The governance audit trail: searchable, filterable, newest first. Filters live in the URL. */
export function SentinelDecisionsPage() {
  const s = useDemo()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const get = (k: string) => params.get(k)
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (!v || v === ALL) n.delete(k)
      else n.set(k, v)
      n.delete('page')
      return n
    }, { replace: true, preventScrollReset: true })
  const q = (get('q') ?? '').trim().toLowerCase()
  const period = PERIODS.find((p) => p.value === get('period'))
  const since = period ? new Date(new Date(SNAPSHOT_AT).getTime() - period.days * 86_400_000).toISOString() : null
  const filtered = s.decisions
    .filter((d) => !since || d.at >= since)
    .filter((d) => !get('by') || d.decidedBy.kind === get('by'))
    .filter((d) => !get('type') || d.type === get('type'))
    .filter((d) => !get('outcome') || (get('outcome') === 'pending' ? d.outcome === 'pending' && !isResolved(s, d.id) : d.outcome === get('outcome')))
    .filter((d) => !get('worker') || d.workerIds.includes(get('worker')!))
    .filter((d) => !q || [d.title, d.id, d.reason, d.summary, ...d.workerIds.map(workerLabel)].some((x) => x.toLowerCase().includes(q)))
    .sort((a, b) => (get('sort') === 'oldest' ? a.seq - b.seq : b.seq - a.seq))
  const paged = usePaged(filtered, { defaultSize: SECTION_SIZE, sizes: [SECTION_SIZE] })
  const filtering = ['q', 'period', 'by', 'type', 'outcome', 'worker'].some((k) => get(k))
  // The Filters button counts what is set inside it; the search stays outside.
  const active = ['period', 'by', 'outcome', 'type', 'worker', 'sort'].filter((k) => get(k)).length
  const workerOptions = WORKERS.filter((w) => s.decisions.some((d) => d.workerIds.includes(w.composition_id))).map((w) => w.composition_id).sort((a, b) => workerLabel(a).localeCompare(workerLabel(b)))
  const types = [...new Set(s.decisions.map((d) => d.type))]
  const from = { from: location.pathname + location.search }

  return (
    <SentinelLayout view="decisions">
      <IntegrityBar />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter decisions">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput type="search" value={get('q') ?? ''} onChange={(e) => set('q', e.target.value)} placeholder="Worker or decision" aria-label="Search by Worker, decision, reason or id" />
        </InputGroup>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <SlidersHorizontal aria-hidden="true" />
              Filters
              {active > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 tabular-nums">{active}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="flex w-80 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-period">Period</Label>
              <Select value={get('period') ?? ALL} onValueChange={(v) => set('period', v)}>
                <SelectTrigger id="d-period" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={ALL}>All time</SelectItem>{PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-by">Decided by</Label>
              <Select value={get('by') ?? ALL} onValueChange={(v) => set('by', v)}>
                <SelectTrigger id="d-by" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={ALL}>Anyone</SelectItem>{Object.entries(AUTHORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-outcome">Effect</Label>
              <Select value={get('outcome') ?? ALL} onValueChange={(v) => set('outcome', v)}>
                <SelectTrigger id="d-outcome" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={ALL}>Any effect</SelectItem>{(Object.keys(OUTCOME_LABEL) as Decision['outcome'][]).map((o) => <SelectItem key={o} value={o}>{OUTCOME_LABEL[o]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-type">Decision type</Label>
              <Select value={get('type') ?? ALL} onValueChange={(v) => set('type', v)}>
                <SelectTrigger id="d-type" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={ALL}>All types</SelectItem>{types.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-worker">Worker</Label>
              <Select value={get('worker') ?? ALL} onValueChange={(v) => set('worker', v)}>
                <SelectTrigger id="d-worker" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={ALL}>All Workers</SelectItem>{workerOptions.map((id) => <SelectItem key={id} value={id}>{workerLabel(id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-sort">Order</Label>
              <Select value={get('sort') ?? 'newest'} onValueChange={(v) => set('sort', v === 'newest' ? null : v)}>
                <SelectTrigger id="d-sort" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent>
              </Select>
            </div>
            {active > 0 && <Button variant="ghost" className="self-start" onClick={() => setParams((p) => { const n = new URLSearchParams(); if (p.get('q')) n.set('q', p.get('q')!); return n }, { replace: true })}>Clear filters</Button>}
          </PopoverContent>
        </Popover>
      </div>

      <Panel id="log" flush>
        {filtered.length === 0 ? (
          <p className="px-5 py-4 text-body text-muted-foreground">{filtering ? 'No decisions match these filters.' : 'No decisions recorded yet.'}</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full table-fixed text-left text-body">
              <caption className="sr-only">Decision log</caption>
              <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                <tr>
                  <th scope="col" className="w-44 px-5 py-2.5 font-medium">When</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Decision</th>
                  <th scope="col" className="hidden w-56 px-4 py-2.5 font-medium lg:table-cell">Workers</th>
                  <th scope="col" className="w-52 px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="w-12 px-2 py-2.5"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.rows.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 text-meta whitespace-nowrap text-muted-foreground" title={d.id}><Timestamp iso={d.at} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/sentinel/decisions/${d.id}`} state={from} title={d.title} className="block truncate rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{d.title}</Link>
                    </td>
                    <td className="hidden truncate px-4 py-3 text-meta text-muted-foreground lg:table-cell" title={d.workerIds.map(workerLabel).join(', ')}>{d.workerIds.length === 0 ? 'Platform-wide' : d.workerIds.length === 1 ? workerLabel(d.workerIds[0]).split(' · ').slice(-2).join(' · ') : `${d.workerIds.length} Workers`}</td>
                    <td className="px-4 py-3"><StatusOf s={s} d={d} /></td>
                    <td className="px-2 py-3"><Link to={`/sentinel/decisions/${d.id}`} state={from} aria-label={`Open ${d.id}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {filtered.length > 0 && <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} order={get('sort') === 'oldest' ? 'ranked' : 'time'} label="Decisions" />}
    </SentinelLayout>
  )
}

const RECEIPT: Record<Decision['receipts'][number]['status'], { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  confirmed: { label: 'Confirmed', tone: 'success' },
  awaiting: { label: 'Waiting', tone: 'warning' },
  not_needed: { label: 'Nothing to confirm', tone: 'neutral' },
}

const APPLIED: Record<Decision['outcome'], string> = {
  applied: 'Yes (simulated)',
  recorded: 'No, recorded only',
  pending: 'Not yet',
  requested: 'Requested',
  blocked: 'No, blocked',
  failed: 'No, failed',
}

function receiptSummary(d: Decision) {
  const need = d.receipts.filter((r) => r.status !== 'not_needed')
  if (d.receipts.length === 0) return 'No Worker affected'
  if (need.length === 0) return 'Nothing to confirm'
  return `${need.filter((r) => r.status === 'confirmed').length} of ${need.length} confirmed`
}

/**
 * One decision, read top to bottom: what was decided and its status, why, who it touched, the
 * evidence, then the integrity record folded away for audit.
 */
export function SentinelDecisionPage() {
  const { decisionId = '' } = useParams()
  const location = useLocation()
  const s = useDemo()
  const chain = useChain()
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const d = s.decisions.find((x) => x.id === decisionId)
  const linkState = chain.each[decisionId] ?? 'not_available'
  const followers = d ? s.decisions.filter((x) => x.relatedTo === d.id) : []
  const parent = d?.relatedTo ? s.decisions.find((x) => x.id === d.relatedTo) : null
  const agreement = d?.agreementId ? s.agreements.find((a) => a.id === d.agreementId) : null
  const back = (location.state as { from?: string } | null)?.from ?? '/sentinel/decisions'

  const followUps: React.ReactNode[] = []
  if (d && d.outcome === 'pending' && !isResolved(s, d.id)) {
    const removal = d.type === 'removal_review'
    followUps.push(<Button key="ok" onClick={() => setSpec({ title: removal ? 'Approve removal' : 'Allow the item to keep spreading', consequences: removal ? ['The Worker is asked to remove the item.', 'Runs that already used it are not undone.', 'A new decision is recorded; this one stays as it is.'] : ['Sharing continues under its agreements.', 'A new decision is recorded; this one stays as it is.'], confirmLabel: removal ? 'Approve removal' : 'Allow', run: (r) => actions.reviewDecision(d.id, 'approve', r), done: 'Review recorded' })}>{removal ? 'Approve removal…' : 'Allow spread…'}</Button>)
    followUps.push(<Button key="no" variant="outline" onClick={() => setSpec({ title: removal ? 'Decline removal' : 'Withhold from further sharing', consequences: removal ? ['The item stays with the Worker.', 'The recommendation is closed.'] : ['No new deliveries of this item.', agreement && (agreement.status === 'agreed' || agreement.status === 'active') ? 'Its agreement is suspended.' : 'Its agreement is not active, so nothing else changes.'], confirmLabel: removal ? 'Decline' : 'Withhold', run: (r) => actions.reviewDecision(d.id, 'reject', r), done: 'Review recorded' })}>{removal ? 'Decline…' : 'Withhold…'}</Button>)
  }
  if (d?.type === 'stop' && d.workerIds[0] && s.workers[d.workerIds[0]]?.stopDecisionId === d.id) {
    const wid = d.workerIds[0]
    followUps.push(<Button key="resume" onClick={() => setSpec({ title: `Resume ${workerLabel(wid)}`, consequences: ['The stop is lifted; the Worker may run again.', 'A new “Resume” decision is recorded, linked to this one.'], confirmLabel: 'Resume Worker', run: (r) => actions.resumeWorker(wid, r), done: 'Worker resumed' })}>Resume Worker…</Button>)
  }
  if (d?.type === 'suspend' && agreement?.status === 'suspended' && agreement.decisionIds.at(-1) === d.id) {
    followUps.push(<Button key="rs" variant="outline" asChild><Link to={`?agreement=${agreement.id}`} state={location.state} preventScrollReset>Open agreement to resume</Link></Button>)
  }
  const evidenceCount = d ? d.evidence.headlines.length + d.evidence.runs.length + d.evidence.refs.length : 0

  return (
    <SentinelPage title={d?.title ?? 'Decision not found'} crumbs={[{ label: 'Sentinel', to: '/sentinel' }, { label: 'Decision log', to: back }, { label: d?.id ?? decisionId }]}>
      {!d ? (
        <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No decision with this id is in the demo record. <Link to="/sentinel/decisions" className={LINK}>Decision log</Link></p>
      ) : (
        <div className="flex flex-col gap-5">
          <section aria-label="Decision summary" className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusOf s={s} d={d} />
              <span className="text-meta text-muted-foreground">{TYPE_LABEL[d.type]}</span>
            </div>
            <p className="mt-3 text-body">{d.summary}</p>
            <div className="mt-5 border-t pt-5">
              <Details
                rows={[
                  { label: 'Decided by', value: <>{AUTHORITY_LABEL[d.decidedBy.kind]}{d.decidedBy.name !== AUTHORITY_LABEL[d.decidedBy.kind] && <span className="block text-meta text-muted-foreground">{d.decidedBy.name}</span>}</> },
                  { label: 'When', value: <Timestamp iso={d.at} /> },
                  { label: 'Affected Workers', value: d.workerIds.length === 0 ? 'Platform-wide' : d.workerIds.map((w, i) => <span key={w}>{i > 0 && ', '}<WorkerLink id={w} /></span>) },
                  { label: 'Applied', value: reviewed(s, d) ? 'Reviewed' : APPLIED[d.outcome] },
                  { label: 'Worker receipt', value: receiptSummary(d) },
                  { label: 'Decision ID', value: <CopyValue value={d.id} display={d.id} label="decision id" /> },
                  ...(agreement ? [{ label: 'Agreement', value: <AgreementLink id={agreement.id} className="text-primary-strong">{agreement.item}</AgreementLink> }] : []),
                ]}
              />
            </div>
            {followUps.length > 0 && <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">{followUps}</div>}
          </section>

          <div className={parent || followers.length > 0 ? 'grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]' : 'flex flex-col gap-5'}>
            <div className="flex min-w-0 flex-col gap-5">
              <Panel id="reasoning" title="Reasoning" icon={Lightbulb} hue="amber">
                <dl className="flex flex-col gap-4">
                  <div><dt className="text-meta text-muted-foreground">Why</dt><dd className="mt-0.5 text-body">{d.reason || 'No reason recorded.'}</dd></div>
                  <div><dt className="text-meta text-muted-foreground">Outcome</dt><dd className="mt-0.5 text-body">{d.effect}</dd></div>
                  {d.conditions.length > 0 && (
                    <div>
                      <dt className="text-meta text-muted-foreground">Conditions</dt>
                      <dd className="mt-0.5 text-body"><ul className="list-disc pl-5">{d.conditions.map((c) => <li key={c}>{c}</li>)}</ul></dd>
                    </div>
                  )}
                </dl>
              </Panel>

              <Panel id="impact" title="Impact" icon={Users} hue="blue" count={d.receipts.length} flush>
                {d.receipts.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">Platform-wide; no single Worker.</p> : (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-left text-body">
                      <caption className="sr-only">Affected Workers</caption>
                      <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-5 py-2.5 font-medium">Worker</th>
                          <th scope="col" className="px-4 py-2.5 font-medium">Receipt</th>
                          <th scope="col" className="px-4 py-2.5"><span className="sr-only">History</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {d.receipts.map((r) => (
                          <tr key={r.workerId}>
                            <td className="min-w-48 px-5 py-3"><WorkerLink id={r.workerId} className="font-medium" />{r.customer && <span className="block text-meta text-muted-foreground">{r.customer}</span>}</td>
                            <td className="px-4 py-3"><StatusBadge tone={RECEIPT[r.status].tone}>{RECEIPT[r.status].label}</StatusBadge></td>
                            <td className="px-4 py-3 text-right text-meta"><Link to={`/sentinel/decisions?worker=${r.workerId}`} className={LINK}>Its decisions</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              <Panel id="evidence" title="Evidence" icon={FileSearch} hue="teal" count={evidenceCount}>
                {evidenceCount === 0 ? <p className="text-body text-muted-foreground">No evidence was recorded with this decision.</p> : (
                  <FactList>
                    {d.evidence.headlines.length > 0 && <Fact label="Recorded headline">{d.evidence.headlines.length === 1 ? d.evidence.headlines[0] : <ul className="list-disc pl-4">{d.evidence.headlines.map((h) => <li key={h}>{h}</li>)}</ul>}</Fact>}
                    {d.evidence.runs.length > 0 && <Fact label="Supporting runs"><ul>{d.evidence.runs.map((r) => <li key={r} className="font-mono text-meta">{r}</li>)}</ul></Fact>}
                    {d.evidence.refs.length > 0 && <Fact label="Related evidence"><ul>{d.evidence.refs.map((r) => <li key={r} className="font-mono text-meta">{r}</li>)}</ul></Fact>}
                  </FactList>
                )}
              </Panel>

              <Collapsible className="rounded-xl border bg-card">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-xl px-5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center gap-3 text-item"><Fingerprint className="size-5 text-muted-foreground" aria-hidden="true" />Technical integrity</span>
                  <span className="flex items-center gap-2 text-meta text-muted-foreground"><StatusBadge tone={CHAIN_WORDS[linkState].tone}>{CHAIN_WORDS[linkState].label}</StatusBadge><ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" /></span>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t px-5 py-4">
                  {d.integrity ? (
                    <FactList>
                      <Fact label="Hash"><CopyValue value={d.integrity.hash} display={d.integrity.hash} label="hash" /></Fact>
                      <Fact label="Previous hash">{d.integrity.prev ? <CopyValue value={d.integrity.prev} display={d.integrity.prev} label="previous hash" /> : 'None (first decision)'}</Fact>
                      <Fact label="Policy hash"><CopyValue value={d.integrity.policyHash} display={d.integrity.policyHash} label="policy hash" /></Fact>
                      <Fact label="Inputs">{d.integrity.inputs.length ? <ul>{d.integrity.inputs.map((i) => <li key={i} className="font-mono text-meta">{i}</li>)}</ul> : 'None'}</Fact>
                      <Fact label="Chain">{CHAIN_WORDS[linkState].label} · {chain.checked} decisions checked</Fact>
                    </FactList>
                  ) : <p className="text-meta text-muted-foreground">No integrity data recorded for this decision.</p>}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {(parent || followers.length > 0) && (
              <aside className="xl:sticky xl:top-6">
                <Panel id="related" title="Related decisions" icon={ShieldCheck} hue="blue" count={(parent ? 1 : 0) + followers.length}>
                  <ul className="flex flex-col gap-3 text-body">
                    {parent && <li><span className="text-meta text-muted-foreground">Follows</span><Link to={`/sentinel/decisions/${parent.id}`} state={location.state} className={`block ${LINK}`}>{parent.title}</Link></li>}
                    {followers.map((r) => <li key={r.id}><span className="text-meta text-muted-foreground">Followed by</span><Link to={`/sentinel/decisions/${r.id}`} state={location.state} className={`block ${LINK}`}>{r.title}</Link></li>)}
                  </ul>
                </Panel>
              </aside>
            )}
          </div>
        </div>
      )}
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelPage>
  )
}
