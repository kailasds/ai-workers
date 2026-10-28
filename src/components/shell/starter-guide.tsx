import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, PackageCheck, PencilRuler, Send, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HUE, type Hue } from '@/components/platform/hue'
import { cn } from '@/lib/utils'

// The old landing page as a skippable guide: the three things people come to do, in the order
// the work happens. It opens once per browser (and after sign-in, via /home); after that it is
// reopened from the user menu.

const STEPS: { icon: LucideIcon; hue: Hue; title: string; text: string; to: string }[] = [
  { icon: PencilRuler, hue: 'blue', title: 'Compose a Worker', text: 'Define its work, permissions and Definition of Done.', to: '/compose' },
  { icon: PackageCheck, hue: 'amber', title: 'Package a Worker', text: 'Build a versioned Package from a finished Worker.', to: '/packaging' },
  { icon: Send, hue: 'teal', title: 'Deliver to a customer', text: 'Prepare a Package for the customer’s environment.', to: '/customer-delivery' },
]

const SEEN_KEY = 'starter-guide-seen'

function seen() {
  try {
    return localStorage.getItem(SEEN_KEY) === 'true'
  } catch {
    return true
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, 'true')
  } catch {
    /* storage unavailable: it may show again next visit */
  }
}

/** Open state for the guide: open on first visit or when the URL asks (?guide=1), and on demand. */
export function useStarterGuide() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('guide') === '1'
  const [open, setOpen] = useState(() => !seen())
  const close = () => {
    markSeen()
    setOpen(false)
    if (asked) setParams((p) => { const n = new URLSearchParams(p); n.delete('guide'); return n }, { replace: true })
  }
  return { open: open || asked, show: () => setOpen(true), close }
}

export function StarterGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const go = (to: string) => {
    onClose()
    navigate(to)
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-6 p-6 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-page">Get started</DialogTitle>
          <DialogDescription className="sr-only">Pick a place to start.</DialogDescription>
        </DialogHeader>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.to}>
              <button
                type="button"
                onClick={() => go(s.to)}
                className="group flex h-full w-full flex-col gap-4 rounded-xl bg-muted p-5 text-left outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex items-center justify-between">
                  <span aria-hidden="true" className={cn('grid size-12 place-items-center rounded-block [&>svg]:size-6', HUE[s.hue].solid)}><s.icon /></span>
                  <span className="grid size-7 place-items-center rounded-full bg-card text-meta font-medium tabular-nums">{i + 1}</span>
                </span>
                <span>
                  <span className="block text-section">{s.title}</span>
                  <span className="mt-1 block text-body text-muted-foreground">{s.text}</span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-item text-primary-strong">
                  Start
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Skip for now</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
