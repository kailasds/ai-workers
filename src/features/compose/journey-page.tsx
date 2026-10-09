import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Check, CircleDashed, FolderOpen, PackageCheck, PencilLine, TriangleAlert, Wrench } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState, ErrorState, LoadingRegion } from '@/components/platform/states'
import { useResource } from '@/hooks/use-resource'
import { ApiError } from '@/lib/api/client'
import { getDodRubrics, getDslDomains, getEvaluations, getHarnesses, getSkillLibrary } from '@/lib/api/catalog'
import { acceptCheckpoint, getDraft, markPackaged, PACKAGE_PHASES, reopenCheckpoint, type Draft } from '@/lib/api/compose'
import { startOperation, useOperations } from '@/lib/operations'
import { cn } from '@/lib/utils'
import { CheckpointBody } from './checkpoint-body'
import { CHECKPOINTS, checkpointsOf, STEPS, type CheckpointKey, type StationKey } from './compose-model'
import { ComposeStepper, type StepState } from './compose-stepper'
import { ComposingPanel } from './worker-panel'
import { proposalFor, type Catalogs } from './proposal'

const STAGE_EVENTS = (title: string, n: number) => [
  `stage.started · ${title}`,
  'source.opened · the platform catalogue',
  `candidates.filtered · ${n} in scope`,
  'item.selected · reasons recorded',
  'stage.settled · proposal ready',
]

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

  const stationOfCurrent: StationKey = cp ? cp.station : 'package_deploy'
  const stepIndex = STEPS.findIndex((st) => st.key === stationOfCurrent)
  const stepStates = Object.fromEntries(
    STEPS.map((st) => {
      const cps = checkpointsOf(st.key)
      const complete = st.key === 'package_deploy' ? Boolean(draft.package) : cps.every((c) => draft.accepted.includes(c.key))
      const state: StepState =
        st.key === stationOfCurrent ? 'current'
        : complete ? 'done'
        : cps.some((c) => draft.attention.includes(c.key)) ? 'attention'
        : 'upcoming'
      return [st.key, state]
    }),
  ) as Record<StationKey, StepState>
  const goStation = (k: StationKey) => {
    if (k === 'package_deploy') return go('summary')
    const cps = checkpointsOf(k)
    go(cps.find((c) => !draft.accepted.includes(c.key))?.key ?? cps[0].key)
  }
  const parts = cp ? checkpointsOf(cp.station) : []
  const index = cp ? CHECKPOINTS.indexOf(cp) : CHECKPOINTS.length

  return (
    <PageContainer className="gap-8">
      <PageHeader
        icon={Wrench}
        title="Compose an AI Worker"
        description="Choose the work. Confirm its scope. The platform assembles the rest."
        actions={
          <Button asChild variant="outline">
            <Link to="/compose/drafts"><FolderOpen aria-hidden="true" />Save and close</Link>
          </Button>
        }
      />

      <ComposeStepper states={stepStates} onSelect={goStation} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-5">
          {current === 'summary' || !cp ? (
            <>
              <div className="rounded-xl border bg-card p-5 sm:p-8">
                <p className="text-overline font-semibold text-primary-strong uppercase">Step {STEPS.length} of {STEPS.length}</p>
                <h2 className="mt-2 text-section">{composed ? 'Worker composed' : 'Not composed yet'}</h2>
                <p className="mt-1 text-body text-muted-foreground">{composed ? `Every checkpoint is confirmed and written to revision ${draft.revision}. Nothing is built yet.` : 'Confirm every checkpoint before packaging.'}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {CHECKPOINTS.map((c) => (
                    <li key={c.key}>
                      <button type="button" onClick={() => go(c.key)} className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-item outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="grid size-5 place-items-center rounded-full bg-success text-success-foreground"><Check className="size-3" strokeWidth={3} aria-hidden="true" /></span>
                        {c.title}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t pt-6">
                  {draft.package ? (
                    <p className="text-body">Packaged at revision {draft.package.composition_revision}. Deploying it is a separate decision in Packaging.</p>
                  ) : buildOp && (buildOp.state === 'RUNNING' || buildOp.state === 'QUEUED') ? (
                    <div className="flex flex-col gap-2" aria-live="polite">
                      <p className="text-item">Building Package · {buildOp.phase}</p>
                      <Progress value={buildOp.progress} aria-label={`Building Package ${buildOp.progress}%`} className="h-1.5" />
                      <p className="text-meta text-muted-foreground">You can close this page. The build continues and Active work shows it.</p>
                    </div>
                  ) : (
                    <p className="text-meta text-muted-foreground">Building seals a versioned, checksummed Package. Deploying it is a separate decision in Packaging.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" size="lg" onClick={() => go(CHECKPOINTS[CHECKPOINTS.length - 1].key)}><ArrowLeft aria-hidden="true" />Back</Button>
                {draft.package ? (
                  <Button asChild size="lg"><Link to="/packaging?queue=packaged">Open Packaging</Link></Button>
                ) : (
                  <Button size="lg" disabled={!composed || Boolean(buildOp && (buildOp.state === 'RUNNING' || buildOp.state === 'QUEUED'))} onClick={buildPackage}><PackageCheck aria-hidden="true" />Build Package</Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-5 sm:p-8" aria-busy={!settled}>
                <p className="text-overline font-semibold text-primary-strong uppercase">
                  Step {stepIndex + 1} of {STEPS.length}
                  {parts.length > 1 && <span className="text-muted-foreground"> · Part {parts.indexOf(cp) + 1} of {parts.length}</span>}
                </p>
                <h2 className="mt-2 text-section">{parts.length > 1 ? `${STEPS[stepIndex].label}: ${cp.title}` : cp.title}</h2>
                <p className="mt-1 text-body text-muted-foreground">{cp.decides}</p>

                {parts.length > 1 && (
                  <ol aria-label={`${STEPS[stepIndex].label} parts`} className="mt-5 flex flex-wrap gap-2">
                    {parts.map((pt) => {
                      const ok = draft.accepted.includes(pt.key)
                      const here = pt.key === cp.key
                      const can = ok || pt.key === firstOpen
                      return (
                        <li key={pt.key}>
                          <button
                            type="button"
                            disabled={!can || here}
                            aria-current={here ? 'step' : undefined}
                            onClick={() => go(pt.key)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-meta font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              here ? 'border-primary bg-primary-soft text-primary-strong' : ok ? 'hover:bg-muted/60' : 'text-subtle-foreground',
                            )}
                          >
                            {ok ? <Check className="size-3.5 text-success" strokeWidth={3} aria-hidden="true" /> : null}
                            {pt.title}
                            <span className="sr-only">{ok ? '(confirmed)' : here ? '(current)' : '(not confirmed)'}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}

                <div className="mt-6">
                  {!settled ? (
                    <div role="status" aria-live="polite" className="rounded-xl border bg-muted/50 p-5">
                      <p className="flex items-center gap-2.5 text-item font-semibold">
                        <span className="relative flex size-2.5" aria-hidden="true"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" /><span className="relative inline-flex size-2.5 rounded-full bg-primary" /></span>
                        Assembling {cp.title.toLowerCase()}
                      </p>
                      <ol className="mt-4 flex flex-col gap-2 rounded-lg border bg-card p-4">
                        {events.map((e) => (
                          <li key={e} className="flex items-center gap-2.5 font-mono text-meta text-muted-foreground"><Check className="size-3.5 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />{e}</li>
                        ))}
                        {events.length < 5 && <li className="flex items-center gap-2.5 text-meta text-subtle-foreground"><Spinner className="size-3.5" />Working…</li>}
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
                      <p className="text-meta text-muted-foreground">{accepted ? 'Confirmed and written into the Worker.' : 'Proposed from the platform catalogue (offline mock). Nothing enters the Worker until it is confirmed.'}</p>
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
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                  <Button variant="outline" size="lg" disabled={index === 0} onClick={() => go(CHECKPOINTS[index - 1].key)}>
                    <ArrowLeft aria-hidden="true" />Back
                  </Button>
                  <span className="text-meta text-muted-foreground tabular-nums sm:ml-2">{progressLabel}</span>
                  <span className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
                    {accepted ? (
                      <>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={async () => {
                            const next = await reopenCheckpoint(draft.composition_id, cp.key)
                            setLocal(next)
                          }}
                        >
                          <PencilLine aria-hidden="true" />Edit
                        </Button>
                        <Button size="lg" onClick={() => go(CHECKPOINTS.find((c) => !draft.accepted.includes(c.key))?.key ?? 'summary')}>Continue</Button>
                      </>
                    ) : (
                      <Button size="lg" onClick={confirm} disabled={!settled || saving || attention || !proposal}>
                        {saving && <Spinner />}
                        {cp.button}
                      </Button>
                    )}
                  </span>
                </div>
                {accepted && <p className="text-meta text-muted-foreground">Editing restarts this stage and every later one; checkpoints from here on are no longer confirmed.</p>}
              </div>
            </>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-6">
          <ComposingPanel draft={draft} proposal={proposal} current={current} settled={settled} onGo={go} />
        </div>
      </div>
    </PageContainer>
  )
}
