import { createElement } from 'react'
import { Link } from 'react-router'
import { contextHue, contextIcon, HUE, Tag, workerTypeMeta } from '@/components/platform/hue'
import { runtimeStatus, RuntimeStatusDot, type RuntimeStatus } from '@/components/platform/runtime-status'
import { contextOf, identityOfContext } from '@/features/compose/compose-model'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/types/dashboard'
import type { PortfolioWorker } from '@/lib/types/worker'

// Short words for the narrow Outcome tile; the Worker page uses the full ones.
const VERDICT_SHORT: Record<Verdict, string> = { MET: 'Met', NOT_MET: 'Not met', NOT_ADJUDICABLE: 'Pending' }

const VERDICT_TEXT: Record<Verdict, string> = { MET: 'text-success', NOT_MET: 'text-destructive', NOT_ADJUDICABLE: 'text-muted-foreground' }

// Presence, the way a colleague shows as available or away: the dot on the avatar.
const PRESENCE: Record<RuntimeStatus, string> = {
  serving: 'bg-success',
  attention: 'bg-warning',
  stopped: 'bg-subtle-foreground',
  none: 'bg-chip-neutral',
}

/** One figure as a tile: value over label, centred. On card hover the tile lifts to the card colour. */
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 rounded-block bg-muted px-2 py-3 text-center group-hover:bg-card">
      {/* The label is read first; it shows under the value. */}
      <dt className="order-last truncate text-meta text-muted-foreground">{label}</dt>
      <dd className="max-w-full truncate text-item tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * One Worker: a tag for its kind of work, its identity as the title with its bounded context and
 * revision beneath (the Worker's own name is in the title's tooltip), two lines on what that context
 * produces, and three figure tiles.
 * Hovering outlines the card in the primary colour and tints it.
 */
export function WorkerCard({ worker, isNew, from }: { worker: PortfolioWorker; isNew: boolean; from: string }) {
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  const identity = identityOfContext(worker.bounded_context.key)
  // The identity is the title, so the tag says what this Worker delivers rather than repeating it.
  const scope = contextOf(worker.bounded_context.key)?.scope ?? worker.bounded_context.label
  const status = runtimeStatus(worker.runtime)
  const o = worker.last_outcome
  const ran = o.verdict && o.runs > 0
  const ContextIcon = contextIcon(worker.bounded_context.key)
  return (
    <Link
      to={`/workers/${worker.composition_id}`}
      state={{ from }}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground outline-none hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:ring-3 focus-visible:ring-ring/50',
        status === 'attention' && 'border-warning/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Tag hue={type.hue} icon={type.icon} className="min-w-0">{type.short}</Tag>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
          <RuntimeStatusDot status={status} />
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <span aria-hidden="true" className={cn('grid size-11 place-items-center rounded-full ring-4 [&>svg]:size-5', HUE[hue].solid, HUE[hue].ring)}>
            {createElement(ContextIcon)}
          </span>
          <span aria-hidden="true" className={cn('absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-2 ring-card', PRESENCE[status])} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-section" title={identity ? `${identity.label} · ${worker.name}` : worker.name}>{identity?.label ?? worker.name}</h3>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <span title={worker.bounded_context.label} className="min-w-0">
              <span className="inline-flex h-6 max-w-full items-center gap-1 rounded-tag bg-muted px-2 text-meta font-medium whitespace-nowrap text-muted-foreground">
                {createElement(ContextIcon, { className: 'size-3.5 shrink-0', 'aria-hidden': true })}
                <span className="truncate">{scope}</span>
              </span>
            </span>
            <span className="shrink-0 rounded-tag border px-1.5 text-meta leading-[1.375rem] text-muted-foreground tabular-nums">r{worker.revision}</span>
            {isNew && <span className="shrink-0 rounded-full bg-brand-strong px-1.5 text-overline text-brand-foreground">New</span>}
          </div>
        </div>
      </div>

      <p className="line-clamp-2 border-t pt-4 text-meta text-muted-foreground" title={worker.outcome}>{worker.outcome}</p>

      <dl className="mt-auto grid grid-cols-3 gap-2">
        <Figure label="Runs">{formatCount(o.runs)}</Figure>
        <Figure label="Memory">{formatCount(worker.learning.memories)}</Figure>
        <Figure label="Outcome">
          <span className={ran ? VERDICT_TEXT[o.verdict!] : 'text-muted-foreground'}>{ran ? VERDICT_SHORT[o.verdict!] : 'None'}</span>
        </Figure>
      </dl>
    </Link>
  )
}

/** Every matching Worker in one grid: no sections. Narrowing by type or context is the filters' job. */
export function WorkerGrid({ workers, newest, from }: { workers: PortfolioWorker[]; newest: string | null; from: string }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {workers.map((w) => (
        <li key={w.composition_id}><WorkerCard worker={w} isNew={w.composition_id === newest} from={from} /></li>
      ))}
    </ul>
  )
}
