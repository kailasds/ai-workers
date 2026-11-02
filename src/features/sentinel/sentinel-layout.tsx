import { useNavigate } from 'react-router'
import { FlaskConical, Gavel, Handshake, LayoutDashboard, Lock, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { actions, isPersisted, useDemo } from './demo/store'
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

/** Says once, on every Sentinel page, that governance here is a simulation, and offers a reset. */
function DemoNotice() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-block border border-dashed px-4 py-2 text-meta text-muted-foreground">
      <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        <span className="font-medium text-foreground">Demo data</span> · simulated, {isPersisted() ? 'saved in this browser' : 'not saved'}, nothing enforced
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm"><RotateCcw aria-hidden="true" />Reset demo data</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the demo data?</AlertDialogTitle>
            <AlertDialogDescription>Every action you took here — stops, approvals, policy changes — is discarded and the starting data comes back.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { actions.reset(); toast.success('Demo data reset') }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Drawers() {
  return (
    <>
      <WorkerSheet />
      <AgreementSheet />
      <ControlSheet />
      <Toaster position="bottom-right" />
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
      <DemoNotice />
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
      <DemoNotice />
      <Drawers />
    </PageContainer>
  )
}
