import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BrainCircuit, ChevronRight, Hourglass, LayoutGrid, List, Search, SearchX, SlidersHorizontal, Sparkles, TriangleAlert, UserRound, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { contextHue, HUE, Tag, workerTypeMeta } from '@/components/platform/hue'
import { SECTION_SIZE, useTilePage } from '@/components/platform/section-pager'
import { Pager } from '@/components/platform/pager'
import { PRESENCE, runtimeStatus, RuntimeStatusDot } from '@/components/platform/runtime-status'
import { Panel } from '@/components/platform/panel'
import { SummaryBanner } from '@/components/platform/summary-banner'
import { EmptyState } from '@/components/platform/states'
import { usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { domainLabel } from '@/lib/vocabulary'
import { identityOfContext } from '@/features/compose/compose-model'
import { Figure } from '@/features/registry/worker-tiles'
import { useDemo } from '@/features/sentinel/demo/store'
import { inStage, LIFECYCLE } from './journey'
import { ItemSheet } from './item-sheet'
import { pendingChanges, useReviews } from './reviews'
import { KindTabs, StageTabs, useStage } from './lifecycle'
import { CATEGORIES, inPeriod, isCategory, ITEMS, itemsOf, learningWorkers, PERIODS, WORKER_BY_ID_SAFE, workersWithNew, type CategoryKey, type WorkerLearning } from './model'
import { usePeriod, withPeriod } from './nav'
import { ItemList, PeriodSelect } from './ui'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-ring'
const ANY = 'any'

/** A Worker in one line: who it is, then what is new and what waits for review. */
function WorkerRow({ w, to }: { w: WorkerLearning; to: string }) {
  const review = pendingChanges(itemsOf(w.workerId), useReviews())
  const worker = WORKER_BY_ID_SAFE(w.workerId)!
  const hue = contextHue(worker.bounded_context.key)
  return (
    <Link to={to} className={cn('flex items-center gap-4 px-5 py-3 hover:bg-muted/50 focus-visible:ring-inset', FOCUS)}>
      <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4', HUE[hue].solid)}><UserRound /></span>
      <span className="min-w-0 flex-1 truncate text-item" title={w.name}>{w.name}</span>
      {review > 0 && <span className="inline-flex items-center gap-1 text-meta text-warning tabular-nums" title="Skill changes to review"><Hourglass className="size-3.5" aria-hidden="true" />{formatCount(review)}</span>}
      <span className="inline-flex items-center gap-1 text-meta tabular-nums" title="New learning"><Sparkles className="size-3.5 text-hue-violet" aria-hidden="true" />{formatCount(w.fresh.length)}</span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

/**
 * A Worker as a card, in the Registry card's style: its type and state, its identity, how its new
 * learning splits by category, and three figures. Workers needing attention are
 * outlined in amber and listed first.
 */
function WorkerTile({ w, to }: { w: WorkerLearning; to: string }) {
  const review = pendingChanges(itemsOf(w.workerId), useReviews())
  const worker = WORKER_BY_ID_SAFE(w.workerId)!
  const hue = contextHue(worker.bounded_context.key)
  const type = workerTypeMeta(worker.worker_type)
  const identity = identityOfContext(worker.bounded_context.key)
  const status = runtimeStatus(worker.runtime)
  const stopped = useDemo().workers[w.workerId]?.status === 'stopped'
  const attention = worker.runtime.attention > 0 ? 'A runtime reports a problem' : review > 0 ? `${review} Skill ${review === 1 ? 'change awaits' : 'changes await'} review` : null
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground outline-none hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:ring-3 focus-visible:ring-ring/50',
        attention && 'border-destructive/50 shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_10%,transparent)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Tag hue={type.hue} icon={type.icon} className="min-w-0">{type.short}</Tag>
        {attention ? (
          <span role="img" aria-label={attention} title={attention} className="grid size-7 shrink-0 place-items-center rounded-full bg-destructive text-white"><TriangleAlert className="size-4" aria-hidden="true" /></span>
        ) : (
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
          {stopped ? (
            <span className="inline-flex items-center gap-1.5 text-meta font-medium whitespace-nowrap text-destructive"><span aria-hidden="true" className="size-2 rounded-full bg-destructive" />Stopped by admin</span>
          ) : (
            <RuntimeStatusDot status={status} />
          )}
        </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <span aria-hidden="true" className={cn('grid size-11 place-items-center rounded-full ring-4 [&>svg]:size-5', HUE[hue].solid, HUE[hue].ring)}>
            <UserRound />
          </span>
          <span aria-hidden="true" className={cn('absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-2 ring-card', PRESENCE[status])} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-section" title={identity ? `${identity.label} · ${worker.name}` : worker.name}>{identity?.label ?? worker.name}</h3>
        </div>
      </div>

      <dl className="mt-auto grid grid-cols-3 gap-2 border-t pt-4">
        <Figure label="New" icon={Sparkles}>{formatCount(w.fresh.length)}</Figure>
        <Figure label="Learning" icon={BrainCircuit}>{formatCount(w.total)}</Figure>
        <Figure label="To review" icon={Hourglass}><span className={review > 0 ? 'text-destructive' : 'text-muted-foreground'}>{review > 0 ? formatCount(review) : 'None'}</span></Figure>
      </dl>
    </Link>
  )
}

const EXPLORER_SIZE = 5

/**
 * The lifecycle stages as tabs on top of their records, in one card. Knowledge adds category
 * tabs; a record opens in the side panel. Five at a time.
 */
function StageExplorer({ period, onAll }: { period: (typeof PERIODS)[number]['value']; onAll: () => void }) {
  const reviews = useReviews()
  // Proposed Skill changes nobody has reviewed: listed whatever the period, ahead of the rest.
  const pending = ITEMS.filter((i) => i.state === 'proposed' && !reviews[i.id])
  const { stage, kind, setStage, setKind } = useStage(pending.length ? 'skill-changes' : 'knowledge')
  const st = LIFECYCLE.find((s) => s.key === stage) ?? null
  const fresh = [...pending, ...ITEMS.filter((i) => inPeriod(i, period) && !pending.includes(i))]
  const ofStage = st ? inStage(fresh, st.key) : fresh
  const shown = kind ? ofStage.filter((i) => i.category === kind) : ofStage
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const kinds = <KindTabs items={ofStage} stage={stage} kind={kind} onChange={setKind} />
  return (
    <Panel id="stage" flush>
      <StageTabs items={fresh} value={stage} onChange={setStage} pending={pending} />
      {st?.categories.length !== 1 && <div className="border-b px-5 py-2.5">{kinds}</div>}
      <ItemList
        key={`${stage}|${kind}|${period}`}
        items={shown}
        prefix="s"
        label={st?.label ?? 'All learning'}
        pageSize={EXPLORER_SIZE}
        empty={<>Nothing here in the {periodLabel}.{period !== 'all' && <> <button type="button" className="text-primary-strong underline-offset-4 hover:underline" onClick={onAll}>Show all learning</button></>}</>}
      />
    </Panel>
  )
}

/**
 * Learning, as a lifecycle: run experiences become knowledge when enough runs agree, and
 * knowledge may become a Skill change a person approves. Choosing a stage shows its records;
 * an item opens in a side panel. Below, the Workers where learning is happening and the changes
 * waiting for review.
 */
// Learning's summary: the one thing to do (review Skill changes) or what is new in the period,
// its figures, and the period itself. Counted from the learning snapshot and the demo reviews.
function LearningBanner({ period, periodLabel, onPeriod }: { period: (typeof PERIODS)[number]['value']; periodLabel: string; onPeriod: (p: (typeof PERIODS)[number]['value']) => void }) {
  const [params] = useSearchParams()
  const reviews = useReviews()
  const pending = ITEMS.filter((i) => i.state === 'proposed' && !reviews[i.id])
  const changes = pendingChanges(pending, reviews)
  const fresh = ITEMS.filter((i) => inPeriod(i, period))
  const freshWorkers = new Set(fresh.map((i) => i.workerId)).size
  const reviewTo = (() => {
    const p = new URLSearchParams(params)
    if (pending[0]) p.set('item', pending[0].id)
    p.set('stage', 'skill-changes')
    return { search: p.toString(), hash: 'stage' }
  })()
  return (
    <SummaryBanner
      hue="cyan"
      icon={BrainCircuit}
      eyebrow="Learning"
      title={changes ? `${formatCount(changes)} Skill ${changes === 1 ? 'change waits' : 'changes wait'} for your review` : fresh.length ? `${formatCount(fresh.length)} new learning ${fresh.length === 1 ? 'item' : 'items'} in the ${periodLabel}` : `Nothing new in the ${periodLabel}`}
      facts={[
        `${formatCount(fresh.length)} new from ${formatCount(freshWorkers)} ${freshWorkers === 1 ? 'Worker' : 'Workers'}`,
        `${formatCount(ITEMS.filter((i) => i.state === 'agreed').length)} agreed across runs`,
        `${formatCount(ITEMS.filter((i) => i.state === 'gathering').length)} collecting evidence`,
        `${formatCount(ITEMS.length)} learning items in all`,
      ]}
      action={
        <>
          <PeriodSelect value={period} onChange={onPeriod} />
          {pending.length > 0 && <Button asChild className="px-5"><Link to={reviewTo} preventScrollReset><Hourglass aria-hidden="true" />Review Skill changes</Link></Button>}
        </>
      }
    />
  )
}

export function LearningPage() {
  const [params, setParams] = useSearchParams()
  const [period, setPeriod] = usePeriod()
  const [q, setQ] = useState(params.get('q') ?? '')
  const category = isCategory(params.get('wkind') ?? undefined) ? (params.get('wkind') as CategoryKey) : null
  const type = params.get('type')
  const domain = params.get('domain')
  // Filter choices come from the Workers with learning in the period, so none leads to nothing.
  const all = learningWorkers(period)
  const types = [...new Set(all.map((w) => w.type))].sort()
  const domains = [...new Set(all.map((w) => w.domain).filter((d): d is string => Boolean(d)))].sort()
  const noDomain = all.some((w) => w.domain === null)
  const kinds = CATEGORIES.map((c) => ({ ...c, count: all.reduce((n, w) => n + w.fresh.filter((i) => i.category === c.key).length, 0) }))
  const view = params.get('view') === 'list' ? 'list' : 'tiles'
  const rows = workersWithNew(period, { q, type, domain, category })
  const tilePage = useTilePage()
  const pageSize = view === 'tiles' ? tilePage : SECTION_SIZE
  const paged = usePaged(rows, { prefix: 'w', defaultSize: pageSize, sizes: [pageSize] })
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase()
  const active = [type, domain, category].filter(Boolean).length
  const filtered = Boolean(q || active)
  const write = (changes: Record<string, string | null>) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        for (const [k, v] of Object.entries(changes)) {
          if (v) n.set(k, v)
          else n.delete(k)
        }
        n.delete('wpage')
        n.delete('wsize')
        return n
      },
      { replace: true, preventScrollReset: true },
    )
  const clear = () => {
    setQ('')
    write({ q: null, type: null, domain: null, wkind: null })
  }
  const to = (w: WorkerLearning) => withPeriod(`/learning/workers/${w.workerId}`, period)

  return (
    <div className="flex flex-col gap-6">
      <LearningBanner period={period} periodLabel={periodLabel} onPeriod={setPeriod} />

      <StageExplorer period={period} onAll={() => setPeriod('all')} />

      <Panel
        id="new"
        title="Workers"
        icon={Users}
        hue="blue"
        count={rows.length}
        flush
        aside={
          <>
            <InputGroup className="h-8 w-full sm:w-56">
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
              <InputGroupInput value={q} onChange={(e) => { setQ(e.target.value); write({ q: e.target.value || null }) }} placeholder="Search Workers or learning" aria-label="Search Workers or learning" />
            </InputGroup>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                  {active > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 tabular-nums">{active}</Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="flex w-72 flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="l-type">Worker type</Label>
                  <Select value={type ?? ANY} onValueChange={(v) => write({ type: v === ANY ? null : v })}>
                    <SelectTrigger id="l-type" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>All types</SelectItem>{types.map((t) => <SelectItem key={t} value={t}>{workerTypeMeta(t).short}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="l-domain">Business domain</Label>
                  <Select value={domain ?? ANY} onValueChange={(v) => write({ domain: v === ANY ? null : v })}>
                    <SelectTrigger id="l-domain" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ANY}>All domains</SelectItem>
                      {domains.map((d) => <SelectItem key={d} value={d}>{domainLabel(d)}</SelectItem>)}
                      {noDomain && <SelectItem value="none">No domain</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="l-kind">Type of learning</Label>
                  <Select value={category ?? ANY} onValueChange={(v) => write({ wkind: v === ANY ? null : v })}>
                    <SelectTrigger id="l-kind" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>All learning types</SelectItem>{kinds.map((c) => <SelectItem key={c.key} value={c.key}>{c.label} ({formatCount(c.count)})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {active > 0 && <Button variant="ghost" className="self-start" onClick={() => write({ type: null, domain: null, wkind: null })}>Clear filters</Button>}
              </PopoverContent>
            </Popover>
            <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={view} onValueChange={(v) => v && write({ view: v === 'list' ? 'list' : null })} aria-label="View">
              <ToggleGroupItem value="tiles" aria-label="Tile view"><LayoutGrid aria-hidden="true" /></ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view"><List aria-hidden="true" /></ToggleGroupItem>
            </ToggleGroup>
          </>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            className="m-5"
            icon={SearchX}
            title={filtered ? 'No Worker matches these filters' : `No Worker learned anything in the ${periodLabel}`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {period !== 'all' && <Button variant="outline" onClick={() => setPeriod('all')}>Show all learning</Button>}
                {filtered && <Button variant="ghost" onClick={clear}>Clear filters</Button>}
              </div>
            }
          />
        ) : (
          <>
            {view === 'tiles' ? (
              <ul aria-label="Workers with new learning" className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paged.rows.map((w) => <li key={w.workerId}><WorkerTile w={w} to={to(w)} /></li>)}
              </ul>
            ) : (
              <ul aria-label="Workers with new learning" className="divide-y">
                {paged.rows.map((w) => <li key={w.workerId}><WorkerRow w={w} to={to(w)} /></li>)}
              </ul>
            )}
            {rows.length > pageSize && (
              <div className="border-t px-5 py-3">
                <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} label="Workers with new learning" />
              </div>
            )}
          </>
        )}
      </Panel>

      <ItemSheet />
    </div>
  )
}
