import { useState } from 'react'
import { ChevronDown, ChevronRight, CircleCheck, CircleDashed, CircleX, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { verdictLabel } from '@/components/platform/status-badge'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/types/dashboard'
import type { PortfolioWorker } from '@/lib/types/worker'

const VERDICT: Record<Verdict, { icon: LucideIcon; className: string }> = {
  MET: { icon: CircleCheck, className: 'text-success' },
  NOT_MET: { icon: CircleX, className: 'text-destructive' },
  NOT_ADJUDICABLE: { icon: CircleDashed, className: 'text-muted-foreground' },
}

function LastActivity({ worker, inline = false }: { worker: PortfolioWorker; inline?: boolean }) {
  const o = worker.last_outcome
  if (!o.verdict || o.runs === 0) return <span className="text-meta text-muted-foreground">No runs yet</span>
  const { icon: Icon, className } = VERDICT[o.verdict]
  return (
    <span className={inline ? 'flex items-center gap-2' : 'flex flex-col items-end gap-0.5'}>
      <span className={cn('inline-flex items-center gap-1 text-meta font-medium', className)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {verdictLabel(o.verdict)}
      </span>
      {o.finished_at && <span className="text-meta text-muted-foreground">{formatRelative(o.finished_at)}</span>}
    </span>
  )
}

function Row({ worker, selected, isNew, showId, onSelect }: { worker: PortfolioWorker; selected: boolean; isNew: boolean; showId: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          selected && 'bg-accent shadow-[inset_3px_0_0_var(--primary)] hover:bg-accent',
        )}
      >
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-item">{worker.name}</span>
            {isNew && <span className="shrink-0 rounded-full border px-1.5 text-overline text-muted-foreground uppercase">New</span>}
            {showId && <span className="hidden shrink-0 font-mono text-meta text-muted-foreground sm:inline">{worker.composition_id.slice(0, 8)}</span>}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-2 text-meta text-muted-foreground">
            <RuntimeStatusDot status={runtimeStatus(worker.runtime)} />
            <span aria-hidden="true">·</span>
            <span className="truncate">{worker.owner ?? 'Owner not reported'}</span>
            {showId && <span className="shrink-0 font-mono sm:hidden">{worker.composition_id.slice(0, 6)}</span>}
          </span>
          <span className="mt-1 block sm:hidden"><LastActivity worker={worker} inline /></span>
        </span>
        <span className="hidden sm:block"><LastActivity worker={worker} /></span>
        <ChevronRight className="size-4 text-muted-foreground xl:hidden" aria-hidden="true" />
      </button>
    </li>
  )
}

export interface Group {
  key: string
  label: string
  workers: PortfolioWorker[]
}

const COLLAPSED = 4

// Grouped by bounded context: Workers in one context do the same kind of work, so the group
// is the natural unit to scan. Long groups show a few and reveal the rest on demand.
export function WorkerList({
  groups,
  selectedId,
  onSelect,
  newest,
  ambiguous,
  expandAll,
}: {
  groups: Group[]
  selectedId: string | null
  onSelect: (id: string) => void
  newest: string | null
  ambiguous: Set<string>
  expandAll: boolean
}) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  return (
    <div className="divide-y">
      {groups.map((g) => {
        const expanded = expandAll || open.has(g.key) || g.workers.length <= COLLAPSED + 1
        const shown = expanded ? g.workers : g.workers.slice(0, COLLAPSED)
        // Keep the selected Worker visible even inside a collapsed group.
        const selectedHidden = !expanded && selectedId !== null && g.workers.slice(COLLAPSED).some((w) => w.composition_id === selectedId)
        const list = selectedHidden ? [...shown, g.workers.find((w) => w.composition_id === selectedId)!] : shown
        const headingId = `group-${g.key}`
        return (
          <section key={g.key} aria-labelledby={headingId}>
            <div className="flex items-baseline justify-between gap-4 bg-muted/40 px-5 py-2.5">
              <h3 id={headingId} className="min-w-0 truncate text-meta font-medium text-foreground" title={g.label}>
                {g.label}
              </h3>
              <span className="shrink-0 text-meta text-muted-foreground tabular-nums">{g.workers.length}</span>
            </div>
            <ul className="divide-y">
              {list.map((w) => (
                <Row
                  key={w.composition_id}
                  worker={w}
                  selected={w.composition_id === selectedId}
                  isNew={w.composition_id === newest}
                  showId={ambiguous.has(w.composition_id)}
                  onSelect={() => onSelect(w.composition_id)}
                />
              ))}
            </ul>
            {!expanded && (
              <div className="border-t px-3 py-1.5">
                <Button variant="ghost" size="sm" onClick={() => setOpen((s) => new Set(s).add(g.key))} aria-label={`Show ${g.workers.length - COLLAPSED} more Workers in ${g.label}`}>
                  Show {g.workers.length - COLLAPSED} more
                  <ChevronDown aria-hidden="true" />
                </Button>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
