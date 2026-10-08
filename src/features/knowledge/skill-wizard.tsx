import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, Check, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { cn } from '@/lib/utils'

const STEPS = ['What it is', 'The body', 'What it carries', 'How to judge it', 'Checks', 'Who may load it'] as const
const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/
const PATH = /^[A-Za-z0-9._/-]+$/

interface FileEntry { path: string; content: string }

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {(error || hint) && <p id={`${id}-hint`} className={cn('text-meta', error ? 'text-destructive' : 'text-muted-foreground')}>{error ?? hint}</p>}
    </div>
  )
}

// Write or revise a Skill. "Nothing is published unchecked": the checks run on the platform
// against the exact bytes that would be written, and the publish quotes that digest. This
// offline console cannot run them, so it can draft a Skill but never publish one.
export function SkillWizard() {
  const [params] = useSearchParams()
  const revising = params.get('revise')
  const [step, setStep] = useState(0)
  const [name, setName] = useState(revising ?? '')
  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [useWhen, setUseWhen] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [goal, setGoal] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [hardFails, setHardFails] = useState('')

  const dims = dimensions.split('\n').map((d) => d.trim()).filter(Boolean)
  const paths = files.map((f) => f.path.trim())
  const fileError = paths.some((p) => !p) ? 'Every file needs a path.' : paths.some((p) => !PATH.test(p)) ? 'Letters, digits, dots, hyphens, underscores and slashes.' : new Set(paths).size !== paths.length ? 'Two files in one package cannot share a path.' : null

  const valid = [
    KEY.test(name) && title.trim() && purpose.trim() && useWhen.trim(),
    body.trim().length > 40,
    !fileError,
    goal.trim() && dims.length >= 3 && dims.length <= 6,
    false,
    false,
  ]
  const reachable = (i: number) => valid.slice(0, i).every(Boolean)

  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Knowledge', to: '/knowledge/skills' }, { label: revising ? 'Revise a Skill' : 'Write a Skill' }]} title={revising ? `Revise ${revising}` : 'Write a Skill'} description="A Skill is a body, a contract and its references. Nothing is published unchecked." />

      <div className="grid items-start gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <ol className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s} className="shrink-0">
              <button
                type="button"
                disabled={!reachable(i)}
                onClick={() => setStep(i)}
                aria-current={step === i ? 'step' : undefined}
                className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:text-muted-foreground disabled:hover:bg-transparent', step === i && 'bg-accent font-medium shadow-[inset_3px_0_0_var(--primary)]')}
              >
                <span className={cn('grid size-5 shrink-0 place-items-center rounded-full text-meta tabular-nums', valid[i] ? 'bg-brand text-brand-foreground' : 'bg-muted')}>{valid[i] ? <Check className="size-3" aria-hidden="true" /> : i + 1}</span>
                <span className="whitespace-nowrap">{s}</span>
              </button>
            </li>
          ))}
        </ol>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b p-6">
            <p className="text-overline text-muted-foreground uppercase">Step {step + 1} of {STEPS.length}</p>
            <h2 className="mt-1 text-section">{STEPS[step]}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            {step === 0 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="sk-name" label="Name" hint="A key that goes into a package and a path. Lowercase, hyphenated." error={name && !KEY.test(name) ? 'Lowercase letters and digits, joined by hyphens.' : null}>
                    <Input id="sk-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="tibco-fault-paths" disabled={Boolean(revising)} aria-describedby="sk-name-hint" />
                  </Field>
                  <Field id="sk-title" label="Title" hint="What people read in lists.">
                    <Input id="sk-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-describedby="sk-title-hint" />
                  </Field>
                </div>
                <Field id="sk-purpose" label="Purpose" hint="One or two sentences on what it teaches.">
                  <Textarea id="sk-purpose" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-describedby="sk-purpose-hint" />
                </Field>
                <Field id="sk-use" label="Use when" hint="One trigger sentence per line.">
                  <Textarea id="sk-use" rows={3} value={useWhen} onChange={(e) => setUseWhen(e.target.value)} aria-describedby="sk-use-hint" />
                </Field>
              </>
            )}
            {step === 1 && (
              <Field id="sk-body" label="The body (markdown)" hint={`${body.trim().length} characters · more than 40 needed. A generic body published to the registry every Worker reads would be followed, so there is no partial draft.`}>
                <Textarea id="sk-body" rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-meta" aria-describedby="sk-body-hint" />
              </Field>
            )}
            {step === 2 && (
              <>
                <p className="text-meta text-muted-foreground">Companion files: references/, templates/, rules/. A hand-written skill-card.md is kept as is.</p>
                {files.length === 0 && <p className="text-body text-muted-foreground">No companion files. The body travels on its own.</p>}
                {files.map((f, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-xl border p-4">
                    <div className="flex gap-2">
                      <Input value={f.path} onChange={(e) => setFiles((fs) => fs.map((x, j) => (j === i ? { ...x, path: e.target.value } : x)))} placeholder="references/fault-paths.md" aria-label={`Path of file ${i + 1}`} />
                      <Button variant="ghost" size="icon" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} aria-label={`Remove file ${i + 1}`}><Trash2 aria-hidden="true" /></Button>
                    </div>
                    <Textarea rows={4} value={f.content} onChange={(e) => setFiles((fs) => fs.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))} className="font-mono text-meta" aria-label={`Content of file ${i + 1}`} />
                  </div>
                ))}
                {fileError && <p className="text-meta text-destructive">{fileError}</p>}
                <Button variant="outline" className="self-start" onClick={() => setFiles((fs) => [...fs, { path: '', content: '' }])}><Plus aria-hidden="true" />Add a file</Button>
              </>
            )}
            {step === 3 && (
              <>
                <Field id="sk-goal" label="Goal" hint="What a good answer achieves.">
                  <Textarea id="sk-goal" rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} aria-describedby="sk-goal-hint" />
                </Field>
                <Field id="sk-dims" label="Dimensions" hint={`${dims.length} declared · 3 to 6, one per line, tuned to this Skill.`} error={dims.length > 6 ? 'At most six dimensions.' : null}>
                  <Textarea id="sk-dims" rows={5} value={dimensions} onChange={(e) => setDimensions(e.target.value)} aria-describedby="sk-dims-hint" />
                </Field>
                <Field id="sk-fails" label="Hard fails" hint="What would make an answer wrong however well it reads? One per line.">
                  <Textarea id="sk-fails" rows={3} value={hardFails} onChange={(e) => setHardFails(e.target.value)} aria-describedby="sk-fails-hint" />
                </Field>
              </>
            )}
            {step >= 4 && (
              <Alert className="border-warning/30 bg-warning/5">
                <ShieldAlert className="text-warning" aria-hidden="true" />
                <AlertTitle className="text-item">Checks cannot run in this console</AlertTitle>
                <AlertDescription>
                  Structure, contract, duplication and security checks run on the platform against the exact bytes that would be written, and publishing quotes that digest. This console runs on captured data, so the Skill cannot be checked or published from here. Your draft stays on this page.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="gap-3 p-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft aria-hidden="true" />Back</Button>
            {step < 4 ? (
              <Button className="ml-auto" disabled={!valid[step]} onClick={() => setStep((s) => s + 1)}>
                {STEPS[step + 1]}<ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button className="ml-auto" disabled>Publish</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  )
}
