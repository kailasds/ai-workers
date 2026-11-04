import { useNavigate } from 'react-router'
import { Gavel, Handshake, LayoutDashboard, Lock, SlidersHorizontal } from 'lucide-react'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { useDemo } from './demo/store'
import { SentinelBand } from './bands'
import { AgreementSheet, ControlSheet, WorkerSheet } from './sheets'

// Sentinel's five destinations, one question each:
//   Overview      what is the state of governance, and what needs me?
//   Controls      what restrictions are in force, and why?
//   Sharing       what knowledge moves between Workers?
//   Decision log  what was decided, by whom, and can I trust the record?
//   Policies      what rules govern the Workers?
const SENTINEL_VIEWS = [
  { value: 'overview', label: 'Overview', to: '/sentinel', icon: LayoutDashboard },
  { value: 'controls', label: 'Controls', to: '/sentinel/controls', icon: Lock },
  { value: 'sharing', label: 'Sharing', to: '/sentinel/sharing', icon: Handshake },
  { value: 'decisions', label: 'Decision log', to: '/sentinel/decisions', icon: Gavel },
  { value: 'policy', label: 'Policies', to: '/sentinel/policy', icon: SlidersHorizontal },
]

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
 * A Sentinel section inside the Brain hub: Sentinel's figures, its five tabs, then the section. Worker, agreement and control drawers open over any section.
 */
export function SentinelLayout({ view, children }: { view: string; children: React.ReactNode }) {
  const navigate = useNavigate()
  useDemo()
  return (
    <div className="flex flex-col gap-5">
      <SentinelBand />
      <SectionNav variant="pills" value={view} onChange={(v) => navigate(SENTINEL_VIEWS.find((x) => x.value === v)!.to)} items={SENTINEL_VIEWS} label="Sentinel" />
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
