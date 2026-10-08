import { useMemo, useState } from 'react'
import { Languages } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import type { DslDomain } from '@/lib/types/catalog'
import { GroupHeader, LibraryRow } from './list-parts'

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
      const area = d.path.includes(' > ') ? d.path.split(' > ')[0] : 'Filed nowhere'
      map.set(area, [...(map.get(area) ?? []), d])
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [domains])

  if (domains.length === 0) return <EmptyState icon={Languages} title="No domain language is published yet" />

  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        {groups.map(([area, items]) => (
          <section key={area} aria-label={area}>
            <GroupHeader label={area} count={items.length} />
            <ul className="divide-y">
              {items.map((d) => (
                <LibraryRow
                  key={d.domain_id}
                  label={`Open ${d.name}`}
                  onOpen={() => setOpen(d)}
                  title={d.name}
                  meta={`${d.path.split(' > ').slice(1, -1).join(' › ') || d.path} · ${d.lines_of_business.length ? d.lines_of_business.join(', ') : 'All lines of business'}`}
                  aside={d.plugin_slug ? <span className="text-meta text-muted-foreground">Available to Workers</span> : <StatusBadge tone="neutral" icon={null}>Not yet available to Workers</StatusBadge>}
                />
              ))}
            </ul>
          </section>
        ))}
      </Card>
      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open?.path} width="lg">
        {open && (
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {Object.entries(open.statistics).filter(([, v]) => v > 0).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-meta text-muted-foreground">{STAT_LABELS[k] ?? k}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <FactList>
              <Fact label="Version">{open.version}</Fact>
              <Fact label="Market">{open.market ?? 'Not stated'}</Fact>
              <Fact label="Industry">{open.industry ?? 'Not stated'}</Fact>
              <Fact label="Lines of business">{open.lines_of_business.length ? open.lines_of_business.join(', ') : 'All lines of business'}</Fact>
              <Fact label="Workers can use it">{open.plugin_slug ? `Yes · ${open.plugin_slug}` : 'Not yet: browsable, not usable'}</Fact>
            </FactList>
            <p className="rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground">The concept and rule graph is read from the registry when opened. The offline capture holds the catalogue only.</p>
          </div>
        )}
      </DetailSheet>
    </>
  )
}
