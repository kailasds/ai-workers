import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, GitBranch, Workflow } from 'lucide-react'
import { contextHue, HUE, HueTile, Tag, workerTypeMeta } from '@/components/platform/hue'
import { Button } from '@/components/ui/button'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { VerdictBadge } from '@/components/platform/status-badge'
import { cn } from '@/lib/utils'
import type { PortfolioWorker } from '@/lib/types/worker'

export interface Group {
  key: string
  label: string
  workers: PortfolioWorker[]
}

const initials = (name: string | null) => (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')

/** One Worker as a card: its context's hue and type icon, its name, type and revision, then owner and last verdict. */
function WorkerTile({ worker, isNew, showId, from }: { worker: PortfolioWorker; isNew: boolean; showId: boolean; from: string }) {
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  const o = worker.last_outcome
  return (
    <li className="min-w-0">
      <Link
        to={`/workers/${worker.composition_id}`}
        state={{ from }}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground outline-none hover:ring-1 hover:ring-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className={cn('flex flex-1 flex-col gap-3 p-4', HUE[hue].soft)}>
          <div className="flex items-start justify-between gap-3">
            <HueTile hue={hue} icon={type.icon} />
            <span className="flex flex-wrap justify-end gap-1.5">
              {isNew && <span className="inline-flex h-7 items-center rounded-full bg-brand-strong px-2.5 text-overline text-brand-foreground">New</span>}
              <span className="inline-flex h-7 items-center rounded-full bg-card px-3"><RuntimeStatusDot status={runtimeStatus(worker.runtime)} /></span>
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="line-clamp-2 text-item text-balance group-hover:underline group-hover:underline-offset-4">{worker.name}</h4>
            {showId && <p className="mt-0.5 font-mono text-meta text-subtle-foreground">{worker.composition_id.slice(0, 8)}</p>}
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5">
            <Tag hue={type.hue} icon={type.icon} className="bg-card">{type.short}</Tag>
            <Tag hue="blue" icon={GitBranch} className="bg-card">Revision {worker.revision}</Tag>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full text-meta font-medium', HUE[hue].soft, HUE[hue].text)}>{initials(worker.owner)}</span>
          <span className="min-w-0 flex-1 truncate text-body">{worker.owner ?? 'Owner not reported'}</span>
          {o.verdict && o.runs > 0 ? <VerdictBadge verdict={o.verdict} /> : <span className="shrink-0 text-meta text-muted-foreground">No runs yet</span>}
        </div>
      </Link>
    </li>
  )
}

// design.md §9: grids show 8 cards; a grouped list reveals the rest with "Show n more".
const COLLAPSED = 8

// Grouped by bounded context: Workers in one context do the same kind of work, so the group
// is the natural unit to scan. Each group is a band in its context's hue, then its cards.
export function WorkerTiles({ groups, newest, ambiguous, expandAll, from }: { groups: Group[]; newest: string | null; ambiguous: Set<string>; expandAll: boolean; from: string }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => {
        const expanded = expandAll || open.has(g.key) || g.workers.length <= COLLAPSED + 1
        const shown = expanded ? g.workers : g.workers.slice(0, COLLAPSED)
        const headingId = `group-${g.key}`
        const hue = contextHue(g.key)
        return (
          <section key={g.key} aria-labelledby={headingId} className="flex flex-col gap-4">
            {/* design.md §7.4: a group header is a band in the context's hue, so groups read apart at a glance. */}
            <div className={cn('flex items-center gap-3 rounded-block px-4 py-3', HUE[hue].soft)}>
              <HueTile hue={hue} icon={Workflow} size="sm" />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-overline', HUE[hue].text)}>Bounded context</span>
                <h3 id={headingId} className="truncate text-item text-foreground" title={g.label}>{g.label}</h3>
              </span>
              <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-meta font-medium tabular-nums', HUE[hue].solid)}>
                {g.workers.length}
                <span className="sr-only"> Workers</span>
              </span>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {shown.map((w) => (
                <WorkerTile key={w.composition_id} worker={w} isNew={w.composition_id === newest} showId={ambiguous.has(w.composition_id)} from={from} />
              ))}
            </ul>
            {!expanded && (
              <Button variant="secondary" className="self-start" onClick={() => setOpen((s) => new Set(s).add(g.key))} aria-label={`Show ${g.workers.length - COLLAPSED} more Workers in ${g.label}`}>
                Show {g.workers.length - COLLAPSED} more
                <ChevronDown aria-hidden="true" />
              </Button>
            )}
          </section>
        )
      })}
    </div>
  )
}
