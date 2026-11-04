import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { useDemo } from './demo/store'
import { SentinelBanner, type SentinelView } from './sentinel-banner'
import { AgreementSheet, ControlSheet, WorkerSheet } from './sheets'

function Drawers() {
  return (
    <>
      <WorkerSheet />
      <AgreementSheet />
      <ControlSheet />
    </>
  )
}

/**
 * A Sentinel section inside the Brain hub: the banner (the selected area's summary over the five
 * areas as tabs), then the section. Worker, agreement and control drawers open over any section.
 */
export function SentinelLayout({ view, children }: { view: SentinelView; children: React.ReactNode }) {
  useDemo()
  return (
    <div className="flex flex-col gap-5">
      <SentinelBanner view={view} />
      {children}
      <Drawers />
    </div>
  )
}

/** A page of its own (a decision): breadcrumb and header, then the content. */
export function SentinelPage({ title, crumbs, children }: { title: string; crumbs: Crumb[]; children: React.ReactNode }) {
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} />
      {children}
      <Drawers />
    </PageContainer>
  )
}
