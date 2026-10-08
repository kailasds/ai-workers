import { Link } from 'react-router'
import { Ban, Brain, Check, Gauge, ListChecks, PencilRuler, Server, Target, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyValue } from '@/components/platform/copy-value'
import { Fact, FactList } from '@/components/platform/fact-list'
import { IconTile } from '@/components/platform/icon-tile'
import { IdentityBadge, StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { domainLabel, operatingModeLabel, PACKAGE_STATUS, READINESS_SECTIONS, workerTypeLabel } from '@/lib/vocabulary'
import type { WorkerWorkspace } from '@/lib/types/worker'
import { IdentityControls } from './identity-controls'

interface Part {
  key: string
  station: string
  icon: LucideIcon
  name: string
  summary: React.ReactNode
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

// P-29: the Worker's six-part decomposition, each part linking to where it is edited.
function Anatomy({ ws }: { ws: WorkerWorkspace }) {
  const w = ws.worker
  const c = ws.composition?.contents
  const live = ws.runtimes.filter((r) => r.state !== 'TERMINATED')
  const running = live.filter((r) => r.state === 'RUNNING')
  const parts: Part[] = [
    {
      key: 'identity',
      station: 'role_identity',
      icon: Target,
      name: 'Identity and bounded context',
      summary: (
        <>
          {workerTypeLabel(w.worker_type)}
          {c?.business_domain_key ? ` · ${domainLabel(c.business_domain_key)}` : ''} · {w.bounded_context.label}
        </>
      ),
    },
    {
      key: 'intent',
      station: 'worker_intent',
      icon: PencilRuler,
      name: 'Worker intent',
      summary: <>{c?.harness ?? 'Harness not reported'} · model routing {w.routing.mode}</>,
    },
    {
      key: 'brain',
      station: 'brain',
      icon: Brain,
      name: 'Brain',
      summary: c ? (
        <>
          {plural(c.skills, 'Skill')} · {plural(c.languages, 'Domain Specific Language')} · {plural(c.evaluations, 'EVAL')} · {w.brain.engine ?? 'No memory engine'}
          {w.brain.composed_engine_version ? ` ${w.brain.composed_engine_version}` : ''} · Sentinel {w.sentinel.state === 'CONFIGURED' ? 'composed' : 'not composed'}
        </>
      ) : (
        'Not reported: this Worker carries no assembly record'
      ),
    },
    {
      key: 'dod',
      station: 'definition_of_done',
      icon: ListChecks,
      name: 'Definition of Done',
      summary: c ? plural(c.dod_criteria, 'criterion', 'criteria') : 'Not reported',
    },
    {
      key: 'autonomy',
      station: 'autonomy',
      icon: Gauge,
      name: 'Autonomy',
      summary: <>{operatingModeLabel(c?.operating_mode ?? null) ?? 'Operating mode not set'} · spending limit is set at deployment</>,
    },
    {
      key: 'runtime',
      station: 'package_deploy',
      icon: Server,
      name: 'Runtime',
      summary:
        live.length === 0
          ? 'No runtime still exists'
          : running.length > 0 && running[0].expires_at
            ? <>{plural(running.length, 'runtime')} running · stops automatically <Timestamp iso={running[0].expires_at} /></>
            : <>{plural(live.length, 'runtime')} · none running</>,
    },
  ]

  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="border-b py-5">
        <CardTitle>Anatomy</CardTitle>
        <CardDescription>The six parts this Worker is composed from. Editing a part creates the next immutable revision; it never changes a deployed Worker in place.</CardDescription>
      </CardHeader>
      <ol className="divide-y">
        {parts.map((part) => (
          <li key={part.key} className="flex items-start gap-3 px-5 py-4">
            <IconTile icon={part.icon} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-item">{part.name}</p>
              <p className="mt-0.5 text-meta text-muted-foreground">{part.summary}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to={`/compose/guided/${w.composition_id}?mode=review&checkpoint=${part.station}`} aria-label={`Edit ${part.name}`}>
                Edit
              </Link>
            </Button>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Scope({ ws }: { ws: WorkerWorkspace }) {
  const identity = ws.composition?.identity
  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="pt-5">
        <CardTitle>What it owns</CardTitle>
        <CardDescription>{ws.worker.bounded_context.label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 py-5">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed">{ws.worker.outcome}</p>
        {identity && (
          <div className="grid gap-5 border-t pt-5 md:grid-cols-2">
            <section aria-labelledby="may-do">
              <h3 id="may-do" className="text-overline text-muted-foreground uppercase">May do</h3>
              <p className="mt-2 flex gap-2 text-body">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {identity.bounded_scope}
              </p>
            </section>
            <section aria-labelledby="may-not">
              <h3 id="may-not" className="text-overline text-muted-foreground uppercase">And may not</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {identity.scope_excludes.map((x) => (
                  <li key={x} className="flex gap-2 text-body">
                    <Ban className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-meta text-muted-foreground">Each of these is refused at run time, not merely discouraged.</p>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PackageCard({ ws }: { ws: WorkerWorkspace }) {
  const c = ws.composition
  const pkg = c?.package
  const status = pkg ? (PACKAGE_STATUS[pkg.status] ?? { label: pkg.status, tone: 'neutral' as const }) : null
  const stale = pkg && c && pkg.composition_revision < c.revision
  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="pt-5">
        <CardTitle>Package</CardTitle>
        <CardDescription>The sealed, versioned artifact that is deployed or delivered.</CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        {!pkg ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-body text-muted-foreground">Not packaged yet. A Package is built from an accepted revision.</p>
            <Button asChild variant="outline" size="sm"><Link to="/packaging">Go to Packaging</Link></Button>
          </div>
        ) : (
          <FactList>
            <Fact label="Version">
              <span className="flex flex-wrap items-center gap-2">
                Package r{pkg.composition_revision}
                {status && <StatusBadge tone={status.tone} icon={null}>{status.label}</StatusBadge>}
              </span>
              {stale && <span className="mt-1 block text-meta text-warning">Older than the current revision r{c!.revision}</span>}
            </Fact>
            <Fact label="Built"><Timestamp iso={pkg.created_at} /></Fact>
            <Fact label="Package ID"><CopyValue value={pkg.id} label="Package ID" /></Fact>
          </FactList>
        )}
      </CardContent>
    </Card>
  )
}

function IdentityCard({ ws, onChanged }: { ws: WorkerWorkspace; onChanged: () => void }) {
  const id = ws.composition?.identity
  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="pt-5">
        <CardTitle>Identity</CardTitle>
        <CardDescription>How this Worker authenticates. Its authority was recorded when the identity was issued.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 py-5">
        {!id ? (
          <p className="text-body text-muted-foreground">Identity details were not reported for this Worker.</p>
        ) : (
          <>
            <FactList>
              <Fact label="Status"><IdentityBadge state={id.status} /></Fact>
              <Fact label="Credential">
                {id.credential_state === 'ISSUED' ? `Issued · lasts ${Math.round(id.token_ttl_seconds / 60)} minutes` : id.credential_state === 'UNISSUED' ? 'Not yet issued' : id.credential_state === 'DISABLED' ? 'Disabled' : 'Unavailable'}
              </Fact>
              <Fact label="Worker ID"><CopyValue value={id.worker_id} display={id.worker_id.split('/').pop()} label="Worker ID" /></Fact>
              <Fact label="SPIFFE ID"><CopyValue value={id.spiffe_id} display={`…/${id.spiffe_id.split('/').pop()}`} label="SPIFFE ID" /></Fact>
            </FactList>
            <p className="text-meta text-muted-foreground">A JWT-SVID is a bearer token, not a certificate. Revoking stops issuance; it does not recall a credential already out.</p>
            <IdentityControls compositionId={ws.worker.composition_id} workerName={ws.worker.name} state={id.status} onChanged={onChanged} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function OverviewTab({ ws, onChanged }: { ws: WorkerWorkspace; onChanged: () => void }) {
  const issues = ws.composition?.issues ?? []
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex min-w-0 flex-col gap-6">
        {ws.composition?.readiness === 'BLOCKED' && issues.length > 0 && (
          <Alert className="border-warning/30 bg-warning/5">
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
              <p className="mt-2">Advisory: the packaging gate itself is decided by the platform.</p>
            </AlertDescription>
          </Alert>
        )}
        <Scope ws={ws} />
        <Anatomy ws={ws} />
      </div>
      <div className="flex flex-col gap-6">
        <PackageCard ws={ws} />
        <IdentityCard ws={ws} onChanged={onChanged} />
      </div>
    </div>
  )
}
