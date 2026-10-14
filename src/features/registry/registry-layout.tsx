import { Link, useLocation } from 'react-router'
import { Bot, ClipboardCheck, Package, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HubLayout, Kpi, KpiBand } from '@/components/platform/hub'
import { VerdictBar } from '@/components/platform/verdict-meter'
import { useResource } from '@/hooks/use-resource'
import { listDrafts } from '@/lib/api/compose'
import { getExecutiveDashboard } from '@/lib/api/dashboard'
import { getCustomerPackages, getRuntimeRecords, getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { acknowledged, readyToPackage, readyToPrepare } from './pipeline-model'

// Home (the Registry) is the marketplace of Workers: every Worker, what is being sealed into a
// Package, and what has gone to customers. One header, one band of figures, then the pipeline as tabs.
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

function PipelineBand({ p }: { p: Pipeline }) {
  const totals = p.portfolio.data?.totals
  const o = p.outcomes.data
  const completed = o?.headlines.completed_runs.value ?? null
  const dod = o?.definition_of_done
  const packaged = p.drafts.data?.filter((d) => d.status === 'ACTIVE' && d.package).length
  const acked = p.packages.data ? acknowledged(p.packages.data).length : null
  return (
    <KpiBand title="The pipeline at a glance">
        <Kpi label="Workers" icon={Bot} hue="blue" value={totals?.workers} loading={!p.portfolio.data && !p.portfolio.error} failed={Boolean(p.portfolio.error && !p.portfolio.data)} to="/workers" caption={totals ? <><span className="text-foreground">{formatCount(totals.serving)} serving</span> · {formatCount(totals.attention)} need attention</> : 'Every Worker on the platform'}>
          {totals && totals.workers > 0 && (
            <div role="img" aria-label={`${totals.serving} of ${totals.workers} serving`} className="flex h-1.5 gap-px overflow-hidden rounded-full bg-track">
              <span className="bg-brand" style={{ flexGrow: totals.serving, flexBasis: 0 }} />
              <span className="bg-warning/70" style={{ flexGrow: totals.attention, flexBasis: 0 }} />
              <span style={{ flexGrow: Math.max(0, totals.workers - totals.serving - totals.attention), flexBasis: 0 }} />
            </div>
          )}
        </Kpi>
        <Kpi label="Met Definition of Done" icon={ClipboardCheck} hue="violet" value={dod?.met} unit={completed !== null ? `of ${formatCount(completed)} runs` : undefined} loading={!o && !p.outcomes.error} failed={Boolean(p.outcomes.error && !o)} to="/dashboard" caption={<>Last 30 days · <span className="text-primary underline-offset-4 group-hover:underline">Outcomes report</span></>}>
          {dod && completed ? <VerdictBar counts={{ MET: dod.met, NOT_MET: dod.not_met, NOT_ADJUDICABLE: dod.not_adjudicable }} className="h-1.5 bg-track" /> : null}
        </Kpi>
        <Kpi label="Ready to package" icon={Package} hue="amber" value={p.toPackage} loading={p.toPackage === null && !p.drafts.error && !p.records.error} failed={Boolean(p.drafts.error || p.records.error)} to="/packaging" caption={packaged !== undefined ? `${formatCount(packaged)} sealed Packages so far` : 'Composed, nothing blocking'} />
        <Kpi label="With customers" icon={Send} hue="teal" value={p.packages.data?.length} loading={!p.packages.data && !p.packages.error} failed={Boolean(p.packages.error && !p.packages.data)} to="/customer-delivery?view=delivered" caption={acked !== null ? `${formatCount(acked)} acknowledged · ${p.toPrepare ?? '—'} waiting to prepare` : 'Prepared customer Packages'} />
    </KpiBand>
  )
}

// Each stage keeps one hue and icon everywhere it appears (KPI card and tab).
export function RegistryLayout() {
  const p = usePipeline()
  return (
    <HubLayout
      title="Home"
      action={<Button asChild><Link to="/compose"><Plus aria-hidden="true" />Compose a Worker</Link></Button>}
      band={<PipelineBand p={p} />}
      tabsLabel="Home"
      stages={[
        { to: '/workers', label: 'Workers', icon: Bot, hue: 'blue', count: p.portfolio.data?.totals.workers },
        { to: '/packaging', label: 'Packaging', icon: Package, hue: 'amber', count: p.toPackage },
        { to: '/customer-delivery', label: 'Customer delivery', icon: Send, hue: 'teal', count: p.toPrepare },
      ]}
    />
  )
}
