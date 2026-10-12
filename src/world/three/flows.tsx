import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RING, to3, type WorldData } from '../world-data'

const tmp = new THREE.Object3D()
const SENTINEL_R = to3(RING.sentinel)
const BRAIN_EDGE = 3.7

interface Lane {
  from: THREE.Vector3
  to: THREE.Vector3
  phase: number
  speed: number
}

/** Roads from the brain to every place, and the two streams that run along them. */
export function Flows({ world, animate }: { world: WorldData; animate: boolean }) {
  const roads = useMemo(
    () =>
      world.places.map((p) => {
        const c = new THREE.Vector2(to3(p.x), to3(p.y))
        const d = c.length()
        const u = c.clone().normalize()
        const end = d - to3(p.size) * 0.62
        return { p, u, d, end }
      }),
    [world],
  )

  // Learning: each room sends motes in proportion to the memories its Workers recorded.
  // Knowledge: the brain sends motes to every team with a packaged Worker, and to the build bay.
  const { learning, knowledge, held } = useMemo(() => {
    const learning: Lane[] = []
    const knowledge: Lane[] = []
    const held: THREE.Vector3[] = []
    for (const { p, u, end } of roads) {
      const n = new THREE.Vector2(-u.y, u.x)
      const at = (r: number, off: number) => new THREE.Vector3(u.x * r + n.x * off, 0.18, u.y * r + n.y * off)
      const memories = p.workers.reduce((s, w) => s + w.learning.memories, 0)
      const motes = Math.min(6, Math.ceil(memories / 8))
      for (let i = 0; i < motes; i++) learning.push({ from: at(end, 0.32), to: at(SENTINEL_R, 0.32), phase: i / motes, speed: 0.22 })
      if (motes) held.push(at(SENTINEL_R, 0.32))
      const out = p.kind === 'build' || (p.kind === 'room' && p.workers.some((w) => world.packagedIds.has(w.composition_id)))
      if (out) for (let i = 0; i < 3; i++) knowledge.push({ from: at(BRAIN_EDGE, -0.32), to: at(end, -0.32), phase: i / 3, speed: 0.17 })
    }
    return { learning, knowledge, held }
  }, [roads, world])

  return (
    <group>
      {roads.map(({ p, u, end }) => {
        const len = end - BRAIN_EDGE
        const mid = BRAIN_EDGE + len / 2
        const angle = Math.atan2(u.y, u.x)
        return (
          <group key={p.key} position={[u.x * mid, 0.006, u.y * mid]} rotation-y={-angle}>
            <mesh rotation-x={-Math.PI / 2} raycast={() => null}>
              <planeGeometry args={[len, 1.25]} />
              <meshStandardMaterial color="#141a38" roughness={0.9} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={0.004} raycast={() => null}>
              <planeGeometry args={[len, 0.05]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
            </mesh>
          </group>
        )
      })}

      {/* the Sentinel ring every learning passes through */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.05} raycast={() => null}>
        <torusGeometry args={[SENTINEL_R, 0.07, 10, 160]} />
        <meshBasicMaterial color="#fbbf24" toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} raycast={() => null}>
        <ringGeometry args={[SENTINEL_R - 0.5, SENTINEL_R + 0.5, 160]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      <Motes lanes={learning} color="#fbbf24" size={0.13} animate={animate} />
      <Motes lanes={knowledge} color="#7dd3fc" size={0.11} animate={animate} />
      <Held points={held} animate={animate} />
    </group>
  )
}

function Motes({ lanes, color, size, animate }: { lanes: Lane[]; color: string; size: number; animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const pos = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const t0 = animate ? clock.elapsedTime : 0
    lanes.forEach((l, i) => {
      const t = (t0 * l.speed + l.phase) % 1
      pos.lerpVectors(l.from, l.to, t)
      tmp.position.copy(pos)
      tmp.position.y = 0.18 + Math.sin(t * Math.PI) * 0.35
      tmp.scale.setScalar(t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(lanes.length, 1)]} raycast={() => null} frustumCulled={false}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  )
}

/** Where learning waits at the ring: it is recorded, not yet promoted. */
function Held({ points, animate }: { points: THREE.Vector3[]; animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    points.forEach((p, i) => {
      tmp.position.copy(p)
      tmp.position.y = 0.12
      tmp.rotation.set(-Math.PI / 2, 0, 0)
      tmp.scale.setScalar(animate ? 1 + Math.sin(clock.elapsedTime * 2.5 + i) * 0.25 : 1)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(points.length, 1)]} raycast={() => null} frustumCulled={false}>
      <ringGeometry args={[0.18, 0.3, 24]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}
