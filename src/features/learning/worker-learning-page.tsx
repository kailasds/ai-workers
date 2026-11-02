import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Archive, BarChart3, BrainCircuit, CalendarClock, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { distribution, inPeriod, itemsOf, PERIODS, WORKER_BY_ID_SAFE, workerLabel, workerScope } from './model'
import { CategoryBars, FactStrip, ItemList, Panel, PeriodSelect } from './ui'
import { useFrom, usePeriod, withPeriod } from './nav'

/**
 * One Worker's learning: what it has learned so far, by the same categories as the platform,
 * then what is new in the period and, folded away, what it recorded before.
 */
export function WorkerLearningPage() {
  const { id = '' } = useParams()
  const [period, setPeriod] = usePeriod()
  const from = useFrom(workerLabel(id))
  const worker = WORKER_BY_ID_SAFE(id)
  const [showEarlier, setShowEarlier] = useState(false)
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
  const fresh = items.filter((i) => inPeriod(i, period))
  const earlier = items.filter((i) => !inPeriod(i, period))
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const latest = items.find((i) => i.when.kind === 'at') ?? items[0]

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
          <FactStrip
            facts={[
              { icon: BrainCircuit, label: 'Learning items', value: formatCount(items.length) },
              { icon: Sparkles, label: `New in the ${periodLabel}`, value: formatCount(fresh.length) },
              { icon: CalendarClock, label: latest?.when.kind === 'as_of' ? 'Latest (as of)' : 'Latest learning', value: latest ? <Timestamp iso={latest.when.iso} /> : '—' },
            ]}
          />

          <Panel id="so-far" title="Learning so far" icon={BarChart3} hue="cyan" count={items.length} flush>
            <CategoryBars rows={distribution(items)} hrefFor={(k) => withPeriod(`/learning/workers/${id}/${k}`, period)} label="This Worker’s learning by category" />
          </Panel>

          <Panel id="new" title="New learning" icon={Sparkles} hue="violet" count={fresh.length} flush>
            <ItemList items={fresh} from={from} prefix="n" label="New learning" showWorker={false} empty={<>Nothing new in the {periodLabel}. <button type="button" className="text-primary-strong underline-offset-4 hover:underline" onClick={() => setPeriod('all')}>Show all learning</button></>} />
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
