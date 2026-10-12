import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useResource } from '@/hooks/use-resource'
import { getExecutiveDashboard } from '@/lib/api/dashboard'
import { formatRelative, formatRunName } from '@/lib/format'
import type { WorldData } from './world-data'

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
        <p className="font-mono text-[11px] tracking-[0.16em] text-white/50">LAST 30 DAYS</p>
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

      <section aria-label="How to read the campus" className="fixed bottom-4 left-4 z-20 hidden w-[360px] rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-4 text-meta text-white/70 backdrop-blur-xl md:block">
        <p className="mb-2.5 font-mono text-[10px] tracking-[0.16em] text-white/45">HOW KNOWLEDGE MOVES</p>
        <ul className="flex flex-col gap-2">
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" aria-hidden="true" /><span><b className="font-medium text-white">Learning out.</b> {world.memories} memories recorded by {world.learningWorkers} Workers travel to the Sentinel.</span></li>
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full border border-dashed border-amber-400" aria-hidden="true" /><span><b className="font-medium text-white">Held at the ring.</b> {world.sentinel.acting ? 'The Sentinel promotes what it approves.' : 'The Sentinel is in shadow: it records, and nothing is promoted to the platform yet.'}</span></li>
          <li className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc]" aria-hidden="true" /><span><b className="font-medium text-white">Knowledge in.</b> The platform brain's Skills, languages and EVALs flow to every team and into the build bay.</span></li>
        </ul>
        {lens === 'campus' && (
          <p className="mt-3 border-t border-white/10 pt-2.5 text-white/50">Figures are Workers: solid = packaged, dashed = not packaged yet, green = serving, amber halo = needs attention. Drag to look around; click anything to open it.</p>
        )}
      </section>
    </>
  )
}
