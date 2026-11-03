import { useState } from 'react'
import { ArrowRight, Brain, Check, ChevronRight, CircleCheck, CircleDashed, CircleX, Database, GitCommitHorizontal, PencilRuler, Route, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { IconTile, Panel } from '@/components/platform/panel'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DESTINATION, evolution, journey, type Destination } from './journey'
import type { LearningItem } from './model'

const DEST_ICON: Record<Destination, LucideIcon> = { memory: Database, knowledge: Brain, skill: PencilRuler }

/** Where one learning item goes from here: its path, what it becomes, and what the next step needs. */
export function JourneyPanel({ item }: { item: LearningItem }) {
  const j = journey(item)
  const Icon = DEST_ICON[j.becomes]
  return (
    <Panel id="next" title="What happens next" icon={Route} hue="teal">
      <ol className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr" aria-label="Path of this learning">
        {j.steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <div className="flex w-full items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full text-meta font-medium',
                  s.status === 'done' && 'bg-primary text-primary-foreground',
                  s.status === 'current' && 'bg-primary-soft text-primary-strong ring-2 ring-primary',
                  s.status === 'next' && 'border border-dashed border-muted-foreground/50 text-muted-foreground',
                )}
              >
                {s.status === 'done' ? <Check className="size-3.5" /> : i + 1}
              </span>
              {i < j.steps.length - 1 && <span aria-hidden="true" className={cn('hidden h-px flex-1 sm:block', s.status === 'done' ? 'bg-primary' : 'bg-border')} />}
            </div>
            <span className={cn('text-meta', s.status === 'next' ? 'text-muted-foreground' : 'font-medium text-foreground')}>
              {s.label}
              <span className="sr-only">{s.status === 'done' ? ': done' : s.status === 'current' ? ': now' : ': not yet'}</span>
            </span>
          </li>
        ))}
      </ol>
      <dl className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <IconTile icon={Icon} hue="teal" size="sm" />
          <div><dt className="text-meta text-muted-foreground">Becomes</dt><dd className="text-item">{DESTINATION[j.becomes].label}</dd></div>
        </div>
        <div><dt className="text-meta text-muted-foreground">Useful as</dt><dd className="mt-0.5 text-body">{DESTINATION[j.becomes].use}</dd></div>
        {j.next && <div><dt className="text-meta text-muted-foreground">Next step needs</dt><dd className="mt-0.5 text-body">{j.next}</dd></div>}
      </dl>
    </Panel>
  )
}

const VERDICT = {
  MET: { label: 'Met', bar: 'bg-success', icon: CircleCheck, text: 'text-success' },
  NOT_MET: { label: 'Not met', bar: 'bg-destructive', icon: CircleX, text: 'text-destructive' },
  NOT_ADJUDICABLE: { label: 'Not judged', bar: 'bg-muted-foreground/40', icon: CircleDashed, text: 'text-muted-foreground' },
} as const

function Stage({ icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note?: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
      <IconTile icon={icon} hue="violet" size="sm" />
      <div className="min-w-0">
        <p className="truncate text-meta text-muted-foreground">{label}</p>
        <p className="text-item tabular-nums">{value}{note && <span className="ml-1.5 text-meta font-normal text-warning">{note}</span>}</p>
      </div>
    </div>
  )
}

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
 * How a Worker grows: what its learning has become (memory, knowledge, Skill changes, revision),
 * each run with what it left behind, and how its recent runs compare with its earlier ones.
 */
export function EvolutionPanel({ workerId, revision }: { workerId: string; revision: number }) {
  const e = evolution(workerId)
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...e.runs.map((r) => r.learned))
  const h = hover === null ? null : e.runs[hover]
  return (
    <Panel id="evolution" title="Evolution" icon={TrendingUp} hue="violet" collapsible>
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        <Stage icon={Database} label="Memory" value={formatCount(e.memory)} />
        <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" aria-hidden="true" />
        <Stage icon={Brain} label="Knowledge" value={formatCount(e.knowledge)} />
        <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" aria-hidden="true" />
        <Stage icon={PencilRuler} label="Skill changes" value={formatCount(e.skillChanges)} note={e.skillChanges ? 'to review' : undefined} />
        <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" aria-hidden="true" />
        <Stage icon={GitCommitHorizontal} label="Revision" value={`r${revision}`} />
      </div>

      {e.runs.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-item">Runs <span className="text-meta font-normal text-muted-foreground">· bar height is what each run taught it</span></p>
            <ul className="flex flex-wrap gap-3 text-meta text-muted-foreground" aria-label="Legend">
              {Object.values(VERDICT).map((v) => <li key={v.label} className="inline-flex items-center gap-1.5"><v.icon className={cn('size-3.5', v.text)} aria-hidden="true" />{v.label}</li>)}
            </ul>
          </div>
          <div className="relative mt-3">
            <div className="flex h-16 items-end gap-0.5 border-b" role="list" aria-label="Runs, oldest first">
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
        <div className="mt-6">
          <p className="text-item">Effect <span className="text-meta font-normal text-muted-foreground">· earlier runs → recent runs</span></p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Change label="Definition of Done met" from={pct(e.effect.met[0])} to={pct(e.effect.met[1])} better={e.effect.met[1] === e.effect.met[0] ? null : e.effect.met[1] > e.effect.met[0]} />
            {e.effect.cost[0] !== null && e.effect.cost[1] !== null && <Change label="Cost per run" from={formatUsd(e.effect.cost[0])} to={formatUsd(e.effect.cost[1])} better={e.effect.cost[1] === e.effect.cost[0] ? null : e.effect.cost[1] < e.effect.cost[0]} />}
          </div>
        </div>
      )}
    </Panel>
  )
}
