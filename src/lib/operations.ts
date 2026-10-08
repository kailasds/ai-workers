// Background work (P-22 / P-23). A tiny client store of durable operations so long work stays
// visible from anywhere, survives navigation, and ends in a persistent notice that says how it
// ended and links to where it left something. MOCK: operations are simulated in the browser;
// live mode would read `/delivery-operations` and `/workflows/{id}` instead.

import { useSyncExternalStore } from 'react'

export type OperationState = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'

export interface Operation {
  id: string
  label: string
  subject: string
  state: OperationState
  phase: string
  progress: number
  startedAt: string
  /** Where the work left something to look at. */
  href: string
  dismissed?: boolean
}

let operations: Operation[] = []
const listeners = new Set<() => void>()
const emit = () => {
  operations = [...operations]
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useOperations() {
  return useSyncExternalStore(subscribe, () => operations, () => operations)
}

export function getOperation(id: string) {
  return operations.find((o) => o.id === id) ?? null
}

/** Starts (or, for an identical key, rejoins) a simulated durable operation. */
export function startOperation({ key, label, subject, phases, href, failAt, onSucceed }: { key: string; label: string; subject: string; phases: string[]; href: string; failAt?: number; onSucceed?: () => void }): Operation {
  const existing = operations.find((o) => o.id === key && (o.state === 'RUNNING' || o.state === 'QUEUED'))
  if (existing) return existing
  const op: Operation = { id: key, label, subject, state: 'QUEUED', phase: phases[0], progress: 0, startedAt: new Date().toISOString(), href }
  operations = [op, ...operations.filter((o) => o.id !== key)]
  emit()
  let step = 0
  const tick = () => {
    const current = operations.find((o) => o.id === key)
    if (!current || current.state === 'CANCELLED') return
    if (failAt !== undefined && step === failAt) {
      Object.assign(current, { state: 'FAILED' as const, phase: phases[step] })
      emit()
      return
    }
    if (step >= phases.length) {
      Object.assign(current, { state: 'SUCCEEDED' as const, progress: 100, phase: 'Finished' })
      onSucceed?.()
      emit()
      return
    }
    Object.assign(current, { state: 'RUNNING' as const, phase: phases[step], progress: Math.round((step / phases.length) * 100) })
    emit()
    step += 1
    setTimeout(tick, 1400)
  }
  setTimeout(tick, 500)
  return op
}

export function cancelOperation(id: string) {
  const op = operations.find((o) => o.id === id)
  if (op && (op.state === 'RUNNING' || op.state === 'QUEUED')) {
    op.state = 'CANCELLED'
    emit()
  }
}

export function dismissOperation(id: string) {
  const op = operations.find((o) => o.id === id)
  if (op) {
    op.dismissed = true
    emit()
  }
}
