import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BannerTab {
  value: string
  label: string
  to: string
  icon: LucideIcon
  /** One line on the area's state. */
  line: string
  /** Something in this area waits for the user: the line turns red. */
  alert?: boolean
}

/** A summary banner's areas as tab cards along its bottom, each at its own URL, the selected one ringed. */
export function BannerTabs({ items, value, label }: { items: BannerTab[]; value: string; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', items.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
        {items.map((v) => {
          const on = v.value === value
          return (
            <li key={v.value}>
              <Link
                to={v.to}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex h-full items-center gap-3 rounded-xl border px-3.5 py-3 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  on ? 'border-primary bg-card shadow-[inset_0_0_0_1px_var(--primary)]' : 'border-transparent bg-card/70 hover:bg-card',
                )}
              >
                <v.icon className={cn('size-5 shrink-0', on ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-item">{v.label}</span>
                  <span className={cn('block truncate text-meta', v.alert ? 'text-destructive' : 'text-muted-foreground')}>{v.line}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
