import { useState } from 'react'
import { Link } from 'react-router'
import { Server } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyValue } from '@/components/platform/copy-value'
import { EmptyState } from '@/components/platform/states'
import { RuntimeStateBadges, STOP_REASON } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { USE_MOCK } from '@/lib/api/client'
import type { RuntimeRecord, WorkerWorkspace } from '@/lib/types/worker'

type Op = { kind: 'redeploy' | 'resume'; runtime: RuntimeRecord }

// Deploy again for a stopped/failed ECS runtime; Resume only when a person stopped it (RULE-091/092).
function canRedeploy(r: RuntimeRecord) {
  return r.target === 'ECS' && (r.state === 'STOPPED' || r.state === 'FAILED') && r.stop_reason !== 'termination_failed'
}
function canResume(r: RuntimeRecord) {
  return r.target === 'ECS' && r.state === 'STOPPED' && r.stop_reason === 'stopped'
}

/** P-21 + P-11: a spending limit wherever a Worker is deployed (never blank), and a reason to resume. */
function DeployDialog({ op, workerName, onClose }: { op: Op | null; workerName: string; onClose: () => void }) {
  const [limit, setLimit] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const needsReason = op?.kind === 'resume'
  const limitValid = /^\d+(\.\d{1,2})?$/.test(limit) && Number(limit) > 0
  const ready = limitValid && (!needsReason || (reason.trim().length > 0 && reason.length <= 500))

  return (
    <Dialog open={op !== null} onOpenChange={(o) => { if (!o) { onClose(); setError(null) } }}>
      <DialogContent className="sm:max-w-md">
        {op && (
          <>
            <DialogHeader>
              <DialogTitle className="text-section">{op.kind === 'resume' ? 'Resume runtime' : 'Deploy again'}</DialogTitle>
              <DialogDescription className="text-body">
                <span className="font-medium text-foreground">{workerName}</span> · {op.runtime.target} slot {op.runtime.runtime_slot}.{' '}
                {op.kind === 'resume' ? 'Its service starts again with the images it had. The stop is lifted and recorded.' : 'Redeploy updates the Worker Runtime only. The harness image comes from the Package.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limit">Monthly spending limit (USD)</Label>
              <Input id="limit" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} aria-invalid={limit !== '' && !limitValid} aria-describedby="limit-hint" />
              <p id="limit-hint" className="text-meta text-muted-foreground">Required. Blank never means unlimited. Resets at the start of each month (UTC).</p>
            </div>
            {needsReason && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} aria-describedby="reason-hint" />
                <p id="reason-hint" className="text-meta text-muted-foreground">Recorded with the Platform Sentinel decision so other operators can read why.</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Nothing was sent.</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button
                disabled={!ready}
                onClick={() => setError(USE_MOCK ? 'This console is running on captured mock data, so deployments are not available.' : 'Deployment is wired in a later phase.')}
              >
                {op.kind === 'resume' ? 'Resume runtime' : 'Deploy again'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function RuntimesTab({ ws }: { ws: WorkerWorkspace }) {
  const [op, setOp] = useState<Op | null>(null)
  const runtimes = ws.runtimes
  const count = (s: RuntimeRecord['state']) => runtimes.filter((r) => r.state === s).length

  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="border-b py-5">
        <CardTitle>Runtimes</CardTitle>
        <CardDescription>Each deployed instance of a Package. Lifecycle and health are separate observations.</CardDescription>
      </CardHeader>
      {runtimes.length === 0 ? (
        <EmptyState className="m-5" icon={Server} title="This Worker is composed and has no runtime" description="Deploy it from Packaging once its Package is built." />
      ) : (
        <ul className="divide-y">
          {runtimes.map((r) => (
            <li key={r.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-item">{r.target === 'ECS' ? 'ECS' : 'Local'} · slot {r.runtime_slot}</span>
                  <RuntimeStateBadges runtime={r} />
                </div>
                <p className="text-meta text-muted-foreground">
                  {r.stop_reason && <>{STOP_REASON[r.stop_reason]} · </>}
                  Created <Timestamp iso={r.created_at} /> · last seen <Timestamp iso={r.observed_at} />
                  {r.state === 'RUNNING' && r.expires_at && <> · stops automatically <Timestamp iso={r.expires_at} /></>}
                  {r.restart_count > 0 && ` · ${r.restart_count} restarts`}
                </p>
                <span className="flex items-center gap-1.5 text-meta text-muted-foreground">
                  Image <CopyValue value={r.image} display={`sha256:${r.image.split('sha256:')[1]?.slice(0, 12) ?? '?'}…`} label="image digest" />
                </span>
              </div>
              <div className="flex gap-2 md:justify-end">
                {r.state !== 'TERMINATED' && <Button asChild variant="ghost" size="sm"><Link to={`/workers/${r.composition_id}/runtimes/${r.id}/configuration`}>Configure</Link></Button>}
                {canResume(r) && <Button variant="outline" size="sm" onClick={() => setOp({ kind: 'resume', runtime: r })}>Resume</Button>}
                {canRedeploy(r) && <Button variant="outline" size="sm" onClick={() => setOp({ kind: 'redeploy', runtime: r })}>Deploy again</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {runtimes.length > 0 && (
        <CardFooter className="px-5 py-3 text-meta text-muted-foreground tabular-nums">
          {count('RUNNING')} running · {count('DEPLOYING')} deploying · {count('STOPPED')} stopped · {count('FAILED')} failed · {count('TERMINATED')} terminated
        </CardFooter>
      )}
      <DeployDialog op={op} workerName={ws.worker.name} onClose={() => setOp(null)} />
    </Card>
  )
}
