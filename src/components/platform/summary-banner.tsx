import { HUE, type Hue } from '@/components/platform/hue'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// The Home banner's look (a soft hue under a fine grid) for a page's summary: what matters now,
// a few figures, the one action to take, and optionally tabs along the bottom.
const GRID = { backgroundImage: 'linear-gradient(var(--card) 1px, transparent 1px), linear-gradient(90deg, var(--card) 1px, transparent 1px)', backgroundSize: '44px 44px' }

export function SummaryBanner({ hue = 'blue', icon: Icon, eyebrow, title, facts, action, children }: { hue?: Hue; icon: LucideIcon; eyebrow: string; title: string; facts: string[]; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section aria-label={`${eyebrow} summary`} className={cn('overflow-hidden rounded-xl', HUE[hue].soft)} style={GRID}>
      <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="min-w-0">
          <p className={cn('flex items-center gap-2 text-overline', HUE[hue].text)}><Icon className="size-4" aria-hidden="true" />{eyebrow}</p>
          <h2 className="mt-2 text-[1.5rem] leading-tight font-medium text-balance sm:text-[1.75rem]">{title}</h2>
          {facts.length > 0 && <p className="mt-2 text-meta text-muted-foreground tabular-nums">{facts.join(' · ')}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      {children && <div className="px-4 pb-4 sm:px-6">{children}</div>}
    </section>
  )
}
