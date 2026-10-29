import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCount } from '@/lib/format'

// P-05: range "x–y of N" (announced to screen readers), Newer/Older for newest-first lists and
// Previous/Next for ranked ones. Buttons show only when there is somewhere to go; a page-size
// choice shows when the list can use one.
export function Pager({
  page,
  pageSize,
  total,
  onPage,
  order = 'ranked',
  label,
  pageSizes,
  onPageSize,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  order?: 'ranked' | 'time'
  label: string
  /** Offer these page sizes; the selector shows only when there are more rows than the smallest size. */
  pageSizes?: number[]
  onPageSize?: (size: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  const sizes = pageSizes && onPageSize && total > Math.min(...pageSizes) ? pageSizes : null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-meta text-muted-foreground tabular-nums" aria-live="polite">
          {formatCount(start)}–{formatCount(end)} of {formatCount(total)}
          {pages > 1 && <span className="sr-only">, page {page} of {pages}</span>}
        </p>
        {sizes && (
          <Select value={String(pageSize)} onValueChange={(v) => onPageSize!(Number(v))}>
            <SelectTrigger size="sm" className="w-auto gap-1.5" aria-label={`${label} per page`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{sizes.map((n) => <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>
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
