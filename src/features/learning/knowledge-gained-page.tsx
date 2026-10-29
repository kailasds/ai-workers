import { Link, useSearchParams } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Pager } from '@/components/platform/pager'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { useResource } from '@/hooks/use-resource'
import { getLearningWorkers } from '@/lib/api/catalog'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { groupHeld, kindWords, type HeldItem } from './learning-model'
import { LearningLayout, StateBadge, WorkerName } from './learning-layout'
import { useLearning } from './use-learning'

type StateKey = 'assigned' | 'gathering' | 'review' | 'kept' | 'shared' | 'withdrawn'

const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'

/** A state with nothing to list says so in one line, not a large empty card. */
function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">{children}</p>
}

function GatheringList({ held }: { held: HeldItem[] }) {
  const groups = groupHeld(held)
  const paged = usePaged(groups, { prefix: 'g', defaultSize: 10 })
  if (groups.length === 0) return <Note>Nothing is being held in the brains that were read.</Note>
  return (
    <>
      <Card className="gap-0 py-0">
        <ul className="divide-y">
          {paged.rows.map((g) => {
            const h = g[0]
            return (
              <li key={`${h.worker?.id}:${h.skill}:${h.reason}`}>
                <Collapsible>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-item">{g.length} {g.length === 1 ? 'pattern' : 'patterns'} in {h.skillTitle}</span>
                      <span className="block text-meta text-muted-foreground"><WorkerName worker={h.worker} /> · {h.reason}</span>
                    </span>
                    <StateBadge status="gathering" />
                    <CollapsibleTrigger className="group inline-flex items-center gap-1 rounded-sm text-meta text-primary-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                      Details<ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="px-5 pb-4">
                    <ul className="divide-y rounded-block border">
                      {g.map((x) => (
                        <li key={x.key} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2">
                          <span className="text-body">{kindWords(x.kind)}</span>
                          <span className="font-mono text-meta text-muted-foreground">{x.key}</span>
                        </li>
                      ))}
                    </ul>
                    {h.worker && (
                      <p className="mt-3 text-meta">
                        <Link to={`/learning?worker=${h.worker.id}`} className={LINK}>Activity</Link>
                        <span className="text-muted-foreground"> · </span>
                        <Link to={`/workers/${h.worker.id}?view=runs`} className={LINK}>Worker’s runs</Link>
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </li>
            )
          })}
        </ul>
      </Card>
      <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Patterns" />
    </>
  )
}

function ReviewTable({ l }: { l: ReturnType<typeof useLearning> }) {
  const rows = l.workers.filter((w) => w.learning.memories > 0).sort((a, b) => (b.learning.last_at ?? '').localeCompare(a.learning.last_at ?? ''))
  const paged = usePaged(rows, { prefix: 'r', defaultSize: 10 })
  if (rows.length === 0) return <Note>No Worker has kept memory from its runs yet.</Note>
  return (
    <>
      <Card className="gap-0 overflow-x-auto py-0">
        <table className="w-full text-left">
          <caption className="sr-only">Memory records awaiting review, by Worker</caption>
          <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">Worker</th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Records</th>
              <th scope="col" className="hidden px-5 py-2.5 text-right font-medium sm:table-cell">From runs</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Last recorded</th>
              <th scope="col" className="px-5 py-2.5"><span className="sr-only">Links</span></th>
            </tr>
          </thead>
          <tbody className="divide-y text-body">
            {paged.rows.map((w) => (
              <tr key={w.composition_id}>
                <td className="px-5 py-3"><WorkerName worker={l.refs.get(w.composition_id) ?? null} /></td>
                <td className="px-5 py-3 text-right tabular-nums">{formatCount(w.learning.memories)}</td>
                <td className="hidden px-5 py-3 text-right tabular-nums sm:table-cell">{formatCount(w.learning.runs)}</td>
                <td className="px-5 py-3 text-meta"><Timestamp iso={w.learning.last_at} /></td>
                <td className="px-5 py-3 text-right text-meta whitespace-nowrap">
                  <Link to={`/learning?worker=${w.composition_id}`} className={LINK}>Activity</Link>
                  <span className="text-muted-foreground"> · </span>
                  <Link to={`/workers/${w.composition_id}?view=runs`} className={LINK}>Runs</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Workers awaiting review" />
    </>
  )
}

const LIFECYCLE = [
  { term: 'Retired', meaning: 'No longer recommended for new runs. The record stays.' },
  { term: 'Revoked', meaning: 'No longer considered valid. The reason and history stay, and earlier work isn’t undone.' },
  { term: 'Replaced', meaning: 'Superseded by a newer item. Both stay, linked to each other.' },
]

/**
 * What Workers have learned, by where it stands. The summary is also the selector: pick a
 * state to see its records below. Supporting detail opens on demand.
 */
export function KnowledgeGainedPage() {
  const l = useLearning()
  const fleet = useResource('learning-workers', (signal) => getLearningWorkers({ signal }))
  const [params, setParams] = useSearchParams()
  const records = l.workers.reduce((n, w) => n + w.learning.memories, 0)
  const withMemory = l.workers.filter((w) => w.learning.memories > 0).length
  const heldWorkers = new Set(l.held.map((h) => h.worker?.id)).size
  const kept = fleet.data?.totals.okf_approved
  const unlearn = l.sentinel.data?.dimensions.find((d) => d.key === 'unlearn')
  const withdrawn = unlearn ? Object.values(unlearn.counts_7d).reduce((a, b) => a + b, 0) : null

  const states: { key: StateKey; label: string; value: React.ReactNode }[] = [
    { key: 'assigned', label: 'Assigned', value: <span className="text-muted-foreground">In Knowledge</span> },
    { key: 'gathering', label: 'Gathering evidence', value: <><span className="tabular-nums">{formatCount(l.held.length)}</span> items · {formatCount(heldWorkers)} {heldWorkers === 1 ? 'Worker' : 'Workers'}</> },
    { key: 'review', label: 'Awaiting review', value: <><span className="tabular-nums">{formatCount(records)}</span> records · {formatCount(withMemory)} Workers</> },
    { key: 'kept', label: 'Kept', value: fleet.error && !fleet.data ? <span className="text-muted-foreground">Couldn’t load</span> : !fleet.data ? <Skeleton className="h-4 w-16 bg-track" /> : kept && kept.sum !== null ? <span className="tabular-nums">{formatCount(kept.sum)}</span> : <span className="text-muted-foreground">Not reported</span> },
    { key: 'shared', label: 'Shared for reuse', value: <span className="text-muted-foreground">Sharing is off</span> },
    { key: 'withdrawn', label: 'Retired, revoked, replaced', value: <span className="text-muted-foreground">Not exposed</span> },
  ]
  const selected = (states.find((x) => x.key === params.get('state'))?.key ?? 'gathering') as StateKey
  const select = (k: StateKey) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (k === 'gathering') n.delete('state')
      else n.set('state', k)
      for (const x of ['gpage', 'rpage']) n.delete(x)
      return n
    }, { replace: true, preventScrollReset: true })

  return (
    <LearningLayout view="knowledge" source={l.ready ? l.source : undefined} onRetry={l.refresh}>
      {l.error ? (
        <ErrorState title="Knowledge gained couldn’t be loaded." message={l.error.message} onRetry={l.refresh} />
      ) : !l.ready ? (
        <LoadingRegion label="Loading knowledge gained…" className="flex flex-col gap-3"><Skeleton className="h-24 bg-track" /><Skeleton className="h-64 bg-track" /></LoadingRegion>
      ) : (
        <div className="flex flex-col gap-5">
          <nav aria-label="Knowledge by state">
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
              {states.map((st) => (
                <li key={st.key}>
                  <button
                    type="button"
                    aria-current={selected === st.key ? 'true' : undefined}
                    onClick={() => select(st.key)}
                    className={cn(
                      'flex h-full w-full flex-col items-start gap-1 rounded-block border bg-card px-4 py-3 text-left outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50',
                      selected === st.key && 'border-primary bg-primary-soft hover:border-primary',
                    )}
                  >
                    <span className="text-meta text-muted-foreground">{st.label}</span>
                    <span className="text-item">{st.value}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="state-title" className="flex flex-col gap-3">
            {selected === 'assigned' && (
              <>
                <h2 id="state-title" className="text-section">Assigned</h2>
                <Note>Knowledge given to a Worker when it was composed: Skills, domain languages, EVALs and the Definition of Done. It lives in <Link to="/knowledge/skills" className={LINK}>Knowledge</Link>, and each Worker’s set is on its Knowledge tab.</Note>
              </>
            )}
            {selected === 'gathering' && (
              <>
                <div>
                  <h2 id="state-title" className="text-section">Gathering evidence</h2>
                  <p className="text-meta text-muted-foreground">{l.held[0]?.rule ?? 'Kept once enough runs agree'}. From {formatCount(l.brainsRead)} of {formatCount(l.workers.length)} Workers’ brains that could be read.</p>
                </div>
                <GatheringList held={l.held} />
              </>
            )}
            {selected === 'review' && (
              <>
                <div>
                  <h2 id="state-title" className="text-section">Awaiting review</h2>
                  <p className="text-meta text-muted-foreground">Memory saved from runs. It becomes gained knowledge only once the Worker’s Sentinel keeps it.</p>
                </div>
                <ReviewTable l={l} />
              </>
            )}
            {selected === 'kept' && (
              <>
                <h2 id="state-title" className="text-section">Kept</h2>
                <Note>
                  {kept && kept.sum !== null
                    ? `${formatCount(kept.sum)} items kept, reported by ${formatCount(kept.reporting)} Workers. The source gives totals only, not the items.`
                    : 'No Worker reports what its Sentinel kept, so there’s nothing to list. That isn’t the same as nothing kept.'}
                </Note>
              </>
            )}
            {selected === 'shared' && (
              <>
                <h2 id="state-title" className="text-section">Shared for reuse</h2>
                <Note>Sharing between Workers isn’t switched on, so no knowledge is shared for reuse. See <Link to="/sentinel/sharing" className={LINK}>Sentinel › Sharing</Link>.</Note>
              </>
            )}
            {selected === 'withdrawn' && (
              <>
                <h2 id="state-title" className="text-section">Retired, revoked and replaced</h2>
                <Card className="gap-0 py-0">
                  <dl className="divide-y">
                    {LIFECYCLE.map((h) => (
                      <div key={h.term} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:gap-4">
                        <dt className="w-24 shrink-0 text-item">{h.term}</dt>
                        <dd className="text-meta text-muted-foreground">{h.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
                <p className="text-meta text-muted-foreground">
                  The current data source doesn’t expose these statuses for gained knowledge, and this console can’t retire, revoke or replace an item. Shared lessons are withdrawn by Sentinel’s <Link to="/sentinel/unlearn" className={LINK}>Unlearn</Link> check: {withdrawn === null ? 'not reported' : withdrawn === 0 ? 'none in the last 7 days' : `${formatCount(withdrawn)} in the last 7 days`}. Contradictions between memories aren’t checked yet.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </LearningLayout>
  )
}
