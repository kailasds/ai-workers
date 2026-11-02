import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check, ChevronDown, CircleDollarSign, History, PauseCircle, Pencil, Plus, Share2, ShieldCheck, SlidersHorizontal, Trash2, UserCheck, UserCog, Users, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { IconTile, Panel } from '@/components/platform/panel'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { cn } from '@/lib/utils'
import { formatPolicyValue, OVERRIDE_LABELS, POLICY_LABELS, policyImpact, validateOverride, validatePolicy } from './demo/engine'
import { WORKERS, workerLabel } from './demo/platform'
import { actions, useDemo } from './demo/store'
import { overrideText } from './demo/selectors'
import type { OverrideField, Policy } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { ActionDialog, WorkerLink, type ActionSpec } from './ui'

const ICON: Record<keyof Policy, LucideIcon> = {
  mode: ShieldCheck,
  sharingEnabled: Share2,
  requireReceiverApproval: UserCheck,
  minIndependentWorkers: Users,
  suspendSharingOnStop: PauseCircle,
  costPerRunLimit: CircleDollarSign,
}

const GROUPS: { title: string; fields: (keyof Policy)[] }[] = [
  { title: 'Enforcement', fields: ['mode'] },
  { title: 'Sharing', fields: ['sharingEnabled', 'requireReceiverApproval', 'minIndependentWorkers', 'suspendSharingOnStop'] },
  { title: 'Limits', fields: ['costPerRunLimit'] },
]

/** A setting's value as a pill; "On" carries a check so it doesn't rely on colour. */
function Value({ text }: { text: string }) {
  const on = text === 'On'
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-meta font-medium whitespace-nowrap', on ? 'bg-primary-soft text-primary-strong' : 'bg-chip-neutral text-foreground')}>
      {on && <Check className="size-3.5" aria-hidden="true" />}
      {text}
    </span>
  )
}

/** Platform defaults, Worker-level overrides and revision history. */
export function SentinelPolicyPage() {
  const s = useDemo()
  const [draft, setDraft] = useState<Policy | null>(null)
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const [adding, setAdding] = useState<{ workerId: string; field: OverrideField; value: string } | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const current = s.revisions.at(-1)
  const errors = draft ? validatePolicy(draft) : {}
  const edit = <K extends keyof Policy>(k: K, v: Policy[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))
  const changed = draft ? (Object.keys(draft) as (keyof Policy)[]).filter((k) => draft[k] !== s.policy[k]) : []

  const control = (k: keyof Policy) => {
    if (!draft) return <Value text={formatPolicyValue(k, s.policy[k])} />
    const label = `p-${k}`
    if (k === 'mode')
      return (
        <Select value={draft.mode} onValueChange={(v) => edit('mode', v as Policy['mode'])}>
          <SelectTrigger className="w-44" aria-labelledby={label}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="recording_only">Recording only</SelectItem><SelectItem value="enforce">Enforce</SelectItem></SelectContent>
        </Select>
      )
    if (k === 'minIndependentWorkers') return <Input type="number" min={2} max={10} className="w-20" value={draft.minIndependentWorkers} onChange={(e) => edit('minIndependentWorkers', Number(e.target.value))} aria-labelledby={label} aria-invalid={Boolean(errors.minIndependentWorkers)} />
    if (k === 'costPerRunLimit')
      return (
        <div className="flex items-center gap-2">
          {draft.costPerRunLimit !== null && <Input type="number" min={0.01} step={0.01} className="w-24" value={draft.costPerRunLimit} onChange={(e) => edit('costPerRunLimit', e.target.value === '' ? 0 : Number(e.target.value))} aria-labelledby={label} aria-invalid={Boolean(errors.costPerRunLimit)} />}
          <Switch checked={draft.costPerRunLimit !== null} onCheckedChange={(v) => edit('costPerRunLimit', v ? 22 : null)} aria-label="Limit cost per run" />
        </div>
      )
    return <Switch checked={draft[k] as boolean} onCheckedChange={(v) => edit(k, v as never)} aria-labelledby={label} />
  }

  return (
    <SentinelLayout view="policy">
      <Panel
        id="defaults"
        title="Platform defaults"
        icon={SlidersHorizontal}
        hue="blue"
        flush
        aside={
          <>
            {current && <span className="text-meta text-muted-foreground">Revision {current.rev}</span>}
            {!draft && <Button variant="outline" size="sm" onClick={() => setDraft({ ...s.policy })}><Pencil aria-hidden="true" />Edit</Button>}
          </>
        }
      >
        {GROUPS.map((g) => (
          <section key={g.title} aria-label={g.title} className="border-b last:border-b-0">
            <h3 className="px-5 pt-4 pb-1 text-meta font-semibold tracking-wide text-muted-foreground uppercase">{g.title}</h3>
            <ul>
              {g.fields.map((k) => (
                <li key={k} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <IconTile icon={ICON[k]} hue="blue" size="sm" />
                  <span id={`p-${k}`} className="min-w-0 flex-1 text-body">{POLICY_LABELS[k]}</span>
                  <div className="flex flex-col items-end gap-1">
                    {control(k)}
                    {draft && errors[k] && <p className="text-meta text-destructive">{errors[k]}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {draft && (
          <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-5 py-3">
            <Button
              disabled={changed.length === 0 || Object.keys(errors).length > 0}
              onClick={() =>
                setSpec({
                  title: 'Save platform policy',
                  consequences: [...changed.map((k) => `${POLICY_LABELS[k]}: ${formatPolicyValue(k, s.policy[k])} → ${formatPolicyValue(k, draft[k])}`), ...policyImpact(s, draft)],
                  confirmLabel: `Save as revision ${(current?.rev ?? 0) + 1}`,
                  run: (r) => {
                    const res = actions.savePolicy(draft, r)
                    if (res.ok) setDraft(null)
                    return res
                  },
                  done: 'Policy saved',
                })
              }
            >
              Review and save…
            </Button>
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <span className="text-meta text-muted-foreground">{changed.length === 0 ? 'No changes' : `${changed.length} ${changed.length === 1 ? 'change' : 'changes'}`}</span>
          </div>
        )}
      </Panel>

      <Panel
        id="overrides"
        title="Worker overrides"
        icon={UserCog}
        hue="violet"
        count={s.overrides.length}
        flush
        aside={!adding && <Button variant="outline" size="sm" onClick={() => setAdding({ workerId: WORKERS[0].composition_id, field: 'costPerRunLimit', value: '' })}><Plus aria-hidden="true" />Add</Button>}
      >
        {adding && (
          <div className="flex flex-col gap-3 border-b bg-muted/30 px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-worker">Worker</Label>
                <Select value={adding.workerId} onValueChange={(v) => setAdding({ ...adding, workerId: v })}>
                  <SelectTrigger id="ov-worker" className="w-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>{WORKERS.map((w) => <SelectItem key={w.composition_id} value={w.composition_id}>{workerLabel(w.composition_id)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-field">Setting</Label>
                <Select value={adding.field} onValueChange={(v) => setAdding({ ...adding, field: v as OverrideField, value: '' })}>
                  <SelectTrigger id="ov-field" className="w-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(OVERRIDE_LABELS) as OverrideField[]).map((f) => <SelectItem key={f} value={f}>{OVERRIDE_LABELS[f]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-value">Value</Label>
                {adding.field === 'costPerRunLimit' ? (
                  <Input id="ov-value" type="number" min={0.01} step={0.01} className="bg-card" value={adding.value} onChange={(e) => setAdding({ ...adding, value: e.target.value })} aria-invalid={Boolean(addError)} />
                ) : (
                  <Select value={adding.value} onValueChange={(v) => setAdding({ ...adding, value: v })}>
                    <SelectTrigger id="ov-value" className="w-full bg-card"><SelectValue placeholder="Choose" /></SelectTrigger>
                    <SelectContent>{adding.field === 'mode' ? <><SelectItem value="recording_only">Recording only</SelectItem><SelectItem value="enforce">Enforce</SelectItem></> : <><SelectItem value="true">On</SelectItem><SelectItem value="false">Off</SelectItem></>}</SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {addError && <p className="text-meta text-destructive">{addError}</p>}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const err = validateOverride(adding.field, adding.value)
                  if (err) return setAddError(err)
                  setAddError(null)
                  const a = adding
                  setSpec({ title: `Override for ${workerLabel(a.workerId)}`, consequences: [`${OVERRIDE_LABELS[a.field]}: ${overrideText(a.field, a.value)} for this Worker only.`, 'It stays when the platform default changes.'], confirmLabel: 'Save override', run: (r) => { const res = actions.setOverride({ ...a, reason: r }); if (res.ok) setAdding(null); return res }, done: 'Override saved' })
                }}
              >
                Review and save…
              </Button>
              <Button variant="outline" onClick={() => { setAdding(null); setAddError(null) }}>Cancel</Button>
            </div>
          </div>
        )}
        {s.overrides.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">Every Worker follows the platform defaults.</p> : (
          <ul className="divide-y">
            {s.overrides.map((o) => (
              <li key={`${o.workerId}:${o.field}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                <IconTile icon={ICON[o.field]} hue="violet" size="sm" />
                <div className="min-w-0 flex-1">
                  <WorkerLink id={o.workerId} className="block truncate text-body font-medium" />
                  <span className="text-meta text-muted-foreground" title={o.reason}>{OVERRIDE_LABELS[o.field]}</span>
                </div>
                <div className="flex items-center gap-2 text-meta">
                  <span className="text-muted-foreground line-through decoration-muted-foreground/50" title="Platform default">{formatPolicyValue(o.field, s.policy[o.field])}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <Value text={overrideText(o.field, o.value)} />
                </div>
                <Button variant="ghost" size="icon" aria-label={`Remove override for ${workerLabel(o.workerId)}`} onClick={() => setSpec({ title: 'Remove override', consequences: [`${workerLabel(o.workerId)} will follow the platform default: ${formatPolicyValue(o.field, s.policy[o.field])}.`], confirmLabel: 'Remove', destructive: true, run: (r) => actions.removeOverride(o.workerId, o.field, r), done: 'Override removed' })}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Collapsible className="overflow-hidden rounded-xl border bg-card">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
          <IconTile icon={History} hue="teal" size="sm" />
          <span className="flex flex-1 items-center gap-2 text-item">Revision history<span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{s.revisions.length}</span></span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className="divide-y border-t">
            {[...s.revisions].reverse().map((r, i) => (
              <li key={r.rev} className="flex flex-col gap-2 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-item">Revision {r.rev}</span>
                  {i === 0 && <StatusBadge tone="success">In force</StatusBadge>}
                  <span className="ml-auto text-meta text-muted-foreground" title={r.reason}><Timestamp iso={r.at} /></span>
                  {r.decisionId && <Link to={`/sentinel/decisions/${r.decisionId}`} className="font-mono text-meta text-primary-strong underline-offset-4 hover:underline">{r.decisionId}</Link>}
                </div>
                <ul className="flex flex-wrap gap-2">
                  {r.changes.map((c) => (
                    <li key={c.field} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-meta">
                      <span className="text-muted-foreground">{POLICY_LABELS[c.field]}</span>
                      <span className="font-medium">{c.to}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelLayout>
  )
}
