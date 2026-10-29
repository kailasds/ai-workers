import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Brain, Fingerprint, Hourglass, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { CONTEXTS, IDENTITIES } from '@/features/compose/compose-model'
import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/format'
import { kindWords, type HeldItem, type WorkerRef } from './learning-model'
import { LearningLayout, WorkerName } from './learning-layout'
import { useLearning } from './use-learning'

type Selected =
  | { type: 'identity'; key: string }
  | { type: 'context'; key: string }
  | { type: 'worker'; ref: WorkerRef }
  | { type: 'held'; item: HeldItem }

function Node({ icon: Icon, label, sub, onClick, tone = 'default' }: { icon: typeof Brain; label: string; sub?: string; onClick: () => void; tone?: 'default' | 'muted' }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-start gap-2.5 rounded-block border bg-card px-3 py-2.5 text-left outline-none hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:ring-3 focus-visible:ring-ring/50', tone === 'muted' && 'bg-muted/40')}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-meta font-medium break-words">{label}</span>
        {sub && <span className="block text-meta text-muted-foreground">{sub}</span>}
      </span>
    </button>
  )
}

const COLUMNS = ['Identity', 'Capability', 'Workers with learning', 'What they learned']

/**
 * An optional, structured map of how learning connects: identity → capability → Worker → what
 * it learned. Only links present in the data are drawn; Workers with nothing recorded are
 * counted, not drawn.
 */
export function LearningMapPage() {
  const l = useLearning()
  const [sel, setSel] = useState<Selected | null>(null)
  const heldFor = (id: string) => l.held.filter((h) => h.worker?.id === id)
  const learned = (id: string) => (l.workers.find((w) => w.composition_id === id)?.learning.memories ?? 0) > 0 || heldFor(id).length > 0

  const sheet = (() => {
    if (!sel) return null
    if (sel.type === 'identity') {
      const i = IDENTITIES.find((x) => x.key === sel.key)!
      return { title: i.label, body: <FactList><Fact label="What it covers">{i.summary}</Fact><Fact label="Capabilities">{formatCount(CONTEXTS.filter((c) => c.identity === i.key).length)}</Fact></FactList> }
    }
    if (sel.type === 'context') {
      const c = CONTEXTS.find((x) => x.key === sel.key)!
      const n = l.workers.filter((w) => w.bounded_context.key === c.key).length
      return { title: c.scope, body: <><FactList><Fact label="Bounded context">{c.label}</Fact><Fact label="Produces">{c.outcome}</Fact><Fact label="Workers">{formatCount(n)}</Fact></FactList><Button asChild variant="outline" size="sm" className="mt-5"><Link to={`/workers?context=${c.key}`}>See these Workers</Link></Button></> }
    }
    if (sel.type === 'worker') {
      const w = l.workers.find((x) => x.composition_id === sel.ref.id)!
      return {
        title: <WorkerName worker={sel.ref} link={false} />,
        body: (
          <>
            <FactList>
              <Fact label="Memory records">{formatCount(w.learning.memories)} from {formatCount(w.learning.runs)} runs</Fact>
              <Fact label="Last recorded"><Timestamp iso={w.learning.last_at} /></Fact>
              <Fact label="Held items">{formatCount(heldFor(w.composition_id).length)}</Fact>
            </FactList>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><Link to={`/learning?worker=${w.composition_id}`}>Activity</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to={`/workers/${w.composition_id}`}>Open Worker</Link></Button>
            </div>
          </>
        ),
      }
    }
    const h = sel.item
    return { title: `${kindWords(h.kind)} in ${h.skillTitle}`, body: <FactList><Fact label="State">Held · {h.reason.replace(/\.$/, '')}</Fact><Fact label="Rule">{h.rule ?? 'Not reported'}</Fact><Fact label="Item"><span className="font-mono">{h.key}</span></Fact><Fact label="Worker"><WorkerName worker={h.worker} /></Fact></FactList> }
  })()

  return (
    <LearningLayout view="map" source={l.ready ? l.source : undefined} onRetry={l.refresh} utilities={<Button asChild variant="ghost"><Link to="/learning"><ArrowLeft aria-hidden="true" />Back to activity</Link></Button>}>
      {l.error ? (
        <ErrorState title="The map couldn’t be loaded." message={l.error.message} onRetry={l.refresh} />
      ) : !l.ready ? (
        <LoadingRegion label="Loading the map…"><Skeleton className="h-96 bg-track" /></LoadingRegion>
      ) : (
        <Card className="gap-0 overflow-x-auto py-0">
          <div className="min-w-[56rem]">
            <div className="grid grid-cols-4 gap-4 border-b bg-muted/40 px-5 py-2.5 text-meta font-medium text-muted-foreground">
              {COLUMNS.map((c) => <span key={c}>{c}</span>)}
            </div>
            <div className="divide-y">
              {IDENTITIES.filter((i) => CONTEXTS.some((c) => c.identity === i.key)).map((i) => (
                <div key={i.key} className="grid grid-cols-4 items-start gap-4 px-5 py-4">
                  <div><Node icon={Fingerprint} label={i.label} onClick={() => setSel({ type: 'identity', key: i.key })} /></div>
                  <div className="col-span-3 flex flex-col gap-4">
                    {CONTEXTS.filter((c) => c.identity === i.key).map((c) => {
                      const here = l.workers.filter((w) => w.bounded_context.key === c.key)
                      const withLearning = here.filter((w) => learned(w.composition_id))
                      return (
                        <div key={c.key} className="grid grid-cols-3 items-start gap-4">
                          <div><Node icon={Workflow} label={c.scope} sub={`${formatCount(here.length)} Workers`} onClick={() => setSel({ type: 'context', key: c.key })} /></div>
                          <div className="col-span-2 flex flex-col gap-2">
                            {withLearning.length === 0 && <p className="py-2.5 text-meta text-muted-foreground">No learning recorded here.</p>}
                            {withLearning.map((w) => {
                              const ref = l.refs.get(w.composition_id)!
                              const held = heldFor(w.composition_id)
                              return (
                                <div key={w.composition_id} className="grid grid-cols-2 items-start gap-4">
                                  <Node icon={Brain} label={`${ref.name}${ref.short ? ` · ${ref.short}` : ''}`} onClick={() => setSel({ type: 'worker', ref })} />
                                  <div className="flex flex-col gap-2">
                                    {w.learning.memories > 0 && <Node icon={Brain} tone="muted" label={`${formatCount(w.learning.memories)} memory records`} sub="Recorded · review not reported" onClick={() => setSel({ type: 'worker', ref })} />}
                                    {held.map((h) => <Node key={h.key} icon={Hourglass} tone="muted" label={`${kindWords(h.kind)} · ${h.skillTitle}`} sub={`Held · ${h.reason.replace(/\.$/, '')}`} onClick={() => setSel({ type: 'held', item: h })} />)}
                                  </div>
                                </div>
                              )
                            })}
                            {withLearning.length > 0 && here.length > withLearning.length && <p className="text-meta text-muted-foreground">{formatCount(here.length - withLearning.length)} more Workers here have nothing recorded.</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      <p className="text-meta text-muted-foreground">Only connections present in the data are shown. Sharing between Workers would appear here once it’s switched on.</p>
      <DetailSheet open={Boolean(sel)} onClose={() => setSel(null)} title={sheet?.title ?? ''}>{sheet?.body}</DetailSheet>
    </LearningLayout>
  )
}
