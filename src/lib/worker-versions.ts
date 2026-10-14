import type { CustomerPackage, PortfolioWorker, WorkerVersion } from '@/lib/types/worker'

/**
 * A Worker's versions: every composition with its name and bounded context, grouped by
 * revision (customer packages name their version by revision too, e.g. "r12"). Each version
 * carries its builds, newest first, and the customer packages prepared from any of them.
 */
export function workerVersions(worker: PortfolioWorker, workers: PortfolioWorker[], packages: CustomerPackage[]): WorkerVersion[] {
  const same = workers.filter((w) => w.name === worker.name && w.bounded_context.key === worker.bounded_context.key)
  const byRevision = new Map<number, PortfolioWorker[]>()
  for (const w of same) byRevision.set(w.revision, [...(byRevision.get(w.revision) ?? []), w])
  return [...byRevision.entries()]
    .sort(([a], [b]) => b - a)
    .map(([revision, builds]) => {
      const ids = new Set(builds.map((b) => b.composition_id))
      return {
        revision,
        builds: builds.sort((a, b) => b.created_at.localeCompare(a.created_at)),
        deliveries: packages.filter((p) => ids.has(p.composition_id)).sort((a, b) => (b.last_evidence_at ?? '').localeCompare(a.last_evidence_at ?? '')),
      }
    })
}
