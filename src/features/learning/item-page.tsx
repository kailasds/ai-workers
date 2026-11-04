import { Link, useLocation, useParams } from 'react-router'
import { ArrowRight, CalendarClock, Check, FileSearch, History, PlayCircle, Route, SearchX, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge, VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { FactList, PanelPart } from '@/components/platform/detail-parts'
import { FactStrip, IconTile, Panel } from '@/components/platform/panel'
import { formatCount, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DESTINATION, journey } from './journey'
import { CATEGORY, ITEM_BY_ID, workerLabel, type Evidence } from './model'
import { CATEGORY_LOOK } from './look'
import { EmptyRow, LINK, PagedRows, StateBadge, type From } from './ui'
import { ReviewActions } from './review-actions'
import { useReviews } from './reviews'

function RunRow({ run }: { run: NonNullable<Evidence['run']> }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <PlayCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate font-mono text-meta">{run.ref}</span>
      <span className="hidden text-meta text-muted-foreground tabular-nums sm:block"><Timestamp iso={run.at} />{run.cost !== null && ` · ${formatUsd(run.cost)}`}</span>
      <VerdictBadge verdict={run.verdict} />
    </li>
  )
}

/**
 * One learning item on its own page, read in a single panel: a short summary of what was learned
 * and why, where it stands on its path, its few facts, then the runs behind it.
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

  const from = state?.from
  const workerTo = `/learning/workers/${item.workerId}`
  const crumbs: Crumb[] = [{ label: 'Learning', to: '/learning' }, ...(from && from.to !== workerTo ? [{ label: from.label, to: from.to }] : [{ label: workerLabel(item.workerId), to: from?.to ?? workerTo }]), { label: CATEGORY[item.category].one }]
  const look = CATEGORY_LOOK[item.category]
  const review = reviews[item.id]
  const base = journey(item)
  // A demo approval reaches the second step.
  const j = review?.verdict === 'approved' ? { ...base, next: null, steps: base.steps.map((st, i) => ({ ...st, status: i < 2 ? ('done' as const) : i === 2 ? ('current' as const) : st.status })) } : base
  const runs = item.evidence.flatMap((e) => (e.run ? [e.run] : []))
  const notes = item.evidence.flatMap((e) => (e.note ? [e.note] : []))
  const met = runs.filter((r) => r.verdict === 'MET').length
  const facts = [...item.details, ...notes, { label: 'Recorded by', value: item.source }]

  return (
    <PageContainer>
      <PageHeader
        crumbs={crumbs}
        title={item.title}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {review ? <StatusBadge tone={review.verdict === 'approved' ? 'success' : 'neutral'}>{review.verdict === 'approved' ? 'Approved (demo)' : 'Declined (demo)'}</StatusBadge> : <StateBadge state={item.state} />}
            {item.demo && <StatusBadge tone="neutral" icon={null}>Demo</StatusBadge>}
          </div>
        }
        actions={
          <>
            {item.state === 'proposed' && !review && <ReviewActions item={item} />}
            <Button asChild variant="outline"><Link to={`/workers/${item.workerId}`}>Open Worker</Link></Button>
          </>
        }
      />

      <FactStrip
        facts={[
          { icon: UserRound, label: 'Worker', value: <Link to={workerTo} className={LINK} title={workerLabel(item.workerId)}>{workerLabel(item.workerId)}</Link> },
          { icon: look.icon, label: 'Category', value: <Link to={`/learning/categories/${item.category}`} className={LINK}>{CATEGORY[item.category].label}</Link> },
          { icon: CalendarClock, label: item.when.kind === 'as_of' ? 'As of' : 'Recorded', value: <Timestamp iso={item.when.iso} /> },
          { icon: FileSearch, label: 'Evidence', value: runs.length ? `${formatCount(runs.length)} ${runs.length === 1 ? 'run' : 'runs'} · ${formatCount(met)} met` : 'No run named' },
        ]}
      />

      <Panel id="summary" title="Summary" icon={look.icon} hue={look.hue} flush>
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="text-body">{item.summary} {item.why}</p>
          {review && <p className="text-meta text-muted-foreground">“{review.reason}” · <Timestamp iso={review.at} /></p>}
          <FactList facts={facts} />
        </div>

        <PanelPart icon={Route} title="Where it stands" />
        <div className="px-5 py-4">
          <ol className="grid grid-flow-col auto-cols-fr" aria-label="Path of this learning">
            {j.steps.map((st, i) => (
              <li key={st.label} className="relative flex flex-col items-center gap-2 px-1 text-center">
                {i < j.steps.length - 1 && <span aria-hidden="true" className={cn('absolute top-3 left-1/2 h-px w-full', st.status === 'done' ? 'bg-primary' : 'bg-border')} />}
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative grid size-6 place-items-center rounded-full',
                    st.status === 'done' && 'bg-primary text-primary-foreground',
                    st.status === 'current' && 'bg-card ring-2 ring-primary',
                    st.status === 'next' && 'border border-dashed border-muted-foreground/50 bg-card',
                  )}
                >
                  {st.status === 'done' && <Check className="size-3.5" />}
                </span>
                <span className={cn('text-meta', st.status === 'next' ? 'text-muted-foreground' : 'font-medium text-foreground')}>{st.label}</span>
                <span className="sr-only">{st.status === 'done' ? ': done' : st.status === 'current' ? ': now' : ': not yet'}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
            <IconTile icon={look.icon} hue={look.hue} size="sm" />
            Becomes <span className="font-medium text-foreground">{DESTINATION[j.becomes].label}</span>
            {j.next && <><ArrowRight className="size-3.5" aria-hidden="true" />needs <span className="font-medium text-foreground">{j.next}</span></>}
          </p>
        </div>

        <PanelPart
          icon={FileSearch}
          title={runs.length ? `Runs behind it · ${formatCount(runs.length)}` : 'Runs behind it'}
          aside={<Link to={`/workers/${item.workerId}?view=runs`} className={LINK}>Open runs</Link>}
        />
        {runs.length === 0 ? <EmptyRow>No run named</EmptyRow> : <PagedRows rows={runs} label="Runs behind it" render={(r) => <RunRow key={r.ref} run={r} />} />}

        {item.history.length > 0 && (
          <>
            <PanelPart icon={History} title="History" />
            <ol className="divide-y">
              {item.history.map((h) => (
                <li key={h.label} className="flex items-center gap-3 px-5 py-3">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
                  <span className="min-w-0 flex-1 text-body">{h.label}</span>
                  <span className="text-meta text-muted-foreground"><Timestamp iso={h.at} /></span>
                </li>
              ))}
            </ol>
          </>
        )}
      </Panel>
    </PageContainer>
  )
}

