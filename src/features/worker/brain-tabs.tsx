import { Link } from 'react-router'
import { ArrowRight, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Fact, FactList } from '@/components/platform/fact-list'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import type { WorkerWorkspace } from '@/lib/types/worker'

const DURABILITY: Record<string, string> = {
  EPHEMERAL: 'Ephemeral: destroyed every time the task is replaced',
  UNKNOWN: 'Not reported',
}

/** Brain activity: the Worker's own memory engine, live state and what it is holding back. */
export function BrainTab({ ws }: { ws: WorkerWorkspace }) {
  const w = ws.worker
  const brain = ws.brain
  const serving = w.runtime.serving > 0
  const heldBack = brain?.compounding?.held_back ?? []

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <Card className="gap-4 p-5">
        <h2 className="text-section">Memory engine</h2>
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
      </Card>

      <Card className="gap-4 p-5">
        <h2 className="text-section">Held back from compounding</h2>
        {heldBack.length === 0 ? (
          <p className="text-body text-muted-foreground">{brain ? 'Nothing is held back.' : 'Not observed: the brain was not read.'}</p>
        ) : (
          <>
            <p className="text-meta text-muted-foreground">
              Needs {brain!.compounding!.minimum_observations} agreeing runs{brain!.compounding!.requires_dod_met ? ' that met the Definition of Done' : ''}.
            </p>
            <ul className="flex flex-col gap-2">
              {heldBack.map((h) => (
                <li key={h.key} className="flex items-baseline justify-between gap-3 rounded-block bg-muted px-3 py-2.5 text-body">
                  <span className="min-w-0 truncate">{h.skill} · {h.kind.replace(/-/g, ' ')}</span>
                  <span className="shrink-0 text-meta text-muted-foreground">{h.reason}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}

/** Learning: what the Worker added by running. A record, never approval or adoption. */
export function LearningTab({ ws }: { ws: WorkerWorkspace }) {
  const w = ws.worker
  const m = ws.composition?.maturity
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-section">What it has recorded</h2>
        <Button asChild variant="secondary" size="sm">
          <Link to={`/learning/workers/${w.composition_id}`}>
            Open in Learning
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      {!m || m.memories === 0 ? (
        <EmptyState icon={BrainCircuit} title={m && m.runs > 0 ? `No memory records yet from ${m.runs} runs` : 'Nothing recorded yet'} />
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
          <Fact label="Last learned"><Timestamp iso={m.learned_at ?? m.last_run_at} /></Fact>
        </FactList>
      )}
    </Card>
  )
}
