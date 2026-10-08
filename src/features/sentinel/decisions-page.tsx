import { useSearchParams } from 'react-router'
import { ScrollText } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { EmptyState } from '@/components/platform/states'
import { DIMENSIONS } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'

const ALL = '__all'

export function SentinelDecisionsPage() {
  const [params, setParams] = useSearchParams()
  const set = (k: string, v: string) => setParams((p) => { const n = new URLSearchParams(p); if (v === ALL) n.delete(k); else n.set(k, v); return n }, { replace: true })
  return (
    <SentinelLayout view="decisions">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={params.get('dimension') ?? ALL} onValueChange={(v) => v && set('dimension', v)} aria-label="Dimension" className="w-max">
            <ToggleGroupItem value={ALL}>All dimensions</ToggleGroupItem>
            {DIMENSIONS.map((d) => <ToggleGroupItem key={d.key} value={d.key}>{d.name}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <div className="flex gap-2 lg:ml-auto">
          <Select value={params.get('severity') ?? ALL} onValueChange={(v) => set('severity', v)}>
            <SelectTrigger className="w-40" aria-label="Severity"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value={ALL}>All severities</SelectItem>{['signal', 'warning', 'restriction', 'stop'].map((s) => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={params.get('mode') ?? ALL} onValueChange={(v) => set('mode', v)}>
            <SelectTrigger className="w-44" aria-label="Mode"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value={ALL}>Shadow and enforce</SelectItem><SelectItem value="enforce">Enforce</SelectItem><SelectItem value="shadow">Shadow</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <EmptyState icon={ScrollText} title="No platform decisions yet" description="Every decision and its reasoning appears here, newest first, hash-linked to the one before it. Shadow decisions read “Would …” and were never sent." />
    </SentinelLayout>
  )
}

export function SentinelDecisionPage() {
  return (
    <SentinelLayout view="" title="Decision" crumbs={[{ label: 'Sentinel', to: '/sentinel' }, { label: 'Decisions', to: '/sentinel/decisions' }, { label: 'Decision' }]}>
      <EmptyState icon={ScrollText} title="Decision not found" description="No decision with this id is in the Platform Sentinel’s log." />
    </SentinelLayout>
  )
}
