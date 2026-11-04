import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Check, ChevronDown, FileSearch, History, Link2, MessageCircleQuestion, PlayCircle, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Details, IconTile } from '@/components/platform/panel'
import { StatusBadge, VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDemo } from '@/features/sentinel/demo/store'
import { decisionsFor, operational } from '@/features/sentinel/demo/selectors'
import { OperationalPill } from '@/features/sentinel/ui'
import { DESTINATION, journey } from './journey'
import { CATEGORY, ITEM_BY_ID, related, RELATION_LABEL, workerLabel } from './model'
import { CATEGORY_LOOK } from './look'
import { LINK, StateBadge, withItem } from './ui'
import { ReviewActions } from './review-actions'
import { useReviews } from './reviews'

const RUNS_SHOWN = 5

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-6">
      <h3 className="mb-4 flex items-center gap-2 text-item font-semibold"><Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{title}</h3>
      {children}
    </section>
  )
}

/**
 * A learning item in a side panel, opened with `?item=` from any Learning screen so the reader
 * keeps their place: what was learned, where it stands, why, the evidence, what comes next,
 * related learning, the Worker's governance, then history and source. The full page stays a click
 * away. On a phone the panel takes the whole screen.
 */
export function ItemSheet() {
  const [params, setParams] = useSearchParams()
  const s = useDemo()
  const reviews = useReviews()
  const id = params.get('item')
  if (!id) return null
  const item = ITEM_BY_ID.get(id)
  const close = () => {
    const n = new URLSearchParams(params)
    n.delete('item')
    setParams(n, { replace: true, preventScrollReset: true })
  }

  if (!item) {
    return (
      <DetailSheet open onClose={close} width="lg" title="Learning item not found">
        <p className="text-body text-muted-foreground">There is no learning item with this id.</p>
      </DetailSheet>
    )
  }

  const look = CATEGORY_LOOK[item.category]
  const review = reviews[item.id]
  const base = journey(item)
  // A demo approval reaches the second step; a decline ends the path at the first.
  const j = review?.verdict === 'approved' ? { ...base, steps: base.steps.map((st, i) => ({ ...st, status: i < 2 ? ('done' as const) : st.status === 'current' ? ('next' as const) : st.status })) } : base
  const runs = item.evidence.flatMap((e) => (e.run ? [e.run] : []))
  const notes = item.evidence.flatMap((e) => (e.note ? [e.note] : []))
  const rel = related(item)
  const op = operational(s, item.workerId)
  const controls = s.controls.filter((c) => c.active && c.workerIds.includes(item.workerId)).length
  const decisions = decisionsFor(s, item.workerId).length

  return (
    <DetailSheet
      open
      onClose={close}
      width="2xl"
      title={item.title}
      description={<span className="inline-flex flex-wrap items-center gap-x-1.5"><Link to={`/learning/workers/${item.workerId}`} className={LINK}>{workerLabel(item.workerId)}</Link> · {CATEGORY[item.category].one}</span>}
      footer={
        <>
          {item.state === 'proposed' && !review && <ReviewActions item={item} />}
          <Button asChild variant="outline"><Link to={`/learning/items/${item.id}`}>Open full page</Link></Button>
          <Button asChild variant="ghost"><Link to={`/learning/workers/${item.workerId}`}>Worker’s learning</Link></Button>
        </>
      }
    >
      {/* What was learned and where it stands, together at the top. */}
      <div className="rounded-xl border bg-muted/30 p-5">
        <div className="flex items-center gap-4">
          <IconTile icon={look.icon} hue={look.hue} />
          <p className="min-w-0 flex-1 text-item">{item.summary}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {review ? <StatusBadge tone={review.verdict === 'approved' ? 'success' : 'neutral'}>{review.verdict === 'approved' ? 'Approved (demo)' : 'Declined (demo)'}</StatusBadge> : <StateBadge state={item.state} />}
          {item.demo && <StatusBadge tone="neutral" icon={null}>Demo</StatusBadge>}
        </div>
        {review && <p className="mt-3 text-meta text-muted-foreground">“{review.reason}” · <Timestamp iso={review.at} /></p>}
        {/* Each step is a column: the circle centred over its label, a line joining circle centres. */}
        <ol className="mt-5 grid grid-flow-col auto-cols-fr" aria-label="Path of this learning">
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
      </div>

      {/* The facts about it and what comes next, in one grid. */}
      <div className="my-6">
        <Details
          rows={[
            ...item.details,
            { label: item.when.kind === 'as_of' ? 'As of' : 'Recorded', value: <Timestamp iso={item.when.iso} /> },
            { label: 'Becomes', value: DESTINATION[j.becomes].label },
            { label: 'Useful as', value: DESTINATION[j.becomes].use },
            ...(j.next ? [{ label: 'Next step needs', value: j.next }] : []),
          ]}
        />
      </div>

      <Section icon={MessageCircleQuestion} title="Why it was recorded">
        <p className="text-body">{item.why}</p>
      </Section>

      <Section icon={FileSearch} title="Supporting evidence">
        {notes.length > 0 && <div className="mb-3"><Details rows={notes} /></div>}
        {runs.length === 0 ? (
          notes.length === 0 && <p className="text-meta text-muted-foreground">No evidence recorded.</p>
        ) : (
          <>
            <ul className="divide-y rounded-block border">
              {runs.slice(0, RUNS_SHOWN).map((r) => (
                <li key={r.ref} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                  <PlayCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-meta">{r.ref}</span>
                    <span className="block text-meta text-muted-foreground"><Timestamp iso={r.at} />{r.cost !== null && ` · ${formatUsd(r.cost)}`}</span>
                  </span>
                  <VerdictBadge verdict={r.verdict} />
                </li>
              ))}
            </ul>
            <p className="mt-2 flex flex-wrap gap-x-4 text-meta">
              {runs.length > RUNS_SHOWN && <Link to={`/learning/items/${item.id}#evidence`} className={LINK}>All {formatCount(runs.length)} runs</Link>}
              <Link to={`/workers/${item.workerId}?view=runs`} className={LINK}>Open the Worker’s runs</Link>
            </p>
          </>
        )}
      </Section>

      <Section icon={Link2} title="Related learning">
        {rel.length === 0 ? <p className="text-meta text-muted-foreground">None linked.</p> : (
          <ul className="divide-y rounded-block border">
            {rel.map(({ item: r, relation }) => (
              <li key={r.id}>
                <Link to={withItem(params, r.id)} preventScrollReset className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                  <IconTile icon={CATEGORY_LOOK[r.category].icon} hue={CATEGORY_LOOK[r.category].hue} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body">{r.title}</span>
                    <span className="block truncate text-meta text-muted-foreground">{RELATION_LABEL[relation]}{relation !== 'same_worker' && ` · ${workerLabel(r.workerId)}`}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* The Worker is the one link Learning and Sentinel share; nothing ties an item to a decision. */}
      <Section icon={ShieldCheck} title="Governance of this Worker">
        <Link to={`/sentinel?worker=${item.workerId}`} className="flex flex-wrap items-center gap-3 rounded-block border px-4 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
          <OperationalPill op={op} />
          <span className="min-w-0 flex-1 text-meta text-muted-foreground">{controls === 0 ? 'No controls in force' : `${formatCount(controls)} ${controls === 1 ? 'control' : 'controls'} in force`} · {formatCount(decisions)} {decisions === 1 ? 'decision' : 'decisions'}</span>
          <span className={`inline-flex items-center gap-1 text-meta ${LINK}`}>Open in Sentinel<ArrowRight className="size-3.5" aria-hidden="true" /></span>
        </Link>
      </Section>

      <Collapsible className="border-t pt-6">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-sm text-item font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex items-center gap-2"><History className="size-4 text-muted-foreground" aria-hidden="true" />History and source</span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          {item.history.length > 0 && (
            <ol className="mb-4 flex flex-col gap-2">
              {item.history.map((h) => <li key={h.label} className="text-body">{h.label}<span className="block text-meta text-muted-foreground"><Timestamp iso={h.at} /></span></li>)}
            </ol>
          )}
          <Details rows={[{ label: 'Recorded by', value: item.source }, { label: 'Item id', value: <span className="font-mono text-meta break-all">{item.id}</span> }]} />
        </CollapsibleContent>
      </Collapsible>
    </DetailSheet>
  )
}
