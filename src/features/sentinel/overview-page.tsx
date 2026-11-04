import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Activity, ArrowRight, Ban, BellRing, ChevronDown, ChevronRight, FileText, Gavel, Handshake, Lock, OctagonX, PauseCircle, ShieldCheck, SlidersHorizontal, X, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Hue } from '@/components/platform/hue'
import { IconTile, Panel } from '@/components/platform/panel'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { actions, useDemo } from './demo/store'
import { workerLabel } from './demo/platform'
import { attention, CONTROL_LABEL, CONTROL_TONE, controlCounts, controlSource, sharingCounts, type Attention } from './demo/selectors'
import type { Control } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { useChain, withParam } from './specs'
import { OutcomePill } from './ui'

const ROW_LINK = 'outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
const MORE = 'inline-flex items-center gap-1 rounded-sm text-meta font-medium text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'
const SEVERITY = { danger: 0, warning: 1, neutral: 2 } as const
// The overview shows the top few of each area; the area's own tab has the rest.
const TOP = 3

// Each kind of attention item keeps one icon and hue.
const ATTENTION_LOOK: Record<string, { icon: LucideIcon; hue: Hue }> = {
  review: { icon: Gavel, hue: 'amber' },
  susp: { icon: PauseCircle, hue: 'amber' },
  prop: { icon: Handshake, hue: 'teal' },
  find: { icon: Activity, hue: 'blue' },
}

const CONTROL_ICON: Record<Control['kind'], LucideIcon> = { admin_stop: OctagonX, harness_block: Ban, sharing_suspension: PauseCircle, recording_only: FileText }

/** One item that needs a person, in one row: what, who, its status and the next step. */
function AttentionRow({ a }: { a: Attention }) {
  const [params] = useSearchParams()
  const drawer = a.action.to.startsWith('?')
  const to = drawer ? withParam(params, ...(a.action.to.slice(1).split('=') as [string, string])) : a.action.to
  const look = ATTENTION_LOOK[a.key.split(':')[0]] ?? ATTENTION_LOOK.find
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <IconTile icon={look.icon} hue={look.hue} size="sm" />
      <span className="min-w-0 flex-1 truncate text-body" title={`${a.subject}\n${a.why}`}>{a.title}</span>
      <Button asChild variant="outline" size="sm"><Link to={to} preventScrollReset={drawer}>{a.action.label}</Link></Button>
      {a.dismissible && (
        <Button variant="ghost" size="icon-sm" aria-label={`Dismiss: ${a.title}`} title="Hide from this list" onClick={() => a.findingIds?.forEach(actions.dismissFinding)}>
          <X aria-hidden="true" />
        </Button>
      )}
    </li>
  )
}

function Area({ to, icon: Icon, title, line }: { to: string; icon: LucideIcon; title: string; line: string }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50">
      <Icon className="size-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-item">{title}</span>
        <span className="block truncate text-meta text-muted-foreground">{line}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

/**
 * Sentinel, attention first: what needs a person, then what is in force now (kept apart from
 * anything still pending), the latest decisions, and the four governance areas. Items open in place
 * or in a drawer, so the overview keeps its position.
 */
export function SentinelOverviewPage() {
  const s = useDemo()
  const [params] = useSearchParams()
  const chain = useChain()
  const [allAttention, setAllAttention] = useState(false)
  const items = attention(s)
  const share = sharingCounts(s)
  const ctl = controlCounts(s)
  const controls = s.controls.filter((c) => c.active).sort((a, b) => SEVERITY[CONTROL_TONE[a.kind]] - SEVERITY[CONTROL_TONE[b.kind]] || b.since.localeCompare(a.since))
  const recent = [...s.decisions].sort((a, b) => b.at.localeCompare(a.at) || b.seq - a.seq).slice(0, TOP)
  const shown = allAttention ? items : items.slice(0, TOP)

  return (
    <SentinelLayout view="overview">
      <Panel id="attention" title="Needs attention" icon={BellRing} hue="amber" count={items.length} flush>
        {items.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-5">
            <ShieldCheck className="size-5 text-success" aria-hidden="true" />
            <div>
              <p className="text-item">Nothing needs a decision</p>
              <p className="text-meta text-muted-foreground">No reviews, proposals, suspensions or open findings. Controls in force are listed below.</p>
            </div>
          </div>
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

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel id="in-force" title="In force now" icon={Lock} hue="rose" count={controls.length} flush aside={<Link to="/sentinel/controls" className={MORE}>Controls<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          {controls.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No controls are in force. Workers run without restrictions.</p> : (
            <>
              <ul className="divide-y">
                {controls.slice(0, TOP).map((c) => (
                  <li key={c.id}>
                    <Link to={withParam(params, 'control', c.id)} preventScrollReset className={cn('flex items-center gap-3 px-5 py-3', ROW_LINK)}>
                      <IconTile icon={CONTROL_ICON[c.kind]} hue="rose" size="sm" />
                      <span className="min-w-0 flex-1 truncate text-body" title={`${CONTROL_LABEL[c.kind]} · ${controlSource(s, c)}`}>{c.title}</span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel id="recent" title="Recent decisions" icon={Gavel} hue="blue" flush aside={<Link to="/sentinel/decisions" className={MORE}>Decision log<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}>
          {recent.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">No decisions recorded yet.</p> : (
            <ul className="divide-y">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link to={`/sentinel/decisions/${d.id}`} className={cn('flex items-center gap-3 px-5 py-3', ROW_LINK)}>
                    <IconTile icon={Gavel} hue="blue" size="sm" />
                    <span className="min-w-0 flex-1 truncate text-body" title={d.workerIds.length === 0 ? 'Platform-wide' : d.workerIds.map(workerLabel).join(', ')}>{d.title}</span>
                    <OutcomePill outcome={d.outcome} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section aria-label="Governance areas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Area to="/sentinel/controls" icon={Lock} title="Controls" line={`${formatCount(ctl.active)} in force · ${formatCount(ctl.lifted)} lifted`} />
        <Area to="/sentinel/sharing" icon={Handshake} title="Sharing" line={`${formatCount(share.proposed)} proposed · ${formatCount(share.suspended)} suspended`} />
        <Area to="/sentinel/decisions" icon={Gavel} title="Decision log" line={`${formatCount(s.decisions.length)} decisions · ${chain.state === 'verified' ? 'record verified' : 'record not verified'}`} />
        <Area to="/sentinel/policy" icon={SlidersHorizontal} title="Policies" line={`${s.policy.mode === 'enforce' ? 'Enforce' : 'Recording only'} · ${formatCount(s.overrides.length)} Worker ${s.overrides.length === 1 ? 'setting' : 'settings'}`} />
      </section>
    </SentinelLayout>
  )
}
