import { memo } from 'react'
import type { WorldData } from './world-data'

const R = { brain: 70, sentinel: 150, serving: 215, packaged: 290, composed: 370, label: 430 }
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The same campus seen as state: the brain at the centre, the Sentinel ring around it, and every
 * Worker placed by how far along it is — serving closest, composed-but-not-packaged furthest out.
 * Amber motes are recorded memories travelling to the Sentinel, where they are held.
 */
function OrbitScene({ world, focus, onNavigate }: { world: WorldData; focus: { place: string | null; worker: string | null }; onNavigate: (href: string) => void }) {
  const rooms = world.places.filter((p) => p.kind === 'room')
  const weight = (n: number) => Math.max(n, 5)
  const total = rooms.reduce((s, r) => s + weight(r.workers.length), 0)
  const gap = 0.12
  const origin = -Math.PI / 2 - Math.PI / 4
  const spans = rooms.map((room) => (weight(room.workers.length) / total) * Math.PI * 2 - gap)
  const sectors = rooms.map((room, i) => {
    const a0 = origin + spans.slice(0, i).reduce((s, x) => s + x + gap, 0)
    return { room, a0, a1: a0 + spans[i] }
  })
  const arc = (r: number, a0: number, a1: number) => `M${Math.cos(a0) * r} ${Math.sin(a0) * r} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r}`

  return (
    <svg viewBox="-520 -520 1040 1040" className="size-full" role="img" aria-label="Orbit: Workers by bounded context and how far along they are, around the platform brain">
      <defs>
        <radialGradient id="orb-core"><stop offset="0" stopColor="#e0f2fe" /><stop offset=".45" stopColor="#38bdf8" /><stop offset="1" stopColor="#0c4a6e" /></radialGradient>
        <radialGradient id="orb-glow"><stop offset="0" stopColor="#38bdf8" stopOpacity=".35" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></radialGradient>
      </defs>

      {[R.serving, R.packaged, R.composed].map((r, i) => (
        <circle key={r} r={r} fill="none" stroke="#fff" strokeOpacity={0.08} strokeDasharray={i === 2 ? '2 7' : undefined} />
      ))}
      <text x={0} y={-R.serving + 14} textAnchor="middle" className="fill-white/35 font-medium text-[9px] tracking-[0.2em]">SERVING</text>
      <text x={0} y={-R.packaged + 14} textAnchor="middle" className="fill-white/35 font-medium text-[9px] tracking-[0.2em]">PACKAGED</text>
      <text x={0} y={-R.composed + 14} textAnchor="middle" className="fill-white/35 font-medium text-[9px] tracking-[0.2em]">COMPOSED</text>

      {/* Sentinel ring */}
      <circle r={R.sentinel} fill="none" stroke="#fbbf24" strokeOpacity=".6" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }} />
      <g role="button" tabIndex={0} className="cursor-pointer outline-none" onClick={() => onNavigate('/campus/places/sentinel')} onKeyDown={(e) => e.key === 'Enter' && onNavigate('/campus/places/sentinel')} aria-label="Sentinel">
        <rect x={-86} y={R.sentinel - 12} width={172} height={24} rx={12} fill="#0b0f24" stroke="#fbbf2466" />
        <text y={R.sentinel + 4} textAnchor="middle" className="fill-amber-200 font-medium text-[10px]">SENTINEL · {world.sentinel.acting ? 'acting' : 'holding all learning'}</text>
      </g>

      {/* brain */}
      <circle r={R.sentinel - 10} fill="url(#orb-glow)" />
      <g role="button" tabIndex={0} className="cursor-pointer outline-none" onClick={() => onNavigate('/campus/places/brain')} onKeyDown={(e) => e.key === 'Enter' && onNavigate('/campus/places/brain')} aria-label="Platform brain: open its sections">
        <circle r={R.brain} fill="url(#orb-core)" style={{ filter: 'drop-shadow(0 0 30px #38bdf8)' }} />
        <text y={-6} textAnchor="middle" className="fill-[#04263f] text-[11px] font-bold tracking-[0.14em]">PLATFORM BRAIN</text>
        <text y={12} textAnchor="middle" className="fill-[#04263f] font-medium text-[10px]">{world.brain.skills} Skills · {world.brain.evals} EVALs</text>
      </g>

      {sectors.map(({ room, a0, a1 }) => {
        const mid = (a0 + a1) / 2
        const focused = focus.place === room.key
        const n = room.workers.length
        return (
          <g key={room.key} opacity={focus.place && !focused ? 0.35 : 1}>
            {/* knowledge out */}
            <path d={`M${Math.cos(mid) * R.brain} ${Math.sin(mid) * R.brain} L${Math.cos(mid) * (R.composed + 20)} ${Math.sin(mid) * (R.composed + 20)}`} stroke="#7dd3fc" strokeOpacity=".18" strokeWidth={1.5} />
            {!reduceMotion && (
              <circle r={4} fill="#7dd3fc" style={{ filter: 'drop-shadow(0 0 5px #7dd3fc)' }}>
                <animateMotion dur="4.5s" repeatCount="indefinite" path={`M${Math.cos(mid) * R.brain} ${Math.sin(mid) * R.brain} L${Math.cos(mid) * R.packaged} ${Math.sin(mid) * R.packaged}`} />
              </circle>
            )}
            <path d={arc(R.composed + 26, a0, a1)} stroke={room.color} strokeWidth={focused ? 4 : 2} strokeOpacity={0.7} fill="none" />
            <g role="button" tabIndex={0} className="cursor-pointer outline-none" onClick={() => onNavigate(room.href)} onKeyDown={(e) => e.key === 'Enter' && onNavigate(room.href)} aria-label={`${room.title}: ${n} Workers`}>
              <text x={Math.cos(mid) * R.label} y={Math.sin(mid) * R.label} textAnchor="middle" fill={room.color} className="text-[14px] font-semibold">{room.name}</text>
              <text x={Math.cos(mid) * R.label} y={Math.sin(mid) * R.label + 16} textAnchor="middle" className="fill-white/50 font-medium text-[10px]">{n} Worker{n === 1 ? '' : 's'}</text>
            </g>
            {room.workers.map((w, i) => {
              const a = a0 + ((i + 0.5) / n) * (a1 - a0)
              const serving = w.runtime.serving > 0
              const packaged = world.packagedIds.has(w.composition_id)
              const r = (serving ? R.serving : packaged ? R.packaged : R.composed) + (serving ? 0 : ((i * 37) % 40) - 20)
              const x = Math.cos(a) * r, y = Math.sin(a) * r
              const memories = w.learning.memories
              return (
                <g key={w.composition_id}>
                  {memories > 0 && !reduceMotion && (
                    <circle r={3} fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}>
                      <animateMotion dur={`${3 + (i % 4) * 0.4}s`} begin={`${-(i % 5) * 0.7}s`} repeatCount="indefinite" path={`M${x} ${y} L${Math.cos(a) * (R.sentinel + 6)} ${Math.sin(a) * (R.sentinel + 6)}`} />
                    </circle>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={serving ? 8 : 5.5}
                    fill={packaged || serving ? (serving ? '#34d399' : room.color) : 'transparent'}
                    stroke={packaged || serving ? 'none' : room.color}
                    strokeDasharray={packaged ? undefined : '2 2'}
                    strokeWidth={1.5}
                    className="cursor-pointer"
                    style={{ filter: `drop-shadow(0 0 ${serving ? 10 : 4}px ${serving ? '#34d399' : room.color})` }}
                    onClick={() => onNavigate(`/workers/${w.composition_id}`)}
                  >
                    <title>{`${w.name}${serving ? ' · serving' : packaged ? ' · packaged' : ' · not packaged'}${memories ? ` · ${memories} memories` : ''}`}</title>
                  </circle>
                  {focus.worker === w.composition_id && <circle cx={x} cy={y} r={13} fill="none" stroke="#fff" strokeWidth={2} />}
                  {w.runtime.attention > 0 && <circle cx={x} cy={y} r={10} fill="none" stroke="#fbbf24" strokeWidth={2} />}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export const Orbit = memo(OrbitScene)
