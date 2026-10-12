// The campus is a projection of real reads, never of invented activity. Every figure is a
// registered Worker; every learning mote stands for a memory a Worker actually recorded; the
// Sentinel→Brain stream is held because the Platform Sentinel records and applies nothing.

import { useResource } from '@/hooks/use-resource'
import { getDodRubrics, getDslDomains, getEvaluations, getHarnesses, getSentinelOverview, getSkillLibrary } from '@/lib/api/catalog'
import { listDrafts, type Draft } from '@/lib/api/compose'
import { getCustomerPackages, getWorkerPortfolio } from '@/lib/api/workers'
import type { PortfolioWorker } from '@/lib/types/worker'

export type PlaceKind = 'room' | 'build' | 'dock' | 'workshop'

export interface Place {
  key: string
  kind: PlaceKind
  /** Short name on the campus label. */
  name: string
  /** Full product name (bounded context label, area name). */
  title: string
  /** One-line purpose under the label. */
  caption: string
  color: string
  size: number
  x: number
  y: number
  /** Where this place opens. */
  href: string
  workers: PortfolioWorker[]
}

export interface WorldData {
  places: Place[]
  workers: PortfolioWorker[]
  brain: { skills: number; languages: number; evals: number; dod: number }
  memories: number
  learningWorkers: number
  sentinel: { acting: boolean; why: string; needsReview: number; running: number }
  drafts: { inBuild: number; packaged: number }
  /** Compositions that have a Package (from the packageable read). */
  packagedIds: Set<string>
  /** What each composition is made of, for the inside-the-Worker view. */
  contentsById: Map<string, NonNullable<Draft['contents']>>
  deliveries: number
  harnesses: number
  totals: { workers: number; serving: number; attention: number; packaged: number }
}

// Rooms take the hues the product already uses for its four bounded contexts.
const ROOM_HUES: Record<string, { color: string; name: string }> = {
  'qe-testcases-to-executed-scripts': { color: '#3b82f6', name: 'Test automation' },
  'tibco-bw-to-spring-boot-services': { color: '#f59e0b', name: 'Target code' },
  'tibco-bw-to-spring-boot-services-tests': { color: '#10b981', name: 'Unit-tested code' },
  'tibco-bw-to-spring-boot-services-tests-traceability': { color: '#a855f7', name: 'Traced code' },
}

/** Campus layout: the brain at the centre, the Sentinel ring around it, places on an outer ring. */
export const RING = { brain: 120, sentinel: 250, places: 640 }

function layout(n: number, i: number) {
  // Start top-left of the isometric view and go clockwise.
  const a = -Math.PI * 0.75 + (i / n) * Math.PI * 2
  return { x: Math.cos(a) * RING.places, y: Math.sin(a) * RING.places }
}

export function buildWorld(input: {
  workers: PortfolioWorker[]
  contexts: { key: string; label: string; workers: number }[]
  skills: number
  languages: number
  evals: number
  dod: number
  drafts: Draft[]
  deliveries: number
  harnesses: number
  sentinel: { acting: boolean; why: string; needsReview: number; running: number }
}): WorldData {
  const rooms = input.contexts.map((c) => ({
    key: c.key,
    kind: 'room' as const,
    name: ROOM_HUES[c.key]?.name ?? c.label,
    title: c.label,
    caption: `${c.workers} Worker${c.workers === 1 ? '' : 's'}`,
    color: ROOM_HUES[c.key]?.color ?? '#64748b',
    size: 300,
    href: `/campus/rooms/${c.key}`,
    workers: input.workers.filter((w) => w.bounded_context.key === c.key),
  }))
  const inBuild = input.drafts.filter((d) => !d.package && d.status === 'ACTIVE').length
  const packaged = input.drafts.filter((d) => d.package).length
  const facilities = [
    { key: 'build', kind: 'build' as const, name: 'Build bay', title: 'Compose', caption: `${inBuild} in build`, color: '#38bdf8', size: 250, href: '/campus/places/build', workers: [] },
    { key: 'dock', kind: 'dock' as const, name: 'Loading dock', title: 'Packaging and delivery', caption: `${packaged} packaged · ${input.deliveries} delivered`, color: '#f472b6', size: 250, href: '/campus/places/dock', workers: [] },
    { key: 'workshop', kind: 'workshop' as const, name: 'Workshop', title: 'Harnesses', caption: `${input.harnesses} harnesses`, color: '#94a3b8', size: 230, href: '/campus/places/workshop', workers: [] },
  ]
  // Order around the ring: workshop → rooms → dock → build bay.
  const ordered = [facilities[2], ...rooms, facilities[1], facilities[0]]
  const places: Place[] = ordered.map((p, i) => ({ ...p, ...layout(ordered.length, i) }))
  const memories = input.workers.reduce((s, w) => s + w.learning.memories, 0)
  return {
    places,
    workers: input.workers,
    brain: { skills: input.skills, languages: input.languages, evals: input.evals, dod: input.dod },
    memories,
    learningWorkers: input.workers.filter((w) => w.learning.memories > 0).length,
    sentinel: input.sentinel,
    drafts: { inBuild, packaged },
    packagedIds: new Set(input.drafts.filter((d) => d.package).map((d) => d.composition_id)),
    contentsById: new Map(input.drafts.flatMap((d) => (d.contents ? [[d.composition_id, d.contents] as const] : []))),
    deliveries: input.deliveries,
    harnesses: input.harnesses,
    totals: {
      workers: input.workers.length,
      serving: input.workers.filter((w) => w.runtime.serving > 0).length,
      attention: input.workers.filter((w) => w.runtime.attention > 0).length,
      packaged,
    },
  }
}

export function useWorldData() {
  return useResource('world', async (signal): Promise<WorldData> => {
    const [portfolio, skills, dsl, evals, rubrics, drafts, packages, harnesses, sentinel] = await Promise.all([
      getWorkerPortfolio({ signal }),
      getSkillLibrary({ signal }),
      getDslDomains({ signal }),
      getEvaluations({ signal }),
      getDodRubrics({ signal }),
      listDrafts({ signal }),
      getCustomerPackages({ signal }),
      getHarnesses({ signal }),
      getSentinelOverview({ signal }),
    ])
    return buildWorld({
      workers: portfolio.workers,
      contexts: portfolio.bounded_contexts,
      skills: skills.skills.length,
      languages: dsl.domains.length,
      evals: evals.evaluations.length,
      dod: rubrics.rubrics.length,
      drafts,
      deliveries: packages.length,
      harnesses: harnesses.harnesses.length,
      sentinel: { acting: sentinel.mode.acting, why: sentinel.mode.why ?? '', needsReview: sentinel.needs_review, running: sentinel.coverage.running },
    })
  })
}

// ── 3D layout: world px → scene units, and a desk for every Worker ────────────
export const UNIT = 40
export const to3 = (v: number) => v / UNIT

/** A Worker's desk inside its room, in scene units relative to the room's centre. */
export function seatOf(roomSize: number, index: number) {
  const s = to3(roomSize)
  const cols = 6
  const col = index % cols
  const row = Math.floor(index / cols)
  const pitchX = (s - 2.2) / (cols - 1)
  return { x: -s / 2 + 1.5 + col * pitchX, z: -s / 2 + 1.9 + row * 1.15 }
}

/** Where a Worker sits on the campus, in scene units. */
export function workerPosition(world: WorldData, compositionId: string) {
  const room = world.places.find((p) => p.workers.some((w) => w.composition_id === compositionId))
  if (!room) return null
  const seat = seatOf(room.size, room.workers.findIndex((w) => w.composition_id === compositionId))
  return { room, x: to3(room.x) + seat.x, z: to3(room.y) + seat.z }
}

/** Which place a route belongs to, so the camera can fly there. A `?worker=` zooms to that desk. */
export function focusFor(pathname: string, world: WorldData | null, search = ''): { place: string | null; worker: string | null } {
  const seg = pathname.split('/').filter(Boolean)
  const [a, b, c] = seg
  const worker = new URLSearchParams(search).get('worker')
  if (a === 'campus' && b === 'rooms' && c) return { place: c, worker }
  if (a === 'campus' && b === 'places' && c) return { place: c, worker: null }
  if (a === 'workers' && b) {
    const w = world?.workers.find((x) => x.composition_id === b || x.runtime.reachable_worker_id === b)
    return { place: w?.bounded_context.key ?? null, worker: w?.composition_id ?? null }
  }
  if (a === 'compose') return { place: 'build', worker: null }
  if (a === 'packaging' || a === 'customer-delivery') return { place: 'dock', worker: null }
  if (a === 'harnesses') return { place: 'workshop', worker: null }
  if (a === 'knowledge' || a === 'learning') return { place: 'brain', worker: null }
  if (a === 'sentinel') return { place: 'sentinel', worker: null }
  return { place: null, worker: null }
}
