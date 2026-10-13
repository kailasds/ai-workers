import type { Draft } from '@/lib/api/compose'
import type { CustomerPackage, RuntimeRecord } from '@/lib/types/worker'

// One definition of where a composition sits in the pipeline, shared by the Registry's KPI band,
// its stage tabs and the Packaging queues, so the three never count differently.

export type Queue = 'work' | 'packaged' | 'deployed'

export function queueOf(d: Draft, records: RuntimeRecord[]): Queue {
  if (!d.package) return 'work'
  return records.some((r) => r.composition_id === d.composition_id && r.state !== 'TERMINATED') ? 'deployed' : 'packaged'
}

/** Compositions waiting for a Package and with nothing blocking one. */
export const readyToPackage = (drafts: Draft[], records: RuntimeRecord[]) =>
  drafts.filter((d) => d.status === 'ACTIVE' && queueOf(d, records) === 'work' && d.issues.length === 0)

/** Sealed Packages with no customer delivery record yet. */
export const readyToPrepare = (drafts: Draft[], packages: CustomerPackage[]) => {
  const delivered = new Set(packages.map((p) => p.composition_id))
  return drafts.filter((d) => d.status === 'ACTIVE' && d.package?.status === 'DRAFT_READY' && !delivered.has(d.composition_id))
}

/** A customer said they have it. Not proof they deployed it. */
export const acknowledged = (packages: CustomerPackage[]) => packages.filter((p) => p.state === 'ACKNOWLEDGED')
