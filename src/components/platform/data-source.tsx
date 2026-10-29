import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Timestamp } from '@/components/platform/timestamp'
import { USE_MOCK } from '@/lib/api/client'
import { cn } from '@/lib/utils'

/**
 * Where the figures on a page come from, said once: the offline snapshot, a live read, or
 * the last good read after a refresh failed. A partial read says what is missing.
 */
export function DataSource({
  snapshotAt,
  updatedAt,
  refreshFailed,
  partial,
  onRetry,
  className,
}: {
  /** When the data was generated (the snapshot or the server's own timestamp). */
  snapshotAt: string | null | undefined
  updatedAt?: Date | null
  /** A refresh failed and the last good data is still shown. */
  refreshFailed?: boolean
  partial?: string | null
  onRetry?: () => void
  className?: string
}) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground', className)} aria-live="polite">
      {refreshFailed ? (
        <span className="text-warning">Couldn’t refresh · showing data from <Timestamp iso={updatedAt?.toISOString() ?? snapshotAt} /></span>
      ) : USE_MOCK ? (
        <span>Offline snapshot · <Timestamp iso={snapshotAt} /></span>
      ) : (
        <span>Updated <Timestamp iso={updatedAt?.toISOString() ?? snapshotAt} /></span>
      )}
      {partial && <span>· {partial}</span>}
      {refreshFailed && onRetry && (
        <Button variant="link" size="xs" className="h-auto px-0 text-meta" onClick={onRetry}><RefreshCw aria-hidden="true" />Retry</Button>
      )}
    </p>
  )
}
