import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getHarnesses, getSkillLibrary } from '@/lib/api/catalog'
import { listDrafts } from '@/lib/api/compose'
import { recordPreparedDelivery } from '@/lib/api/workers'
import { startOperation, useOperations } from '@/lib/operations'
import { cn } from '@/lib/utils'
import { ChoiceCard } from '../compose/choice-card'
import { proposalFor } from '../compose/proposal'

const STEPS = ['Contents', 'Learning', 'Customer', 'Review'] as const
const PHASES = ['Collect the sealed Package', 'Attach selected learning', 'Arrange container images', 'Write checksums and run folder', 'Record the delivery']

export function DeliveryWizard() {
  const { packageId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const opId = params.get('operation')
  const drafts = useResource('drafts', (signal) => listDrafts({ signal }))
  const catalogs = useResource('compose-catalogs-delivery', async (signal) => {
    const [s, d, e, r, h] = await Promise.all([getSkillLibrary({ signal }), getDslDomains({ signal }), getEvaluations({ signal }), getDodRubrics({ signal }), getHarnesses({ signal })])
    return { skills: s.skills, dsl: d.domains, evals: e.evaluations, rubrics: r.rubrics, harnesses: h.harnesses }
  })
  const ops = useOperations()
  const op = opId ? ops.find((o) => o.id === opId) : undefined

  const draft = drafts.data?.find((d) => d.package?.id === packageId) ?? null
  const holdings = useMemo(() => (draft && catalogs.data ? proposalFor(draft, catalogs.data) : null), [draft, catalogs.data])

  const [step, setStep] = useState(0)
  const [dropped, setDropped] = useState<Set<string>>(new Set())
  const [include, setInclude] = useState<Set<string>>(new Set())
  const [customer, setCustomer] = useState('')
  const [images, setImages] = useState<'SEPARATE' | 'BUNDLED'>('SEPARATE')

  if (!drafts.data || !catalogs.data) {
    return <PageContainer><LoadingRegion label="Reading the Package…" className="flex flex-col gap-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-80" /></LoadingRegion></PageContainer>
  }
  if (!draft || !holdings) {
    return <PageContainer><EmptyState icon={CircleX} title="This Package was not found among Workers with a built Package" action={<Button asChild variant="outline"><Link to="/customer-delivery">Back to Customer delivery</Link></Button>} /></PageContainer>
  }

  const m = draft.maturity
  const learning = [
    { key: 'memory', label: 'Memory records', count: m?.memories ?? 0, detail: m ? `${m.memory_kinds.episodic} episodic · ${m.memory_kinds.semantic} semantic · ${m.memory_kinds.procedural} procedural` : '' },
    { key: 'brain', label: 'Agreed claims', count: m?.claims ?? 0, detail: 'Sentences several runs agreed on' },
    { key: 'skills', label: 'Proposed Skill changes', count: m?.skill_changes ?? 0, detail: 'Each addition with the runs that agreed' },
  ]
  const customerError = customer.trim() === '' ? 'Enter the Customer.' : customer.length > 120 ? 'Use at most 120 characters.' : null
  const canPass = [dropped.size === 0, true, !customerError, true]
  const reachable = (i: number) => canPass.slice(0, i).every(Boolean)

  const prepare = () => {
    const key = `deliver:${packageId}:${customer.trim().toLowerCase()}`
    startOperation({
      key,
      label: 'Preparing customer package',
      subject: `${draft.name} for ${customer.trim()}`,
      phases: PHASES,
      href: '/customer-delivery?view=delivered',
      onSucceed: () =>
        recordPreparedDelivery({
          delivery_id: crypto.randomUUID(),
          composition_id: draft.composition_id,
          worker_name: draft.name,
          revision: draft.package!.composition_revision,
          version: `r${draft.package!.composition_revision}`,
          digest: 'sha256:not-computed-offline',
          state: 'PREPARED',
          destination_label: customer.trim(),
          expires_at: null,
          last_evidence_at: new Date().toISOString(),
          requirements: null,
          contents: [],
          callback: { configured: 'DISABLED', observed: 'NOT_OBSERVED' },
          source: { state: 'NOT_PUBLISHED', repository: null, tag: null },
          size_bytes: null,
        }),
    })
    // The operation id goes in the URL, so a reload or a second tab re-attaches instead of starting another.
    setParams({ operation: key }, { replace: true })
  }

  const header = (
    <PageHeader
      crumbs={[{ label: 'Customer delivery', to: '/customer-delivery' }, { label: 'Prepare delivery' }]}
      title={`Prepare ${draft.name}`}
      description={`Sealed Package · r${draft.package!.composition_revision}. One sealed Package for one named customer.`}
    />
  )

  if (opId) {
    return (
      <PageContainer>
        {header}
        <Card className="gap-4 p-6" aria-live="polite">
          {!op ? (
            <>
              <p className="text-item">Lost contact with the preparation. It may still be running.</p>
              <p className="text-body text-muted-foreground">Choices are not saved anywhere else, so they show as not reported. Check Prepared packages for the record.</p>
              <Button asChild variant="outline" className="self-start"><Link to="/customer-delivery?view=delivered">Prepared packages</Link></Button>
            </>
          ) : op.state === 'SUCCEEDED' ? (
            <>
              <p className="flex items-center gap-2 text-section"><CircleCheck className="size-5 text-success" aria-hidden="true" />Prepared</p>
              <p className="text-body text-muted-foreground">{op.subject}. Prepared is not sent: create a share link from the record when you are ready.</p>
              <Button asChild className="self-start"><Link to="/customer-delivery?view=delivered">Open the delivery record</Link></Button>
            </>
          ) : op.state === 'FAILED' || op.state === 'CANCELLED' ? (
            <p className="text-item">The preparation stopped before it finished. Nothing was prepared.</p>
          ) : (
            <>
              <p className="text-item">{op.phase}</p>
              <Progress value={op.progress} aria-label={`Preparing ${op.progress}%`} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-brand" />
              <p className="text-meta text-muted-foreground">You can close this page. Preparation continues, and a notice appears when it finishes.</p>
            </>
          )}
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {header}
      <SectionNav className="md:hidden" value={String(step)} onChange={(v) => reachable(Number(v)) && setStep(Number(v))} items={STEPS.map((s, i) => ({ value: String(i), label: s }))} />
      <div className="grid items-start gap-8 md:grid-cols-[12rem_minmax(0,1fr)]">
        <ol className="hidden flex-col gap-1 md:flex" aria-label="Preparation steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button type="button" disabled={!reachable(i)} onClick={() => setStep(i)} aria-current={step === i ? 'step' : undefined} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:text-muted-foreground disabled:hover:bg-transparent', step === i && 'bg-accent font-medium shadow-[inset_3px_0_0_var(--primary)]')}>
                <span className={cn('grid size-5 place-items-center rounded-full text-meta tabular-nums', i < step ? 'bg-brand text-brand-foreground' : 'bg-muted')}>{i < step ? <Check className="size-3" aria-hidden="true" /> : i + 1}</span>
                {s}
              </button>
            </li>
          ))}
        </ol>
        <Card className="gap-0 py-0">
          <CardHeader className="border-b p-6">
            <p className="text-overline text-muted-foreground uppercase">Step {step + 1} of 4</p>
            <h2 className="mt-1 text-section">{['What the customer receives', 'Send what it learned?', 'Who it is for', 'Review and prepare'][step]}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            {step === 0 && (
              <>
                <p className="text-meta text-muted-foreground">Only Skills can be left out. Languages, EVALs and the Definition of Done travel as sealed: dropping one would be composing a different Worker.</p>
                <section>
                  <h3 className="text-item">Skills</h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {holdings.skills.map((s) => (
                      <li key={s.name}>
                        <label className="flex items-start gap-3 rounded-xl border px-4 py-3">
                          <Checkbox checked={!dropped.has(s.name)} onCheckedChange={(v) => setDropped((d) => { const n = new Set(d); if (v === true) n.delete(s.name); else n.add(s.name); return n })} aria-label={`Carry ${s.title}`} className="mt-0.5" />
                          <span><span className="block text-item">{s.title}</span><span className="block text-meta text-muted-foreground">{s.name}</span></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
                {dropped.size > 0 && (
                  <Alert className="border-warning/30 bg-warning/5">
                    <AlertTitle className="text-item">Leaving out {dropped.size} {dropped.size === 1 ? 'Skill' : 'Skills'} seals a new Package</AlertTitle>
                    <AlertDescription>A new revision and a new digest. The sealed Package is not changed. Narrowing is not available in this offline console, so carry every Skill to continue.</AlertDescription>
                  </Alert>
                )}
                <FactList>
                  <Fact label="Domain languages">{holdings.languages.map((l) => l.name).join(', ') || 'None'}</Fact>
                  <Fact label="EVALs">{holdings.evals.length} checks</Fact>
                  <Fact label="Definition of Done">{holdings.rubrics.map((r) => r.display_name).join(' · ')}</Fact>
                </FactList>
              </>
            )}
            {step === 1 && (
              <>
                <p className="text-meta text-muted-foreground">Including learning sends it beside the Package, with its own digests. It is not approval or adoption.</p>
                {!m || m.runs === 0 ? <p className="text-body text-muted-foreground">This Worker has no runs here, so it has no recorded learning to send.</p> : null}
                <ul className="flex flex-col gap-2">
                  {learning.map((l) => (
                    <li key={l.key}>
                      <label className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', l.count === 0 && 'opacity-60')}>
                        <Checkbox disabled={l.count === 0} checked={include.has(l.key)} onCheckedChange={(v) => setInclude((s) => { const n = new Set(s); if (v === true) n.add(l.key); else n.delete(l.key); return n })} className="mt-0.5" aria-label={`Include ${l.label}`} />
                        <span className="flex-1"><span className="block text-item">{l.label}</span><span className="block text-meta text-muted-foreground">{l.count === 0 ? 'None recorded' : l.detail}</span></span>
                        <span className="text-meta text-muted-foreground tabular-nums">{l.count}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {step === 2 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="customer">Customer</Label>
                  <Input id="customer" value={customer} maxLength={140} onChange={(e) => setCustomer(e.target.value)} aria-invalid={customer !== '' && Boolean(customerError)} aria-describedby="customer-hint" />
                  <p id="customer-hint" className={cn('text-meta', customer !== '' && customerError ? 'text-destructive' : 'text-muted-foreground')}>{customer !== '' && customerError ? customerError : 'Recorded on the delivery.'}</p>
                </div>
                <RadioGroup value={images} onValueChange={(v) => setImages(v as typeof images)} className="gap-2" aria-label="Container images">
                  <ChoiceCard id="img-sep" value="SEPARATE" selected={images === 'SEPARATE'} title="A second link beside the package" detail="The package stays small." />
                  <ChoiceCard id="img-bun" value="BUNDLED" selected={images === 'BUNDLED'} title="One file to send" detail="The images are most of its size." />
                </RadioGroup>
                <p className="text-meta text-muted-foreground">The run folder always travels: compose file, README and settings.</p>
              </>
            )}
            {step === 3 && (
              <FactList>
                <Fact label="Worker">{draft.name} · Package r{draft.package!.composition_revision}</Fact>
                <Fact label="Customer">{customer}</Fact>
                <Fact label="Learning">{include.size === 0 ? 'None. The Package travels without learning.' : learning.filter((l) => include.has(l.key)).map((l) => l.label).join(', ')}</Fact>
                <Fact label="Container images">{images === 'SEPARATE' ? 'A second link beside the package' : 'Inside one file'}</Fact>
              </FactList>
            )}
          </CardContent>
          <CardFooter className="gap-3 p-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft aria-hidden="true" />Back</Button>
            {step < 3 ? (
              <Button className="ml-auto" disabled={!canPass[step]} onClick={() => setStep((s) => s + 1)}>{['Review learning', 'Set customer', 'Review delivery'][step]}<ArrowRight aria-hidden="true" /></Button>
            ) : (
              <Button className="ml-auto" disabled={!canPass.every(Boolean)} onClick={prepare}>Prepare delivery</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  )
}
