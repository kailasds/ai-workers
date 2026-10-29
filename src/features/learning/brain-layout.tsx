import { Brain, BrainCircuit, ShieldCheck } from 'lucide-react'
import { HubLayout, Kpi, KpiBand } from '@/components/platform/hub'
import { useResource } from '@/hooks/use-resource'
import { getEvaluations, getSkillLibrary } from '@/lib/api/catalog'
import { formatCount } from '@/lib/format'
import { useSentinel } from '@/features/sentinel/use-sentinel'
import { useLearning } from './use-learning'

// Brain is the second main menu: what Workers know (Knowledge), what they add by running
// (Learning) and whether they can be trusted (Sentinel). Same shape as Home: one header, one band
// of figures, then the three areas as tabs at their own URLs.
//
// Tab counts, each one documented quantity:
//   Knowledge  Skills in the library
//   Learning   Workers with any learning activity (memory records or items gathering evidence)
//   Sentinel   items that need attention (the Sentinel Overview's list)

export function BrainLayout() {
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const evals = useResource('k-evals', (signal) => getEvaluations({ signal }))
  const l = useLearning()
  const s = useSentinel()
  const o = s.overview.data
  const records = l.workers.reduce((n, w) => n + w.learning.memories, 0)

  const band = (
    <KpiBand title="Overview" columns={3}>
      <Kpi label="Skills in the library" icon={Brain} hue="violet" value={skills.data?.skills.length} loading={!skills.data && !skills.error} failed={Boolean(skills.error && !skills.data)} to="/knowledge/skills" caption={evals.data ? `${formatCount(evals.data.evaluations.length)} EVAL Playbooks to hold them to` : 'Reusable instructions'} />
      <Kpi label="Workers with learning" icon={BrainCircuit} hue="cyan" value={l.ready ? l.learningWorkers : undefined} unit={l.ready ? `of ${formatCount(l.workers.length)}` : undefined} loading={!l.ready && !l.error} failed={Boolean(l.error)} to="/learning" caption={l.ready ? `${formatCount(records)} memory records · ${formatCount(l.held.length)} items gathering evidence` : 'Memory and patterns from runs'} />
      <Kpi label="Needs attention" icon={ShieldCheck} hue="rose" value={o ? s.attention.length : undefined} loading={!o && !s.overview.error} failed={Boolean(s.overview.error && !o)} to="/sentinel" caption={o ? `${formatCount(o.coverage.reporting)} of ${formatCount(o.coverage.running)} running Workers report to Sentinel` : 'Across all Workers'} />
    </KpiBand>
  )

  return (
    <HubLayout
      title="Brain"
      band={band}
      tabsLabel="Brain"
      stages={[
        { to: '/knowledge', label: 'Knowledge', icon: Brain, hue: 'violet', count: skills.data?.skills.length },
        { to: '/learning', label: 'Learning', icon: BrainCircuit, hue: 'cyan', count: l.ready ? l.learningWorkers : undefined },
        { to: '/sentinel', label: 'Sentinel', icon: ShieldCheck, hue: 'rose', count: o ? s.attention.length : undefined },
      ]}
    />
  )
}
