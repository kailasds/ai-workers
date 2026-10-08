import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCount } from '@/lib/format'

// P-05: 20 per page, range "x–y of N", Newer/Older for newest-first lists and Previous/Next for
// ranked ones; rendered only when there is somewhere to go.
export function Pager({
  page,
  pageSize,
  total,
  onPage,
  order = 'ranked',
  label,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  order?: 'ranked' | 'time'
  label: string
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-meta text-muted-foreground tabular-nums">
        {formatCount(start)}–{formatCount(end)} of {formatCount(total)}
      </p>
      {pages > 1 && (
        <nav aria-label={`${label} pages`} className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft aria-hidden="true" />
            {order === 'time' ? 'Newer' : 'Previous'}
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            {order === 'time' ? 'Older' : 'Next'}
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}
