import { createElement, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Plus, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { HUE, workerTypeMeta } from '@/components/platform/hue'
import { StatusBadge } from '@/components/platform/status-badge'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { WorkerType } from '@/lib/types/catalog'
import type { PortfolioWorker } from '@/lib/types/worker'

export interface TypeGroup {
  type: WorkerType
  workers: PortfolioWorker[]
}

function stats(workers: PortfolioWorker[]) {
  return {
    contexts: new Set(workers.map((w) => w.bounded_context.key)).size,
    serving: workers.filter((w) => w.runtime.serving > 0).length,
    runs: workers.reduce((n, w) => n + w.last_outcome.runs, 0),
  }
}

/** The banner's picture: the Worker type's own icon on a tilted card, with its Worker count. */
function Illustration({ g }: { g: TypeGroup }) {
  const meta = workerTypeMeta(g.type.key)
  return (
    <div aria-hidden="true" className="relative hidden h-44 w-64 shrink-0 md:block">
      <Sparkle className="absolute top-0 left-6 size-9 fill-foreground text-foreground" />
      <Sparkle className="absolute bottom-6 left-0 size-5 fill-foreground text-foreground" />
      <div className="absolute top-6 right-10 flex h-36 w-44 rotate-[-6deg] flex-col gap-3 rounded-2xl bg-card p-4 shadow-[0_24px_40px_-24px_var(--foreground)]">
        <span className={cn('grid size-12 place-items-center rounded-block [&>svg]:size-6', HUE[meta.hue].solid)}>{createElement(meta.icon)}</span>
        <span className="h-2 w-28 rounded-full bg-track" />
        <span className="h-2 w-20 rounded-full bg-track" />
        <span className="h-2 w-24 rounded-full bg-track" />
      </div>
      <span className={cn('absolute right-2 bottom-2 grid size-16 rotate-[8deg] place-items-center rounded-full text-section tabular-nums ring-4 ring-card', HUE[meta.hue].solid)}>{g.workers.length}</span>
    </div>
  )
}

const ADVANCE_MS = 6000

/**
 * The store-front for Worker types: one banner per type in a carousel that advances on its own,
 * holding still while pointed at or focused from the keyboard. "View Workers" narrows the list to
 * that type; a type still in build says so and offers nothing to view.
 */
export function TypeShowcase({ groups, active, onSelect }: { groups: TypeGroup[]; active: string | null; onSelect: (key: string | null) => void }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!api) return
    const sync = () => setCurrent(api.selectedScrollSnap())
    sync()
    api.on('select', sync)
    return () => {
      api.off('select', sync)
    }
  }, [api])

  useEffect(() => {
    if (!api || hovered || groups.length < 2) return
    const t = setInterval(() => api.scrollNext(), ADVANCE_MS)
    return () => clearInterval(t)
  }, [api, hovered, groups.length])

  // A type chosen elsewhere (the type filter, a link) brings its banner forward.
  useEffect(() => {
    if (!api || !active) return
    const i = groups.findIndex((g) => g.type.key === active)
    if (i >= 0) api.scrollTo(i)
  }, [api, active, groups])

  if (groups.length === 0) return null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Keyboard focus holds it still; a mouse click (on a dot or the button) leaves it running.
      onFocusCapture={(e) => e.target.matches(':focus-visible') && setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <Carousel setApi={setApi} opts={{ loop: groups.length > 1 }} aria-label="Worker types">
        <CarouselContent>
          {groups.map((g, i) => {
            const meta = workerTypeMeta(g.type.key)
            const s = stats(g.workers)
            const available = g.type.availability === 'available'
            return (
              <CarouselItem key={g.type.key} aria-label={`${i + 1} of ${groups.length}: ${g.type.display_name}`}>
                <div
                  className={cn('relative flex min-h-56 items-center justify-between gap-6 overflow-hidden rounded-xl px-6 py-8 sm:px-10', HUE[meta.hue].soft)}
                  style={{ backgroundImage: 'linear-gradient(var(--card) 1px, transparent 1px), linear-gradient(90deg, var(--card) 1px, transparent 1px)', backgroundSize: '44px 44px' }}
                >
                  <div className="relative min-w-0 max-w-2xl">
                    <p className={cn('flex items-center gap-2 text-overline', HUE[meta.hue].text)}>
                      Worker type
                      {!available && <StatusBadge tone="neutral" icon={null}>In build</StatusBadge>}
                    </p>
                    <h2 className="mt-2 text-[1.75rem] leading-tight font-medium text-balance sm:text-[2.25rem]">{g.type.display_name}</h2>
                    <p className="mt-2 line-clamp-2 text-body text-muted-foreground">{g.type.summary}</p>
                    {available ? (
                      <>
                        <p className="mt-3 text-meta text-muted-foreground tabular-nums">
                          <span className="text-foreground">{formatCount(g.workers.length)} Workers</span> · {formatCount(s.contexts)} bounded contexts · {formatCount(s.serving)} serving · {formatCount(s.runs)} runs
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {g.workers.length > 0 && (
                            <Button className="px-5" onClick={() => onSelect(g.type.key)}>
                              View Workers
                              <ArrowRight aria-hidden="true" />
                            </Button>
                          )}
                          <Button asChild variant="outline" className="bg-card px-5">
                            <Link to={`/compose/new?type=${g.type.key}`}><Plus aria-hidden="true" />Compose</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="mt-3 text-meta text-muted-foreground">{g.type.availability_detail || 'Available later.'}</p>
                    )}
                  </div>
                  <Illustration g={g} />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {groups.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5">
            {groups.map((g, i) => (
              <button
                key={g.type.key}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Show ${g.type.display_name}`}
                aria-current={i === current ? 'true' : undefined}
                className={cn('h-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50', i === current ? 'w-7 bg-foreground' : 'w-2 bg-foreground/25 hover:bg-foreground/40')}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  )
}
