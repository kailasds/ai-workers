import { Link } from 'react-router'
import { ChevronRight, CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { IconTile } from '@/components/platform/icon-tile'
import { FreshnessBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { cn } from '@/lib/utils'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'
import type { Signal, SignalTone } from './signals'

const TONE: Record<SignalTone, { icon: LucideIcon; word: string }> = {
  danger: { icon: CircleX, word: 'Problem' },
  warning: { icon: TriangleAlert, word: 'Warning' },
  info: { icon: Info, word: 'Note' },
}

function Row({ signal }: { signal: Signal }) {
  const { icon, word } = TONE[signal.tone]
  const inner = (
    <>
      <IconTile icon={icon} tone={signal.tone} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-item">
          <span className="sr-only">{word}: </span>
          {signal.title}
        </span>
        <span className="block truncate text-meta text-muted-foreground">{signal.detail}</span>
      </span>
      {signal.action && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </>
  )
  const base = 'flex items-center gap-3 px-5 py-3'
  return (
    <li>
      {signal.action ? (
        <Link to={signal.action.to} className={cn(base, 'outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset')}>
          {inner}
        </Link>
      ) : (
        <div className={base}>{inner}</div>
      )}
    </li>
  )
}

const VISIBLE = 4

// ACTIONABLE. Three things at most; each row is the way in. These are observations from this
// period's figures, not tasks and not a health score.
export function AttentionList({ signals, data }: { signals: Signal[]; data: ExecutiveDashboard }) {
  return (
    <Card id="signals" role="region" aria-labelledby="signals-title" className="scroll-mt-20 gap-0 py-0">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <h2 id="signals-title" className="text-section">Needs attention</h2>
        {signals.length > VISIBLE && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">View all {signals.length}</Button>
            </SheetTrigger>
            <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
              <SheetHeader className="border-b">
                <SheetTitle className="text-section">Needs attention</SheetTitle>
                <SheetDescription>Observed in this period’s figures. Most serious first.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1">
                <ul className="divide-y py-2">
                  {signals.map((s) => <Row key={s.id} signal={s} />)}
                </ul>
                <section aria-labelledby="sources-title" className="border-t px-5 py-5">
                  <h3 id="sources-title" className="text-overline text-muted-foreground uppercase">Where these figures come from</h3>
                  <ul className="mt-3 flex flex-col gap-3">
                    {data.freshness.sources.map((src) => (
                      <li key={src.key} className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-item">{src.label}</span>
                          <span className="block text-meta text-muted-foreground">Observed <Timestamp iso={src.observed_at} /></span>
                        </span>
                        <FreshnessBadge state={src.state} />
                      </li>
                    ))}
                  </ul>
                </section>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>
      {signals.length === 0 ? (
        <div className="flex items-center gap-3 px-5 pt-2 pb-6">
          <IconTile icon={CircleCheck} tone="neutral" size="sm" />
          <p className="text-body text-muted-foreground">Nothing in this period’s figures. Oversight lives in Sentinel.</p>
        </div>
      ) : (
        <ul className="divide-y pb-2">
          {signals.slice(0, VISIBLE).map((s) => <Row key={s.id} signal={s} />)}
        </ul>
      )}
    </Card>
  )
}
