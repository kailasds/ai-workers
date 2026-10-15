import { Activity, Building2, BrainCircuit, ClipboardCheck, GitBranch, Server, type LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
import { formatCount, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { WorkerWorkspace } from '@/lib/types/worker'

function Kpi({ icon: Icon, hue, label, value, caption }: { icon: LucideIcon; hue: Hue; label: string; value: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-card p-4">
      <dt className="flex items-center gap-2 text-meta font-medium text-muted-foreground">
        <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
        <span className="truncate">{label}</span>
      </dt>
      <dd>
        <span className="block text-stat tabular-nums">{value}</span>
        {caption && <span className="mt-0.5 block truncate text-meta text-muted-foreground">{caption}</span>}
      </dd>
    </div>
  )
}

/** The Worker's figures, read first: what it has done, how well, what it kept, where it runs and who has it. */
export function WorkerKpis({ ws }: { ws: WorkerWorkspace }) {
  const w = ws.worker
  const m = ws.composition?.maturity
  const runs = m?.runs ?? w.last_outcome.runs
  const met = m?.runs_met ?? null
  const live = ws.runtimes.filter((r) => r.state !== 'TERMINATED')
  const running = live.filter((r) => r.state === 'RUNNING').length
  const customers = new Set(ws.versions.flatMap((v) => v.deliveries.map((d) => d.destination_label ?? 'unnamed'))).size
  const delivered = ws.versions.filter((v) => v.deliveries.length > 0).length
  const dash = <span className="text-muted-foreground">–</span>
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Kpi icon={Activity} hue="cyan" label="Runs" value={formatCount(runs)} caption={m?.last_run_at ? 'Completed so far' : 'No runs yet'} />
      <Kpi icon={ClipboardCheck} hue="teal" label="DoD met" value={met === null || runs === 0 ? dash : formatPercent(met / runs)} caption={met === null ? 'Not reported' : `${formatCount(met)} of ${formatCount(runs)} runs`} />
      <Kpi icon={BrainCircuit} hue="violet" label="Memory records" value={formatCount(w.learning.memories)} caption={w.learning.contradictions > 0 ? `${w.learning.contradictions} contradictions` : 'From running'} />
      <Kpi icon={Server} hue="blue" label="Runtimes" value={formatCount(live.length)} caption={`${formatCount(running)} running`} />
      <Kpi icon={GitBranch} hue="amber" label="Versions" value={formatCount(ws.versions.length)} caption={`${formatCount(delivered)} delivered`} />
      <Kpi icon={Building2} hue="rose" label="Customers" value={formatCount(customers)} caption={customers === 0 ? 'None yet' : 'Holding a version'} />
    </dl>
  )
}
