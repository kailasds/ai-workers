import { Link, useNavigate } from 'react-router'
import { CircleHelp, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DataSource } from '@/components/platform/data-source'
import { SectionNav } from '@/components/platform/section-nav'
import { StatusBadge } from '@/components/platform/status-badge'
import { LEARNING_VIEWS, STATUSES, type StatusKey, type WorkerRef } from './learning-model'

type Source = React.ComponentProps<typeof DataSource>

/**
 * Learning sits inside the Brain hub, which carries the page header. Its three views are pills;
 * the map is an explicit, optional step off to the side, never the default. One line under the
 * views says where the figures come from.
 */
export function LearningLayout({ view, utilities, source, onRetry, children }: { view: string; utilities?: React.ReactNode; source?: Omit<Source, 'onRetry'>; onRetry?: () => void; children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionNav variant="pills" value={view} onChange={(v) => navigate(LEARNING_VIEWS.find((x) => x.value === v)!.to)} items={LEARNING_VIEWS} label="Learning" />
          <div className="flex flex-wrap items-center gap-2">
            {utilities}
            {view !== 'map' && (
              <Button asChild variant="outline">
                <Link to="/learning/map"><Network aria-hidden="true" />Explore map</Link>
              </Button>
            )}
          </div>
        </div>
        {source && <DataSource {...source} onRetry={onRetry} />}
      </div>
      {children}
    </div>
  )
}

/** A Worker's name, with its short id when another Worker has the same name. */
export function WorkerName({ worker, link = true, className }: { worker: WorkerRef | null; link?: boolean; className?: string }) {
  if (!worker) return <span className="text-muted-foreground">Worker not reported</span>
  const body = (
    <>
      {worker.name}
      {worker.short && <span className="ml-1.5 font-mono text-meta text-muted-foreground">{worker.short}</span>}
    </>
  )
  return link ? (
    <Link to={`/workers/${worker.id}`} className={`rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''}`}>
      {body}
    </Link>
  ) : (
    <span className={className}>{body}</span>
  )
}

export function StateBadge({ status }: { status: StatusKey }) {
  const s = STATUSES[status]
  return <StatusBadge tone={s.tone} icon={s.tone === 'neutral' ? null : undefined}>{s.label}</StatusBadge>
}

/** What each learning state means, on demand. */
export function StatusGuide() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm"><CircleHelp aria-hidden="true" />What the states mean</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <dl className="flex flex-col gap-3">
          {(Object.keys(STATUSES) as StatusKey[]).map((k) => (
            <div key={k}>
              <dt><StateBadge status={k} /></dt>
              <dd className="mt-1 text-meta text-muted-foreground">{STATUSES[k].meaning}</dd>
            </div>
          ))}
          <div>
            <dt className="text-meta font-medium">Not reported</dt>
            <dd className="mt-1 text-meta text-muted-foreground">The source didn’t say. It isn’t the same as zero or none.</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
