import { memo } from 'react'
import { Boxes, Hammer, PackageCheck, ShieldCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RING, type Place, type WorldData } from './world-data'
import './world.css'

export interface Camera {
  x: number
  y: number
  zoom: number
}

const ICONS: Record<string, LucideIcon> = { build: Hammer, dock: PackageCheck, workshop: Boxes }
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A label that faces the viewer and opens its place. */
function Tag({ color, icon: Icon, initial, title, caption, stat, statTone, onOpen, lift = 160, focused }: {
  color: string
  icon?: LucideIcon
  initial?: string
  title: string
  caption: string
  stat?: string
  statTone?: 'good' | 'bad' | 'muted'
  onOpen: () => void
  lift?: number
  focused?: boolean
}) {
  return (
    <div className="tagpos">
      <div className="bb">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            'tag flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b0f24]/90 px-3 py-2 text-left text-white shadow-[0_10px_30px_#0009] outline-none hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white',
            focused && 'border-white/50',
          )}
          style={{ bottom: lift }}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-[#0b0f24]" style={{ background: color }}>
            {Icon ? <Icon className="size-4" aria-hidden="true" /> : initial}
          </span>
          <span>
            <span className="block text-[13px] font-semibold leading-4">{title}</span>
            <span className="block font-medium text-[11px] leading-4 text-white/60">{caption}</span>
          </span>
          {stat && <span className={cn('ml-1 text-lg font-bold', statTone === 'good' ? 'text-emerald-300' : statTone === 'bad' ? 'text-rose-300' : 'text-white/50')}>{stat}</span>}
        </button>
      </div>
    </div>
  )
}

const BOOKS = ['#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#10b981']

/** Decoration only: a lamp in the back corner, a plant at the front, books on the side wall. */
function Furniture({ size, books = true }: { size: number; books?: boolean }) {
  return (
    <>
      <span className="lamp" style={{ left: 26, top: 26 }} aria-hidden="true"><i className="bb" /></span>
      <span className="plant" style={{ left: size - 26, top: size - 26 }} aria-hidden="true"><i className="bb" /></span>
      {books && <span className="books" aria-hidden="true">{BOOKS.map((c) => <i key={c} style={{ background: c }} />)}</span>}
    </>
  )
}

function Room({ p, packagedIds, focusedWorker, onOpen, onWorker }: { p: Place; packagedIds: Set<string>; focusedWorker: string | null; onOpen: () => void; onWorker: (id: string) => void }) {
  const ran = p.workers.filter((w) => w.last_outcome.runs > 0)
  const met = ran.filter((w) => w.last_outcome.verdict === 'MET').length
  const rate = ran.length ? Math.round((met / ran.length) * 100) : null
  return (
    <>
      <div className="wall back">
        <div className="screen grid place-items-center font-medium text-[11px] text-white/80">{ran.length ? `${met}/${ran.length} last runs met` : 'no runs yet'}</div>
      </div>
      <div className="wall side"><span className="books" aria-hidden="true">{BOOKS.map((c) => <i key={c} style={{ background: c }} />)}</span></div>
      <Furniture size={p.size} books={false} />
      <div className="people">
        {p.workers.map((w) => {
          const serving = w.runtime.serving > 0
          const packaged = packagedIds.has(w.composition_id)
          return (
            <button
              key={w.composition_id}
              type="button"
              className={cn('fig', serving && 'serving', !packaged && 'unpackaged', w.runtime.attention > 0 && 'attention', focusedWorker === w.composition_id && 'selected')}
              style={{ '--shirt': `color-mix(in srgb, ${p.color} 45%, #fff)` } as React.CSSProperties}
              onClick={() => onWorker(w.composition_id)}
              aria-label={`${w.name}${serving ? ', serving' : ''}${w.runtime.attention ? ', needs attention' : ''}`}
              title={w.name}
            >
              <span className="body bb" />
            </button>
          )
        })}
      </div>
      <Tag color={p.color} initial={p.name[0]} title={p.name} caption={`${p.workers.length} Workers · ${ran.length} ran`} stat={rate === null ? '—' : `${rate}%`} statTone={rate === null ? 'muted' : rate >= 50 ? 'good' : 'bad'} onOpen={onOpen} />
    </>
  )
}

function Facility({ p, world, onOpen }: { p: Place; world: WorldData; onOpen: () => void }) {
  return (
    <>
      <div className="wall back"><div className="screen grid place-items-center font-medium text-[11px] text-white/80">{p.caption}</div></div>
      <div className="wall side" />
      {p.kind !== 'dock' && <Furniture size={p.size} books={false} />}
      {p.kind === 'build' && (
        <>
          <div className="scaffold" />
          <div className="people">
            {Array.from({ length: Math.min(world.drafts.inBuild, 18) }, (_, i) => (
              <span key={i} className="fig unpackaged" aria-hidden="true"><span className="body bb" /></span>
            ))}
          </div>
        </>
      )}
      {p.kind === 'dock' && (
        <div className="crates" aria-hidden="true">
          {Array.from({ length: Math.min(world.drafts.packaged, 35) }, (_, i) => <i key={i} className="crate" />)}
          {Array.from({ length: Math.min(world.deliveries, 7) }, (_, i) => <i key={`o${i}`} className="crate out" />)}
        </div>
      )}
      {p.kind === 'workshop' && Array.from({ length: world.harnesses }, (_, i) => <i key={i} className="rig" style={{ left: 60 + i * 90, top: 100 }} aria-hidden="true" />)}
      <Tag color={p.color} icon={ICONS[p.kind]} title={p.name} caption={p.caption} onOpen={onOpen} lift={140} />
    </>
  )
}

/** Floor-level roads and the knowledge flows between places, the Sentinel ring and the brain. */
function Ground({ world }: { world: WorldData }) {
  const motes = !reduceMotion
  return (
    <svg className="ground" viewBox="-1000 -1000 2000 2000" aria-hidden="true">
      <defs>
        <radialGradient id="gnd"><stop offset="0" stopColor="#1b2350" /><stop offset="0.7" stopColor="#10152f" /><stop offset="1" stopColor="#0b0f24" stopOpacity="0" /></radialGradient>
      </defs>
      <circle r="980" fill="url(#gnd)" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} r={110 * (i + 1)} fill="none" stroke="#ffffff" strokeOpacity="0.03" />)}

      {world.places.map((p) => {
        const d = Math.hypot(p.x, p.y)
        const ux = p.x / d, uy = p.y / d
        const nx = -uy, ny = ux
        const edge = d - p.size * 0.62
        const pt = (r: number, off: number) => `${(ux * r + nx * off).toFixed(1)} ${(uy * r + ny * off).toFixed(1)}`
        const roomMemories = p.workers.reduce((s, w) => s + w.learning.memories, 0)
        const learning = Math.min(6, Math.ceil(roomMemories / 8))
        const knowledgeOut = p.kind === 'build' || (p.kind === 'room' && p.workers.some((w) => world.packagedIds.has(w.composition_id)))
        return (
          <g key={p.key}>
            <line x1={ux * 150} y1={uy * 150} x2={ux * edge} y2={uy * edge} stroke="#151b3a" strokeWidth="46" strokeLinecap="round" />
            <line x1={ux * 150} y1={uy * 150} x2={ux * edge} y2={uy * edge} stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" strokeDasharray="14 14" />
            {/* knowledge out: brain → place */}
            {knowledgeOut && (
              <>
                <path d={`M${pt(150, -13)} L${pt(edge, -13)}`} stroke="#7dd3fc" strokeOpacity="0.35" strokeWidth="2" fill="none" />
                {motes && [0, 1, 2].map((i) => (
                  <circle key={i} r="5" fill="#7dd3fc" style={{ filter: 'drop-shadow(0 0 6px #7dd3fc)' }}>
                    <animateMotion dur="5s" begin={`${-i * 1.7}s`} repeatCount="indefinite" path={`M${pt(150, -13)} L${pt(edge, -13)}`} />
                  </circle>
                ))}
              </>
            )}
            {/* learning: place → Sentinel ring (then held) */}
            {learning > 0 && (
              <>
                <path d={`M${pt(edge, 13)} L${pt(RING.sentinel, 13)}`} stroke="#fbbf24" strokeOpacity="0.4" strokeWidth="2" fill="none" />
                <path d={`M${pt(RING.sentinel, 13)} L${pt(150, 13)}`} stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 8" fill="none" />
                {motes && Array.from({ length: learning }, (_, i) => (
                  <circle key={i} r="5.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }}>
                    <animateMotion dur="4.2s" begin={`${(-i * 4.2) / learning}s`} repeatCount="indefinite" path={`M${pt(edge, 13)} L${pt(RING.sentinel, 13)}`} />
                  </circle>
                ))}
                <circle cx={ux * RING.sentinel + nx * 13} cy={uy * RING.sentinel + ny * 13} r="9" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24">
                  {motes && <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite" />}
                </circle>
              </>
            )}
          </g>
        )
      })}

      {/* the Sentinel ring every learning passes through */}
      <circle r={RING.sentinel} fill="none" stroke="#fbbf24" strokeOpacity="0.55" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }} />
      <circle r={RING.sentinel + 14} fill="none" stroke="#fbbf24" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 9" />
    </svg>
  )
}

function CampusScene({ world, camera, focus, panelOpen, onNavigate }: {
  world: WorldData
  camera: Camera
  focus: { place: string | null; worker: string | null }
  panelOpen: boolean
  onNavigate: (href: string) => void
}) {
  // On the ring to the brain's right on screen, between two roads and clear of the brain's label.
  const towerA = (45 * Math.PI) / 180
  return (
    <div
      className="world"
      style={{ '--zoom': camera.zoom, '--fx': `${-camera.x}px`, '--fy': `${-camera.y}px` } as React.CSSProperties}
    >
      <Ground world={world} />

      {/* the platform brain */}
      <div className={cn('place', panelOpen && focus.place && focus.place !== 'brain' && 'dim')} style={{ left: 0, top: 0 }}>
        <div className="brain-pad">
          <span className="ring" style={{ inset: 30 }} />
          <span className="ring" style={{ inset: 70, borderStyle: 'dashed' }} />
        </div>
        <div className="tagpos" style={{ left: 0, top: 0 }}>
          <div className="bb">
            <span className="brain-beam" aria-hidden="true" />
            <button type="button" className="brain-orb outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full" onClick={() => onNavigate('/campus/places/brain')} aria-label="Platform brain: open its sections">
              <span className="wire" /><span className="wire" /><span className="wire" />
              <span className="core" />
            </button>
          </div>
        </div>
        <div className="tagpos" style={{ left: 0, top: 0 }}>
          <div className="bb">
            <button
              type="button"
              onClick={() => onNavigate('/campus/places/brain')}
              className="tag rounded-xl border border-sky-300/30 bg-[#0b0f24]/90 px-4 py-2 text-center text-white shadow-[0_10px_30px_#0009] outline-none hover:border-sky-300/70 focus-visible:ring-2 focus-visible:ring-white"
              style={{ bottom: 200 }}
            >
              <span className="block font-medium text-[11px] tracking-[0.18em] text-sky-300">PLATFORM BRAIN</span>
              <span className="block text-[13px] font-semibold">{world.brain.skills} Skills · {world.brain.languages} languages · {world.brain.evals} EVALs</span>
              <span className="block font-medium text-[11px] text-white/60">shared by every Worker · {world.brain.dod} DoD rubrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* the Sentinel tower on the ring */}
      <div className="sentinel-tower" style={{ left: Math.cos(towerA) * RING.sentinel, top: Math.sin(towerA) * RING.sentinel }}>
        <div className="bb" style={{ position: 'absolute', left: 0, top: 0 }}>
          <span className="beam" />
          <button
            type="button"
            onClick={() => onNavigate('/campus/places/sentinel')}
            style={{ translate: '14px 0', transformOrigin: '0 100%' }}
            className="tag absolute bottom-[40px] left-0 flex items-center gap-2 whitespace-nowrap rounded-xl border border-amber-300/30 bg-[#0b0f24]/90 px-3 py-2 text-left text-white shadow-[0_10px_30px_#0009] outline-none hover:border-amber-300/70 focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-amber-400 text-[#0b0f24]"><ShieldCheck className="size-4" aria-hidden="true" /></span>
            <span>
              <span className="block text-[13px] font-semibold leading-4">Sentinel</span>
              <span className="block font-medium text-[11px] leading-4 text-white/60">{world.sentinel.acting ? 'acting' : 'shadow · records, applies none'}</span>
            </span>
          </button>
        </div>
      </div>

      {world.places.map((p) => (
        <div
          key={p.key}
          className={cn('place', focus.place === p.key && 'focused', panelOpen && focus.place && focus.place !== p.key && 'dim')}
          style={{ left: p.x - p.size / 2, top: p.y - p.size / 2, width: p.size, height: p.size, '--c': p.color, '--s': `${p.size}px` } as React.CSSProperties}
        >
          <div className="floor" onClick={() => onNavigate(p.href)} />
          {p.kind === 'room' ? (
            <Room p={p} packagedIds={world.packagedIds} focusedWorker={focus.worker} onOpen={() => onNavigate(p.href)} onWorker={(id) => onNavigate(`/workers/${id}`)} />
          ) : (
            <Facility p={p} world={world} onOpen={() => onNavigate(p.href)} />
          )}
        </div>
      ))}
    </div>
  )
}

export const Campus = memo(CampusScene)
