import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyValue } from '@/components/platform/copy-value'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { isResolved } from './demo/engine'
import { verifyChain, type ChainResult } from './demo/integrity'
import { WORKERS, workerLabel } from './demo/platform'
import { actions, useDemo } from './demo/store'
import { AUTHORITY_LABEL, OUTCOME_LABEL, TYPE_LABEL } from './demo/selectors'
import type { Decision } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { ActionDialog, AgreementLink, OutcomePill, Section, WorkerLink, type ActionSpec } from './ui'

const ALL = '__all'
const PERIODS = [{ value: '7', days: 7, label: 'Last 7 days' }, { value: '30', days: 30, label: 'Last 30 days' }]

const CHAIN_WORDS: Record<ChainResult['state'], { label: string; tone: 'success' | 'danger' | 'warning' | 'neutral' }> = {
  verified: { label: 'Verified', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  incomplete: { label: 'Incomplete', tone: 'warning' },
  not_available: { label: 'Not available', tone: 'neutral' },
}

/** The integrity check, run on request against this browser's demo records. */
function IntegrityBar() {
  const s = useDemo()
  const [result, setResult] = useState<{ r: ChainResult; at: string; count: number } | null>(null)
  const stale = result && result.count !== s.decisions.length
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-block border bg-card px-4 py-3">
      <ShieldCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-meta">
        {result ? (
          <p aria-live="polite">
            <StatusBadge tone={CHAIN_WORDS[result.r.state].tone}>{CHAIN_WORDS[result.r.state].label}</StatusBadge>{' '}
            {result.r.state === 'verified' ? `All ${result.r.checked} decisions link up and none was altered.` : result.r.failedAt ? `The chain breaks at ${result.r.failedAt}.` : ''} Checked <Timestamp iso={result.at} />{stale ? ' · new decisions since; check again' : ''}.
          </p>
        ) : (
          <p>Integrity chain not checked yet</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => setResult({ r: verifyChain(s.decisions), at: new Date().toISOString(), count: s.decisions.length })}>Verify chain</Button>
    </div>
  )
}

/** Searchable, filterable decision history. Filters live in the URL; changing one returns to page 1. */
export function SentinelDecisionsPage() {
  const s = useDemo()
  // Periods count back from when the page opened.
  const [now] = useState(() => Date.now())
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
  const since = period ? new Date(now - period.days * 86_400_000).toISOString() : null
  const filtered = s.decisions
    .filter((d) => !since || d.at >= since)
    .filter((d) => !get('by') || d.decidedBy.kind === get('by'))
    .filter((d) => !get('type') || d.type === get('type'))
    .filter((d) => !get('outcome') || (get('outcome') === 'pending' ? d.outcome === 'pending' && !isResolved(s, d.id) : d.outcome === get('outcome')))
    .filter((d) => !get('worker') || d.workerIds.includes(get('worker')!))
    .filter((d) => !q || [d.title, d.id, d.reason, ...d.workerIds.map(workerLabel)].some((x) => x.toLowerCase().includes(q)))
    .sort((a, b) => (get('sort') === 'oldest' ? a.seq - b.seq : b.seq - a.seq))
  const paged = usePaged(filtered)
  const filtering = ['q', 'period', 'by', 'type', 'outcome', 'worker'].some((k) => get(k))
  const workerOptions = WORKERS.filter((w) => s.decisions.some((d) => d.workerIds.includes(w.composition_id))).map((w) => w.composition_id).sort((a, b) => workerLabel(a).localeCompare(workerLabel(b)))
  const types = [...new Set(s.decisions.map((d) => d.type))]

  return (
    <SentinelLayout view="decisions">
      <IntegrityBar />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter decisions">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput type="search" value={get('q') ?? ''} onChange={(e) => set('q', e.target.value)} placeholder="Search decisions" aria-label="Search by title, id, reason or Worker" />
        </InputGroup>
        <Select value={get('period') ?? ALL} onValueChange={(v) => set('period', v)}>
          <SelectTrigger className="w-36" aria-label="Period"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All time</SelectItem>{PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={get('by') ?? ALL} onValueChange={(v) => set('by', v)}>
          <SelectTrigger className="w-44" aria-label="Decided by"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Anyone</SelectItem>{Object.entries(AUTHORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={get('type') ?? ALL} onValueChange={(v) => set('type', v)}>
          <SelectTrigger className="w-44" aria-label="Decision type"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All types</SelectItem>{types.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={get('outcome') ?? ALL} onValueChange={(v) => set('outcome', v)}>
          <SelectTrigger className="w-48" aria-label="Outcome"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Any outcome</SelectItem>{(Object.keys(OUTCOME_LABEL) as Decision['outcome'][]).map((o) => <SelectItem key={o} value={o}>{OUTCOME_LABEL[o]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={get('worker') ?? ALL} onValueChange={(v) => set('worker', v)}>
          <SelectTrigger className="w-52" aria-label="Worker"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All Workers</SelectItem>{workerOptions.map((id) => <SelectItem key={id} value={id}>{workerLabel(id)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={get('sort') ?? 'newest'} onValueChange={(v) => set('sort', v === 'newest' ? null : v)}>
          <SelectTrigger className="w-36" aria-label="Sort"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent>
        </Select>
        {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">{filtering ? 'No decisions match these filters.' : 'No decisions recorded yet.'}</p>
      ) : (
        <>
          <Card className="gap-0 overflow-x-auto py-0">
            <table className="w-full text-left text-body">
              <caption className="sr-only">Decision log</caption>
              <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">When</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Decision</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Decided by</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Outcome</th>
                  <th scope="col" className="px-2 py-2.5"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.rows.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 text-meta whitespace-nowrap"><Timestamp iso={d.at} /><span className="block font-mono text-muted-foreground">{d.id}</span></td>
                    <td className="px-4 py-2.5">
                      <Link to={`/sentinel/decisions/${d.id}`} className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{d.title}</Link>
                      <span className="block text-meta text-muted-foreground">{TYPE_LABEL[d.type]} · {d.effect}{d.workerIds.length ? ` · ${d.workerIds.length === 1 ? workerLabel(d.workerIds[0]) : `${d.workerIds.length} Workers`}` : ''}</span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-meta md:table-cell">{AUTHORITY_LABEL[d.decidedBy.kind]}</td>
                    <td className="px-4 py-2.5">{d.outcome === 'pending' && isResolved(s, d.id) ? <StatusBadge tone="neutral">Reviewed</StatusBadge> : <OutcomePill outcome={d.outcome} />}</td>
                    <td className="px-2 py-2.5"><Link to={`/sentinel/decisions/${d.id}`} aria-label={`Open ${d.id}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} order={get('sort') === 'oldest' ? 'ranked' : 'time'} label="Decisions" />
        </>
      )}
    </SentinelLayout>
  )
}

const RECEIPT: Record<Decision['receipts'][number]['status'], string> = { confirmed: 'Confirmed by the Worker', awaiting: 'Waiting for the Worker (not running)', not_needed: 'Nothing to confirm' }

/** One decision: summary, what happened, why, result, affected Workers, evidence, integrity, follow-ups. */
export function SentinelDecisionPage() {
  const { decisionId = '' } = useParams()
  const s = useDemo()
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const d = s.decisions.find((x) => x.id === decisionId)
  const chain = d ? verifyChain(s.decisions).each[d.id] : null
  const related = d ? s.decisions.filter((x) => x.relatedTo === d.id) : []
  const parent = d?.relatedTo ? s.decisions.find((x) => x.id === d.relatedTo) : null
  const agreement = d?.agreementId ? s.agreements.find((a) => a.id === d.agreementId) : null

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
    followUps.push(<Button key="rs" variant="outline" asChild><Link to={`?agreement=${agreement.id}`}>Open agreement to resume</Link></Button>)
  }

  return (
    <SentinelLayout view="" title={d?.title ?? 'Decision not found'} crumbs={[{ label: 'Sentinel', to: '/sentinel' }, { label: 'Decisions', to: '/sentinel/decisions' }, { label: d?.id ?? decisionId }]}>
      {!d ? (
        <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No decision with this id is in the demo record. <Link to="/sentinel/decisions" className="text-primary-strong underline-offset-4 hover:underline">All decisions</Link></p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <Section id="happened" title="What happened"><p className="text-body">{d.summary}</p></Section>
            <Section id="why" title="Why">
              <p className="text-body">{d.reason || 'No reason recorded.'}</p>
              {d.conditions.length > 0 && <ul className="list-disc pl-5 text-meta text-muted-foreground">{d.conditions.map((c) => <li key={c}>{c}</li>)}</ul>}
            </Section>
            <Section id="result" title="Result">
              <p className="text-body">{d.effect}</p>
              <p className="text-meta text-muted-foreground">
                {d.outcome === 'applied' && 'Applied in this simulation. Not enforced on a platform.'}
                {d.outcome === 'recorded' && 'Recorded for monitoring. Sentinel is in recording-only mode, so no control was applied.'}
                {d.outcome === 'pending' && (isResolved(s, d.id) ? 'Reviewed — see the follow-up decision.' : 'Waits for a person to review it. Nothing changes until then.')}
                {d.outcome === 'requested' && 'Requested; it takes effect once the Worker acts on it.'}
                {(d.outcome === 'blocked' || d.outcome === 'failed') && 'This did not take effect.'}
              </p>
            </Section>
            <Section id="affected" title={`Affected Workers (${d.receipts.length})`}>
              {d.receipts.length === 0 ? <p className="text-meta text-muted-foreground">Platform-wide; no single Worker.</p> : (
                <Card className="gap-0 py-0">
                  <ul className="divide-y">
                    {d.receipts.map((r) => (
                      <li key={r.workerId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-body">
                        <WorkerLink id={r.workerId} />
                        <span className="text-meta text-muted-foreground">{RECEIPT[r.status]}{r.customer ? ` · ${r.customer}` : ''} · <Link to={`/sentinel/decisions?worker=${r.workerId}`} className="text-primary-strong underline-offset-4 hover:underline">its decisions</Link></span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </Section>
            <Section id="evidence" title="Evidence">
              {d.evidence.headlines.length + d.evidence.runs.length + d.evidence.refs.length === 0 ? <p className="text-meta text-muted-foreground">No evidence was recorded with this decision.</p> : (
                <FactList>
                  {d.evidence.headlines.length > 0 && <Fact label="Headlines"><ul className="list-disc pl-4">{d.evidence.headlines.map((h) => <li key={h}>{h}</li>)}</ul></Fact>}
                  {d.evidence.runs.length > 0 && <Fact label="Runs"><ul>{d.evidence.runs.map((r) => <li key={r} className="font-mono text-meta">{r}</li>)}</ul></Fact>}
                  {d.evidence.refs.length > 0 && <Fact label="References"><ul>{d.evidence.refs.map((r) => <li key={r} className="font-mono text-meta">{r}</li>)}</ul></Fact>}
                </FactList>
              )}
            </Section>
            <Collapsible className="rounded-block border">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-item outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Integrity details
                <span className="flex items-center gap-2 text-meta text-muted-foreground">{chain ? CHAIN_WORDS[chain].label : 'Not available'}<ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" /></span>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t px-4 py-3">
                {d.integrity ? (
                  <FactList>
                    <Fact label="Hash"><CopyValue value={d.integrity.hash} display={d.integrity.hash} label="hash" /></Fact>
                    <Fact label="Previous hash">{d.integrity.prev ? <CopyValue value={d.integrity.prev} display={d.integrity.prev} label="previous hash" /> : 'None (first decision)'}</Fact>
                    <Fact label="Policy hash"><CopyValue value={d.integrity.policyHash} display={d.integrity.policyHash} label="policy hash" /></Fact>
                    <Fact label="Inputs">{d.integrity.inputs.length ? d.integrity.inputs.join(', ') : 'None'}</Fact>
                    <Fact label="Chain">{chain ? CHAIN_WORDS[chain].label : 'Not available'} · demo hash over this browser’s records</Fact>
                  </FactList>
                ) : <p className="text-meta text-muted-foreground">No integrity data recorded for this decision.</p>}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card className="gap-0 p-5">
              <FactList>
                <Fact label="Outcome">{d.outcome === 'pending' && isResolved(s, d.id) ? <StatusBadge tone="neutral">Reviewed</StatusBadge> : <OutcomePill outcome={d.outcome} />}</Fact>
                <Fact label="Type">{TYPE_LABEL[d.type]}</Fact>
                <Fact label="Decided by">{d.decidedBy.name}</Fact>
                <Fact label="When"><Timestamp iso={d.at} /></Fact>
                <Fact label="Decision ID"><CopyValue value={d.id} display={d.id} label="decision id" /></Fact>
                {agreement && <Fact label="Agreement"><AgreementLink id={agreement.id}>{agreement.item}</AgreementLink></Fact>}
              </FactList>
              {followUps.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">{followUps}</div>}
            </Card>
            {(parent || related.length > 0) && (
              <Card className="gap-2 p-5">
                <p className="text-item font-semibold">Related decisions</p>
                <ul className="flex flex-col gap-1 text-body">
                  {parent && <li>Follows <Link to={`/sentinel/decisions/${parent.id}`} className="text-primary-strong underline-offset-4 hover:underline">{parent.title}</Link></li>}
                  {related.map((r) => <li key={r.id}>Followed by <Link to={`/sentinel/decisions/${r.id}`} className="text-primary-strong underline-offset-4 hover:underline">{r.title}</Link></li>)}
                </ul>
              </Card>
            )}
          </aside>
        </div>
      )}
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelLayout>
  )
}
