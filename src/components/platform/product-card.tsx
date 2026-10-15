import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
import { cn } from '@/lib/utils'

// One product card for everything the platform makes and ships (Workers, Packages, customer
// deliveries): a media panel in the item's hue, a name, a few tags, a strip of figures and a
// footer action. The name is a stretched link, so the whole card opens it while footer actions
// stay their own buttons.

export interface ProductKpi {
  label: string
  value: React.ReactNode
}

/** A solid hue tile on the item's soft hue: the media for things that are not boxes. */
export function IconMedia({ hue, icon: Icon }: { hue: Hue; icon: LucideIcon }) {
  return (
    <span aria-hidden="true" className={cn('grid size-16 place-items-center rounded-2xl shadow-[0_8px_24px_-12px_var(--foreground)] [&>svg]:size-8', HUE[hue].solid)}>
      <Icon />
    </span>
  )
}

/**
 * A Package drawn as a box: sealed (lid, tape and a shipping label with its version) or open
 * (a dashed outline, nothing sealed yet). Purely visual; the words are on the card.
 */
export function PackageMedia({ hue, sealed, label, sublabel }: { hue: Hue; sealed: boolean; label: string; sublabel?: string }) {
  if (!sealed)
    return (
      <span aria-hidden="true" className={cn('relative grid h-24 w-32 place-items-center rounded-lg border-2 border-dashed bg-card/70', HUE[hue].text)} style={{ borderColor: 'currentColor' }}>
        <span className="absolute -top-3 left-3 right-3 h-3 rounded-t-md border-2 border-b-0 border-dashed" style={{ borderColor: 'currentColor' }} />
        <span className="rounded bg-card px-1.5 py-0.5 font-mono text-[0.6875rem] text-foreground">{label}</span>
      </span>
    )
  return (
    <span aria-hidden="true" className={cn('relative block h-24 w-32 rounded-lg shadow-[0_10px_24px_-14px_var(--foreground)]', HUE[hue].solid)}>
      {/* lid */}
      <span className="absolute inset-x-0 top-0 h-6 rounded-t-lg bg-foreground/15" />
      {/* tape */}
      <span className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-card/30" />
      {/* shipping label */}
      <span className="absolute bottom-2.5 left-2.5 flex flex-col rounded bg-card px-1.5 py-1 leading-none text-foreground">
        <span className="max-w-[6.25rem] truncate text-[0.6875rem] font-medium">{label}</span>
        {sublabel && <span className="mt-0.5 font-mono text-[0.625rem] text-muted-foreground">{sublabel}</span>}
      </span>
    </span>
  )
}

export function ProductCard({
  hue,
  media,
  badge,
  status,
  eyebrow,
  title,
  href,
  linkState,
  onOpen,
  tags,
  kpis,
  footer,
  className,
}: {
  hue: Hue
  media: React.ReactNode
  /** Top-left of the media panel, e.g. "New". */
  badge?: React.ReactNode
  /** Top-right of the media panel: the item's state. */
  status?: React.ReactNode
  /** A short line above the name: the context or the customer. */
  eyebrow?: React.ReactNode
  title: string
  href?: string
  linkState?: unknown
  onOpen?: () => void
  tags?: React.ReactNode
  kpis?: ProductKpi[]
  footer?: React.ReactNode
  className?: string
}) {
  const stretch = 'rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl after:content-[""] focus-visible:after:ring-3 focus-visible:after:ring-ring/50'
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground hover:ring-1 hover:ring-primary/30', className)}>
      <div className={cn('relative grid h-40 place-items-center', HUE[hue].soft)}>
        {media}
        {badge && <span className="absolute top-3 left-3">{badge}</span>}
        {status && <span className="absolute top-3 right-3 inline-flex h-7 items-center rounded-full bg-card p-0.5">{status}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          {eyebrow && <p className={cn('truncate text-meta font-medium', HUE[hue].text)}>{eyebrow}</p>}
          <h4 className="mt-0.5 line-clamp-2 text-item text-balance">
            {href ? (
              <Link to={href} state={linkState} className={cn(stretch, 'group-hover:underline group-hover:underline-offset-4')}>{title}</Link>
            ) : onOpen ? (
              <button type="button" onClick={onOpen} className={cn(stretch, 'text-left group-hover:underline group-hover:underline-offset-4')}>{title}</button>
            ) : (
              title
            )}
          </h4>
        </div>
        {tags && <div className="flex flex-wrap gap-1.5">{tags}</div>}
        {kpis && kpis.length > 0 && (
          <dl className={cn('mt-auto grid divide-x divide-border rounded-block bg-muted py-2.5', kpis.length === 4 ? 'grid-cols-4' : kpis.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
            {kpis.map((k) => (
              <div key={k.label} className="min-w-0 px-3">
                <dt className="truncate text-overline text-muted-foreground">{k.label}</dt>
                <dd className="mt-0.5 truncate text-item tabular-nums">{k.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {footer && <div className="relative z-10 flex items-center gap-2 border-t px-4 py-3">{footer}</div>}
    </article>
  )
}
