import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Bot, Brain, ClipboardCheck, PencilLine, Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { Details, IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import type { KnowledgeSkill, SkillLibrary } from '@/lib/types/catalog'
import { LibraryRow, Toolbar } from './list-parts'

const ALL = '__all'
const human = (key: string) => key.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

function SkillDetail({ skill }: { skill: KnowledgeSkill }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body">{skill.description}</p>
      <Details
        rows={[
          { label: 'Kind', value: skill.skill_type === 'definition_of_done' ? 'Definition of Done' : 'Capability' },
          { label: 'Category', value: human(skill.category) },
          { label: 'Version', value: `${skill.version} · ${skill.status}` },
          { label: 'Carried by', value: `${skill.worker_count} ${skill.worker_count === 1 ? 'Worker' : 'Workers'}` },
          { label: 'Loadable by', value: skill.assigned_agent_keys.length === 0 ? 'Not loadable yet' : `${skill.assigned_agent_keys.length} Agents` },
          { label: 'Provenance', value: `${skill.provenance === 'internal' ? 'Internal' : 'External'} · ${skill.license ?? 'Internal'}` },
          ...(skill.source_technology || skill.target_technology ? [{ label: 'Converts', value: `${skill.source_technology ?? '?'} → ${skill.target_technology ?? '?'}` }] : []),
          ...(skill.tags.length > 0 ? [{ label: 'Tags', value: skill.tags.join(', ') }] : []),
          { label: 'Key', value: <span className="font-mono text-meta break-all">{skill.name}</span> },
        ]}
      />
      <p className="rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground">Full Skill content isn’t available in this demo.</p>
    </div>
  )
}

export function SkillsTab({ library }: { library: SkillLibrary }) {
  const [group, setGroup] = useState<string>(ALL)
  const [category, setCategory] = useState<string>(ALL)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<KnowledgeSkill | null>(null)

  const matching = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return library.skills
      .filter((s) => (group === ALL ? true : group === 'ungrouped' ? !s.grouped : s.group === group && s.grouped))
      .filter((s) => category === ALL || s.category === category)
      .filter((s) => !needle || [s.title, s.name, s.description, ...s.tags].some((f) => f.toLowerCase().includes(needle)))
      .sort((a, b) => b.worker_count - a.worker_count || a.title.localeCompare(b.title))
  }, [library, group, category, q])
  const ungrouped = library.skills.filter((s) => !s.grouped).length

  return (
    <div className="flex flex-col gap-5">
      {library.partial && <StatusBadge tone="warning">Some sources couldn’t be loaded, so this list is incomplete</StatusBadge>}
      <Panel id="skills" flush>
        <Toolbar>
          <InputGroup className="lg:max-w-xs">
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            <InputGroupInput type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Skills" aria-label="Search Skills" />
          </InputGroup>
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
            <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={group} onValueChange={(v) => { if (v) { setGroup(v) } }} aria-label="Group" className="w-max bg-card">
              <ToggleGroupItem value={ALL}>All <span className="text-muted-foreground tabular-nums">{library.skills.length}</span></ToggleGroupItem>
              {library.groups.map((g) => (
                <ToggleGroupItem key={g.key} value={g.key}>{g.label} <span className="text-muted-foreground tabular-nums">{g.total - g.ungrouped}</span></ToggleGroupItem>
              ))}
              {ungrouped > 0 && <ToggleGroupItem value="ungrouped">Unmapped <span className="text-muted-foreground tabular-nums">{ungrouped}</span></ToggleGroupItem>}
            </ToggleGroup>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-card lg:ml-auto lg:w-52" aria-label="Category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Every category</SelectItem>
              {library.categories.map((c) => <SelectItem key={c} value={c}>{human(c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Toolbar>

        {matching.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => { setQ(''); setGroup(ALL); setCategory(ALL) }}>Clear filters</Button>} />
        ) : (
          <Paged key={[group, category, q].join('|')} rows={matching} label="Skills">{(page) => (
            <ul className="divide-y">
              {page.map((s) => (
                <LibraryRow
                  key={s.name}
                  label={`Open ${s.title}`}
                  onOpen={() => setOpen(s)}
                  icon={s.skill_type === 'definition_of_done' ? <IconTile icon={ClipboardCheck} hue="amber" /> : <IconTile icon={Brain} hue="violet" />}
                  title={s.title}
                  meta={`${human(s.category)} · v${s.version}${s.skill_type === 'definition_of_done' ? ' · Definition of Done' : ''}`}
                  aside={
                    <>
                      {s.assigned_agent_keys.length === 0 && <StatusBadge tone="neutral" icon={null}>Not yet loadable</StatusBadge>}
                      <span className="inline-flex w-28 items-center justify-end gap-1.5 text-meta text-muted-foreground tabular-nums"><Bot className="size-3.5" aria-hidden="true" />{s.worker_count === 0 ? 'No Workers' : `${s.worker_count} ${s.worker_count === 1 ? 'Worker' : 'Workers'}`}</span>
                    </>
                  }
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
        width="lg"
        footer={open && (
          <Button asChild variant="outline" className="ml-auto">
            <Link to={`/knowledge/capture?revise=${open.name}`}><PencilLine aria-hidden="true" />Revise this Skill</Link>
          </Button>
        )}
      >
        {open && <SkillDetail skill={open} />}
      </DetailSheet>
    </div>
  )
}
