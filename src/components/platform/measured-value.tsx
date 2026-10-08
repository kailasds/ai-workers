import { cn } from '@/lib/utils'
import { isObserved } from '@/lib/format'
import type { Metric } from '@/lib/types/dashboard'

// P-07: every metric is {state, value}. Anything but OBSERVED reads "Not measured"
// (muted, body weight), never 0 and never blank. A measured 0 is a number.
export function MeasuredValue({
  metric,
  format,
  empty = 'Not measured',
  className,
}: {
  metric: Metric | undefined | null
  format: (value: number) => string
  empty?: string
  className?: string
}) {
  if (!isObserved(metric)) return <span className={cn('text-sm font-normal text-muted-foreground', className)}>{empty}</span>
  return <span className={cn('tabular-nums', className)}>{format(metric.value)}</span>
}
