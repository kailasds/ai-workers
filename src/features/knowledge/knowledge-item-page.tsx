import { Link, Navigate, useParams } from 'react-router'
import { Info, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { FactList, PanelPart } from '@/components/platform/detail-parts'
import { FactStrip, Panel } from '@/components/platform/panel'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getSkillLibrary } from '@/lib/api/catalog'
import { dodView, evalView, languageView, skillView, type ItemView } from './item-views'

type View = 'skills' | 'languages' | 'evals' | 'dod'
const LABEL: Record<View, string> = { skills: 'Skills', languages: 'Domain languages', evals: 'EVAL Playbooks', dod: 'Definition of Done' }

// Read the one library the item belongs to, then find the item in it.
async function load(view: View, id: string, signal: AbortSignal): Promise<ItemView | null> {
  if (view === 'skills') { const s = (await getSkillLibrary({ signal })).skills.find((x) => x.name === id); return s ? skillView(s) : null }
  if (view === 'languages') { const d = (await getDslDomains({ signal })).domains.find((x) => x.domain_id === id); return d ? languageView(d) : null }
  if (view === 'evals') { const e = (await getEvaluations({ signal })).evaluations.find((x) => x.id === id); return e ? evalView(e) : null }
  const r = (await getDodRubrics({ signal })).rubrics.find((x) => x.criterion_key === id)
  return r ? dodView(r) : null
}

/** One Knowledge library item on its own page: headline facts, then a single summary panel. */
export function KnowledgeItemPage() {
  const { view = '', itemId = '' } = useParams()
  const ok = view in LABEL
  const res = useResource(`k-item:${view}:${itemId}`, (signal) => (ok ? load(view as View, itemId, signal) : Promise.resolve(null)))
  if (!ok) return <Navigate to="/knowledge/skills" replace />
  const crumbs: Crumb[] = [{ label: 'Knowledge', to: '/knowledge/skills' }, { label: LABEL[view as View], to: `/knowledge/${view}` }]

  if (res.error) return <PageContainer><PageHeader crumbs={crumbs} title="Couldn’t load this item" /><ErrorState title="The library could not be read." message={res.error.message} onRetry={res.refresh} /></PageContainer>
  if (res.pending && !res.data) {
    return (
      <PageContainer>
        <PageHeader crumbs={crumbs} title="Loading…" />
        <LoadingRegion label="Loading…" className="flex flex-col gap-3"><Skeleton className="h-20" /><Skeleton className="h-64" /></LoadingRegion>
      </PageContainer>
    )
  }
  const v = res.data
  if (!v) {
    return (
      <PageContainer>
        <PageHeader crumbs={crumbs} title="Not found" />
        <EmptyState icon={SearchX} title="There is no item with this key" action={<Button asChild variant="outline"><Link to={`/knowledge/${view}`}>Back to {LABEL[view as View]}</Link></Button>} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={v.title} meta={<div className="flex flex-wrap items-center gap-2">{v.badges}</div>} actions={v.actions} />
      <FactStrip facts={v.strip} />
      <Panel id="summary" title="Summary" icon={v.icon} hue={v.hue} flush>
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="text-body whitespace-pre-line">{v.summary}</p>
          <FactList facts={v.facts} />
        </div>
        {v.parts.map((p) => (
          <div key={p.title}>
            <PanelPart icon={p.icon} title={p.title} />
            {p.body}
          </div>
        ))}
        {v.note && <p className="flex items-center gap-2 border-t px-5 py-3 text-meta text-muted-foreground"><Info className="size-4 shrink-0" aria-hidden="true" />{v.note}</p>}
      </Panel>
    </PageContainer>
  )
}
