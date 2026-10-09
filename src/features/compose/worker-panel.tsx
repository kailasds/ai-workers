import { Brain, Check, ChevronRight, ClipboardCheck, FileText, Fingerprint, PackageCheck, ScanSearch, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import type { Draft } from '@/lib/api/compose'
import type { Operation } from '@/lib/operations'
import { cn } from '@/lib/utils'
import { CHECKPOINTS, checkpointsOf, contextOf, domainOf, identityOf, type CheckpointKey, type StationKey } from './compose-model'
import type { Proposal } from './proposal'

// design.md §7.2: the Worker being composed. A navy head (the one saturated object on the page),
// then — once a draft exists — a white body listing every part and where it stands.

function PanelHead({ pill, ready, title, subtitle, children }: { pill: string; ready?: boolean; title: string; subtitle?: string | null; children?: React.ReactNode }) {
  return (
    <div className="bg-identity p-6 text-identity-foreground">
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-white/20">
          <Fingerprint className="size-6" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-meta font-medium">
          {ready !== undefined && <span aria-hidden="true" className={cn('size-1.5 rounded-full', ready ? 'bg-[#4ADE80]' : 'bg-white/70')} />}
          {pill}
        </span>
      </div>
      <p className="mt-5 text-overline text-white/75 uppercase">Worker identity</p>
      <h2 id="worker-panel-title" className="mt-1 text-[1.375rem] leading-7 font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-body text-white/80">{subtitle}</p>}
      {children}
    </div>
  )
}

function NavyRow({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className={cn('border-t border-white/15 py-3.5', mono ? 'flex flex-col gap-1.5' : 'flex items-baseline justify-between gap-4')}>
      <dt className="shrink-0 text-body text-white/75">{label}</dt>
      <dd className={cn(mono ? 'font-mono text-meta break-all' : 'min-w-0 truncate text-right text-body font-semibold')}>{children}</dd>
    </div>
  )
}

/** Step 1, before anything is reserved: the identity forming as decisions are made. */
export function DeclarationPanel({ typeLabel, identity, domain, geography, context, identifier, footer }: {
  typeLabel: string | null
  identity: string | null
  domain: string | null
  geography: string | null
  context: string | null
  identifier: string
  footer?: React.ReactNode
}) {
  const ctx = contextOf(context)
  const id = identityOf(identity)
  const pill = ctx ? 'Ready to issue' : id ? 'Assigning' : 'Not started'
  return (
    <section aria-labelledby="worker-panel-title" className="overflow-hidden rounded-xl shadow-sm">
      <PanelHead pill={pill} ready={Boolean(ctx)} title={id?.label ?? 'Not yet assigned'}>
        <dl className="mt-6">
          <NavyRow label="Worker type">{typeLabel ?? 'Not chosen'}</NavyRow>
          <NavyRow label="Identity">{id?.label ?? 'Not assigned'}</NavyRow>
          <NavyRow label="Business domain">{domainOf(domain)?.label ?? 'None'}</NavyRow>
          <NavyRow label="Geography">{geography ?? 'Not stated'}</NavyRow>
          <NavyRow label="Bounded context"><span title={ctx?.label}>{ctx?.label ?? 'Not chosen'}</span></NavyRow>
          <NavyRow label="Worker identifier" mono>{identifier}</NavyRow>
        </dl>
        <p className="border-t border-white/15 pt-4 text-meta text-white/75">
          {ctx ? 'The identity is reserved when you confirm. Everything after this attaches to it.' : id ? 'Choose where its work stops to complete the identity.' : 'Assign an identity to see which scopes it entitles.'}
        </p>
        {footer}
      </PanelHead>
    </section>
  )
}

type PartState = 'done' | 'assembling' | 'proposed' | 'attention' | 'waiting'

const PARTS: { station: StationKey; label: string; icon: LucideIcon }[] = [
  { station: 'role_identity', label: 'Bounded context', icon: ScanSearch },
  { station: 'worker_intent', label: 'Worker intent', icon: FileText },
  { station: 'brain', label: 'Worker Brain', icon: Brain },
  { station: 'definition_of_done', label: 'Definition of Done', icon: ClipboardCheck },
  { station: 'autonomy', label: 'Autonomy', icon: ShieldCheck },
]

function summaryOf(station: StationKey, p: Proposal) {
  switch (station) {
    case 'role_identity':
      return `${p.context?.includes ?? 'Scope'} · ${p.context?.excludes.length ?? 0} refused`
    case 'worker_intent':
      return `${p.harness?.display_name ?? 'Generic runtime'} · ${p.procedure.length} stages · ${p.models.routing} models`
    case 'brain':
      return `${p.skills.length} Skills · ${p.languages.length} DSL · ${p.evals.length} EVALs · memory`
    case 'definition_of_done': {
      const gating = p.rubrics.filter((r) => r.gating_by_default).length
      return `${p.rubrics.length} criteria · ${gating} stop a release`
    }
    case 'autonomy':
      return `Level ${p.autonomy.level} · ${p.autonomy.mode} · Sentinel in shadow`
    default:
      return ''
  }
}

function StateMark({ state }: { state: PartState }) {
  if (state === 'done')
    return (
      <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">Confirmed</span>
      </span>
    )
  if (state === 'assembling') return <Spinner className="size-5 text-primary" aria-label="Assembling" />
  if (state === 'attention')
    return (
      <span className="grid size-6 place-items-center">
        <TriangleAlert className="size-5 text-warning" aria-hidden="true" />
        <span className="sr-only">Needs attention</span>
      </span>
    )
  return (
    <span className={cn('size-6 rounded-full border-2', state === 'proposed' ? 'border-primary' : 'border-border')}>
      <span className="sr-only">{state === 'proposed' ? 'Proposed, not confirmed' : 'Not started'}</span>
    </span>
  )
}

/** Steps 1–6 once the draft exists: what the Worker is made of so far. */
export function ComposingPanel({ draft, proposal, current, settled, buildOp, onGo }: {
  draft: Draft
  proposal: Proposal | null
  current: CheckpointKey | 'summary'
  settled: boolean
  buildOp?: Operation
  onGo: (k: CheckpointKey | 'summary') => void
}) {
  const ctx = contextOf(draft.context_key)
  const done = draft.accepted.length
  const firstOpen = CHECKPOINTS.find((c) => !draft.accepted.includes(c.key))?.key

  const rows = PARTS.map((part) => {
    const cps = checkpointsOf(part.station)
    const accepted = cps.filter((c) => draft.accepted.includes(c.key)).length
    const here = cps.some((c) => c.key === current)
    const state: PartState =
      accepted === cps.length ? 'done'
      : cps.some((c) => draft.attention.includes(c.key) && !draft.accepted.includes(c.key)) ? 'attention'
      : here && !settled ? 'assembling'
      : here || accepted > 0 ? 'proposed'
      : 'waiting'
    const content = proposal ? summaryOf(part.station, proposal) : 'Reading the catalogue…'
    const detail =
      state === 'done' ? content
      : state === 'assembling' ? 'Assembling…'
      : state === 'waiting' ? 'Not yet assembled'
      : state === 'attention' ? 'Needs a person before it can be confirmed'
      : cps.length > 1 ? `${accepted} of ${cps.length} confirmed · ${content}`
      : `Proposed · ${content}`
    const target = cps.find((c) => c.key === current)?.key ?? cps.find((c) => !draft.accepted.includes(c.key))?.key ?? cps[0].key
    const reachable = state === 'done' || here || cps.some((c) => c.key === firstOpen) || accepted > 0
    return { ...part, state, detail, target, reachable, here }
  })

  const packaged = Boolean(draft.package)
  const building = buildOp && (buildOp.state === 'RUNNING' || buildOp.state === 'QUEUED')

  return (
    <section aria-labelledby="worker-panel-title" className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="-m-px">
        <PanelHead pill={`Revision ${draft.revision}`} title={identityOf(draft.identity_key)?.label ?? draft.name} subtitle={ctx?.label} />
      </div>
      <div className="px-6 pb-4">
        <Collapsible className="border-b">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 py-4 text-left text-item outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ChevronRight className="size-4 transition-transform group-data-[state=open]:rotate-90" aria-hidden="true" />
            Identity detail
          </CollapsibleTrigger>
          <CollapsibleContent>
            <dl className="flex flex-col gap-3 pb-4 text-body">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Worker</dt><dd className="min-w-0 truncate text-right">{draft.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Business domain</dt><dd>{domainOf(draft.business_domain_key)?.label ?? 'None'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Identity</dt><dd>{draft.identity.status === 'PROVISIONED' ? 'Reserved, not issued' : draft.identity.status.toLowerCase()}</dd></div>
              <div className="flex flex-col gap-1"><dt className="text-muted-foreground">Bounded scope</dt><dd className="font-mono text-meta break-all">{draft.identity.bounded_scope}</dd></div>
            </dl>
          </CollapsibleContent>
        </Collapsible>

        <div className="py-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-overline text-muted-foreground uppercase">Package progress</p>
            <p className="text-meta font-semibold tabular-nums">{done} of {CHECKPOINTS.length} confirmed</p>
          </div>
          <Progress value={(done / CHECKPOINTS.length) * 100} aria-label={`${done} of ${CHECKPOINTS.length} checkpoints confirmed`} className="mt-3 h-1.5 bg-muted" />
        </div>

        <ul className="-mx-2 flex flex-col">
          {rows.map((r) => {
            const inner = (
              <>
                <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-xl', r.here ? 'bg-primary-soft text-primary' : 'bg-muted text-foreground')}>
                  <r.icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-item font-semibold">{r.label}</span>
                  <span className="block truncate text-meta text-muted-foreground" title={r.detail}>{r.detail}</span>
                </span>
                <StateMark state={r.state} />
              </>
            )
            return (
              <li key={r.station} className="border-b last:border-b-0">
                {r.reachable && !r.here ? (
                  <button type="button" onClick={() => onGo(r.target)} className="flex w-full items-center gap-3 rounded-lg px-2 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">{inner}</button>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-3.5" aria-current={r.here ? 'step' : undefined}>{inner}</div>
                )}
              </li>
            )
          })}
          <li>
            <div className="flex items-center gap-3 px-2 py-3.5">
              <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-xl', current === 'summary' ? 'bg-primary-soft text-primary' : 'bg-muted text-foreground')}>
                <PackageCheck className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-item font-semibold">Package</span>
                <span className="block truncate text-meta text-muted-foreground">
                  {packaged ? `Packaged at revision ${draft.package?.composition_revision}` : building ? `Building · ${buildOp?.phase}` : done === CHECKPOINTS.length ? 'Ready to build' : 'Built once every part is confirmed'}
                </span>
              </span>
              <StateMark state={packaged ? 'done' : building ? 'assembling' : 'waiting'} />
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}
