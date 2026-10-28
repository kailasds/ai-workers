import { Link, useParams } from 'react-router'
import { ArrowRight, BookOpenText, Brain, ChartNoAxesColumn, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  okf: { title: 'Knowledge it runs with (OKF)', about: 'The knowledge this Worker uses, proposed edits, and history.' },
  effect: { title: 'Learning effect', about: 'Compares similar runs before and after something was learned. Needs 3 runs on each side.' },
  skills: { title: 'Skills', about: 'Skills in use, their full content, and changes the Worker suggested.' },
  facts: { title: 'Facts', about: 'Facts the Worker has recorded, with confidence scores.' },
  sharing: { title: 'Sharing', about: 'Who can use this Worker’s learning. Sharing isn’t switched on yet.' },
  records: { title: 'All records', about: 'All records for this Worker, by type, with redaction details.' },
  sync: { title: 'Data transfer', about: 'Whether learning is synced to the platform, and what was filtered out.' },
  routing: { title: 'Model routing', about: 'Current model routing, results per tier, and suggestions.' },
  sentinel: { title: 'Sentinel decision log', about: 'Sentinel decisions for this Worker. Shadow-mode decisions start with “Would…”.' },
  brain: { title: 'GBrain records', about: 'Records of this type, with supporting evidence.' },
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
  const recordState = brain?.state === 'not_packaged' ? 'Not produced: no memory engine is packaged' : w.runtime.serving > 0 ? 'Not available: the runtime declined the request' : 'Not running'

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Learning', to: '/learning' }, { label: w.name }]}
        title={w.name}
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
            </div>
          </CardHeader>
          <CardContent className="py-5">
            <FactList>
              <Fact label="Decides" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{w.sentinel.worker_runtime === 'WORKER_RUNTIME' ? 'Not reported' : 'Not running'}</Fact>
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
      <PageHeader crumbs={[{ label: 'Learning', to: '/learning' }, { label: name, to: `/learning/workers/${id}` }, { label: page.title }]} title={page.title} />
      <Card className="gap-3 p-6">
        <p className="text-item">Not reported by this Worker’s Runtime</p>
        <p className="text-body text-muted-foreground">This data comes from the Worker’s runtime, which isn’t available in this demo.</p>
        <Button asChild variant="outline" size="sm" className="self-start"><Link to={`/learning/workers/${id}`}>Back to {name}</Link></Button>
      </Card>
    </PageContainer>
  )
}
