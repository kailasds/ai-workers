import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** One row of a library list: the whole row opens the item. */
export function LibraryRow({ title, meta, aside, onOpen, label }: { title: React.ReactNode; meta?: React.ReactNode; aside?: React.ReactNode; onOpen: () => void; label: string }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-item">{title}</span>
          {meta && <span className="mt-0.5 block truncate text-meta text-muted-foreground">{meta}</span>}
        </span>
        {aside && <span className="hidden shrink-0 items-center gap-2 sm:flex">{aside}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

export function GroupHeader({ label, count, className }: { label: string; count?: number; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 bg-muted/40 px-5 py-2.5', className)}>
      <h3 className="min-w-0 truncate text-meta font-medium">{label}</h3>
      {count !== undefined && <span className="shrink-0 text-meta text-muted-foreground tabular-nums">{count}</span>}
    </div>
  )
}

/** Progressive disclosure for long lists: a page of items and a quiet "Show more". */
export function ShowMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  if (shown >= total) return null
  return (
    <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
      <span className="text-meta text-muted-foreground tabular-nums">Showing {shown} of {total}</span>
      <Button variant="ghost" size="sm" onClick={onMore}>Show more</Button>
    </div>
  )
}
