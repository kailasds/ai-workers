import { Brain, BrainCircuit, ShieldCheck } from 'lucide-react'
import { HubLayout } from '@/components/platform/hub'
import { useResource } from '@/hooks/use-resource'
import { getSkillLibrary } from '@/lib/api/catalog'
import { useDemo } from '@/features/sentinel/demo/store'
import { attention } from '@/features/sentinel/demo/selectors'
import { ITEMS } from './model'

// Brain is the second main menu: what Workers know (Knowledge), what they add by running
// (Learning) and whether they can be trusted (Sentinel). Same shape as Home: one header, the three
// areas as tabs at their own URLs, then the selected area's own figures and content.
//
// Tab counts, each one documented quantity:
//   Knowledge  Skills in the library
//   Learning   Workers with learning (any learning item in the snapshot)
//   Sentinel   items that need attention (the Sentinel Overview's list, from the demo governance data)
//
// Knowledge, Learning and Sentinel each carry their own summary banner, so the hub shows no band.

const LEARNING_WORKERS = new Set(ITEMS.map((i) => i.workerId)).size

export function BrainLayout() {
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const needs = attention(useDemo()).length

  return (
    <HubLayout
      title="Brain"
      band={null}
      tabsLabel="Brain"
      stages={[
        { to: '/knowledge', label: 'Knowledge', icon: Brain, hue: 'violet', count: skills.data?.skills.length },
        { to: '/learning', label: 'Learning', icon: BrainCircuit, hue: 'cyan', count: LEARNING_WORKERS },
        { to: '/sentinel', label: 'Sentinel', icon: ShieldCheck, hue: 'rose', count: needs },
      ]}
    />
  )
}
