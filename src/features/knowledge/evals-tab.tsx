import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { formatPercent } from '@/lib/format'
import type { Evaluation } from '@/lib/types/catalog'
import { LibraryRow, ShowMore } from './list-parts'

const ALL = '__all'
const PAGE = 20
const human = (key: string) => key.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export function EvalsTab({ evals }: { evals: Evaluation[] }) {
  const [category, setCategory] = useState(ALL)
  const [gate, setGate] = useState<'all' | 'gate' | 'measured'>('all')
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [open, setOpen] = useState<Evaluation | null>(null)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of evals) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [evals])

  const matching = evals.filter(
    (e) =>
      (category === ALL || e.category === category) &&
      (gate === 'all' || (gate === 'gate' ? e.hard_gate : !e.hard_gate)) &&
      (!q.trim() || `${e.name} ${e.id} ${e.description ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())),
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <InputGroup className="lg:max-w-xs">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE) }} placeholder="Search EVALs" aria-label="Search EVALs" />
        </InputGroup>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={category} onValueChange={(v) => { if (v) { setCategory(v); setShown(PAGE) } }} aria-label="Measured as" className="w-max">
            <ToggleGroupItem value={ALL}>All <span className="text-muted-foreground tabular-nums">{evals.length}</span></ToggleGroupItem>
            {categories.slice(0, 5).map(([c, n]) => <ToggleGroupItem key={c} value={c}>{human(c)} <span className="text-muted-foreground tabular-nums">{n}</span></ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={gate} onValueChange={(v) => v && setGate(v as typeof gate)} aria-label="Gate" className="lg:ml-auto">
          <ToggleGroupItem value="all">Any</ToggleGroupItem>
          <ToggleGroupItem value="gate">Required gates</ToggleGroupItem>
          <ToggleGroupItem value="measured">Measured checks</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {matching.length === 0 ? (
        <EmptyState icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => { setQ(''); setCategory(ALL); setGate('all') }}>Clear filters</Button>} />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {matching.slice(0, shown).map((e) => (
              <LibraryRow
                key={e.id}
                label={`Open ${e.name}`}
                onOpen={() => setOpen(e)}
                title={e.name}
                meta={`${human(e.category)} · ${e.id}`}
                aside={
                  <>
                    {e.pass_threshold !== null && <span className="text-meta text-muted-foreground tabular-nums">Passes at {formatPercent(e.pass_threshold)}</span>}
                    <StatusBadge tone="neutral" icon={null}>{e.hard_gate ? 'Required gate' : 'Measured check'}</StatusBadge>
                  </>
                }
              />
            ))}
          </ul>
          <ShowMore shown={Math.min(shown, matching.length)} total={matching.length} onMore={() => setShown((n) => n + PAGE)} />
        </Card>
      )}

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open ? `${human(open.category)} · v${open.version}` : undefined} width="lg">
        {open && (
          <div className="flex flex-col gap-6">
            <p className="text-body whitespace-pre-line">{open.description?.trim() || 'The registry stores no description for this check.'}</p>
            <FactList>
              <Fact label="Key"><span className="font-mono text-meta">{open.id}</span></Fact>
              <Fact label="Holds a Worker to it">{open.hard_gate ? 'Required gate: a run fails without it' : 'Measured check: recorded, does not fail a run'}</Fact>
              <Fact label="Passes at">{open.pass_threshold !== null ? formatPercent(open.pass_threshold) : 'No threshold recorded'}</Fact>
              <Fact label="Measured as">{human(open.category)}</Fact>
            </FactList>
          </div>
        )}
      </DetailSheet>
    </div>
  )
}
