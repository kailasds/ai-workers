import { formatMoment, formatRunName, zoneLabel } from '@/lib/format'

type Form = 'moment' | 'run'

// P-17: the reader's local time; zone and the exact moment live in the tooltip and the
// machine-readable attribute, not in the visible text. Never wraps.
export function Timestamp({ iso, form = 'moment', className }: { iso: string | null | undefined; form?: Form; className?: string }) {
  if (!iso) return <span className="text-muted-foreground">Not reported</span>
  const text = form === 'run' ? formatRunName(iso) : formatMoment(iso)
  return (
    <time dateTime={iso} title={`${new Date(iso).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'medium' })} (${zoneLabel()})`} className={`whitespace-nowrap tabular-nums ${className ?? ''}`}>
      {text}
    </time>
  )
}
