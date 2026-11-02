import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HUE, type Hue } from '@/components/platform/hue'
import { Pager } from '@/components/platform/pager'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { CATEGORY_LOOK } from './look'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PERIODS, STATES, workerLabel, type CategoryKey, type LearningItem, type PeriodKey, type StateKey } from './model'

// The pieces every Learning screen shares, so the platform and a Worker read the same way:
// only the scope of the records changes.

export const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'
const ROW = 'outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

/** Where the reader came from, carried to a learning item so its breadcrumb can lead back. */
export interface From {
  label: string
  to: string
}


export function IconTile({ icon: Icon, hue, size = 'md' }: { icon: LucideIcon; hue: Hue; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center rounded-block', HUE[hue].soft, HUE[hue].text, size === 'sm' ? 'size-8 [&>svg]:size-4' : 'size-9 [&>svg]:size-[18px]')}>
      <Icon />
    </span>
  )
}

export function PeriodSelect({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodKey)}>
      <SelectTrigger className="w-40" aria-label="Period"><SelectValue /></SelectTrigger>
      <SelectContent>{PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
    </Select>
  )
}

export function StateBadge({ state }: { state: StateKey }) {
  const s = STATES[state]
  return <span title={s.meaning}><StatusBadge tone={s.tone} icon={s.tone === 'neutral' ? null : undefined}>{s.label}</StatusBadge></span>
}

/**
 * A section as one card: an icon and title in the header, a count when it lists things, then the
 * body. `flush` bodies hold their own rows edge to edge.
 */
export function Panel({ id, title, icon, hue = 'blue', count, aside, flush, children, className }: { id: string; title: string; icon: LucideIcon; hue?: Hue; count?: number; aside?: React.ReactNode; flush?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-24 overflow-hidden rounded-xl border bg-card', className)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-3.5">
        <IconTile icon={icon} hue={hue} size="sm" />
        <h2 id={`${id}-title`} className="flex min-w-0 flex-1 items-center gap-2 text-item">
          {title}
          {count !== undefined && <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{formatCount(count)}</span>}
        </h2>
        {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
      </header>
      <div className={flush ? undefined : 'p-5'}>{children}</div>
    </section>
  )
}

/** Key facts in one strip: icon, label, value. */
export function FactStrip({ facts }: { facts: { icon: LucideIcon; label: string; value: React.ReactNode }[] }) {
  return (
    <dl className={cn('grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-2 sm:divide-y-0', facts.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3', 'lg:divide-x')}>
      {facts.map((f) => (
        <div key={f.label} className="flex items-center gap-3 px-5 py-4">
          <f.icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-meta text-muted-foreground">{f.label}</dt>
            <dd className="truncate text-item">{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/** Label and value pairs in two columns. */
export function Details({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="min-w-0">
          <dt className="text-meta text-muted-foreground">{r.label}</dt>
          <dd className="mt-0.5 text-body">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Learning so far: one row per category with its icon, count and a bar scaled to the largest.
 * Each item has exactly one category, so the rows add up. Empty categories stay listed.
 */
export function CategoryBars({ rows, hrefFor, label }: { rows: { key: CategoryKey; label: string; count: number }[]; hrefFor: (k: CategoryKey) => string; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul aria-label={label} className="divide-y">
      {rows.map((r) => (
        <li key={r.key}>
          <Link to={hrefFor(r.key)} className={cn('group grid grid-cols-[auto_minmax(6rem,10rem)_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3', ROW)}>
            <IconTile icon={CATEGORY_LOOK[r.key].icon} hue={CATEGORY_LOOK[r.key].hue} size="sm" />
            <span className={cn('truncate text-item group-hover:text-primary-strong', r.count === 0 && 'text-muted-foreground')}>{r.label}</span>
            <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-track">
              {r.count > 0 && <span className={cn('block h-full rounded-full', HUE[CATEGORY_LOOK[r.key].hue].solid)} style={{ width: `${Math.max(3, (r.count / max) * 100)}%` }} />}
            </span>
            <span className="flex items-center gap-2 text-meta text-muted-foreground tabular-nums">
              <span className={cn('min-w-[4.5rem] text-right', r.count > 0 && 'text-item text-foreground')}>{r.count > 0 ? formatCount(r.count) : 'None yet'}</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** One learning item as a row: category icon, title, a line on what it is, and where it stands. */
export function ItemRow({ item, from, showWorker = true }: { item: LearningItem; from: From; showWorker?: boolean }) {
  const look = CATEGORY_LOOK[item.category]
  const runs = item.evidence.filter((e) => e.run).length
  return (
    <Link to={`/learning/items/${item.id}`} state={{ from }} className={cn('flex items-start gap-4 px-5 py-4', ROW)}>
      <IconTile icon={look.icon} hue={look.hue} />
      <div className="min-w-0 flex-1">
        <p className="text-item">{item.title}</p>
        <p className="mt-0.5 line-clamp-1 text-meta text-muted-foreground">{item.summary}</p>
        {showWorker && <p className="mt-2 truncate text-meta text-foreground">{workerLabel(item.workerId)}</p>}
        <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground', showWorker ? 'mt-0.5' : 'mt-2')}>
          <span>{item.when.kind === 'as_of' ? 'As of ' : ''}<Timestamp iso={item.when.iso} /></span>
          {runs > 0 && <><span aria-hidden="true">·</span><span>{runs === 1 ? '1 run' : `${runs} runs`}</span></>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-center">
        <StateBadge state={item.state} />
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  )
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-8 text-center text-body text-muted-foreground">{children}</p>
}

/** A paged list of learning items, edge to edge inside a flush panel. */
export function ItemList({ items, from, prefix, label, showWorker = true, empty }: { items: LearningItem[]; from: From; prefix: string; label: string; showWorker?: boolean; empty: React.ReactNode }) {
  const paged = usePaged(items, { prefix, defaultSize: 10 })
  if (items.length === 0) return <EmptyRow>{empty}</EmptyRow>
  return (
    <>
      <ul aria-label={label} className="divide-y">
        {paged.rows.map((i) => <li key={i.id}><ItemRow item={i} from={from} showWorker={showWorker} /></li>)}
      </ul>
      {items.length > 10 && (
        <div className="border-t px-5 py-3">
          <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} order="time" label={label} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} />
        </div>
      )}
    </>
  )
}

/** The first few rows, with the rest one click away. */
export function ShowMore<T>({ rows, first = 5, render }: { rows: T[]; first?: number; render: (row: T) => React.ReactNode }) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, first)
  return (
    <>
      <ul className="divide-y">{shown.map(render)}</ul>
      {rows.length > first && (
        <div className="border-t px-5 py-2">
          <Button variant="ghost" size="sm" onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${formatCount(rows.length)}`}</Button>
        </div>
      )}
    </>
  )
}

