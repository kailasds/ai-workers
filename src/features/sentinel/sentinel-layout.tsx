import { useNavigate } from 'react-router'
import { DataSource } from '@/components/platform/data-source'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { SENTINEL_VIEWS } from './sentinel-model'

type Source = React.ComponentProps<typeof DataSource>

// Section pages (view set) sit inside the Brain hub, which carries the header; a detail page
// (no view) stands alone with its own header and breadcrumb. One line says where figures come from.
export function SentinelLayout({ view, title = 'Sentinel', crumbs, children, utilities, source }: { view: string; title?: string; crumbs?: Crumb[]; children: React.ReactNode; utilities?: React.ReactNode; source?: Source }) {
  const navigate = useNavigate()
  if (view)
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionNav variant="pills" value={view} onChange={(v) => navigate(SENTINEL_VIEWS.find((x) => x.value === v)!.to)} items={SENTINEL_VIEWS} label="Sentinel" />
            {utilities}
          </div>
          {source && <DataSource {...source} />}
        </div>
        {children}
      </div>
    )
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} utilities={utilities} />
      {source && <DataSource {...source} />}
      {children}
    </PageContainer>
  )
}
