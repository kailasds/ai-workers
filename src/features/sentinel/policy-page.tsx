import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatPolicyValue, OVERRIDE_LABELS, POLICY_LABELS, policyImpact, validateOverride, validatePolicy } from './demo/engine'
import { WORKERS, workerLabel } from './demo/platform'
import { actions, useDemo } from './demo/store'
import { overrideText } from './demo/selectors'
import type { Control, OverrideField, Policy } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { ActionDialog, AgreementLink, Section, WorkerLink, type ActionSpec } from './ui'

const KIND_LABEL: Record<Control['kind'], string> = { admin_stop: 'Stopped by administrator', harness_block: 'Harness block', sharing_suspension: 'Sharing suspended', recording_only: 'Recording-only mode' }
const LINK = 'text-primary-strong underline-offset-4 hover:underline'

const HELP: Record<keyof Policy, string> = {
  mode: 'Recording only: Sentinel writes its decisions down but doesn’t apply them. Enforce: they take effect.',
  sharingEnabled: 'Lets Workers in the same pool share knowledge, after approval.',
  requireReceiverApproval: 'The receiving side must approve before anything is delivered.',
  minIndependentWorkers: 'How many Workers must find the same thing before it can be shared.',
  costPerRunLimit: 'Sentinel flags Workers whose average cost per run is above this.',
  suspendSharingOnStop: 'Stopping a Worker also suspends its agreed and active sharing.',
}

function NextStep({ c }: { c: Control }) {
  if (c.kind === 'admin_stop') return <>Resume from the Worker: <WorkerLink id={c.workerIds[0]} /></>
  if (c.kind === 'sharing_suspension' && c.agreementId) return <AgreementLink id={c.agreementId}>Open the agreement to resume or revoke</AgreementLink>
  if (c.kind === 'recording_only') return <a href="#defaults" className={LINK}>Change the mode under Platform defaults</a>
  return <span className="text-muted-foreground">Not changeable here</span>
}

/** Platform policy: what is in force, the defaults (editable), Workers' own settings, and revisions. */
export function SentinelPolicyPage() {
  const s = useDemo()
  const [draft, setDraft] = useState<Policy | null>(null)
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const [adding, setAdding] = useState<{ workerId: string; field: OverrideField; value: string } | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const active = s.controls.filter((c) => c.active)
  const lifted = s.controls.filter((c) => !c.active)
  const current = s.revisions.at(-1)
  const errors = draft ? validatePolicy(draft) : {}
  const edit = <K extends keyof Policy>(k: K, v: Policy[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))
  const changed = draft ? (Object.keys(draft) as (keyof Policy)[]).filter((k) => draft[k] !== s.policy[k]) : []

  const field = (k: keyof Policy, control: React.ReactNode) => (
    <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-4">
      <div>
        <p className="text-body" id={`p-${k}`}>{POLICY_LABELS[k]}</p>
        <p className="text-meta text-muted-foreground">{HELP[k]}</p>
      </div>
      <div className="flex flex-col gap-1 sm:items-start">
        {draft ? control : <span className="text-body">{formatPolicyValue(k, s.policy[k])}</span>}
        {draft && errors[k] && <p className="text-meta text-destructive">{errors[k]}</p>}
      </div>
    </div>
  )

  return (
    <SentinelLayout view="policy">
      <Card className="gap-0 py-0">
        <dl className="grid divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-3"><dt className="text-meta text-muted-foreground">Mode</dt><dd className="text-item">{formatPolicyValue('mode', s.policy.mode)}</dd></div>
          <div className="px-5 py-3"><dt className="text-meta text-muted-foreground">Sharing</dt><dd className="text-item">{s.policy.sharingEnabled ? 'On' : 'Off'}</dd></div>
          <div className="px-5 py-3"><dt className="text-meta text-muted-foreground">Active revision</dt><dd className="text-item">{current ? `Revision ${current.rev}` : 'None saved'}</dd>{current && <dd className="text-meta text-muted-foreground"><Timestamp iso={current.at} /></dd>}</div>
          <div className="px-5 py-3"><dt className="text-meta text-muted-foreground">Workers with own settings</dt><dd className="text-item">{new Set(s.overrides.map((o) => o.workerId)).size}</dd></div>
        </dl>
      </Card>

      <Section id="controls" title={`Controls in force (${active.length})`}>
        {active.length === 0 ? <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No controls are in force.</p> : (
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {active.map((c) => (
                <li key={c.id} className="grid gap-2 px-5 py-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-item"><StatusBadge tone={c.kind === 'admin_stop' ? 'danger' : c.kind === 'recording_only' ? 'neutral' : 'warning'}>{KIND_LABEL[c.kind]}</StatusBadge>{c.title}</p>
                    <p className="text-meta text-muted-foreground">{c.what} Scope: {c.scope}.{c.workerIds.length ? <> Affects {c.workerIds.map((w, i) => <span key={w}>{i > 0 && ', '}<WorkerLink id={w} /></span>)}.</> : ''}</p>
                    <p className="text-meta">Why: {c.reason}</p>
                    <p className="text-meta text-muted-foreground">By {c.by} · since <Timestamp iso={c.since} />{c.decisionId && <> · <Link to={`/sentinel/decisions/${c.decisionId}`} className={LINK}>{c.decisionId}</Link></>}</p>
                  </div>
                  <p className="text-meta md:text-right"><NextStep c={c} /></p>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {lifted.length > 0 && (
          <Collapsible className="rounded-block border">
            <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-2.5 text-left text-meta outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Lifted controls ({lifted.length})<ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="divide-y border-t">{lifted.map((c) => <li key={c.id} className="px-4 py-2.5 text-meta">{KIND_LABEL[c.kind]}: {c.title} · <Timestamp iso={c.since} /> to <Timestamp iso={c.liftedAt} />{c.decisionId && <> · <Link to={`/sentinel/decisions/${c.decisionId}`} className={LINK}>{c.decisionId}</Link></>}</li>)}</ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </Section>

      <Section
        id="defaults"
        title="Platform defaults"
       
        aside={!draft && <Button variant="outline" onClick={() => setDraft({ ...s.policy })}><Pencil aria-hidden="true" />Edit</Button>}
      >
        <Card className="gap-0 py-0">
          <div className="divide-y">
            {field('mode', (
              <Select value={draft?.mode} onValueChange={(v) => edit('mode', v as Policy['mode'])}>
                <SelectTrigger className="w-56" aria-labelledby="p-mode"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="recording_only">Recording only</SelectItem><SelectItem value="enforce">Enforce</SelectItem></SelectContent>
              </Select>
            ))}
            {field('sharingEnabled', <Switch checked={draft?.sharingEnabled} onCheckedChange={(v) => edit('sharingEnabled', v)} aria-labelledby="p-sharingEnabled" />)}
            {field('requireReceiverApproval', <Switch checked={draft?.requireReceiverApproval} onCheckedChange={(v) => edit('requireReceiverApproval', v)} aria-labelledby="p-requireReceiverApproval" />)}
            {field('suspendSharingOnStop', <Switch checked={draft?.suspendSharingOnStop} onCheckedChange={(v) => edit('suspendSharingOnStop', v)} aria-labelledby="p-suspendSharingOnStop" />)}
            {field('minIndependentWorkers', <Input type="number" min={2} max={10} className="w-28" value={draft?.minIndependentWorkers ?? ''} onChange={(e) => edit('minIndependentWorkers', Number(e.target.value))} aria-labelledby="p-minIndependentWorkers" aria-invalid={Boolean(errors.minIndependentWorkers)} />)}
            {field('costPerRunLimit', (
              <div className="flex items-center gap-2">
                <Switch checked={draft?.costPerRunLimit !== null} onCheckedChange={(v) => edit('costPerRunLimit', v ? 22 : null)} aria-label="Set a cost limit" />
                {draft?.costPerRunLimit !== null && <Input type="number" min={0.01} step={0.01} className="w-28" value={draft?.costPerRunLimit ?? ''} onChange={(e) => edit('costPerRunLimit', e.target.value === '' ? 0 : Number(e.target.value))} aria-labelledby="p-costPerRunLimit" aria-invalid={Boolean(errors.costPerRunLimit)} />}
                <span className="text-meta text-muted-foreground">{draft?.costPerRunLimit === null ? 'No limit' : 'USD per run'}</span>
              </div>
            ))}
          </div>
          {draft && (
            <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3">
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
              <span className="text-meta text-muted-foreground">{changed.length === 0 ? 'No changes yet.' : `${changed.length} ${changed.length === 1 ? 'change' : 'changes'}.`}</span>
            </div>
          )}
        </Card>
      </Section>

      <Section id="overrides" title="Workers’ own settings" aside={!adding && <Button variant="outline" onClick={() => setAdding({ workerId: WORKERS[0].composition_id, field: 'costPerRunLimit', value: '' })}><Plus aria-hidden="true" />Add</Button>}>
        {adding && (
          <Card className="gap-3 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-worker">Worker</Label>
                <Select value={adding.workerId} onValueChange={(v) => setAdding({ ...adding, workerId: v })}>
                  <SelectTrigger id="ov-worker" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{WORKERS.map((w) => <SelectItem key={w.composition_id} value={w.composition_id}>{workerLabel(w.composition_id)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-field">Setting</Label>
                <Select value={adding.field} onValueChange={(v) => setAdding({ ...adding, field: v as OverrideField, value: '' })}>
                  <SelectTrigger id="ov-field" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(OVERRIDE_LABELS) as OverrideField[]).map((f) => <SelectItem key={f} value={f}>{OVERRIDE_LABELS[f]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ov-value">Value</Label>
                {adding.field === 'costPerRunLimit' ? (
                  <Input id="ov-value" type="number" min={0.01} step={0.01} value={adding.value} onChange={(e) => setAdding({ ...adding, value: e.target.value })} aria-invalid={Boolean(addError)} />
                ) : (
                  <Select value={adding.value} onValueChange={(v) => setAdding({ ...adding, value: v })}>
                    <SelectTrigger id="ov-value" className="w-full"><SelectValue placeholder="Choose" /></SelectTrigger>
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
                  setSpec({ title: `Own setting for ${workerLabel(a.workerId)}`, consequences: [`${OVERRIDE_LABELS[a.field]}: ${overrideText(a.field, a.value)} for this Worker only.`, 'It stays when the platform default changes.'], confirmLabel: 'Save setting', run: (r) => { const res = actions.setOverride({ ...a, reason: r }); if (res.ok) setAdding(null); return res }, done: 'Setting saved' })
                }}
              >
                Review and save…
              </Button>
              <Button variant="outline" onClick={() => { setAdding(null); setAddError(null) }}>Cancel</Button>
            </div>
          </Card>
        )}
        {s.overrides.length === 0 ? <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">No Worker has its own settings.</p> : (
          <Card className="gap-0 overflow-x-auto py-0">
            <table className="w-full text-left text-body">
              <caption className="sr-only">Workers’ own settings</caption>
              <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                <tr><th scope="col" className="px-4 py-2.5 font-medium">Worker</th><th scope="col" className="px-4 py-2.5 font-medium">Setting</th><th scope="col" className="px-4 py-2.5 font-medium">Platform default</th><th scope="col" className="px-4 py-2.5 font-medium">Its own</th><th scope="col" className="px-4 py-2.5"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="divide-y">
                {s.overrides.map((o) => (
                  <tr key={`${o.workerId}:${o.field}`}>
                    <td className="px-4 py-2.5"><WorkerLink id={o.workerId} /><span className="block text-meta text-muted-foreground">{o.reason}</span></td>
                    <td className="px-4 py-2.5">{OVERRIDE_LABELS[o.field]}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatPolicyValue(o.field, s.policy[o.field])}</td>
                    <td className="px-4 py-2.5 font-medium">{overrideText(o.field, o.value)}</td>
                    <td className="px-4 py-2.5 text-right"><Button variant="ghost" size="sm" onClick={() => setSpec({ title: 'Remove own setting', consequences: [`${workerLabel(o.workerId)} will follow the platform default: ${formatPolicyValue(o.field, s.policy[o.field])}.`], confirmLabel: 'Remove', destructive: true, run: (r) => actions.removeOverride(o.workerId, o.field, r), done: 'Setting removed' })}>Remove…</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Section>

      <Section id="revisions" title="Revisions">
        <Card className="gap-0 py-0">
          <ol className="divide-y">
            {[...s.revisions].reverse().map((r, i) => (
              <li key={r.rev} className="px-5 py-3">
                <p className="flex flex-wrap items-center gap-2 text-item">Revision {r.rev}{i === 0 && <StatusBadge tone="success">In force</StatusBadge>}</p>
                <p className="text-meta text-muted-foreground"><Timestamp iso={r.at} /> · {r.by} · {r.reason}{r.decisionId && <> · <Link to={`/sentinel/decisions/${r.decisionId}`} className={LINK}>{r.decisionId}</Link></>}</p>
                <ul className="mt-1 text-meta">{r.changes.map((c) => <li key={c.field}>{POLICY_LABELS[c.field]}: <span className="text-muted-foreground">{c.from}</span> → {c.to}</li>)}</ul>
              </li>
            ))}
          </ol>
        </Card>
      </Section>
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelLayout>
  )
}
