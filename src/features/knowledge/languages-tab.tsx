import { useMemo, useState } from 'react'
import { BookText, CircleCheck, CircleDashed, Landmark, Languages, Layers, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { TabBar } from '@/components/platform/tab-bar'
import type { DslDomain } from '@/lib/types/catalog'
import { ALL, FiltersButton, LIBRARY_PAGE, LibraryRow, SearchBox } from './list-parts'
import { areaOf, knowledgeItemTo } from './item-views'

// Languages are filed by the business area they belong to: the same BFSI tree EVALs use.
export function LanguagesTab({ domains }: { domains: DslDomain[] }) {
  const [area, setArea] = useState<string>(ALL)
  const [avail, setAvail] = useState<string>(ALL)
  const [q, setQ] = useState('')

  const areas = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of domains) map.set(areaOf(d), (map.get(areaOf(d)) ?? 0) + 1)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [domains])

  const needle = q.trim().toLowerCase()
  const matching = domains
    .filter((d) => area === ALL || areaOf(d) === area)
    .filter((d) => avail === ALL || (avail === 'yes') === Boolean(d.plugin_slug))
    .filter((d) => !needle || `${d.name} ${d.path} ${d.lines_of_business.join(' ')}`.toLowerCase().includes(needle))

  if (domains.length === 0) return <EmptyState icon={Languages} title="No domain language is published yet" />

  return (
    <>
      <Panel
        id="languages"
        title="Domain languages"
        icon={BookText}
        hue="blue"
        count={matching.length}
        flush
        aside={
          <>
            <SearchBox value={q} onChange={setQ} label="Search languages" />
            <FiltersButton
              onClear={() => setAvail(ALL)}
              fields={[{ id: 'k-avail', label: 'Available to Workers', value: avail, onChange: setAvail, options: [{ value: ALL, label: 'Any' }, { value: 'yes', label: 'Available' }, { value: 'no', label: 'Not yet available' }] }]}
            />
          </>
        }
      >
        <TabBar
          label="Business area"
          value={area}
          onChange={setArea}
          items={[{ value: ALL, label: 'All', icon: Layers, count: domains.length }, ...areas.map(([a, n]) => ({ value: a, label: a, icon: Landmark, count: n }))]}
        />
        {matching.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => { setQ(''); setAvail(ALL); setArea(ALL) }}>Clear filters</Button>} />
        ) : (
          <Paged key={[area, avail, q].join('|')} rows={matching} label="Domain languages" size={LIBRARY_PAGE}>{(page) => (
            <ul className="divide-y">
              {page.map((d) => (
                <LibraryRow
                  key={d.domain_id}
                  label={`Open ${d.name}`}
                  to={knowledgeItemTo('languages', d.domain_id)}
                  icon={<IconTile icon={BookText} hue="blue" size="sm" />}
                  title={d.name}
                  aside={
                    d.plugin_slug
                      ? <span className="inline-flex items-center gap-1.5 text-success" title="Available to Workers"><CircleCheck className="size-4" aria-hidden="true" /><span className="sr-only">Available to Workers</span></span>
                      : <span className="inline-flex items-center gap-1.5" title="Not yet available"><CircleDashed className="size-4" aria-hidden="true" /><span className="sr-only">Not yet available</span></span>
                  }
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

    </>
  )
}
