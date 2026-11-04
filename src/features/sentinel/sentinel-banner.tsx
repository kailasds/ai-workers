import { Link, useSearchParams } from 'react-router'
import { Gavel, Handshake, LayoutDashboard, Lock, ShieldCheck, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryBanner } from '@/components/platform/summary-banner'
import { BannerTabs } from '@/components/platform/banner-tabs'
import { formatCount } from '@/lib/format'
import { formatPolicyValue } from './demo/engine'
import { useDemo } from './demo/store'
import { attention, awaitingReview, controlCounts, sharingCounts } from './demo/selectors'
import { useChain, withParam } from './specs'

export type SentinelView = 'overview' | 'controls' | 'sharing' | 'decisions' | 'policy'

// Sentinel's five areas, each a tab in the banner with one line on its state.
const VIEWS: { value: SentinelView; label: string; to: string; icon: LucideIcon }[] = [
  { value: 'overview', label: 'Overview', to: '/sentinel', icon: LayoutDashboard },
  { value: 'controls', label: 'Controls', to: '/sentinel/controls', icon: Lock },
  { value: 'sharing', label: 'Sharing', to: '/sentinel/sharing', icon: Handshake },
  { value: 'decisions', label: 'Decision log', to: '/sentinel/decisions', icon: Gavel },
  { value: 'policy', label: 'Policies', to: '/sentinel/policy', icon: SlidersHorizontal },
]

const n = (x: number, one: string, many = `${one}s`) => `${formatCount(x)} ${x === 1 ? one : many}`

/**
 * Sentinel's summary: for the selected area, what matters now, its figures and the one action to
 * take; below, the five areas as tabs, each with its own one-line state. Everything is counted
 * from the demo state, so it changes as actions are taken.
 */
export function SentinelBanner({ view }: { view: SentinelView }) {
  const s = useDemo()
  const [params] = useSearchParams()
  const chain = useChain()
  const att = attention(s)
  const ctl = controlCounts(s)
  const share = sharingCounts(s)
  const pending = awaitingReview(s)
  const first = att[0]
  const firstTo = first ? (first.action.to.startsWith('?') ? withParam(params, ...(first.action.to.slice(1).split('=') as [string, string])) : first.action.to) : null
  const verified = chain.state === 'verified'

  const summary: Record<SentinelView, { title: string; facts: string[]; action?: React.ReactNode }> = {
    overview: {
      title: att.length ? `${n(att.length, 'item')} ${att.length === 1 ? 'needs' : 'need'} your attention` : 'Nothing needs your attention',
      facts: [`${n(ctl.active, 'control')} in force`, `${n(share.proposed, 'sharing proposal')}`, `${n(s.decisions.length, 'decision')}`],
      action: first && firstTo && <Button asChild className="px-5"><Link to={firstTo} preventScrollReset title={first.title}>{first.action.label} the first</Link></Button>,
    },
    controls: {
      title: ctl.active ? `${n(ctl.active, 'control')} in force` : 'No controls in force',
      facts: [`${n(ctl.stops, 'Worker')} stopped`, `${n(ctl.harness, 'harness block')}`, `${formatCount(ctl.sharing)} sharing suspended`, `${n(pending.length, 'recommendation')} pending`],
      action: pending.length > 0 && <Button asChild className="px-5"><Link to="/sentinel/controls#pending">Review recommendations</Link></Button>,
    },
    sharing: {
      title: share.proposed ? `${n(share.proposed, 'proposal')} ${share.proposed === 1 ? 'waits' : 'wait'} for approval` : 'No sharing proposals waiting',
      facts: [`${formatCount(share.agreed + share.delivered + share.used)} in force`, `${formatCount(share.suspended)} suspended`, `${formatCount(share.itemsDelivered)} items delivered`, `${n(share.timesUsed, 'use')} in runs`],
      action: share.proposed > 0 && <Button asChild className="px-5"><Link to="/sentinel/sharing?stage=proposed">Open proposals</Link></Button>,
    },
    decisions: {
      title: `${n(s.decisions.length, 'decision')} recorded`,
      facts: [`${formatCount(pending.length)} awaiting review`, verified ? 'record verified' : 'record not verified'],
      action: pending.length > 0 && <Button asChild className="px-5"><Link to="/sentinel/decisions?outcome=pending">Show awaiting review</Link></Button>,
    },
    policy: {
      title: s.policy.mode === 'enforce' ? 'Sentinel enforces its decisions' : 'Sentinel records decisions without applying them',
      facts: [`Sharing ${s.policy.sharingEnabled ? 'on' : 'off'}`, `Cost limit ${formatPolicyValue('costPerRunLimit', s.policy.costPerRunLimit)}`, `${n(s.overrides.length, 'Worker setting')}`],
      action: <Button asChild variant="outline" className="bg-card px-5"><Link to="/sentinel/policy#defaults">Edit defaults</Link></Button>,
    },
  }

  const line: Record<SentinelView, string> = {
    overview: att.length ? `${formatCount(att.length)} need attention` : 'All clear',
    controls: `${formatCount(ctl.active)} in force`,
    sharing: `${formatCount(share.proposed)} proposed`,
    decisions: pending.length ? `${formatCount(pending.length)} awaiting review` : `${formatCount(s.decisions.length)} decisions`,
    policy: s.policy.mode === 'enforce' ? 'Enforce' : 'Recording only',
  }
  const cur = summary[view]

  return (
    <SummaryBanner hue="rose" icon={ShieldCheck} eyebrow="Sentinel" title={cur.title} facts={cur.facts} action={cur.action || undefined}>
      <BannerTabs
        label="Sentinel"
        value={view}
        items={VIEWS.map((v) => ({ ...v, line: line[v.value], alert: (v.value === 'overview' && att.length > 0) || (v.value === 'sharing' && share.proposed > 0) || (v.value === 'decisions' && pending.length > 0) }))}
      />
    </SummaryBanner>
  )
}
