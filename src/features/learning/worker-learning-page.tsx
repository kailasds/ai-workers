import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Archive, BrainCircuit, ChevronDown, Hourglass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { runtimeStatus, RuntimeStatusDot } from '@/components/platform/runtime-status'
import { EmptyState } from '@/components/platform/states'
import { Panel } from '@/components/platform/panel'
import { SummaryBanner } from '@/components/platform/summary-banner'
import { formatCount } from '@/lib/format'
import { domainLabel } from '@/lib/vocabulary'
import { useDemo } from '@/features/sentinel/demo/store'
import { domainOfWorker, inPeriod, itemsOf, PERIODS, WORKER_BY_ID_SAFE, workerLabel, workerScope } from './model'
import { inStage, LIFECYCLE } from './journey'
import { EvolutionPanel } from './growth'
import { KindTabs, StageTabs, useStage } from './lifecycle'
import { ItemList, PeriodSelect } from './ui'
import { pendingChanges, useReviews } from './reviews'
import { usePeriod, withPeriod } from './nav'

/**
 * One Worker's learning: the same lifecycle as the platform, scoped to this Worker and ending in
 * its revision. Choosing a stage narrows what is new below; earlier learning is folded away, and
 * Evolution shows each run with what it taught. Items open in the side panel.
 */
export function WorkerLearningPage() {
  const { id = '' } = useParams()
  const [period, setPeriod] = usePeriod()
  const worker = WORKER_BY_ID_SAFE(id)
  const stopped = useDemo().workers[id]?.status === 'stopped'
  const [showEarlier, setShowEarlier] = useState(false)
  const { stage, kind, setStage, setKind } = useStage(null)
  const reviews = useReviews()
  const crumbs = [{ label: 'Learning', to: withPeriod('/learning', period) }, { label: worker ? workerLabel(id) : 'Worker not found' }]

  if (!worker) {
    return (
      <PageContainer>
        <PageHeader crumbs={crumbs} title="Worker not found" />
        <EmptyState icon={BrainCircuit} title="There is no Worker with this id in the snapshot" action={<Button asChild variant="outline"><Link to="/learning">Back to Learning</Link></Button>} />
      </PageContainer>
    )
  }

  const items = itemsOf(id)
  const scoped = stage ? inStage(items, stage) : items
  const narrow = (list: typeof items) => (kind ? list.filter((i) => i.category === kind) : list)
  // A proposal nobody has reviewed counts as new whatever the period, and leads the list.
  const isNew = (i: (typeof items)[number]) => inPeriod(i, period) || (i.state === 'proposed' && !reviews[i.id])
  const lead = (list: typeof items) => [...list].sort((a, b) => Number(b.state === 'proposed' && !reviews[b.id]) - Number(a.state === 'proposed' && !reviews[a.id]))
  const pending = items.filter((i) => i.state === 'proposed' && !reviews[i.id])
  const allFresh = lead(scoped.filter(isNew))
  const fresh = narrow(allFresh)
  const earlier = narrow(scoped.filter((i) => !isNew(i)))
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const domain = domainOfWorker(id)

  return (
    <PageContainer>
      <PageHeader
        crumbs={crumbs}
        title={workerLabel(id)}
        meta={
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-muted-foreground">
            <span>{workerScope(id)}{domain && ` · ${domainLabel(domain)}`} · revision {worker.revision}</span>
            <span aria-hidden="true">·</span>
            {stopped ? <span className="inline-flex items-center gap-1.5 text-meta text-destructive"><span aria-hidden="true" className="size-2 rounded-full bg-destructive" />Stopped by admin</span> : <RuntimeStatusDot status={runtimeStatus(worker.runtime)} />}
          </p>
        }
        utilities={<PeriodSelect value={period} onChange={setPeriod} />}
        actions={<Button asChild variant="outline"><Link to={`/workers/${id}`}>Open Worker</Link></Button>}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="This Worker hasn’t learned anything yet"
          description={worker.brain.engine ? 'No run has left a learning item.' : 'Composed without a memory engine.'}
          action={<Button asChild variant="outline"><Link to={withPeriod('/learning', period)}>Back to Learning</Link></Button>}
        />
      ) : (
        <>
          <SummaryBanner
            hue="cyan"
            icon={BrainCircuit}
            eyebrow="Learning"
            title={pending.length ? `${formatCount(pendingChanges(pending, reviews))} Skill ${pendingChanges(pending, reviews) === 1 ? 'change waits' : 'changes wait'} for your review` : allFresh.length ? `${formatCount(allFresh.length)} new ${allFresh.length === 1 ? 'item' : 'items'} in the ${periodLabel}` : `Nothing new in the ${periodLabel}`}
            facts={[`${formatCount(items.length)} learning items`, ...LIFECYCLE.map((st) => `${formatCount(inStage(items, st.key).length)} ${st.label.toLowerCase()}`), `revision ${worker.revision}`]}
            action={
              pending.length ? (
                <Button asChild className="px-5"><Link to={`/learning/items/${pending[0].id}`} state={{ from: { label: workerLabel(id), to: withPeriod(`/learning/workers/${id}`, period) } }}><Hourglass aria-hidden="true" />Review Skill changes</Link></Button>
              ) : (
                <Button asChild variant="outline" className="bg-card px-5"><Link to={`/workers/${id}?view=runs`}>Open its runs</Link></Button>
              )
            }
          />

          <Panel id="new" flush>
            <StageTabs items={items.filter(isNew)} value={stage} onChange={setStage} withAll pending={pending} />
            {stage === 'knowledge' && <div className="border-b px-5 py-2.5"><KindTabs items={allFresh} stage={stage} kind={kind} onChange={setKind} /></div>}
            <ItemList key={`${stage}|${kind}|${period}`} items={fresh} prefix="n" label="New learning" showWorker={false} from={{ label: workerLabel(id), to: withPeriod(`/learning/workers/${id}`, period) }} empty={<>Nothing new{stage || kind ? ' here' : ''} in the {periodLabel}.{period !== 'all' && <> <button type="button" className="text-primary-strong underline-offset-4 hover:underline" onClick={() => setPeriod('all')}>Show all learning</button></>}</>} />
          </Panel>

          {earlier.length > 0 && (
            <Panel
              id="earlier"
              title="Previously recorded"
              icon={Archive}
              hue="blue"
              count={earlier.length}
              flush
              aside={<Button variant="ghost" size="sm" onClick={() => setShowEarlier((v) => !v)} aria-expanded={showEarlier} aria-controls="earlier-list">{showEarlier ? 'Hide' : 'Show'}<ChevronDown className={showEarlier ? 'rotate-180' : undefined} aria-hidden="true" /></Button>}
            >
              {showEarlier && <div id="earlier-list"><ItemList key={`${stage}|${kind}|${period}`} items={earlier} prefix="e" label="Previously recorded learning" showWorker={false} from={{ label: workerLabel(id), to: withPeriod(`/learning/workers/${id}`, period) }} empty="Nothing earlier." /></div>}
            </Panel>
          )}

          <EvolutionPanel workerId={id} />
        </>
      )}
    </PageContainer>
  )
}
