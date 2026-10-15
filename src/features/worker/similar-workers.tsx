import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getWorkerPortfolio } from '@/lib/api/workers'
import type { PortfolioWorker } from '@/lib/types/worker'
import { WorkerCard } from '../registry/worker-tiles'

const LIMIT = 8

/**
 * Workers like this one, nearest first: other Workers in the same bounded context, then the same
 * type of work elsewhere. Its own revisions are left out; they are in Versions.
 */
export function similarTo(worker: PortfolioWorker, all: PortfolioWorker[]) {
  const own = (w: PortfolioWorker) => w.name === worker.name && w.bounded_context.key === worker.bounded_context.key
  const others = all.filter((w) => !own(w))
  const sameContext = others.filter((w) => w.bounded_context.key === worker.bounded_context.key)
  const sameType = others.filter((w) => w.bounded_context.key !== worker.bounded_context.key && w.worker_type === worker.worker_type)
  // One card per Worker name, the newest build of each, so the shelf is not one Worker many times.
  const seen = new Set<string>()
  return [...sameContext, ...sameType]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .sort((a, b) => Number(b.bounded_context.key === worker.bounded_context.key) - Number(a.bounded_context.key === worker.bounded_context.key))
    .filter((w) => {
      const k = `${w.name}|${w.bounded_context.key}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, LIMIT)
}

function Arrows() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  if (!canScrollPrev && !canScrollNext) return null
  const btn = 'grid size-10 place-items-center rounded-full bg-card text-foreground outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-card'
  return (
    <span className="flex shrink-0 gap-2">
      <button type="button" className={btn} onClick={scrollPrev} disabled={!canScrollPrev} aria-label="Previous similar Workers"><ChevronLeft className="size-4" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={scrollNext} disabled={!canScrollNext} aria-label="Next similar Workers"><ChevronRight className="size-4" aria-hidden="true" /></button>
    </span>
  )
}

export function SimilarWorkers({ worker, scenario }: { worker: PortfolioWorker; scenario: string | null }) {
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const similar = useMemo(() => (portfolio.data ? similarTo(worker, portfolio.data.workers) : []), [worker, portfolio.data])
  // Nothing to suggest (or the read failed): the section is left out rather than shown empty.
  if (portfolio.data && similar.length === 0) return null
  if (portfolio.error) return null
  return (
    <section aria-labelledby="similar-title" className="border-t pt-8">
      <Carousel opts={{ align: 'start', slidesToScroll: 'auto' }} aria-labelledby="similar-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="similar-title" className="text-section">Similar Workers</h2>
          <Arrows />
        </div>
        {!portfolio.data ? (
          <LoadingRegion label="Finding similar Workers…" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-track" />)}
          </LoadingRegion>
        ) : (
          <CarouselContent className="py-1">
            {similar.map((w) => (
              <CarouselItem key={w.composition_id} className="basis-[85%] sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4">
                <WorkerCard worker={w} isNew={false} from={`/workers/${worker.composition_id}`} />
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </Carousel>
    </section>
  )
}
