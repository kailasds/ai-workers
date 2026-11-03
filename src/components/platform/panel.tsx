import { useState } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'

// Sections as cards: an icon and title in the header, a count when they list things, then the
// body. Shared by Brain's areas so Knowledge and Learning read the same way.

export function IconTile({ icon: Icon, hue, size = 'md' }: { icon: LucideIcon | React.ComponentType; hue: Hue; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center rounded-block', HUE[hue].soft, HUE[hue].text, size === 'sm' ? 'size-8 [&>svg]:size-4' : 'size-9 [&>svg]:size-[18px]')}>
      <Icon />
    </span>
  )
}

const storeKey = (id: string) => `panel-open:${id}`
function readOpen(id: string) {
  try {
    return localStorage.getItem(storeKey(id)) !== 'false'
  } catch {
    return true
  }
}

/**
 * A section as one card: an icon, title and count in the header, then the body. Without a title
 * (when a tab already names it) the card holds the body alone. `flush` bodies hold their own rows
 * edge to edge. A `collapsible` panel folds to its header (the whole header toggles it); the
 * choice is remembered in this browser.
 */
export function Panel({ id, title, icon, hue = 'blue', count, aside, flush, collapsible, fill, children, className }: { id: string; title?: string; icon?: LucideIcon; hue?: Hue; count?: number; aside?: React.ReactNode; flush?: boolean; collapsible?: boolean; /** The body takes the panel's full height, for a `Paged fill` list. */ fill?: boolean; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(() => !collapsible || readOpen(id))
  const toggle = () =>
    setOpen((o) => {
      try {
        localStorage.setItem(storeKey(id), String(!o))
      } catch {
        /* storage unavailable: the choice lasts this visit only */
      }
      return !o
    })
  const heading = (
    <>
      {icon && <IconTile icon={icon} hue={hue} size="sm" />}
      <span className="flex min-w-0 flex-1 items-center gap-2 text-item">
        {title}
        {count !== undefined && <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{formatCount(count)}</span>}
      </span>
    </>
  )
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className={cn('scroll-mt-24 overflow-hidden rounded-xl border bg-card', fill && 'flex flex-col', className)}>
      {title && (
        <header className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5', open && 'border-b', collapsible && 'p-0')}>
          {collapsible ? (
            <h2 id={`${id}-title`} className="min-w-0 flex-1">
              <button type="button" onClick={toggle} aria-expanded={open} aria-controls={`${id}-body`} className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                {heading}
                <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
              </button>
            </h2>
          ) : (
            <h2 id={`${id}-title`} className="flex min-w-0 flex-1 items-center gap-3">{heading}</h2>
          )}
          {aside && <div className={cn('flex flex-wrap items-center gap-2', collapsible && 'pr-5')}>{aside}</div>}
        </header>
      )}
      {open && <div id={`${id}-body`} className={cn(!flush && 'p-5', fill && 'flex min-h-0 flex-1 flex-col')}>{children}</div>}
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
