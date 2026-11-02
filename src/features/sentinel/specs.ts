// Plain helpers shared by Sentinel screens (kept apart from components for fast refresh).

import { useMemo } from 'react'
import { verifyChain } from './demo/integrity'
import { workerLabel } from './demo/platform'
import { actions, useDemo } from './demo/store'
import type { DemoState } from './demo/types'
import type { ActionSpec } from './ui'

/** The current search params with one drawer param set: drawers open over the page, filters kept. */
export function withParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params)
  for (const k of ['worker', 'agreement', 'control']) next.delete(k)
  next.set(key, value)
  return { search: next.toString() }
}

/** Stopping a Worker, said the same way wherever it is offered. */
export function stopSpec(s: DemoState, id: string): ActionSpec {
  const linked = s.agreements.filter((a) => (a.status === 'agreed' || a.status === 'active') && (a.sourceId === id || a.targetId === id)).length
  return {
    title: `Stop ${workerLabel(id)}`,
    consequences: [
      'The Worker may not start new runs until it is resumed.',
      s.policy.suspendSharingOnStop ? `Its agreed and active sharing agreements (${linked}) are suspended, as platform policy says.` : 'Its sharing agreements are not changed (platform policy).',
      'A stop is added under Controls and recorded in the Decision log.',
    ],
    confirmLabel: 'Stop Worker',
    destructive: true,
    run: (r) => actions.stopWorker(id, r),
    done: 'Worker stopped',
  }
}

export const resumeSpec = (id: string): ActionSpec => ({
  title: `Resume ${workerLabel(id)}`,
  consequences: ['The stop is lifted and the Worker may start runs again.', 'Sharing agreements suspended because of the stop stay suspended; resume them one by one.', 'A Resume decision is recorded, linked to the stop.'],
  confirmLabel: 'Resume Worker',
  run: (r) => actions.resumeWorker(id, r),
  done: 'Worker resumed',
})


/** The decision record's integrity check, recomputed whenever the record changes. */
export function useChain() {
  const { decisions } = useDemo()
  return useMemo(() => verifyChain(decisions), [decisions])
}
