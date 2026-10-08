import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  to?: string
}

// P-01: where am I, what is this, what can I do. Breadcrumb only on sub-pages; one title;
// at most one scope sentence; utilities (freshness, refresh, period) before the task actions.
export function PageHeader({
  title,
  description,
  meta,
  crumbs,
  utilities,
  actions,
  className,
}: {
  title: string
  description?: React.ReactNode
  /** A quiet line under the description, e.g. when the data was last read. */
  meta?: React.ReactNode
  crumbs?: Crumb[]
  utilities?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-meta text-muted-foreground">
              {crumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-page">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-body text-muted-foreground">{description}</p>}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {(utilities || actions) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-end">
          {utilities}
          {actions}
        </div>
      )}
    </header>
  )
}
