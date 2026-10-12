import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { seatOf, to3, type Place, type WorldData } from '../world-data'

const tmp = new THREE.Object3D()
const tmpColor = new THREE.Color()
const BOOKS = ['#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#10b981']
const shade = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k)

export interface SeatedWorker {
  id: string
  name: string
  room: Place
  x: number
  z: number
  packaged: boolean
  serving: boolean
  attention: boolean
}

export function useSeatedWorkers(world: WorldData): SeatedWorker[] {
  return useMemo(
    () =>
      world.places
        .filter((p) => p.kind === 'room')
        .flatMap((room) =>
          room.workers.map((w, i) => {
            const seat = seatOf(room.size, i)
            return {
              id: w.composition_id,
              name: w.name,
              room,
              x: to3(room.x) + seat.x,
              z: to3(room.y) + seat.z,
              packaged: world.packagedIds.has(w.composition_id),
              serving: w.runtime.serving > 0,
              attention: w.runtime.attention > 0,
            }
          }),
        ),
    [world],
  )
}

/** One instanced mesh for a repeated part: positions come from `place(i, obj)`. */
function useInstances(ref: React.RefObject<THREE.InstancedMesh | null>, count: number, place: (i: number, o: THREE.Object3D) => void, color?: (i: number) => THREE.Color) {
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    for (let i = 0; i < count; i++) {
      tmp.position.set(0, 0, 0)
      tmp.rotation.set(0, 0, 0)
      tmp.scale.set(1, 1, 1)
      place(i, tmp)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
      if (color) m.setColorAt(i, color(i))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  })
}

/** Every Worker at its desk: desks, monitors, glowing screens, bodies and heads — six draw calls in all. */
export function Workforce({ seated, selected, onPick, onHover }: { seated: SeatedWorker[]; selected: string | null; onPick: (w: SeatedWorker) => void; onHover: (w: SeatedWorker | null) => void }) {
  const solid = useMemo(() => seated.filter((w) => w.packaged || w.serving), [seated])
  const ghosts = useMemo(() => seated.filter((w) => !w.packaged && !w.serving), [seated])
  const desks = useRef<THREE.InstancedMesh>(null)
  const legs = useRef<THREE.InstancedMesh>(null)
  const monitors = useRef<THREE.InstancedMesh>(null)
  const screens = useRef<THREE.InstancedMesh>(null)
  const bodies = useRef<THREE.InstancedMesh>(null)
  const heads = useRef<THREE.InstancedMesh>(null)
  const ghostBodies = useRef<THREE.InstancedMesh>(null)
  const ghostHeads = useRef<THREE.InstancedMesh>(null)
  const shadows = useRef<THREE.InstancedMesh>(null)

  const n = seated.length
  useInstances(desks, n, (i, o) => o.position.set(seated[i].x, 0.5, seated[i].z - 0.34))
  useInstances(legs, n, (i, o) => o.position.set(seated[i].x, 0.25, seated[i].z - 0.34))
  useInstances(monitors, n, (i, o) => o.position.set(seated[i].x, 0.74, seated[i].z - 0.5))
  useInstances(screens, n, (i, o) => o.position.set(seated[i].x, 0.74, seated[i].z - 0.483), (i) => tmpColor.set(seated[i].room.color).lerp(new THREE.Color('#ffffff'), 0.35))
  useInstances(shadows, n, (i, o) => {
    o.position.set(seated[i].x, 0.012, seated[i].z)
    o.rotation.x = -Math.PI / 2
  })
  useInstances(bodies, solid.length, (i, o) => o.position.set(solid[i].x, 0.52, solid[i].z), (i) => (solid[i].serving ? tmpColor.set('#34d399') : tmpColor.set(solid[i].room.color).lerp(new THREE.Color('#ffffff'), 0.45)))
  useInstances(heads, solid.length, (i, o) => o.position.set(solid[i].x, 0.86, solid[i].z))
  useInstances(ghostBodies, ghosts.length, (i, o) => o.position.set(ghosts[i].x, 0.52, ghosts[i].z))
  useInstances(ghostHeads, ghosts.length, (i, o) => o.position.set(ghosts[i].x, 0.86, ghosts[i].z))

  const pick = (list: SeatedWorker[]) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined) onPick(list[e.instanceId])
  }
  const hover = (list: SeatedWorker[]) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    document.body.style.cursor = 'pointer'
    onHover(list[e.instanceId])
  }
  const leave = () => {
    document.body.style.cursor = ''
    onHover(null)
  }

  return (
    <group>
      <instancedMesh ref={shadows} args={[undefined, undefined, n]} raycast={() => null}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={desks} args={[undefined, undefined, n]}>
        <boxGeometry args={[0.86, 0.05, 0.42]} />
        <meshStandardMaterial color="#efe6d6" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, n]}>
        <boxGeometry args={[0.8, 0.48, 0.05]} />
        <meshStandardMaterial color="#1f2433" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={monitors} args={[undefined, undefined, n]}>
        <boxGeometry args={[0.46, 0.3, 0.03]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={screens} args={[undefined, undefined, n]}>
        <planeGeometry args={[0.4, 0.24]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={bodies} args={[undefined, undefined, solid.length]} onClick={pick(solid)} onPointerMove={hover(solid)} onPointerOut={leave}>
        <capsuleGeometry args={[0.15, 0.24, 6, 12]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, solid.length]} onClick={pick(solid)} onPointerMove={hover(solid)} onPointerOut={leave}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={ghostBodies} args={[undefined, undefined, ghosts.length]} onClick={pick(ghosts)} onPointerMove={hover(ghosts)} onPointerOut={leave}>
        <capsuleGeometry args={[0.15, 0.24, 6, 12]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.28} wireframe />
      </instancedMesh>
      <instancedMesh ref={ghostHeads} args={[undefined, undefined, ghosts.length]} onClick={pick(ghosts)} onPointerMove={hover(ghosts)} onPointerOut={leave}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.28} wireframe />
      </instancedMesh>

      {seated.filter((w) => w.serving).map((w) => <ServingHalo key={w.id} x={w.x} z={w.z} />)}
      {seated.filter((w) => w.attention).map((w) => <AttentionBeacon key={w.id} x={w.x} z={w.z} />)}
      {selected && seated.find((w) => w.id === selected) && <SelectionRing w={seated.find((w) => w.id === selected)!} />}
    </group>
  )
}

function ServingHalo({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(clock.elapsedTime * 2.4) * 0.2
  })
  return (
    <mesh ref={ref} position={[x, 0.03, z]} rotation-x={-Math.PI / 2} raycast={() => null}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial color="#34d399" transparent opacity={0.5} toneMapped={false} />
    </mesh>
  )
}

function AttentionBeacon({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 2) * 0.06
    ref.current.rotation.y = clock.elapsedTime
  })
  return (
    <mesh ref={ref} position={[x, 1.35, z]} raycast={() => null}>
      <octahedronGeometry args={[0.13]} />
      <meshBasicMaterial color="#fbbf24" toneMapped={false} />
    </mesh>
  )
}

function SelectionRing({ w }: { w: SeatedWorker }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.08)
  })
  return (
    <mesh ref={ref} position={[w.x, 0.035, w.z]} rotation-x={-Math.PI / 2} raycast={() => null}>
      <ringGeometry args={[0.45, 0.55, 40]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </mesh>
  )
}

/** Decoration only: a lamp in the back corner, a plant at the front, books on the side wall. */
function Furniture({ s, books }: { s: number; books: boolean }) {
  return (
    <group>
      <group position={[-s / 2 + 0.7, 0, -s / 2 + 0.7]}>
        <mesh position-y={0.8}><cylinderGeometry args={[0.03, 0.03, 1.6, 8]} /><meshStandardMaterial color="#1f2937" /></mesh>
        <mesh position-y={1.62}><coneGeometry args={[0.24, 0.22, 20, 1, true]} /><meshBasicMaterial color="#fff7e0" side={THREE.DoubleSide} toneMapped={false} /></mesh>
        <mesh position-y={0.01} rotation-x={-Math.PI / 2}><circleGeometry args={[0.8, 24]} /><meshBasicMaterial color="#fde68a" transparent opacity={0.12} depthWrite={false} /></mesh>
      </group>
      <group position={[s / 2 - 0.6, 0, s / 2 - 0.6]}>
        <mesh position-y={0.18}><cylinderGeometry args={[0.2, 0.15, 0.36, 16]} /><meshStandardMaterial color="#f1f5f9" roughness={0.5} /></mesh>
        <mesh position-y={0.62}><icosahedronGeometry args={[0.36, 0]} /><meshStandardMaterial color="#22c55e" flatShading roughness={0.8} /></mesh>
        <mesh position={[0.12, 0.86, 0.05]}><icosahedronGeometry args={[0.22, 0]} /><meshStandardMaterial color="#16a34a" flatShading roughness={0.8} /></mesh>
      </group>
      {books && (
        <group position={[-s / 2 + 0.2, 1.05, s / 2 - 1.6]}>
          <mesh position-y={-0.14}><boxGeometry args={[0.24, 0.04, 1]} /><meshStandardMaterial color="#e7dccb" /></mesh>
          {BOOKS.map((c, i) => (
            <mesh key={c} position={[0, 0, -0.35 + i * 0.16]} rotation-x={i % 3 === 2 ? 0.25 : 0}><boxGeometry args={[0.18, 0.26, 0.11]} /><meshStandardMaterial color={c} /></mesh>
          ))}
        </group>
      )}
    </group>
  )
}

function WallScreen({ s, color, metRatio }: { s: number; color: string; metRatio: number | null }) {
  const pts = useMemo(() => {
    const out: [number, number, number][] = []
    for (let i = 0; i <= 12; i++) {
      const y = metRatio === null ? 0 : (Math.sin(i * 1.3) * 0.12 + (i / 12) * (metRatio - 0.5) * 0.5)
      out.push([-1.05 + i * 0.175, y, 0.012])
    }
    return out
  }, [metRatio])
  return (
    <group position={[-s / 2 + 2.3, 1.05, -s / 2 + 0.16]}>
      <mesh><planeGeometry args={[2.4, 0.8]} /><meshBasicMaterial color="#070a17" /></mesh>
      <Line points={pts} color={color} lineWidth={2} />
    </group>
  )
}

/** A place's building: floor, two walls, and what fits its kind. */
export function Building({ p, world, onOpen }: { p: Place; world: WorldData; onOpen: () => void }) {
  const s = to3(p.size)
  const floor = useMemo(() => shade(p.color, 0.62), [p.color])
  const wall = useMemo(() => shade(p.color, 0.45), [p.color])
  const rug = useMemo(() => new THREE.Color(p.color).lerp(new THREE.Color('#ffffff'), 0.25), [p.color])
  const ran = p.workers.filter((w) => w.last_outcome.runs > 0)
  const metRatio = ran.length ? ran.filter((w) => w.last_outcome.verdict === 'MET').length / ran.length : null
  const open = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onOpen()
  }

  return (
    <group position={[to3(p.x), 0, to3(p.y)]}>
      <mesh position-y={-0.2} onClick={open} receiveShadow>
        <boxGeometry args={[s, 0.4, s]} />
        <meshStandardMaterial color={floor} roughness={0.75} />
      </mesh>
      <mesh position={[0.3, 0.005, 0.3]} rotation-x={-Math.PI / 2} raycast={() => null}>
        <planeGeometry args={[s - 1.6, s - 1.6]} />
        <meshStandardMaterial color={rug} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, -s / 2 + 0.08]} onClick={open}>
        <boxGeometry args={[s, 1.5, 0.16]} />
        <meshStandardMaterial color={wall} roughness={0.85} />
      </mesh>
      <mesh position={[-s / 2 + 0.08, 0.75, 0]} onClick={open}>
        <boxGeometry args={[0.16, 1.5, s]} />
        <meshStandardMaterial color={shade(p.color, 0.36)} roughness={0.85} />
      </mesh>
      <WallScreen s={s} color={p.color} metRatio={metRatio} />
      <Furniture s={s} books={p.kind !== 'dock'} />

      {p.kind === 'build' && <BuildBay s={s} drafts={world.drafts.inBuild} />}
      {p.kind === 'dock' && <Dock s={s} packaged={world.drafts.packaged} delivered={world.deliveries} />}
      {p.kind === 'workshop' && <Workshop s={s} rigs={world.harnesses} />}
    </group>
  )
}

function BuildBay({ s, drafts }: { s: number; drafts: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const n = Math.min(drafts, 16)
  useInstances(ref, n, (i, o) => o.position.set(-s / 2 + 1.5 + (i % 4) * 1.1, 0.5, -s / 2 + 1.6 + Math.floor(i / 4) * 1.1))
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(s - 1.6, 1.8, s - 1.6)), [s])
  return (
    <group>
      <lineSegments geometry={edges} position={[0.3, 0.9, 0.3]} raycast={() => null}>
        <lineBasicMaterial color="#bae6fd" transparent opacity={0.6} />
      </lineSegments>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} raycast={() => null}>
        <capsuleGeometry args={[0.15, 0.4, 4, 10]} />
        <meshStandardMaterial color="#7dd3fc" wireframe transparent opacity={0.6} />
      </instancedMesh>
    </group>
  )
}

function Dock({ s, packaged, delivered }: { s: number; packaged: number; delivered: number }) {
  const crates = useRef<THREE.InstancedMesh>(null)
  const out = useRef<THREE.InstancedMesh>(null)
  const n = Math.min(packaged, 36)
  const m = Math.min(delivered, 8)
  useInstances(crates, n, (i, o) => o.position.set(-s / 2 + 1.2 + (i % 6) * 0.62, 0.25 + Math.floor(i / 18) * 0.5, -s / 2 + 1.3 + (Math.floor(i / 6) % 3) * 0.62))
  useInstances(out, m, (i, o) => o.position.set(-s / 2 + 1.2 + (i % 4) * 0.62, 0.25, s / 2 - 1.4 + Math.floor(i / 4) * 0.62))
  return (
    <group>
      <instancedMesh ref={crates} args={[undefined, undefined, n]} raycast={() => null}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f5c26b" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={out} args={[undefined, undefined, m]} raycast={() => null}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.8} />
      </instancedMesh>
    </group>
  )
}

function Workshop({ s, rigs }: { s: number; rigs: number }) {
  return (
    <group>
      {Array.from({ length: rigs }, (_, i) => (
        <group key={i} position={[-s / 2 + 1.8 + i * 1.9, 0, -0.2]}>
          <mesh position-y={0.45}><boxGeometry args={[1.4, 0.9, 0.9]} /><meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} /></mesh>
          <mesh position={[0, 0.6, 0.46]}><planeGeometry args={[1.1, 0.45]} /><meshBasicMaterial color={i ? '#34d399' : '#7dd3fc'} toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  )
}
