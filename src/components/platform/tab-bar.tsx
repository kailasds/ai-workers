import { ChevronRight, type LucideIcon } from 'lucide-react'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface TabBarItem {
  value: string
  label: string
  icon: LucideIcon
  count?: number
  /** Something in this tab waits for the user. */
  alert?: boolean
}

/**
 * Tabs that sit on top of the list they switch, inside the same card: icon, label and count, with
 * a bar under the selected one. With `steps`, a chevron between tabs reads them as a sequence.
 */
export function TabBar({ items, value, onChange, label, steps = false, className }: { items: TabBarItem[]; value: string; onChange: (v: string) => void; label: string; steps?: boolean; className?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex items-center overflow-x-auto border-b px-2 [scrollbar-width:none]', className)}>
      {items.map((t, i) => {
        const on = t.value === value
        return (
          <div key={t.value} className="flex shrink-0 items-center">
            {steps && i > 0 && <ChevronRight className="size-4 text-muted-foreground/60" aria-hidden="true" />}
            <button
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t.value)}
              className={cn(
                'relative flex h-12 items-center gap-2 px-3 text-item whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className={cn('size-4 shrink-0', on && 'text-primary')} aria-hidden="true" />
              {t.label}
              {t.count !== undefined && <span title={t.alert ? 'Needs review' : undefined} className={cn('rounded-full px-2 py-0.5 text-meta font-medium tabular-nums', t.alert ? 'bg-destructive text-white' : on ? 'bg-primary text-primary-foreground' : 'bg-chip-neutral text-foreground')}>{formatCount(t.count)}{t.alert && <span className="sr-only">, needs review</span>}</span>}
              {on && <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}
            </button>
          </div>
        )
      })}
    </div>
  )
}
