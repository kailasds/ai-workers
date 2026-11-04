import { useMemo, useState } from 'react'
import { BookText, Briefcase, Building2, CircleCheck, CircleDashed, Globe2, Landmark, Languages, Layers, Plug, SearchX, Sigma, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { TabBar } from '@/components/platform/tab-bar'
import type { DslDomain } from '@/lib/types/catalog'
import { ALL, DemoNote, FactGrid, FiltersButton, LIBRARY_PAGE, LibraryRow, SearchBox, SheetHero, SheetSection } from './list-parts'

const STAT_LABELS: Record<string, string> = {
  entities: 'Entities',
  individual_rules: 'Rules',
  axioms: 'Axioms',
  metrics: 'Metrics',
  process_steps: 'Process steps',
  hybrid_rules: 'Hybrid rules',
  deterministic_rules: 'Deterministic rules',
  non_deterministic_rules: 'Non-deterministic rules',
  discovery_patterns: 'Discovery patterns',
  rule_categories: 'Rule categories',
  class_codes: 'Class codes',
}

const areaOf = (d: DslDomain) => (d.path.includes(' > ') ? d.path.split(' > ')[0] : 'Uncategorised')

// Languages are filed by the business area they belong to: the same BFSI tree EVALs use.
export function LanguagesTab({ domains }: { domains: DslDomain[] }) {
  const [area, setArea] = useState<string>(ALL)
  const [avail, setAvail] = useState<string>(ALL)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<DslDomain | null>(null)

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
                  onOpen={() => setOpen(d)}
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

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open?.path.split(' > ').join(' › ')} width="2xl">
        {open && (
          <>
            <SheetHero
              icon={BookText}
              hue="blue"
              text={`A domain language for ${open.lines_of_business.length ? open.lines_of_business.join(', ') : 'every line of business'}.`}
              badges={
                <>
                  <StatusBadge tone="neutral" icon={null}>v{open.version}</StatusBadge>
                  {open.plugin_slug ? <StatusBadge tone="success">Available to Workers</StatusBadge> : <StatusBadge tone="neutral" icon={null}>Not yet available</StatusBadge>}
                </>
              }
            />
            <FactGrid
              facts={[
                { icon: Globe2, label: 'Market', value: open.market ?? 'Not stated' },
                { icon: Building2, label: 'Industry', value: open.industry ?? 'Not stated' },
                { icon: Briefcase, label: 'Lines of business', value: open.lines_of_business.length ? open.lines_of_business.join(', ') : 'All' },
                { icon: Plug, label: 'Workers use it as', value: open.plugin_slug ?? 'Not yet' },
              ]}
            />
            {Object.values(open.statistics).some((v) => v > 0) && (
              <SheetSection icon={Sigma} title="What it defines">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(open.statistics).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} className="rounded-block border px-4 py-3">
                      <dt className="flex items-center gap-1.5 text-meta text-muted-foreground"><Tag className="size-3.5" aria-hidden="true" />{STAT_LABELS[k] ?? k}</dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </SheetSection>
            )}
            <DemoNote>Full rule graph isn’t available in this demo.</DemoNote>
          </>
        )}
      </DetailSheet>
    </>
  )
}
