import { useSearchParams } from 'react-router'
import { LayoutList } from 'lucide-react'
import { TabBar } from '@/components/platform/tab-bar'
import { CATEGORY_LOOK } from './look'
import { inStage, isLifecycleStage, LIFECYCLE, type LifecycleStage } from './journey'
import { CATEGORIES, CATEGORY, isCategory, type CategoryKey, type LearningItem } from './model'
import { TypeTabs } from './ui'

const STAGE_ICON = { experiences: CATEGORY_LOOK.experiences.icon, knowledge: CATEGORY_LOOK.facts.icon, 'skill-changes': CATEGORY_LOOK['skill-changes'].icon } as const

/** The selected stage and category, kept in the URL as `stage` and `kind`. */
export function useStage(fallback: LifecycleStage | null): { stage: LifecycleStage | null; kind: CategoryKey | null; setStage: (s: LifecycleStage | null) => void; setKind: (k: string) => void } {
  const [params, setParams] = useSearchParams()
  const raw = params.get('stage')
  const stage = raw === 'all' ? null : isLifecycleStage(raw) ? raw : fallback
  const kindRaw = params.get('kind') ?? undefined
  const kind = isCategory(kindRaw) && (!stage || LIFECYCLE.find((s) => s.key === stage)!.categories.includes(kindRaw)) ? kindRaw : null
  const write = (changes: Record<string, string | null>) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      for (const [k, v] of Object.entries(changes)) {
        if (v) n.set(k, v)
        else n.delete(k)
      }
      for (const k of [...n.keys()]) if (k.endsWith('page')) n.delete(k)
      return n
    }, { replace: true, preventScrollReset: true })
  return {
    stage,
    kind,
    setStage: (s) => write({ stage: s === fallback ? null : (s ?? 'all'), kind: null }),
    setKind: (k) => write({ kind: k === 'all' ? null : k }),
  }
}

/** Category tabs inside a stage that holds more than one category (Knowledge). */
export function KindTabs({ items, stage, kind, onChange }: { items: LearningItem[]; stage: LifecycleStage | null; kind: CategoryKey | null; onChange: (k: string) => void }) {
  const cats = stage ? LIFECYCLE.find((s) => s.key === stage)!.categories : CATEGORIES.map((c) => c.key)
  if (cats.length < 2) return null
  const options = [
    { value: 'all', label: 'All', icon: LayoutList, count: items.filter((i) => cats.includes(i.category)).length },
    ...cats.map((c) => ({ value: c, label: c === 'experiences' ? 'Experiences' : CATEGORY[c].label, icon: CATEGORY_LOOK[c].icon, count: items.filter((i) => i.category === c).length })),
  ]
  return <TypeTabs value={kind ?? 'all'} onChange={onChange} options={options} label="Type of learning" />
}

/**
 * The learning lifecycle as tabs on top of its list: Run experiences → Knowledge → Skill changes,
 * each with how many items `items` holds in it. The counts never claim one stage became the next.
 */
export function StageTabs({ items, value, onChange, withAll = false, pending = [] }: { items: LearningItem[]; value: LifecycleStage | null; onChange: (s: LifecycleStage | null) => void; withAll?: boolean; pending?: LearningItem[] }) {
  const tabs = [
    ...(withAll ? [{ value: 'all', label: 'All', icon: LayoutList, count: items.length, alert: pending.length > 0 }] : []),
    ...LIFECYCLE.map((st) => ({ value: st.key, label: st.label, icon: STAGE_ICON[st.key], count: inStage(items, st.key).length, alert: inStage(pending, st.key).length > 0 })),
  ]
  return <TabBar items={tabs} value={value ?? 'all'} onChange={(v) => onChange(v === 'all' ? null : (v as LifecycleStage))} label="Learning lifecycle" steps={!withAll} />
}
