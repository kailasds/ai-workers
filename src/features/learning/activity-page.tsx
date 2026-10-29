import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Activity, Brain, ChevronRight, CircleAlert, Handshake, Hourglass, ScrollText, Sparkles, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Pager } from '@/components/platform/pager'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { EVENT_KINDS, inPeriod, PERIODS, STATUSES, type EventKind, type LearningEvent, type StatusKey } from './learning-model'
import { LearningLayout, StateBadge, StatusGuide, WorkerName } from './learning-layout'
import { useLearning } from './use-learning'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'

const ALL = '__all'

const KIND_ICON: Record<EventKind, LucideIcon> = { memory: Brain, held: Hourglass, skill_change: Sparkles, claim: Handshake, decision: ScrollText }

function When({ when }: { when: LearningEvent['when'] }) {
  if (!when) return <span>Time not reported</span>
  return (
    <span>
      {when.kind === 'as_of' && 'As of '}
      <Timestamp iso={when.iso} />
    </span>
  )
}

function EventRow({ e, onOpen }: { e: LearningEvent; onOpen: () => void }) {
  const Icon = e.attention ? CircleAlert : KIND_ICON[e.kind]
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-4 px-5 py-4 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <span aria-hidden="true" className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-block [&>svg]:size-4 ${e.attention ? 'bg-warning/10 text-warning' : 'bg-primary-soft text-primary-strong'}`}><Icon /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-item">
            {e.title}{e.subject && <span className="text-muted-foreground"> · {e.subject}</span>}
          </span>
          <span className="mt-0.5 block truncate text-meta text-muted-foreground">
            <WorkerName worker={e.worker} link={false} />
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground sm:hidden">
            <StateBadge status={e.status} />
            <When when={e.when} />
          </span>
        </span>
        <span className="hidden shrink-0 flex-col items-end gap-1.5 text-meta text-muted-foreground sm:flex">
          <span className="flex items-center gap-2">
            <StateBadge status={e.status} />
          </span>
          <When when={e.when} />
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

function EventDetail({ e, onClose }: { e: LearningEvent | null; onClose: () => void }) {
  return (
    <DetailSheet open={Boolean(e)} onClose={onClose} title={e ? (e.subject ? `${e.title} · ${e.subject}` : e.title) : ''} description={e ? EVENT_KINDS.find((k) => k.value === e.kind)?.label : undefined} width="lg">
      {e && (
        <div className="flex flex-col gap-6">
          <div className="rounded-block bg-muted p-3">
            <StateBadge status={e.status} />
            <p className="mt-2 text-meta text-muted-foreground">{STATUSES[e.status].meaning}</p>
          </div>
          <FactList>
            <Fact label="Worker"><WorkerName worker={e.worker} /></Fact>
            <Fact label={e.when?.kind === 'as_of' ? 'As of' : 'When'}>{e.when ? <Timestamp iso={e.when.iso} /> : 'Not reported'}</Fact>
            <Fact label="Source">{e.source}</Fact>
            {e.facts.map((f) => <Fact key={f.label} label={f.label}><span className={f.mono ? 'font-mono text-meta break-all' : 'break-words'}>{f.value}</span></Fact>)}
          </FactList>
          {e.items && e.items.length > 0 && (
            <section aria-labelledby="items-title">
              <h3 id="items-title" className="text-item font-semibold">Items in this activity ({e.items.length})</h3>
              <ul className="mt-2 divide-y rounded-block border">
                {e.items.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5">
                    <span className="text-body">{i.label}</span>
                    <span className="font-mono text-meta text-muted-foreground">{i.id}</span>
                    <span className="w-full text-meta text-muted-foreground">{i.state}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-meta text-muted-foreground">
              {e.kind === 'memory' || e.kind === 'held' ? 'The source doesn’t list which runs each record came from. The Worker’s runs are on its Runs tab.' : null}
              {e.kind === 'held' && ' Nothing to do yet: it’s kept or dropped automatically once enough runs agree.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {e.runsLink && <Button asChild variant="outline" size="sm"><Link to={e.runsLink}>Worker’s runs</Link></Button>}
              {e.worker && <Button asChild variant="outline" size="sm"><Link to={`/learning/workers/${e.worker.id}`}>Worker learning</Link></Button>}
              {e.worker && <Button asChild variant="ghost" size="sm"><Link to={`/learning?worker=${e.worker.id}`} onClick={onClose}>All activity for this Worker</Link></Button>}
              {e.kind === 'decision' && <Button asChild variant="outline" size="sm"><Link to={`/sentinel/decisions/${e.id.replace('decision:', '')}`}>Open decision</Link></Button>}
            </div>
          </div>
        </div>
      )}
    </DetailSheet>
  )
}

/**
 * Learning's default view: what Workers have been learning, newest first. Related items (the
 * same Worker, Skill and state) are one row; the detail sheet keeps every item and its evidence.
 */
export function LearningActivityPage() {
  const l = useLearning()
  const [params, setParams] = useSearchParams()
  const worker = params.get('worker')
  const kind = params.get('type') as EventKind | null
  const status = params.get('status') as StatusKey | null
  const period = PERIODS.find((p) => p.value === params.get('period')) ?? null
  const [open, setOpen] = useState<LearningEvent | null>(null)

  // Changing a filter returns to the first page; paging keeps the filters.
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (v === null || v === ALL) n.delete(k)
      else n.set(k, v)
      n.delete('page')
      return n
    }, { replace: true, preventScrollReset: true })

  const shown = useMemo(
    () => l.events.filter((e) => (!worker || e.worker?.id === worker) && (!kind || e.kind === kind) && (!status || e.status === status) && (!period || inPeriod(e, period.days))),
    [l.events, worker, kind, status, period],
  )
  const workerOptions = useMemo(() => {
    const ids = new Set(l.events.map((e) => e.worker?.id).filter(Boolean) as string[])
    if (worker) ids.add(worker)
    return [...ids].map((id) => l.refs.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r)).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  }, [l.events, l.refs, worker])
  const kinds = EVENT_KINDS.filter((k) => l.events.some((e) => e.kind === k.value))
  const statuses = (Object.keys(STATUSES) as StatusKey[]).filter((s) => l.events.some((e) => e.status === s))
  const attention = shown.filter((e) => e.attention)
  const rest = useMemo(() => shown.filter((e) => !e.attention), [shown])
  const paged = usePaged(rest)
  const filtering = Boolean(worker || kind || status || period)

  const filters = (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter activity">
      <Select value={worker ?? ALL} onValueChange={(v) => set('worker', v)}>
        <SelectTrigger className="w-52" aria-label="Worker"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Workers</SelectItem>
          {workerOptions.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}{w.short ? ` · ${w.short}` : ''}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={kind ?? ALL} onValueChange={(v) => set('type', v)}>
        <SelectTrigger className="w-44" aria-label="Type"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All types</SelectItem>{kinds.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={status ?? ALL} onValueChange={(v) => set('status', v)}>
        <SelectTrigger className="w-44" aria-label="Status"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{statuses.map((st) => <SelectItem key={st} value={st}>{STATUSES[st].label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={period?.value ?? ALL} onValueChange={(v) => set('period', v)}>
        <SelectTrigger className="w-40" aria-label="Period"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All time</SelectItem>{PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
      </Select>
      {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear</Button>}
    </div>
  )

  return (
    <LearningLayout view="activity" source={l.ready ? l.source : undefined} onRetry={l.refresh}>
      {l.error ? (
        <ErrorState title="Learning activity couldn’t be loaded." message={l.error.message} onRetry={l.refresh} />
      ) : !l.ready ? (
        <LoadingRegion label="Loading learning activity…" className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16 rounded-block bg-track" />)}
        </LoadingRegion>
      ) : l.events.length === 0 ? (
        <EmptyState icon={Activity} title="No learning activity yet" description="Activity shows up here when Workers keep memory from their runs, or when their Sentinel holds or keeps something." />
      ) : (
        <>
          {filters}
          {/* Shown only when something actually waits on a person. */}
          {attention.length > 0 && (
            <section aria-labelledby="attention-title" className="flex flex-col gap-2">
              <h2 id="attention-title" className="text-section">Needs a decision <span className="text-muted-foreground tabular-nums">{formatCount(attention.length)}</span></h2>
              <Card className="gap-0 py-0"><ul className="divide-y">{attention.map((e) => <EventRow key={e.id} e={e} onOpen={() => setOpen(e)} />)}</ul></Card>
            </section>
          )}

          <section aria-labelledby="activity-title" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="activity-title" className="text-section">
                {worker ? 'Activity for this Worker' : 'Activity'} <span className="text-muted-foreground tabular-nums">{formatCount(rest.length)}</span>
              </h2>
              <StatusGuide />
            </div>
            {rest.length === 0 ? (
              <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">
                {worker ? 'No activity for this Worker' : 'No activity matches these filters'}.{period ? ' A period only includes activity with its own time.' : ''}
              </p>
            ) : (
              <>
                <Card className="gap-0 py-0">
                  <ul className="divide-y">{paged.rows.map((e) => <EventRow key={e.id} e={e} onOpen={() => setOpen(e)} />)}</ul>
                </Card>
                <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} order="time" label="Activity" />
              </>
            )}
          </section>
        </>
      )}
      <EventDetail e={open} onClose={() => setOpen(null)} />
    </LearningLayout>
  )
}
