import { Link, useParams } from 'react-router'
import { ArrowRight, BookOpenText, Brain, ChartNoAxesColumn, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { IconTile } from '@/components/platform/icon-tile'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useResource } from '@/hooks/use-resource'
import { getSentinelOverview } from '@/lib/api/catalog'
import { getWorkerWorkspace } from '@/lib/api/workers'
import type { WorkerWorkspace } from '@/lib/types/worker'

const SUBPAGES: Record<string, { title: string; about: string }> = {
  okf: { title: 'Knowledge it runs with (OKF)', about: 'The exact knowledge bundle the Worker’s Runtime serves, a person’s proposed edits, and each item’s history.' },
  effect: { title: 'Learning effect', about: 'Comparable runs only, before and after a learned item was served. Needs 3 qualifying runs on each side.' },
  skills: { title: 'Skills', about: 'The Skills in the bundle, each SKILL.md in full, and the changes the Worker proposed.' },
  facts: { title: 'Facts', about: 'Landscape and experience facts, verbatim, with their confidence as supplied.' },
  sharing: { title: 'Sharing', about: 'Who may read or compound on this Worker’s learning. Sharing is declared, not active.' },
  records: { title: 'All records', about: 'Everything the platform holds for this Worker, one class at a time, with redaction receipts.' },
  sync: { title: 'Data transfer', about: 'Whether this Worker’s learning reaches the platform, and what the filter kept back.' },
  routing: { title: 'Model routing', about: 'The Worker’s live routing: tiers, evidence per tier, and recommendations.' },
  sentinel: { title: 'Sentinel decision log', about: 'This Worker’s Sentinel decisions. Shadow decisions read “Would …”, and a missing reason stays missing.' },
  brain: { title: 'GBrain records', about: 'One record type’s items, each with the evidence it rests on.' },
}

const RECORD_TYPES = ['Memories: experience facts', 'Routing experience', 'Run memories', 'Agreed across runs', 'Skill proposals', 'Lessons from runs not met', 'Run summaries', 'Housekeeping', 'Retention']

function Provenance({ ws }: { ws: WorkerWorkspace }) {
  const serving = ws.worker.runtime.serving > 0
  return serving ? (
    <StatusBadge tone="warning">Live read failed · platform copy shown</StatusBadge>
  ) : (
    <StatusBadge tone="neutral" icon={null}>
      Platform copy{ws.worker.learning.last_at ? <> · synced <Timestamp iso={ws.worker.learning.last_at} /></> : ''}
    </StatusBadge>
  )
}

export function WorkerLearningPage() {
  const { id = '' } = useParams()
  const ws = useResource(`learning-ws:${id}`, (signal) => getWorkerWorkspace(id, { signal }))
  const sentinel = useResource('sentinel-overview', (signal) => getSentinelOverview({ signal }))
  const data = ws.data && !('redirect' in ws.data) ? ws.data : null

  if (!data) {
    return (
      <PageContainer>
        {ws.error ? <ErrorState title="This Worker could not be read." message={ws.error.message} onRetry={ws.refresh} /> : <LoadingRegion label="Reading this Worker’s learning…" className="flex flex-col gap-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-64" /></LoadingRegion>}
      </PageContainer>
    )
  }

  const w = data.worker
  const m = data.composition?.maturity
  const brain = data.brain
  const mode = sentinel.data?.mode
  const recordState = brain?.state === 'not_packaged' ? 'Not produced: no memory engine is packaged' : w.runtime.serving > 0 ? 'Not read: the Runtime refused the console’s request' : 'Not observed: no serving runtime'

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Learning', to: '/learning' }, { label: w.name }]}
        title={w.name}
        description={`${data.composition?.contents.harness ?? 'Generic runtime'} · ${w.runtime.serving > 0 ? 'Running' : w.runtime.stopped > 0 ? 'Stopped' : 'No runtime'}`}
        meta={<Provenance ws={data} />}
        actions={<Button asChild variant="outline"><Link to={`/workers/${w.composition_id}`}>Open Worker</Link></Button>}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-start gap-3 border-b py-5">
              <IconTile icon={BookOpenText} size="sm" />
              <div>
                <CardTitle>Knowledge this Worker runs with</CardTitle>
                <CardDescription>Is learned knowledge served, and on what evidence?</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-5">
              <p className="text-body">
                <span className="font-medium">Not served.</span> No knowledge bundle was reported for this Worker{mode && !mode.acting ? ', and the Sentinel applies none of its decisions yet' : ''}.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {['Procedural (Skills and techniques)', 'Facts', 'Routing', 'Experience', 'Applicability', 'Sharing'].map((s) => (
                  <li key={s} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                    <span className="text-body">{s}</span>
                    <span className="text-meta text-muted-foreground">Not evaluated</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="self-start"><Link to={`/learning/workers/${w.composition_id}/okf`}>Browse OKF<ArrowRight aria-hidden="true" /></Link></Button>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-start gap-3 border-b py-5">
              <IconTile icon={Brain} size="sm" />
              <div>
                <CardTitle>What GBrain produced</CardTitle>
                <CardDescription>{brain ? brain.detail : 'The memory engine’s records, each with its actual producer.'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="py-5">
              <p className="mb-3 text-body">
                Platform record: {m && m.memories > 0 ? <span className="font-medium tabular-nums">{m.memories} memory {m.memories === 1 ? 'record' : 'records'} from {m.runs} runs</span> : <span className="text-muted-foreground">nothing recorded yet</span>}
              </p>
              <ul className="divide-y rounded-xl border">
                {RECORD_TYPES.map((t) => (
                  <li key={t} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-body">{t}</span>
                    <span className="text-right text-meta text-muted-foreground">{recordState}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-start gap-3 border-b py-5">
              <IconTile icon={ChartNoAxesColumn} size="sm" />
              <div>
                <CardTitle>Learning effect</CardTitle>
                <CardDescription>What learning changed, over comparable runs only.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="py-5">
              <p className="text-body"><span className="font-medium">Not comparable yet.</span> {m?.runs ?? 0} runs recorded and no learned item served, so there is no “before” and “after”. A comparison needs 3 qualifying runs on each side.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="gap-0 py-0 xl:sticky xl:top-6">
          <CardHeader className="flex flex-row items-start gap-3 border-b py-5">
            <IconTile icon={ShieldCheck} size="sm" />
            <div>
              <CardTitle>Sentinel</CardTitle>
              <CardDescription>Two separate facts: what it decides, and whether that applies.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="py-5">
            <FactList>
              <Fact label="Decides" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{w.sentinel.worker_runtime === 'WORKER_RUNTIME' ? 'Not reported' : 'Signals only: no Worker Runtime running'}</Fact>
              <Fact label="Applies" className="sm:grid-cols-[6rem_minmax(0,1fr)]">No{mode?.why ? <span className="block text-meta text-muted-foreground">{mode.why}</span> : null}</Fact>
              <Fact label="Decisions" className="sm:grid-cols-[6rem_minmax(0,1fr)]">No decisions recorded</Fact>
              <Fact label="Chain" className="sm:grid-cols-[6rem_minmax(0,1fr)]">Decision chain not checked</Fact>
            </FactList>
            <ul className="mt-5 flex flex-col gap-1 border-t pt-4">
              {Object.entries(SUBPAGES).filter(([k]) => k !== 'okf' && k !== 'brain').map(([k, v]) => (
                <li key={k}>
                  <Link to={`/learning/workers/${w.composition_id}/${k}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-body outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring">
                    {v.title}
                    <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

/** Sub-pages under one Worker's learning. Each says what it holds and why this capture has none of it. */
export function WorkerLearningSubpage() {
  const { id = '', sub = '' } = useParams()
  const page = SUBPAGES[sub] ?? { title: 'Not a learning page', about: 'There is no such page for this Worker.' }
  const ws = useResource(`learning-ws:${id}`, (signal) => getWorkerWorkspace(id, { signal }))
  const name = ws.data && !('redirect' in ws.data) ? ws.data.worker.name : 'Worker'
  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Learning', to: '/learning' }, { label: name, to: `/learning/workers/${id}` }, { label: page.title }]} title={page.title} description={page.about} />
      <Card className="gap-3 p-6">
        <p className="text-item">Not reported by this Worker’s Runtime</p>
        <p className="text-body text-muted-foreground">These reads come from the Worker’s own Runtime or the platform’s synced copy. The offline capture this console runs on holds neither for this Worker, so nothing is shown rather than an empty list that would read as “none”.</p>
        <Button asChild variant="outline" size="sm" className="self-start"><Link to={`/learning/workers/${id}`}>Back to {name}</Link></Button>
      </Card>
    </PageContainer>
  )
}
