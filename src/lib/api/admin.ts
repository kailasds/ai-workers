// People, groups, roles and features. MOCK: the offline capture returned `session_expired` for
// `/admin/users` and `/admin/catalog`, so these come from the console's own test fixtures
// (docs/product-context/screens/admin-people-groups.md) plus the captured session identity.
// Writes change an in-memory copy only.

import { ApiError } from './client'
import { mockRead } from './mock/read'

export interface Feature { key: string; label: string; group: string; description: string }
export interface Role { key: string; label: string; description: string; features: string[] }
export interface Group { id: string; slug: string; name: string; description: string; defaultRole: string | null; defaultInternetAccess: boolean; features: string[]; memberCount: number }
export interface Person {
  id: string
  email: string
  username: string
  displayName: string
  role: string
  status: 'invited' | 'active' | 'disabled'
  groups: string[]
  grants: string[]
  denies: string[]
  internetAccess: boolean
  invitedBy: string | null
  invitedAt: string | null
  activatedAt: string | null
  lastActiveAt: string | null
  lastInviteStatus: 'sent' | 'failed' | 'skipped' | null
}

export const FEATURES: Feature[] = [
  { key: 'compose.view', label: 'See Compose', group: 'Compose', description: 'Open Compose and read drafts.' },
  { key: 'compose.author', label: 'Compose and edit Workers', group: 'Compose', description: 'Create drafts and confirm checkpoints.' },
  { key: 'workers.view', label: 'See Workers', group: 'Workers', description: 'Open the Registry and Worker pages.' },
  { key: 'workers.build', label: 'Build Packages', group: 'Workers', description: 'Seal a composed Worker into a Package.' },
  { key: 'workers.deploy', label: 'Deploy Workers', group: 'Workers', description: 'Deploy a Package under a spending limit.' },
  { key: 'workers.operate', label: 'Operate Workers', group: 'Workers', description: 'Stop, resume and deploy again.' },
  { key: 'workers.retire', label: 'Retire Workers', group: 'Workers', description: 'Terminate runtimes and revoke identities.' },
  { key: 'evidence.view', label: 'Read evidence', group: 'Evidence', description: 'Runs, decisions and Definition of Done results.' },
  { key: 'evidence.export', label: 'Export evidence', group: 'Evidence', description: 'Download evidence for review.' },
  { key: 'environment.manage', label: 'Manage environments', group: 'Environment', description: 'Configure where Workers run.' },
  { key: 'users.manage', label: 'Manage people', group: 'Administration', description: 'Invite people and set their access.' },
]

export const ROLES: Role[] = [
  { key: 'administrator', label: 'Administrator', description: 'Everything, including people and access.', features: FEATURES.map((f) => f.key) },
  { key: 'composer', label: 'Composer', description: 'Composes and edits Workers. Cannot deploy or run them.', features: ['compose.view', 'compose.author', 'workers.view', 'evidence.view'] },
  { key: 'operator', label: 'Operator', description: 'Builds, deploys and runs Workers. Cannot change what a Worker is.', features: ['compose.view', 'workers.view', 'workers.build', 'workers.deploy', 'workers.operate', 'evidence.view', 'environment.manage'] },
  { key: 'viewer', label: 'Viewer', description: 'Reads Compose and the Registry.', features: ['compose.view', 'workers.view'] },
  { key: 'auditor', label: 'Auditor', description: 'Reads evidence and exports it.', features: ['compose.view', 'workers.view', 'evidence.view', 'evidence.export'] },
]

const groups: Group[] = [
  { id: 'g-bfsi', slug: 'bfsi-reviewers', name: 'BFSI reviewers', description: 'Reads evidence for the quarterly review.', defaultRole: 'viewer', defaultInternetAccess: false, features: ['evidence.view', 'evidence.export'], memberCount: 2 },
]

const people: Person[] = [
  { id: 'p-offline', email: 'offline-demo-capture@tcs.example', username: 'offline-demo-capture', displayName: 'Offline Demo Capture', role: 'administrator', status: 'active', groups: [], grants: [], denies: [], internetAccess: true, invitedBy: null, invitedAt: null, activatedAt: '2026-10-06T08:45:00Z', lastActiveAt: '2026-10-06T08:45:39Z', lastInviteStatus: null },
  { id: 'p-dana', email: 'dana.okafor@tcs.example', username: 'dana.okafor', displayName: 'Dana Okafor', role: 'composer', status: 'active', groups: ['g-bfsi'], grants: [], denies: [], internetAccess: false, invitedBy: 'Offline Demo Capture', invitedAt: '2026-09-20T09:00:00Z', activatedAt: '2026-09-20T11:12:00Z', lastActiveAt: null, lastInviteStatus: 'sent' },
]

export function effectiveFeatures(p: Pick<Person, 'role' | 'groups' | 'grants' | 'denies'>) {
  const inherited = inheritedFeatures(p)
  return new Set([...[...inherited].filter((f) => !p.denies.includes(f)), ...p.grants])
}
export function inheritedFeatures(p: Pick<Person, 'role' | 'groups'>) {
  const role = ROLES.find((r) => r.key === p.role)
  return new Set([...(role?.features ?? []), ...groups.filter((g) => p.groups.includes(g.id)).flatMap((g) => g.features)])
}

export const listPeople = (signal?: AbortSignal) => mockRead(null, () => people, signal)
export const getPerson = (id: string, signal?: AbortSignal) => mockRead(null, () => people.find((p) => p.id === id) ?? null, signal)
export const listGroups = (signal?: AbortSignal) => mockRead(null, () => groups, signal)

export async function savePerson(input: Omit<Person, 'id' | 'status' | 'invitedBy' | 'invitedAt' | 'activatedAt' | 'lastActiveAt' | 'lastInviteStatus'> & { id?: string }): Promise<Person> {
  await new Promise((r) => setTimeout(r, 500))
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) throw new ApiError(422, 'Enter a work email address.')
  if (input.id) {
    const p = people.find((x) => x.id === input.id)
    if (!p) throw new ApiError(404, 'That did not save.')
    Object.assign(p, input)
    return structuredClone(p)
  }
  const p: Person = { ...input, id: crypto.randomUUID(), status: 'invited', invitedBy: 'Offline Demo Capture', invitedAt: new Date().toISOString(), activatedAt: null, lastActiveAt: null, lastInviteStatus: 'skipped' }
  people.push(p)
  return structuredClone(p)
}

export async function setPersonEnabled(id: string, enabled: boolean) {
  await new Promise((r) => setTimeout(r, 400))
  const p = people.find((x) => x.id === id)
  if (!p) throw new ApiError(404, 'That did not work.')
  p.status = enabled ? (p.activatedAt ? 'active' : 'invited') : 'disabled'
}

export async function saveGroup(input: Omit<Group, 'id' | 'slug' | 'memberCount'> & { id?: string }): Promise<Group> {
  await new Promise((r) => setTimeout(r, 400))
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!input.name.trim()) throw new ApiError(422, 'Give the group a name.')
  if (!slug) throw new ApiError(422, 'The name needs at least one letter or digit.')
  if (input.id) {
    const g = groups.find((x) => x.id === input.id)!
    Object.assign(g, input, { slug })
    return structuredClone(g)
  }
  const g: Group = { ...input, id: crypto.randomUUID(), slug, memberCount: 0 }
  groups.push(g)
  return structuredClone(g)
}

export async function deleteGroup(id: string) {
  await new Promise((r) => setTimeout(r, 400))
  const i = groups.findIndex((g) => g.id === id)
  if (i < 0) throw new ApiError(404, 'That group was not removed.')
  groups.splice(i, 1)
}
