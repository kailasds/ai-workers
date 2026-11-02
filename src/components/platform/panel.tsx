import type { LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'

// Sections as cards: an icon and title in the header, a count when they list things, then the
// body. Shared by Brain's areas so Knowledge and Learning read the same way.

export function IconTile({ icon: Icon, hue, size = 'md' }: { icon: LucideIcon; hue: Hue; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center rounded-block', HUE[hue].soft, HUE[hue].text, size === 'sm' ? 'size-8 [&>svg]:size-4' : 'size-9 [&>svg]:size-[18px]')}>
      <Icon />
    </span>
  )
}

/**
 * A section as one card: an icon, title and count in the header, then the body. Without a title
 * (when a tab already names it) the card holds the body alone. `flush` bodies hold their own rows
 * edge to edge.
 */
export function Panel({ id, title, icon, hue = 'blue', count, aside, flush, children, className }: { id: string; title?: string; icon?: LucideIcon; hue?: Hue; count?: number; aside?: React.ReactNode; flush?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className={cn('scroll-mt-24 overflow-hidden rounded-xl border bg-card', className)}>
      {title && (
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-3.5">
          {icon && <IconTile icon={icon} hue={hue} size="sm" />}
          <h2 id={`${id}-title`} className="flex min-w-0 flex-1 items-center gap-2 text-item">
            {title}
            {count !== undefined && <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{formatCount(count)}</span>}
          </h2>
          {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
        </header>
      )}
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
