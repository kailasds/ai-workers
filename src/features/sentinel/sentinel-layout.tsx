import { useNavigate } from 'react-router'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { SENTINEL_VIEWS } from './sentinel-model'

// Section pages (view set) sit inside the Learning hub, which carries the header; a detail page
// (no view) stands alone with its own header and breadcrumb.
export function SentinelLayout({ view, title = 'Sentinel', crumbs, children, utilities }: { view: string; title?: string; crumbs?: Crumb[]; children: React.ReactNode; utilities?: React.ReactNode }) {
  const navigate = useNavigate()
  if (view)
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionNav variant="pills" value={view} onChange={(v) => navigate(SENTINEL_VIEWS.find((x) => x.value === v)!.to)} items={SENTINEL_VIEWS} />
          {utilities}
        </div>
        {children}
      </div>
    )
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} utilities={utilities} />
      {children}
    </PageContainer>
  )
}
