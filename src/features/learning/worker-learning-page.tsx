import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Archive, BrainCircuit, ChevronDown, LayoutList, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { CATEGORIES, inPeriod, isCategory, itemsOf, PERIODS, WORKER_BY_ID_SAFE, workerLabel, workerScope } from './model'
import { Panel } from '@/components/platform/panel'
import { CATEGORY_LOOK } from './look'
import { EvolutionPanel } from './growth'
import { ItemList, PeriodSelect, TypeTabs } from './ui'
import { useFrom, usePeriod, withPeriod } from './nav'

/**
 * One Worker's learning: its figures, then what is new in the period with the categories as tabs
 * (the tab is kept in the URL as `type`), and, folded away, what it recorded before.
 */
export function WorkerLearningPage() {
  const { id = '' } = useParams()
  const [period, setPeriod] = usePeriod()
  const from = useFrom(workerLabel(id))
  const worker = WORKER_BY_ID_SAFE(id)
  const [showEarlier, setShowEarlier] = useState(false)
  const [params, setParams] = useSearchParams()
  const type = params.get('type')
  const category = isCategory(type ?? undefined) ? type : null
  const crumbs = [{ label: 'Learning', to: withPeriod('/learning#new', period) }, { label: worker ? workerLabel(id) : 'Worker not found' }]

  if (!worker) {
    return (
      <PageContainer>
        <PageHeader crumbs={crumbs} title="Worker not found" />
        <EmptyState icon={BrainCircuit} title="There is no Worker with this id in the snapshot" action={<Button asChild variant="outline"><Link to="/learning">Back to Learning</Link></Button>} />
      </PageContainer>
    )
  }

  const items = itemsOf(id)
  const allFresh = items.filter((i) => inPeriod(i, period))
  const ofType = (list: typeof items) => (category ? list.filter((i) => i.category === category) : list)
  const fresh = ofType(allFresh)
  const earlier = ofType(items.filter((i) => !inPeriod(i, period)))
  const setType = (v: string) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (v === 'all') n.delete('type')
      else n.set('type', v)
      for (const k of [...n.keys()]) if (k.endsWith('page')) n.delete(k)
      return n
    }, { replace: true, preventScrollReset: true })
  const tabs = [
    { value: 'all', label: 'All', icon: LayoutList, count: allFresh.length },
    ...CATEGORIES.map((c) => ({ value: c.key, label: c.key === 'experiences' ? 'Experiences' : c.label, icon: CATEGORY_LOOK[c.key].icon, count: allFresh.filter((i) => i.category === c.key).length })),
  ]
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()

  return (
    <PageContainer>
      <PageHeader
        crumbs={crumbs}
        title={workerLabel(id)}
        meta={<p className="text-body text-muted-foreground">{workerScope(id)} · revision {worker.revision}</p>}
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
          <EvolutionPanel workerId={id} revision={worker.revision} />

          <Panel id="new" title="New learning" icon={Sparkles} hue="violet" count={allFresh.length} flush aside={<TypeTabs value={category ?? 'all'} onChange={setType} options={tabs} label="Type of learning" />}>
            <ItemList items={fresh} from={from} prefix="n" label="New learning" showWorker={false} empty={<>Nothing new{category ? ' of this type' : ''} in the {periodLabel}. <button type="button" className="text-primary-strong underline-offset-4 hover:underline" onClick={() => setPeriod('all')}>Show all learning</button></>} />
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
              {showEarlier && <div id="earlier-list"><ItemList items={earlier} from={from} prefix="e" label="Previously recorded learning" showWorker={false} empty="Nothing earlier." /></div>}
            </Panel>
          )}
        </>
      )}
    </PageContainer>
  )
}
