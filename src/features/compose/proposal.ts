// What each checkpoint proposes, derived from the captured catalogues (Skills, languages,
// EVALs, DoD rubrics, harness manifests). MOCK ASSEMBLY: the real platform streams these from
// server stage runs; here they are selected by the same keys the captured Workers carry.

import type { DodRubric, DslDomain, Evaluation, Harness, KnowledgeSkill } from '@/lib/types/catalog'
import type { Draft } from '@/lib/api/compose'
import { contextOf, domainOf } from './compose-model'

export interface Catalogs {
  skills: KnowledgeSkill[]
  dsl: DslDomain[]
  evals: Evaluation[]
  rubrics: DodRubric[]
  harnesses: Harness[]
}

export function proposalFor(d: Draft, c: Catalogs) {
  const qe = d.worker_type === 'quality-engineering'
  const ctx = contextOf(d.context_key)
  const counts = d.contents
  const harness = c.harnesses.find((h) => h.display_name === ctx?.harness) ?? null

  const skills = (qe
    ? c.skills.filter((s) => s.name.startsWith('qe-'))
    : c.skills.filter((s) => s.category === 'modernisation' || /spring/i.test(s.name))
  )
    .sort((a, b) => b.worker_count - a.worker_count)
    .slice(0, counts?.skills || 5)

  const prefix = domainOf(d.business_domain_key)?.dslPrefix
  const dslPool = qe ? c.dsl.filter((x) => x.path.startsWith('Cross-industry > Quality engineering')) : c.dsl.filter((x) => prefix && x.path.startsWith(prefix))
  const languages = dslPool.slice(0, Math.max(counts?.languages ?? 1, 1))

  const evals = c.evals.filter((e) => (qe ? e.id.startsWith('qe.') : e.id.startsWith('codeplus.') || e.id.startsWith('modernisation.'))).slice(0, counts?.evaluations || 10)

  const withTests = d.context_key.includes('-tests')
  const rubrics = c.rubrics
    .filter((r) => {
      const ref = r.skill_ref ?? ''
      if (qe) return ref.startsWith('qe-') || r.criterion_key === 'script-intent-fidelity'
      if (r.criterion_key === 'ut-coverage') return withTests
      return ref.startsWith('dod-tibco') || r.criterion_key === 'build' || r.criterion_key === 'codebleu-score'
    })
    .sort((a, b) => Number(b.gating_by_default) - Number(a.gating_by_default))
    .slice(0, counts?.dod_criteria || 6)

  return {
    context: ctx,
    harness,
    procedure: harness?.manifest?.stages ?? [],
    models: { routing: 'Pinned', maker: 'claude-sonnet-5', verifier: 'gemini-2.5-pro-cto-oth' },
    skills,
    languages,
    evals,
    rubrics,
    memory: { engine: 'GBrain 0.48.1.0', durability: 'Ephemeral: destroyed every time the task is replaced', minimumObservations: 3, requiresDodMet: true, types: ['episodic', 'semantic', 'procedural'] },
    autonomy: { mode: counts?.operating_mode || 'bounded', level: 3, sentinel: 'Shadow: records its decisions and applies none' },
  }
}

export type Proposal = ReturnType<typeof proposalFor>
