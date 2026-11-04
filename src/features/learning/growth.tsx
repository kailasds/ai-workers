import { useState } from 'react'
import { ArrowRight, CircleCheck, CircleDashed, CircleX, TrendingDown, TrendingUp } from 'lucide-react'
import { Panel } from '@/components/platform/panel'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { evolution } from './journey'

const VERDICT = {
  MET: { label: 'Met', bar: 'bg-success', icon: CircleCheck, text: 'text-success' },
  NOT_MET: { label: 'Not met', bar: 'bg-destructive', icon: CircleX, text: 'text-destructive' },
  NOT_ADJUDICABLE: { label: 'Not judged', bar: 'bg-muted-foreground/40', icon: CircleDashed, text: 'text-muted-foreground' },
} as const

const pct = (n: number) => `${Math.round(n * 100)}%`

function Change({ label, from, to, better }: { label: string; from: string; to: string; better: boolean | null }) {
  const Icon = better === null ? ArrowRight : better ? TrendingUp : TrendingDown
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <span className="text-meta text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-body tabular-nums">
        <span className="text-muted-foreground">{from}</span>
        <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{to}</span>
        <Icon className={cn('size-4', better === null ? 'text-muted-foreground' : better ? 'text-success' : 'text-destructive')} aria-label={better === null ? 'No change' : better ? 'Better' : 'Worse'} />
      </span>
    </div>
  )
}

/**
 * How a Worker grows: each run with what it left behind, and how its recent runs compare with its
 * earlier ones. What its learning has become is the lifecycle above it.
 */
export function EvolutionPanel({ workerId }: { workerId: string }) {
  const e = evolution(workerId)
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...e.runs.map((r) => r.learned))
  const h = hover === null ? null : e.runs[hover]
  return (
    <Panel id="evolution" title="Evolution" icon={TrendingUp} hue="violet" collapsible>
      {/* Runs on the left; the effect figures stacked in a column on the right. */}
      <div className={cn('grid gap-6 empty:hidden', e.runs.length > 0 && e.effect && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]')}>
        {e.runs.length > 0 && (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-item">Runs <span className="text-meta font-normal text-muted-foreground">· bar height is what each run taught it</span></p>
              <ul className="flex flex-wrap gap-3 text-meta text-muted-foreground" aria-label="Legend">
                {Object.values(VERDICT).map((v) => <li key={v.label} className="inline-flex items-center gap-1.5"><v.icon className={cn('size-3.5', v.text)} aria-hidden="true" />{v.label}</li>)}
              </ul>
            </div>
            <div className="relative mt-3">
              <div className="flex h-20 items-end gap-0.5 border-b" role="list" aria-label="Runs, oldest first">
                {e.runs.map((r, i) => (
                  <span
                    key={r.ref}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${new Date(r.at).toLocaleDateString('en-GB')}: ${VERDICT[r.verdict].label}, ${r.learned} learned`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className="flex h-full min-w-1 flex-1 cursor-default items-end outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={cn('w-full rounded-t-[4px]', VERDICT[r.verdict].bar, hover !== null && hover !== i && 'opacity-50')} style={{ height: `${Math.max(12, (r.learned / max) * 100)}%` }} />
                  </span>
                ))}
              </div>
              {h && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 text-meta whitespace-nowrap shadow-md" style={{ left: `${((hover! + 0.5) / e.runs.length) * 100}%` }}>
                  <p className="font-medium"><Timestamp iso={h.at} /></p>
                  <p className="text-muted-foreground">{VERDICT[h.verdict].label} · {formatCount(h.learned)} learned{h.cost !== null ? ` · ${formatUsd(h.cost)}` : ''}</p>
                </div>
              )}
              <div className="mt-1 flex justify-between text-meta text-muted-foreground"><Timestamp iso={e.runs[0].at} /><Timestamp iso={e.runs.at(-1)!.at} /></div>
            </div>
          </div>
        )}

        {e.effect && (
          <div className="min-w-0">
            <p className="text-item">Effect <span className="text-meta font-normal text-muted-foreground">· earlier runs → recent runs</span></p>
            <div className="mt-3 grid gap-2">
              <Change label="Definition of Done met" from={pct(e.effect.met[0])} to={pct(e.effect.met[1])} better={e.effect.met[1] === e.effect.met[0] ? null : e.effect.met[1] > e.effect.met[0]} />
              {e.effect.cost[0] !== null && e.effect.cost[1] !== null && <Change label="Cost per run" from={formatUsd(e.effect.cost[0])} to={formatUsd(e.effect.cost[1])} better={e.effect.cost[1] === e.effect.cost[0] ? null : e.effect.cost[1] < e.effect.cost[0]} />}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
