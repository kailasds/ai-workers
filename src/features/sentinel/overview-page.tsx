import { Link, useSearchParams } from 'react-router'
import { ArrowRight, ChevronRight, CircleAlert, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { actions, useDemo } from './demo/store'
import { workerLabel } from './demo/platform'
import { attention, AUTHORITY_LABEL, findings, FINDING_LABEL, sharingCounts, summary, type Attention } from './demo/selectors'
import { SentinelLayout } from './sentinel-layout'
import { OutcomePill, Section, WorkerLink } from './ui'

function AttentionRow({ a, onOpenWorker }: { a: Attention; onOpenWorker: (to: string) => void }) {
  const internal = a.action.to.startsWith('?')
  return (
    <li className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
      <CircleAlert className="hidden size-4 shrink-0 text-warning sm:block" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-item">{a.title}</p>
        <p className="truncate text-meta text-muted-foreground"><span className="font-medium text-foreground">{a.state}</span> · {a.subject}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {internal ? <Button variant="outline" size="sm" onClick={() => onOpenWorker(a.action.to)}>{a.action.label}</Button> : <Button asChild variant="outline" size="sm"><Link to={a.action.to}>{a.action.label}</Link></Button>}
        {a.dismissible && (
          <Button variant="ghost" size="icon" aria-label={`Dismiss: ${a.title}`} title="Dismiss from this list. The finding stays under Monitoring." onClick={() => a.findingIds?.forEach(actions.dismissFinding)}>
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </li>
  )
}

/**
 * The Platform Sentinel at a glance: what needs a person first, then the governance flow (each
 * stage opens its records), monitoring findings and recent decisions. The figures are in the
 * Brain hub's band above.
 */
export function SentinelOverviewPage() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const items = attention(s)
  const sum = summary(s, null)
  const share = sharingCounts(s)
  const found = findings(s)
  const recent = [...s.decisions].reverse().slice(0, 5)
  const openWorker = (to: string) => {
    const n = new URLSearchParams(params)
    new URLSearchParams(to.slice(1)).forEach((v, k) => n.set(k, v))
    setParams(n, { preventScrollReset: true })
  }

  const flow = [
    { label: 'Worker activity', value: `${formatCount(sum.learningSent)} learning items sent`, to: '/learning' },
    { label: 'Sentinel review', value: `${formatCount(sum.decisions)} decisions`, to: '/sentinel/decisions' },
    { label: 'Outcome', value: `${formatCount(sum.applied)} applied · ${formatCount(sum.recorded)} recorded only · ${formatCount(sum.pending)} awaiting review`, to: '/sentinel/decisions?outcome=pending' },
    { label: 'Controls in force', value: formatCount(sum.controls), to: '/sentinel/policy#controls' },
    { label: 'Sharing', value: `${formatCount(share.itemsDelivered)} deliveries · used in ${formatCount(share.timesUsed)} runs`, to: '/sentinel/sharing' },
  ]

  return (
    <SentinelLayout view="overview">
      <Section id="attention" title={items.length ? `Needs attention (${items.length})` : 'Needs attention'}>
        <Card className="gap-0 py-0">
          {items.length === 0 ? (
            <p className="flex items-center gap-2 px-5 py-4 text-body"><ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />Nothing needs attention right now.</p>
          ) : (
            <ul className="divide-y">{items.map((a) => <AttentionRow key={a.key} a={a} onOpenWorker={openWorker} />)}</ul>
          )}
        </Card>
      </Section>

      <Section id="flow" title="Governance flow">
        <ol className="grid gap-2 md:grid-cols-5">
          {flow.map((f, i) => (
            <li key={f.label} className="relative">
              <Link to={f.to} className="flex h-full flex-col gap-1 rounded-block border bg-card px-4 py-3 outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50">
                <span className="text-meta text-muted-foreground">{i + 1}. {f.label}</span>
                <span className="text-body">{f.value}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="monitoring" title="Monitoring">
        <Card className="gap-0 py-0">
          {found.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No findings.</p> : (
            <ul className="divide-y">
              {found.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                  <span className="w-40 shrink-0 text-meta text-muted-foreground">{FINDING_LABEL[f.kind]}</span>
                  <span className="min-w-0 flex-1 text-body">{f.title}<span className="block text-meta text-muted-foreground"><WorkerLink id={f.workerId} /> · {f.period}{s.dismissed.includes(f.id) ? ' · dismissed from attention' : ''}</span></span>
                  {f.decisionId && <Link to={`/sentinel/decisions/${f.decisionId}`} className="text-meta text-primary-strong underline-offset-4 hover:underline">Decision</Link>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Section>

      <Section id="recent" title="Recent decisions" aside={<Button asChild variant="ghost" size="sm"><Link to="/sentinel/decisions">All decisions<ArrowRight aria-hidden="true" /></Link></Button>}>
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {recent.map((d) => (
              <li key={d.id}>
                <Link to={`/sentinel/decisions/${d.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                  <span className="w-36 shrink-0 text-meta text-muted-foreground"><Timestamp iso={d.at} /></span>
                  <span className="min-w-0 flex-1 text-body">{d.title}<span className="block truncate text-meta text-muted-foreground">{d.effect} · {AUTHORITY_LABEL[d.decidedBy.kind]}{d.workerIds[0] ? ` · ${workerLabel(d.workerIds[0])}` : ''}</span></span>
                  <OutcomePill outcome={d.outcome} />
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </SentinelLayout>
  )
}
