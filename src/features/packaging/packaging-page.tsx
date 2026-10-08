import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronDown, PackageCheck, PackageOpen, Search, SearchX, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { listDrafts, markPackaged, PACKAGE_PHASES, type Draft } from '@/lib/api/compose'
import { getRuntimeRecords } from '@/lib/api/workers'
import { formatRelative } from '@/lib/format'
import { startOperation, useOperations, type Operation } from '@/lib/operations'
import { domainLabel, operatingModeLabel, READINESS_SECTIONS } from '@/lib/vocabulary'
import type { RuntimeRecord } from '@/lib/types/worker'

type Queue = 'work' | 'packaged' | 'deployed'

function queueOf(d: Draft, records: RuntimeRecord[]): Queue {
  if (!d.package) return 'work'
  return records.some((r) => r.composition_id === d.composition_id && r.state !== 'TERMINATED') ? 'deployed' : 'packaged'
}

function Contents({ d }: { d: Draft }) {
  const c = d.contents
  if (!c) return <p className="text-body text-muted-foreground">Contents are known once every checkpoint is confirmed.</p>
  return (
    <FactList>
      <Fact label="Skills">{c.skills}</Fact>
      <Fact label="Domain languages">{c.languages}</Fact>
      <Fact label="EVALs">{c.evaluations}</Fact>
      <Fact label="Definition of Done">{c.dod_criteria} criteria</Fact>
      <Fact label="Autonomy">{operatingModeLabel(c.operating_mode) ?? 'Operating mode not set'}</Fact>
      <Fact label="Harness">{c.harness || 'Generic runtime'}</Fact>
    </FactList>
  )
}

function Status({ d, op }: { d: Draft; op?: Operation }) {
  if (op && (op.state === 'RUNNING' || op.state === 'QUEUED'))
    return (
      <span className="flex w-36 flex-col gap-1">
        <span className="text-meta text-info">{op.label} · {op.progress}%</span>
        <Progress value={op.progress} aria-label={`${op.label} ${op.progress}%`} className="h-1 [&_[data-slot=progress-indicator]]:bg-brand" />
      </span>
    )
  if (!d.package) return <StatusBadge tone="neutral" icon={null}>Ready to package</StatusBadge>
  if (d.package.composition_revision < d.revision) return <StatusBadge tone="warning">Packaged at r{d.package.composition_revision} · draft at r{d.revision}</StatusBadge>
  return <span className="text-meta text-muted-foreground">Package r{d.package.composition_revision}</span>
}

export function PackagingPage() {
  const [params, setParams] = useSearchParams()
  const queue = (['work', 'packaged', 'deployed'].includes(params.get('queue') ?? '') ? params.get('queue') : 'work') as Queue
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const records = useResource('runtime-records', (signal) => getRuntimeRecords({ signal }))
  const ops = useOperations()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Draft | null>(null)
  const [showBlocked, setShowBlocked] = useState(false)

  const all = useMemo(() => (drafts.data ?? []).filter((d) => d.status === 'ACTIVE'), [drafts.data])
  const recs = records.data ?? []
  const needle = q.trim().toLowerCase()
  const match = (d: Draft) => !needle || `${d.name} ${d.contents?.context_label ?? ''} ${d.identity.bounded_scope}`.toLowerCase().includes(needle)
  const byQueue = (k: Queue) => all.filter((d) => queueOf(d, recs) === k && match(d))
  const rows = byQueue(queue).sort((a, b) => (b.package?.created_at ?? b.updated_at).localeCompare(a.package?.created_at ?? a.updated_at))
  const ready = queue === 'work' ? rows.filter((d) => d.issues.length === 0) : rows
  const blocked = queue === 'work' ? rows.filter((d) => d.issues.length > 0) : []

  const build = (d: Draft) =>
    startOperation({ key: `build:${d.composition_id}`, label: 'Building Package', subject: d.name, phases: PACKAGE_PHASES, href: '/packaging?queue=packaged', onSucceed: () => { markPackaged(d.composition_id); drafts.refresh() } })

  return (
    <PageContainer>
      <PageHeader
        title="Packaging"
        description="Seal composed Workers into versioned, checksummed Packages. Deploying or delivering one is the next decision."
        actions={<Button asChild variant="outline"><Link to="/customer-delivery"><Send aria-hidden="true" />Customer delivery</Link></Button>}
      />
      <SectionNav
        value={queue}
        onChange={(v) => setParams(v === 'work' ? {} : { queue: v })}
        items={[
          { value: 'work', label: 'To package', count: drafts.data ? byQueue('work').length : null },
          { value: 'packaged', label: 'Packaged', count: drafts.data ? byQueue('packaged').length : null },
          { value: 'deployed', label: 'Deployed', count: drafts.data ? byQueue('deployed').length : null },
        ]}
      />
      <InputGroup className="sm:max-w-sm">
        <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
        <InputGroupInput type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Worker or bounded context" aria-label="Search Worker or bounded context" />
      </InputGroup>

      {drafts.error ? (
        <ErrorState title="Could not load Packaging." message="The packaging list could not be loaded. Check the console API, then try again." onRetry={drafts.refresh} />
      ) : !drafts.data ? (
        <LoadingRegion label="Reading compositions…" className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16" />)}</LoadingRegion>
      ) : rows.length === 0 ? (
        needle ? <EmptyState icon={SearchX} title="No matches" action={<Button variant="outline" onClick={() => setQ('')}>Clear search</Button>} /> : <EmptyState icon={PackageOpen} title={queue === 'work' ? 'Nothing waiting to be packaged' : queue === 'packaged' ? 'No Packages waiting to deploy' : 'No packaged Worker is deployed'} />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y">
            {ready.map((d) => {
              const op = ops.find((o) => o.id === `build:${d.composition_id}`)
              const running = op && (op.state === 'RUNNING' || op.state === 'QUEUED')
              const stale = d.package && d.package.composition_revision < d.revision
              return (
                <li key={d.composition_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => setOpen(d)} className="min-w-0 flex-1 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="block truncate text-item hover:underline">{d.name}</span>
                    <span className="block truncate text-meta text-muted-foreground">
                      {d.contents?.context_label ?? d.identity.bounded_scope}
                      {d.business_domain_key ? ` · ${domainLabel(d.business_domain_key)}` : ''} · {d.package ? `packaged ${formatRelative(d.package.created_at)}` : `composed ${formatRelative(d.updated_at)}`}
                    </span>
                  </button>
                  <Status d={d} op={op} />
                  <div className="flex shrink-0 gap-2">
                    {queue === 'work' ? (
                      <Button size="sm" disabled={running} onClick={() => build(d)}><PackageCheck aria-hidden="true" />Build Package</Button>
                    ) : (
                      <>
                        {stale && <Button size="sm" variant="outline" disabled={running} onClick={() => build(d)}>Build r{d.revision}</Button>}
                        <Button asChild size="sm" variant="outline"><Link to={`/customer-delivery/prepare/${d.package!.id}`}>Prepare delivery</Link></Button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {blocked.length > 0 && (
            <div className="border-t">
              <button type="button" onClick={() => setShowBlocked((v) => !v)} aria-expanded={showBlocked} className="flex w-full items-center justify-between bg-muted/40 px-5 py-3 text-left text-meta font-medium outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                Still being assembled ({blocked.length})
                <ChevronDown className={showBlocked ? 'size-4 rotate-180' : 'size-4'} aria-hidden="true" />
              </button>
              {showBlocked && (
                <ul className="divide-y border-t">
                  {blocked.map((d) => (
                    <li key={d.composition_id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-item">{d.name}</p>
                        <ul className="mt-1 flex flex-col gap-0.5">
                          {d.issues.slice(0, 3).map((i) => (
                            <li key={i.code} className="flex gap-1.5 text-meta text-muted-foreground">
                              <TriangleAlert className="mt-0.5 size-3 shrink-0 text-warning" aria-hidden="true" />
                              <span><span className="text-foreground">{READINESS_SECTIONS[i.section] ?? i.section}:</span> {i.message}</span>
                            </li>
                          ))}
                          {d.issues.length > 3 && <li className="text-meta text-muted-foreground">{d.issues.length - 3} more</li>}
                        </ul>
                      </div>
                      <Button asChild size="sm" variant="outline"><Link to={`/compose/guided/${d.composition_id}`}>Continue composing</Link></Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      )}

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open?.package ? `Sealed Package · r${open.package.composition_revision}` : 'What a Package built now would contain'}>
        {open && <Contents d={open} />}
      </DetailSheet>
    </PageContainer>
  )
}
