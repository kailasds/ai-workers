// Learning: one set of records behind every Learning screen, built from the offline snapshot.
//   worker-portfolio     each Worker's memory records (count, runs, last recorded)
//   dashboard run ledger the runs those records came from (one memory record per run)
//   packageable          memory types, statements agreed across runs, proposed Skill changes
//   worker brain         items held back until enough runs agree
// Nothing is invented. Where the snapshot has a count but no contents, the record says so;
// a time the source does not give is "as of" the read, never an event time.

import packageable from '@/data/mock/packageable.json'
import brainA9 from '@/data/mock/worker-brain-a9cb82d0.json'
import skills from '@/data/mock/knowledge-skills.json'
import dashboard from '@/data/mock/dashboard-executive.json'
import { contextOf } from '@/features/compose/compose-model'
import { lessonsForRun } from './demo-lessons'
import { RUNS, SNAPSHOT_AT, WORKER_BY_ID, WORKERS, workerLabel } from '@/features/sentinel/demo/platform'
import type { PackageableComposition, WorkerBrain } from '@/lib/types/worker'

// ── Taxonomy ────────────────────────────────────────────────────────────────
// The categories are the platform's own: the memory engine's three memory types, the patterns
// a Worker may compound (worker-compounding-state-v1), and Skill changes. One definition serves
// the platform and every Worker; only the scope changes.

export type CategoryKey = 'experiences' | 'facts' | 'techniques' | 'patterns' | 'skill-changes'

export const CATEGORIES: { key: CategoryKey; label: string; one: string; about: string }[] = [
  { key: 'experiences', label: 'Run experiences', one: 'Run experience', about: 'What happened on one specific run, kept so the Worker can recall it. Also called episodic memory.' },
  { key: 'facts', label: 'Facts', one: 'Fact', about: 'Something the Worker holds to be generally true, beyond a single run. Also called semantic memory.' },
  { key: 'techniques', label: 'Techniques', one: 'Technique', about: 'A way of doing the work that the Worker can reuse. Also called procedural memory.' },
  { key: 'patterns', label: 'Patterns', one: 'Pattern', about: 'Something noticed across runs: a conversion pathway, a convention, a failure that repeats. It is kept only once enough runs agree.' },
  { key: 'skill-changes', label: 'Skill changes', one: 'Skill change', about: 'A change the Worker proposes to one of its Skills, from what its runs showed. A person decides; the shared Skill never changes on its own.' },
]
export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CategoryKey, (typeof CATEGORIES)[number]>
export const isCategory = (k: string | undefined): k is CategoryKey => Boolean(k && k in CATEGORY)

/** One vocabulary for where a learning item stands, each with a sentence on what it means. */
export const STATES = {
  recorded: { label: 'Recorded', tone: 'neutral', meaning: 'Saved from a run. No review has been reported for it.' },
  gathering: { label: 'Collecting evidence', tone: 'info', meaning: 'Noticed, not yet kept. It is kept only if enough runs agree.' },
  agreed: { label: 'Agreed across runs', tone: 'success', meaning: 'Enough runs agreed, so the Worker keeps it. It stays with this Worker; it isn’t shared.' },
  proposed: { label: 'Awaiting review', tone: 'warning', meaning: 'Proposed by the Worker. A person decides whether to adopt it; nothing changes until then.' },
} as const
export type StateKey = keyof typeof STATES

// ── Records ─────────────────────────────────────────────────────────────────

export interface Evidence {
  /** A run in the snapshot's run ledger. */
  run?: { ref: string; at: string; verdict: 'MET' | 'NOT_MET' | 'NOT_ADJUDICABLE'; seconds: number | null; tokens: number | null; cost: number | null }
  /** A plain statement from the source, e.g. progress towards the agreement rule. */
  note?: { label: string; value: string }
}

export interface LearningItem {
  id: string
  workerId: string
  category: CategoryKey
  state: StateKey
  title: string
  /** One or two plain sentences on what was learned. */
  summary: string
  /** Why it was recorded: the situation that produced it, from the source only. */
  why: string
  /** `at` is when it was recorded; `as_of` only says when the source was read. */
  when: { iso: string; kind: 'at' | 'as_of' }
  /** What the source holds about the item itself. Empty when the snapshot has only a count. */
  details: { label: string; value: string }[]
  evidence: Evidence[]
  /** Where it came from, in words. */
  source: string
  /** Explicit links: the Skill it is about, or the agreement statement's key. */
  skill?: { key: string; title: string }
  /** What happened to it so far, from the source; omitted when the source has no history. */
  history: { at: string | null; label: string }[]
  /** Demo content, not from the snapshot (see demo-lessons.ts). */
  demo?: boolean
  /** The demo lesson it records; Workers sharing one are related. */
  lesson?: string
}

const comps = (packageable as unknown as { compositions: PackageableComposition[] }).compositions
const COMP = new Map(comps.map((c) => [c.composition_id, c]))
const SKILL_TITLE = new Map((skills as unknown as { skills: { name: string; title: string }[] }).skills.map((s) => [s.name, s.title]))
export const skillTitle = (key: string) => SKILL_TITLE.get(key) ?? key
const BRAINS: Record<string, WorkerBrain> = { 'a9cb82d0-4508-4a8b-bd56-fbdbb856018b': brainA9 as unknown as WorkerBrain }

type LedgerRow = { run_ref: string; duration_seconds: number | null; total_tokens: { state: string; value: number | null } }
const LEDGER = new Map((dashboard as unknown as { run_ledger: { rows: LedgerRow[] } }).run_ledger.rows.map((r) => [r.run_ref, r]))

const VERDICT_WORDS = { MET: 'met the Definition of Done', NOT_MET: 'did not meet the Definition of Done', NOT_ADJUDICABLE: 'could not be judged against the Definition of Done' } as const
const KIND_WORDS: Record<string, string> = {
  'discovered-path': 'Discovered path',
  'application-behaviour': 'Application behaviour',
  conversion_pathway: 'Conversion pathway',
  target_convention: 'Target convention',
  failure_pattern: 'Failure pattern',
}
export const kindWords = (k: string) => KIND_WORDS[k] ?? k.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase())
/** A short headline from an agreed statement: its instruction, or what falls short. */
function claimHeadline(sentence: string) {
  const short = sentence.match(/, (.+?) is what falls short/)
  if (short) return `falls short on ${short[1].replace(/^the /, '')}`
  return sentence.split(/[:,]/)[0].replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())
}
const scopeOf = (workerId: string) => {
  const w = WORKER_BY_ID.get(workerId)
  return w ? contextOf(w.bounded_context.key)?.scope ?? w.bounded_context.label : ''
}
const runEvidence = (r: (typeof RUNS)[number]): Evidence => {
  const l = LEDGER.get(r.ref)
  return { run: { ref: r.ref, at: r.at, verdict: r.verdict, seconds: l?.duration_seconds ?? null, tokens: l?.total_tokens.state === 'OBSERVED' ? l.total_tokens.value : null, cost: r.cost } }
}

function build(): LearningItem[] {
  const items: LearningItem[] = []
  // How many demo lessons each Worker type has handed out so far, so they rotate evenly.
  const seq = new Map<string, number>()
  for (const w of WORKERS) {
    const id = w.composition_id
    const m = COMP.get(id)?.maturity

    // Run experiences: one memory record per run. The snapshot has one record for each of the
    // Worker's runs, so each record is tied to its run; its contents are not in the snapshot.
    if (w.learning.memories > 0) {
      const runs = RUNS.filter((r) => r.workerId === id).slice(-w.learning.memories)
      for (const r of runs) {
        items.push({
          id: `exp-${r.ref}`,
          workerId: id,
          category: 'experiences',
          state: 'recorded',
          title: `Run that ${VERDICT_WORDS[r.verdict]}`,
          summary: `The Worker kept a memory of this run (${scopeOf(id)}) so it can recall what happened next time.`,
          why: `Every run of this Worker leaves a memory record. This one came from a run that ${VERDICT_WORDS[r.verdict]}.`,
          when: { iso: r.at, kind: 'at' },
          details: [{ label: 'Memory contents', value: 'Not in this snapshot' }],
          evidence: [runEvidence(r)],
          source: w.brain.engine ? `Memory engine ${w.brain.engine}${w.brain.composed_engine_version ? ` ${w.brain.composed_engine_version}` : ''}` : 'Worker memory',
          history: [{ at: r.at, label: 'Recorded from the run' }],
        })
      }

      // Demo lessons: facts, techniques and patterns attached to this Worker's real runs.
      runs.forEach((r, i) => {
        const n = seq.get(w.worker_type) ?? 0
        const lessons = lessonsForRun(w.worker_type, i, n)
        seq.set(w.worker_type, n + lessons.length)
        for (const l of lessons) {
          const state: StateKey = l.category === 'facts' ? 'recorded' : l.category === 'techniques' && r.verdict === 'MET' ? 'agreed' : 'gathering'
          items.push({
            id: `demo-${l.key}-${r.ref}`,
            workerId: id,
            category: l.category,
            state,
            title: l.title,
            summary: l.summary,
            why: l.why,
            when: { iso: r.at, kind: 'at' },
            details: [
              { label: 'Kind', value: CATEGORY[l.category].one },
              { label: 'From a run that', value: VERDICT_WORDS[r.verdict] },
            ],
            evidence: [runEvidence(r)],
            source: 'Demo content',
            history: [{ at: r.at, label: state === 'agreed' ? 'Recorded and kept after the run met the Definition of Done' : 'Recorded from the run' }],
            demo: true,
            lesson: l.key,
          })
        }
      })
    }

    // Patterns agreed across runs: the source gives the statement, its kind and how many runs.
    for (const c of ((m as { claims_agreed?: unknown[] } | undefined)?.claims_agreed ?? []) as { key: string; kind: string; sentence: string; runs: number }[]) {
      const [lead, found] = c.sentence.split(/ What the scoring found: /)
      const runs = RUNS.filter((r) => r.workerId === id)
      items.push({
        id: `agr-${id.slice(0, 8)}-${c.key}`,
        workerId: id,
        category: 'patterns',
        state: 'agreed',
        title: `${kindWords(c.kind)}: ${claimHeadline(lead)}`,
        summary: lead.trim(),
        why: `${c.runs} runs agreed on it, which is what this Worker needs before it keeps a pattern.`,
        when: m?.learned_at ? { iso: m.learned_at, kind: 'at' } : { iso: SNAPSHOT_AT, kind: 'as_of' },
        details: [
          { label: 'Kind', value: kindWords(c.kind) },
          { label: 'Runs that agreed', value: String(c.runs) },
          ...(found ? [{ label: 'What the scoring found', value: found.replace(/^“|”$/g, '').trim() }] : []),
        ],
        evidence: [{ note: { label: 'Agreeing runs', value: `${c.runs}, not named` } }, ...runs.map(runEvidence)],
        source: 'Worker composition · statements agreed across runs',
        history: m?.learned_at ? [{ at: m.learned_at, label: `Kept after ${c.runs} runs agreed` }] : [],
      })
    }

    // Patterns still collecting evidence: held back until the agreement rule is met.
    const cmp = BRAINS[id]?.compounding
    for (const h of cmp?.held_back ?? []) {
      const rule = `Kept once ${cmp!.minimum_observations} runs agree${cmp!.requires_dod_met ? ', each meeting the Definition of Done' : ''}.`
      items.push({
        id: `held-${h.key}`,
        workerId: id,
        category: 'patterns',
        state: 'gathering',
        // Several held items can share a kind and Skill; the source's key tells them apart.
        title: `${kindWords(h.kind)} in ${skillTitle(h.skill)} · ${h.key.slice(0, 6)}`,
        summary: `The Worker noticed a ${kindWords(h.kind).toLowerCase()} while using the ${skillTitle(h.skill)} Skill. It is not kept yet.`,
        why: `It was seen in ${h.reason.replace(/\.$/, '').toLowerCase()}. ${rule}`,
        when: { iso: BRAINS[id].observed_at ?? SNAPSHOT_AT, kind: 'as_of' },
        details: [
          { label: 'Kind', value: kindWords(h.kind) },
          { label: 'Skill', value: skillTitle(h.skill) },
          { label: 'Progress', value: h.reason.replace(/\.$/, '') },
          { label: 'Rule', value: rule.replace(/\.$/, '') },
          { label: 'Item key', value: h.key },
        ],
        evidence: [{ note: { label: 'Runs so far', value: `${h.reason.replace(/ so far\.?$/, '').replace(/\.$/, '')}, not named` } }],
        source: 'Worker brain · held back until runs agree',
        skill: { key: h.skill, title: skillTitle(h.skill) },
        history: [],
      })
    }

    // Skill changes: the source gives how many were proposed, not what they say.
    if (m && m.skill_changes > 0) {
      const runs = RUNS.filter((r) => r.workerId === id)
      items.push({
        id: `skc-${id.slice(0, 8)}`,
        workerId: id,
        category: 'skill-changes',
        state: 'proposed',
        title: `${m.skill_changes} ${m.skill_changes === 1 ? 'change' : 'changes'} proposed to its Skills`,
        summary: `From its runs, the Worker proposed ${m.skill_changes === 1 ? 'a change' : `${m.skill_changes} changes`} to the Skills it was given. A person decides whether to adopt ${m.skill_changes === 1 ? 'it' : 'them'}.`,
        why: `Proposed after ${m.runs} ${m.runs === 1 ? 'run' : 'runs'}, ${m.runs_met} of which met the Definition of Done.`,
        when: m.learned_at ? { iso: m.learned_at, kind: 'at' } : { iso: m.last_run_at ?? SNAPSHOT_AT, kind: 'as_of' },
        details: [
          { label: 'Proposed changes', value: String(m.skill_changes) },
          { label: 'What they change', value: 'Not in this snapshot' },
        ],
        evidence: runs.map(runEvidence),
        source: 'Worker composition · proposed Skill changes',
        history: [],
      })
    }
  }
  return items.sort((a, b) => b.when.iso.localeCompare(a.when.iso) || a.id.localeCompare(b.id))
}

export const ITEMS: LearningItem[] = build()
export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]))
export { SNAPSHOT_AT, workerLabel }

// ── Periods ─────────────────────────────────────────────────────────────────
// Periods count back from when the snapshot was taken, so "last 7 days" means the week the data
// covers. Only items with a recorded time of their own fall in a period.

export const PERIODS = [
  { value: '7', label: 'Last 7 days', days: 7 },
  { value: '30', label: 'Last 30 days', days: 30 },
  { value: 'all', label: 'All learning', days: null },
] as const
export type PeriodKey = (typeof PERIODS)[number]['value']
export const periodOf = (v: string | null): PeriodKey => (PERIODS.some((p) => p.value === v) ? (v as PeriodKey) : '7')

export function inPeriod(i: LearningItem, period: PeriodKey) {
  const days = PERIODS.find((p) => p.value === period)!.days
  if (days === null) return true
  return i.when.kind === 'at' && new Date(SNAPSHOT_AT).getTime() - new Date(i.when.iso).getTime() <= days * 86_400_000
}

// ── Selectors ───────────────────────────────────────────────────────────────

export const itemsOf = (workerId: string, items = ITEMS) => items.filter((i) => i.workerId === workerId)

/** Records per category, in taxonomy order. Each item has exactly one category, so these add up. */
export function distribution(items: LearningItem[]) {
  return CATEGORIES.map((c) => ({ ...c, count: items.filter((i) => i.category === c.key).length }))
}

export interface WorkerLearning {
  workerId: string
  name: string
  scope: string
  /** Worker type key (quality-engineering, modernization). */
  type: string
  /** Business domain key from the composition; null when none was chosen. */
  domain: string | null
  total: number
  fresh: LearningItem[]
  latest: LearningItem | null
  /** Skill changes this Worker proposed that wait for a person, whatever the period. */
  review: number
  /** Why it needs a person, if it does: changes awaiting review or a runtime problem. */
  attention: string | null
}

/** Proposed Skill changes awaiting review, counted from the records. */
const reviewOf = (items: LearningItem[]) => items.filter((i) => i.state === 'proposed').reduce((n, i) => n + Number(i.details.find((d) => d.label === 'Proposed changes')?.value ?? 1), 0)

export const domainOfWorker = (workerId: string) => COMP.get(workerId)?.contents?.business_domain_key || null

export interface WorkerFilters {
  q?: string
  sort?: 'recent' | 'count'
  /** Worker type key; null or undefined for any. */
  type?: string | null
  /** Business domain key, 'none' for Workers without one; null or undefined for any. */
  domain?: string | null
  /** Type of learning: keeps Workers with new learning of this category, counting only that. */
  category?: CategoryKey | null
}

/** Workers with learning in the period, before search and filters. */
export function learningWorkers(period: PeriodKey): WorkerLearning[] {
  return WORKERS.map((w) => {
    const all = itemsOf(w.composition_id)
    const fresh = all.filter((i) => inPeriod(i, period))
    const review = reviewOf(all)
    const attention = w.runtime.attention > 0 ? 'A runtime reports a problem' : review > 0 ? `${review} Skill ${review === 1 ? 'change awaits' : 'changes await'} review` : null
    return { workerId: w.composition_id, name: workerLabel(w.composition_id), scope: scopeOf(w.composition_id), type: w.worker_type, domain: domainOfWorker(w.composition_id), total: all.length, fresh, latest: fresh[0] ?? null, review, attention }
  }).filter((r) => r.fresh.length > 0)
}

/** Workers with learning in the period, filtered. Those needing attention come first, then most recent (or most items). */
export function workersWithNew(period: PeriodKey, { q = '', sort = 'recent', type = null, domain = null, category = null }: WorkerFilters = {}): WorkerLearning[] {
  const needle = q.trim().toLowerCase()
  const rows = learningWorkers(period)
    .map((r) => {
      if (!category) return r
      const fresh = r.fresh.filter((i) => i.category === category)
      return { ...r, fresh, latest: fresh[0] ?? null }
    })
    .filter((r) => r.fresh.length > 0)
    .filter((r) => !type || r.type === type)
    .filter((r) => !domain || (domain === 'none' ? r.domain === null : r.domain === domain))
  const matched = needle ? rows.filter((r) => `${r.name} ${r.scope} ${r.fresh.map((i) => i.title).join(' ')}`.toLowerCase().includes(needle)) : rows
  return matched.sort((a, b) => Number(Boolean(b.attention)) - Number(Boolean(a.attention)) || (sort === 'count' ? b.fresh.length - a.fresh.length : 0) || b.latest!.when.iso.localeCompare(a.latest!.when.iso) || a.name.localeCompare(b.name))
}

/** Workers that contributed to a category, with how many items each. */
export function contributors(items: LearningItem[]) {
  const by = new Map<string, number>()
  for (const i of items) by.set(i.workerId, (by.get(i.workerId) ?? 0) + 1)
  return [...by].map(([workerId, count]) => ({ workerId, name: workerLabel(workerId), scope: scopeOf(workerId), count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export type Relation = 'same_lesson' | 'same_skill' | 'same_worker'
export const RELATION_LABEL: Record<Relation, string> = {
  same_lesson: 'Also learned by another Worker',
  same_skill: 'About the same Skill',
  same_worker: 'Also learned by this Worker',
}

/** Related items, by explicit links only: the same Skill (any Worker), then the same Worker. */
export function related(item: LearningItem, limit = 6): { item: LearningItem; relation: Relation }[] {
  const out: { item: LearningItem; relation: Relation }[] = []
  if (item.lesson) for (const i of ITEMS) if (i.lesson === item.lesson && i.workerId !== item.workerId && !out.some((o) => o.item.workerId === i.workerId)) out.push({ item: i, relation: 'same_lesson' })
  if (item.skill) for (const i of ITEMS) if (i.id !== item.id && i.skill?.key === item.skill.key) out.push({ item: i, relation: 'same_skill' })
  for (const i of itemsOf(item.workerId)) if (i.id !== item.id && !out.some((o) => o.item.id === i.id) && i.category !== 'experiences') out.push({ item: i, relation: 'same_worker' })
  return out.slice(0, limit)
}

export const workerScope = scopeOf
export const WORKER_BY_ID_SAFE = (id: string) => WORKER_BY_ID.get(id) ?? null
