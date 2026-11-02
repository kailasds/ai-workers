import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, OctagonX, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Timestamp } from '@/components/platform/timestamp'
import { contextOf } from '@/features/compose/compose-model'
import { formatCount } from '@/lib/format'
import { actions, useDemo } from './demo/store'
import { resumeBlocker } from './demo/engine'
import { poolLabel, shortId, WORKER_BY_ID, workerLabel } from './demo/platform'
import { decisionsFor, findings, FINDING_LABEL, operational, overrideText } from './demo/selectors'
import { OVERRIDE_LABELS } from './demo/engine'
import { ActionDialog, AgreementLink, AgreementPill, OperationalPill, OutcomePill, WorkerLink, type ActionSpec } from './ui'

const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'

function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 text-item font-semibold first:mt-0">{children}</h3>
}

function closeParam(params: URLSearchParams, key: string) {
  const n = new URLSearchParams(params)
  n.delete(key)
  return n
}

/** A Worker's governance in one place: state, restrictions, decisions, sharing, findings, actions. */
export function WorkerSheet() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const id = params.get('worker')
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const w = id ? WORKER_BY_ID.get(id) : undefined
  const close = () => setParams(closeParam(params, 'worker'), { replace: true, preventScrollReset: true })
  if (!id) return null
  const op = w ? operational(s, id) : null
  const controls = s.controls.filter((c) => c.active && c.workerIds.includes(id))
  const decisions = decisionsFor(s, id).slice(-5).reverse()
  const agreements = s.agreements.filter((a) => a.sourceId === id || a.targetId === id)
  const own = s.overrides.filter((o) => o.workerId === id)
  const found = findings(s).filter((f) => f.workerId === id)

  return (
    <DetailSheet
      open
      onClose={close}
      width="2xl"
      title={w ? workerLabel(id) : 'Worker not found'}
      description={w ? `${contextOf(w.bounded_context.key)?.scope ?? w.bounded_context.label} · r${w.revision} · ${shortId(id)}` : undefined}
      footer={
        w && (
          <>
            <Button asChild variant="outline"><Link to={`/workers/${id}`}>Registry</Link></Button>
            <Button asChild variant="ghost"><Link to={`/learning/workers/${id}`}>Learning</Link></Button>
            {op === 'stopped' ? (
              <Button className="ml-auto" onClick={() => setSpec({ title: `Resume ${workerLabel(id)}`, consequences: ['The stop is lifted and the Worker may start runs again.', 'Sharing agreements suspended because of the stop stay suspended; resume them one by one.'], confirmLabel: 'Resume Worker', run: (r) => actions.resumeWorker(id, r), done: 'Worker resumed' })}><Play aria-hidden="true" />Resume…</Button>
            ) : (
              <Button variant="outline" className="ml-auto" onClick={() => setSpec({ title: `Stop ${workerLabel(id)}`, consequences: ['The Worker may not start new runs until resumed.', s.policy.suspendSharingOnStop ? `Its agreed and active sharing agreements (${agreements.filter((a) => a.status === 'agreed' || a.status === 'active').length}) are suspended, as platform policy says.` : 'Its sharing agreements are not changed (platform policy).', 'A stop control is added and shows in Policy.'], confirmLabel: 'Stop Worker', destructive: true, run: (r) => actions.stopWorker(id, r), done: 'Worker stopped' })}><OctagonX aria-hidden="true" />Stop…</Button>
            )}
          </>
        )
      }
    >
      {!w ? (
        <p className="text-body text-muted-foreground">No Worker with this id is in the platform snapshot.</p>
      ) : (
        <div>
          <FactList>
            <Fact label="State"><OperationalPill op={op!} /></Fact>
            <Fact label="Worker Sentinel">{w.sentinel.state === 'CONFIGURED' ? 'Composed with one' : 'Not composed'}</Fact>
            <Fact label="Learning">{formatCount(w.learning.memories)} memory records from {formatCount(w.learning.runs)} runs · <Link to={`/learning/workers/${id}`} className={LINK}>open</Link></Fact>
          </FactList>

          <SubHead>Restrictions in force</SubHead>
          {controls.length === 0 ? <p className="text-meta text-muted-foreground">None.</p> : (
            <ul className="divide-y rounded-block border">{controls.map((c) => <li key={c.id} className="px-3 py-2.5 text-body">{c.title}<span className="block text-meta text-muted-foreground">{c.reason} · since <Timestamp iso={c.since} />{c.decisionId && <> · <Link to={`/sentinel/decisions/${c.decisionId}`} className={LINK}>{c.decisionId}</Link></>}</span></li>)}</ul>
          )}

          <SubHead>Own settings</SubHead>
          {own.length === 0 ? <p className="text-meta text-muted-foreground">None. It follows the platform defaults.</p> : (
            <ul className="divide-y rounded-block border">{own.map((o) => <li key={o.field} className="flex flex-wrap justify-between gap-2 px-3 py-2.5 text-body">{OVERRIDE_LABELS[o.field]}<span>{overrideText(o.field, o.value)}</span></li>)}</ul>
          )}

          <SubHead>Sharing agreements</SubHead>
          {agreements.length === 0 ? <p className="text-meta text-muted-foreground">None.</p> : (
            <ul className="divide-y rounded-block border">
              {agreements.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <span className="min-w-0 text-body"><AgreementLink id={a.id}>{a.item}</AgreementLink><span className="block text-meta text-muted-foreground">{a.sourceId === id ? `Gives to ${workerLabel(a.targetId)}` : `Receives from ${workerLabel(a.sourceId)}`}</span></span>
                  <AgreementPill status={a.status} />
                </li>
              ))}
            </ul>
          )}

          <SubHead>Monitoring findings</SubHead>
          {found.length === 0 ? <p className="text-meta text-muted-foreground">None.</p> : (
            <ul className="divide-y rounded-block border">{found.map((f) => <li key={f.id} className="px-3 py-2.5 text-body">{FINDING_LABEL[f.kind]}: {f.title}<span className="block text-meta text-muted-foreground">{f.period} · {f.source === 'snapshot' ? 'from snapshot runs' : 'demo finding'}</span></li>)}</ul>
          )}

          <SubHead>Recent decisions</SubHead>
          {decisions.length === 0 ? <p className="text-meta text-muted-foreground">None.</p> : (
            <ul className="divide-y rounded-block border">
              {decisions.map((d) => (
                <li key={d.id}>
                  <Link to={`/sentinel/decisions/${d.id}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="min-w-0 text-body">{d.title}<span className="block text-meta text-muted-foreground"><Timestamp iso={d.at} /></span></span>
                    <OutcomePill outcome={d.outcome} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/sentinel/decisions?worker=${id}`} className={`mt-2 inline-flex items-center gap-1 text-meta ${LINK}`}>All decisions for this Worker<ArrowRight className="size-3.5" aria-hidden="true" /></Link>
        </div>
      )}
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </DetailSheet>
  )
}

/** One sharing agreement: who, what, approvals, delivery, use, why it's blocked, and its actions. */
export function AgreementSheet() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const id = params.get('agreement')
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  if (!id) return null
  const a = s.agreements.find((x) => x.id === id)
  const close = () => setParams(closeParam(params, 'agreement'), { replace: true, preventScrollReset: true })
  const history = a ? a.decisionIds.map((d) => s.decisions.find((x) => x.id === d)).filter(Boolean) : []
  const blocker = a ? resumeBlocker(s, a) : null
  const approval = (v: string) => (v === 'approved' ? 'Approved' : v === 'rejected' ? 'Rejected' : 'Waiting')

  const actionsFor = () => {
    if (!a) return null
    const btns: React.ReactNode[] = []
    if (a.status === 'proposed') {
      btns.push(<Button key="ap" onClick={() => setSpec({ title: `Approve sharing: ${a.item}`, consequences: [`${workerLabel(a.targetId)} may receive “${a.item}”.`, 'Both sides are marked approved. Nothing is delivered by approving.'], confirmLabel: 'Approve', run: (r) => actions.approveAgreement(a.id, r), done: 'Sharing approved' })}>Approve…</Button>)
      btns.push(<Button key="rj" variant="outline" onClick={() => setSpec({ title: `Reject sharing: ${a.item}`, consequences: ['The proposal is closed. Nothing is sent.', 'It stays in the history.'], confirmLabel: 'Reject', destructive: true, run: (r) => actions.rejectAgreement(a.id, r), done: 'Sharing rejected' })}>Reject…</Button>)
    }
    if (a.status === 'agreed' || a.status === 'active') btns.push(<Button key="su" variant="outline" onClick={() => setSpec({ title: `Suspend sharing: ${a.item}`, consequences: ['No further deliveries until resumed.', `Items already delivered (${a.delivered}) stay with the receiving Worker.`, 'A sharing restriction is added and shows in Policy.'], confirmLabel: 'Suspend', run: (r) => actions.suspendAgreement(a.id, r), done: 'Sharing suspended' })}>Suspend…</Button>)
    if (a.status === 'suspended') btns.push(<Button key="re" disabled={Boolean(blocker)} title={blocker ?? undefined} onClick={() => setSpec({ title: `Resume sharing: ${a.item}`, consequences: ['Deliveries may continue.', 'The sharing restriction is lifted.'], confirmLabel: 'Resume', run: (r) => actions.resumeAgreement(a.id, r), done: 'Sharing resumed' })}>Resume…</Button>)
    if (['agreed', 'active', 'suspended'].includes(a.status)) btns.push(<Button key="rv" variant="ghost" className="text-destructive" onClick={() => setSpec({ title: `Revoke sharing: ${a.item}`, consequences: ['The agreement ends for good and can’t be resumed.', 'Items already delivered are not taken back automatically.'], confirmLabel: 'Revoke', destructive: true, run: (r) => actions.revokeAgreement(a.id, r), done: 'Sharing revoked' })}>Revoke…</Button>)
    return btns
  }

  return (
    <DetailSheet open onClose={close} width="2xl" title={a ? a.item : 'Agreement not found'} description={a ? `${poolLabel(a.pool)} · ${a.id}` : undefined} footer={a && actionsFor()?.length ? <div className="flex w-full flex-wrap gap-2">{actionsFor()}</div> : undefined}>
      {!a ? (
        <p className="text-body text-muted-foreground">No agreement with this id is in the demo data.</p>
      ) : (
        <div>
          <div className="rounded-block bg-muted p-3">
            <AgreementPill status={a.status} />
            {a.status === 'suspended' && blocker && <p className="mt-1 text-meta text-warning">Can’t resume yet: {blocker}</p>}
          </div>
          <FactList className="mt-4">
            <Fact label="Gives">{<WorkerLink id={a.sourceId} />}</Fact>
            <Fact label="Receives">{<WorkerLink id={a.targetId} />}</Fact>
            <Fact label="What is shared">{a.item}<span className="block text-meta text-muted-foreground">Scope: {a.scope}</span></Fact>
            <Fact label="Approvals">Origin Worker’s Sentinel: {approval(a.originApproval)} · Receiving side: {approval(a.receiverApproval)}{s.policy.requireReceiverApproval ? '' : ' (not required by policy)'}</Fact>
            <Fact label="Delivered">{a.delivered ? `${a.delivered} ${a.delivered === 1 ? 'time' : 'times'}` : 'Not yet'}</Fact>
            <Fact label="Used in runs">{a.used ? `${a.used} ${a.used === 1 ? 'run' : 'runs'}` : 'Not yet'}</Fact>
            {a.reason && <Fact label={a.status === 'suspended' ? 'Why suspended' : a.status === 'revoked' ? 'Why revoked' : 'Why'}>{a.reason}</Fact>}
            <Fact label="Last activity"><Timestamp iso={a.updatedAt} /></Fact>
          </FactList>
          <SubHead>History</SubHead>
          <ol className="divide-y rounded-block border">
            {history.map((d) => (
              <li key={d!.id}>
                <Link to={`/sentinel/decisions/${d!.id}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="min-w-0 text-body">{d!.title}<span className="block text-meta text-muted-foreground"><Timestamp iso={d!.at} /> · {d!.decidedBy.name}</span></span>
                  <OutcomePill outcome={d!.outcome} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </DetailSheet>
  )
}
