import { Navigate, useParams } from 'react-router'
import { Gavel, Radar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState, ErrorState } from '@/components/platform/states'
import { DIMENSIONS, openPhrase } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'
import { useSentinel } from './use-sentinel'

// Settings each Worker owns, chosen when it is composed or deployed. Platform policy can only
// make these stricter, never looser.
const WORKER_OWNED = [
  { label: 'Autonomy level', where: 'Set when the Worker is composed' },
  { label: 'Worker Sentinel mode', where: 'Set when the Worker is composed' },
  { label: 'Sharing its learning', where: 'Set in the Worker’s Sentinel settings' },
  { label: 'Data sent to the platform', where: 'Set by the Worker’s owner' },
  { label: 'Monthly spending limit', where: 'Set when the Worker is deployed' },
]

export function SentinelPolicyPage() {
  const sentinel = useSentinel()
  const { data, error, refresh } = sentinel.overview
  return (
    <SentinelLayout view="policy" source={sentinel.source}>
      {error && !data ? (
        <ErrorState title="Platform policy couldn’t be loaded." message={error.message} onRetry={refresh} />
      ) : !data ? (
        <Skeleton className="h-48 bg-track" />
      ) : !data.viewer.admin ? (
        <EmptyState icon={Gavel} title="Platform policy is available to administrators" />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section aria-labelledby="platform-title" className="flex flex-col gap-3">
            <div>
              <h2 id="platform-title" className="text-section">Platform-wide controls</h2>
              <p className="text-meta text-muted-foreground">Limits that apply to every Worker. They can only tighten a Worker’s own settings.</p>
            </div>
            <Card className="gap-0 py-0">
              <dl className="divide-y">
                <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"><dt className="text-meta text-muted-foreground">Status</dt><dd className="text-body">Not configured</dd></div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"><dt className="text-meta text-muted-foreground">Limits, managed values, directives</dt><dd className="text-body">None set</dd></div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"><dt className="text-meta text-muted-foreground">Revision</dt><dd className="text-body">None saved</dd></div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"><dt className="text-meta text-muted-foreground">Editing</dt><dd className="text-body">Read-only in this console</dd></div>
              </dl>
            </Card>
            <p className="text-meta text-muted-foreground">With nothing configured, no default is applied: each Worker runs on its own settings.</p>
          </section>
          <section aria-labelledby="worker-title" className="flex flex-col gap-3">
            <div>
              <h2 id="worker-title" className="text-section">Owned by each Worker</h2>
              <p className="text-meta text-muted-foreground">Open a Worker’s Sentinel tab to see its values.</p>
            </div>
            <Card className="gap-0 py-0">
              <dl className="divide-y">
                {WORKER_OWNED.map((w) => (
                  <div key={w.label} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3">
                    <dt className="text-body">{w.label}</dt>
                    <dd className="text-meta text-muted-foreground">{w.where}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </section>
        </div>
      )}
    </SentinelLayout>
  )
}

export function SentinelDimensionPage() {
  const { dimension = '' } = useParams()
  const d = DIMENSIONS.find((x) => x.key === dimension)
  const { data } = useSentinel().overview
  if (!d) return <Navigate to="/sentinel" replace />
  const dim = data?.dimensions.find((x) => x.key === d.key)
  return (
    <SentinelLayout view="" title={d.name} crumbs={[{ label: 'Sentinel', to: '/sentinel' }, { label: d.name }]}>
      <Card className="gap-0 py-0">
        <div className="p-6">
          <p className="text-overline text-muted-foreground uppercase">{d.question}</p>
          <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed">{d.purpose}</p>
        </div>
        <FactList className="border-t px-6 py-4">
          <Fact label="Open">{dim ? openPhrase(dim.open) : 'Not reported'}</Fact>
          <Fact label="Applies">{dim?.mode.acting ? 'Yes' : 'No'}{dim?.mode.why && <span className="block text-meta text-muted-foreground">{dim.mode.why}</span>}</Fact>
          <Fact label="Last">{dim?.last ? dim.last.title : 'Nothing recorded yet'}</Fact>
        </FactList>
      </Card>
      <section aria-labelledby="panel-title" className="flex flex-col gap-3">
        <h2 id="panel-title" className="text-section">{d.panel}</h2>
        <EmptyState icon={Radar} title={d.empty} description="Checks show up here once they’re measured." />
      </section>
    </SentinelLayout>
  )
}
