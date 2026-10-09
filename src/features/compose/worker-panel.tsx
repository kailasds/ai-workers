import { Brain, Building2, Check, ChevronRight, ClipboardCheck, FileText, Fingerprint, Layers, ScanSearch, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import type { Draft } from '@/lib/api/compose'
import { cn } from '@/lib/utils'
import { CHECKPOINTS, checkpointsOf, contextOf, domainOf, identityOf, type CheckpointKey, type StationKey } from './compose-model'
import type { Proposal } from './proposal'

// design.md §7.2: the Worker being composed. A navy head (the one saturated object on the page),
// then — once a draft exists — a white body listing every part and where it stands.

function PanelHead({ pill, ready, title, subtitle }: { pill: string; ready?: boolean; title: string; subtitle?: string | null }) {
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
      <h2 id="worker-panel-title" className="mt-5 text-[1.375rem] leading-7 font-semibold"><span className="sr-only">Worker identity: </span>{title}</h2>
      {subtitle && <p className="mt-1 text-body text-white/80">{subtitle}</p>}
    </div>
  )
}

/** Step 1, before anything is reserved: the identity forming as decisions are made. */
export function DeclarationPanel({ typeLabel, identity, domain, context, identifier }: {
  typeLabel: string | null
  identity: string | null
  domain: string | null
  context: string | null
  identifier: string
}) {
  const ctx = contextOf(context)
  const id = identityOf(identity)
  const pill = ctx ? 'Ready to issue' : id ? 'Assigning' : 'Not started'
  const rows: { label: string; icon: LucideIcon; value: string | null; optional?: boolean }[] = [
    { label: 'Worker type', icon: Layers, value: typeLabel },
    { label: 'Identity', icon: Fingerprint, value: id?.label ?? null },
    { label: 'Business domain', icon: Building2, value: domainOf(domain)?.label ?? null, optional: true },
    { label: 'Bounded context', icon: ScanSearch, value: ctx?.label ?? null },
  ]
  return (
    <section aria-labelledby="worker-panel-title" className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="-m-px">
        <PanelHead pill={pill} ready={Boolean(ctx)} title={id?.label ?? 'Not yet assigned'} subtitle={ctx?.label ?? 'Its identity forms as you decide.'} />
      </div>
      <div className="px-6 pb-5">
        <ul className="-mx-2 flex flex-col pt-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3 border-b px-2 py-3.5">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted"><r.icon className="size-[18px]" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-item font-semibold">{r.label}</span>
                <span className="block truncate text-meta text-muted-foreground" title={r.value ?? undefined}>{r.value ?? (r.optional ? 'None · optional' : 'Not chosen')}</span>
              </span>
              <StateMark state={r.value ? 'done' : 'waiting'} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-overline text-muted-foreground uppercase">Worker identifier</p>
        <p className="mt-1.5 font-mono text-meta break-all text-muted-foreground">{identifier}</p>
      </div>
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

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function summaryOf(station: StationKey, p: Proposal) {
  switch (station) {
    case 'role_identity':
      return p.context?.includes ?? 'Scope set'
    case 'worker_intent':
      return `${p.harness?.display_name ?? 'Generic runtime'} · ${p.procedure.length} stages`
    case 'brain':
      return `${plural(p.skills.length, 'Skill')} · ${plural(p.languages.length, 'DSL')} · ${plural(p.evals.length, 'EVAL')}`
    case 'definition_of_done': {
      const gating = p.rubrics.filter((r) => r.gating_by_default).length
      return `${plural(p.rubrics.length, 'criterion', 'criteria')}, ${gating === p.rubrics.length ? 'all' : gating} gating`
    }
    case 'autonomy':
      return `Level ${p.autonomy.level} · ${p.autonomy.mode.charAt(0).toUpperCase()}${p.autonomy.mode.slice(1)}`
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
export function ComposingPanel({ draft, proposal, current, settled, onGo }: {
  draft: Draft
  proposal: Proposal | null
  current: CheckpointKey | 'summary'
  settled: boolean
  onGo: (k: CheckpointKey | 'summary') => void
}) {
  const ctx = contextOf(draft.context_key)
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
    // Unconfirmed parts show what is proposed; the open ring (not a check) says it is not in the Worker yet.
    const detail =
      state === 'done' ? content
      : state === 'assembling' ? 'Assembling…'
      : state === 'waiting' ? 'Not yet resolved'
      : state === 'attention' ? 'Needs a person'
      : cps.length > 1 ? `${accepted} of ${cps.length} parts confirmed`
      : content
    const target = cps.find((c) => c.key === current)?.key ?? cps.find((c) => !draft.accepted.includes(c.key))?.key ?? cps[0].key
    const reachable = state === 'done' || here || cps.some((c) => c.key === firstOpen) || accepted > 0
    return { ...part, state, detail, target, reachable, here }
  })

  const confirmed = rows.filter((r) => r.state === 'done').length

  return (
    <section aria-labelledby="worker-panel-title" className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="-m-px">
        <PanelHead pill={`Revision ${draft.revision}`} title={identityOf(draft.identity_key)?.label ?? draft.name} subtitle={ctx?.label} />
      </div>
      <div className="px-6 pb-2">
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
            <p className="text-meta font-semibold tabular-nums">{confirmed} of {rows.length} sections confirmed</p>
          </div>
          <Progress value={(confirmed / rows.length) * 100} aria-label={`${confirmed} of ${rows.length} sections confirmed`} className="mt-3 h-1.5 bg-muted" />
        </div>

        <ul className="-mx-6 flex flex-col">
          {rows.map((r) => {
            const inner = (
              <>
                <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-xl text-foreground', r.here ? 'bg-card' : 'bg-muted')}>
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
              <li key={r.station} className={cn('border-b last:border-b-0', r.here && 'bg-muted')}>
                {r.reachable && !r.here ? (
                  <button type="button" onClick={() => onGo(r.target)} className="flex w-full items-center gap-3 px-6 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">{inner}</button>
                ) : (
                  <div className="flex items-center gap-3 px-6 py-3.5" aria-current={r.here ? 'step' : undefined}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
