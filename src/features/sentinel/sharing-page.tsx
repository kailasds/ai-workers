import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { contextHue, contextIcon, HueTile } from '@/components/platform/hue'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { useScenario } from '@/hooks/use-scenario'
import { contextOf } from '@/features/compose/compose-model'
import { getWorkerPortfolio } from '@/lib/api/workers'
import { formatCount } from '@/lib/format'
import { SHARING_RULES, SHARING_STATES } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'

/**
 * Sharing between Workers: whether it is on, the stages an item passes through, the rules, where
 * it would apply, and the agreements. In the current platform sharing is declared but not active,
 * so there are no agreements to list and no approve, resume or revoke controls.
 */
export function SentinelSharingPage() {
  const scenario = useScenario()
  const portfolio = useResource(`portfolio:${scenario}`, (signal) => getWorkerPortfolio({ signal, scenario }))
  const groups = (portfolio.data?.bounded_contexts ?? []).filter((c) => c.workers >= 2)

  return (
    <SentinelLayout view="sharing" source={portfolio.data ? { snapshotAt: portfolio.data.generated_at, updatedAt: portfolio.updatedAt, refreshFailed: Boolean(portfolio.error), onRetry: portfolio.refresh } : undefined}>
      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <StatusBadge tone="neutral">Off</StatusBadge>
          <p className="min-w-0 flex-1 text-body">Sharing between Workers isn’t switched on. Rules are set, but no knowledge has moved, so each Worker’s gained knowledge stays with that Worker.</p>
        </div>
        <ol className="grid border-t sm:grid-cols-5 sm:divide-x max-sm:divide-y" aria-label="Stages of sharing">
          {SHARING_STATES.map((s, i) => (
            <li key={s.key} className="px-4 py-3">
              <p className="flex items-center gap-2 text-item"><span className="grid size-5 place-items-center rounded-full bg-muted text-meta tabular-nums" aria-hidden="true">{i + 1}</span>{s.label}</p>
              <p className="mt-1 text-meta text-muted-foreground">{s.meaning}</p>
            </li>
          ))}
        </ol>
        <p className="border-t px-5 py-3 text-meta text-muted-foreground">
          Each stage is separate: agreed isn’t delivered, and delivered isn’t used. The Platform Sentinel can suspend an agreement at any stage, with a reason. A Worker’s own Sentinel decides what that Worker keeps; the Platform Sentinel decides whether others may reuse it.
        </p>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section aria-labelledby="rules-title" className="flex flex-col gap-2">
          <h2 id="rules-title" className="text-section">Rules</h2>
          <Card className="gap-0 py-0">
            <dl className="divide-y">
              {SHARING_RULES.map((r) => (
                <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-2.5">
                  <dt className="text-meta text-muted-foreground">{r.label}</dt>
                  <dd className="text-body">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </section>

        <section aria-labelledby="where-title" className="flex flex-col gap-2">
          <h2 id="where-title" className="text-section">Where it would apply</h2>
          {portfolio.error && !portfolio.data ? (
            <ErrorState title="Workers couldn’t be loaded." message={portfolio.error.message} onRetry={portfolio.refresh} />
          ) : !portfolio.data ? (
            <LoadingRegion label="Loading Workers…"><Skeleton className="h-40 bg-track" /></LoadingRegion>
          ) : groups.length === 0 ? (
            <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No bounded context has two or more Workers yet.</p>
          ) : (
            <Card className="gap-0 py-0">
              <p className="border-b px-5 py-2.5 text-meta text-muted-foreground">Only between Workers in the same bounded context.</p>
              <ul className="divide-y">
                {groups.map((g) => (
                  <li key={g.key}>
                    <Link to={`/workers?context=${g.key}`} className="flex items-center gap-3 px-5 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                      <HueTile hue={contextHue(g.key)} icon={contextIcon(g.key)} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-body">{contextOf(g.key)?.scope ?? g.label}</span>
                      <span className="shrink-0 text-meta text-muted-foreground tabular-nums">{formatCount(g.workers)} Workers</span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>

      <section aria-labelledby="agreements-title" className="flex flex-col gap-2">
        <h2 id="agreements-title" className="text-section">Agreements and history</h2>
        <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">
          No agreements or suspensions recorded, because sharing is off. Once it’s on, each agreement lists the giving and receiving Worker, what is shared, its stage, both Sentinels’ decisions and any suspension.
        </p>
      </section>
    </SentinelLayout>
  )
}
