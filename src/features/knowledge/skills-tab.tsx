import { useMemo, useState } from 'react'
import { Brain, ClipboardCheck, Code2, FolderTree, Layers, SearchX, ShieldCheck, TriangleAlert, UserRound, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { TabBar } from '@/components/platform/tab-bar'
import type { SkillLibrary } from '@/lib/types/catalog'
import { ALL, FiltersButton, human, LIBRARY_PAGE, LibraryRow, SearchBox } from './list-parts'
import { isDod, knowledgeItemTo, workers } from './item-views'

const GROUP_ICON: Record<string, typeof Brain> = { engineering: Code2, security: ShieldCheck, compliance: ClipboardCheck, domain: FolderTree }
export function SkillsTab({ library }: { library: SkillLibrary }) {
  const [group, setGroup] = useState<string>(ALL)
  const [category, setCategory] = useState<string>(ALL)
  const [loadable, setLoadable] = useState<string>(ALL)
  const [q, setQ] = useState('')
  const clear = () => { setQ(''); setCategory(ALL); setLoadable(ALL) }

  const matching = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return library.skills
      .filter((s) => (group === ALL ? true : group === 'ungrouped' ? !s.grouped : s.group === group && s.grouped))
      .filter((s) => category === ALL || s.category === category)
      .filter((s) => loadable === ALL || (loadable === 'yes') === s.assigned_agent_keys.length > 0)
      .filter((s) => !needle || [s.title, s.name, s.description, ...s.tags].some((f) => f.toLowerCase().includes(needle)))
      .sort((a, b) => b.worker_count - a.worker_count || a.title.localeCompare(b.title))
  }, [library, group, category, loadable, q])
  const ungrouped = library.skills.filter((s) => !s.grouped).length

  return (
    <>
      {library.partial && <StatusBadge tone="warning">Some sources couldn’t be loaded, so this list is incomplete</StatusBadge>}
      <Panel
        id="skills"
        title="Skills"
        icon={Brain}
        hue="violet"
        count={matching.length}
        flush
        aside={
          <>
            <SearchBox value={q} onChange={setQ} label="Search Skills" />
            <FiltersButton
              onClear={clear}
              fields={[
                { id: 'k-category', label: 'Category', value: category, onChange: setCategory, options: [{ value: ALL, label: 'Every category' }, ...library.categories.map((c) => ({ value: c, label: human(c) }))] },
                { id: 'k-loadable', label: 'Loadable by Agents', value: loadable, onChange: setLoadable, options: [{ value: ALL, label: 'Any' }, { value: 'yes', label: 'Loadable' }, { value: 'no', label: 'Not yet loadable' }] },
              ]}
            />
          </>
        }
      >
        <TabBar
          label="Skill group"
          value={group}
          onChange={setGroup}
          items={[
            { value: ALL, label: 'All', icon: Layers, count: library.skills.length },
            ...library.groups.map((g) => ({ value: g.key, label: g.label, icon: GROUP_ICON[g.key] ?? Wrench, count: g.total - g.ungrouped })),
            ...(ungrouped > 0 ? [{ value: 'ungrouped', label: 'Unmapped', icon: TriangleAlert, count: ungrouped }] : []),
          ]}
        />
        {matching.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => { clear(); setGroup(ALL) }}>Clear filters</Button>} />
        ) : (
          <Paged key={[group, category, loadable, q].join('|')} rows={matching} label="Skills" size={LIBRARY_PAGE}>{(page) => (
            <ul className="divide-y">
              {page.map((s) => (
                <LibraryRow
                  key={s.name}
                  label={`Open ${s.title}`}
                  to={knowledgeItemTo('skills', s.name)}
                  icon={<IconTile icon={isDod(s) ? ClipboardCheck : Brain} hue={isDod(s) ? 'amber' : 'violet'} size="sm" />}
                  title={s.title}
                  aside={<><UserRound className="size-3.5" aria-hidden="true" />{workers(s.worker_count)}</>}
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

    </>
  )
}
