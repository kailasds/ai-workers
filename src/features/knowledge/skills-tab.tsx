import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PencilLine, Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import type { KnowledgeSkill, SkillLibrary } from '@/lib/types/catalog'
import { LibraryRow, ShowMore } from './list-parts'

const ALL = '__all'
const PAGE = 20
const human = (key: string) => key.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

function SkillDetail({ skill }: { skill: KnowledgeSkill }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body">{skill.description}</p>
      <FactList>
        <Fact label="Key"><span className="font-mono text-meta">{skill.name}</span></Fact>
        <Fact label="Kind">{skill.skill_type === 'definition_of_done' ? 'Definition of Done Skill: defines what done means' : 'Capability: how to do the work'}</Fact>
        <Fact label="Category">{human(skill.category)}</Fact>
        <Fact label="Version">{skill.version} · {skill.status}</Fact>
        <Fact label="Carried by">{skill.worker_count} {skill.worker_count === 1 ? 'Worker' : 'Workers'}</Fact>
        <Fact label="Loadable by">{skill.assigned_agent_keys.length === 0 ? <span className="text-muted-foreground">No Agent yet: published, not loadable</span> : `${skill.assigned_agent_keys.length} Agents`}</Fact>
        <Fact label="Provenance">{skill.provenance === 'internal' ? 'Internal' : 'External'} · {skill.license ?? 'Internal, no external licence'}</Fact>
        {(skill.source_technology || skill.target_technology) && <Fact label="Converts">{skill.source_technology ?? '?'} → {skill.target_technology ?? '?'}</Fact>}
        {skill.tags.length > 0 && <Fact label="Tags">{skill.tags.join(', ')}</Fact>}
      </FactList>
      <p className="rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground">The full SKILL.md and its companion files are read from the registry when opened. The offline capture holds the catalogue only.</p>
    </div>
  )
}

export function SkillsTab({ library }: { library: SkillLibrary }) {
  const [group, setGroup] = useState<string>(ALL)
  const [category, setCategory] = useState<string>(ALL)
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(PAGE)
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
  const groupInfo = library.groups.find((g) => g.key === group)

  return (
    <div className="flex flex-col gap-5">
      {library.partial && <StatusBadge tone="warning">A source is missing: this catalogue is partial, not small</StatusBadge>}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <InputGroup className="lg:max-w-xs">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE) }} placeholder="What are you looking for?" aria-label="Search Skills" />
        </InputGroup>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={group} onValueChange={(v) => { if (v) { setGroup(v); setShown(PAGE) } }} aria-label="Group" className="w-max">
            <ToggleGroupItem value={ALL}>All <span className="text-muted-foreground tabular-nums">{library.skills.length}</span></ToggleGroupItem>
            {library.groups.map((g) => (
              <ToggleGroupItem key={g.key} value={g.key}>{g.label} <span className="text-muted-foreground tabular-nums">{g.total - g.ungrouped}</span></ToggleGroupItem>
            ))}
            {ungrouped > 0 && <ToggleGroupItem value="ungrouped">Unmapped <span className="text-muted-foreground tabular-nums">{ungrouped}</span></ToggleGroupItem>}
          </ToggleGroup>
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setShown(PAGE) }}>
          <SelectTrigger className="w-full lg:ml-auto lg:w-52" aria-label="Category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Every category</SelectItem>
            {library.categories.map((c) => <SelectItem key={c} value={c}>{human(c)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {groupInfo && <p className="-mt-2 text-meta text-muted-foreground">{groupInfo.summary}</p>}

      {matching.length === 0 ? (
        <EmptyState icon={SearchX} title="Nothing matches that" description="Try fewer words, or another group or category." action={<Button variant="outline" onClick={() => { setQ(''); setGroup(ALL); setCategory(ALL) }}>Clear filters</Button>} />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {matching.slice(0, shown).map((s) => (
              <LibraryRow
                key={s.name}
                label={`Open ${s.title}`}
                onOpen={() => setOpen(s)}
                title={s.title}
                meta={`${human(s.category)} · v${s.version}${s.skill_type === 'definition_of_done' ? ' · Definition of Done' : ''}`}
                aside={
                  <>
                    {s.assigned_agent_keys.length === 0 && <StatusBadge tone="neutral" icon={null}>Not yet loadable</StatusBadge>}
                    <span className="w-24 text-right text-meta text-muted-foreground tabular-nums">{s.worker_count === 0 ? 'No Workers' : `${s.worker_count} ${s.worker_count === 1 ? 'Worker' : 'Workers'}`}</span>
                  </>
                }
              />
            ))}
          </ul>
          <ShowMore shown={Math.min(shown, matching.length)} total={matching.length} onMore={() => setShown((n) => n + PAGE)} />
        </Card>
      )}

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
