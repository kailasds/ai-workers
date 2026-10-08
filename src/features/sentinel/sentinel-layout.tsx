import { useNavigate } from 'react-router'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { SENTINEL_VIEWS } from './sentinel-model'

export function SentinelLayout({ view, title = 'Sentinel', crumbs, children, utilities }: { view: string; title?: string; crumbs?: Crumb[]; children: React.ReactNode; utilities?: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} description="Oversight across every Worker. Decisions are recorded first; a decision is applied only when the Worker acknowledges it." utilities={utilities} />
      {view && <SectionNav value={view} onChange={(v) => navigate(SENTINEL_VIEWS.find((x) => x.value === v)!.to)} items={SENTINEL_VIEWS} />}
      {children}
    </PageContainer>
  )
}
