import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PortfolioWorker } from '@/lib/types/worker'
import type { WorldData } from '../world-data'
import type { LabelSpec } from './screen-labels'

const VERDICT: Record<string, string> = { MET: 'Last run met the bar', NOT_MET: 'Last run did not meet the bar', NOT_ADJUDICABLE: 'Last run could not be judged' }

/** The parts of a Worker, from its composition and its brain. Unknown is "not reported", never 0. */
export function partsOf(world: WorldData, worker: PortfolioWorker) {
  const c = world.contentsById.get(worker.composition_id)
  return [
    { key: 'skills', label: 'Skills', value: c?.skills, color: '#60a5fa' },
    { key: 'languages', label: 'Languages', value: c?.languages, color: '#c4a5ff' },
    { key: 'evals', label: 'EVALs', value: c?.evaluations, color: '#fbbf24' },
    { key: 'dod', label: 'DoD criteria', value: c?.dod_criteria, color: '#34d399' },
    { key: 'memories', label: 'Memories', value: worker.learning.memories as number | undefined, color: '#fb923c' },
  ]
}

/** Where each part floats: an arc over the desk, opening toward the camera. */
const partPosition = (i: number, n: number, x: number, z: number): [number, number, number] => {
  const a = Math.PI * 0.95 + (i / (n - 1)) * Math.PI * 1.1
  return [x + Math.cos(a) * 1.25, 1.55 + Math.sin(i * 1.3) * 0.18, z + Math.sin(a) * 1.25]
}

/** The 3D half of looking inside a Worker: a scan beam, a turning ring and a glowing orb per part. */
export function WorkerHologram({ world, worker, x, z, animate }: { world: WorldData; worker: PortfolioWorker; x: number; z: number; animate: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const orbs = useRef<THREE.Group>(null)
  const parts = partsOf(world, worker)
  useFrame(({ clock }, dt) => {
    if (!animate) return
    if (ring.current) ring.current.rotation.z += dt * 0.8
    orbs.current?.children.forEach((o, i) => (o.position.y = partPosition(i, parts.length, 0, 0)[1] + Math.sin(clock.elapsedTime * 1.8 + i) * 0.05))
  })
  return (
    <group>
      <mesh position={[x, 1.3, z]} raycast={() => null}>
        <cylinderGeometry args={[0.9, 0.9, 2.6, 40, 1, true]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={ring} position={[x, 1.25, z]} rotation-x={-Math.PI / 2} raycast={() => null}>
        <torusGeometry args={[1.25, 0.012, 8, 96, Math.PI * 1.6]} />
        <meshBasicMaterial color="#bae6fd" toneMapped={false} />
      </mesh>
      <group ref={orbs}>
        {parts.map((p, i) => {
          const [px, py, pz] = partPosition(i, parts.length, x, z)
          return (
            <mesh key={p.key} position={[px, py, pz]} raycast={() => null}>
              <icosahedronGeometry args={[0.09, 1]} />
              <meshBasicMaterial color={p.color} toneMapped={false} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

/** The DOM half: a chip per part and the Worker's card, drawn in the label layer. */
export function hologramLabels(world: WorldData, worker: PortfolioWorker, x: number, z: number, roomKey: string, inWorkspace: boolean, onNavigate: (href: string) => void): LabelSpec[] {
  const parts = partsOf(world, worker)
  const c = world.contentsById.get(worker.composition_id)
  const serving = worker.runtime.serving > 0
  const packaged = world.packagedIds.has(worker.composition_id)
  const chips: LabelSpec[] = parts.map((p, i) => {
    const [px, py, pz] = partPosition(i, parts.length, x, z)
    return {
      id: `part-${p.key}`,
      position: [px, py + 0.28, pz],
      z: 30,
      node: (
        <span className="pointer-events-none block rounded-full border border-white/15 bg-[#0b0f24]/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow-lg">
          <span style={{ color: p.color }}>{p.value ?? '—'}</span> {p.label}
          {p.value === undefined || p.value === null ? <span className="text-white/50"> · not reported</span> : null}
        </span>
      ),
    }
  })
  const card: LabelSpec = {
    id: 'worker-card',
    position: [x + 2.3, 2.2, z - 0.6],
    z: 40,
    node: (
      <div className="w-[260px] translate-x-1/2 rounded-2xl border border-sky-300/25 bg-[#0b0f24]/92 p-4 text-white shadow-[0_20px_60px_#000a] backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-sky-300">INSIDE THE WORKER</p>
        <p className="mt-1 text-[15px] leading-snug font-semibold">{worker.name}</p>
        <p className="mt-0.5 text-[12px] text-white/60">{worker.bounded_context.label}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className={`rounded-full px-2 py-0.5 ${serving ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-white/70'}`}>{serving ? 'Serving' : packaged ? 'Packaged' : 'Not packaged'}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">Identity {worker.identity.state.toLowerCase()}</span>
          {c?.harness && <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">{c.harness}</span>}
        </div>
        <p className="mt-3 text-[12px] text-white/75">{worker.last_outcome.verdict ? VERDICT[worker.last_outcome.verdict] : 'No run recorded yet'}{worker.last_outcome.runs ? ` · ${worker.last_outcome.runs} runs` : ''}</p>
        <p className="mt-1 text-[12px] text-white/60">{worker.learning.memories ? `${worker.learning.memories} memories, sent to the Sentinel for review` : 'No memories recorded yet'}</p>
        <div className="mt-3 flex gap-2">
          {!inWorkspace && (
            <button type="button" onClick={() => onNavigate(`/workers/${worker.composition_id}`)} className="rounded-lg bg-[#3d7bfa] px-3 py-1.5 text-[12px] font-semibold text-white outline-none hover:bg-[#5a8dfb] focus-visible:ring-2 focus-visible:ring-white">
              Open workspace
            </button>
          )}
          <button type="button" onClick={() => onNavigate(`/campus/rooms/${roomKey}`)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/85 outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">
            Back to the team
          </button>
        </div>
      </div>
    ),
  }
  return [...chips, card]
}
