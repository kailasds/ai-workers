// Compose drafts. MOCK: drafts are built from the captured packageable compositions and
// portfolio, then held in memory so creating a Worker, confirming checkpoints and archiving
// behave end to end in the browser. A reload restores the capture. Live mode would use
// `POST /compositions`, `/compositions/{id}/stage-runs`, `/compose/stage-runs/{id}/accept`.

import { ApiError } from './client'
import { mockRead } from './mock/read'
import { CHECKPOINTS, contextOf, SECTION_CHECKPOINT, type CheckpointKey } from '@/features/compose/compose-model'
import type { IdentityState, PackageableComposition, PortfolioWorker } from '@/lib/types/worker'

export interface Draft {
  composition_id: string
  name: string
  worker_type: string
  identity_key: string
  business_domain_key: string | null
  geography: string | null
  context_key: string
  growth_ceiling: string | null
  auto_assemble: boolean
  owner: string | null
  revision: number
  record_version: number
  status: 'ACTIVE' | 'ARCHIVED'
  created_at: string
  updated_at: string
  accepted: CheckpointKey[]
  attention: CheckpointKey[]
  issues: { code: string; message: string; section: string }[]
  package: PackageableComposition['package']
  identity: { status: IdentityState; bounded_scope: string; scope_excludes: string[] }
  contents: PackageableComposition['contents'] | null
  maturity: PackageableComposition['maturity'] | null
}


function fromCapture(p: PackageableComposition, portfolio: PortfolioWorker[]): Draft {
  const w = portfolio.find((x) => x.composition_id === p.composition_id)
  const order = CHECKPOINTS.map((c) => c.key)
  const attention = [...new Set(p.issues.map((i) => SECTION_CHECKPOINT[i.section]).filter(Boolean))] as CheckpointKey[]
  const firstBlocked = attention.length ? Math.min(...attention.map((k) => order.indexOf(k))) : order.length
  return {
    composition_id: p.composition_id,
    name: p.name,
    worker_type: w?.worker_type ?? (p.bounded_context_key.startsWith('qe-') ? 'quality-engineering' : 'modernization'),
    identity_key: p.bounded_context_key.startsWith('qe-') ? 'qe-test-script-generation' : 'integration-modernization',
    business_domain_key: p.contents.business_domain_key || null,
    geography: null,
    context_key: p.bounded_context_key,
    growth_ceiling: null,
    auto_assemble: true,
    owner: w?.owner ?? null,
    revision: p.revision,
    record_version: p.revision,
    status: 'ACTIVE',
    created_at: p.created_at,
    updated_at: p.updated_at,
    accepted: order.slice(0, firstBlocked),
    attention,
    issues: p.issues,
    package: p.package,
    identity: { status: p.identity.status, bounded_scope: p.identity.bounded_scope, scope_excludes: p.identity.scope_excludes },
    contents: p.contents,
    maturity: p.maturity,
  }
}

// The draft store is built from the capture on first use, so the capture stays out of the main bundle.
let store: Map<string, Draft> | null = null
let loading: Promise<Map<string, Draft>> | null = null
function draftStore() {
  if (store) return Promise.resolve(store)
  loading ??= Promise.all([import('@/data/mock/packageable.json'), import('@/data/mock/worker-portfolio.json')]).then(([pk, pf]) => {
    const packageable = (pk.default as unknown as { compositions: PackageableComposition[] }).compositions
    const portfolio = (pf.default as unknown as { workers: PortfolioWorker[] }).workers
    store = new Map(packageable.map((p) => [p.composition_id, fromCapture(p, portfolio)]))
    return store
  })
  return loading
}

export async function listDrafts(opts: { signal?: AbortSignal; scenario?: string | null } = {}) {
  const drafts = await draftStore()
  return mockRead(opts.scenario, () => [...drafts.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at)), opts.signal)
}

export async function getDraft(id: string, opts: { signal?: AbortSignal; scenario?: string | null } = {}) {
  const drafts = await draftStore()
  return mockRead(
    opts.scenario,
    () => {
      const d = drafts.get(id)
      if (!d) throw new ApiError(404, 'This draft was not found. It may have been archived.', 'NOT_FOUND')
      return d
    },
    opts.signal,
  )
}

export interface Declaration {
  name: string
  worker_type: string
  identity_key: string
  business_domain_key: string | null
  geography: string | null
  context_key: string
  growth_ceiling: string | null
  auto_assemble: boolean
}

/** Confirm identity: creates the draft and reserves its identity. Never creates twice for one call. */
export async function createDraft(decl: Declaration): Promise<Draft> {
  const drafts = await draftStore()
  await new Promise((r) => setTimeout(r, 700))
  const ctx = contextOf(decl.context_key)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const draft: Draft = {
    composition_id: id,
    ...decl,
    name: decl.name.trim() || `${ctx?.label ?? 'New Worker'}${decl.business_domain_key ? ` · ${decl.business_domain_key}` : ''}`,
    owner: 'Offline Demo Capture',
    revision: 1,
    record_version: 1,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now,
    accepted: [],
    attention: [],
    issues: [],
    package: null,
    identity: { status: 'PROVISIONED', bounded_scope: ctx?.includes ?? '', scope_excludes: ctx?.excludes ?? [] },
    contents: null,
    maturity: null,
  }
  drafts.set(id, draft)
  return structuredClone(draft)
}

/** Writes a checkpoint's acceptance. Optimistic concurrency: a stale record version is refused. */
export async function acceptCheckpoint(id: string, key: CheckpointKey, recordVersion: number): Promise<Draft> {
  const drafts = await draftStore()
  await new Promise((r) => setTimeout(r, 500))
  const d = drafts.get(id)
  if (!d) throw new ApiError(404, 'This draft was not found.')
  if (d.record_version !== recordVersion) throw new ApiError(409, 'This draft changed. Reload before saving.', 'CONFLICT')
  if (!d.accepted.includes(key)) d.accepted = [...d.accepted, key]
  d.attention = d.attention.filter((k) => k !== key)
  d.revision += 1
  d.record_version += 1
  d.updated_at = new Date().toISOString()
  return structuredClone(d)
}

/** Editing a decision restarts that stage and every later one. */
export async function reopenCheckpoint(id: string, key: CheckpointKey): Promise<Draft> {
  const drafts = await draftStore()
  await new Promise((r) => setTimeout(r, 300))
  const d = drafts.get(id)
  if (!d) throw new ApiError(404, 'This draft was not found.')
  const order = CHECKPOINTS.map((c) => c.key)
  const from = order.indexOf(key)
  d.accepted = d.accepted.filter((k) => order.indexOf(k) < from)
  d.record_version += 1
  return structuredClone(d)
}

export async function archiveDraft(id: string, recordVersion: number): Promise<void> {
  const drafts = await draftStore()
  await new Promise((r) => setTimeout(r, 500))
  const d = drafts.get(id)
  if (!d) throw new ApiError(404, 'This draft was not found.')
  if (d.package) throw new ApiError(409, 'A Package exists for this draft, so it cannot be archived.')
  if (d.record_version !== recordVersion) throw new ApiError(412, 'This draft changed in another session. Refresh the list, then archive it again.')
  d.status = 'ARCHIVED'
}

/** MOCK: records the sealed Package once a simulated build finishes. */
export async function markPackaged(id: string) {
  const drafts = await draftStore()
  const d = drafts.get(id)
  if (!d) return
  d.package = { id: crypto.randomUUID(), status: 'DRAFT_READY', composition_revision: d.revision, created_at: new Date().toISOString() }
}

export const PACKAGE_PHASES = [
  'Validate accepted revision',
  'Seal identity and instructions',
  'Render deterministic pipeline',
  'Pack agents, skills and Harness',
  'Bind EVALs, Definition of Done and governance',
  'Store package and integrity digest',
]
