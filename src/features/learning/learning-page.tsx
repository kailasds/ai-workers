import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BarChart3, Bot, ChevronRight, Search, SearchX, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pager } from '@/components/platform/pager'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import { distribution, ITEMS, PERIODS, workersWithNew, type WorkerLearning } from './model'
import { CategoryBars, IconTile, Panel, PeriodSelect } from './ui'
import { usePeriod, withPeriod } from './nav'

function WorkerRow({ w, to }: { w: WorkerLearning; to: string }) {
  return (
    <Link to={to} className="flex items-start gap-4 px-5 py-4 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
      <IconTile icon={Bot} hue="blue" />
      <div className="min-w-0 flex-1">
        <p className="text-item">{w.name}</p>
        <p className="truncate text-meta text-muted-foreground">{w.scope}</p>
        {w.latest && (
          <p className="mt-2 flex min-w-0 items-center gap-2 text-meta">
            <Sparkles className="size-3.5 shrink-0 text-hue-violet" aria-hidden="true" />
            <span className="truncate">{w.latest.title}</span>
            <span className="shrink-0 text-muted-foreground">· <Timestamp iso={w.latest.when.iso} /></span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 self-center">
        <span className="text-right">
          <span className="block text-item tabular-nums">{formatCount(w.fresh.length)}</span>
          <span className="block text-meta text-muted-foreground">new</span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  )
}

/**
 * Learning, platform first: what every Worker has learned so far, by category, and which Workers
 * learned something in the period. Both lead into the same category, Worker and item screens.
 */
export function LearningPage() {
  const [params, setParams] = useSearchParams()
  const [period, setPeriod] = usePeriod()
  const [q, setQ] = useState(params.get('q') ?? '')
  const sort = params.get('sort') === 'count' ? 'count' : 'recent'
  const rows = workersWithNew(period, { q, sort })
  const paged = usePaged(rows, { prefix: 'w', defaultSize: 10 })
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const write = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (v) n.set(k, v)
      else n.delete(k)
      n.delete('wpage')
      return n
    }, { replace: true, preventScrollReset: true })

  return (
    <div className="flex flex-col gap-6">
      <Panel id="so-far" title="Learning so far" icon={BarChart3} hue="cyan" count={ITEMS.length} flush>
        <CategoryBars rows={distribution(ITEMS)} hrefFor={(k) => withPeriod(`/learning/categories/${k}`, period)} label="Learning items by category, across all Workers" />
      </Panel>

      <Panel id="new" title="Workers with new learning" icon={Users} hue="violet" count={rows.length} flush>
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            <InputGroupInput
              value={q}
              onChange={(e) => { setQ(e.target.value); write('q', e.target.value || null) }}
              placeholder="Search Workers or learning"
              aria-label="Search Workers or learning"
            />
          </InputGroup>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => write('sort', v === 'count' ? 'count' : null)}>
              <SelectTrigger className="w-44" aria-label="Sort Workers"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent learning</SelectItem>
                <SelectItem value="count">Most new items</SelectItem>
              </SelectContent>
            </Select>
            <PeriodSelect value={period} onChange={setPeriod} />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            className="m-5"
            icon={SearchX}
            title={q ? 'No Worker matches that search' : `No Worker learned anything in the ${periodLabel}`}
            action={q ? <Button variant="outline" onClick={() => { setQ(''); write('q', null) }}>Clear search</Button> : period !== 'all' ? <Button variant="outline" onClick={() => setPeriod('all')}>Show all learning</Button> : undefined}
          />
        ) : (
          <>
            <ul aria-label="Workers with new learning" className="divide-y">
              {paged.rows.map((w) => <li key={w.workerId}><WorkerRow w={w} to={withPeriod(`/learning/workers/${w.workerId}`, period)} /></li>)}
            </ul>
            {rows.length > 10 && <div className="border-t px-5 py-3"><Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} label="Workers with new learning" pageSizes={PAGE_SIZES} onPageSize={paged.setSize} /></div>}
          </>
        )}
      </Panel>
    </div>
  )
}
