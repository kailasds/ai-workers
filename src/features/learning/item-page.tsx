import { Link, useLocation, useParams } from 'react-router'
import { Bot, CalendarClock, ChevronRight, Database, FileSearch, History, Lightbulb, Link2, MessageCircleQuestion, PlayCircle, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge, VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatDuration, formatTokens, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CATEGORY, ITEM_BY_ID, related, RELATION_LABEL, workerLabel, type Evidence, type LearningItem } from './model'
import { Details, FactStrip, IconTile, Panel } from '@/components/platform/panel'
import { EmptyRow, LINK, ShowMore, StateBadge, type From } from './ui'
import { CATEGORY_LOOK } from './look'
import { JourneyPanel } from './growth'

function RunRow({ run, workerId }: { run: NonNullable<Evidence['run']>; workerId: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
      <PlayCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-meta text-foreground">{run.ref}</span>
        <span className="mt-0.5 flex flex-wrap gap-x-2 text-meta text-muted-foreground tabular-nums">
          <Timestamp iso={run.at} />
          {run.seconds !== null && <><span aria-hidden="true">·</span>{formatDuration(run.seconds)}</>}
          {run.tokens !== null && <><span aria-hidden="true">·</span>{formatTokens(run.tokens)} tokens</>}
          {run.cost !== null && <><span aria-hidden="true">·</span>{formatUsd(run.cost)}</>}
        </span>
      </span>
      <VerdictBadge verdict={run.verdict} />
      <Link to={`/workers/${workerId}?view=runs`} className={`text-meta ${LINK}`}>Open runs</Link>
    </li>
  )
}

function EvidencePanel({ item }: { item: LearningItem }) {
  const runs = item.evidence.flatMap((e) => (e.run ? [e.run] : []))
  const notes = item.evidence.flatMap((e) => (e.note ? [e.note] : []))
  const runsLabel = item.category === 'skill-changes' ? 'Runs before the proposal' : item.demo || item.category === 'experiences' ? 'Source run' : 'Runs of this Worker'
  return (
    <Panel id="evidence" title="Supporting evidence" icon={FileSearch} hue="teal" flush>
      {notes.length > 0 && (
        <div className={cn('px-5 py-4', runs.length > 0 && 'border-b')}>
          <Details rows={notes.map((n) => ({ label: n.label, value: n.value }))} />
        </div>
      )}
      {runs.length > 0 && (
        <>
          <p className="bg-muted/40 px-5 py-2 text-meta font-medium text-muted-foreground">{runsLabel} · {formatCount(runs.length)}</p>
          <ShowMore rows={runs} render={(r) => <RunRow key={r.ref} run={r} workerId={item.workerId} />} />
        </>
      )}
      {runs.length === 0 && notes.length === 0 && <EmptyRow>No evidence recorded</EmptyRow>}
    </Panel>
  )
}

/**
 * One learning item, read as an explanation: what was learned, why it was recorded, the evidence,
 * related learning and, where the source has it, its history. The breadcrumb leads back to where
 * the reader came from: a category, a Worker or another item.
 */
export function LearningItemPage() {
  const { itemId = '' } = useParams()
  const { state } = useLocation() as { state: { from?: From } | null }
  const item = ITEM_BY_ID.get(itemId)
  if (!item) {
    return (
      <PageContainer>
        <PageHeader crumbs={[{ label: 'Learning', to: '/learning' }, { label: 'Not found' }]} title="Learning item not found" />
        <EmptyState icon={SearchX} title="There is no learning item with this id" action={<Button asChild variant="outline"><Link to="/learning">Back to Learning</Link></Button>} />
      </PageContainer>
    )
  }

  const from = state?.from
  const workerTo = `/learning/workers/${item.workerId}`
  const crumbs: Crumb[] = [{ label: 'Learning', to: '/learning' }, ...(from && from.to !== workerTo ? [{ label: from.label, to: from.to }] : [{ label: workerLabel(item.workerId), to: from?.to ?? workerTo }]), { label: CATEGORY[item.category].one }]
  const self: From = { label: item.title, to: `/learning/items/${item.id}` }
  const rel = related(item)
  const cat = CATEGORY[item.category]
  const look = CATEGORY_LOOK[item.category]
  const runs = item.evidence.filter((e) => e.run).map((e) => e.run!)

  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={item.title} meta={<div className="flex flex-wrap items-center gap-2"><StateBadge state={item.state} />{item.demo && <StatusBadge tone="neutral" icon={null}>Demo</StatusBadge>}</div>} actions={<Button asChild variant="outline"><Link to={`/workers/${item.workerId}`}>Open Worker</Link></Button>} />

      <FactStrip
        facts={[
          { icon: Bot, label: 'Worker', value: <Link to={workerTo} className={LINK} title={workerLabel(item.workerId)}>{workerLabel(item.workerId)}</Link> },
          { icon: look.icon, label: 'Category', value: <Link to={`/learning/categories/${item.category}`} className={LINK}>{cat.label}</Link> },
          { icon: CalendarClock, label: item.when.kind === 'as_of' ? 'As of' : 'Recorded', value: <Timestamp iso={item.when.iso} /> },
          { icon: FileSearch, label: 'Evidence', value: runs.length ? `${formatCount(runs.length)} ${runs.length === 1 ? 'run' : 'runs'} · ${formatCount(runs.filter((r) => r.verdict === 'MET').length)} met` : 'No run named' },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="what" title="What was learned" icon={Lightbulb} hue="blue">
            <p className="text-body">{item.summary}</p>
            {item.details.length > 0 && <div className="mt-5 border-t pt-5"><Details rows={item.details} /></div>}
          </Panel>

          <JourneyPanel item={item} />

          <Panel id="why" title="Why it was recorded" icon={MessageCircleQuestion} hue="violet">
            <p className="text-body">{item.why}</p>
          </Panel>

          <EvidencePanel item={item} />

          {item.history.length > 0 && (
            <Panel id="history" title="History" icon={History} hue="amber">
              <ol className="flex flex-col gap-4">
                {item.history.map((h, i) => (
                  <li key={h.label} className="relative flex gap-3">
                    <span aria-hidden="true" className="flex flex-col items-center">
                      <span className="mt-1.5 size-2.5 rounded-full bg-primary" />
                      {i < item.history.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                    </span>
                    <span>
                      <span className="block text-body">{h.label}</span>
                      <span className="block text-meta text-muted-foreground"><Timestamp iso={h.at} /></span>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <Panel id="related" title="Related learning" icon={Link2} hue="cyan" count={rel.length} flush>
            {rel.length === 0 ? (
              <EmptyRow>None linked</EmptyRow>
            ) : (
              <ul className="divide-y">
                {rel.map(({ item: r, relation }) => (
                  <li key={r.id}>
                    <Link to={`/learning/items/${r.id}`} state={{ from: self }} className="flex items-start gap-3 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                      <IconTile icon={CATEGORY_LOOK[r.category].icon} hue={CATEGORY_LOOK[r.category].hue} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-item">{r.title}</span>
                        <span className="mt-0.5 block truncate text-meta text-muted-foreground">{RELATION_LABEL[relation]}</span>
                      </span>
                      <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel id="source" title="Source" icon={Database} hue="violet">
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-meta text-muted-foreground">Recorded by</dt>
                <dd className="mt-0.5 text-body">{item.source}</dd>
              </div>
              <div>
                <dt className="text-meta text-muted-foreground">Item id</dt>
                <dd className="mt-0.5 font-mono text-meta break-all">{item.id}</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
    </PageContainer>
  )
}
