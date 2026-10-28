import { Link, useNavigate } from 'react-router'
import { Ban, Check, PackageCheck, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyValue } from '@/components/platform/copy-value'
import { Fact, FactList } from '@/components/platform/fact-list'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { IdentityBadge, StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { PACKAGE_STATUS, READINESS_SECTIONS } from '@/lib/vocabulary'
import type { WorkerWorkspace } from '@/lib/types/worker'
import { ComposingPanel } from '../compose/worker-panel'
import { IdentityControls } from './identity-controls'
import type { Composition } from './use-composition'

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function Readiness({ ws }: { ws: WorkerWorkspace }) {
  const issues = ws.composition?.issues ?? []
  if (ws.composition?.readiness !== 'BLOCKED' || issues.length === 0) return null
  return (
    <Alert className="border-warning/30 bg-warning-soft">
      <TriangleAlert className="text-warning" aria-hidden="true" />
      <AlertTitle className="text-item">Not ready to package: {plural(issues.length, 'part', 'parts')} incomplete</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 flex flex-col gap-0.5">
          {issues.map((i) => (
            <li key={i.code}>
              <span className="text-foreground">{READINESS_SECTIONS[i.section] ?? i.section}:</span> {i.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

function SealedPackage({ ws }: { ws: WorkerWorkspace }) {
  const c = ws.composition
  const pkg = c?.package
  const status = pkg ? (PACKAGE_STATUS[pkg.status] ?? { label: pkg.status, tone: 'neutral' as const }) : null
  const stale = pkg && c && pkg.composition_revision < c.revision
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-section">Sealed Package</h2>
        {status && <StatusBadge tone={status.tone} icon={null}>{status.label}</StatusBadge>}
      </div>
      {!pkg ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body text-muted-foreground">Not packaged yet.</p>
          <Button asChild variant="secondary"><Link to="/packaging"><PackageCheck aria-hidden="true" />Go to Packaging</Link></Button>
        </div>
      ) : (
        <FactList>
          <Fact label="Version">
            Revision {pkg.composition_revision}
            {stale && <span className="mt-1 block text-meta text-warning">Older than the current revision {c!.revision}</span>}
          </Fact>
          <Fact label="Built"><Timestamp iso={pkg.created_at} /></Fact>
          <Fact label="Package ID"><CopyValue value={pkg.id} label="Package ID" /></Fact>
        </FactList>
      )}
    </Card>
  )
}

function Scope({ ws }: { ws: WorkerWorkspace }) {
  const identity = ws.composition?.identity
  return (
    <Card className="gap-4 p-5">
      <h2 className="text-section">Responsibilities</h2>
      <p className="max-w-3xl text-body">{ws.worker.outcome}</p>
      {identity && (
        <div className="grid gap-3 md:grid-cols-2">
          <section aria-labelledby="may-do" className="rounded-block bg-muted p-4">
            <h3 id="may-do" className="text-overline text-muted-foreground">Can</h3>
            <p className="mt-2 flex gap-2 text-body">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {identity.bounded_scope}
            </p>
          </section>
          <section aria-labelledby="may-not" className="rounded-block bg-muted p-4">
            <h3 id="may-not" className="text-overline text-muted-foreground">Can’t</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {identity.scope_excludes.map((x) => (
                <li key={x} className="flex gap-2 text-body">
                  <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Card>
  )
}

/** The composition as Compose shows it: the navy identity head and every part with its state. */
function CompositionPanel({ ws, comp }: { ws: WorkerWorkspace; comp: Composition }) {
  const navigate = useNavigate()
  const { draft, catalogs, proposal } = comp
  if (draft.error)
    return <ErrorState title="The composition record could not be read." message={draft.error.message} onRetry={draft.refresh} retrying={draft.pending} />
  if (catalogs.error) return <ErrorState title="The catalogues could not be read." message={catalogs.error.message} onRetry={catalogs.refresh} retrying={catalogs.pending} />
  if (!draft.data)
    return (
      <LoadingRegion label="Reading the composition…" className="flex flex-col gap-3 rounded-panel bg-card p-6">
        <Skeleton className="h-28 w-full bg-track" />
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full bg-track" />)}
      </LoadingRegion>
    )
  return (
    <ComposingPanel
      draft={draft.data}
      proposal={proposal}
      current="summary"
      settled
      onGo={(k) => navigate(`/compose/guided/${ws.worker.composition_id}?mode=review&step=${k}`)}
    />
  )
}

export function PackageTab({ ws, comp }: { ws: WorkerWorkspace; comp: Composition }) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="flex min-w-0 flex-col gap-5">
        <Readiness ws={ws} />
        <SealedPackage ws={ws} />
        <Scope ws={ws} />
      </div>
      <div className="xl:sticky xl:top-20">
        <CompositionPanel ws={ws} comp={comp} />
      </div>
    </div>
  )
}

/** Identity details, shown in a sheet from the header. */
export function IdentityDetails({ ws, onChanged }: { ws: WorkerWorkspace; onChanged: () => void }) {
  const id = ws.composition?.identity
  if (!id) return <p className="text-body text-muted-foreground">No identity details.</p>
  return (
    <div className="flex flex-col gap-5">
      <FactList>
        <Fact label="Status"><IdentityBadge state={id.status} /></Fact>
        <Fact label="Credential">
          {id.credential_state === 'ISSUED' ? `Issued · lasts ${Math.round(id.token_ttl_seconds / 60)} minutes` : id.credential_state === 'UNISSUED' ? 'Not yet issued' : id.credential_state === 'DISABLED' ? 'Disabled' : 'Unavailable'}
        </Fact>
        <Fact label="Worker ID"><CopyValue value={id.worker_id} display={id.worker_id.split('/').pop()} label="Worker ID" /></Fact>
        <Fact label="SPIFFE ID"><CopyValue value={id.spiffe_id} display={`…/${id.spiffe_id.split('/').pop()}`} label="SPIFFE ID" /></Fact>
        <Fact label="Scope"><span className="font-mono text-meta break-all">{id.bounded_scope}</span></Fact>
      </FactList>
      <IdentityControls compositionId={ws.worker.composition_id} workerName={ws.worker.name} state={id.status} onChanged={onChanged} />
    </div>
  )
}
