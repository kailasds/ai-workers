import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Check, CircleDashed, PackageCheck, PencilLine, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { ApiError } from '@/lib/api/client'
import { getDodRubrics, getDslDomains, getEvaluations, getHarnesses, getSkillLibrary } from '@/lib/api/catalog'
import { acceptCheckpoint, getDraft, markPackaged, PACKAGE_PHASES, reopenCheckpoint, type Draft } from '@/lib/api/compose'
import { startOperation, useOperations } from '@/lib/operations'
import { cn } from '@/lib/utils'
import { CheckpointBody } from './checkpoint-body'
import { CHECKPOINTS, STATIONS, type CheckpointKey } from './compose-model'
import { proposalFor, type Catalogs } from './proposal'

const STAGE_EVENTS = (title: string, n: number) => [
  `stage.started · ${title}`,
  'source.opened · the platform catalogue',
  `candidates.filtered · ${n} in scope`,
  'item.selected · reasons recorded',
  'stage.settled · proposal ready',
]

function StationRail({ draft, current, onGo }: { draft: Draft; current: CheckpointKey | 'summary'; onGo: (k: CheckpointKey | 'summary') => void }) {
  const firstOpen = CHECKPOINTS.find((c) => !draft.accepted.includes(c.key))?.key
  return (
    <nav aria-label="Stations" className="flex flex-col gap-5">
      {STATIONS.filter((s) => s.key !== 'package_deploy').map((s) => {
        const cps = CHECKPOINTS.filter((c) => c.station === s.key)
        const done = cps.every((c) => draft.accepted.includes(c.key))
        return (
          <div key={s.key}>
            <p className="flex items-center gap-2 text-overline text-muted-foreground uppercase">
              {s.label}
              {done && <Check className="size-3 text-foreground" aria-label="ready" />}
            </p>
            <ul className="mt-1.5 flex flex-col">
              {cps.map((c) => {
                const accepted = draft.accepted.includes(c.key)
                const attention = draft.attention.includes(c.key)
                const reachable = accepted || c.key === firstOpen
                const here = current === c.key
                return (
                  <li key={c.key}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => onGo(c.key)}
                      aria-current={here ? 'step' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent',
                        here && 'bg-accent font-medium shadow-[inset_3px_0_0_var(--primary)] hover:bg-accent',
                      )}
                    >
                      {accepted ? (
                        <span className="grid size-4 place-items-center rounded-full bg-brand text-brand-foreground"><Check className="size-2.5" aria-hidden="true" /></span>
                      ) : attention ? (
                        <TriangleAlert className="size-4 text-warning" aria-hidden="true" />
                      ) : (
                        <CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      <span className="sr-only">{accepted ? '(confirmed)' : attention ? '(needs attention)' : '(not confirmed)'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => onGo('summary')}
        disabled={draft.accepted.length < CHECKPOINTS.length}
        className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:text-muted-foreground disabled:hover:bg-transparent', current === 'summary' && 'bg-accent font-medium shadow-[inset_3px_0_0_var(--primary)]')}
      >
        <PackageCheck className="size-4" aria-hidden="true" />
        Package and deploy
      </button>
    </nav>
  )
}

export function JourneyPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const review = params.get('mode') === 'review'
  const scenario = params.get('mock')
  const draftRead = useResource(`draft:${id}:${scenario}`, (signal) => getDraft(id, { signal, scenario }))
  const catalogs = useResource('compose-catalogs', async (signal): Promise<Catalogs> => {
    const [s, d, e, r, h] = await Promise.all([getSkillLibrary({ signal }), getDslDomains({ signal }), getEvaluations({ signal }), getDodRubrics({ signal }), getHarnesses({ signal })])
    return { skills: s.skills, dsl: d.domains, evals: e.evaluations, rubrics: r.rubrics, harnesses: h.harnesses }
  })

  const [local, setLocal] = useState<Draft | null>(null)
  const draft = local ?? draftRead.data
  useEffect(() => setLocal(null), [draftRead.data])

  const firstOpen = draft ? (CHECKPOINTS.find((c) => !draft.accepted.includes(c.key))?.key ?? 'summary') : 'summary'
  const step = (params.get('step') as CheckpointKey | 'summary' | null) ?? firstOpen
  const current = draft && step !== 'summary' && !draft.accepted.includes(step) && step !== firstOpen ? firstOpen : step
  const cp = CHECKPOINTS.find((c) => c.key === current) ?? null
  const accepted = Boolean(cp && draft?.accepted.includes(cp.key))
  const attention = Boolean(cp && draft?.attention.includes(cp.key))

  const go = useCallback((k: CheckpointKey | 'summary', replace = false) => setParams((p) => { const n = new URLSearchParams(p); n.set('step', k); return n }, { replace }), [setParams])

  // Stage run: an unconfirmed checkpoint assembles first (a short event stream), then settles.
  const [events, setEvents] = useState<string[]>([])
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!cp || accepted) {
      setSettled(true)
      return
    }
    const lines = STAGE_EVENTS(cp.stage, 12 + CHECKPOINTS.indexOf(cp) * 7)
    setEvents([])
    setSettled(false)
    const timers = lines.map((line, i) => setTimeout(() => setEvents((e) => [...e, line]), 220 * (i + 1)))
    timers.push(setTimeout(() => setSettled(true), 220 * (lines.length + 1)))
    return () => timers.forEach(clearTimeout)
  }, [cp, accepted])

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<{ message: string; conflict: boolean } | null>(null)
  const confirm = useCallback(async () => {
    if (!draft || !cp) return
    setSaving(true)
    setSaveError(null)
    try {
      const next = await acceptCheckpoint(draft.composition_id, cp.key, draft.record_version)
      setLocal(next)
      const after = CHECKPOINTS.find((c) => !next.accepted.includes(c.key))?.key ?? 'summary'
      go(after, !review)
    } catch (cause) {
      setSaveError({ message: cause instanceof Error ? cause.message : 'Changes not saved.', conflict: cause instanceof ApiError && cause.status === 409 })
    } finally {
      setSaving(false)
    }
  }, [draft, cp, go, review])

  // Auto-assemble continues through settled checkpoints; it pauses for anything needing a person.
  useEffect(() => {
    if (review || !settled || accepted || attention || saving || saveError || !cp) return
    const t = setTimeout(confirm, 700)
    return () => clearTimeout(t)
  }, [review, settled, accepted, attention, saving, saveError, cp, confirm])

  const ops = useOperations()
  const buildOp = draft ? ops.find((o) => o.id === `build:${draft.composition_id}`) : undefined

  const proposal = useMemo(() => (draft && catalogs.data ? proposalFor(draft, catalogs.data) : null), [draft, catalogs.data])

  if (!draft) {
    return (
      <PageContainer>
        {draftRead.error ? (
          draftRead.error instanceof ApiError && draftRead.error.status === 404 ? (
            <EmptyState icon={CircleDashed} title="Draft not found" description={draftRead.error.message} action={<Button asChild variant="outline"><Link to="/compose/drafts">Saved drafts</Link></Button>} />
          ) : (
            <ErrorState title="Compose could not load." message="Reload the page; your saved drafts are kept." onRetry={draftRead.refresh} />
          )
        ) : (
          <LoadingRegion label="Opening the Worker — restoring saved decisions…" className="flex flex-col gap-4">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-96 w-full" />
          </LoadingRegion>
        )}
      </PageContainer>
    )
  }

  const done = draft.accepted.length
  const composed = done === CHECKPOINTS.length
  const progressLabel = review ? `${done} of ${CHECKPOINTS.length} checks${composed ? ' confirmed' : ''}` : `Auto-assemble · ${done} of ${CHECKPOINTS.length} checkpoints`
  const issues = cp ? draft.issues.filter((i) => ({ capabilities: 'skills', governance: 'autonomy', definition_of_done: 'definition_of_done' } as Record<string, string>)[i.section] === cp.key) : []

  const buildPackage = () =>
    startOperation({
      key: `build:${draft.composition_id}`,
      label: 'Building Package',
      subject: draft.name,
      phases: PACKAGE_PHASES,
      href: `/packaging?queue=packaged`,
      onSucceed: () => markPackaged(draft.composition_id),
    })

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Compose', to: '/compose/drafts' }, { label: draft.name }]}
        title={draft.name}
        meta={<p className="text-meta text-muted-foreground">Revision {draft.revision} · Saved · {progressLabel}</p>}
        actions={
          <Button asChild variant="outline">
            <Link to="/compose/drafts">Save and close</Link>
          </Button>
        }
      />
      <Progress value={(done / CHECKPOINTS.length) * 100} aria-label={progressLabel} className="-mt-2 h-1 [&_[data-slot=progress-indicator]]:bg-brand" />

      <SectionNav
        className="md:hidden"
        items={[...CHECKPOINTS.filter((c) => draft.accepted.includes(c.key) || c.key === firstOpen).map((c) => ({ value: c.key, label: c.title })), ...(composed ? [{ value: 'summary', label: 'Package and deploy' }] : [])]}
        value={current}
        onChange={(v) => go(v as CheckpointKey)}
      />

      <div className="grid items-start gap-8 md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="hidden md:block md:sticky md:top-6">
          <StationRail draft={draft} current={current} onGo={go} />
        </div>

        {current === 'summary' || !cp ? (
          <Card className="gap-0 py-0">
            <CardHeader className="border-b p-4 sm:p-6">
              <p className="text-overline text-muted-foreground uppercase">Package and deploy</p>
              <h2 className="mt-1 text-section">{composed ? 'Worker composed' : 'Not composed yet'}</h2>
              <p className="text-meta text-muted-foreground">{composed ? `Every checkpoint is confirmed and written to revision ${draft.revision}. Nothing is built yet.` : 'Confirm every checkpoint before packaging.'}</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ul className="grid gap-2 sm:grid-cols-2">
                {CHECKPOINTS.map((c) => (
                  <li key={c.key}>
                    <button type="button" onClick={() => go(c.key)} className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-body outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="grid size-4 place-items-center rounded-full bg-brand text-brand-foreground"><Check className="size-2.5" aria-hidden="true" /></span>
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-wrap gap-3 p-4 sm:p-6">
              {draft.package ? (
                <>
                  <p className="text-body">Packaged at r{draft.package.composition_revision}.</p>
                  <Button asChild className="ml-auto"><Link to="/packaging?queue=packaged">Open Packaging</Link></Button>
                </>
              ) : buildOp && (buildOp.state === 'RUNNING' || buildOp.state === 'QUEUED') ? (
                <div className="flex w-full flex-col gap-2" aria-live="polite">
                  <p className="text-item">Building Package · {buildOp.phase}</p>
                  <Progress value={buildOp.progress} aria-label={`Building Package ${buildOp.progress}%`} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-brand" />
                  <p className="text-meta text-muted-foreground">You can close this page. The build continues and Active work shows it.</p>
                </div>
              ) : (
                <>
                  <p className="text-meta text-muted-foreground">Building seals a versioned, checksummed Package. Deploying it is a separate decision in Packaging.</p>
                  <Button className="ml-auto" disabled={!composed} onClick={buildPackage}><PackageCheck aria-hidden="true" />Build Package</Button>
                </>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="gap-0 py-0" aria-busy={!settled}>
            <CardHeader className="border-b p-4 sm:p-6">
              <p className="text-overline text-muted-foreground uppercase">{STATIONS.find((s) => s.key === cp.station)?.label}</p>
              <h2 className="mt-1 text-section">{cp.title}</h2>
              <p className="text-meta text-muted-foreground">{cp.decides}</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!settled ? (
                <div role="status" aria-live="polite" className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 text-item"><Spinner />Assembling {cp.title.toLowerCase()}…</p>
                  <ol className="flex flex-col gap-1 font-mono text-meta text-muted-foreground">
                    {events.map((e) => <li key={e}>{e}</li>)}
                  </ol>
                </div>
              ) : !proposal ? (
                catalogs.error ? <ErrorState title="The search finished but its result could not be read." message="Nothing can be confirmed until it is." onRetry={catalogs.refresh} /> : <Skeleton className="h-48 w-full" />
              ) : (
                <div className="flex flex-col gap-5">
                  {attention && issues.length > 0 && (
                    <Alert className="border-warning/30 bg-warning/5">
                      <TriangleAlert className="text-warning" aria-hidden="true" />
                      <AlertTitle className="text-item">The platform reports this part incomplete</AlertTitle>
                      <AlertDescription>
                        <ul>{issues.map((i) => <li key={i.code}>{i.message}</li>)}</ul>
                        <p className="mt-1">Edit this part to resolve it, then confirm. Stage editors are not part of this preview.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  <CheckpointBody k={cp.key} draft={draft} p={proposal} />
                  <p className="text-meta text-muted-foreground">Proposal assembled from the platform catalogue (offline mock). Nothing enters the Worker until it is confirmed.</p>
                </div>
              )}
              {saveError && (
                <Alert variant="destructive" className="mt-5">
                  <AlertTitle>Changes not saved.</AlertTitle>
                  <AlertDescription>
                    {saveError.message}
                    {saveError.conflict && <Button variant="outline" size="sm" className="mt-2" onClick={draftRead.refresh}>Reload</Button>}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex-wrap gap-3 p-4 sm:p-6">
              <Button variant="ghost" disabled={CHECKPOINTS.indexOf(cp) === 0} onClick={() => go(CHECKPOINTS[CHECKPOINTS.indexOf(cp) - 1].key)}>
                <ArrowLeft aria-hidden="true" />Back
              </Button>
              <span className="text-meta text-muted-foreground tabular-nums">{progressLabel}</span>
              <span className="ml-auto flex gap-2">
                {accepted ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const next = await reopenCheckpoint(draft.composition_id, cp.key)
                        setLocal(next)
                      }}
                    >
                      <PencilLine aria-hidden="true" />Edit
                    </Button>
                    <Button onClick={() => go(CHECKPOINTS.find((c) => !draft.accepted.includes(c.key))?.key ?? 'summary')}>Continue</Button>
                  </>
                ) : (
                  <Button onClick={confirm} disabled={!settled || saving || attention || !proposal}>
                    {saving && <Spinner />}
                    {cp.button}
                  </Button>
                )}
              </span>
              {accepted && <p className="w-full text-meta text-muted-foreground">Editing restarts this stage and every later one; checkpoints from here on are no longer confirmed.</p>}
            </CardFooter>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
