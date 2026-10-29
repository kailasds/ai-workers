// Learning view model. Every event and figure here is derived from a real read:
//   worker-portfolio-v1   per-Worker memory records (count, runs, last recorded)
//   worker-brain-v1       items held back while they gather evidence, proposed Skill changes
//   platform-sentinel-overview-v1  the Platform Sentinel's decision stream
//   knowledge-skills      Skill titles, so a learning item reads by name rather than by key
// Nothing is invented: a time the source does not give is null, a review the source does not
// report is "not reported", and a Worker whose brain was not read is counted as not read.

import type { PlatformSentinelOverview } from '@/lib/types/catalog'
import type { BrainRead, PortfolioWorker } from '@/lib/types/worker'

export const LEARNING_VIEWS = [
  { value: 'activity', label: 'Activity', to: '/learning' },
  { value: 'knowledge', label: 'Knowledge gained', to: '/learning/knowledge' },
  { value: 'evolution', label: 'Evolution', to: '/learning/evolution' },
]

export type EventKind = 'memory' | 'held' | 'skill_change' | 'decision'

export const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: 'memory', label: 'Memory recorded' },
  { value: 'held', label: 'Pattern noticed' },
  { value: 'skill_change', label: 'Skill change proposed' },
  { value: 'decision', label: 'Sentinel decision' },
]

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

/** One vocabulary for learning states, each with what it means in a sentence. */
export const STATUSES = {
  recorded: { label: 'Recorded', tone: 'neutral', meaning: 'Saved from a run. The Worker’s Sentinel hasn’t reported a review of it.' },
  gathering: { label: 'Gathering evidence', tone: 'info', meaning: 'Noticed, but held back until enough runs agree. Not used yet.' },
  proposed: { label: 'Proposed', tone: 'info', meaning: 'Suggested by the Worker. People decide whether to adopt it.' },
  kept: { label: 'Kept', tone: 'success', meaning: 'The Worker’s Sentinel approved it, and the Worker now uses it.' },
  applied: { label: 'Applied', tone: 'success', meaning: 'Confirmed by the Worker it was sent to.' },
  recorded_decision: { label: 'Recorded, not applied', tone: 'neutral', meaning: 'Written down by the Platform Sentinel. No Worker has confirmed acting on it.' },
} as const satisfies Record<string, { label: string; tone: Tone; meaning: string }>

export type StatusKey = keyof typeof STATUSES

export interface WorkerRef {
  id: string
  name: string
  /** Short id, shown when another Worker has the same name. */
  short: string | null
}

export interface LearningEvent {
  id: string
  kind: EventKind
  status: StatusKey
  /** True only when a person has to do something. Most learning events are informational. */
  attention: boolean
  /** `at` is when it happened; `as_of` is only when the source was read. Null: not reported. */
  when: { iso: string; kind: 'at' | 'as_of' } | null
  worker: WorkerRef | null
  title: string
  /** What the event is about, in words (a Skill title, a count). */
  subject: string
  source: string
  facts: { label: string; value: string; mono?: boolean }[]
  /** Underlying items behind a grouped row; each stays inspectable. */
  items?: { label: string; id: string; state: string }[]
  /** Where the runs behind it can be opened, when the Worker is known. */
  runsLink?: string
}

/** Names repeat across Workers; the short id tells same-named ones apart. */
export function workerRefs(workers: PortfolioWorker[]) {
  const counts = new Map<string, number>()
  for (const w of workers) counts.set(w.name, (counts.get(w.name) ?? 0) + 1)
  const refs = new Map<string, WorkerRef>()
  for (const w of workers) refs.set(w.composition_id, { id: w.composition_id, name: w.name, short: (counts.get(w.name) ?? 0) > 1 ? w.composition_id.slice(0, 8) : null })
  return refs
}

const KIND_WORDS: Record<string, string> = {
  'discovered-path': 'Discovered path',
  'application-behaviour': 'Application behaviour',
  conversion_pathway: 'Conversion pathway',
  target_convention: 'Target convention',
  failure_pattern: 'Failure pattern',
}
export const kindWords = (k: string) => KIND_WORDS[k] ?? k.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase())

export interface HeldItem {
  key: string
  kind: string
  skill: string
  skillTitle: string
  reason: string
  worker: WorkerRef | null
  asOf: string | null
  rule: string
}

/** Items a Worker's brain is holding back until enough runs agree. */
export function heldItems(brains: BrainRead[], refs: Map<string, WorkerRef>, skillTitle: (key: string) => string): HeldItem[] {
  return brains.flatMap((b) => {
    const c = b.brain?.compounding
    if (!c) return []
    const rule = `Kept once ${c.minimum_observations} runs agree${c.requires_dod_met ? ', each meeting the Definition of Done' : ''}`
    return c.held_back.map((h) => ({ key: h.key, kind: h.kind, skill: h.skill, skillTitle: skillTitle(h.skill), reason: h.reason.replace(/\.$/, ''), worker: refs.get(b.id) ?? null, asOf: b.brain?.observed_at ?? null, rule }))
  })
}

/** Held items that share a Worker, a Skill and a state are one learning activity, not five rows. */
export function groupHeld(items: HeldItem[]) {
  const groups = new Map<string, HeldItem[]>()
  for (const h of items) {
    const k = `${h.worker?.id ?? '?'}|${h.skill}|${h.reason}`
    groups.set(k, [...(groups.get(k) ?? []), h])
  }
  return [...groups.values()]
}

export function buildEvents(workers: PortfolioWorker[], brains: BrainRead[], overview: PlatformSentinelOverview | null, skillTitle: (key: string) => string): LearningEvent[] {
  const refs = workerRefs(workers)
  const events: LearningEvent[] = []

  for (const w of workers) {
    if (w.learning.memories <= 0) continue
    const m = w.learning
    events.push({
      id: `memory:${w.composition_id}`,
      kind: 'memory',
      status: 'recorded',
      attention: false,
      when: m.last_at ? { iso: m.last_at, kind: 'at' } : null,
      worker: refs.get(w.composition_id) ?? null,
      title: `${m.memories} memory ${m.memories === 1 ? 'record' : 'records'} from ${m.runs} ${m.runs === 1 ? 'run' : 'runs'}`,
      subject: '',
      source: w.brain.engine ? `${w.brain.engine}${w.brain.composed_engine_version ? ` ${w.brain.composed_engine_version}` : ''}` : 'Worker memory',
      facts: [
        { label: 'Records', value: String(m.memories) },
        { label: 'From runs', value: String(m.runs) },
        { label: 'Survives a restart', value: w.brain.durability === 'EPHEMERAL' ? 'No — cleared when the task is replaced' : w.brain.durability ? 'Yes' : 'Not reported' },
      ],
      runsLink: `/workers/${w.composition_id}?view=runs`,
    })
  }

  for (const group of groupHeld(heldItems(brains, refs, skillTitle))) {
    const h = group[0]
    events.push({
      id: `held:${h.worker?.id ?? 'unknown'}:${h.skill}`,
      kind: 'held',
      status: 'gathering',
      attention: false,
      when: h.asOf ? { iso: h.asOf, kind: 'as_of' } : null,
      worker: h.worker,
      title: group.length === 1 ? `${kindWords(h.kind)} noticed` : `${group.length} patterns noticed`,
      subject: h.skillTitle,
      source: 'Worker brain',
      facts: [
        { label: 'Skill', value: h.skillTitle },
        { label: 'Progress', value: h.reason },
        { label: 'Rule', value: h.rule },
      ],
      items: group.map((x) => ({ label: kindWords(x.kind), id: x.key, state: x.reason })),
      runsLink: h.worker ? `/workers/${h.worker.id}?view=runs` : undefined,
    })
  }

  for (const b of brains) {
    const changes = (b.brain?.compounding?.skill_changes ?? []) as { skill?: string; claim?: string }[]
    changes.forEach((c, i) =>
      events.push({
        id: `skill:${b.id}:${i}`,
        kind: 'skill_change',
        status: 'proposed',
        attention: true,
        when: b.brain?.observed_at ? { iso: b.brain.observed_at, kind: 'as_of' } : null,
        worker: refs.get(b.id) ?? null,
        title: 'Change proposed to a Skill',
        subject: c.skill ? skillTitle(c.skill) : 'Skill not named',
        source: 'Worker brain',
        facts: c.claim ? [{ label: 'What the runs agreed', value: c.claim }] : [],
        runsLink: `/workers/${b.id}?view=runs`,
      }),
    )
  }

  for (const d of overview?.stream ?? []) {
    events.push({
      id: `decision:${d.id}`,
      kind: 'decision',
      status: d.applied ? 'applied' : 'recorded_decision',
      attention: false,
      when: { iso: d.at, kind: 'at' },
      worker: null,
      title: d.headline,
      subject: d.dimension,
      source: 'Platform Sentinel',
      facts: [{ label: 'Severity', value: d.severity }],
    })
  }

  // Newest first; items with only an "as of" time follow their read time; unknown times last.
  return events.sort((a, b) => (b.when?.iso ?? '').localeCompare(a.when?.iso ?? ''))
}

export const PERIODS = [
  { value: '30', label: 'Last 30 days', days: 30 },
  { value: '90', label: 'Last 90 days', days: 90 },
]

/** A period keeps only events with a known time of their own; an "as of" read time is not an event time. */
export function inPeriod(e: LearningEvent, days: number, now = Date.now()) {
  return e.when?.kind === 'at' && now - new Date(e.when.iso).getTime() <= days * 86_400_000
}

// ── Evolution ───────────────────────────────────────────────────────────────

export const EVOLUTION_STATES = [
  { label: 'Proposed', meaning: 'A change has been suggested.' },
  { label: 'Approved', meaning: 'Agreed. The Worker doesn’t work this way yet.' },
  { label: 'Applied', meaning: 'The Worker now works at the new capability.' },
]
