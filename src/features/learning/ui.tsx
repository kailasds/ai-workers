import { Link } from 'react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HUE } from '@/components/platform/hue'
import { Paged, SECTION_SIZE } from '@/components/platform/section-pager'
import { IconTile } from '@/components/platform/panel'
import { Pager } from '@/components/platform/pager'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { usePaged } from '@/hooks/use-paged'
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
  const paged = usePaged(items, { prefix, defaultSize: SECTION_SIZE, sizes: [SECTION_SIZE] })
  if (items.length === 0) return <EmptyRow>{empty}</EmptyRow>
  return (
    <>
      <ul aria-label={label} className="divide-y">
        {paged.rows.map((i) => <li key={i.id}><ItemRow item={i} from={from} showWorker={showWorker} /></li>)}
      </ul>
      {items.length > SECTION_SIZE && (
        <div className="border-t px-5 py-3">
          <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} order="time" label={label} />
        </div>
      )}
    </>
  )
}

/** Rows of a flush panel, five at a time. */
export function PagedRows<T>({ rows, label, render }: { rows: T[]; label: string; render: (row: T) => React.ReactNode }) {
  return <Paged rows={rows} label={label}>{(page) => <ul className="divide-y">{page.map(render)}</ul>}</Paged>
}


/**
 * Types of learning as a compact segmented control, small enough to sit in a panel header: icon,
 * short label, count. Counts of zero stay visible so the split reads at a glance.
 */
export function TypeTabs({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; icon: LucideIcon; count: number }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-0.5 rounded-lg bg-muted p-0.5">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn('inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-meta font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring', on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <o.icon className="size-3.5" aria-hidden="true" />
            {o.label}
            <span className={cn('tabular-nums', on ? 'text-primary-strong' : o.count === 0 && 'opacity-60')}>{formatCount(o.count)}</span>
          </button>
        )
      })}
    </div>
  )
}
