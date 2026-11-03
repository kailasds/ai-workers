import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, BellRing, ChevronDown, Gavel, Handshake, Lock, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Panel } from '@/components/platform/panel'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { actions, useDemo } from './demo/store'
import { attention, CONTROL_TONE, sharingCounts, type Attention } from './demo/selectors'
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
// An overview shows the top few of each area; the area's own tab has the rest.
const TOP = 3

/**
 * The Platform Sentinel at a glance, answering in order: what needs me, what is in force, how
 * knowledge is moving, and what was decided lately. Only the top few of each; every row opens
 * its detail and every card links to its full tab.
 */
export function SentinelOverviewPage() {
  const s = useDemo()
  const [params] = useSearchParams()
  const [allAttention, setAllAttention] = useState(false)
  const items = attention(s)
  const share = sharingCounts(s)
  const controls = s.controls.filter((c) => c.active).sort((a, b) => SEVERITY[CONTROL_TONE[a.kind]] - SEVERITY[CONTROL_TONE[b.kind]] || b.since.localeCompare(a.since))
  const recent = [...s.decisions].sort((a, b) => b.at.localeCompare(a.at) || b.seq - a.seq).slice(0, TOP)
  const stages = [
    { label: 'Eligible', n: share.eligible, to: '/sentinel/sharing?view=pools#eligible' },
    { label: 'Proposed', n: share.proposed, to: '/sentinel/sharing?view=agreements&stage=proposed' },
    { label: 'Agreed', n: share.agreed, to: '/sentinel/sharing?view=agreements&stage=agreed' },
    { label: 'Delivered', n: share.delivered, to: '/sentinel/sharing?view=agreements&stage=delivered' },
    { label: 'Used', n: share.used, to: '/sentinel/sharing?view=agreements&stage=used' },
  ]
  const shown = allAttention ? items : items.slice(0, TOP)

  return (
    <SentinelLayout view="overview">
      <Panel id="attention" title="Needs attention" icon={BellRing} hue="amber" count={items.length} flush>
        {items.length === 0 ? (
          <p className="flex items-center gap-2 px-5 py-4 text-body text-muted-foreground"><ShieldCheck className="size-4" aria-hidden="true" />Nothing needs attention.</p>
        ) : (
          <>
            <ul className="divide-y">{shown.map((a) => <AttentionRow key={a.key} a={a} />)}</ul>
            {items.length > TOP && (
              <div className="border-t px-5 py-2.5">
                <button type="button" className={MORE} aria-expanded={allAttention} onClick={() => setAllAttention((v) => !v)}>
                  {allAttention ? 'Show fewer' : `Show all ${formatCount(items.length)}`}<ChevronDown className={cn('size-3.5 transition-transform', allAttention && 'rotate-180')} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </Panel>

      <Panel id="sharing" title="Knowledge sharing" icon={Handshake} hue="teal" flush aside={<Link to="/sentinel/sharing" className={MORE}>Open<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
        <ol className="grid grid-cols-5 divide-x">
          {stages.map((st) => (
            <li key={st.label}>
              <Link to={st.to} className={cn('flex flex-col items-center gap-0.5 px-1 py-4', ROW_LINK)}>
                <span className="text-section tabular-nums">{formatCount(st.n)}</span>
                <span className="text-meta text-muted-foreground">{st.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        {share.suspended > 0 && (
          <p className="border-t px-5 py-2.5 text-meta text-muted-foreground">
            <Link to="/sentinel/sharing?view=agreements&stage=suspended" className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"><span className="font-medium text-warning tabular-nums">{formatCount(share.suspended)}</span> suspended</Link>
          </p>
        )}
      </Panel>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel id="controls" title="Controls in force" icon={Lock} hue="rose" count={controls.length} flush aside={<Link to="/sentinel/controls" className={MORE}>All<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          {controls.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No controls are in force.</p> : (
            <ul className="divide-y">
              {controls.slice(0, TOP).map((c) => (
                <li key={c.id}>
                  <Link to={withParam(params, 'control', c.id)} preventScrollReset className={cn('flex items-center gap-3 px-5 py-3', ROW_LINK)}>
                    <span className="min-w-0 flex-1 truncate text-body">{c.title}</span>
                    <ControlPill kind={c.kind} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel id="recent" title="Recent decisions" icon={Gavel} hue="blue" flush aside={<Link to="/sentinel/decisions" className={MORE}>All<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          <ul className="divide-y">
            {recent.map((d) => (
              <li key={d.id}>
                <Link to={`/sentinel/decisions/${d.id}`} className={cn('flex items-center gap-3 px-5 py-3', ROW_LINK)}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body">{d.title}</span>
                    <span className="block text-meta text-muted-foreground"><Timestamp iso={d.at} /></span>
                  </span>
                  <OutcomePill outcome={d.outcome} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </SentinelLayout>
  )
}
