import { Link } from 'react-router'
import { ArrowRight, Bot, FolderOpen, Fingerprint, Workflow, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HUE, workerTypeMeta, type Hue } from '@/components/platform/hue'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { getWorkerTypes } from '@/lib/api/catalog'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { IDENTITIES } from './compose-model'

function Figure({ icon: Icon, hue, label, value }: { icon: LucideIcon; hue: Hue; label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-block bg-muted p-3">
      <span aria-hidden="true" className={cn('grid size-7 place-items-center rounded-full [&>svg]:size-3.5', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
      <dt className="order-last -mt-1.5 truncate text-meta text-muted-foreground">{label}</dt>
      <dd className="truncate text-[1.375rem] leading-7 font-medium tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * The start of composing: choose the kind of work first. Each Worker type is a card with what it
 * can become (identities, bounded contexts) and how many Workers of it already exist. Choosing one
 * opens the stepper with the type already decided.
 */
export function WorkTypePage() {
  const types = useResource('worker-types', (signal) => getWorkerTypes({ signal }))
  const portfolio = useResource('portfolio:null', (signal) => getWorkerPortfolio({ signal }))
  const existing = (key: string) => portfolio.data?.workers.filter((w) => w.worker_type === key).length

  return (
    <PageContainer className="gap-8">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/workers' }, { label: 'Compose' }]}
        title="Choose a Worker type"
        actions={
          <Button asChild variant="outline">
            <Link to="/compose/drafts"><FolderOpen aria-hidden="true" />Saved drafts</Link>
          </Button>
        }
      />

      {types.error ? (
        <ErrorState title="Could not load Worker types." message={types.error.message} onRetry={types.refresh} />
      ) : !types.data ? (
        <LoadingRegion label="Reading Worker types…" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[26rem] rounded-xl bg-track" />)}
        </LoadingRegion>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {types.data.types.map((t) => {
            const meta = workerTypeMeta(t.key)
            const available = t.availability === 'available'
            const identities = IDENTITIES.filter((i) => i.workerType === t.key).length
            const n = existing(t.key)
            return (
              <li key={t.key}>
                <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-xl bg-card', available ? 'hover:ring-1 hover:ring-primary/30' : 'opacity-75')}>
                  <div className={cn('relative grid h-44 place-items-center', HUE[meta.hue].soft)}>
                    <span aria-hidden="true" className={cn('grid size-20 place-items-center rounded-2xl shadow-[0_12px_28px_-14px_var(--foreground)] [&>svg]:size-10', HUE[meta.hue].solid)}><meta.icon /></span>
                    <span className="absolute top-3 right-3">
                      {available ? <StatusBadge tone="success">Available</StatusBadge> : <StatusBadge tone="neutral" icon={null}>In build</StatusBadge>}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h2 className="text-section">
                        {available ? (
                          <Link to={`/compose/new?type=${t.key}`} className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/50 group-hover:underline group-hover:underline-offset-4">
                            {t.display_name}
                          </Link>
                        ) : (
                          t.display_name
                        )}
                      </h2>
                      <p className="mt-1 text-body text-muted-foreground">{t.summary}</p>
                    </div>
                    <dl className="mt-auto grid grid-cols-3 gap-1.5">
                      <Figure icon={Fingerprint} hue={meta.hue} label="Identities" value={identities} />
                      <Figure icon={Workflow} hue={meta.hue} label="Contexts" value={t.bounded_context_count} />
                      <Figure icon={Bot} hue={meta.hue} label="Workers" value={n === undefined ? <span className="text-muted-foreground">–</span> : formatCount(n)} />
                    </dl>
                    {available ? (
                      <span aria-hidden="true" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-item text-primary-foreground group-hover:bg-primary-hover">
                        Start composing
                        <ArrowRight className="size-4" />
                      </span>
                    ) : (
                      <p className="rounded-lg bg-muted px-3 py-2.5 text-meta text-muted-foreground">{t.availability_detail || 'Available later.'}</p>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </PageContainer>
  )
}
