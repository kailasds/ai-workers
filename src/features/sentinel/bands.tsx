import { BellRing, Gavel, Handshake, Lock } from 'lucide-react'
import { Kpi, KpiBand } from '@/components/platform/hub'
import { formatCount } from '@/lib/format'
import { useDemo } from './demo/store'
import { attention, controlCounts, sharingCounts } from './demo/selectors'
import { useChain } from './specs'

// Sentinel's figures, above its tabs on every section, counted from the one demo state. Each
// figure links to the list it counts.

const K = { loading: false, failed: false }

export function SentinelBand() {
  const s = useDemo()
  const ctl = controlCounts(s)
  const share = sharingCounts(s)
  const chain = useChain()
  return (
    <KpiBand title="Overview">
      <Kpi label="Needs attention" icon={BellRing} hue="amber" value={attention(s).length} {...K} to="/sentinel#attention" />
      <Kpi label="Controls in force" icon={Lock} hue="rose" value={ctl.active} {...K} to="/sentinel/controls" caption={`${formatCount(ctl.stops)} ${ctl.stops === 1 ? 'Worker' : 'Workers'} stopped`} />
      <Kpi label="Sharing in force" icon={Handshake} hue="teal" value={share.agreed + share.delivered + share.used} {...K} to="/sentinel/sharing?stage=in_force" caption={`${formatCount(share.proposed)} proposed`} />
      <Kpi label="Decisions" icon={Gavel} hue="blue" value={s.decisions.length} {...K} to="/sentinel/decisions" caption={chain.state === 'verified' ? 'Record verified' : chain.failedAt ? `Record breaks at ${chain.failedAt}` : 'Record incomplete'} />
    </KpiBand>
  )
}
