import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comparison } from '@/lib/types/dashboard'

// Delta / trend (design.md §8): plain coloured text with a 12px arrow, never a pill.
// Rendered only when the comparison was OBSERVED with a non-null, non-zero percent.
// "Up" is not "good" for every measure, so the caller states whether up is favourable.
export function Delta({ comparison, upIsGood = true, className }: { comparison?: Comparison; upIsGood?: boolean; className?: string }) {
  if (!comparison || comparison.state !== 'OBSERVED' || comparison.percent === null || comparison.percent === 0) return null
  const up = comparison.percent > 0
  const good = up === upIsGood
  const Icon = up ? ArrowUp : ArrowDown
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-meta font-medium tabular-nums', good ? 'text-success' : 'text-destructive', className)}>
      <Icon className="size-3" aria-hidden="true" />
      <span className="sr-only">{up ? 'Up' : 'Down'} </span>
      {Math.abs(comparison.percent * 100).toFixed(Math.abs(comparison.percent) >= 1 ? 0 : 1)}%
    </span>
  )
}
