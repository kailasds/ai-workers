import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightLeft, Bot, Brain, ClipboardCheck, Code2, FileCheck2, FolderTree, GitBranch, KeyRound, Layers, PencilLine, SearchX, ShieldCheck, Tags, TriangleAlert, UserRound, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { TabBar } from '@/components/platform/tab-bar'
import type { KnowledgeSkill, SkillLibrary } from '@/lib/types/catalog'
import { ALL, DemoNote, FactGrid, FiltersButton, human, LIBRARY_PAGE, LibraryRow, Mono, SearchBox, SheetHero, SheetSection } from './list-parts'

const GROUP_ICON: Record<string, typeof Brain> = { engineering: Code2, security: ShieldCheck, compliance: ClipboardCheck, domain: FolderTree }
const isDod = (s: KnowledgeSkill) => s.skill_type === 'definition_of_done'
const workers = (n: number) => (n === 0 ? 'No Workers' : `${n} ${n === 1 ? 'Worker' : 'Workers'}`)

function SkillDetail({ skill }: { skill: KnowledgeSkill }) {
  const loadable = skill.assigned_agent_keys.length > 0
  return (
    <>
      <SheetHero
        icon={isDod(skill) ? ClipboardCheck : Brain}
        hue={isDod(skill) ? 'amber' : 'violet'}
        text={skill.description}
        badges={
          <>
            <StatusBadge tone={['live', 'active', 'published'].includes(skill.status.toLowerCase()) ? 'success' : 'neutral'}>v{skill.version} · {human(skill.status)}</StatusBadge>
            {!loadable && <StatusBadge tone="warning">Not yet loadable</StatusBadge>}
          </>
        }
      />
      <FactGrid
        facts={[
          { icon: Layers, label: 'Kind', value: isDod(skill) ? 'Definition of Done' : 'Capability' },
          { icon: FolderTree, label: 'Category', value: human(skill.category) },
          { icon: UserRound, label: 'Carried by', value: workers(skill.worker_count) },
          { icon: Bot, label: 'Loadable by', value: loadable ? `${skill.assigned_agent_keys.length} Agents` : 'Not loadable yet' },
          { icon: GitBranch, label: 'Provenance', value: [skill.provenance === 'internal' ? 'Internal' : 'External', skill.license].filter((x, i, a) => x && a.indexOf(x) === i).join(' · ') },
          ...(skill.source_technology || skill.target_technology ? [{ icon: ArrowRightLeft, label: 'Converts', value: `${skill.source_technology ?? '?'} → ${skill.target_technology ?? '?'}` }] : []),
        ]}
      />
      {skill.tags.length > 0 && (
        <SheetSection icon={Tags} title="Tags">
          <div className="flex flex-wrap gap-2">{skill.tags.map((t) => <span key={t} className="rounded-full bg-chip-neutral px-2.5 py-0.5 text-meta">{t}</span>)}</div>
        </SheetSection>
      )}
      {skill.recommended_evaluation_ids.length > 0 && (
        <SheetSection icon={FileCheck2} title="Checked by EVALs">
          <ul className="divide-y rounded-block border">
            {skill.recommended_evaluation_ids.slice(0, 5).map((id) => (
              <li key={id} className="flex items-center gap-3 px-4 py-2.5"><FileCheck2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><Mono>{id}</Mono></li>
            ))}
          </ul>
        </SheetSection>
      )}
      <SheetSection icon={KeyRound} title="Key">
        <Mono>{skill.name}</Mono>
      </SheetSection>
      <DemoNote>Full Skill content isn’t available in this demo.</DemoNote>
    </>
  )
}

export function SkillsTab({ library }: { library: SkillLibrary }) {
  const [group, setGroup] = useState<string>(ALL)
  const [category, setCategory] = useState<string>(ALL)
  const [loadable, setLoadable] = useState<string>(ALL)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<KnowledgeSkill | null>(null)
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
                  onOpen={() => setOpen(s)}
                  icon={<IconTile icon={isDod(s) ? ClipboardCheck : Brain} hue={isDod(s) ? 'amber' : 'violet'} size="sm" />}
                  title={s.title}
                  aside={<><UserRound className="size-3.5" aria-hidden="true" />{workers(s.worker_count)}</>}
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

      <DetailSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title}
        description={open ? human(open.category) : undefined}
        width="2xl"
        footer={open && (
          <Button asChild variant="outline" className="ml-auto">
            <Link to={`/knowledge/capture?revise=${open.name}`}><PencilLine aria-hidden="true" />Revise this Skill</Link>
          </Button>
        )}
      >
        {open && <SkillDetail skill={open} />}
      </DetailSheet>
    </>
  )
}
