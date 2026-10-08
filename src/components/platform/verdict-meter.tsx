import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/format'
import type { Verdict } from '@/lib/types/dashboard'

export const VERDICT_ORDER: Verdict[] = ['MET', 'NOT_MET', 'NOT_ADJUDICABLE']
const LABEL: Record<Verdict, string> = { MET: 'Met', NOT_MET: 'Not met', NOT_ADJUDICABLE: 'Awaiting evidence' }
// "Awaiting evidence" is hatched, so the verdicts differ by pattern and word, not colour alone.
const FILL: Record<Verdict, string> = {
  MET: 'bg-success',
  NOT_MET: 'bg-destructive',
  NOT_ADJUDICABLE: 'bg-muted bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_1.5px,transparent_1.5px_4px)]',
}

export function VerdictSwatch({ verdict, className }: { verdict: Verdict; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 rounded-full', FILL[verdict], className)} />
}

/** A single proportional bar of verdicts. The figures it shows are always written beside it. */
export function VerdictBar({ counts, className }: { counts: Record<Verdict, number>; className?: string }) {
  const total = VERDICT_ORDER.reduce((s, v) => s + counts[v], 0)
  return (
    <div
      role="img"
      aria-label={`${VERDICT_ORDER.map((v) => `${LABEL[v]} ${counts[v]}`).join(', ')}, of ${total} runs`}
      className={cn('flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted', className)}
    >
      {VERDICT_ORDER.filter((v) => counts[v] > 0).map((v) => (
        <span key={v} className={cn('h-full', FILL[v])} style={{ flexGrow: counts[v], flexBasis: 0 }} />
      ))}
    </div>
  )
}

export function VerdictLegend({ counts, className }: { counts: Record<Verdict, number>; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-1 text-meta text-muted-foreground', className)}>
      {VERDICT_ORDER.map((v) => (
        <li key={v} className="flex items-center gap-1.5">
          <VerdictSwatch verdict={v} />
          {LABEL[v]} <span className="font-medium text-foreground tabular-nums">{formatCount(counts[v])}</span>
        </li>
      ))}
    </ul>
  )
}
