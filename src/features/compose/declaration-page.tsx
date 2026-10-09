import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, FileCode2, FlaskConical, FolderOpen, Workflow, Wrench } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getGeographies, getWorkerTypes } from '@/lib/api/catalog'
import { createDraft } from '@/lib/api/compose'
import { cn } from '@/lib/utils'
import { ChoiceCard } from './choice-card'
import { BUSINESS_DOMAINS, CONTEXTS, contextOf, IDENTITIES, identityOf, spiffePreview, STEPS, widerContexts } from './compose-model'
import { ComposeStepper, type StepState } from './compose-stepper'
import { DeclarationPanel } from './worker-panel'

const NONE = '__none'
const CONTEXT_ICONS = [FileCode2, FlaskConical, Workflow]

function Question({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div>
        <h3 id={id} className="text-item font-semibold">{title}</h3>
        {hint && <p className="mt-1 max-w-3xl text-body text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

const fieldLabel = 'text-overline text-muted-foreground uppercase'

export function DeclarationPage() {
  const navigate = useNavigate()
  const types = useResource('worker-types', (signal) => getWorkerTypes({ signal }))
  const geos = useResource('geographies', (signal) => getGeographies({ signal }))

  const [type, setType] = useState<string | null>(null)
  const [identity, setIdentity] = useState<string | null>(null)
  const [domain, setDomain] = useState<string | null>(null)
  const [geography, setGeography] = useState<string | null>(null)
  const [context, setContext] = useState<string | null>(null)
  const [growth, setGrowth] = useState<'keep' | 'allow'>('keep')
  const [ceiling, setCeiling] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [auto, setAuto] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const identities = IDENTITIES.filter((i) => i.workerType === type)
  const contexts = CONTEXTS.filter((c) => c.identity === identity)
  const wider = context ? widerContexts(context) : []
  const ctx = contextOf(context)
  const geo = geos.data?.geographies.find((g) => g.key === geography) ?? null
  const nameInvalid = name.trim().length === 1
  const ready = Boolean(context) && !busy && !nameInvalid
  const typeLabel = types.data?.types.find((t) => t.key === type)?.display_name ?? null

  // Changing an earlier decision clears the ones that depended on it.
  const chooseType = (v: string) => {
    setType(v)
    setIdentity(null)
    setDomain(null)
    setContext(null)
    setCeiling(null)
    setGrowth('keep')
  }
  const chooseIdentity = (v: string) => {
    setIdentity(v)
    setContext(null)
    setCeiling(null)
    setGrowth('keep')
  }

  const confirm = async () => {
    if (!type || !identity || !context) return
    setBusy(true)
    setError(null)
    try {
      const draft = await createDraft({ name, worker_type: type, identity_key: identity, business_domain_key: domain, geography, context_key: context, growth_ceiling: growth === 'allow' ? ceiling : null, auto_assemble: auto })
      navigate(`/compose/guided/${draft.composition_id}${auto ? '' : '?mode=review'}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The draft could not be created.')
      setBusy(false)
    }
  }

  const identifier = useMemo(() => spiffePreview(type, identity, domain, context, name || ctx?.label || ''), [type, identity, domain, context, name, ctx])

  const stepStates = Object.fromEntries(STEPS.map((st, i) => [st.key, i === 0 ? 'current' : 'upcoming'])) as Record<(typeof STEPS)[number]['key'], StepState>

  return (
    <PageContainer className="gap-8">
      <PageHeader
        icon={Wrench}
        title="Compose an AI Worker"
        description="Declare what it does and where its work stops. The platform assembles the rest, and nothing enters the Worker until you confirm it."
        actions={
          <Button asChild variant="outline">
            <Link to="/compose/drafts"><FolderOpen aria-hidden="true" />Saved drafts</Link>
          </Button>
        }
      />

      <ComposeStepper states={stepStates} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-xl border bg-card p-5 sm:p-8">
            <p className="text-overline font-semibold text-primary-strong uppercase">Step 1 of {STEPS.length}</p>
            <h2 className="mt-2 text-section">Define the Worker: what it does, and where its work stops</h2>

            <div className="mt-8 flex flex-col gap-10">
              <Question id="q-type" title="What kind of work does it perform?" hint="The kind of work decides which identities exist.">
                {types.error ? (
                  <ErrorState title="Could not load Worker types." message={types.error.message} onRetry={types.refresh} />
                ) : !types.data ? (
                  <LoadingRegion label="Reading Worker types…" className="flex flex-col gap-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></LoadingRegion>
                ) : (
                  <RadioGroup value={type ?? ''} onValueChange={chooseType} aria-labelledby="q-type" className="gap-3">
                    {types.data.types.map((t) => (
                      <ChoiceCard
                        key={t.key}
                        id={`type-${t.key}`}
                        value={t.key}
                        selected={type === t.key}
                        title={t.display_name}
                        detail={t.summary}
                        meta={t.availability === 'available' ? `${t.bounded_context_count} bounded contexts` : 'In build'}
                        disabledReason={t.availability !== 'available' ? t.availability_detail || 'Available later.' : null}
                      />
                    ))}
                  </RadioGroup>
                )}
              </Question>

              {type && (
                <Question id="q-identity" title="What is it?" hint="The identity decides which scopes this Worker may be bound to. A business domain decides which Skills, Domain Specific Languages and EVALs come with it, and can be left out.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="identity" className={fieldLabel}>Identity</Label>
                      <Select value={identity ?? ''} onValueChange={chooseIdentity}>
                        <SelectTrigger id="identity" className="h-auto min-h-12 w-full py-2.5"><SelectValue placeholder="Choose an identity" /></SelectTrigger>
                        <SelectContent>
                          {identities.map((i) => (
                            <SelectItem key={i.key} value={i.key}>{i.label} <span className="text-muted-foreground">· {CONTEXTS.filter((c) => c.identity === i.key).length} scopes</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {identity && <p className="text-meta text-muted-foreground">{identityOf(identity)?.summary}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="domain" className={fieldLabel}>Business domain · optional</Label>
                      <Select value={domain ?? NONE} onValueChange={(v) => setDomain(v === NONE ? null : v)}>
                        <SelectTrigger id="domain" className="h-12 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>No business domain</SelectItem>
                          {BUSINESS_DOMAINS.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <p className="text-meta text-muted-foreground">Without one, no domain language binds.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="geography" className={fieldLabel}>Geography · optional</Label>
                      <Select value={geography ?? NONE} onValueChange={(v) => setGeography(v === NONE ? null : v)} disabled={!geos.data}>
                        <SelectTrigger id="geography" className="h-12 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>Not stated</SelectItem>
                          {geos.data?.geographies.map((g) => (
                            <SelectItem key={g.key} value={g.key}>{g.display_name} <span className="text-muted-foreground">· {g.eval_count} compliance checks</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-meta text-muted-foreground">{geo ? (geo.review_note ?? geo.summary) : 'Changes only which compliance checks bind. Not a deployment region.'}</p>
                    </div>
                  </div>
                </Question>
              )}

              {identity && (
                <Question id="q-context" title="What does this Worker do, and where does its work stop?" hint="This is its bounded context: the work it takes on, and the work it leaves alone.">
                  {contexts.length === 0 ? (
                    <p className="text-body text-muted-foreground">{identityOf(identity)?.label} entitles no bounded context yet.</p>
                  ) : (
                    <RadioGroup value={context ?? ''} onValueChange={(v) => { setContext(v); setCeiling(null); setGrowth('keep') }} aria-labelledby="q-context" className="gap-3">
                      {contexts.map((c) => (
                        <ChoiceCard
                          key={c.key}
                          id={`ctx-${c.key}`}
                          value={c.key}
                          icon={CONTEXT_ICONS[(c.step - 1) % CONTEXT_ICONS.length]}
                          selected={context === c.key}
                          title={c.label}
                          detail={c.adds ? `Adds ${c.adds.charAt(0).toLowerCase()}${c.adds.slice(1)}` : c.includes}
                          meta={`${c.excludes.length} excluded`}
                          disabledReason={c.availability !== 'available' ? 'In build · Available later' : null}
                        >
                          {context === c.key && (
                            <span className="mt-3 block border-t border-primary/20 pt-3 text-meta text-muted-foreground">
                              <span className="block font-medium text-foreground">Produces</span>
                              {c.outcome}
                            </span>
                          )}
                        </ChoiceCard>
                      ))}
                    </RadioGroup>
                  )}
                </Question>
              )}

              {ctx && (
                <Question id="q-growth" title="May it grow into a wider context?" hint="Growth happens only on evidence, and only up to the ceiling you set here.">
                  <RadioGroup value={growth} onValueChange={(v) => setGrowth(v as 'keep' | 'allow')} aria-labelledby="q-growth" className="gap-3">
                    <ChoiceCard id="growth-keep" value="keep" selected={growth === 'keep'} title="Keep this bounded context" />
                    <ChoiceCard
                      id="growth-allow"
                      value="allow"
                      selected={growth === 'allow'}
                      title="Allow growth on evidence"
                      detail="The Sentinel records when the Worker qualifies for the next bounded context, up to the ceiling. Nothing moves yet."
                      disabledReason={wider.length === 0 ? 'This is the widest bounded context for this identity.' : null}
                    >
                      {growth === 'allow' && wider.length > 0 && (
                        <Select value={ceiling ?? ''} onValueChange={setCeiling}>
                          <SelectTrigger className="mt-3 w-full bg-card" aria-label="Growth ceiling"><SelectValue placeholder="Growth ceiling" /></SelectTrigger>
                          <SelectContent>{wider.map((w) => <SelectItem key={w.key} value={w.key}>{w.label}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </ChoiceCard>
                  </RadioGroup>
                </Question>
              )}

              {ctx && (
                <Question id="q-name" title="Name it, and choose how it assembles">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name" className={fieldLabel}>Worker name · optional</Label>
                      <Input id="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Named after its work and business domain" aria-invalid={nameInvalid} aria-describedby="name-hint" className="h-12" />
                      <p id="name-hint" className={cn('text-meta', nameInvalid ? 'text-destructive' : 'text-muted-foreground')}>{nameInvalid ? 'A name has at least 2 characters.' : 'How the Worker is listed everywhere.'}</p>
                    </div>
                    <label htmlFor="auto" className={cn('flex gap-3 self-start rounded-xl border p-4', auto && 'border-primary bg-primary-soft')}>
                      <Checkbox id="auto" checked={auto} onCheckedChange={(v) => setAuto(v === true)} className="mt-0.5" />
                      <span>
                        <span className="block text-item font-semibold">Assemble automatically</span>
                        <span className="block text-meta text-muted-foreground">{auto ? 'Pauses only for questions, errors and deployment.' : 'Pauses at each of the eight checkpoints for you to review.'}</span>
                      </span>
                    </label>
                  </div>
                </Question>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>The draft could not be created.</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="outline" size="lg">
              <Link to="/compose/drafts"><ArrowLeft aria-hidden="true" />Back</Link>
            </Button>
            <Button size="lg" onClick={confirm} disabled={!ready}>
              {busy && <Spinner />}
              Confirm identity
            </Button>
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-6">
          <DeclarationPanel
            typeLabel={typeLabel}
            identity={identity}
            domain={domain}
            geography={geo?.display_name ?? null}
            context={context}
            identifier={identifier}
          />
        </div>
      </div>
    </PageContainer>
  )
}
