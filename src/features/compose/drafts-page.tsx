import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Archive, FilePlus2, FolderOpen, Search, SearchX } from 'lucide-react'
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { Pager } from '@/components/platform/pager'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { IdentityBadge } from '@/components/platform/status-badge'
import { useResource } from '@/hooks/use-resource'
import { archiveDraft, listDrafts, type Draft } from '@/lib/api/compose'
import { formatRelative } from '@/lib/format'
import { MOCK_SESSION } from '@/lib/session'
import { CHECKPOINTS } from './compose-model'

const PAGE = 20

function ArchiveConfirm({ draft, onDone, onCancel }: { draft: Draft; onDone: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div role="group" aria-labelledby={`archive-${draft.composition_id}`} className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <p id={`archive-${draft.composition_id}`} className="text-item">Archive {draft.name}?</p>
      <p className="mt-1 text-meta text-muted-foreground">It leaves Saved drafts and can no longer be continued. It has no Package, so no runtime is affected.</p>
      {error && <p className="mt-2 text-meta text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await archiveDraft(draft.composition_id, draft.record_version)
              onDone()
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'The draft could not be archived. Try again.')
              setBusy(false)
            }
          }}
        >
          {busy && <Spinner />}Archive draft
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
      </div>
    </div>
  )
}

export function DraftsPage() {
  const { data, error, pending, refresh } = useResource('drafts', (signal) => listDrafts({ signal }))
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [archived, setArchived] = useState<string | null>(null)
  const isAdmin = MOCK_SESSION.roleLabel === 'Administrator'

  const active = useMemo(() => (data ?? []).filter((d) => d.status === 'ACTIVE'), [data])
  const matching = active.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase()))
  const visible = matching.slice((page - 1) * PAGE, page * PAGE)

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Compose', to: '/compose' }, { label: 'Saved drafts' }]}
        title="Saved drafts"
        description="Continue a Worker from its reserved identity, or start a new one."
        actions={<Button asChild><Link to="/compose"><FilePlus2 aria-hidden="true" />New Worker</Link></Button>}
      />

      {archived && (
        <Alert role="status"><AlertTitle className="text-item">{archived} archived.</AlertTitle></Alert>
      )}

      {error && !data ? (
        <ErrorState title="Saved drafts unavailable" message="Saved drafts could not be loaded. Check the console API, then try again." onRetry={refresh} retrying={pending} />
      ) : !data ? (
        <LoadingRegion label="Loading saved drafts…" className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16" />)}</LoadingRegion>
      ) : active.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No saved drafts yet" description="Start a new Worker and it will be saved here as you go." action={<Button asChild><Link to="/compose">New Worker</Link></Button>} />
      ) : (
        <>
          <InputGroup className="sm:max-w-sm">
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            <InputGroupInput type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search drafts by name" aria-label="Search saved drafts" />
          </InputGroup>
          {matching.length === 0 ? (
            <EmptyState icon={SearchX} title="No drafts match this search" description="Clear the search to see every draft." action={<Button variant="outline" onClick={() => setQ('')}>Clear search</Button>} />
          ) : (
            <Card className="gap-0 py-0">
              <ul className="divide-y">
                {visible.map((d) => {
                  const composed = d.accepted.length === CHECKPOINTS.length
                  const canArchive = isAdmin && !d.package
                  return (
                    <li key={d.composition_id} className="px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <Link to={`/compose/guided/${d.composition_id}`} className="text-item outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{d.name}</Link>
                          <p className="mt-0.5 truncate text-meta text-muted-foreground">
                            {d.identity.bounded_scope || 'No scope recorded'} · r{d.revision} · updated {formatRelative(d.updated_at)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-meta text-muted-foreground">
                            <span className="tabular-nums">{composed ? 'Composed' : `${d.accepted.length} of ${CHECKPOINTS.length} confirmed`}</span>
                            {d.package && <span>· Packaged r{d.package.composition_revision}</span>}
                            {d.identity.status !== 'ACTIVE' && <IdentityBadge state={d.identity.status} />}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {canArchive && confirming !== d.composition_id && (
                            <Button variant="ghost" size="sm" onClick={() => setConfirming(d.composition_id)} aria-label={`Archive ${d.name}`}>
                              <Archive aria-hidden="true" />Archive
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm"><Link to={`/compose/guided/${d.composition_id}`}>Continue</Link></Button>
                        </div>
                      </div>
                      {confirming === d.composition_id && (
                        <ArchiveConfirm
                          draft={d}
                          onCancel={() => setConfirming(null)}
                          onDone={() => {
                            setConfirming(null)
                            setArchived(d.name)
                            refresh()
                          }}
                        />
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="border-t px-5 py-3"><Pager page={page} pageSize={PAGE} total={matching.length} onPage={setPage} label="Drafts" /></div>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  )
}
