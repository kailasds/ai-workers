// What becomes of a learning item, and how a Worker grows from it. The path follows the
// platform's own rules (worker-compounding-state-v1):
//   - a run leaves a memory the Worker recalls in later runs;
//   - something seen in enough agreeing runs that met the Definition of Done is kept as knowledge;
//   - knowledge may extend a Skill (examples, pitfalls, checks) through a Skill change a person
//     approves; a Skill's intent, scope and Definition of Done never change this way;
//   - an approved Skill change ships in a new Worker revision.
// Where an item stands comes from its recorded state; nothing here marks a step done that the
// data doesn't show.

import { RUNS } from '@/features/sentinel/demo/platform'
import { itemsOf, type CategoryKey, type LearningItem, type StateKey } from './model'

export const MIN_RUNS = 3

export type Destination = 'memory' | 'knowledge' | 'skill'
export const DESTINATION: Record<Destination, { label: string; use: string }> = {
  memory: { label: 'Memory', use: 'Recalled when a similar run starts' },
  knowledge: { label: 'Knowledge', use: 'Applied in every later run' },
  skill: { label: 'Skill', use: 'Part of the Skill the Worker runs with' },
}

const STEPS: Record<CategoryKey, string[]> = {
  experiences: ['Recorded', 'Recalled in later runs', 'Part of a pattern'],
  facts: ['Recorded', 'Agreed across runs', 'Proposed for a Skill', 'In the Skill'],
  techniques: ['Recorded', 'Agreed across runs', 'Proposed for a Skill', 'In the Skill'],
  patterns: ['Collecting evidence', 'Agreed across runs', 'Proposed for a Skill', 'In the Skill'],
  'skill-changes': ['Proposed', 'Approved by a person', 'In the Skill', 'New Worker revision'],
}

const AT: Record<StateKey, number> = { recorded: 0, gathering: 0, agreed: 1, proposed: 0 }

export interface Journey {
  steps: { label: string; status: 'done' | 'current' | 'next' }[]
  becomes: Destination
  /** What it takes to reach the next step, in a few words. */
  next: string | null
}

export function journey(item: LearningItem): Journey {
  const labels = STEPS[item.category]
  const at = AT[item.state]
  const steps = labels.map((label, i) => ({ label, status: i < at ? ('done' as const) : i === at ? ('current' as const) : ('next' as const) }))
  if (item.category === 'experiences') return { steps, becomes: 'memory', next: `${MIN_RUNS} agreeing runs that met the Definition of Done` }
  if (item.category === 'skill-changes') return { steps, becomes: 'skill', next: 'A person’s approval' }
  const agreed = item.state === 'agreed'
  return { steps, becomes: agreed ? 'knowledge' : 'memory', next: agreed ? 'A Skill change, approved by a person' : `${MIN_RUNS} agreeing runs that met the Definition of Done` }
}

// ── Evolution ───────────────────────────────────────────────────────────────

export interface Evolution {
  memory: number
  knowledge: number
  skillChanges: number
  runs: { ref: string; at: string; verdict: 'MET' | 'NOT_MET' | 'NOT_ADJUDICABLE'; cost: number | null; learned: number }[]
  /** Earlier half of its runs against the recent half; null with fewer than four runs. */
  effect: { met: [number, number]; cost: [number | null, number | null] } | null
}

const metRate = (rs: { verdict: string }[]) => (rs.length ? rs.filter((r) => r.verdict === 'MET').length / rs.length : 0)
const avgCost = (rs: { cost: number | null }[]) => {
  const c = rs.filter((r) => r.cost !== null)
  return c.length ? c.reduce((n, r) => n + (r.cost ?? 0), 0) / c.length : null
}

export function evolution(workerId: string): Evolution {
  const items = itemsOf(workerId)
  const runs = RUNS.filter((r) => r.workerId === workerId).map((r) => ({ ref: r.ref, at: r.at, verdict: r.verdict, cost: r.cost, learned: items.filter((i) => i.evidence.some((e) => e.run?.ref === r.ref)).length }))
  const half = Math.floor(runs.length / 2)
  const early = runs.slice(0, half)
  const recent = runs.slice(runs.length - half)
  return {
    memory: items.filter((i) => i.category === 'experiences').length,
    knowledge: items.filter((i) => i.state === 'agreed').length,
    skillChanges: items.filter((i) => i.category === 'skill-changes').reduce((n, i) => n + Number(i.details.find((d) => d.label === 'Proposed changes')?.value ?? 1), 0),
    runs,
    effect: runs.length >= 4 ? { met: [metRate(early), metRate(recent)], cost: [avgCost(early), avgCost(recent)] } : null,
  }
}
