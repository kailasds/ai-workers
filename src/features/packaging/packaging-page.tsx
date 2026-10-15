import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PackageCheck, PackageOpen, PencilRuler, Search, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Tag } from '@/components/platform/hue'
import { PackageMedia, ProductCard } from '@/components/platform/product-card'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { listDrafts, markPackaged, PACKAGE_PHASES, type Draft } from '@/lib/api/compose'
import { getRuntimeRecords } from '@/lib/api/workers'
import { formatRelative } from '@/lib/format'
import { startOperation, useOperations, type Operation } from '@/lib/operations'
import { domainLabel, operatingModeLabel, READINESS_SECTIONS } from '@/lib/vocabulary'
import { queueOf, type Queue } from '../registry/pipeline-model'


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

/** The card's state pill: building (with progress), not sealed, stale or sealed. */
function Status({ d, op }: { d: Draft; op?: Operation }) {
  if (op && (op.state === 'RUNNING' || op.state === 'QUEUED')) return <StatusBadge tone="info" icon={null}>Building · {op.progress}%</StatusBadge>
  if (!d.package) return <StatusBadge tone="neutral" icon={null}>Not sealed</StatusBadge>
  if (d.package.composition_revision < d.revision) return <StatusBadge tone="warning">Revision {d.revision} not sealed</StatusBadge>
  return <StatusBadge tone="success">Sealed</StatusBadge>
}

/** What is in the box: the counts a Package carries. Unknown until every checkpoint is confirmed. */
function boxKpis(d: Draft) {
  const c = d.contents
  const v = (n: number | undefined) => (c ? n : <span className="text-muted-foreground">–</span>)
  return [
    { label: 'Skills', value: v(c?.skills) },
    { label: 'DSLs', value: v(c?.languages) },
    { label: 'EVALs', value: v(c?.evaluations) },
    { label: 'DoD', value: v(c?.dod_criteria) },
  ]
}

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'

export function PackagingPage() {
  const [params, setParams] = useSearchParams()
  const queue = (['work', 'packaged', 'deployed'].includes(params.get('queue') ?? '') ? params.get('queue') : 'work') as Queue
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const records = useResource('runtime-records', (signal) => getRuntimeRecords({ signal }))
  const ops = useOperations()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Draft | null>(null)

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
    <div className="flex flex-col gap-5">
      <SectionNav
        variant="pills"
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
        <LoadingRegion label="Reading compositions…" className={GRID}>{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-80 rounded-xl bg-track" />)}</LoadingRegion>
      ) : rows.length === 0 ? (
        needle ? <EmptyState icon={SearchX} title="No matches" action={<Button variant="outline" onClick={() => setQ('')}>Clear search</Button>} /> : <EmptyState icon={PackageOpen} title={queue === 'work' ? 'Nothing waiting to be packaged' : queue === 'packaged' ? 'No Packages waiting to deploy' : 'No packaged Worker is deployed'} />
      ) : (
        <div className="flex flex-col gap-8">
          {ready.length > 0 && (
            <ul className={GRID}>
              {ready.map((d) => {
                const op = ops.find((o) => o.id === `build:${d.composition_id}`)
                const running = Boolean(op && (op.state === 'RUNNING' || op.state === 'QUEUED'))
                const stale = d.package && d.package.composition_revision < d.revision
                return (
                  <li key={d.composition_id}>
                    <ProductCard
                      hue="amber"
                      media={
                        <PackageMedia
                          hue="amber"
                          sealed={Boolean(d.package)}
                          label={`Revision ${d.package ? d.package.composition_revision : d.revision}`}
                          sublabel={d.package ? d.package.id.slice(0, 8) : undefined}
                        />
                      }
                      status={<Status d={d} op={op} />}
                      eyebrow={d.contents?.context_label ?? d.identity.bounded_scope}
                      title={d.name}
                      onOpen={() => setOpen(d)}
                      tags={
                        d.business_domain_key || d.contents?.harness ? (
                          <>
                            {d.business_domain_key && <Tag hue="cyan">{domainLabel(d.business_domain_key)}</Tag>}
                            {d.contents?.harness && <Tag hue="blue">{d.contents.harness}</Tag>}
                          </>
                        ) : undefined
                      }
                      kpis={boxKpis(d)}
                      footer={
                        <>
                          <span className="min-w-0 flex-1 truncate text-meta text-muted-foreground">
                            {d.package ? `Sealed ${formatRelative(d.package.created_at)}` : `Composed ${formatRelative(d.updated_at)}`}
                          </span>
                          {queue === 'work' ? (
                            <Button size="sm" disabled={running} onClick={() => build(d)}><PackageCheck aria-hidden="true" />Build Package</Button>
                          ) : (
                            <>
                              {stale && <Button size="sm" variant="outline" disabled={running} onClick={() => build(d)}>Build r{d.revision}</Button>}
                              <Button asChild size="sm" variant="secondary"><Link to={`/customer-delivery/prepare/${d.package!.id}`}>Prepare delivery</Link></Button>
                            </>
                          )}
                        </>
                      }
                    />
                  </li>
                )
              })}
            </ul>
          )}
          {blocked.length > 0 && (
            <section aria-labelledby="assembling" className="flex flex-col gap-4">
              <h3 id="assembling" className="flex items-center gap-2 text-section">
                Still being assembled
                <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{blocked.length}</span>
              </h3>
              <ul className={GRID}>
                {blocked.map((d) => (
                  <li key={d.composition_id}>
                    <ProductCard
                      hue="amber"
                      media={<PackageMedia hue="amber" sealed={false} label={`Revision ${d.revision}`} />}
                      status={<StatusBadge tone="warning">{d.issues.length === 1 ? '1 part open' : `${d.issues.length} parts open`}</StatusBadge>}
                      eyebrow={d.contents?.context_label ?? d.identity.bounded_scope}
                      title={d.name}
                      onOpen={() => setOpen(d)}
                      tags={
                        <ul className="flex flex-col gap-1">
                          {d.issues.slice(0, 2).map((i) => (
                            <li key={i.code} className="flex gap-1.5 text-meta text-muted-foreground">
                              <TriangleAlert className="mt-0.5 size-3 shrink-0 text-warning" aria-hidden="true" />
                              <span className="line-clamp-2"><span className="text-foreground">{READINESS_SECTIONS[i.section] ?? i.section}:</span> {i.message}</span>
                            </li>
                          ))}
                        </ul>
                      }
                      kpis={boxKpis(d)}
                      footer={
                        <>
                          <span className="min-w-0 flex-1 truncate text-meta text-muted-foreground">Composed {formatRelative(d.updated_at)}</span>
                          <Button asChild size="sm" variant="outline"><Link to={`/compose/guided/${d.composition_id}`}><PencilRuler aria-hidden="true" />Continue composing</Link></Button>
                        </>
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.name} description={open?.package ? `Sealed Package · r${open.package.composition_revision}` : 'What a Package built now would contain'}>
        {open && <Contents d={open} />}
      </DetailSheet>
    </div>
  )
}
