import { useMemo, useState } from 'react'
import { BookText, Landmark, Languages } from 'lucide-react'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { Details, IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import type { DslDomain } from '@/lib/types/catalog'
import { LibraryRow } from './list-parts'

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

// Languages are filed by the business hierarchy they belong to: the same BFSI tree EVALs use.
export function LanguagesTab({ domains }: { domains: DslDomain[] }) {
  const [open, setOpen] = useState<DslDomain | null>(null)
  const groups = useMemo(() => {
    const map = new Map<string, DslDomain[]>()
    for (const d of domains) {
      const area = d.path.includes(' > ') ? d.path.split(' > ')[0] : 'Uncategorised'
      map.set(area, [...(map.get(area) ?? []), d])
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [domains])

  if (domains.length === 0) return <EmptyState icon={Languages} title="No domain language is published yet" />

  return (
    <>
      <div className="flex flex-col gap-6">
        {groups.map(([area, items]) => (
          <Panel key={area} id={`area-${area.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} title={area} icon={Landmark} hue="blue" count={items.length} flush>
            <Paged rows={items} label={area}>{(page) => <ul className="divide-y">
              {page.map((d) => (
                <LibraryRow
                  key={d.domain_id}
                  label={`Open ${d.name}`}
                  onOpen={() => setOpen(d)}
                  icon={<IconTile icon={BookText} hue="blue" />}
                  title={d.name}
                  meta={`${d.path.split(' > ').slice(1, -1).join(' › ') || d.path} · ${d.lines_of_business.length ? d.lines_of_business.join(', ') : 'All lines of business'}`}
                  aside={d.plugin_slug ? <StatusBadge tone="success">Available to Workers</StatusBadge> : <StatusBadge tone="neutral" icon={null}>Not yet available</StatusBadge>}
                />
              ))}
            </ul>}</Paged>
          </Panel>
        ))}
      </div>
      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open?.path} width="lg">
        {open && (
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(open.statistics).filter(([, v]) => v > 0).map(([k, v]) => (
                <div key={k} className="rounded-block bg-muted px-3 py-2.5">
                  <dt className="text-meta text-muted-foreground">{STAT_LABELS[k] ?? k}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t pt-6">
              <Details
                rows={[
                  { label: 'Version', value: open.version },
                  { label: 'Market', value: open.market ?? 'Not stated' },
                  { label: 'Industry', value: open.industry ?? 'Not stated' },
                  { label: 'Lines of business', value: open.lines_of_business.length ? open.lines_of_business.join(', ') : 'All' },
                  { label: 'Workers can use it', value: open.plugin_slug ? `Yes · ${open.plugin_slug}` : 'Not yet' },
                ]}
              />
            </div>
            <p className="rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground">Full rule graph isn’t available in this demo.</p>
          </div>
        )}
      </DetailSheet>
    </>
  )
}
