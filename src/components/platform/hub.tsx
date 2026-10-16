import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { ArrowUpRight, ChevronDown, type LucideIcon } from 'lucide-react'
import { HUE, type Hue } from '@/components/platform/hue'
import { PageContainer } from '@/components/platform/page-container'
import { LoadingRegion } from '@/components/platform/states'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'

// A hub is a main menu's page (Home, Learning): one header, one navy band of figures, then its
// areas as stage tabs. Each area keeps its own URL, so every old link still lands in the right tab.

/** A figure on a white inset card: label, one stat, one caption. Unknown is never 0. */
export function Kpi({ label, icon: Icon, hue, value, unit, caption, to, children, loading, failed }: { label: string; icon: LucideIcon; hue: Hue; value: number | null | undefined; unit?: string; caption: React.ReactNode; to?: string; children?: React.ReactNode; loading: boolean; failed: boolean }) {
  const body = (
    <>
      <p className="flex items-center gap-2.5 text-meta font-medium text-muted-foreground">
        <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
        <span className="min-w-0 flex-1">{label}</span>
        {to && <ArrowUpRight className="size-4 text-subtle-foreground group-hover:text-primary group-focus-visible:text-primary" aria-hidden="true" />}
      </p>
      <div className="mt-3 flex items-baseline gap-1.5">
        {loading ? (
          <Skeleton className="h-9 w-16 bg-track" />
        ) : failed || value === null || value === undefined ? (
          <span className="text-body text-muted-foreground">Not available</span>
        ) : (
          <>
            <span className="text-stat tabular-nums">{formatCount(value)}</span>
            {unit && <span className="text-meta text-muted-foreground">{unit}</span>}
          </>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
      <p className="mt-2 text-meta text-muted-foreground">{caption}</p>
    </>
  )
  const cell = 'group relative block min-w-0 rounded-block bg-card p-4 text-card-foreground sm:p-5'
  return to ? (
    <Link to={to} className={cn(cell, 'outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary-foreground/60')}>
      {body}
    </Link>
  ) : (
    <div className={cell}>{body}</div>
  )
}

const FIGURES_KEY = 'hub-figures-open'

function readOpen() {
  try {
    return localStorage.getItem(FIGURES_KEY) !== 'false'
  } catch {
    return true
  }
}

/**
 * design.md §7.1: the navy identity panel, framing white inset cards. The screen's one navy mass.
 * It collapses to its title bar; the choice is remembered in this browser for every hub.
 */
export function KpiBand({ title, columns = 4, children }: { title: string; columns?: 3 | 4; children: React.ReactNode }) {
  const [open, setOpen] = useState(readOpen)
  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(FIGURES_KEY, String(!o))
      } catch {
        /* storage unavailable: the choice lasts this visit only */
      }
      return !o
    })
  }
  return (
    <section aria-labelledby="glance-title" className="rounded-panel bg-identity p-2 text-identity-foreground">
      <div className={cn('flex items-center justify-between gap-4 pl-3', open && 'pb-2')}>
        <h2 id="glance-title" className="text-section">{title}</h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="glance-figures"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-meta font-medium text-identity-foreground/90 outline-none hover:bg-primary-foreground/10 focus-visible:ring-3 focus-visible:ring-primary-foreground/60"
        >
          {open ? 'Hide figures' : 'Show figures'}
          <ChevronDown className={cn('size-4', open && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>
      {open && <div id="glance-figures" className={cn('grid grid-cols-2 gap-2', columns === 3 ? 'lg:grid-cols-3' : 'xl:grid-cols-4')}>{children}</div>}
    </section>
  )
}

export interface Stage {
  to: string
  label: string
  icon: LucideIcon
  hue: Hue
  count?: number | null
}

/** design.md §7.5: the areas as tabs joined by a hairline; the current one is a lifted white sheet. */
export function StageTabs({ label, stages }: { label: string; stages: Stage[] }) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ol className="relative flex min-w-max items-stretch gap-2 sm:min-w-0">
        {stages.map((s, i) => (
          <li key={s.to} className="flex flex-1 items-center gap-2">
            <NavLink
              to={s.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex min-w-[11rem] flex-1 items-center gap-3 rounded-block border px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive ? 'border-primary/30 bg-card' : 'border-border/70 bg-card/55 hover:bg-card',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute inset-x-4 -bottom-px h-[3px] rounded-t-full bg-primary" />}
                  <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-block [&>svg]:size-5', isActive ? HUE[s.hue].solid : cn(HUE[s.hue].soft, HUE[s.hue].text))}>
                    <s.icon />
                  </span>
                  <span className={cn('min-w-0 flex-1 text-item', isActive ? 'text-primary-strong' : 'text-foreground')}>{s.label}</span>
                  {s.count !== null && s.count !== undefined && (
                    <span className={cn('rounded-full px-2 py-0.5 text-meta font-medium tabular-nums', isActive ? 'bg-primary text-primary-foreground' : 'bg-chip-neutral text-foreground')}>{formatCount(s.count)}</span>
                  )}
                </>
              )}
            </NavLink>
            {i < stages.length - 1 && <span aria-hidden="true" className="hidden h-px w-6 shrink-0 bg-border lg:block" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Header, figures and tabs, then the current area. The tabs stay put while an area loads. */
export function HubLayout({ title, action, band, tabsLabel, stages }: { title: string; action?: React.ReactNode; band: React.ReactNode; tabsLabel: string; stages: Stage[] }) {
  return (
    <PageContainer>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="min-w-0 text-page">{title}</h1>
        {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
      </header>

      {band}

      <div className="flex flex-col gap-6">
        <StageTabs label={tabsLabel} stages={stages} />
        <Suspense
          fallback={
            <LoadingRegion label="Loading…" className="flex flex-col gap-3">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-64 w-full" />
            </LoadingRegion>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </PageContainer>
  )
}
