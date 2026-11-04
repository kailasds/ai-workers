import { useState } from 'react'
import { ClipboardCheck, Eye, Gauge, SearchX, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { TabBar } from '@/components/platform/tab-bar'
import type { DodRubric } from '@/lib/types/catalog'
import { LIBRARY_PAGE, LibraryRow, SearchBox } from './list-parts'
import { AVAILABILITY, knowledgeItemTo, METHOD_ICON } from './item-views'

type View = 'gates' | 'tracked'

export function DodTab({ rubrics }: { rubrics: DodRubric[] }) {
  const blocked = (r: DodRubric) => r.availability !== 'AVAILABLE'
  // Open on the list that holds a criterion that can't be measured yet: it needs attention.
  const [view, setView] = useState<View>(() => (!rubrics.some((r) => r.gating_by_default && blocked(r)) && rubrics.some((r) => !r.gating_by_default && blocked(r)) ? 'tracked' : 'gates'))
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const found = rubrics.filter((r) => !needle || `${r.display_name} ${r.criterion_key} ${r.aliases.join(' ')}`.toLowerCase().includes(needle))
  const gating = found.filter((r) => r.gating_by_default)
  const observed = found.filter((r) => !r.gating_by_default)
  // A criterion that can't be measured yet needs attention, so it leads its list.
  const rows = [...(view === 'gates' ? gating : observed)].sort((a, b) => Number(blocked(b)) - Number(blocked(a)))

  return (
    <>
      <Panel id="dod" title="Definition of Done" icon={ClipboardCheck} hue="amber" count={found.length} flush aside={<SearchBox value={q} onChange={setQ} label="Search criteria" />}>
        <TabBar
          label="Release role"
          value={view}
          onChange={(v) => setView(v as View)}
          items={[
            { value: 'gates', label: 'Release gates', icon: ShieldCheck, count: gating.length, alert: gating.some(blocked) },
            { value: 'tracked', label: 'Tracked only', icon: Eye, count: observed.length, alert: observed.some(blocked) },
          ]}
        />
        {rows.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => setQ('')}>Clear search</Button>} />
        ) : (
          <Paged key={[view, q].join('|')} rows={rows} label={view === 'gates' ? 'Release gates' : 'Tracked only'} size={LIBRARY_PAGE}>{(page) => (
            <ul className="divide-y">
              {page.map((r) => (
                <LibraryRow
                  key={r.criterion_key}
                  icon={<IconTile icon={METHOD_ICON[r.method] ?? Gauge} hue={r.gating_by_default ? 'amber' : 'blue'} size="sm" />}
                  label={`Open ${r.display_name}`}
                  to={knowledgeItemTo('dod', r.criterion_key)}
                  title={r.display_name}
                  aside={blocked(r) ? <span className="inline-flex items-center gap-1.5 text-warning" title={AVAILABILITY[r.availability] ?? r.availability}><TriangleAlert className="size-4" aria-hidden="true" /><span className="sr-only">{AVAILABILITY[r.availability] ?? r.availability}</span></span> : undefined}
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

    </>
  )
}
