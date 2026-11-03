import { Link, useLocation } from 'react-router'
import { UserRound, BrainCircuit, CircleCheck, ClipboardCheck, Package, PackageCheck, PackageOpen, Plus, Rocket, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HubLayout, Kpi, KpiBand } from '@/components/platform/hub'
import { VerdictBar } from '@/components/platform/verdict-meter'
import { useResource } from '@/hooks/use-resource'
import { listDrafts } from '@/lib/api/compose'
import { getExecutiveDashboard } from '@/lib/api/dashboard'
import { getCustomerPackages, getRuntimeRecords, getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { acknowledged, queueOf, readyToPackage, readyToPrepare } from './pipeline-model'

// Home (the Registry) is the marketplace of Workers: every Worker, what is being sealed into a
// Package, and what has gone to customers. One header, the pipeline as tabs, then the selected
// tab's own figures and content.
// Each tab keeps its own URL (/workers, /packaging, /customer-delivery) so every old link works.

function usePipeline() {
  const { search } = useLocation()
  const scenario = new URLSearchParams(search).get('mock')
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const records = useResource('runtime-records', (signal) => getRuntimeRecords({ signal }))
  const packages = useResource('customer-packages', (signal) => getCustomerPackages({ signal }))
  const outcomes = useResource('outcomes:30d', (signal) => getExecutiveDashboard({ period: '30d', signal, scenario }))

  const d = drafts.data
  const toPackage = d && records.data ? readyToPackage(d, records.data).length : null
  const toPrepare = d && packages.data ? readyToPrepare(d, packages.data).length : null
  return { portfolio, drafts, records, packages, outcomes, toPackage, toPrepare }
}

type Pipeline = ReturnType<typeof usePipeline>

const pending = (r: { data?: unknown; error?: unknown }) => !r.data && !r.error
const failedRead = (r: { data?: unknown; error?: unknown }) => Boolean(r.error && !r.data)

/** Workers: how many there are and how they are doing. */
function WorkersBand({ p }: { p: Pipeline }) {
  const totals = p.portfolio.data?.totals
  const workers = p.portfolio.data?.workers
  const learning = workers?.filter((w) => w.learning.memories > 0).length
  const o = p.outcomes.data
  const completed = o?.headlines.completed_runs.value ?? null
  const dod = o?.definition_of_done
  return (
    <KpiBand title="Overview">
      <Kpi label="Workers" icon={UserRound} hue="blue" value={totals?.workers} loading={pending(p.portfolio)} failed={failedRead(p.portfolio)} caption={totals ? <><span className="text-foreground">{formatCount(totals.serving)} serving</span> · {formatCount(totals.attention)} need attention</> : undefined}>
        {totals && totals.workers > 0 && (
          <div role="img" aria-label={`${totals.serving} of ${totals.workers} serving`} className="flex h-1.5 gap-px overflow-hidden rounded-full bg-track">
            <span className="bg-brand" style={{ flexGrow: totals.serving, flexBasis: 0 }} />
            <span className="bg-warning/70" style={{ flexGrow: totals.attention, flexBasis: 0 }} />
            <span style={{ flexGrow: Math.max(0, totals.workers - totals.serving - totals.attention), flexBasis: 0 }} />
          </div>
        )}
      </Kpi>
      <Kpi label="Need attention" icon={TriangleAlert} hue="amber" value={totals?.attention} loading={pending(p.portfolio)} failed={failedRead(p.portfolio)} to="/workers?runtime=attention" />
      <Kpi label="Met Definition of Done" icon={ClipboardCheck} hue="violet" value={dod?.met} unit={completed !== null ? `of ${formatCount(completed)} runs` : undefined} loading={pending(p.outcomes)} failed={failedRead(p.outcomes)} to="/dashboard" caption={<>Last 30 days · <span className="text-primary underline-offset-4 group-hover:underline">Outcomes report</span></>}>
        {dod && completed ? <VerdictBar counts={{ MET: dod.met, NOT_MET: dod.not_met, NOT_ADJUDICABLE: dod.not_adjudicable }} className="h-1.5 bg-track" /> : null}
      </Kpi>
      <Kpi label="Workers with learning" icon={BrainCircuit} hue="cyan" value={learning} unit={totals ? `of ${formatCount(totals.workers)}` : undefined} loading={pending(p.portfolio)} failed={failedRead(p.portfolio)} to="/workers?brain=memory" />
    </KpiBand>
  )
}

/** Packaging: what is ready to seal, what is sealed, and what runs from a Package. */
function PackagingBand({ p }: { p: Pipeline }) {
  const active = p.drafts.data?.filter((d) => d.status === 'ACTIVE')
  const recs = p.records.data
  const sealed = active && recs ? active.filter((d) => queueOf(d, recs) === 'packaged').length : null
  const deployed = active && recs ? active.filter((d) => queueOf(d, recs) === 'deployed').length : null
  const blocked = active && recs ? active.filter((d) => queueOf(d, recs) === 'work' && d.issues.length > 0).length : null
  const loading = pending(p.drafts) || pending(p.records)
  const failed = failedRead(p.drafts) || failedRead(p.records)
  return (
    <KpiBand title="Overview" columns={3}>
      <Kpi label="Ready to package" icon={Package} hue="amber" value={p.toPackage} loading={loading} failed={failed} to="/packaging" caption={blocked ? `${formatCount(blocked)} blocked` : undefined} />
      <Kpi label="Sealed, not running" icon={PackageCheck} hue="blue" value={sealed} loading={loading} failed={failed} to="/packaging?queue=packaged" />
      <Kpi label="Running from a Package" icon={Rocket} hue="teal" value={deployed} loading={loading} failed={failed} to="/packaging?queue=deployed" />
    </KpiBand>
  )
}

/** Customer delivery: what has gone out and what is waiting to be prepared. */
function DeliveryBand({ p }: { p: Pipeline }) {
  const acked = p.packages.data ? acknowledged(p.packages.data).length : null
  return (
    <KpiBand title="Overview" columns={3}>
      <Kpi label="With customers" icon={Send} hue="teal" value={p.packages.data?.length} loading={pending(p.packages)} failed={failedRead(p.packages)} to="/customer-delivery?view=delivered" />
      <Kpi label="Acknowledged" icon={CircleCheck} hue="blue" value={acked} loading={pending(p.packages)} failed={failedRead(p.packages)} to="/customer-delivery?view=delivered" />
      <Kpi label="Waiting to prepare" icon={PackageOpen} hue="amber" value={p.toPrepare} loading={p.toPrepare === null && !p.drafts.error && !p.packages.error} failed={Boolean(p.drafts.error || p.packages.error)} to="/customer-delivery" />
    </KpiBand>
  )
}

// Each stage keeps one hue and icon everywhere it appears (KPI card and tab).
export function RegistryLayout() {
  const p = usePipeline()
  const { pathname } = useLocation()
  return (
    <HubLayout
      title="Home"
      action={<Button asChild><Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link></Button>}
      band={pathname.startsWith('/packaging') ? <PackagingBand p={p} /> : pathname.startsWith('/customer-delivery') ? <DeliveryBand p={p} /> : <WorkersBand p={p} />}
      tabsLabel="Home"
      stages={[
        { to: '/workers', label: 'Workers', icon: UserRound, hue: 'blue', count: p.portfolio.data?.totals.workers },
        { to: '/packaging', label: 'Packaging', icon: Package, hue: 'amber', count: p.toPackage },
        { to: '/customer-delivery', label: 'Customer delivery', icon: Send, hue: 'teal', count: p.toPrepare },
      ]}
    />
  )
}
