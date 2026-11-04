import { Link, useLocation, useParams } from 'react-router'
import { ArrowRight, Brain, CalendarClock, Check, Database, FileSearch, History, ListTree, MessageCircleQuestion, PencilRuler, PlayCircle, Route, SearchX, UserRound, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge, VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { IconTile } from '@/components/platform/panel'
import { formatCount, formatDuration, formatTokens, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CATEGORY, ITEM_BY_ID, workerLabel, type Evidence, type LearningItem } from './model'
import { DESTINATION, journey, type Destination } from './journey'
import { CATEGORY_LOOK } from './look'
import { LINK, PagedRows, StateBadge, type From } from './ui'
import { ReviewActions } from './review-actions'
import { useReviews } from './reviews'

const DEST_ICON: Record<Destination, LucideIcon> = { memory: Database, knowledge: Brain, skill: PencilRuler }

/** One section of the item's card: an icon and title, then the body. Dividers separate sections. */
function Section({ icon, title, children, className }: { icon: LucideIcon; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn('border-t px-5 py-5 sm:px-6', className)}>
      <h2 className="mb-4 flex items-center gap-2.5 text-item">
        <IconTile icon={icon} hue="blue" size="sm" />
        {title}
      </h2>
      {children}
    </section>
  )
}

type StepStatus = 'done' | 'current' | 'next'

/** Steps across, centred: each circle sits over its label, and a line joins the circle centres. */
function Steps({ steps, label }: { steps: { label: string; sub?: React.ReactNode; status: StepStatus }[]; label: string }) {
  return (
    <ol aria-label={label} className="mx-auto grid max-w-3xl grid-flow-col auto-cols-fr">
      {steps.map((st, i) => (
        <li key={st.label} className="relative flex flex-col items-center gap-2 px-2 text-center">
          {i < steps.length - 1 && <span aria-hidden="true" className={cn('absolute top-3.5 left-1/2 h-0.5 w-full', st.status === 'done' ? 'bg-primary' : 'bg-border')} />}
          <span
            aria-hidden="true"
            className={cn(
              'relative grid size-7 place-items-center rounded-full text-meta font-medium',
              st.status === 'done' && 'bg-primary text-primary-foreground',
              st.status === 'current' && 'bg-card text-primary-strong ring-2 ring-primary',
              st.status === 'next' && 'border border-dashed border-muted-foreground/50 bg-card text-muted-foreground',
            )}
          >
            {st.status === 'done' ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn('text-meta', st.status === 'next' ? 'text-muted-foreground' : 'font-medium text-foreground')}>
            {st.label}
            <span className="sr-only">{st.status === 'done' ? ': done' : st.status === 'current' ? ': now' : ': not yet'}</span>
          </span>
          {st.sub && <span className="-mt-1 text-meta text-muted-foreground">{st.sub}</span>}
        </li>
      ))}
    </ol>
  )
}

function RunRow({ run, workerId }: { run: NonNullable<Evidence['run']>; workerId: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
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

/** Label and value pairs as an even grid, each with its icon when it has one. */
function Facts({ rows }: { rows: { icon?: LucideIcon; label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="flex min-w-0 items-start gap-3">
          {r.icon && <r.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
          <div className="min-w-0">
            <dt className="text-meta text-muted-foreground">{r.label}</dt>
            <dd className="mt-0.5 truncate text-body">{r.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/**
 * One learning item on one card: what was learned and where it stands, then its path, details,
 * why it was recorded, the evidence and its history, each a section of the same card.
 */
export function LearningItemPage() {
  const { itemId = '' } = useParams()
  const { state } = useLocation() as { state: { from?: From } | null }
  const reviews = useReviews()
  const item = ITEM_BY_ID.get(itemId)
  if (!item) {
    return (
      <PageContainer>
        <PageHeader crumbs={[{ label: 'Learning', to: '/learning' }, { label: 'Not found' }]} title="Learning item not found" />
        <EmptyState icon={SearchX} title="There is no learning item with this id" action={<Button asChild variant="outline"><Link to="/learning">Back to Learning</Link></Button>} />
      </PageContainer>
    )
  }
  return <ItemCard item={item} from={state?.from} review={reviews[item.id]} />
}

function ItemCard({ item, from, review }: { item: LearningItem; from?: From; review: ReturnType<typeof useReviews>[string] | undefined }) {
  const workerTo = `/learning/workers/${item.workerId}`
  const crumbs: Crumb[] = [{ label: 'Learning', to: '/learning' }, ...(from && from.to.split('?')[0] !== '/learning' ? [{ label: from.label, to: from.to }] : from ? [] : [{ label: workerLabel(item.workerId), to: workerTo }]), { label: CATEGORY[item.category].one }]
  if (from && from.to.split('?')[0] === '/learning') crumbs[0] = { label: 'Learning', to: from.to }
  const look = CATEGORY_LOOK[item.category]
  const base = journey(item)
  // A demo approval reaches the second step; a decline leaves the path where it was.
  const j = review?.verdict === 'approved' ? { ...base, steps: base.steps.map((st, i) => ({ ...st, status: i < 2 ? ('done' as const) : st.status === 'current' ? ('next' as const) : st.status })) } : base
  const runs = item.evidence.flatMap((e) => (e.run ? [e.run] : []))
  const notes = item.evidence.flatMap((e) => (e.note ? [e.note] : []))
  const met = runs.filter((r) => r.verdict === 'MET').length
  const pending = item.state === 'proposed' && !review

  return (
    <PageContainer>
      <PageHeader
        crumbs={crumbs}
        title={item.title}
        actions={<>{pending && <ReviewActions item={item} />}<Button asChild variant="outline"><Link to={`/workers/${item.workerId}`}>Open Worker</Link></Button></>}
      />

      <article className="overflow-hidden rounded-xl border bg-card">
        {/* What was learned and where it stands. */}
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <IconTile icon={look.icon} hue={look.hue} />
          <p className="min-w-0 flex-1 text-item">{item.summary}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {review ? <StatusBadge tone={review.verdict === 'approved' ? 'success' : 'neutral'}>{review.verdict === 'approved' ? 'Approved (demo)' : 'Declined (demo)'}</StatusBadge> : <StateBadge state={item.state} />}
            {item.demo && <StatusBadge tone="neutral" icon={null}>Demo</StatusBadge>}
          </div>
        </div>

        <div className="border-t bg-muted/30 px-5 py-4 sm:px-6">
          <Facts
            rows={[
              { icon: UserRound, label: 'Worker', value: <Link to={workerTo} className={LINK} title={workerLabel(item.workerId)}>{workerLabel(item.workerId)}</Link> },
              { icon: look.icon, label: 'Category', value: <Link to={`/learning/categories/${item.category}`} className={LINK}>{CATEGORY[item.category].label}</Link> },
              { icon: CalendarClock, label: item.when.kind === 'as_of' ? 'As of' : 'Recorded', value: <Timestamp iso={item.when.iso} /> },
              { icon: FileSearch, label: 'Evidence', value: runs.length ? `${formatCount(runs.length)} ${runs.length === 1 ? 'run' : 'runs'} · ${formatCount(met)} met` : 'No run named' },
              { icon: DEST_ICON[j.becomes], label: 'Becomes', value: DESTINATION[j.becomes].label },
              { icon: Database, label: 'Recorded by', value: item.source },
            ]}
          />
        </div>

        <Section icon={Route} title="Path">
          <Steps steps={j.steps} label="Path of this learning" />
          {j.next && (
            <p className="mt-5 text-center text-meta text-muted-foreground">
              <ArrowRight className="mr-1.5 inline size-3.5 align-[-2px]" aria-hidden="true" />
              Next: <span className="text-foreground">{j.next}</span>
            </p>
          )}
        </Section>

        {item.details.length > 0 && (
          <Section icon={ListTree} title="Details">
            <Facts rows={item.details} />
          </Section>
        )}

        <Section icon={MessageCircleQuestion} title="Why it was recorded">
          <p className="text-body">{item.why}</p>
        </Section>

        <Section icon={FileSearch} title="Evidence">
          {notes.length > 0 && <div className={cn(runs.length > 0 && 'mb-2 border-b pb-4')}><Facts rows={notes} /></div>}
          {runs.length > 0 && <PagedRows rows={runs} label="Evidence runs" render={(r) => <RunRow key={r.ref} run={r} workerId={item.workerId} />} />}
          {runs.length === 0 && notes.length === 0 && <p className="text-body text-muted-foreground">None recorded</p>}
        </Section>

        {item.history.length > 0 && (
          <Section icon={History} title="History">
            <Steps steps={item.history.map((h) => ({ label: h.label, sub: h.at ? <Timestamp iso={h.at} /> : 'Time not reported', status: 'done' as const }))} label="History of this learning" />
          </Section>
        )}
      </article>
    </PageContainer>
  )
}
