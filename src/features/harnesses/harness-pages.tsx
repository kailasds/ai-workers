import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { BadgeCheck, BookOpen, Cable, ChevronRight, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import { CopyValue } from '@/components/platform/copy-value'
import { Fact, FactList } from '@/components/platform/fact-list'
import { IconTile } from '@/components/platform/icon-tile'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { formatDay } from '@/lib/format'
import { useResource } from '@/hooks/use-resource'
import { getHarnesses } from '@/lib/api/catalog'
import type { Harness } from '@/lib/types/catalog'

const VIEWS = [
  { value: 'catalogue', label: 'Catalogue', to: '/harnesses' },
  { value: 'certify', label: 'Certification guide', to: '/harnesses/certify' },
  { value: 'conformance', label: 'Conformance', to: '/harnesses/conformance' },
  { value: 'sdk', label: 'SDK reference', to: '/harnesses/sdk/overview' },
]

function Layout({ view, children, title = 'Harnesses', crumbs }: { view: string; children: React.ReactNode; title?: string; crumbs?: { label: string; to?: string }[] }) {
  const navigate = useNavigate()
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} description="Execution adapters: the serving image a Worker runs on. Choosing one changes what the Worker is." />
      {view && <SectionNav value={view} onChange={(v) => navigate(VIEWS.find((x) => x.value === v)!.to)} items={VIEWS} />}
      {children}
    </PageContainer>
  )
}

function useCatalogue() {
  return useResource('harnesses', (signal) => getHarnesses({ signal }))
}

/** Certification is evidence: a passed report plus a recorded certification by a different person. */
function certification(h: Harness) {
  const c = h.conformance
  if (!c) return { tone: 'neutral' as const, label: 'No report recorded for this image' }
  if (c.state === 'admitted' && c.admitted_at) return { tone: 'success' as const, label: `Certified · ${formatDay(c.admitted_at)}${c.admitted_by ? ` · ${c.admitted_by.replace(/^user:/, '')}` : ''}` }
  if (c.state === 'admitted') return { tone: 'warning' as const, label: 'Certification record missing' }
  if (c.state === 'checked') return { tone: 'neutral' as const, label: 'Passed · certification pending' }
  return { tone: 'danger' as const, label: 'Failed conformance' }
}

function Loading() {
  return <LoadingRegion label="Reading the harness catalogue…" className="flex flex-col gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></LoadingRegion>
}

export function HarnessCataloguePage() {
  const { data, error, refresh } = useCatalogue()
  return (
    <Layout view="catalogue">
      {error ? <ErrorState title="Could not load the harness catalogue." message={error.message} onRetry={refresh} /> : !data ? <Loading /> : data.harnesses.length === 0 ? (
        <EmptyState icon={Cable} title="No harnesses registered" action={<Button asChild variant="outline"><Link to="/harnesses/sdk/quick-start">Quick start</Link></Button>} />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {data.harnesses.map((h) => {
              const cert = certification(h)
              return (
                <li key={h.key}>
                  <Link to={`/harnesses/${h.key}`} className="flex items-start gap-4 px-5 py-5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                    <IconTile icon={Cable} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-item">{h.display_name}</span>
                      <span className="mt-0.5 block text-meta text-muted-foreground">{h.manifest ? `v${h.manifest.version} · ${h.manifest.stages.length} stages · ` : 'No manifest recorded · '}{h.vendor}</span>
                      <span className="mt-2 line-clamp-2 block text-body text-foreground/80">{h.summary}</span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge tone={cert.tone}>{cert.label}</StatusBadge>
                        <StatusBadge tone="neutral" icon={null}>{h.availability === 'available' ? 'Ready to use' : h.availability === 'recipe_only' ? 'Recipe only' : 'Planned'}</StatusBadge>
                      </span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className="block text-item tabular-nums">{h.used_by ?? '—'}</span>
                      <span className="block text-meta text-muted-foreground">{h.used_by === null ? 'Usage not reported' : 'Workers'}</span>
                    </span>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
      {data?.common_trade_offs.map((t) => <p key={t} className="text-meta text-muted-foreground">{t}</p>)}
    </Layout>
  )
}

export function HarnessPage() {
  const { key = '' } = useParams()
  const { data, error, refresh } = useCatalogue()
  const h = data?.harnesses.find((x) => x.key === key)
  const crumbs = [{ label: 'Harnesses', to: '/harnesses' }, { label: h?.display_name ?? key }]
  if (error) return <Layout view="" crumbs={crumbs}><ErrorState title="Could not load this harness." message={error.message} onRetry={refresh} /></Layout>
  if (!data) return <Layout view="" crumbs={crumbs}><Loading /></Layout>
  if (!h) return <Layout view="" crumbs={crumbs}><EmptyState icon={FileSearch} title="Harness not found" /></Layout>
  const m = h.manifest
  const cert = certification(h)
  return (
    <Layout view="" title={h.display_name} crumbs={crumbs}>
      <p className="-mt-2 text-body text-muted-foreground">{m ? `v${m.version} · ${m.vendor}` : h.vendor} · <StatusBadge tone={cert.tone}>{cert.label}</StatusBadge></p>
      {!m ? <EmptyState icon={FileSearch} title="No manifest recorded" /> : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-5"><CardTitle>Stages</CardTitle><CardDescription>{m.stages.length} stages, in the order a Worker moves through them.</CardDescription></CardHeader>
              <ol className="divide-y">
                {m.stages.map((s, i) => (
                  <li key={s.key} className="flex gap-4 px-5 py-4">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-meta tabular-nums">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-item">{s.title} <span className="font-normal text-muted-foreground">· {s.pipeline}</span></span>
                      <span className="block text-meta text-muted-foreground">Adds {s.adds.charAt(0).toLowerCase() + s.adds.slice(1)}</span>
                      {s.produces.length > 0 && <span className="mt-1 block text-meta text-muted-foreground">Reports {s.produces.join(', ')}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-5"><CardTitle>Evidence metrics</CardTitle><CardDescription>Reported by the harness, not counted by the platform.</CardDescription></CardHeader>
              <ul className="divide-y">
                {m.evidence_metrics.map((e) => (
                  <li key={e.id} className="px-5 py-3.5">
                    <span className="block text-item">{e.title} <span className="font-normal text-muted-foreground">· {e.type}{e.higher_is_better ? ', higher is better' : ''}</span></span>
                    <span className="block text-meta text-muted-foreground">{e.description}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card className="gap-0 p-5">
              <h2 className="text-item">Overview</h2>
              <FactList className="mt-3">
                <Fact label="Key" className="sm:grid-cols-[7rem_minmax(0,1fr)]"><span className="font-mono text-meta">{h.key}</span></Fact>
                <Fact label="Worker types" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.worker_types.join(', ')}</Fact>
                <Fact label="Contract" className="sm:grid-cols-[7rem_minmax(0,1fr)]">v{m.contract.major} · minors {m.contract.minors.join(', ')}</Fact>
                <Fact label="Serves" className="sm:grid-cols-[7rem_minmax(0,1fr)]"><span className="font-mono text-meta">{m.serve.bind}:{m.serve.port}{m.serve.base_path}</span></Fact>
                <Fact label="Image" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{h.image_pin.digest ? <CopyValue value={h.image_pin.digest} label="image digest" /> : 'No image pinned in this environment'}</Fact>
                <Fact label="Licence" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.licence}</Fact>
              </FactList>
            </Card>
            <Card className="gap-0 p-5">
              <h2 className="text-item">Runtime needs</h2>
              <FactList className="mt-3">
                <Fact label="CPU" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.resources.cpu / 1024} vCPU</Fact>
                <Fact label="Memory" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.resources.memory_mib / 1024} GiB</Fact>
                <Fact label="Storage" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.resources.ephemeral_storage_gib} GiB</Fact>
                <Fact label="Sidecars" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.sidecars.join(', ') || 'None'}</Fact>
                <Fact label="Egress" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{[m.egress.model_gateway && 'Model gateway', ...m.egress.package_mirrors.map((p) => `${p} mirror`), ...m.egress.other].filter(Boolean).join(', ') || 'None'}</Fact>
                <Fact label="Events" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{m.events.core_count} core · {m.events.extensions.length} extensions</Fact>
              </FactList>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  )
}

const CERTIFY_STEPS = [
  { title: 'Build', who: 'Harness team', text: 'Write the run function and manifest with the Python SDK, then build the image.' },
  { title: 'Check', who: 'Harness team', text: 'Run the conformance suite against the image.' },
  { title: 'Review', who: 'Harness team', text: 'Read the report; fix and run again. Only a version that passes can be certified.' },
  { title: 'Request certification', who: 'Harness team', text: 'Send the report to a maintainer yourself. The person who ran the suite cannot certify their own report.' },
  { title: 'Certify', who: 'Maintainer', text: 'On the prod host, in their own terminal, the maintainer re-runs the suite against the same image, confirms, and the platform records who certified and when.' },
]

export function CertifyPage() {
  const { data } = useCatalogue()
  return (
    <Layout view="certify">
      <ol className="grid gap-3 md:grid-cols-5">
        {CERTIFY_STEPS.map((s, i) => (
          <li key={s.title}>
            <Card className="h-full gap-2 p-5">
              <span className="grid size-6 place-items-center rounded-full bg-brand text-meta text-brand-foreground tabular-nums">{i + 1}</span>
              <p className="text-item">{s.title}</p>
              <p className="text-meta text-muted-foreground">{s.who}</p>
              <p className="text-body">{s.text}</p>
            </Card>
          </li>
        ))}
      </ol>
      <Card className="gap-0 py-0">
        <h2 className="px-5 pt-5 pb-3 text-section">Harness status</h2>
        <ul className="divide-y border-t">
          {(data?.harnesses ?? []).map((h) => {
            const cert = certification(h)
            return (
              <li key={h.key} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1 text-item">{h.display_name} <span className="font-normal text-muted-foreground">· v{h.manifest?.version ?? '?'}</span></span>
                <StatusBadge tone={cert.tone}>{cert.label}</StatusBadge>
              </li>
            )
          })}
        </ul>
      </Card>
      <p className="text-meta text-muted-foreground">This guide sends nothing. Compose shows each version’s state; it does not refuse an uncertified version yet. Conformance is evidence, not a security boundary.</p>
    </Layout>
  )
}

export function ConformancePage() {
  const { data } = useCatalogue()
  return (
    <Layout view="conformance">
      {!data ? <Loading /> : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {data.harnesses.filter((h) => h.conformance).map((h) => {
              const cert = certification(h)
              return (
                <li key={h.key}>
                  <Link to={`/harnesses/conformance/${h.conformance!.report_id}`} className="flex items-center gap-4 px-5 py-4 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                    <BadgeCheck className="size-5 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-item">{h.display_name} · v{h.manifest?.version}</span>
                      <span className="block font-mono text-meta text-muted-foreground">{h.conformance!.report_id}</span>
                    </span>
                    <StatusBadge tone={cert.tone}>{cert.label}</StatusBadge>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </Layout>
  )
}

export function ConformanceReportPage() {
  const { reportId = '' } = useParams()
  const { data } = useCatalogue()
  const h = data?.harnesses.find((x) => x.conformance?.report_id === reportId)
  return (
    <Layout view="" title="Conformance report" crumbs={[{ label: 'Harnesses', to: '/harnesses' }, { label: 'Conformance', to: '/harnesses/conformance' }, { label: reportId }]}>
      {!data ? <Loading /> : !h ? <EmptyState icon={FileSearch} title="No report recorded for this id" /> : (
        <Card className="gap-0 p-6">
          <FactList>
            <Fact label="Harness">{h.display_name} · v{h.manifest?.version}</Fact>
            <Fact label="Verdict"><StatusBadge tone={certification(h).tone}>{certification(h).label}</StatusBadge></Fact>
            <Fact label="Checked">{h.conformance?.checked_at ? formatDay(h.conformance.checked_at) : 'Not reported'}</Fact>
            <Fact label="Report"><span className="font-mono text-meta">{reportId}</span></Fact>
          </FactList>
          <p className="mt-5 text-meta text-muted-foreground">The fifteen checks, the image digest the report covers and the source commit live in the report document. This capture holds the catalogue’s summary only, so each check would read as pending, never as passed.</p>
        </Card>
      )}
    </Layout>
  )
}

const SDK_GROUPS: { label: string; pages: [string, string][] }[] = [
  { label: 'Start', pages: [['overview', 'Overview'], ['quick-start', 'Quick start']] },
  { label: 'Interfaces', pages: [['run-context', 'Run context'], ['calls', 'SDK calls'], ['learning-and-sentinel', 'Learning and Sentinel'], ['lifecycle', 'Run lifecycle'], ['rules', 'Rules']] },
  { label: 'Python SDK', pages: [['harness-app', 'harness-app'], ['run', 'run'], ['run-context-py', 'run-context'], ['okf', 'okf'], ['manifest', 'manifest']] },
  { label: 'Reference', pages: [['conformance', 'Conformance'], ['api', 'API'], ['schemas', 'Schemas']] },
]
const SDK_PAGES = SDK_GROUPS.flatMap((g) => g.pages)

export function SdkPage() {
  const { page = 'overview' } = useParams()
  const navigate = useNavigate()
  const current = SDK_PAGES.find(([k]) => k === page)
  if (!current) return <Navigate to="/harnesses/sdk/overview" replace />
  const index = SDK_PAGES.indexOf(current)
  return (
    <Layout view="sdk">
      <div className="grid items-start gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <SectionNav className="md:hidden" value={page} onChange={(v) => navigate(`/harnesses/sdk/${v}`)} items={SDK_PAGES.map(([value, label]) => ({ value, label }))} />
        <nav aria-label="SDK reference" className="hidden flex-col gap-4 md:flex">
          {SDK_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="text-overline text-muted-foreground uppercase">{g.label}</p>
              <ul className="mt-1">
                {g.pages.map(([k, label]) => (
                  <li key={k}><Link to={`/harnesses/sdk/${k}`} aria-current={k === page ? 'page' : undefined} className={k === page ? 'block rounded-md bg-accent px-2 py-1.5 text-body font-medium' : 'block rounded-md px-2 py-1.5 text-body text-muted-foreground hover:bg-muted/60 hover:text-foreground'}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <Card className="gap-4 p-6">
          <div className="flex items-center gap-3"><IconTile icon={BookOpen} size="sm" /><h2 className="text-section">{current[1]}</h2></div>
          <p className="text-body text-muted-foreground">This page renders from the Harness–Worker Contract (<span className="font-mono text-meta">/hwc/v1</span>), read from the platform. The contract is not part of the offline capture, so the page cannot be drawn here.</p>
          <div className="flex justify-between border-t pt-4">
            {index > 0 ? <Button asChild variant="ghost" size="sm"><Link to={`/harnesses/sdk/${SDK_PAGES[index - 1][0]}`}>← {SDK_PAGES[index - 1][1]}</Link></Button> : <span />}
            {index < SDK_PAGES.length - 1 && <Button asChild variant="ghost" size="sm"><Link to={`/harnesses/sdk/${SDK_PAGES[index + 1][0]}`}>{SDK_PAGES[index + 1][1]} →</Link></Button>}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
