import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Cpu, PencilLine, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getSkillLibrary } from '@/lib/api/catalog'
import { DodTab } from './dod-tab'
import { EvalsTab } from './evals-tab'
import { LanguagesTab } from './languages-tab'
import { SkillsTab } from './skills-tab'

const TABS = ['skills', 'languages', 'evals', 'dod', 'models'] as const
type Tab = (typeof TABS)[number]

const SCOPE: Record<Tab, string> = {
  skills: 'TCS knowledge available as reusable Worker capabilities.',
  languages: 'Business concepts, rules and relationships, by the area that speaks them.',
  evals: 'Every check a Worker can be held to, and how each one is decided.',
  dod: 'What a Worker has to prove before its work counts as done.',
  models: 'Fine-tuned small language models available to Workers.',
}

function Loading({ label }: { label: string }) {
  return <LoadingRegion label={label} className="flex flex-col gap-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}</LoadingRegion>
}

export function KnowledgePage() {
  const { view: tab = 'skills' } = useParams()
  const navigate = useNavigate()
  // A reference library: read once, no Refresh.
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const dsl = useResource('k-dsl', (signal) => getDslDomains({ signal }))
  const evals = useResource('k-evals', (signal) => getEvaluations({ signal }))
  const dod = useResource('k-dod', (signal) => getDodRubrics({ signal }))

  if (!TABS.includes(tab as Tab)) return <Navigate to="/knowledge/skills" replace />
  const current = tab as Tab

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge"
        description="The library of what TCS knows, and what a Worker can be given."
        actions={
          <>
            <Button asChild variant="ghost"><Link to="/knowledge/coverage"><Scale aria-hidden="true" />Governance</Link></Button>
            <Button asChild><Link to="/knowledge/capture"><PencilLine aria-hidden="true" />Write a Skill</Link></Button>
          </>
        }
      />
      <div className="flex flex-col gap-2">
        <SectionNav
          value={current}
          onChange={(v) => navigate(`/knowledge/${v}`)}
          items={[
            { value: 'skills', label: 'Skills', count: skills.data?.skills.length },
            { value: 'languages', label: 'Domain languages', count: dsl.data?.domains.length },
            { value: 'evals', label: 'EVAL Playbooks', count: evals.data?.evaluations.length },
            { value: 'dod', label: 'Definition of Done', count: dod.data?.rubrics.length },
            { value: 'models', label: 'SLM Farm' },
          ]}
        />
        <p className="text-meta text-muted-foreground">{SCOPE[current]}</p>
      </div>

      {current === 'skills' && (skills.error ? <ErrorState title="The Skill library could not be read from this platform." message={skills.error.message} onRetry={skills.refresh} /> : !skills.data ? <Loading label="Reading the registry…" /> : <SkillsTab library={skills.data} />)}
      {current === 'languages' && (dsl.error ? <ErrorState title="The language catalogue could not be read." message={dsl.error.message} onRetry={dsl.refresh} /> : !dsl.data ? <Loading label="Reading the languages…" /> : <LanguagesTab domains={dsl.data.domains} />)}
      {current === 'evals' && (evals.error ? <ErrorState title="The EVAL catalogue could not be read." message={evals.error.message} onRetry={evals.refresh} /> : !evals.data ? <Loading label="Reading EVALs…" /> : <EvalsTab evals={evals.data.evaluations} />)}
      {current === 'dod' && (dod.error ? <ErrorState title="The Definition of Done library could not be read." message={dod.error.message} onRetry={dod.refresh} /> : !dod.data ? <Loading label="Reading the Definition of Done…" /> : <DodTab rubrics={dod.data.rubrics} />)}
      {current === 'models' && <EmptyState icon={Cpu} title="No fine-tuned small language model is registered" description="A domain-taught model appears here beside the general model it was taught from, so the difference is the domain." />}
    </PageContainer>
  )
}
