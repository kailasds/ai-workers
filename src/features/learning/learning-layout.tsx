import { useLocation } from 'react-router'
import { Boxes, Brain, BrainCircuit, ShieldCheck } from 'lucide-react'
import { HubLayout, Kpi, KpiBand } from '@/components/platform/hub'
import { useResource } from '@/hooks/use-resource'
import { getEvaluations, getHarnesses, getSentinelOverview, getSkillLibrary } from '@/lib/api/catalog'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'

// Learning is the second main menu: what Workers know (Knowledge), what they add by running
// (Learning), whether they can be trusted (Sentinel) and what they run on (Harnesses). Same shape
// as Home: one header, one band of figures, then the four areas as tabs at their own URLs.

function useLearningFigures() {
  const { search } = useLocation()
  const scenario = new URLSearchParams(search).get('mock')
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const evals = useResource('k-evals', (signal) => getEvaluations({ signal }))
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const sentinel = useResource('sentinel-overview', (signal) => getSentinelOverview({ signal }))
  const harnesses = useResource('harnesses', (signal) => getHarnesses({ signal }))
  return { skills, evals, portfolio, sentinel, harnesses }
}

export function LearningLayout() {
  const f = useLearningFigures()
  const workers = f.portfolio.data?.workers
  const learning = workers?.filter((w) => w.learning.memories > 0)
  const memories = workers?.reduce((n, w) => n + w.learning.memories, 0)
  const o = f.sentinel.data
  const h = f.harnesses.data?.harnesses
  const available = h?.filter((x) => x.availability === 'available').length

  const band = (
    <KpiBand title="What Workers know, at a glance">
      <Kpi label="Skills in the library" icon={Brain} hue="violet" value={f.skills.data?.skills.length} loading={!f.skills.data && !f.skills.error} failed={Boolean(f.skills.error && !f.skills.data)} to="/knowledge/skills" caption={f.evals.data ? `${formatCount(f.evals.data.evaluations.length)} EVAL Playbooks to hold them to` : 'Reusable Worker capabilities'} />
      <Kpi label="Workers that have learned" icon={BrainCircuit} hue="cyan" value={learning?.length} unit={workers ? `of ${formatCount(workers.length)}` : undefined} loading={!f.portfolio.data && !f.portfolio.error} failed={Boolean(f.portfolio.error && !f.portfolio.data)} to="/learning" caption={memories !== undefined ? `${formatCount(memories)} memory records from running` : 'Memory records from running'} />
      <Kpi label="Watched by a reporting Sentinel" icon={ShieldCheck} hue="rose" value={o?.coverage.reporting} unit={o ? `of ${formatCount(o.coverage.running)} running` : undefined} loading={!o && !f.sentinel.error} failed={Boolean(f.sentinel.error && !o)} to="/sentinel" caption={o ? `${formatCount(o.needs_review)} need review · ${formatCount(o.in_force.length)} restrictions in force` : 'Oversight across every Worker'} />
      <Kpi label="Harnesses" icon={Boxes} hue="amber" value={h?.length} loading={!h && !f.harnesses.error} failed={Boolean(f.harnesses.error && !h)} to="/harnesses" caption={available !== undefined ? `${formatCount(available)} available to compose with` : 'Execution adapters Workers run on'} />
    </KpiBand>
  )

  return (
    <HubLayout
      title="Learning"
      band={band}
      tabsLabel="Learning"
      stages={[
        { to: '/knowledge', label: 'Knowledge', icon: Brain, hue: 'violet', count: f.skills.data?.skills.length },
        { to: '/learning', label: 'Learning', icon: BrainCircuit, hue: 'cyan', count: learning?.length },
        { to: '/sentinel', label: 'Sentinel', icon: ShieldCheck, hue: 'rose', count: o?.needs_review },
        { to: '/harnesses', label: 'Harnesses', icon: Boxes, hue: 'amber', count: h?.length },
      ]}
    />
  )
}
