import { Link, useParams } from 'react-router'
import { ArrowRight, Brain, CircleDot } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useWorldData } from './world-data'

const VERDICT: Record<string, { word: string; tone: string }> = {
  MET: { word: 'Met', tone: 'text-emerald-300' },
  NOT_MET: { word: 'Not met', tone: 'text-rose-300' },
  NOT_ADJUDICABLE: { word: 'Not judged', tone: 'text-amber-200' },
}

/** A room opened: the team in one bounded context, like opening a team's door. */
export function RoomPanel() {
  const { key = '' } = useParams()
  const read = useWorldData()
  const world = read.data
  if (!world) {
    return read.error ? (
      <div className="p-5"><ErrorState title="This team could not be read." message={read.error.message} onRetry={read.refresh} /></div>
    ) : (
      <LoadingRegion label="Opening the room…" className="flex flex-col gap-3 p-5"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /></LoadingRegion>
    )
  }
  const room = world.places.find((p) => p.key === key && p.kind === 'room')
  if (!room) return <div className="p-5"><EmptyState icon={CircleDot} title="No such team" description="This bounded context is not on the campus." /></div>

  const ws = [...room.workers].sort((a, b) => Number(b.runtime.serving) - Number(a.runtime.serving) || (b.last_outcome.last_run_at ?? '').localeCompare(a.last_outcome.last_run_at ?? ''))
  const packaged = ws.filter((w) => world.packagedIds.has(w.composition_id)).length
  const serving = ws.filter((w) => w.runtime.serving > 0).length
  const attention = ws.filter((w) => w.runtime.attention > 0).length
  const ran = ws.filter((w) => w.last_outcome.runs > 0)
  const metLast = ran.filter((w) => w.last_outcome.verdict === 'MET').length
  const memories = ws.reduce((s, w) => s + w.learning.memories, 0)

  return (
    <div className="flex flex-col gap-6 p-5">
      <header>
        <span className="grid size-10 place-items-center rounded-xl text-lg font-bold text-[#0b0f24]" style={{ background: room.color }} aria-hidden="true">{room.name[0]}</span>
        <p className="mt-3 text-overline text-muted-foreground uppercase">Team · bounded context</p>
        <h1 className="mt-1 text-section">{room.title}</h1>
        <p className="mt-1 text-meta text-muted-foreground">{ws.length} Workers · {packaged} packaged · {serving} serving{attention ? ` · ${attention} need attention` : ''}</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border bg-card p-3"><p className="text-meta text-muted-foreground">Ran</p><p className="text-xl font-semibold tabular-nums">{ran.length}</p></div>
        <div className="rounded-xl border bg-card p-3"><p className="text-meta text-muted-foreground">Last run met</p><p className={cn('text-xl font-semibold tabular-nums', ran.length && metLast / ran.length >= 0.5 ? 'text-emerald-300' : ran.length ? 'text-rose-300' : '')}>{ran.length ? `${metLast}/${ran.length}` : '—'}</p></div>
        <div className="rounded-xl border bg-card p-3"><p className="text-meta text-muted-foreground">Memories</p><p className="text-xl font-semibold tabular-nums">{memories}</p></div>
      </div>

      <section className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="flex items-center gap-2 text-item font-semibold"><Brain className="size-4 text-amber-300" aria-hidden="true" />Learning from this team</p>
        <p className="mt-1 text-meta text-muted-foreground">
          {memories
            ? `${memories} memories recorded by ${ws.filter((w) => w.learning.memories > 0).length} Workers. They go to the Sentinel for review before anything reaches the platform brain.`
            : 'No Worker in this team has recorded a memory yet.'}
        </p>
      </section>

      <section aria-labelledby="room-workers">
        <div className="flex items-baseline justify-between">
          <h2 id="room-workers" className="text-item font-semibold">Workers</h2>
          <Link to={`/workers?context=${room.key}`} className="flex items-center gap-1 text-meta text-[#9cc0ff] hover:text-foreground">As a list <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
        </div>
        <ul className="mt-2 flex flex-col divide-y divide-white/5 rounded-xl border bg-card">
          {ws.map((w) => {
            const v = w.last_outcome.verdict ? VERDICT[w.last_outcome.verdict] : null
            const isPackaged = world.packagedIds.has(w.composition_id)
            return (
              <li key={w.composition_id}>
                <Link to={`/workers/${w.composition_id}`} className="flex items-center gap-3 px-3 py-2.5 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring">
                  <span
                    aria-hidden="true"
                    className={cn('size-2.5 shrink-0 rounded-full', w.runtime.serving ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isPackaged ? 'bg-white/60' : 'border border-dashed border-white/60')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-item">{w.name}</span>
                    <span className="block truncate text-meta text-muted-foreground">
                      {w.runtime.serving ? 'Serving' : isPackaged ? 'Packaged' : 'Not packaged'}
                      {w.learning.memories ? ` · ${w.learning.memories} memories` : ''}
                      {w.last_outcome.last_run_at ? ` · ran ${formatRelative(w.last_outcome.last_run_at)}` : ''}
                    </span>
                  </span>
                  {w.runtime.attention > 0 && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-meta text-amber-200">Attention</span>}
                  {v && <span className={cn('text-meta font-medium', v.tone)}>{v.word}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
