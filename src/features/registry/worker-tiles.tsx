import { Link } from 'react-router'
import { Activity, ArrowLeft, BrainCircuit, ChevronLeft, ChevronRight, ClipboardCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel'
import { contextHue, contextIcon, HUE, HueTile, workerTypeMeta, type Hue } from '@/components/platform/hue'
import { runtimeStatus, RuntimeStatusDot } from '@/components/platform/runtime-status'
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

/** One figure in its own cell: a hue disc, a large value, then its label. */
function Figure({ icon: Icon, hue, label, children }: { icon: LucideIcon; hue: Hue; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-block bg-muted p-3">
      <span aria-hidden="true" className={cn('grid size-7 place-items-center rounded-full [&>svg]:size-3.5', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
      {/* The label is read first; it shows under the value. */}
      <dt className="order-last -mt-1.5 truncate text-meta text-muted-foreground">{label}</dt>
      <dd className="truncate text-[1.375rem] leading-7 font-medium tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * One Worker, card-shaped like an order: its bounded context's icon, id and state, name, figures,
 * its kind of work and a way in. The bottom edge carries the context's colour, so a shelf reads as one.
 */
export function WorkerCard({ worker, isNew, from }: { worker: PortfolioWorker; isNew: boolean; from: string }) {
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  const status = runtimeStatus(worker.runtime)
  const o = worker.last_outcome
  const ran = o.verdict && o.runs > 0
  return (
    <Link
      to={`/workers/${worker.composition_id}`}
      state={{ from }}
      className={cn(
        'group relative flex h-full flex-col gap-5 overflow-hidden rounded-xl p-5 pb-6 text-card-foreground outline-none hover:ring-1 hover:ring-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50',
        status === 'attention' ? 'bg-warning-soft' : 'bg-card',
      )}
    >
      <div className="flex items-center gap-3">
        <HueTile hue={hue} icon={contextIcon(worker.bounded_context.key)} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-mono text-meta text-subtle-foreground">#{worker.composition_id.slice(0, 8)}</span>
          <RuntimeStatusDot status={status} className="mt-0.5" />
        </span>
        {isNew && <span className="shrink-0 rounded-full bg-brand-strong px-2 py-0.5 text-overline text-brand-foreground">New</span>}
      </div>

      <div className="min-w-0">
        <h4 className="line-clamp-2 text-[1.0625rem] leading-6 text-balance">{worker.name}</h4>
        <p className="mt-1 text-meta text-muted-foreground">Revision {worker.revision}</p>
      </div>

      {/* The figures, each in its own tinted cell: what it has done, what it kept, how it last went. */}
      <dl className="grid grid-cols-3 gap-1.5">
        <Figure icon={Activity} hue="cyan" label="Runs">{formatCount(o.runs)}</Figure>
        <Figure icon={BrainCircuit} hue="violet" label="Memory">{formatCount(worker.learning.memories)}</Figure>
        <Figure icon={ClipboardCheck} hue="teal" label="Outcome">
          <span className={ran ? VERDICT_TEXT[o.verdict!] : 'text-muted-foreground'}>{ran ? VERDICT_SHORT[o.verdict!] : 'None'}</span>
        </Figure>
      </dl>

      <div className="mt-auto flex items-center gap-3">
        <span className="flex min-w-0 flex-1 items-center gap-2 text-meta text-muted-foreground">
          <type.icon className={cn('size-4 shrink-0', HUE[type.hue].text)} aria-hidden="true" />
          <span className="truncate">{type.short}</span>
        </span>
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary-hover">
          <ChevronRight className="size-5" />
        </span>
      </div>

      <span aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-1.5', HUE[hue].solid)} />
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
