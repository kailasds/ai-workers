import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Brain, ChevronDown, ChevronRight, CircleAlert, Hourglass, Network, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { Pager } from '@/components/platform/pager'
import { SectionNav } from '@/components/platform/section-nav'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { contextOf, domainOf, identityOfContext } from '@/features/compose/compose-model'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { useResource } from '@/hooks/use-resource'
import { getSentinelOverview, getSkillLibrary } from '@/lib/api/catalog'
import { getWorkerWorkspace } from '@/lib/api/workers'
import { formatCount, formatDuration } from '@/lib/format'
import type { WorkerRun, WorkerWorkspace } from '@/lib/types/worker'
import { kindWords, STATUSES } from './learning-model'
import { StateBadge, StatusGuide } from './learning-layout'

// Runtime reports the console would read from the Worker's own Runtime. Kept reachable; none
// is in the offline snapshot.
const SUBPAGES: Record<string, { title: string; about: string }> = {
  okf: { title: 'Knowledge it runs with (OKF)', about: 'The knowledge this Worker uses, proposed edits, and history.' },
  effect: { title: 'Learning effect', about: 'Compares similar runs before and after something was learned. Needs 3 runs on each side.' },
  skills: { title: 'Skills', about: 'Skills in use, their full content, and changes the Worker suggested.' },
  facts: { title: 'Facts', about: 'Facts the Worker has recorded.' },
  sharing: { title: 'Sharing', about: 'Who can use this Worker’s learning. Sharing isn’t switched on yet.' },
  records: { title: 'All records', about: 'All records for this Worker, by type, with redaction details.' },
  sync: { title: 'Data transfer', about: 'Whether learning is synced to the platform, and what was filtered out.' },
  routing: { title: 'Model selections', about: 'Current model routing, results per tier, and suggestions.' },
  sentinel: { title: 'Worker Sentinel decision log', about: 'This Worker’s Sentinel decisions. Shadow-mode decisions start with “Would…”.' },
  brain: { title: 'Memory records', about: 'Records of this type, with supporting evidence.' },
}

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'knowledge', label: 'What it learned' },
  { value: 'context', label: 'What it was given' },
  { value: 'governance', label: 'Governance' },
]

const LINK = 'rounded-sm text-primary-strong underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring'
const words = (k: string) => k.replace(/_/g, ' ')

type Item =
  | { kind: 'run'; id: string; at: string; run: WorkerRun }
  | { kind: 'memory'; id: string; at: string | null; count: number; runs: number }
  | { kind: 'held'; id: string; at: string | null; skill: string; items: { kind: string; key: string; reason: string }[]; rule: string }

/** A compact label → value row list. */
function Rows({ rows }: { rows: { label: string; value: React.ReactNode; note?: React.ReactNode }[] }) {
  return (
    <Card className="gap-0 py-0">
      <dl className="divide-y">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-meta text-muted-foreground">{r.label}</dt>
            <dd className="text-body">{r.value}{r.note && <span className="mt-0.5 block text-meta text-muted-foreground">{r.note}</span>}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function ItemDetail({ item, ws, onClose }: { item: Item | null; ws: WorkerWorkspace; onClose: () => void }) {
  const title = !item ? '' : item.kind === 'run' ? 'Run' : item.kind === 'memory' ? 'Memory recorded' : `${item.items.length} ${item.items.length === 1 ? 'pattern' : 'patterns'} in ${item.skill}`
  return (
    <DetailSheet open={Boolean(item)} onClose={onClose} title={title} width="lg">
      {item?.kind === 'run' && (
        <div className="flex flex-col gap-5">
          <FactList>
            <Fact label="Outcome"><VerdictBadge verdict={item.run.verdict} /></Fact>
            <Fact label="Finished"><Timestamp iso={item.run.completed_at} /></Fact>
            <Fact label="Duration">{formatDuration(item.run.duration_seconds)}</Fact>
            <Fact label="Tokens">{item.run.total_tokens.state === 'OBSERVED' ? formatCount(item.run.total_tokens.value ?? 0) : 'Not measured'}</Fact>
            <Fact label="Converted">{item.run.source_technology} → {item.run.target_technology}</Fact>
            <Fact label="Run ID"><span className="font-mono text-meta break-all">{item.run.run_ref}</span></Fact>
          </FactList>
          <Button asChild variant="outline" size="sm" className="w-fit"><Link to={`/workers/${ws.worker.composition_id}?view=runs`}>All runs for this Worker</Link></Button>
        </div>
      )}
      {item?.kind === 'memory' && (
        <div className="flex flex-col gap-5">
          <div className="rounded-block bg-muted p-3"><StateBadge status="recorded" /><p className="mt-2 text-meta text-muted-foreground">{STATUSES.recorded.meaning}</p></div>
          <FactList>
            <Fact label="Records">{formatCount(item.count)} from {formatCount(item.runs)} runs</Fact>
            <Fact label="Last recorded"><Timestamp iso={item.at} /></Fact>
            <Fact label="Which runs">Not listed per record. The Worker’s runs are on its Runs tab.</Fact>
          </FactList>
          <Button asChild variant="outline" size="sm" className="w-fit"><Link to={`/workers/${ws.worker.composition_id}?view=runs`}>Worker’s runs</Link></Button>
        </div>
      )}
      {item?.kind === 'held' && (
        <div className="flex flex-col gap-5">
          <div className="rounded-block bg-muted p-3"><StateBadge status="gathering" /><p className="mt-2 text-meta text-muted-foreground">{STATUSES.gathering.meaning} {item.rule}.</p></div>
          <ul className="divide-y rounded-block border">
            {item.items.map((x) => (
              <li key={x.key} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5">
                <span className="text-body">{kindWords(x.kind)}</span>
                <span className="font-mono text-meta text-muted-foreground">{x.key}</span>
                <span className="w-full text-meta text-muted-foreground">{x.reason}</span>
              </li>
            ))}
          </ul>
          <p className="text-meta text-muted-foreground">Nothing to do yet. It’s kept or dropped automatically once enough runs agree.</p>
        </div>
      )}
    </DetailSheet>
  )
}

function Timeline({ items, onOpen }: { items: Item[]; onOpen: (i: Item) => void }) {
  const paged = usePaged(items, { prefix: 't', defaultSize: 10 })
  if (items.length === 0) return <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No runs or learning recorded for this Worker yet.</p>
  return (
    <>
      <Card className="gap-0 py-0">
        <ul className="divide-y">
          {paged.rows.map((i) => {
            const Icon = i.kind === 'run' ? Play : i.kind === 'memory' ? Brain : Hourglass
            return (
              <li key={i.id}>
                <button type="button" onClick={() => onOpen(i)} className="flex w-full items-center gap-4 px-5 py-3 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-body">
                    {i.kind === 'run' ? `Run · ${i.run.source_technology} → ${i.run.target_technology}` : i.kind === 'memory' ? `${formatCount(i.count)} memory ${i.count === 1 ? 'record' : 'records'} kept` : `${i.items.length} ${i.items.length === 1 ? 'pattern' : 'patterns'} noticed in ${i.skill}`}
                  </span>
                  {i.kind === 'run' ? <VerdictBadge verdict={i.run.verdict} /> : <StateBadge status={i.kind === 'memory' ? 'recorded' : 'gathering'} />}
                  <span className="hidden w-36 shrink-0 text-right text-meta text-muted-foreground sm:block">{i.at ? <>{i.kind === 'held' && 'As of '}<Timestamp iso={i.at} /></> : 'Time not reported'}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </Card>
      <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} order="time" label="Timeline" />
    </>
  )
}

/**
 * One Worker's learning: what awaits a person and a timeline first; then what it learned, what
 * it was given, and how it is governed. Everything comes from the Worker workspace read (runs,
 * composition, brain) and the Platform Sentinel overview; anything unreported says so.
 */
export function WorkerLearningPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((t) => t.value === params.get('tab'))?.value ?? 'overview'
  const ws = useResource(`learning-ws:${id}`, (signal) => getWorkerWorkspace(id, { signal }))
  const sentinel = useResource('sentinel-overview:null', (signal) => getSentinelOverview({ signal }))
  const skills = useResource('k-skills', (signal) => getSkillLibrary({ signal }))
  const [open, setOpen] = useState<Item | null>(null)
  const data = ws.data && !('redirect' in ws.data) ? ws.data : null

  const items: Item[] = useMemo(() => {
    if (!data) return []
    const w = data.worker
    const c = data.brain?.compounding
    const list: Item[] = data.runs.map((r) => ({ kind: 'run' as const, id: `run:${r.run_ref}`, at: r.completed_at, run: r }))
    if (w.learning.memories > 0) list.push({ kind: 'memory', id: 'memory', at: w.learning.last_at, count: w.learning.memories, runs: w.learning.runs })
    if (c) {
      const bySkill = new Map<string, { kind: string; key: string; reason: string }[]>()
      for (const h of c.held_back) bySkill.set(h.skill, [...(bySkill.get(h.skill) ?? []), { kind: h.kind, key: h.key, reason: h.reason.replace(/\.$/, '') }])
      const rule = `Kept once ${c.minimum_observations} runs agree${c.requires_dod_met ? ', each meeting the Definition of Done' : ''}`
      // A Skill reads by its library title when there is one.
      const title = (key: string) => skills.data?.skills.find((s) => s.name === key)?.title ?? key
      for (const [skill, its] of bySkill) list.push({ kind: 'held', id: `held:${skill}`, at: data.brain!.observed_at, skill: title(skill), items: its, rule })
    }
    return list.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''))
  }, [data, skills.data])

  if (!data) {
    return (
      <PageContainer>
        {ws.error ? <ErrorState title="This Worker’s learning couldn’t be loaded." message={ws.error.message} onRetry={ws.refresh} /> : <LoadingRegion label="Loading this Worker’s learning…" className="flex flex-col gap-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-64" /></LoadingRegion>}
      </PageContainer>
    )
  }

  const w = data.worker
  const m = data.composition?.maturity
  const c = data.brain?.compounding
  const contents = data.composition?.contents
  const ctx = contextOf(w.bounded_context.key)
  const identity = identityOfContext(w.bounded_context.key)
  const mode = sentinel.data?.mode
  const held = c?.held_back.length ?? 0
  const setTab = (v: string) => setParams((p) => { const n = new URLSearchParams(p); if (v === 'overview') n.delete('tab'); else n.set('tab', v); n.delete('tpage'); return n }, { replace: true })

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Learning', to: '/learning' }, { label: 'Workers', to: '/learning/workers' }, { label: w.name }]}
        title={w.name}
        meta={
          <span className="text-meta text-muted-foreground">
            {identity?.label ?? 'Identity not reported'} · {ctx?.scope ?? w.bounded_context.label} · r{w.revision} · <span className="font-mono">{w.composition_id.slice(0, 8)}</span> · last learning <Timestamp iso={w.learning.last_at} />
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost"><Link to="/learning/map"><Network aria-hidden="true" />Explore relationships</Link></Button>
            <Button asChild variant="outline"><Link to={`/workers/${w.composition_id}`}>Open Worker</Link></Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionNav items={TABS} value={tab} onChange={setTab} label="Learning for this Worker" variant="pills" />
        <StatusGuide />
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          {m && m.skill_changes > 0 && (
            <Card className="flex-row items-start gap-3 border-warning/40 p-4">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-item">{m.skill_changes} Skill {m.skill_changes === 1 ? 'change' : 'changes'} awaiting review</p>
                <p className="text-meta text-muted-foreground">Proposed by this Worker from its runs. A person decides whether the shared Skill changes; nothing changes until then. The proposals themselves aren’t in this snapshot.</p>
              </div>
            </Card>
          )}
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Runs that met the Definition of Done', value: m ? `${formatCount(m.runs_met)} of ${formatCount(m.runs)}` : 'Not reported' },
              { label: 'Memory records', value: formatCount(w.learning.memories) },
              { label: 'Collecting evidence', value: data.brain ? formatCount(held) : 'Not read' },
              { label: 'Awaiting review', value: m ? formatCount(m.skill_changes) : 'Not reported' },
            ].map((x) => (
              <div key={x.label} className="rounded-block border bg-card px-4 py-3">
                <dt className="text-meta text-muted-foreground">{x.label}</dt>
                <dd className="mt-0.5 text-item tabular-nums">{x.value}</dd>
              </div>
            ))}
          </dl>
          <section aria-labelledby="timeline-title" className="flex flex-col gap-3">
            <h2 id="timeline-title" className="text-section">Timeline</h2>
            <Timeline items={items} onOpen={setOpen} />
          </section>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="flex flex-col gap-3">
          <p className="text-meta text-muted-foreground">Learned from its own runs. It belongs to this Worker; it isn’t shared.</p>
          <Rows
            rows={[
              { label: 'Memory records', value: `${formatCount(w.learning.memories)} from ${formatCount(w.learning.runs)} runs`, note: m ? `${formatCount(m.memory_kinds.episodic)} about specific runs · ${formatCount(m.memory_kinds.semantic)} general facts · ${formatCount(m.memory_kinds.procedural)} techniques. ${STATUSES.recorded.meaning}` : STATUSES.recorded.meaning },
              { label: 'Agreed across runs', value: m ? formatCount(m.claims) : 'Not reported', note: 'Statements several runs agreed on.' },
              { label: 'Skill changes proposed', value: m ? (m.skill_changes ? <StateBadge status="proposed" /> : 'None') : 'Not reported', note: m?.skill_changes ? `${m.skill_changes} proposals. ${STATUSES.proposed.meaning}` : undefined },
              { label: 'Collecting evidence', value: data.brain ? formatCount(held) : 'Not read for this Worker', note: c ? `Kept once ${c.minimum_observations} runs agree${c.requires_dod_met ? ', each meeting the Definition of Done' : ''}.` : undefined },
              { label: 'Approved', value: 'Not reported', note: 'This snapshot doesn’t say what the Worker’s Sentinel approved. That isn’t the same as nothing approved.' },
              { label: 'Retired, revoked or replaced', value: 'Not exposed', note: 'The data source has no such status for this Worker’s knowledge, and this console can’t retire, revoke or replace an item.' },
            ]}
          />
        </div>
      )}

      {tab === 'context' && (
        <div className="flex flex-col gap-3">
          <p className="text-meta text-muted-foreground">Given to this Worker when it was composed, at revision {w.revision}.</p>
          {!contents ? (
            <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">This Worker’s composition couldn’t be read, so what it was given isn’t shown.</p>
          ) : (
            <Rows
              rows={[
                { label: 'Bounded context', value: contents.context_label, note: ctx?.outcome },
                { label: 'Business domain', value: contents.business_domain_key ? domainOf(contents.business_domain_key)?.label ?? words(contents.business_domain_key) : 'None', note: contents.business_domain_key ? undefined : 'Optional. None was chosen when it was composed.' },
                { label: 'Skills', value: formatCount(contents.skills) },
                { label: 'Domain languages', value: formatCount(contents.languages) },
                { label: 'EVALs', value: formatCount(contents.evaluations) },
                { label: 'Definition of Done criteria', value: formatCount(contents.dod_criteria) },
                { label: 'Harness', value: contents.harness ?? 'Generic runtime' },
              ]}
            />
          )}
          {data.composition && data.composition.issues.length > 0 && (
            <Card className="gap-1 border-warning/40 p-4">
              <p className="text-item">Reported issues</p>
              <ul className="list-disc pl-5 text-meta text-muted-foreground">{data.composition.issues.map((i) => <li key={i.code}>{i.message}</li>)}</ul>
            </Card>
          )}
          <Link to={`/workers/${w.composition_id}?view=knowledge`} className={`w-fit text-meta ${LINK}`}>See each item on the Worker’s Knowledge tab</Link>
        </div>
      )}

      {tab === 'governance' && (
        <div className="flex flex-col gap-3">
          <Rows
            rows={[
              {
                label: 'Worker Sentinel',
                value: w.sentinel.state === 'CONFIGURED' ? 'Composed with one' : 'Not composed',
                note: w.sentinel.state === 'CONFIGURED' ? 'Decides what this Worker keeps from its runs.' : 'Nothing checks what this Worker keeps.',
              },
              {
                label: 'Reporting',
                value: w.runtime.serving === 0 ? 'Not running' : w.sentinel.observed_at ? <>Last report <Timestamp iso={w.sentinel.observed_at} /></> : 'Not reported',
                note: w.runtime.serving > 0 && !w.sentinel.observed_at ? 'Running, but no report has come in, so its decisions can’t be seen here.' : undefined,
              },
              { label: 'Last action', value: w.sentinel.last_action ?? 'None reported' },
              {
                label: 'What it may keep',
                value: c?.compoundable?.length ? c.compoundable.map(words).join(', ') : 'Not reported',
                note: c ? `Only after ${c.minimum_observations} agreeing runs${c.requires_dod_met ? ' that met the Definition of Done' : ''}.` : undefined,
              },
              { label: 'Never kept', value: c?.never_compound?.length ? c.never_compound.map(words).join(', ') : 'Not reported' },
              {
                label: 'Skill changes',
                value: c?.skill_authoring?.may_extend?.length ? `May add ${c.skill_authoring.may_extend.join(', ')}` : 'Not reported',
                note: c?.skill_authoring ? `Never changes ${c.skill_authoring.never_changes?.map(words).join(', ') ?? 'not reported'}. A new Skill needs ${c.skill_authoring.new_skill_requires ?? 'not reported'}. ${c.skill_authoring.writes_registry_copy === false ? 'It doesn’t write the shared Skill.' : ''}` : undefined,
              },
              {
                label: 'Platform Sentinel',
                value: mode ? (mode.acting ? 'Applies its decisions' : 'Records decisions, applies none') : 'Not reported',
                note: mode?.why ?? undefined,
              },
            ]}
          />
          <p className="text-meta"><Link to="/sentinel/decisions" className={LINK}>Platform decisions</Link> · <Link to={`/sentinel/workers`} className={LINK}>Monitoring</Link></p>
        </div>
      )}

      <Collapsible className="rounded-block border">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-5 py-3 text-left text-item outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Runtime reports
          <span className="flex items-center gap-2 text-meta text-muted-foreground">Not in this snapshot<ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" /></span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="grid gap-x-6 border-t px-5 py-3 sm:grid-cols-2">
            {Object.entries(SUBPAGES).map(([k, v]) => (
              <li key={k}><Link to={`/learning/workers/${w.composition_id}/${k}`} className={`block py-1 text-body ${LINK}`}>{v.title}</Link></li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <ItemDetail item={open} ws={data} onClose={() => setOpen(null)} />
    </PageContainer>
  )
}

/** Sub-pages under one Worker's learning. Each says what it holds and why this snapshot has none of it. */
export function WorkerLearningSubpage() {
  const { id = '', sub = '' } = useParams()
  const page = SUBPAGES[sub] ?? { title: 'Not a learning page', about: 'There is no such page for this Worker.' }
  const ws = useResource(`learning-ws:${id}`, (signal) => getWorkerWorkspace(id, { signal }))
  const name = ws.data && !('redirect' in ws.data) ? ws.data.worker.name : 'Worker'
  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Learning', to: '/learning' }, { label: name, to: `/learning/workers/${id}` }, { label: page.title }]} title={page.title} />
      <Card className="gap-3 p-6">
        <p className="text-body text-muted-foreground">{page.about}</p>
        <p className="text-item">Not reported by this Worker’s runtime</p>
        <p className="text-body text-muted-foreground">This comes from the Worker’s own runtime, which isn’t in this snapshot.</p>
        <Button asChild variant="outline" size="sm" className="self-start"><Link to={`/learning/workers/${id}`}>Back to {name}</Link></Button>
      </Card>
    </PageContainer>
  )
}
