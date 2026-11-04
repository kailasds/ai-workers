import { useMemo, useState } from 'react'
import { FileCheck2, FolderTree, Gauge, GitCommitVertical, KeyRound, Layers, SearchX, ShieldCheck, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { TabBar } from '@/components/platform/tab-bar'
import { formatPercent } from '@/lib/format'
import type { Evaluation } from '@/lib/types/catalog'
import { ALL, FactGrid, FiltersButton, human, LIBRARY_PAGE, LibraryRow, Mono, SearchBox, SheetHero } from './list-parts'

type Gate = 'all' | 'gate' | 'measured'

export function EvalsTab({ evals }: { evals: Evaluation[] }) {
  const [category, setCategory] = useState(ALL)
  const [gate, setGate] = useState<Gate>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Evaluation | null>(null)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of evals) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [evals])

  const needle = q.trim().toLowerCase()
  const base = evals.filter((e) => (category === ALL || e.category === category) && (!needle || `${e.name} ${e.id} ${e.description ?? ''}`.toLowerCase().includes(needle)))
  const matching = base.filter((e) => gate === 'all' || (gate === 'gate' ? e.hard_gate : !e.hard_gate))

  return (
    <>
      <Panel
        id="evals"
        title="EVAL Playbooks"
        icon={FileCheck2}
        hue="teal"
        count={matching.length}
        flush
        aside={
          <>
            <SearchBox value={q} onChange={setQ} label="Search EVALs" />
            <FiltersButton
              onClear={() => setCategory(ALL)}
              fields={[{ id: 'k-measured', label: 'Measured as', value: category, onChange: setCategory, options: [{ value: ALL, label: 'Every category' }, ...categories.map(([c, n]) => ({ value: c, label: `${human(c)} (${n})` }))] }]}
            />
          </>
        }
      >
        <TabBar
          label="EVAL type"
          value={gate}
          onChange={(v) => setGate(v as Gate)}
          items={[
            { value: 'all', label: 'All', icon: Layers, count: base.length },
            { value: 'gate', label: 'Required gates', icon: ShieldCheck, count: base.filter((e) => e.hard_gate).length },
            { value: 'measured', label: 'Measured checks', icon: Gauge, count: base.filter((e) => !e.hard_gate).length },
          ]}
        />
        {matching.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => { setQ(''); setCategory(ALL); setGate('all') }}>Clear filters</Button>} />
        ) : (
          <Paged key={[category, gate, q].join('|')} rows={matching} label="EVALs" size={LIBRARY_PAGE}>{(page) => (
            <ul className="divide-y">
              {page.map((e) => (
                <LibraryRow
                  key={e.id}
                  label={`Open ${e.name}`}
                  onOpen={() => setOpen(e)}
                  icon={e.hard_gate ? <IconTile icon={ShieldCheck} hue="amber" size="sm" /> : <IconTile icon={Gauge} hue="teal" size="sm" />}
                  title={e.name}
                  aside={e.pass_threshold !== null ? <><Target className="size-3.5" aria-hidden="true" />{formatPercent(e.pass_threshold)}</> : undefined}
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open ? human(open.category) : undefined} width="2xl">
        {open && (
          <>
            <SheetHero
              icon={open.hard_gate ? ShieldCheck : Gauge}
              hue={open.hard_gate ? 'amber' : 'teal'}
              text={open.description?.trim() || 'No description.'}
              badges={<StatusBadge tone={open.hard_gate ? 'warning' : 'neutral'} icon={null}>{open.hard_gate ? 'Required gate' : 'Measured check'}</StatusBadge>}
            />
            <FactGrid
              facts={[
                { icon: Target, label: 'Passes at', value: open.pass_threshold !== null ? formatPercent(open.pass_threshold) : 'No threshold' },
                { icon: FolderTree, label: 'Measured as', value: human(open.category) },
                { icon: GitCommitVertical, label: 'Version', value: `v${open.version}` },
                { icon: KeyRound, label: 'Key', value: <Mono>{open.id}</Mono> },
              ]}
            />
          </>
        )}
      </DetailSheet>
    </>
  )
}
