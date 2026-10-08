import { Navigate, useParams } from 'react-router'
import { Gavel, Radar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getSentinelOverview } from '@/lib/api/catalog'
import { DIMENSIONS, openPhrase } from './sentinel-model'
import { SentinelLayout } from './sentinel-layout'

export function SentinelPolicyPage() {
  const { data } = useResource('sentinel-overview', (signal) => getSentinelOverview({ signal }))
  return (
    <SentinelLayout view="policy">
      {!data ? (
        <Skeleton className="h-48" />
      ) : !data.viewer.admin ? (
        <EmptyState icon={Gavel} title="Platform policy is available to administrators" />
      ) : (
        <Card className="gap-3 p-6">
          <p className="text-overline text-muted-foreground uppercase">Platform policy · defaults, no revision saved</p>
          <h2 className="text-section">The platform sets no bounds, managed values or directives</h2>
          <p className="text-body text-muted-foreground">Rules are grouped by the one dimension that owns each setting. Platform policy can only tighten a Worker: Worker settings are clamped to platform bounds. Read-only here; editing arrives with policy v2.</p>
        </Card>
      )}
    </SentinelLayout>
  )
}

export function SentinelDimensionPage() {
  const { dimension = '' } = useParams()
  const d = DIMENSIONS.find((x) => x.key === dimension)
  const { data } = useResource('sentinel-overview', (signal) => getSentinelOverview({ signal }))
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
        <EmptyState icon={Radar} title={d.empty} description="What this dimension checks is listed as it is measured. Until then every check reads “Not measured”, never as a pass." />
      </section>
    </SentinelLayout>
  )
}
