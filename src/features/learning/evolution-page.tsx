import { Link } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { contextHue, contextIcon, HueTile } from '@/components/platform/hue'
import { Pager } from '@/components/platform/pager'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { CONTEXTS, IDENTITIES, type ContextOption } from '@/features/compose/compose-model'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import type { PortfolioWorker } from '@/lib/types/worker'
import { EVOLUTION_STATES, type WorkerRef } from './learning-model'
import { LearningLayout, WorkerName } from './learning-layout'
import { useLearning } from './use-learning'

const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'

/** The Workers at one capability, paginated so a large group stays one screen tall. */
function WorkersAt({ workers, refs, next, prefix, contextKey }: { workers: PortfolioWorker[]; refs: Map<string, WorkerRef>; next: ContextOption | null; prefix: string; contextKey: string }) {
  const paged = usePaged(workers, { prefix, defaultSize: 10 })
  return (
    <div className="border-t">
      <ul className="divide-y">
        {paged.rows.map((w) => (
          <li key={w.composition_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-body">
            <WorkerName worker={refs.get(w.composition_id) ?? null} />
            <span className="text-meta text-muted-foreground">{next ? 'No proposal' : 'Widest capability'}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t px-4 py-2.5">
        <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Workers" />
        <Link to={`/workers?context=${contextKey}`} className={`w-fit text-meta ${LINK}`}>Open in the Workers list</Link>
      </div>
    </div>
  )
}

/**
 * Evolution changes what a Worker can do; learning doesn't. Capabilities come from the compose
 * catalogue, the Workers on each from the portfolio. No proposal, approval or readiness is shown,
 * because none is recorded; the one-line reason is drawn from the Sentinel's real status.
 */
export function EvolutionPage() {
  const l = useLearning()
  const o = l.sentinel.data
  const ladders = IDENTITIES.filter((i) => i.availability === 'available')
    .map((i) => ({ identity: i, steps: CONTEXTS.filter((c) => c.identity === i.key).sort((a, b) => a.step - b.step) }))
    .filter((x) => x.steps.length > 0)

  // One reason, from facts the console can read: readiness is the Platform Sentinel's call.
  const reason = !o
    ? 'Proposals come from the Platform Sentinel, whose status couldn’t be read.'
    : !o.mode.acting
      ? `The Platform Sentinel isn’t applying decisions yet${o.coverage.reporting < o.coverage.running ? `, and ${formatCount(o.coverage.reporting)} of ${formatCount(o.coverage.running)} running Workers report to it` : ''}, so no Worker has been marked ready.`
      : 'None has been proposed in the data this console reads.'

  return (
    <LearningLayout view="evolution" source={l.portfolio.data ? l.source : undefined} onRetry={l.refresh}>
      {l.error ? (
        <ErrorState title="Evolution couldn’t be loaded." message={l.error.message} onRetry={l.refresh} />
      ) : !l.portfolio.data ? (
        <LoadingRegion label="Loading evolution…" className="flex flex-col gap-3"><Skeleton className="h-16 bg-track" /><Skeleton className="h-72 bg-track" /></LoadingRegion>
      ) : (
        <div className="flex flex-col gap-6">
          <section aria-labelledby="proposals-title" className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="proposals-title" className="text-section">Capability changes</h2>
              <ol className="flex flex-wrap items-center gap-2" aria-label="Stages of a capability change">
                {EVOLUTION_STATES.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-2" title={s.meaning}>
                    {i > 0 && <span aria-hidden="true" className="h-px w-4 bg-border" />}
                    <StatusBadge tone="neutral" icon={null}>{s.label}: none recorded</StatusBadge>
                  </li>
                ))}
              </ol>
            </div>
            <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No capability change is recorded. {reason}</p>
          </section>

          {ladders.map(({ identity, steps }) => (
            <section key={identity.key} aria-labelledby={`ladder-${identity.key}`} className="flex flex-col gap-2">
              <h2 id={`ladder-${identity.key}`} className="text-section">{identity.label}</h2>
              <Card className="gap-0 py-0">
                <ol className="divide-y">
                  {steps.map((c, i) => {
                    const here = l.workers.filter((w) => w.bounded_context.key === c.key)
                    return (
                      <li key={c.key}>
                        <Collapsible>
                          <div className="flex flex-wrap items-center gap-4 px-4 py-3">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-meta tabular-nums" aria-label={`Step ${i + 1}`}>{i + 1}</span>
                            <HueTile hue={contextHue(c.key)} icon={contextIcon(c.key)} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="text-item">{c.scope}</p>
                              {c.adds && <p className="text-meta text-muted-foreground">Adds {c.adds.charAt(0).toLowerCase()}{c.adds.slice(1)}</p>}
                            </div>
                            {here.length === 0 ? (
                              <span className="text-meta text-muted-foreground">No Workers</span>
                            ) : (
                              <CollapsibleTrigger className="group inline-flex items-center gap-1 rounded-sm text-meta outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                                <span className="font-medium tabular-nums">{formatCount(here.length)}</span> {here.length === 1 ? 'Worker' : 'Workers'}
                                <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                              </CollapsibleTrigger>
                            )}
                          </div>
                          {here.length > 0 && (
                            <CollapsibleContent>
                              <WorkersAt workers={here} refs={l.refs} next={steps[i + 1] ?? null} prefix={`e${c.step}${identity.key.slice(0, 2)}`} contextKey={c.key} />
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </li>
                    )
                  })}
                </ol>
              </Card>
              {steps.length === 1 && <p className="text-meta text-muted-foreground">One capability, so there is nothing to evolve to yet.</p>}
            </section>
          ))}
        </div>
      )}
    </LearningLayout>
  )
}
