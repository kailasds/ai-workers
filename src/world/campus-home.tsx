import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useResource } from '@/hooks/use-resource'
import { getExecutiveDashboard } from '@/lib/api/dashboard'
import { formatRelative, formatRunName } from '@/lib/format'
import type { WorldData } from './world-data'
import { DIRECTORY } from './sections'

const HOTBAR: Record<string, string> = { outcomes: '/dashboard', registry: '/workers', build: '/campus/places/build', dock: '/campus/places/dock', brain: '/campus/places/brain', sentinel: '/campus/places/sentinel', workshop: '/campus/places/workshop' }

/** What the campus says on arrival: the month's result, the latest outcome, and how to read the flows. */
export function CampusHome({ world, lens }: { world: WorldData; lens: 'campus' | 'orbit' }) {
  const dash = useResource('world-brief', (signal) => getExecutiveDashboard({ period: '30d', signal }))
  const d = dash.data
  const met = d?.definition_of_done.met
  const runs = d?.headlines.completed_runs.value
  const latest = d?.run_ledger.rows[0]
  const stale = d?.freshness.state === 'STALE'

  return (
    <>
      <section aria-label="This month" className="fixed top-20 left-4 z-20 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-5 text-white backdrop-blur-xl">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/50">LAST 30 DAYS</p>
        {d ? (
          <>
            <p className="mt-2 text-[2.5rem] leading-none font-bold tracking-tight">
              {met}<span className="text-xl font-medium text-white/50"> of {runs}</span>
            </p>
            <p className="mt-1.5 text-body text-white/75">runs met their Definition of Done</p>
            <p className="mt-1 text-meta text-white/50">{d.definition_of_done.not_met} not met · {d.definition_of_done.not_adjudicable} could not be judged</p>
            {stale && d.freshness.observed_at && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-400/10 px-2.5 py-1 text-meta text-amber-200">
                <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />Last outcome {formatRelative(d.freshness.observed_at)}
              </p>
            )}
            <Link to="/dashboard" className="mt-4 flex items-center gap-1.5 text-item font-semibold text-[#9cc0ff] hover:text-white">
              Open outcomes <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p className="mt-2 text-meta text-white/50">{dash.error ? 'Outcomes could not be read.' : 'Reading outcomes…'}</p>
        )}
      </section>

      {latest && (
        <aside aria-label="Latest outcome" className="fixed top-20 right-4 z-20 hidden max-w-[320px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-3 text-white backdrop-blur-xl lg:flex">
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-[#0b0f24] font-bold ${latest.verdict === 'MET' ? 'bg-emerald-400' : latest.verdict === 'NOT_MET' ? 'bg-rose-400' : 'bg-amber-400'}`} aria-hidden="true">
            {latest.verdict === 'MET' ? '✓' : latest.verdict === 'NOT_MET' ? '✕' : '?'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-meta font-semibold">{latest.worker_name}</span>
            <span className="block text-meta text-white/60">Latest run {latest.verdict === 'MET' ? 'met the bar' : latest.verdict === 'NOT_MET' ? 'did not meet the bar' : 'could not be judged'} · {formatRunName(latest.completed_at)}</span>
          </span>
        </aside>
      )}

      <details open className="group fixed bottom-4 left-4 z-20 hidden w-[330px] rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-4 text-meta text-white/70 backdrop-blur-xl md:block">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-semibold tracking-[0.16em] text-white/45 outline-none focus-visible:text-white [&::-webkit-details-marker]:hidden">
          HOW KNOWLEDGE MOVES<span className="text-white/40 group-open:rotate-180" aria-hidden="true">▾</span>
        </summary>
        <div className="mt-2.5">
        <ul className="flex flex-col gap-2">
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" aria-hidden="true" /><span><b className="font-medium text-white">Learning out.</b> {world.memories} memories recorded by {world.learningWorkers} Workers travel to the Sentinel.</span></li>
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full border border-dashed border-amber-400" aria-hidden="true" /><span><b className="font-medium text-white">Held at the ring.</b> {world.sentinel.acting ? 'The Sentinel promotes what it approves.' : 'The Sentinel is in shadow: it records, and nothing is promoted to the platform yet.'}</span></li>
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc]" aria-hidden="true" /><span><b className="font-medium text-white">Knowledge in.</b> The platform brain's Skills, languages and EVALs flow to every team and into the build bay.</span></li>
        </ul>
        {lens === 'campus' && (
          <p className="mt-3 border-t border-white/10 pt-2.5 text-white/50">Figures are Workers: solid = packaged, dashed = not packaged yet, green = serving, amber halo = needs attention. Drag to move, right-drag to turn, scroll to zoom toward the pointer. Come close to a room to see every Worker's name; click a Worker to look inside it.</p>
        )}
        </div>
      </details>
      {/* Hotbar: every place, one click away, on the main view itself. */}
      <nav aria-label="Places" className="fixed bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-stretch gap-1 rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-1.5 backdrop-blur-xl min-[1180px]:flex">
        {DIRECTORY.filter((d) => HOTBAR[d.key]).map((d) => (
          <Link
            key={d.key}
            to={HOTBAR[d.key]}
            className="group flex w-[76px] flex-col items-center gap-1 rounded-xl px-1 py-2 text-center outline-none transition-colors hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-ring"
            title={d.blurb}
          >
            <span className="grid size-8 place-items-center rounded-lg transition-transform group-hover:-translate-y-0.5" style={{ background: `color-mix(in srgb, ${d.color} 22%, transparent)`, color: d.color }} aria-hidden="true">
              <d.icon className="size-4" />
            </span>
            <span className="text-[11px] leading-tight text-white/75 group-hover:text-white">{d.name}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
