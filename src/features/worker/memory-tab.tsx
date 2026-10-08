import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Fact, FactList } from '@/components/platform/fact-list'
import { Timestamp } from '@/components/platform/timestamp'
import type { WorkerWorkspace } from '@/lib/types/worker'

const DURABILITY: Record<string, string> = {
  EPHEMERAL: 'Ephemeral: destroyed every time the task is replaced',
  UNKNOWN: 'Not reported',
}

export function MemoryTab({ ws }: { ws: WorkerWorkspace }) {
  const w = ws.worker
  const m = ws.composition?.maturity
  const brain = ws.brain
  const serving = w.runtime.serving > 0
  const heldBack = brain?.compounding?.held_back ?? []

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
        <CardHeader className="pt-5">
          <CardTitle>Memory engine</CardTitle>
          <CardDescription>This Worker’s own memory. Separate from Knowledge, which is reviewed and shared across Workers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-5">
          {brain && <p className="text-body">{brain.detail}</p>}
          <FactList>
            <Fact label="Composed with">{w.brain.engine ? `${w.brain.engine} ${w.brain.composed_engine_version ?? ''}` : 'No memory engine'}</Fact>
            <Fact label="Durability">{brain ? brain.durability.detail : (DURABILITY[w.brain.durability] ?? w.brain.durability)}</Fact>
            <Fact label="Live state">
              {brain ? (
                <>Read <Timestamp iso={brain.observed_at} /></>
              ) : serving ? (
                'Not read in this view'
              ) : (
                <span className="text-muted-foreground">Not observed: no serving runtime</span>
              )}
            </Fact>
          </FactList>
          {brain && brain.unavailable.length > 0 && (
            <p className="text-meta text-muted-foreground">
              Not shown: {brain.unavailable.map((u) => u.section).join(', ')}. {brain.unavailable[0].reason}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
        <CardHeader className="pt-5">
          <CardTitle>What it has recorded</CardTitle>
          <CardDescription>The platform’s record of what this Worker added by running. Nothing here is approval or adoption.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-5">
          {!m || m.memories === 0 ? (
            <p className="text-body text-muted-foreground">{m && m.runs > 0 ? `No memory records yet from ${m.runs} runs.` : 'Nothing recorded yet. It has not completed a run.'}</p>
          ) : (
            <FactList>
              <Fact label="Memory records">
                {m.memories} from {m.runs} {m.runs === 1 ? 'run' : 'runs'}
                <span className="block text-meta text-muted-foreground">
                  {m.memory_kinds.episodic} episodic · {m.memory_kinds.semantic} semantic · {m.memory_kinds.procedural} procedural
                </span>
              </Fact>
              <Fact label="Agreed claims">{m.claims === 0 ? <span className="text-muted-foreground">None yet</span> : m.claims}</Fact>
              <Fact label="Proposed Skill changes">{m.skill_changes === 0 ? <span className="text-muted-foreground">None reported</span> : m.skill_changes}</Fact>
              <Fact label="Last run"><Timestamp iso={m.last_run_at} /></Fact>
            </FactList>
          )}

          {heldBack.length > 0 && (
            <section aria-labelledby="held-back" className="border-t pt-4">
              <h3 id="held-back" className="text-item">Held back from compounding</h3>
              <p className="mt-0.5 text-meta text-muted-foreground">
                Needs {brain!.compounding!.minimum_observations} agreeing runs{brain!.compounding!.requires_dod_met ? ' that met the Definition of Done' : ''} before it can be added.
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {heldBack.map((h) => (
                  <li key={h.key} className="flex items-baseline justify-between gap-3 text-body">
                    <span className="min-w-0 truncate">{h.skill} · {h.kind.replace(/-/g, ' ')}</span>
                    <span className="shrink-0 text-meta text-muted-foreground">{h.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Button asChild variant="outline" size="sm" className="self-start">
            <Link to={`/learning/workers/${w.composition_id}`}>
              Open Learning page
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
