import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronRight, PackageCheck, PackageOpen, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { CopyValue } from '@/components/platform/copy-value'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useResource } from '@/hooks/use-resource'
import { getSourcePublication } from '@/lib/api/catalog'
import { USE_MOCK } from '@/lib/api/client'
import { listDrafts, type Draft } from '@/lib/api/compose'
import { acknowledgeDelivery, getCustomerPackages } from '@/lib/api/workers'
import { formatRelative } from '@/lib/format'
import type { CustomerPackage } from '@/lib/types/worker'
import { CustomerPackageStateBadge } from '../registry/customer-packages'

// Ranking by what a Worker has learned: an ordering, not a Learning score.
const rank = (d: Draft) => (d.maturity ? d.maturity.skill_changes * 1000 + d.maturity.claims * 100 + d.maturity.memories : 0)
const kb = (bytes: number | null) => (bytes === null ? 'Not reported' : `${(bytes / 1024).toFixed(0)} KB`)

function PreparedDetail({ pkg, onChanged }: { pkg: CustomerPackage; onChanged: (p: CustomerPackage) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareNote, setShareNote] = useState(false)
  const canShare = pkg.state !== 'PREPARING' && pkg.state !== 'FAILED'
  const canAck = pkg.state === 'SHARED' || pkg.state === 'DOWNLOADED'
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={!canShare} onClick={() => setShareNote(true)}>Create share link</Button>
        {canAck && !confirming && <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>Record acknowledgement</Button>}
      </div>
      {!canShare && <p className="-mt-4 text-meta text-muted-foreground">{pkg.state === 'FAILED' ? 'Preparation failed. A failed Package cannot be shared.' : 'Available once preparation finishes.'}</p>}
      {shareNote && (
        <Alert><AlertTitle className="text-item">No link was created</AlertTitle><AlertDescription>{USE_MOCK ? 'Share links are signed by the platform. This console runs on captured data and creates none.' : 'Sharing is wired in a later revision.'}</AlertDescription></Alert>
      )}
      {confirming && (
        <div role="group" aria-labelledby="ack-title" className="rounded-xl border p-4">
          <p id="ack-title" className="text-item">Record that {pkg.destination_label ?? 'the customer'} acknowledged Package {pkg.version}?</p>
          <p className="mt-1 text-meta text-muted-foreground">It records an acknowledgement only. It does not verify that the customer deployed or is running it.</p>
          {error && <p className="mt-2 text-meta text-destructive">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={busy} onClick={async () => { setBusy(true); try { onChanged(await acknowledgeDelivery(pkg.delivery_id)); setConfirming(false) } catch (c) { setError(c instanceof Error ? c.message : 'Acknowledgement could not be recorded.') } finally { setBusy(false) } }}>
              {busy && <Spinner />}Record acknowledgement
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirming(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <FactList>
        <Fact label="State"><CustomerPackageStateBadge state={pkg.state} /></Fact>
        <Fact label="Last evidence">{pkg.last_evidence_at ? <Timestamp iso={pkg.last_evidence_at} /> : 'Not observed'}</Fact>
        <Fact label="Expires">{pkg.expires_at ? <Timestamp iso={pkg.expires_at} /> : 'Not set'}</Fact>
        <Fact label="Size">{kb(pkg.size_bytes)}</Fact>
        <Fact label="Digest"><CopyValue value={pkg.digest} label="digest" /></Fact>
      </FactList>
      {pkg.requirements && (
        <section>
          <h3 className="text-item">To run it, the customer needs</h3>
          <FactList className="mt-2">{Object.entries(pkg.requirements).map(([k, v]) => <Fact key={k} label={k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}>{v}</Fact>)}</FactList>
        </section>
      )}
      <section>
        <h3 className="text-item">Contents</h3>
        <ul className="mt-2 divide-y rounded-xl border">
          {pkg.contents.map((c) => (
            <li key={c.key} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-body">{c.label}</span>
              <StatusBadge tone={c.integrity === 'VERIFIED' ? 'success' : 'danger'}>{c.integrity === 'VERIFIED' ? 'Verified' : 'Failed verification'}</StatusBadge>
            </li>
          ))}
        </ul>
      </section>
      <FactList>
        <Fact label="Learning callback">{pkg.callback.configured === 'DISABLED' ? 'Disabled' : 'Enabled'} · {pkg.callback.observed === 'NOT_OBSERVED' ? 'Not observed' : pkg.callback.observed}</Fact>
        <Fact label="Source">{pkg.source.state === 'PUBLISHED' ? <>Published{pkg.source.tag ? <span className="block font-mono text-meta break-all text-muted-foreground">{pkg.source.tag}</span> : null}</> : pkg.source.state.replace(/_/g, ' ').toLowerCase()}</Fact>
      </FactList>
      <p className="text-meta text-muted-foreground">Customer runtime status: not observed by this record. Prepared is not sent; a share link is not receipt; an acknowledgement is not a deployment.</p>
    </div>
  )
}

export function DeliveryPage() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'delivered' ? 'delivered' : 'prepare'
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const packages = useResource('customer-packages', (signal) => getCustomerPackages({ signal }))
  const source = useResource('source-publication', (signal) => getSourcePublication({ signal }))
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<CustomerPackage | null>(null)

  const delivered = new Set((packages.data ?? []).map((p) => p.composition_id))
  const toPrepare = useMemo(
    () =>
      (drafts.data ?? [])
        .filter((d) => d.status === 'ACTIVE' && d.package?.status === 'DRAFT_READY' && !delivered.has(d.composition_id))
        .filter((d) => !q.trim() || d.name.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => rank(b) - rank(a) || (b.maturity?.runs ?? 0) - (a.maturity?.runs ?? 0)),
    [drafts.data, packages.data, q], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const prepared = (packages.data ?? []).filter((p) => !q.trim() || `${p.worker_name} ${p.destination_label ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()))
  const eligibilityKnown = Boolean(packages.data)

  return (
    <PageContainer>
      <PageHeader
        title="Customer delivery"
        description="Prepare a sealed Package for a named customer, and keep the record of what has gone out."
        actions={<Button asChild variant="outline"><Link to="/packaging"><PackageCheck aria-hidden="true" />Packaging</Link></Button>}
      />
      <SectionNav value={view} onChange={(v) => setParams(v === 'delivered' ? { view: 'delivered' } : {})} items={[{ value: 'prepare', label: 'To prepare', count: drafts.data && packages.data ? toPrepare.length : null }, { value: 'delivered', label: 'Prepared packages', count: packages.data?.length }]} />
      <InputGroup className="sm:max-w-sm">
        <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
        <InputGroupInput type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={view === 'prepare' ? 'Search Worker' : 'Search Worker or customer'} aria-label="Search" />
      </InputGroup>

      {view === 'prepare' ? (
        drafts.error ? (
          <ErrorState title="Workers with a Package could not be read." message={drafts.error.message} onRetry={drafts.refresh} />
        ) : !drafts.data ? (
          <LoadingRegion label="Reading packaged Workers…" className="flex flex-col gap-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}</LoadingRegion>
        ) : toPrepare.length === 0 ? (
          <EmptyState icon={PackageOpen} title="Nothing waiting to be prepared" description="A Worker appears here once its Package is sealed and ready, and before it has a delivery record." action={<Button asChild variant="outline"><Link to="/packaging">Go to Packaging</Link></Button>} />
        ) : (
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {toPrepare.map((d) => {
                const m = d.maturity
                const stale = d.package!.composition_revision < d.revision
                return (
                  <li key={d.composition_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <Link to={`/workers/${d.composition_id}?view=delivery`} className="block truncate text-item outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{d.name}</Link>
                      <p className="truncate text-meta text-muted-foreground">{d.contents?.context_label ?? d.identity.bounded_scope} · Package r{d.package!.composition_revision} · packaged {formatRelative(d.package!.created_at)}</p>
                      {stale && <p className="mt-1 text-meta text-warning">Newer draft available: r{d.revision}. This Package is r{d.package!.composition_revision}.</p>}
                    </div>
                    <span className="text-right text-meta text-muted-foreground">
                      {!m || m.runs === 0 ? 'No runs' : <><span className="text-foreground tabular-nums">{m.runs} runs · {m.runs_met} met</span><br />{m.memories} memory records</>}
                    </span>
                    {eligibilityKnown ? (
                      <Button asChild size="sm"><Link to={`/customer-delivery/prepare/${d.package!.id}`}>Prepare delivery</Link></Button>
                    ) : (
                      <Button size="sm" disabled title="Reading delivery records…">Prepare delivery</Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      ) : packages.error ? (
        <ErrorState title="Delivery records could not be read." message={packages.error.message} onRetry={packages.refresh} />
      ) : !packages.data ? (
        <Skeleton className="h-48" />
      ) : prepared.length === 0 ? (
        <EmptyState icon={PackageOpen} title="No customer Packages prepared" description="Prepared Packages appear here with their transfer evidence." />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {prepared.map((p) => (
              <li key={p.delivery_id}>
                <button type="button" onClick={() => setOpen(p)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-item">{p.worker_name}</span>
                    <span className="block truncate text-meta text-muted-foreground">For {p.destination_label ?? 'a customer not named'} · Package {p.version} · last evidence {p.last_evidence_at ? formatRelative(p.last_evidence_at) : 'not observed'}</span>
                  </span>
                  <CustomerPackageStateBadge state={p.state} />
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {source.data && <p className="text-meta text-muted-foreground">Source publication: {source.data.available ? source.data.detail : `unavailable · ${source.data.detail}`}</p>}

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.worker_name} description={open ? `For ${open.destination_label ?? 'a customer not named'} · Package ${open.version}` : undefined} width="lg">
        {open && <PreparedDetail pkg={open} onChanged={(p) => { setOpen(p); packages.refresh() }} />}
      </DetailSheet>
    </PageContainer>
  )
}
