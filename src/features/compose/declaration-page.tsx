import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FolderOpen, Fingerprint } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { getGeographies, getWorkerTypes } from '@/lib/api/catalog'
import { createDraft } from '@/lib/api/compose'
import { cn } from '@/lib/utils'
import { ChoiceCard } from './choice-card'
import { BUSINESS_DOMAINS, CONTEXTS, contextOf, DECISIONS, domainOf, IDENTITIES, identityOf, spiffePreview, widerContexts } from './compose-model'

const NONE = '__none'

function Step({ n, title, hint, active, children }: { n: number; title: string; hint?: string; active: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className={cn('flex flex-col gap-4', !active && 'opacity-50')}>
      <div className="flex items-baseline gap-3">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-meta font-medium text-brand-foreground tabular-nums" aria-hidden="true">{n}</span>
        <div>
          <h2 id={`step-${n}`} className="text-section">{title}</h2>
          {hint && <p className="text-meta text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </section>
  )
}

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
  const decided = [type, identity, context].filter(Boolean).length
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

  return (
    <PageContainer>
      <PageHeader
        title="Compose a Worker"
        description="Declare what it does and where it may work. The platform assembles the rest, and nothing enters the Worker until you confirm it."
        actions={
          <Button asChild variant="outline">
            <Link to="/compose/drafts"><FolderOpen aria-hidden="true" />Saved drafts</Link>
          </Button>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-10">
          <Step n={1} title="What kind of work?" hint="Decides which identities exist." active>
            {types.error ? (
              <ErrorState title="Could not load Worker types." message={types.error.message} onRetry={types.refresh} />
            ) : !types.data ? (
              <LoadingRegion label="Reading Worker types…" className="flex flex-col gap-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></LoadingRegion>
            ) : (
              <RadioGroup value={type ?? ''} onValueChange={chooseType} aria-label="Worker type" className="gap-2">
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
          </Step>

          <Step n={2} title="What is it?" hint="Its identity, and optionally the business and law it answers to." active={Boolean(type)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="identity">Identity</Label>
                <Select value={identity ?? ''} onValueChange={chooseIdentity} disabled={!type}>
                  <SelectTrigger id="identity" className="w-full"><SelectValue placeholder={type ? 'Choose an identity' : 'Choose a Worker type first'} /></SelectTrigger>
                  <SelectContent>
                    {identities.map((i) => (
                      <SelectItem key={i.key} value={i.key}>{i.label} <span className="text-muted-foreground">· {CONTEXTS.filter((c) => c.identity === i.key).length} scopes</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="domain">Business domain <span className="font-normal text-muted-foreground">· optional</span></Label>
                <Select value={domain ?? NONE} onValueChange={(v) => setDomain(v === NONE ? null : v)} disabled={!type}>
                  <SelectTrigger id="domain" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No business domain</SelectItem>
                    {BUSINESS_DOMAINS.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-meta text-muted-foreground">Decides which Skills, languages and EVALs come with it.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="geography">Geography <span className="font-normal text-muted-foreground">· optional</span></Label>
                <Select value={geography ?? NONE} onValueChange={(v) => setGeography(v === NONE ? null : v)} disabled={!type || !geos.data}>
                  <SelectTrigger id="geography" className="w-full"><SelectValue /></SelectTrigger>
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
          </Step>

          <Step n={3} title="Where does it work?" hint="The one business boundary: what it produces, and what it refuses." active={Boolean(identity)}>
            {!identity ? (
              <p className="text-body text-muted-foreground">Available once an identity is assigned.</p>
            ) : contexts.length === 0 ? (
              <p className="text-body text-muted-foreground">{identityOf(identity)?.label} entitles no bounded context yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                <RadioGroup value={context ?? ''} onValueChange={(v) => { setContext(v); setCeiling(null); setGrowth('keep') }} aria-label="Bounded context" className="gap-2">
                  {contexts.map((c) => (
                    <ChoiceCard
                      key={c.key}
                      id={`ctx-${c.key}`}
                      value={c.key}
                      selected={context === c.key}
                      title={c.label}
                      detail={c.adds ? `+ ${c.adds}` : c.includes}
                      meta={`${c.excludes.length} excluded`}
                      disabledReason={c.availability !== 'available' ? 'In build · Available later' : null}
                    >
                      {context === c.key && (
                        <span className="mt-3 block border-t pt-3 text-meta text-muted-foreground">
                          <span className="block text-foreground">Produces</span>
                          {c.outcome}
                        </span>
                      )}
                    </ChoiceCard>
                  ))}
                </RadioGroup>

                {ctx && (
                  <div className="flex flex-col gap-3">
                    <p className="text-item">May it grow into a wider context?</p>
                    <RadioGroup value={growth} onValueChange={(v) => setGrowth(v as 'keep' | 'allow')} className="gap-2">
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
                            <SelectTrigger className="mt-3 w-full" aria-label="Growth ceiling"><SelectValue placeholder="Growth ceiling" /></SelectTrigger>
                            <SelectContent>{wider.map((w) => <SelectItem key={w.key} value={w.key}>{w.label}</SelectItem>)}</SelectContent>
                          </Select>
                        )}
                      </ChoiceCard>
                    </RadioGroup>
                  </div>
                )}

                {ctx && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name">Worker name <span className="font-normal text-muted-foreground">· optional</span></Label>
                      <Input id="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Named after its work and business domain" aria-invalid={nameInvalid} aria-describedby="name-hint" />
                      <p id="name-hint" className={cn('text-meta', nameInvalid ? 'text-destructive' : 'text-muted-foreground')}>{nameInvalid ? 'A name has at least 2 characters.' : 'How the Worker is listed everywhere.'}</p>
                    </div>
                    <label htmlFor="auto" className="flex gap-3 self-start rounded-xl border p-4">
                      <Checkbox id="auto" checked={auto} onCheckedChange={(v) => setAuto(v === true)} className="mt-0.5" />
                      <span>
                        <span className="block text-item">Assemble automatically</span>
                        <span className="block text-meta text-muted-foreground">{auto ? 'Pauses only for questions, errors and deployment.' : 'Pauses at each of the eight checkpoints for you to review.'}</span>
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </Step>
        </div>

        <Card className="gap-0 py-0 lg:sticky lg:top-6" role="region" aria-labelledby="identity-title">
          <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
            <Fingerprint className="size-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle id="identity-title" className="text-item">Worker identity</CardTitle>
            <span className="ml-auto text-meta text-muted-foreground tabular-nums">{decided} of {DECISIONS.length} decisions</span>
          </CardHeader>
          <CardContent className="py-4">
            <FactList>
              <Fact label="Worker type" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{typeLabel ?? <span className="text-muted-foreground">Not chosen</span>}</Fact>
              <Fact label="Identity" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{identityOf(identity)?.label ?? <span className="text-muted-foreground">Not chosen</span>}</Fact>
              <Fact label="Business" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{domainOf(domain)?.label ?? <span className="text-muted-foreground">None</span>}</Fact>
              <Fact label="Geography" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{geo ? `${geo.display_name} · ${geo.eval_count} checks` : <span className="text-muted-foreground">Not stated</span>}</Fact>
              <Fact label="Context" className="sm:grid-cols-[7rem_minmax(0,1fr)]">{ctx?.label ?? <span className="text-muted-foreground">Not chosen</span>}</Fact>
            </FactList>
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 font-mono text-meta break-all text-muted-foreground">{identifier}</p>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3 p-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>The draft could not be created.</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={confirm} disabled={!ready}>
              {busy && <Spinner />}
              Confirm identity
            </Button>
            <p className="text-meta text-muted-foreground">The identity is reserved when you confirm. Everything after this attaches to it.</p>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  )
}
