import { useMemo } from 'react'
import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getHarnesses, getSkillLibrary } from '@/lib/api/catalog'
import { getDraft } from '@/lib/api/compose'
import { proposalFor, type Catalogs } from '../compose/proposal'

/**
 * What the Worker is composed from, read the way Compose reads it: its composition record and the
 * parts proposed from the catalogues. The Package and Knowledge tabs share this one read.
 */
export function useComposition(id: string, scenario: string | null) {
  const draft = useResource(`draft:${id}:${scenario}`, (signal) => getDraft(id, { signal, scenario }))
  // Same key as Compose, so moving between the two reads the catalogues once.
  const catalogs = useResource('compose-catalogs', async (signal): Promise<Catalogs> => {
    const [s, d, e, r, h] = await Promise.all([getSkillLibrary({ signal }), getDslDomains({ signal }), getEvaluations({ signal }), getDodRubrics({ signal }), getHarnesses({ signal })])
    return { skills: s.skills, dsl: d.domains, evals: e.evaluations, rubrics: r.rubrics, harnesses: h.harnesses }
  })
  const proposal = useMemo(() => (draft.data && catalogs.data ? proposalFor(draft.data, catalogs.data) : null), [draft.data, catalogs.data])
  return { draft, catalogs, proposal }
}

export type Composition = ReturnType<typeof useComposition>
