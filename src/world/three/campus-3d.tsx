import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, PerformanceMonitor, Stars } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import { Boxes, Brain as BrainIcon, Hammer, PackageCheck, ShieldCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cameraBus } from '../camera-bus'
import { RING, to3, type Place, type WorldData } from '../world-data'
import { Brain, BRAIN_Y } from './brain'
import { Flows } from './flows'
import { hologramLabels, WorkerHologram } from './hologram'
import { LabelLayer, LabelProjector, useLabelRegistry, type LabelSpec } from './screen-labels'
import { Building, useSeatedWorkers, Workforce, type SeatedWorker } from './places'

const ICONS: Record<string, LucideIcon> = { build: Hammer, dock: PackageCheck, workshop: Boxes }
const VIEW_DIR = new THREE.Vector3(1, 1.18, 1).normalize()
const SENTINEL_A = Math.PI / 4
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface Focus {
  place: string | null
  worker: string | null
}

/** Where the camera should stand for a focus, as (target, distance). */
function shotFor(world: WorldData, focus: Focus, seated: SeatedWorker[], aspect: number) {
  const fit = aspect < 0.8 ? 1.55 : aspect < 1.3 ? 1.2 : 1
  if (focus.worker) {
    const w = seated.find((s) => s.id === focus.worker)
    if (w) return { target: new THREE.Vector3(w.x + 1.1, 1.2, w.z - 0.4), distance: 6.4 * Math.min(fit, 1.2) }
  }
  if (focus.place === 'brain') return { target: new THREE.Vector3(0, BRAIN_Y - 0.6, 0), distance: 13 * fit }
  if (focus.place === 'sentinel') return { target: new THREE.Vector3(0, 0.6, 0), distance: 19 * fit }
  const p = world.places.find((x) => x.key === focus.place)
  if (p) return { target: new THREE.Vector3(to3(p.x), 0.4, to3(p.y)), distance: 15 * fit }
  return { target: new THREE.Vector3(0, 0, 1.5), distance: 66 * fit }
}

function CameraDirector({ world, focus, seated, onNear }: { world: WorldData; focus: Focus; seated: SeatedWorker[]; onNear: (room: string | null) => void }) {
  const controls = useRef<CameraControlsImpl>(null)
  const { size } = useThree()
  const aspect = size.width / Math.max(size.height, 1)
  const shot = useMemo(() => shotFor(world, focus, seated, aspect), [world, focus, seated, aspect])
  const first = useRef(true)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const pos = shot.target.clone().addScaledVector(VIEW_DIR, shot.distance)
    // The first shot is placed, not flown, so a deep link opens already there.
    void c.setLookAt(pos.x, pos.y, pos.z, shot.target.x, shot.target.y, shot.target.z, !first.current && !reduceMotion)
    first.current = false
  }, [shot])

  useEffect(
    () =>
      cameraBus.onCommand((cmd) => {
        const c = controls.current
        if (!c) return
        if (cmd === 'in') void c.dolly(c.distance * 0.35, true)
        else if (cmd === 'out') void c.dolly(-c.distance * 0.5, true)
        else {
          const pos = shot.target.clone().addScaledVector(VIEW_DIR, shot.distance)
          void c.setLookAt(pos.x, pos.y, pos.z, shot.target.x, shot.target.y, shot.target.z, !reduceMotion)
        }
      }),
    [shot],
  )

  // Semantic zoom: report the level, and which room the camera has come close to.
  const tick = useRef(0)
  const target = useMemo(() => new THREE.Vector3(), [])
  const near = useRef<string | null>(null)
  useFrame((_, dt) => {
    tick.current += dt
    if (tick.current < 0.2) return
    tick.current = 0
    const c = controls.current
    if (!c) return
    const d = c.distance
    cameraBus.setLevel(d > 26 ? 'Campus' : d > 8 ? 'Place' : 'Desk')
    c.getTarget(target)
    let best: Place | null = null
    let bestD = Infinity
    for (const p of world.places) {
      if (p.kind !== 'room') continue
      const pd = Math.hypot(to3(p.x) - target.x, to3(p.y) - target.z)
      if (pd < bestD) {
        bestD = pd
        best = p
      }
    }
    const next = best && d < 13 && bestD < to3(best.size) ? best.key : null
    if (next !== near.current) {
      near.current = next
      onNear(next)
    }
  })

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      dollyToCursor
      minDistance={2.6}
      maxDistance={90}
      minPolarAngle={0.25}
      maxPolarAngle={1.32}
      mouseButtons={{ left: CameraControlsImpl.ACTION.TRUCK, middle: CameraControlsImpl.ACTION.DOLLY, right: CameraControlsImpl.ACTION.ROTATE, wheel: CameraControlsImpl.ACTION.DOLLY }}
      touches={{ one: CameraControlsImpl.ACTION.TOUCH_TRUCK, two: CameraControlsImpl.ACTION.TOUCH_DOLLY_ROTATE, three: CameraControlsImpl.ACTION.TOUCH_ROTATE }}
    />
  )
}

/** A place's label: screen-space HTML, so it stays crisp at every zoom. */
function PlaceTag({ color, icon: Icon, initial, title, caption, stat, statTone, onOpen, faded, compact }: {
  compact?: boolean
  color: string
  icon?: LucideIcon
  initial?: string
  title: string
  caption: string
  stat?: string
  statTone?: 'good' | 'bad' | 'muted'
  onOpen: () => void
  faded?: boolean
}) {
  return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b0f24]/88 px-3 py-2 text-left whitespace-nowrap text-white shadow-[0_10px_30px_#0009] backdrop-blur-md outline-none transition-[opacity,transform] duration-300 select-none hover:-translate-y-0.5 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white',
          compact && 'gap-1.5 px-1.5 py-1',
          faded && 'opacity-40 hover:opacity-100',
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-[#0b0f24]" style={{ background: color }}>
          {Icon ? <Icon className="size-4" aria-hidden="true" /> : initial}
        </span>
        <span>
          <span className={cn('block leading-4 font-semibold', compact ? 'text-[11px]' : 'text-[13px]')}>{title}</span>
          {!compact && <span className="block text-[11px] leading-4 text-white/60">{caption}</span>}
        </span>
        {stat && !compact && <span className={cn('ml-1 text-lg font-bold', statTone === 'good' ? 'text-emerald-300' : statTone === 'bad' ? 'text-rose-300' : 'text-white/50')}>{stat}</span>}
      </button>
  )
}

const SENTINEL_POS: [number, number] = [Math.cos(SENTINEL_A) * to3(RING.sentinel), Math.sin(SENTINEL_A) * to3(RING.sentinel)]

function SentinelTower({ onOpen }: { onOpen: () => void }) {
  const [x, z] = SENTINEL_POS
  const beacon = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (beacon.current) (beacon.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.35
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={1.1} onClick={(e) => { e.stopPropagation(); onOpen() }}>
        <cylinderGeometry args={[0.16, 0.26, 2.2, 12]} />
        <meshStandardMaterial color="#3a2c08" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={beacon} position-y={2.35}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshBasicMaterial color="#fbbf24" transparent toneMapped={false} />
      </mesh>
      <pointLight position-y={2.4} color="#fbbf24" intensity={4} distance={6} />
    </group>
  )
}

interface SceneProps {
  world: WorldData
  focus: Focus
  seated: SeatedWorker[]
  registry: ReturnType<typeof useLabelRegistry>
  onNavigate: (href: string) => void
  onHover: (w: SeatedWorker | null) => void
  onNear: (room: string | null) => void
}

function Scene({ world, focus, seated, registry, onNavigate, onHover, onNear }: SceneProps) {
  const animate = !reduceMotion
  const focusedWorker = focus.worker ? world.workers.find((w) => w.composition_id === focus.worker) : null
  const focusedSeat = focus.worker ? seated.find((s) => s.id === focus.worker) : null

  return (
    <>
      <color attach="background" args={['#070a17']} />
      <fog attach="fog" args={['#070a17', 55, 130]} />
      <hemisphereLight args={['#c7d2fe', '#0b1020', 0.85]} />
      <directionalLight position={[18, 30, 12]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-20, 12, -18]} intensity={0.35} color="#7dd3fc" />
      <Stars radius={90} depth={40} count={1600} factor={3} saturation={0} fade speed={animate ? 0.4 : 0} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.42} raycast={() => null}>
        <circleGeometry args={[30, 96]} />
        <meshStandardMaterial color="#0d1230" roughness={1} />
      </mesh>

      <Brain animate={animate} onSelect={() => onNavigate('/campus/places/brain')} />
      <Flows world={world} animate={animate} />
      <SentinelTower onOpen={() => onNavigate('/campus/places/sentinel')} />
      {world.places.map((p) => (
        <Building key={p.key} p={p} world={world} onOpen={() => onNavigate(p.href)} />
      ))}
      <Workforce seated={seated} selected={focus.worker} onPick={(w) => onNavigate(`/campus/rooms/${w.room.key}?worker=${w.id}`)} onHover={onHover} />
      {focusedWorker && focusedSeat && <WorkerHologram world={world} worker={focusedWorker} x={focusedSeat.x} z={focusedSeat.z} animate={animate} />}

      <CameraDirector world={world} focus={focus} seated={seated} onNear={onNear} />
      <LabelProjector registry={registry} />
    </>
  )
}

/** A short name for a desk tag; Workers that share a name get the start of their id. */
function deskTag(s: SeatedWorker, all: SeatedWorker[]) {
  const twins = all.filter((x) => x.room.key === s.room.key && x.name === s.name).length
  const tail = s.name.split(' · ').slice(-1)[0]
  return twins > 1 ? `${tail} · ${s.id.slice(0, 4)}` : tail
}

/** Every label on the campus: places, the brain and Sentinel, desk names when close, the hover tip, the hologram. */
function useCampusLabels({ world, focus, seated, panelOpen, inWorkspace, hovered, nearRoom, onNavigate }: {
  world: WorldData
  focus: Focus
  seated: SeatedWorker[]
  panelOpen: boolean
  inWorkspace: boolean
  hovered: SeatedWorker | null
  nearRoom: string | null
  onNavigate: (href: string) => void
}): LabelSpec[] {
  const compact = typeof window !== 'undefined' && window.innerWidth < 640
  return useMemo(() => {
    const deskMode = Boolean(focus.worker)
    const fade = (key: string) => panelOpen && !!focus.place && focus.place !== key
    const out: LabelSpec[] = []
    if (!deskMode) {
      out.push({ id: 'brain', position: [0, BRAIN_Y + 3.1, 0], z: 12, node: <PlaceTag color="#7dd3fc" icon={BrainIcon} title="Platform brain" caption={`${world.brain.skills} Skills · ${world.brain.languages} languages · ${world.brain.evals} EVALs`} onOpen={() => onNavigate('/campus/places/brain')} faded={fade('brain')} compact={compact} /> })
      out.push({ id: 'sentinel', position: [SENTINEL_POS[0], 3.3, SENTINEL_POS[1]], z: 11, node: <PlaceTag color="#fbbf24" icon={ShieldCheck} title="Sentinel" caption={world.sentinel.acting ? 'acting' : 'shadow · records, applies none'} onOpen={() => onNavigate('/campus/places/sentinel')} faded={fade('sentinel')} compact={compact} /> })
      for (const p of world.places) {
        const ran = p.workers.filter((w) => w.last_outcome.runs > 0)
        const met = ran.filter((w) => w.last_outcome.verdict === 'MET').length
        const rate = ran.length ? Math.round((met / ran.length) * 100) : null
        out.push({
          id: `place-${p.key}`,
          position: [to3(p.x), p.kind === 'room' ? 2.7 : 2.5, to3(p.y)],
          z: 10,
          node:
            p.kind === 'room' ? (
              <PlaceTag color={p.color} initial={p.name[0]} title={p.name} caption={`${p.workers.length} Workers · ${ran.length} ran`} stat={rate === null ? '—' : `${rate}%`} statTone={rate === null ? 'muted' : rate >= 50 ? 'good' : 'bad'} onOpen={() => onNavigate(p.href)} faded={fade(p.key)} compact={compact} />
            ) : (
              <PlaceTag color={p.color} icon={ICONS[p.kind]} title={p.name} caption={p.caption} onOpen={() => onNavigate(p.href)} faded={fade(p.key)} compact={compact} />
            ),
        })
      }
    }
    // Semantic zoom: close to a room, every Worker's name appears over its desk.
    const focusedSeat = focus.worker ? seated.find((s) => s.id === focus.worker) : null
    const labelRoom = focusedSeat?.room.key ?? nearRoom
    if (labelRoom)
      for (const s of seated)
        if (s.room.key === labelRoom && s.id !== focus.worker)
          out.push({ id: `desk-${s.id}`, position: [s.x, 1.25, s.z], z: 5, node: <span className={cn('pointer-events-none block max-w-[150px] truncate rounded-md bg-[#0b0f24]/80 px-1.5 py-0.5 text-[10px] text-white/85 shadow', deskMode && 'opacity-50')}>{deskTag(s, seated)}</span> })
    if (hovered && hovered.id !== focus.worker)
      out.push({ id: 'hover', position: [hovered.x, 1.6, hovered.z], z: 50, node: <span className="pointer-events-none block rounded-lg border border-white/15 bg-[#0b0f24]/95 px-2.5 py-1.5 text-[12px] whitespace-nowrap text-white shadow-xl">{hovered.name}<span className="block text-[11px] text-white/55">{hovered.serving ? 'Serving' : hovered.packaged ? 'Packaged' : 'Not packaged'} · click to look inside</span></span> })
    const worker = focus.worker ? world.workers.find((w) => w.composition_id === focus.worker) : null
    if (worker && focusedSeat) out.push(...hologramLabels(world, worker, focusedSeat.x, focusedSeat.z, focusedSeat.room.key, inWorkspace, onNavigate))
    return out
  }, [world, focus, seated, panelOpen, inWorkspace, hovered, nearRoom, onNavigate, compact])
}

/** The campus in real 3D. Loaded on demand; the CSS campus stands in until it is ready. */
export default function Campus3D({ world, focus, panelOpen, inWorkspace, onNavigate }: { world: WorldData; focus: Focus; panelOpen: boolean; inWorkspace: boolean; onNavigate: (href: string) => void }) {
  // Phones render at a lower pixel ratio; everywhere, the monitor drops it further if frames slip.
  const maxDpr = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.3 : 1.75
  const [dpr, setDpr] = useState(maxDpr)
  const seated = useSeatedWorkers(world)
  const registry = useLabelRegistry()
  const [hovered, setHovered] = useState<SeatedWorker | null>(null)
  const [nearRoom, setNearRoom] = useState<string | null>(null)
  const labels = useCampusLabels({ world, focus, seated, panelOpen, inWorkspace, hovered, nearRoom, onNavigate })
  return (
    <>
      <Canvas
        dpr={[1, dpr]}
        camera={{ fov: 32, near: 0.5, far: 260, position: [40, 46, 40] }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        onPointerMissed={() => (document.body.style.cursor = '')}
        onCreated={(s) => {
          // Development aid: lets a test harness force a frame when the page is not visible.
          if (import.meta.env.DEV) (window as unknown as { __r3f: unknown }).__r3f = s
        }}
        aria-label="Campus in 3D"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} flipflops={3} onFallback={() => setDpr(1)} />
        <Scene world={world} focus={focus} seated={seated} registry={registry} onNavigate={onNavigate} onHover={setHovered} onNear={setNearRoom} />
      </Canvas>
      <LabelLayer registry={registry} labels={labels} />
    </>
  )
}
