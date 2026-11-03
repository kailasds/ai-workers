import { Link, useSearchParams } from 'react-router'
import { ArrowRight, BellRing, ChevronDown, ChevronRight, Gavel, Handshake, Lock, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Panel } from '@/components/platform/panel'
import { Paged, SECTION_SIZE } from '@/components/platform/section-pager'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { actions, useDemo } from './demo/store'
import { workerLabel } from './demo/platform'
import { attention, AUTHORITY_LABEL, CONTROL_TONE, controlSource, sharingCounts, type Attention } from './demo/selectors'
import { SentinelLayout } from './sentinel-layout'
import { withParam } from './specs'
import { ControlPill, OutcomePill, WorkerLink } from './ui'

const ROW_LINK = 'outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
const MORE = 'inline-flex items-center gap-1 rounded-sm text-meta font-medium text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'

/** One item: what, who, why, its state, and the next step. A group of findings lists its Workers. */
function AttentionRow({ a }: { a: Attention }) {
  const [params] = useSearchParams()
  const drawer = a.action.to.startsWith('?')
  const to = drawer ? withParam(params, ...(a.action.to.slice(1).split('=') as [string, string])) : a.action.to
  const group = (a.workers?.length ?? 0) > 1
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={a.tone}>{a.state}</StatusBadge>
            <p className="min-w-0 text-item">{a.title}</p>
          </div>
          <p className="mt-1 truncate text-meta text-muted-foreground" title={a.why}>{a.subject}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!group && <Button asChild variant="outline" size="sm"><Link to={to} preventScrollReset={drawer}>{a.action.label}</Link></Button>}
          {a.dismissible && (
            <Button variant="ghost" size="icon" aria-label={`Dismiss: ${a.title}`} title="Dismiss from this list. Each Worker’s drawer still shows the finding." onClick={() => a.findingIds?.forEach(actions.dismissFinding)}>
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      {group && (
        <Collapsible className="mt-2">
          <CollapsibleTrigger className="group inline-flex items-center gap-1 rounded-sm text-meta font-medium text-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {a.action.label} ({a.workers!.length})<ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-meta">{a.workers!.map((w) => <li key={w}><WorkerLink id={w} /></li>)}</ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </li>
  )
}

const SEVERITY = { danger: 0, warning: 1, neutral: 2 } as const

/**
 * The Platform Sentinel at a glance, answering in order: what needs me, what is in force, how
 * knowledge is moving, and what was decided lately. Every row opens its detail.
 */
export function SentinelOverviewPage() {
  const s = useDemo()
  const [params] = useSearchParams()
  const items = attention(s)
  const share = sharingCounts(s)
  const controls = s.controls.filter((c) => c.active).sort((a, b) => SEVERITY[CONTROL_TONE[a.kind]] - SEVERITY[CONTROL_TONE[b.kind]] || b.since.localeCompare(a.since))
  const recent = [...s.decisions].sort((a, b) => b.at.localeCompare(a.at) || b.seq - a.seq).slice(0, SECTION_SIZE)
  const stages = [
    { label: 'Eligible', n: share.eligible, to: '/sentinel/sharing?view=pools#eligible' },
    { label: 'Proposed', n: share.proposed, to: '/sentinel/sharing?view=agreements&stage=proposed' },
    { label: 'Agreed', n: share.agreed, to: '/sentinel/sharing?view=agreements&stage=agreed' },
    { label: 'Delivered', n: share.delivered, to: '/sentinel/sharing?view=agreements&stage=delivered' },
    { label: 'Used in runs', n: share.used, to: '/sentinel/sharing?view=agreements&stage=used' },
  ]

  return (
    <SentinelLayout view="overview">
      <Panel id="attention" title="Needs attention" icon={BellRing} hue="amber" count={items.length} flush>
        {items.length === 0 ? (
          <p className="flex items-center gap-2 px-5 py-4 text-body text-muted-foreground"><ShieldCheck className="size-4" aria-hidden="true" />Nothing needs attention.</p>
        ) : (
          <Paged rows={items} label="Needs attention">{(page) => <ul className="divide-y">{page.map((a) => <AttentionRow key={a.key} a={a} />)}</ul>}</Paged>
        )}
      </Panel>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel id="controls" title="Controls in force" icon={Lock} hue="rose" count={controls.length} flush aside={<Link to="/sentinel/controls" className={MORE}>All controls<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          {controls.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No controls are in force.</p> : (
            <Paged rows={controls} label="Controls in force">{(page) => <ul className="divide-y">
              {page.map((c) => (
                <li key={c.id}>
                  <Link to={withParam(params, 'control', c.id)} preventScrollReset className={cn('flex items-center gap-3 px-5 py-3', ROW_LINK)}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body">{c.title}</span>
                      <span className="block truncate text-meta text-muted-foreground">{controlSource(s, c)} · <Timestamp iso={c.since} /></span>
                    </span>
                    <ControlPill kind={c.kind} />
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>}</Paged>
          )}
        </Panel>

        <Panel id="sharing" title="Knowledge sharing" icon={Handshake} hue="teal" flush aside={<Link to="/sentinel/sharing" className={MORE}>Open Sharing<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          <ol className="divide-y">
            {stages.map((st, i) => (
              <li key={st.label}>
                <Link to={st.to} className={cn('flex items-center gap-3 px-5 py-2.5', ROW_LINK)}>
                  <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-meta text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 text-body">{st.label}</span>
                  <span className="text-item tabular-nums">{formatCount(st.n)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="flex flex-wrap gap-x-4 gap-y-1 border-t px-5 py-2.5 text-meta text-muted-foreground">
            <Link to="/sentinel/sharing?view=agreements&stage=suspended" className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"><span className={cn('font-medium tabular-nums', share.suspended ? 'text-warning' : 'text-foreground')}>{formatCount(share.suspended)}</span> suspended</Link>
            <span><span className="font-medium text-foreground tabular-nums">{formatCount(share.rejected + share.revoked)}</span> rejected or revoked</span>
          </p>
        </Panel>
      </div>

      <Panel id="recent" title="Recent decisions" icon={Gavel} hue="blue" flush aside={<Link to="/sentinel/decisions" className={MORE}>View all decisions<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-body">
            <caption className="sr-only">Recent decisions</caption>
            <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-2.5 font-medium">Decision</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Worker</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Effect</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Decided by</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">When</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40">
                  <td className="px-5 py-2.5"><Link to={`/sentinel/decisions/${d.id}`} className="rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{d.title}</Link></td>
                  <td className="hidden max-w-56 truncate px-4 py-2.5 text-meta text-muted-foreground md:table-cell">{d.workerIds.length === 0 ? 'Platform-wide' : d.workerIds.length === 1 ? workerLabel(d.workerIds[0]) : `${d.workerIds.length} Workers`}</td>
                  <td className="px-4 py-2.5"><OutcomePill outcome={d.outcome} /></td>
                  <td className="hidden px-4 py-2.5 text-meta lg:table-cell">{AUTHORITY_LABEL[d.decidedBy.kind]}</td>
                  <td className="hidden px-4 py-2.5 text-meta whitespace-nowrap text-muted-foreground sm:table-cell"><Timestamp iso={d.at} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </SentinelLayout>
  )
}
