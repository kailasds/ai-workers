import { Link, useParams } from 'react-router'
import { ArrowRight, CircleDot } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { formatCount } from '@/lib/format'
import { directoryOf } from './sections'
import { useWorldData, type WorldData } from './world-data'

function PlaceNote({ k, world }: { k: string; world: WorldData }) {
  if (k === 'brain')
    return (
      <p className="text-meta text-muted-foreground">
        {world.memories} memories from {world.learningWorkers} Workers are on their way in.{' '}
        {world.sentinel.acting ? 'The Sentinel promotes what it approves.' : 'None has been promoted yet: the Sentinel is in shadow mode and applies nothing.'}
      </p>
    )
  if (k === 'sentinel')
    return <p className="text-meta text-muted-foreground">{world.sentinel.why || (world.sentinel.acting ? 'The Sentinel is acting.' : 'The Sentinel records its decisions and applies none.')}</p>
  if (k === 'build') return <p className="text-meta text-muted-foreground">{world.drafts.inBuild} Workers are in build. Each leaves for the loading dock once every part is confirmed.</p>
  if (k === 'dock') return <p className="text-meta text-muted-foreground">{world.drafts.packaged} Packages built · {world.deliveries} prepared for customers.</p>
  if (k === 'workshop') return <p className="text-meta text-muted-foreground">{world.harnesses} harnesses are admitted. Every Worker runs on one.</p>
  return null
}

/** A place's lobby: what it is, and every section inside it. */
export function PlaceLobby() {
  const { key = '' } = useParams()
  const read = useWorldData()
  const dir = directoryOf(key)
  if (!dir) return <div className="p-5"><EmptyState icon={CircleDot} title="No such place" description="This place is not on the campus." /></div>
  const world = read.data
  return (
    <div className="flex flex-col gap-6 p-5">
      <header>
        <span className="grid size-11 place-items-center rounded-xl text-[#0b0f24] shadow-[0_0_30px_-6px_var(--c)]" style={{ background: dir.color, '--c': dir.color } as React.CSSProperties} aria-hidden="true">
          <dir.icon className="size-5" />
        </span>
        <p className="mt-3 text-overline text-muted-foreground uppercase">{dir.name}</p>
        <h1 className="mt-1 text-section">{dir.title}</h1>
        <p className="mt-1 text-body text-muted-foreground">{dir.blurb}</p>
        {world && <div className="mt-3"><PlaceNote k={key} world={world} /></div>}
        {!world && read.error && <div className="mt-3"><ErrorState title="Counts could not be read." message="The sections still open." onRetry={read.refresh} /></div>}
      </header>

      {dir.groups.map((g, gi) => (
        <section key={g.label ?? gi} aria-label={g.label ?? dir.title}>
          {g.label && <h2 className="mb-2 text-overline text-muted-foreground uppercase">{g.label}</h2>}
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {g.sections.map((s) => {
              const n = world && s.count ? s.count(world) : null
              return (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="group flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 outline-none transition-colors hover:border-white/25 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5" style={{ color: dir.color }} aria-hidden="true"><s.icon className="size-[18px]" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-item font-semibold">{s.label}</span>
                      <span className="block truncate text-meta text-muted-foreground">{s.hint}</span>
                    </span>
                    {n !== null && n !== undefined && <span className="text-item font-semibold tabular-nums text-foreground/90">{formatCount(n)}</span>}
                    {!world && s.count && <Skeleton className="h-4 w-6" />}
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      {!world && !read.error && <LoadingRegion label="Reading counts…" className="sr-only"><span /></LoadingRegion>}
    </div>
  )
}
