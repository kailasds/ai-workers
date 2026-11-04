import { Link, Navigate, useParams } from 'react-router'
import { BookText, Brain, ClipboardCheck, Cpu, FileCheck2, PencilLine, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BannerTabs } from '@/components/platform/banner-tabs'
import { Panel } from '@/components/platform/panel'
import { SummaryBanner } from '@/components/platform/summary-banner'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getSkillLibrary } from '@/lib/api/catalog'
import { formatCount } from '@/lib/format'
import { DodTab } from './dod-tab'
import { EvalsTab } from './evals-tab'
import { LanguagesTab } from './languages-tab'
import { SkillsTab } from './skills-tab'

const TABS = ['skills', 'languages', 'evals', 'dod', 'models'] as const
type Tab = (typeof TABS)[number]

const n = (x: number | undefined, one: string, many = `${one}s`) => (x === undefined ? '…' : `${formatCount(x)} ${x === 1 ? one : many}`)

function Loading({ label }: { label: string }) {
  return <LoadingRegion label={label} className="flex flex-col gap-2 rounded-xl border bg-card p-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12" />)}</LoadingRegion>
}

export function KnowledgePage() {
  const { view: tab = 'skills' } = useParams()
  // A reference library: read once, no Refresh.
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const dsl = useResource('k-dsl', (signal) => getDslDomains({ signal }))
  const evals = useResource('k-evals', (signal) => getEvaluations({ signal }))
  const dod = useResource('k-dod', (signal) => getDodRubrics({ signal }))

  if (!TABS.includes(tab as Tab)) return <Navigate to="/knowledge/skills" replace />
  const current = tab as Tab

  // Every figure is counted from the library as read.
  const sk = skills.data?.skills
  const langs = dsl.data?.domains
  const ev = evals.data?.evaluations
  const rb = dod.data?.rubrics
  const unloadable = sk?.filter((s) => s.assigned_agent_keys.length === 0).length
  const unmeasurable = rb?.filter((r) => r.availability !== 'AVAILABLE').length
  const write = <Button asChild className="px-5"><Link to="/knowledge/capture"><PencilLine aria-hidden="true" />Write a Skill</Link></Button>
  const govern = <Button asChild variant="outline" className="bg-card px-5"><Link to="/knowledge/coverage"><Scale aria-hidden="true" />Governance</Link></Button>

  const summary: Record<Tab, { title: string; facts: string[]; action: React.ReactNode }> = {
    skills: {
      title: `${n(sk?.length, 'Skill')} in the library`,
      facts: sk ? [`${formatCount(sk.filter((s) => s.worker_count > 0).length)} carried by Workers`, `${formatCount(unloadable ?? 0)} not yet loadable`, `${n(skills.data?.categories.length, 'category', 'categories')}`] : [],
      action: <>{govern}{write}</>,
    },
    languages: {
      title: `${n(langs?.length, 'domain language')} published`,
      facts: langs ? [`${formatCount(langs.filter((d) => d.plugin_slug).length)} available to Workers`, `${formatCount(langs.filter((d) => !d.plugin_slug).length)} not yet available`] : [],
      action: govern,
    },
    evals: {
      title: `${n(ev?.length, 'EVAL Playbook')} to check work with`,
      facts: ev ? [`${n(ev.filter((e) => e.hard_gate).length, 'required gate')}`, `${n(ev.filter((e) => !e.hard_gate).length, 'measured check')}`] : [],
      action: govern,
    },
    dod: {
      title: unmeasurable ? `${n(unmeasurable, 'criterion', 'criteria')} can’t be measured yet` : `${n(rb?.length, 'Definition of Done criterion', 'Definition of Done criteria')}`,
      facts: rb ? [`${n(rb.length, 'criterion', 'criteria')}`, `${n(rb.filter((r) => r.gating_by_default).length, 'release gate')}`, `${formatCount(rb.filter((r) => !r.gating_by_default).length)} tracked only`] : [],
      action: govern,
    },
    models: {
      title: 'No fine-tuned model is registered',
      facts: [],
      action: govern,
    },
  }
  const cur = summary[current]

  return (
    <div className="flex flex-col gap-5">
      <SummaryBanner hue="violet" icon={Brain} eyebrow="Knowledge" title={cur.title} facts={cur.facts} action={cur.action}>
        <BannerTabs
          label="Knowledge library"
          value={current}
          items={[
            { value: 'skills', label: 'Skills', to: '/knowledge/skills', icon: Brain, line: n(sk?.length, 'Skill') },
            { value: 'languages', label: 'Domain languages', to: '/knowledge/languages', icon: BookText, line: n(langs?.length, 'language') },
            { value: 'evals', label: 'EVAL Playbooks', to: '/knowledge/evals', icon: FileCheck2, line: n(ev?.length, 'EVAL') },
            { value: 'dod', label: 'Definition of Done', to: '/knowledge/dod', icon: ClipboardCheck, line: unmeasurable ? `${formatCount(unmeasurable)} not measurable` : n(rb?.length, 'criterion', 'criteria'), alert: Boolean(unmeasurable) },
            { value: 'models', label: 'SLM Farm', to: '/knowledge/models', icon: Cpu, line: 'None registered' },
          ]}
        />
      </SummaryBanner>

      {current === 'skills' && (skills.error ? <ErrorState title="Couldn’t load Skills." message={skills.error.message} onRetry={skills.refresh} /> : !skills.data ? <Loading label="Loading Skills…" /> : <SkillsTab library={skills.data} />)}
      {current === 'languages' && (dsl.error ? <ErrorState title="The language catalogue could not be read." message={dsl.error.message} onRetry={dsl.refresh} /> : !dsl.data ? <Loading label="Reading the languages…" /> : <LanguagesTab domains={dsl.data.domains} />)}
      {current === 'evals' && (evals.error ? <ErrorState title="The EVAL catalogue could not be read." message={evals.error.message} onRetry={evals.refresh} /> : !evals.data ? <Loading label="Reading EVALs…" /> : <EvalsTab evals={evals.data.evaluations} />)}
      {current === 'dod' && (dod.error ? <ErrorState title="The Definition of Done library could not be read." message={dod.error.message} onRetry={dod.refresh} /> : !dod.data ? <Loading label="Reading the Definition of Done…" /> : <DodTab rubrics={dod.data.rubrics} />)}
      {current === 'models' && (
        <Panel id="models" title="SLM Farm" icon={Cpu} hue="cyan">
          <EmptyState icon={Cpu} title="No fine-tuned small language model is registered" description="Fine-tuned models will show up here next to their base model." />
        </Panel>
      )}
    </div>
  )
}
