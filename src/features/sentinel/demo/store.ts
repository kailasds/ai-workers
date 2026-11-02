import { useSyncExternalStore } from 'react'
import * as engine from './engine'
import { buildSeed } from './seed'
import type { DemoState, Override, OverrideField, Policy } from './types'

// One shared demo state for every Sentinel screen (and the Registry / Worker badges that show a
// stop). Saved in this browser; if storage is unavailable it lives in memory for the session.

const KEY = 'aiw.sentinel-demo.v1'
export const YOU = { kind: 'administrator' as const, name: 'You (administrator, demo)' }

function readSaved(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    return parsed && parsed.version === 1 && Array.isArray(parsed.decisions) ? parsed : null
  } catch {
    return null
  }
}

function save(state: DemoState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

let state: DemoState = (typeof window !== 'undefined' && readSaved()) || buildSeed()
let persisted = typeof window !== 'undefined' ? save(state) : false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

export const getDemo = () => state
/** Whether changes are being saved in this browser (false: they last until the page is closed). */
export const isPersisted = () => persisted

function commit(r: engine.Result): engine.Result {
  if (r.ok) {
    state = r.state
    persisted = save(state)
    emit()
  }
  return r
}

const ctx = (): engine.Ctx => ({ at: new Date().toISOString(), actor: YOU })

export const actions = {
  stopWorker: (id: string, reason: string) => commit(engine.stopWorker(state, id, reason, ctx())),
  resumeWorker: (id: string, reason: string) => commit(engine.resumeWorker(state, id, reason, ctx())),
  approveAgreement: (id: string, reason: string) => commit(engine.approveAgreement(state, id, reason, ctx())),
  rejectAgreement: (id: string, reason: string) => commit(engine.rejectAgreement(state, id, reason, ctx())),
  suspendAgreement: (id: string, reason: string) => commit(engine.suspendAgreement(state, id, reason, ctx())),
  resumeAgreement: (id: string, reason: string) => commit(engine.resumeAgreement(state, id, reason, ctx())),
  revokeAgreement: (id: string, reason: string) => commit(engine.revokeAgreement(state, id, reason, ctx())),
  reviewDecision: (id: string, verdict: 'approve' | 'reject', reason: string) => commit(engine.reviewDecision(state, id, verdict, reason, ctx())),
  savePolicy: (next: Policy, reason: string) => commit(engine.savePolicy(state, next, reason, ctx())),
  setOverride: (o: Omit<Override, 'at' | 'setBy'>) => commit(engine.setOverride(state, o, ctx())),
  removeOverride: (workerId: string, field: OverrideField, reason: string) => commit(engine.removeOverride(state, workerId, field, reason, ctx())),
  /** Hides an informational finding from Needs attention. It never lifts a control or closes a review. */
  dismissFinding: (id: string) => {
    if (state.dismissed.includes(id)) return
    state = { ...state, dismissed: [...state.dismissed, id] }
    persisted = save(state)
    emit()
  },
  reset: () => {
    state = buildSeed()
    persisted = save(state)
    emit()
  },
}

/** For tests: replace the state directly. */
export function __setDemo(next: DemoState) {
  state = next
  emit()
}
