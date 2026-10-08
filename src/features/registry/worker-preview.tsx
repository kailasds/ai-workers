import { Link } from 'react-router'
import { ArrowRight, Ban, Ellipsis, ExternalLink, PencilRuler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { VerdictBadge } from '@/components/platform/status-badge'
import { formatDay, formatRelative } from '@/lib/format'
import { workerTypeLabel } from '@/lib/vocabulary'
import type { PortfolioWorker } from '@/lib/types/worker'
import { consoleState } from './worker-actions'

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-item">{children}</dd>
    </div>
  )
}

/**
 * What an operator needs to decide whether to open a Worker: what it does, whether it is up,
 * what it last did, and the next step. Everything else lives on the Worker page.
 */
export function WorkerPreview({ worker, from, headingLevel = 'h2' }: { worker: PortfolioWorker; from: string; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const status = runtimeStatus(worker.runtime)
  const o = worker.last_outcome
  const access = consoleState(worker)
  return (
    <div className="flex flex-col gap-6">
      <div>
        <RuntimeStatusDot status={status} />
        <H className="mt-2 text-section text-balance">{worker.name}</H>
        <p className="mt-1 text-meta text-muted-foreground">{worker.bounded_context.label}</p>
      </div>

      <p className="line-clamp-5 text-body text-foreground/85">{worker.outcome}</p>

      <dl className="grid grid-cols-3 gap-4 border-y py-4">
        <Figure label="Last outcome">{o.verdict ? <VerdictBadge verdict={o.verdict} /> : <span className="text-muted-foreground">No runs</span>}</Figure>
        <Figure label="Runs">{o.runs === 0 ? <span className="text-muted-foreground">None</span> : <span className="tabular-nums">{o.runs}</span>}</Figure>
        <Figure label="Memory">{worker.learning.memories === 0 ? <span className="text-muted-foreground">None</span> : <span className="tabular-nums">{worker.learning.memories} {worker.learning.memories === 1 ? 'record' : 'records'}</span>}</Figure>
      </dl>

      <p className="text-meta text-muted-foreground">
        {worker.owner ?? 'Owner not reported'} · {workerTypeLabel(worker.worker_type)} · r{worker.revision} · composed {formatDay(worker.created_at)}
        {o.finished_at && <> · last run {formatRelative(o.finished_at)}</>}
      </p>

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
  )
}
