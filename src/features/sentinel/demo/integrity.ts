import type { Decision, Policy } from './types'

// Demo integrity: a hash chain over this browser's decision records. It shows how a chain detects
// an edited or removed record. It is NOT the platform's audit cryptography and proves nothing
// about a production system.

/** 64-bit FNV-1a, as 16 hex characters. Deterministic and dependency-free; not cryptographic. */
export function demoHash(input: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193 ^ 0x5bd1e995
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ c, 0x01000197) >>> 0
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
}

/** The fields a decision's hash covers: everything except the integrity block itself. */
export function decisionBody(d: Decision): string {
  const { integrity: _ignored, ...body } = d
  return JSON.stringify(body)
}

export const policyHash = (p: Policy) => demoHash(JSON.stringify(p))

export function sealDecision(d: Omit<Decision, 'integrity'>, prev: string | null, policy: Policy): Decision {
  const draft = { ...d, integrity: null } as Decision
  return { ...draft, integrity: { hash: demoHash(`${prev ?? 'genesis'}|${decisionBody(draft)}`), prev, policyHash: policyHash(policy), inputs: [...d.evidence.runs, ...d.evidence.refs] } }
}

export type ChainState = 'verified' | 'failed' | 'incomplete' | 'not_available'

export interface ChainResult {
  state: ChainState
  checked: number
  failedAt: string | null
  /** Per-decision result, by id. */
  each: Record<string, ChainState>
}

/** Recompute every hash in sequence order and check each one links to the one before. */
export function verifyChain(decisions: Decision[]): ChainResult {
  const ordered = [...decisions].sort((a, b) => a.seq - b.seq)
  const each: Record<string, ChainState> = {}
  if (ordered.length === 0) return { state: 'not_available', checked: 0, failedAt: null, each }
  let prev: string | null = null
  let failedAt: string | null = null
  let missing = false
  for (const d of ordered) {
    if (!d.integrity) {
      each[d.id] = 'not_available'
      missing = true
      continue
    }
    const expected = demoHash(`${prev ?? 'genesis'}|${decisionBody(d)}`)
    const ok = d.integrity.prev === prev && d.integrity.hash === expected
    each[d.id] = ok && !failedAt ? 'verified' : 'failed'
    if (!ok && !failedAt) failedAt = d.id
    prev = d.integrity.hash
  }
  return { state: failedAt ? 'failed' : missing ? 'incomplete' : 'verified', checked: ordered.length, failedAt, each }
}
