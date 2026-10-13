import { Link } from 'react-router'
import { Activity, ArrowRight, Ban, BrainCircuit, ClipboardCheck, Ellipsis, ExternalLink, PencilRuler, type LucideIcon } from 'lucide-react'
import { contextHue, HUE, HueTile, Tag, workerTypeMeta, type Hue } from '@/components/platform/hue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { VerdictBadge } from '@/components/platform/status-badge'
import { formatDay, formatRelative } from '@/lib/format'
import type { PortfolioWorker } from '@/lib/types/worker'
import { consoleState } from './worker-actions'

/** One figure in a tinted block with a coloured icon disc (design.md §8 icon containers). */
function Stat({ icon: Icon, hue, label, children }: { icon: LucideIcon; hue: Hue; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-block bg-muted p-3">
      <span aria-hidden="true" className={cn('grid size-8 place-items-center rounded-full', HUE[hue].soft, HUE[hue].text)}>
        <Icon className="size-4" />
      </span>
      <dt className="mt-2 text-meta text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-item">{children}</dd>
    </div>
  )
}

const initials = (name: string | null) => (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')

/**
 * What an operator needs to decide whether to open a Worker: what it does, whether it is up,
 * what it last did, and the next step. The header carries its context's hue and its type's icon,
 * so a Worker is recognisable before it is read.
 */
export function WorkerPreview({ worker, from, headingLevel = 'h2' }: { worker: PortfolioWorker; from: string; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const status = runtimeStatus(worker.runtime)
  const o = worker.last_outcome
  const access = consoleState(worker)
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  return (
    <div className="flex flex-col">
      <div className={cn('p-5', HUE[hue].soft)}>
        <div className="flex items-start justify-between gap-3">
          <HueTile hue={hue} icon={type.icon} size="lg" />
          <span className="inline-flex h-7 items-center rounded-full bg-card px-3"><RuntimeStatusDot status={status} /></span>
        </div>
        <H className="mt-4 text-section text-balance">{worker.name}</H>
        <p className={cn('mt-1 text-meta font-medium', HUE[hue].text)}>{worker.bounded_context.label}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag hue={type.hue} icon={type.icon} className="bg-card">{type.short}</Tag>
          <Tag hue="blue" className="bg-card">Revision {worker.revision}</Tag>
          {worker.learning.memories > 0 && <Tag hue="amber" icon={BrainCircuit} className="bg-card">Learning</Tag>}
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <p className="line-clamp-5 text-body text-foreground/85">{worker.outcome}</p>

        <dl className="grid grid-cols-3 gap-2">
          <Stat icon={ClipboardCheck} hue="teal" label="Last outcome">{o.verdict ? <VerdictBadge verdict={o.verdict} /> : <span className="text-muted-foreground">No runs</span>}</Stat>
          <Stat icon={Activity} hue="cyan" label="Runs">{o.runs === 0 ? <span className="text-muted-foreground">None</span> : <span className="tabular-nums">{o.runs}</span>}</Stat>
          <Stat icon={BrainCircuit} hue="violet" label="Memory">{worker.learning.memories === 0 ? <span className="text-muted-foreground">None</span> : <span className="tabular-nums">{worker.learning.memories}</span>}</Stat>
        </dl>

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={cn('grid size-9 shrink-0 place-items-center rounded-full text-meta font-medium', HUE[hue].soft, HUE[hue].text)}>{initials(worker.owner)}</span>
          <p className="min-w-0 text-meta text-muted-foreground">
            <span className="block truncate text-item text-foreground">{worker.owner ?? 'Owner not reported'}</span>
            Composed {formatDay(worker.created_at)}{o.finished_at && <> · last run {formatRelative(o.finished_at)}</>}
          </p>
        </div>

      <div className="flex items-center gap-2">
        <Button asChild className="flex-1">
          <Link to={`/workers/${worker.composition_id}`} state={{ from }}>
            Open Worker
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/workers/${worker.composition_id}?view=runs`} state={{ from }}>Runs</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={`More actions for ${worker.name}`}>
              <Ellipsis aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem disabled={!access.reachable}>
              <ExternalLink aria-hidden="true" />
              Open Worker console
            </DropdownMenuItem>
            {!access.reachable && (
              <DropdownMenuLabel className="flex gap-1.5 pt-0 text-meta font-normal text-muted-foreground">
                <Ban className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                {access.reason}
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/compose/guided/${worker.composition_id}`}>
                <PencilRuler aria-hidden="true" />
                Create new revision
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
