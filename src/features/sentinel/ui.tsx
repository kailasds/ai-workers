import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/platform/status-badge'
import { cn } from '@/lib/utils'
import type { Result } from './demo/engine'
import { workerLabel } from './demo/platform'
import { OPERATIONAL_LABEL, OUTCOME_LABEL, type Operational } from './demo/selectors'
import type { AgreementStatus, Outcome } from './demo/types'

// Shared Sentinel building blocks: one status vocabulary, one way to confirm a consequential
// action, and one way to open a Worker or agreement from anywhere.

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const OUTCOME_TONE: Record<Outcome, Tone> = { applied: 'success', pending: 'warning', requested: 'info', blocked: 'danger', failed: 'danger', recorded: 'neutral' }
export const OutcomePill = ({ outcome }: { outcome: Outcome }) => <StatusBadge tone={OUTCOME_TONE[outcome]}>{OUTCOME_LABEL[outcome]}</StatusBadge>

const AGREEMENT_LABEL: Record<AgreementStatus, string> = { proposed: 'Proposed', agreed: 'Agreed', active: 'Active', suspended: 'Suspended', revoked: 'Revoked', rejected: 'Rejected' }
const AGREEMENT_TONE: Record<AgreementStatus, Tone> = { proposed: 'warning', agreed: 'info', active: 'success', suspended: 'warning', revoked: 'neutral', rejected: 'neutral' }
export const AgreementPill = ({ status }: { status: AgreementStatus }) => <StatusBadge tone={AGREEMENT_TONE[status]}>{AGREEMENT_LABEL[status]}</StatusBadge>

const OP_TONE: Record<Operational, Tone> = { running: 'success', stopped: 'danger', not_running: 'neutral' }
export const OperationalPill = ({ op }: { op: Operational }) => <StatusBadge tone={OP_TONE[op]}>{OPERATIONAL_LABEL[op]}</StatusBadge>

/** Opens the Worker governance drawer, keeping the current page and filters. */
export function WorkerLink({ id, className }: { id: string; className?: string }) {
  const [params] = useSearchParams()
  const next = new URLSearchParams(params)
  next.set('worker', id)
  return (
    <Link to={{ search: next.toString() }} preventScrollReset className={cn('rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring', className)}>
      {workerLabel(id)}
    </Link>
  )
}

/** Opens the agreement drawer from anywhere in Sentinel. */
export function AgreementLink({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const [params] = useSearchParams()
  const next = new URLSearchParams(params)
  next.set('agreement', id)
  return (
    <Link to={{ search: next.toString() }} preventScrollReset className={cn('rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring', className)}>
      {children}
    </Link>
  )
}

export function Section({ id, title, aside, children }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id={`${id}-title`} className="text-section">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export interface ActionSpec {
  title: string
  /** What will change, said before anything happens. */
  consequences: string[]
  confirmLabel: string
  destructive?: boolean
  run: (reason: string) => Result
  done: string
}

/**
 * The one confirmation for consequential actions: what will change, a required reason, and the
 * real result. The change is simulated in this browser; the dialog says so.
 */
export function ActionDialog({ spec, onClose }: { spec: ActionSpec | null; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const reasonId = useId()
  const close = () => {
    setReason('')
    setError(null)
    onClose()
  }
  return (
    <Dialog open={Boolean(spec)} onOpenChange={(o) => !o && close()}>
      {spec && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-section">{spec.title}</DialogTitle>
            <DialogDescription className="sr-only">What will change, and a reason to record.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-body">{spec.consequences.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={reasonId}>Reason</Label>
            <Textarea id={reasonId} rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} aria-describedby={`${reasonId}-hint`} aria-invalid={Boolean(error)} />
            {error && <p id={`${reasonId}-hint`} className="text-meta text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              variant={spec.destructive ? 'destructive' : 'default'}
              onClick={() => {
                const r = spec.run(reason)
                if (!r.ok) return setError(r.error)
                toast.success(spec.done, { description: r.decisionId ? `Recorded as ${r.decisionId}.` : undefined })
                close()
              }}
            >
              {spec.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
