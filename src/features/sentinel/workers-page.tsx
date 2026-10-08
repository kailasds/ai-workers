import { useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronRight, OctagonX, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getSentinelLearning } from '@/lib/api/catalog'
import { USE_MOCK } from '@/lib/api/client'
import { getWorkerPortfolio } from '@/lib/api/workers'
import type { SentinelLearningFleet } from '@/lib/types/catalog'
import type { PortfolioWorker } from '@/lib/types/worker'
import { SentinelLayout } from './sentinel-layout'

const FILTERS = [
  { value: 'running', label: 'All running' },
  { value: 'review', label: 'Needs review' },
  { value: 'reporting', label: 'Sentinel reporting' },
  { value: 'no-sentinel', label: 'No Sentinel' },
  { value: 'unavailable', label: 'Status unavailable' },
  { value: 'not-running', label: 'Not running' },
]

type Coverage = 'reporting' | 'no-sentinel' | 'unavailable' | 'not-running'

function coverageOf(w: PortfolioWorker, fleet: SentinelLearningFleet | null): Coverage {
  if (w.runtime.serving === 0) return 'not-running'
  if (w.sentinel.state !== 'CONFIGURED') return 'no-sentinel'
  const live = fleet?.workers.find((x) => x.composition_id === w.composition_id)
  return live && live.status === 'answering' ? 'reporting' : 'unavailable'
}

const COVERAGE_WORDS: Record<Coverage, string> = {
  reporting: 'Sentinel reporting',
  'no-sentinel': 'No governance deployed',
  unavailable: 'Did not report',
  'not-running': 'No Worker Runtime',
}

/** The one destructive governance action: typed name + reason, per ECS runtime, itself a recorded decision. */
function StopDialog({ worker, open, onClose }: { worker: PortfolioWorker; open: boolean; onClose: () => void }) {
  const [typed, setTyped] = useState('')
  const [reason, setReason] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const nameId = useId()
  const reasonId = useId()
  const ready = typed === worker.name && reason.trim().length > 0 && reason.length <= 500 && state === 'idle'
  return (
    <Dialog open={open} onOpenChange={(o) => !o && state !== 'sending' && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-section">Stop Worker</DialogTitle>
          <DialogDescription className="text-body">
            <span className="font-medium text-foreground">{worker.name}</span>. Each serving ECS runtime is stopped by its own request, and each stop is recorded as a Platform Sentinel decision. A run in progress is interrupted.
          </DialogDescription>
        </DialogHeader>
        {state === 'done' ? (
          <Alert>
            <AlertTitle className="text-item">Not stopped</AlertTitle>
            <AlertDescription>{USE_MOCK ? 'This console runs on captured data and sends no requests, so no runtime was stopped and no decision was recorded.' : 'Stopping is wired in a later revision.'}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={nameId}>Type the Worker’s name to confirm</Label>
              <Input id={nameId} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={worker.name} autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={reasonId}>Reason</Label>
              <Textarea id={reasonId} rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} aria-describedby={`${reasonId}-hint`} />
              <p id={`${reasonId}-hint`} className="text-meta text-muted-foreground">Recorded with the decision so other operators can read why. Your permission is checked when you stop.</p>
            </div>
          </>
        )}
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={state === 'sending'}>{state === 'done' ? 'Close' : 'Cancel'}</Button></DialogClose>
          {state !== 'done' && (
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!ready}
              onClick={() => {
                setState('sending')
                setTimeout(() => setState('done'), 900)
              }}
            >
              {state === 'sending' && <Spinner />}Stop Worker
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SentinelWorkersPage() {
  const [params, setParams] = useSearchParams()
  const filter = params.get('filter') ?? 'running'
  const portfolio = useResource('portfolio', (signal) => getWorkerPortfolio({ signal }))
  const fleet = useResource('sentinel-learning', (signal) => getSentinelLearning({ signal }))
  const [open, setOpen] = useState<PortfolioWorker | null>(null)
  const [stopping, setStopping] = useState(false)

  const rows = useMemo(() => {
    const ws = portfolio.data?.workers ?? []
    return ws.filter((w) => {
      const c = coverageOf(w, fleet.data ?? null)
      if (filter === 'running') return c !== 'not-running'
      if (filter === 'review') return false
      return c === filter
    })
  }, [portfolio.data, fleet.data, filter])

  const live = open ? fleet.data?.workers.find((x) => x.composition_id === open.composition_id) : undefined

  return (
    <SentinelLayout
      view="workers"
      utilities={
        <Select value={filter} onValueChange={(v) => setParams(v === 'running' ? {} : { filter: v }, { replace: true })}>
          <SelectTrigger className="w-48" aria-label="Show"><SelectValue /></SelectTrigger>
          <SelectContent align="end">{FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
        </Select>
      }
    >
      {portfolio.error ? (
        <ErrorState title="Workers could not be read." message={portfolio.error.message} onRetry={portfolio.refresh} />
      ) : !portfolio.data ? (
        <LoadingRegion label="Reading oversight coverage…" className="flex flex-col gap-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14" />)}</LoadingRegion>
      ) : rows.length === 0 ? (
        <EmptyState icon={ShieldOff} title={filter === 'review' ? 'No Workers need review' : 'No Workers in this view'} description={filter === 'running' ? 'No Worker is running, so there is nothing to oversee right now.' : 'Choose another view to see more Workers.'} />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {rows.map((w) => {
              const c = coverageOf(w, fleet.data ?? null)
              return (
                <li key={w.composition_id}>
                  <button type="button" onClick={() => setOpen(w)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-item">{w.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-meta text-muted-foreground"><RuntimeStatusDot status={runtimeStatus(w.runtime)} /><span aria-hidden="true">·</span><span className="truncate">{w.bounded_context.label}</span></span>
                    </span>
                    <span className="hidden text-meta text-muted-foreground sm:inline">{COVERAGE_WORDS[c]}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <DetailSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.name}
        description={open ? `${open.composition_id.slice(0, 8)} · r${open.revision} · ${open.bounded_context.label}` : undefined}
        width="lg"
        footer={open && (
          <>
            <Button asChild variant="outline"><Link to={`/workers/${open.composition_id}?view=sentinel`}>View Sentinel settings</Link></Button>
            {open.runtime.serving > 0 && <Button className="ml-auto bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => setStopping(true)}><OctagonX aria-hidden="true" />Stop Worker…</Button>}
          </>
        )}
      >
        {open && (
          <div className="flex flex-col gap-6">
            <FactList>
              <Fact label="Runtime coverage">{COVERAGE_WORDS[coverageOf(open, fleet.data ?? null)]}{live?.detail && <span className="block text-meta text-muted-foreground">{live.detail}</span>}</Fact>
              <Fact label="Configured oversight">{open.sentinel.state === 'CONFIGURED' ? 'Composed with a Worker Sentinel' : 'Composed without one'}</Fact>
              <Fact label="Recorded decisions">No Sentinel decision reported.</Fact>
              <Fact label="Platform policy">No bounds set</Fact>
            </FactList>
            <p className="text-meta text-muted-foreground">Recorded, not applied. These decisions have not changed knowledge served to runs. Contradictions between memories are not checked yet.</p>
            {open.runtime.serving === 0 && <p className="text-body text-muted-foreground">No runtime is serving, so there is nothing to stop.</p>}
          </div>
        )}
      </DetailSheet>
      {open && <StopDialog key={open.composition_id} worker={open} open={stopping} onClose={() => setStopping(false)} />}
    </SentinelLayout>
  )
}
