import { useNavigate } from 'react-router'
import { FlaskConical, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { actions, isPersisted } from './demo/store'
import { AgreementSheet, WorkerSheet } from './sheets'

const SENTINEL_VIEWS = [
  { value: 'overview', label: 'Overview', to: '/sentinel' },
  { value: 'sharing', label: 'Sharing', to: '/sentinel/sharing' },
  { value: 'decisions', label: 'Decisions', to: '/sentinel/decisions' },
  { value: 'policy', label: 'Policy', to: '/sentinel/policy' },
]

/** Says once, on every Sentinel page, that governance here is a simulation, and offers a reset. */
function DemoNotice() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-block border border-dashed px-4 py-2.5 text-meta text-muted-foreground">
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

// Section pages sit inside the Brain hub, which carries the header; a decision's page stands
// alone with its own header and breadcrumb. Worker and agreement drawers open from either.
export function SentinelLayout({ view, title = 'Sentinel', crumbs, children, utilities }: { view: string; title?: string; crumbs?: Crumb[]; children: React.ReactNode; utilities?: React.ReactNode }) {
  const navigate = useNavigate()
  const shared = (
    <>
      <WorkerSheet />
      <AgreementSheet />
      <Toaster position="bottom-right" />
    </>
  )
  if (view)
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionNav variant="pills" value={view} onChange={(v) => navigate(SENTINEL_VIEWS.find((x) => x.value === v)!.to)} items={SENTINEL_VIEWS} label="Sentinel" />
          {utilities}
        </div>
        <DemoNotice />
        {children}
        {shared}
      </div>
    )
  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} utilities={utilities} />
      <DemoNotice />
      {children}
      {shared}
    </PageContainer>
  )
}
