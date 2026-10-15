import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel'
import { contextHue, contextIcon, HUE, HueTile, workerTypeMeta } from '@/components/platform/hue'
import { runtimeStatus, RuntimeStatusDot, type RuntimeStatus } from '@/components/platform/runtime-status'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/types/dashboard'
import type { PortfolioWorker } from '@/lib/types/worker'

export interface Group {
  key: string
  label: string
  workers: PortfolioWorker[]
}

// Short words for the narrow Outcome cell; the Worker page uses the full ones.
const VERDICT_SHORT: Record<Verdict, string> = { MET: 'Met', NOT_MET: 'Not met', NOT_ADJUDICABLE: 'Pending' }

const VERDICT_TEXT: Record<Verdict, string> = { MET: 'text-success', NOT_MET: 'text-destructive', NOT_ADJUDICABLE: 'text-muted-foreground' }

// Presence, the way a colleague shows as available or away: the dot on the avatar.
const PRESENCE: Record<RuntimeStatus, string> = {
  serving: 'bg-success',
  attention: 'bg-warning',
  stopped: 'bg-subtle-foreground',
  none: 'bg-chip-neutral',
}

/** One figure: value over label, left-aligned. Figures are parted by a hairline, nothing more. */
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col px-3 first:pl-0">
      {/* The label is read first; it shows under the value. */}
      <dt className="order-last truncate text-meta text-muted-foreground">{label}</dt>
      <dd className="truncate text-item tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * The name on one line. When it does not fit, the end fades out; hovering or focusing the card
 * scrolls it across to show the rest (about 40px a second), then it returns when the pointer leaves.
 */
function ScrollingName({ name }: { name: string }) {
  const box = useRef<HTMLSpanElement>(null)
  const text = useRef<HTMLSpanElement>(null)
  const [shift, setShift] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      if (box.current && text.current) setShift(Math.max(0, text.current.scrollWidth - box.current.clientWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (box.current) ro.observe(box.current)
    return () => ro.disconnect()
  }, [name])
  const overflows = shift > 0
  return (
    <span
      ref={box}
      title={overflows ? name : undefined}
      className={cn('block overflow-hidden whitespace-nowrap', overflows && 'mask-r-from-85% group-hover:mask-none group-focus-visible:mask-none')}
      style={{ '--shift': `-${shift}px`, '--dur': `${Math.max(1.2, shift / 40)}s` } as React.CSSProperties}
    >
      <span
        ref={text}
        className={cn('inline-block', overflows && 'transition-transform ease-linear [transition-duration:var(--dur)] group-hover:[transform:translateX(var(--shift))] group-focus-visible:[transform:translateX(var(--shift))]')}
      >
        {name}
      </span>
    </span>
  )
}

/**
 * One Worker, compact: its avatar (the context's colour, with a presence dot for runtime state),
 * name, kind of work and revision, then three figures. The bottom edge carries the context's colour.
 */
export function WorkerCard({ worker, isNew, from }: { worker: PortfolioWorker; isNew: boolean; from: string }) {
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  const status = runtimeStatus(worker.runtime)
  const o = worker.last_outcome
  const ran = o.verdict && o.runs > 0
  const ring = status === 'attention' ? 'ring-warning-soft' : 'ring-card'
  return (
    <Link
      to={`/workers/${worker.composition_id}`}
      state={{ from }}
      className={cn(
        'group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl p-4 pb-5 text-card-foreground outline-none hover:ring-1 hover:ring-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50',
        status === 'attention' ? 'bg-warning-soft' : 'bg-card',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="relative shrink-0">
          <span aria-hidden="true" className={cn('grid size-10 place-items-center rounded-full [&>svg]:size-5', HUE[hue].solid)}>
            <Bot />
          </span>
          <span aria-hidden="true" className={cn('absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-2', PRESENCE[status], ring)} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-item"><ScrollingName name={worker.name} /></h4>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-meta text-muted-foreground">
            <span className="truncate">{type.short} · r{worker.revision}</span>
            {isNew && <span className="shrink-0 rounded-full bg-brand-strong px-1.5 text-overline text-brand-foreground">New</span>}
          </p>
        </div>
        <RuntimeStatusDot status={status} className="mt-0.5 shrink-0" />
      </div>

      <dl className="mt-auto grid grid-cols-3 divide-x divide-border">
        <Figure label="Runs">{formatCount(o.runs)}</Figure>
        <Figure label="Memory">{formatCount(worker.learning.memories)}</Figure>
        <Figure label="Outcome">
          <span className={ran ? VERDICT_TEXT[o.verdict!] : 'text-muted-foreground'}>{ran ? VERDICT_SHORT[o.verdict!] : 'None'}</span>
        </Figure>
      </dl>

      <span aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-1', HUE[hue].solid)} />
    </Link>
  )
}

function Arrows({ label }: { label: string }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  if (!canScrollPrev && !canScrollNext) return null
  const btn = 'grid size-10 place-items-center rounded-full bg-card text-foreground outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-card'
  return (
    <span className="flex shrink-0 gap-2">
      <button type="button" className={btn} onClick={scrollPrev} disabled={!canScrollPrev} aria-label={`Previous Workers in ${label}`}>
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={btn} onClick={scrollNext} disabled={!canScrollNext} aria-label={`Next Workers in ${label}`}>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </span>
  )
}

function ShelfTitle({ g, id }: { g: Group; id: string }) {
  return (
    <h3 id={id} className="flex min-w-0 items-center gap-2.5 text-section">
      <HueTile hue={contextHue(g.key)} icon={contextIcon(g.key)} size="sm" />
      <span className="truncate" title={g.label}>{g.label}</span>
    </h3>
  )
}

// Each bounded context is a shelf: its name, "View all", and its Workers as a carousel of three
// or four. Viewing one context lays every Worker in it out as a grid.
export function WorkerTiles({ groups, newest, focused, onFocus, from }: { groups: Group[]; newest: string | null; focused: string | null; onFocus: (key: string | null) => void; from: string }) {
  if (focused) {
    const g = groups.find((x) => x.key === focused)
    if (!g) return null
    return (
      <section aria-labelledby="shelf-focused" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <ShelfTitle g={g} id="shelf-focused" />
          <Button variant="ghost" onClick={() => onFocus(null)}><ArrowLeft aria-hidden="true" />All contexts</Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {g.workers.map((w) => (
            <li key={w.composition_id}><WorkerCard worker={w} isNew={w.composition_id === newest} from={from} /></li>
          ))}
        </ul>
      </section>
    )
  }
  return (
    <div className="flex flex-col gap-10">
      {groups.map((g) => {
        const id = `shelf-${g.key}`
        return (
          <section key={g.key} aria-labelledby={id}>
            <Carousel opts={{ align: 'start', slidesToScroll: 'auto' }} aria-labelledby={id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <ShelfTitle g={g} id={id} />
                <span className="flex shrink-0 items-center gap-3">
                  <button type="button" onClick={() => onFocus(g.key)} className="rounded-sm text-item outline-none hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50">
                    View all <span className="tabular-nums">({g.workers.length})</span>
                  </button>
                  <Arrows label={g.label} />
                </span>
              </div>
              <CarouselContent className="py-1">
                {g.workers.map((w) => (
                  <CarouselItem key={w.composition_id} className="basis-[85%] sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4">
                    <WorkerCard worker={w} isNew={w.composition_id === newest} from={from} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )
      })}
    </div>
  )
}
