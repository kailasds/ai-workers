import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BarChart3, ChevronRight, LayoutGrid, List, Search, SearchX, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { HUE, workerTypeMeta } from '@/components/platform/hue'
import { Pager } from '@/components/platform/pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { domainLabel } from '@/lib/vocabulary'
import { CATEGORY_LOOK } from './look'
import { CATEGORIES, distribution, isCategory, ITEMS, learningWorkers, PERIODS, workersWithNew, type CategoryKey, type WorkerLearning } from './model'
import { usePeriod, withPeriod } from './nav'
import { CategoryBars, PeriodSelect } from './ui'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-ring'
const ANY = 'any'
const TILE_SIZES = [12, 24, 48]

function WorkerRow({ w, to }: { w: WorkerLearning; to: string }) {
  const type = workerTypeMeta(w.type)
  return (
    <Link to={to} className={cn('flex items-start gap-4 px-5 py-4 hover:bg-muted/50 focus-visible:ring-inset', FOCUS)}>
      <IconTile icon={type.icon} hue={type.hue} />
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

/** A Worker as a tile: who it is, how much is new, and how the new learning splits by category. */
function WorkerTile({ w, to }: { w: WorkerLearning; to: string }) {
  const type = workerTypeMeta(w.type)
  const split = distribution(w.fresh).filter((c) => c.count > 0)
  return (
    <Link to={to} className={cn('flex h-full flex-col gap-4 rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-primary-soft/30', FOCUS)}>
      <div className="flex items-start gap-3">
        <IconTile icon={type.icon} hue={type.hue} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-item" title={w.name}>{w.name}</p>
          <p className="truncate text-meta text-muted-foreground">{w.scope}</p>
        </div>
        <span className="shrink-0 text-right">
          <span className="block text-section leading-none tabular-nums">{formatCount(w.fresh.length)}</span>
          <span className="text-meta text-muted-foreground">new</span>
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <div role="img" aria-label={split.map((c) => `${c.count} ${c.label.toLowerCase()}`).join(', ')} className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-track">
          {split.map((c) => <span key={c.key} className={HUE[CATEGORY_LOOK[c.key].hue].solid} style={{ flexGrow: c.count, flexBasis: 0 }} />)}
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-meta text-muted-foreground">
          {split.map((c) => {
            const Icon = CATEGORY_LOOK[c.key].icon
            return (
              <li key={c.key} className="inline-flex items-center gap-1">
                <Icon className={cn('size-3.5', HUE[CATEGORY_LOOK[c.key].hue].text)} aria-hidden="true" />
                <span className="text-foreground tabular-nums">{formatCount(c.count)}</span>
                <span>{c.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Link>
  )
}

/**
 * Learning, platform first: what every Worker has learned so far, by category, and which Workers
 * learned something in the period, as a list or tiles. Both lead into the same category, Worker
 * and item screens.
 */
export function LearningPage() {
  const [params, setParams] = useSearchParams()
  const [period, setPeriod] = usePeriod()
  const [q, setQ] = useState(params.get('q') ?? '')
  const view = params.get('view') === 'list' ? 'list' : 'tiles'
  const category = isCategory(params.get('kind') ?? undefined) ? (params.get('kind') as CategoryKey) : null
  const type = params.get('type')
  const domain = params.get('domain')
  // Filter choices come from the Workers with learning in the period, so none leads to nothing.
  const all = learningWorkers(period)
  const types = [...new Set(all.map((w) => w.type))].sort()
  const domains = [...new Set(all.map((w) => w.domain).filter((d): d is string => Boolean(d)))].sort()
  const noDomain = all.some((w) => w.domain === null)
  const kinds = CATEGORIES.filter((c) => all.some((w) => w.fresh.some((i) => i.category === c.key)))
  const rows = workersWithNew(period, { q, type, domain, category })
  const paged = usePaged(rows, { prefix: 'w', defaultSize: view === 'tiles' ? TILE_SIZES[0] : 10, sizes: view === 'tiles' ? TILE_SIZES : PAGE_SIZES })
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const filtered = Boolean(q || type || domain || category)
  const write = (changes: Record<string, string | null>) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        for (const [k, v] of Object.entries(changes)) {
          if (v) n.set(k, v)
          else n.delete(k)
        }
        n.delete('wpage')
        n.delete('wsize')
        return n
      },
      { replace: true, preventScrollReset: true },
    )
  const clear = () => {
    setQ('')
    write({ q: null, type: null, domain: null, kind: null })
  }
  const to = (w: WorkerLearning) => withPeriod(`/learning/workers/${w.workerId}`, period)

  return (
    <div className="flex flex-col gap-6">
      <Panel id="so-far" title="Learning so far" icon={BarChart3} hue="cyan" count={ITEMS.length} flush>
        <CategoryBars rows={distribution(ITEMS)} hrefFor={(k) => withPeriod(`/learning/categories/${k}`, period)} label="Learning items by category, across all Workers" />
      </Panel>

      <Panel
        id="new"
        title="Workers with new learning"
        icon={Users}
        hue="violet"
        count={rows.length}
        flush
        aside={
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={view} onValueChange={(v) => v && write({ view: v === 'list' ? 'list' : null })} aria-label="View">
            <ToggleGroupItem value="list" aria-label="List view"><List aria-hidden="true" /></ToggleGroupItem>
            <ToggleGroupItem value="tiles" aria-label="Tile view"><LayoutGrid aria-hidden="true" /></ToggleGroupItem>
          </ToggleGroup>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <InputGroup className="w-full bg-card sm:w-60">
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            <InputGroupInput value={q} onChange={(e) => { setQ(e.target.value); write({ q: e.target.value || null }) }} placeholder="Search Workers or learning" aria-label="Search Workers or learning" />
          </InputGroup>
          <Select value={type ?? ANY} onValueChange={(v) => write({ type: v === ANY ? null : v })}>
            <SelectTrigger className="w-40 bg-card" aria-label="Worker type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{workerTypeMeta(t).short}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={domain ?? ANY} onValueChange={(v) => write({ domain: v === ANY ? null : v })}>
            <SelectTrigger className="w-44 bg-card" aria-label="Business domain"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All domains</SelectItem>
              {domains.map((d) => <SelectItem key={d} value={d}>{domainLabel(d)}</SelectItem>)}
              {noDomain && <SelectItem value="none">No domain</SelectItem>}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Select value={category ?? ANY} onValueChange={(v) => write({ kind: v === ANY ? null : v })}>
              <SelectTrigger className="w-44 bg-card" aria-label="Type of learning"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All learning types</SelectItem>
                {kinds.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <PeriodSelect value={period} onChange={setPeriod} />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            className="m-5"
            icon={SearchX}
            title={filtered ? 'No Worker matches these filters' : `No Worker learned anything in the ${periodLabel}`}
            action={filtered ? <Button variant="outline" onClick={clear}>Clear filters</Button> : period !== 'all' ? <Button variant="outline" onClick={() => setPeriod('all')}>Show all learning</Button> : undefined}
          />
        ) : (
          <>
            {view === 'tiles' ? (
              <ul aria-label="Workers with new learning" className="grid gap-3 p-5 md:grid-cols-2 2xl:grid-cols-3">
                {paged.rows.map((w) => <li key={w.workerId}><WorkerTile w={w} to={to(w)} /></li>)}
              </ul>
            ) : (
              <ul aria-label="Workers with new learning" className="divide-y">
                {paged.rows.map((w) => <li key={w.workerId}><WorkerRow w={w} to={to(w)} /></li>)}
              </ul>
            )}
            {rows.length > Math.min(...(view === 'tiles' ? TILE_SIZES : PAGE_SIZES)) && (
              <div className="border-t px-5 py-3">
                <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} label="Workers with new learning" pageSizes={view === 'tiles' ? TILE_SIZES : PAGE_SIZES} onPageSize={paged.setSize} />
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  )
}
