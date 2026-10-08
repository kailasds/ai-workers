import { cn } from '@/lib/utils'
import type { PortfolioWorker } from '@/lib/types/worker'

export type RuntimeStatus = 'serving' | 'attention' | 'stopped' | 'none'

export function runtimeStatus(runtime: PortfolioWorker['runtime']): RuntimeStatus {
  if (runtime.attention > 0) return 'attention'
  if (runtime.serving > 0) return 'serving'
  if (runtime.stopped > 0) return 'stopped'
  return 'none'
}

const LOOK: Record<RuntimeStatus, { label: string; dot: string; text: string }> = {
  serving: { label: 'Serving', dot: 'bg-success', text: 'text-success' },
  attention: { label: 'Needs attention', dot: 'bg-warning', text: 'text-warning' },
  stopped: { label: 'Stopped', dot: 'bg-muted-foreground/50', text: 'text-muted-foreground' },
  none: { label: 'No runtime', dot: 'bg-transparent ring-1 ring-inset ring-muted-foreground/60', text: 'text-muted-foreground' },
}

export const runtimeStatusLabel = (s: RuntimeStatus) => LOOK[s].label

/** The quietest status treatment: a dot whose fill and shape differ, always with its word. */
export function RuntimeStatusDot({ status, className, showLabel = true }: { status: RuntimeStatus; className?: string; showLabel?: boolean }) {
  const look = LOOK[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-meta font-medium whitespace-nowrap', look.text, className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', look.dot)} />
      <span className={showLabel ? undefined : 'sr-only'}>{look.label}</span>
    </span>
  )
}
