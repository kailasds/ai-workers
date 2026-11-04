import { useLocation } from 'react-router'
import { BookText, Brain, BrainCircuit, ClipboardCheck, FileCheck2, Hourglass, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { HubLayout, Kpi, KpiBand } from '@/components/platform/hub'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getSkillLibrary } from '@/lib/api/catalog'
import { formatCount } from '@/lib/format'
import { useDemo } from '@/features/sentinel/demo/store'
import { attention } from '@/features/sentinel/demo/selectors'
import { pendingChanges, useReviews } from './reviews'
import { ITEMS, inPeriod } from './model'

// Brain is the second main menu: what Workers know (Knowledge), what they add by running
// (Learning) and whether they can be trusted (Sentinel). Same shape as Home: one header, the three
// areas as tabs at their own URLs, then the selected area's own figures and content.
//
// Tab counts, each one documented quantity:
//   Knowledge  Skills in the library
//   Learning   Workers with learning (any learning item in the snapshot)
//   Sentinel   items that need attention (the Sentinel Overview's list, from the demo governance data)
//
// Sentinel carries its own figures under its own section tabs, so the hub shows no band for it.

const LEARNING_WORKERS = new Set(ITEMS.map((i) => i.workerId)).size

function KnowledgeBand() {
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const dsl = useResource('k-dsl', (signal) => getDslDomains({ signal }))
  const evals = useResource('k-evals', (signal) => getEvaluations({ signal }))
  const dod = useResource('k-dod', (signal) => getDodRubrics({ signal }))
  const state = (r: { data?: unknown; error?: unknown }) => ({ loading: !r.data && !r.error, failed: Boolean(r.error && !r.data) })
  return (
    <KpiBand title="Overview">
      <Kpi label="Skills in the library" icon={Brain} hue="violet" value={skills.data?.skills.length} {...state(skills)} to="/knowledge/skills" />
      <Kpi label="Domain languages" icon={BookText} hue="blue" value={dsl.data?.domains.length} {...state(dsl)} to="/knowledge/languages" />
      <Kpi label="EVAL Playbooks" icon={FileCheck2} hue="teal" value={evals.data?.evaluations.length} {...state(evals)} to="/knowledge/evals" />
      <Kpi label="Definition of Done" icon={ClipboardCheck} hue="amber" value={dod.data?.rubrics.length} {...state(dod)} to="/knowledge/dod" />
    </KpiBand>
  )
}

function LearningBand() {
  const recent = ITEMS.filter((i) => inPeriod(i, '7'))
  const kept = ITEMS.filter((i) => i.state === 'agreed').length
  const gathering = ITEMS.filter((i) => i.state === 'gathering').length
  const reviews = useReviews()
  const review = ITEMS.filter((i) => i.state === 'proposed' && !reviews[i.id])
  return (
    <KpiBand title="Overview">
      <Kpi label="Learning items" icon={BrainCircuit} hue="cyan" value={ITEMS.length} loading={false} failed={false} to="/learning?stage=all#stage" caption={`${formatCount(kept)} agreed across runs · ${formatCount(gathering)} collecting evidence`} />
      <Kpi label="Workers with learning" icon={Users} hue="blue" value={LEARNING_WORKERS} loading={false} failed={false} to="/learning?period=all#new" />
      <Kpi label="New in the last 7 days" icon={Sparkles} hue="violet" value={recent.length} loading={false} failed={false} to="/learning#new" caption={`From ${formatCount(new Set(recent.map((i) => i.workerId)).size)} Workers`} />
      <Kpi label="Awaiting review" icon={Hourglass} hue="amber" value={pendingChanges(review, reviews)} loading={false} failed={false} to="/learning?stage=skill-changes#stage" caption={`Skill changes from ${formatCount(review.length)} Workers`} />
    </KpiBand>
  )
}

export function BrainLayout() {
  const { pathname } = useLocation()
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const needs = attention(useDemo()).length
  const band = pathname.startsWith('/learning') ? <LearningBand /> : pathname.startsWith('/sentinel') ? null : <KnowledgeBand />

  return (
    <HubLayout
      title="Brain"
      band={band}
      tabsLabel="Brain"
      stages={[
        { to: '/knowledge', label: 'Knowledge', icon: Brain, hue: 'violet', count: skills.data?.skills.length },
        { to: '/learning', label: 'Learning', icon: BrainCircuit, hue: 'cyan', count: LEARNING_WORKERS },
        { to: '/sentinel', label: 'Sentinel', icon: ShieldCheck, hue: 'rose', count: needs },
      ]}
    />
  )
}
