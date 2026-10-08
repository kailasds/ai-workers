import { Link, useLocation } from 'react-router'
import { CircleCheck, CircleDashed, CircleX, History, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/platform/states'
import { verdictLabel } from '@/components/platform/status-badge'
import { formatCount, formatRunName } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ExecutiveDashboard, Verdict } from '@/lib/types/dashboard'

const ICON: Record<Verdict, { icon: LucideIcon; className: string }> = {
  MET: { icon: CircleCheck, className: 'text-success' },
  NOT_MET: { icon: CircleX, className: 'text-destructive' },
  NOT_ADJUDICABLE: { icon: CircleDashed, className: 'text-muted-foreground' },
}

const SHOWN = 4

// What changed recently: the last few runs, one line each. The full ledger is a click away.
export function RecentRuns({ data, detailLink }: { data: ExecutiveDashboard; detailLink: (view: string, extra?: Record<string, string>) => string }) {
  const { pathname, search } = useLocation()
  const rows = data.run_ledger.rows.slice(0, SHOWN)
  return (
    <Card role="region" aria-labelledby="recent-title" className="gap-0 py-0">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <h2 id="recent-title" className="text-section">Recent runs</h2>
        {data.run_ledger.rows.length > 0 && (
          <Button asChild variant="ghost" size="sm">
            <Link to={detailLink('runs')}>View all {formatCount(data.run_ledger.rows.length)}</Link>
          </Button>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState className="mx-5 mb-5" icon={History} title="No runs in this period" />
      ) : (
        <ul className="divide-y pb-2">
          {rows.map((r) => {
            const { icon: Icon, className } = ICON[r.verdict]
            return (
              <li key={r.run_ref}>
                <Link
                  to={`/workers/${r.worker_id}?view=runs&run=${encodeURIComponent(r.run_ref)}`}
                  state={{ from: `${pathname}${search}` }}
                  className="flex items-center gap-3 px-5 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <Icon className={cn('size-4 shrink-0', className)} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-item">{r.worker_name}</span>
                    <span className="block text-meta text-muted-foreground">
                      <span className="sr-only">{verdictLabel(r.verdict)} · </span>
                      {formatRunName(r.completed_at)}
                    </span>
                  </span>
                  <span className={cn('shrink-0 text-meta font-medium', className)} aria-hidden="true">{verdictLabel(r.verdict)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
