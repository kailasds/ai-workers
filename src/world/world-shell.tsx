import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { ChevronRight, KeyRound, Maximize2, Minimize2, Minus, Orbit as OrbitIcon, Plus, Search, Scan, Map as MapIcon, X } from 'lucide-react'
import { PageContainer } from '@/components/platform/page-container'
import { LoadingRegion } from '@/components/platform/states'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageErrorBoundary } from '@/components/shell/error-boundary'
import { CommandMenu, useCommandShortcut } from '@/components/shell/command-menu'
import { WorkNotices } from '@/components/shell/work-notices'
import { MOCK_SESSION } from '@/lib/session'
import { cn } from '@/lib/utils'
import { Campus, type Camera } from './campus'
import { Orbit } from './orbit'
import { cameraBus, type ZoomLevel } from './camera-bus'

// Real 3D is loaded on demand; without WebGL the CSS campus is the campus.
const Campus3D = lazy(() => import('./three/campus-3d'))
const supportsWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()
import { CampusHome } from './campus-home'
import { focusFor, RING, useWorldData, type WorldData } from './world-data'
import { DIRECTORY, directoryOf } from './sections'

type Lens = 'campus' | 'orbit'

// Where the camera stands for each kind of focus, and what the breadcrumb calls it.
function placeLabel(world: WorldData | null, key: string | null) {
  return world?.places.find((p) => p.key === key)?.name ?? directoryOf(key)?.name ?? null
}

const PAGE_NAMES: [RegExp, string][] = [
  [/^\/dashboard/, 'Outcomes'],
  [/^\/campus\/rooms\//, 'Team'],
  [/^\/campus\/places\//, 'Sections'],
  [/^\/workers\/[^/]+/, 'Worker'],
  [/^\/workers/, 'All Workers'],
  [/^\/compose\/drafts/, 'Saved drafts'],
  [/^\/compose/, 'Compose'],
  [/^\/packaging/, 'Packaging'],
  [/^\/customer-delivery/, 'Customer delivery'],
  [/^\/knowledge/, 'Knowledge'],
  [/^\/learning/, 'Learning'],
  [/^\/sentinel/, 'Oversight'],
  [/^\/harnesses/, 'Harnesses'],
  [/^\/admin/, 'User management'],
]

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return size
}

export function WorldShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [commandOpen, setCommandOpen] = useCommandShortcut()
  const read = useWorldData()
  const world = read.data
  const { w: vw, h: vh } = useViewport()

  const [lens, setLens] = useState<Lens>('campus')
  const [expanded, setExpanded] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoomBias, setZoomBias] = useState(1)
  const [level, setLevel] = useState<ZoomLevel>(cameraBus.getLevel())
  useEffect(() => cameraBus.onLevel(setLevel), [])
  const use3d = supportsWebGL

  const atHome = location.pathname === '/campus' || location.pathname === '/campus/'
  const roomPanel = location.pathname.startsWith('/campus/rooms/') || location.pathname.startsWith('/campus/places/')
  const panelOpen = !atHome
  const focus = useMemo(() => focusFor(location.pathname, world, location.search), [location.pathname, location.search, world])

  // Each new destination re-centres the camera; manual pan and zoom are a temporary detour.
  useEffect(() => {
    setPan({ x: 0, y: 0 })
    setZoomBias(1)
  }, [focus.place, focus.worker])
  useEffect(() => {
    if (atHome) setExpanded(false)
  }, [atHome])

  const desktop = vw >= 1024
  const panelWidth = !panelOpen ? 0 : !desktop || expanded ? vw : roomPanel ? 460 : Math.min(1000, Math.max(640, vw - 460))
  const availW = Math.max(320, vw - (desktop ? panelWidth : 0))
  const availH = vh - 64

  const camera: Camera = useMemo(() => {
    const fit = Math.min(availW / 1700, availH / 1150)
    let base: Camera = { x: 0, y: 0, zoom: fit }
    if (focus.place === 'brain') base = { x: 0, y: 0, zoom: Math.min(availW / 760, availH / 640, 1.3) }
    else if (focus.place === 'sentinel') base = { x: 0, y: 0, zoom: Math.min(availW / 900, availH / 760, 1.1) }
    else if (focus.place) {
      const p = world?.places.find((x) => x.key === focus.place)
      if (p) base = { x: p.x, y: p.y, zoom: Math.min(availW / 720, availH / 620, 1.35) }
    }
    return { x: base.x + pan.x, y: base.y + pan.y, zoom: base.zoom * zoomBias }
  }, [focus.place, world, availW, availH, pan, zoomBias])

  // Drag to pan: undo the isometric projection so the floor follows the pointer.
  const drag = useRef<{ x: number; y: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return
    drag.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || lens !== 'campus') return
    const a = (e.clientX - drag.current.x) / camera.zoom
    const b = (e.clientY - drag.current.y) / (camera.zoom * Math.cos((56 * Math.PI) / 180))
    drag.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: p.x - (a - b) / Math.SQRT2, y: p.y - (a + b) / Math.SQRT2 }))
  }
  const onPointerUp = () => (drag.current = null)

  const go = useCallback((href: string) => navigate(href), [navigate])
  const close = useCallback(() => navigate('/campus'), [navigate])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !panelOpen) return
      // Leave Escape to dialogs, sheets and menus that are open inside the panel.
      if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) return
      close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, close])

  const pageName = PAGE_NAMES.find(([re]) => re.test(location.pathname))?.[1] ?? 'Page'
  const where = placeLabel(world, focus.place)

  return (
    <TooltipProvider delayDuration={400}>
      <div className="world-root fixed inset-0 overflow-hidden bg-[#070a17] text-foreground">
        <a href="#main" className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>

        {/* ── the world ── */}
        <div
          className={cn('campus-stage touch-none', use3d && 'campus-3d', vw < 768 && 'campus-compact', panelOpen && !desktop && 'pointer-events-none opacity-40')}
          style={{ left: desktop ? panelWidth : 0, top: 64 }}
          onPointerDown={use3d ? undefined : onPointerDown}
          onPointerMove={use3d ? undefined : onPointerMove}
          onPointerUp={use3d ? undefined : onPointerUp}
          aria-label="Campus"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_55%,#1a2150_0%,transparent_70%)]" />
          <div aria-hidden="true" className="stars" />
          {world && lens === 'campus' && !use3d && (
            <div className="anchor">
              <Campus world={world} camera={camera} focus={focus} panelOpen={panelOpen} onNavigate={go} />
            </div>
          )}
          {world && lens === 'campus' && use3d && (
            <Suspense
              fallback={
                <div className="anchor">
                  <Campus world={world} camera={camera} focus={focus} panelOpen={panelOpen} onNavigate={go} />
                </div>
              }
            >
              <div className="absolute inset-0">
                <Campus3D world={world} focus={focus} panelOpen={panelOpen} inWorkspace={location.pathname.startsWith('/workers/')} onNavigate={go} />
              </div>
            </Suspense>
          )}
          {world && lens === 'orbit' && (
            <div className="absolute inset-0 grid place-items-center p-6">
              <div className="aspect-square h-full max-h-[min(100%,980px)] max-w-full">
                <Orbit world={world} focus={focus} onNavigate={go} />
              </div>
            </div>
          )}
          {!world && (
            <div className="grid h-full place-items-center text-meta text-white/50" role="status">
              {read.error ? 'The campus could not be read. The pages still work from the Places menu.' : 'Opening the campus…'}
            </div>
          )}
        </div>

        {/* ── HUD ── */}
        <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#070a17]/80 px-4 backdrop-blur-xl">
          <Link to="/campus" className="shrink-0 rounded-md leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="AI Worker Platform — campus">
            <span className="block text-[1.05rem] font-extrabold tracking-tight text-[#7aa7ff]">AI WORKER</span>
            <span className="mt-0.5 block text-[0.5625rem] font-bold tracking-[0.55em] text-white">PLATFORM</span>
          </Link>

          <nav aria-label="Camera path" className="ml-2 hidden min-w-0 items-center gap-1 text-meta text-white/60 md:flex">
            <Link to="/campus" className="rounded px-1.5 py-1 hover:text-white">Campus</Link>
            {where && (
              <>
                <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{where}</span>
              </>
            )}
            {panelOpen && (
              <>
                <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate text-white" aria-current="page">{pageName}</span>
              </>
            )}
          </nav>

          <div role="radiogroup" aria-label="Lens" className="mx-auto hidden items-center gap-1 rounded-xl bg-white/5 p-1 sm:flex">
            {(['campus', 'orbit'] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lens === l}
                onClick={() => setLens(l)}
                className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-meta font-medium text-white/60 outline-none focus-visible:ring-2 focus-visible:ring-ring', lens === l && 'bg-white/10 text-white')}
              >
                {l === 'campus' ? <MapIcon className="size-3.5" aria-hidden="true" /> : <OrbitIcon className="size-3.5" aria-hidden="true" />}
                {l === 'campus' ? 'Campus' : 'Orbit'}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-lg bg-white/5 px-3 py-2 text-meta font-medium text-white/80 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring">Directory</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Every place and section</DropdownMenuLabel>
                {DIRECTORY.map((d) => {
                  const sections = d.groups.flatMap((g) => g.sections)
                  return sections.length === 1 ? (
                    <DropdownMenuItem key={d.key} asChild>
                      <Link to={sections[0].to}><d.icon style={{ color: d.color }} aria-hidden="true" />{d.name}</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuSub key={d.key}>
                      <DropdownMenuSubTrigger><d.icon className="size-4" style={{ color: d.color }} aria-hidden="true" />{d.name}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="max-h-[70vh] w-60 overflow-y-auto">
                        {d.groups.map((g, gi) => (
                          <div key={g.label ?? gi}>
                            {gi > 0 && <DropdownMenuSeparator />}
                            {g.label && <DropdownMenuLabel className="text-meta text-muted-foreground">{g.label}</DropdownMenuLabel>}
                            {g.sections.map((sec) => (
                              <DropdownMenuItem key={sec.to} asChild>
                                <Link to={sec.to}><sec.icon aria-hidden="true" />{sec.label}</Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )
                })}
                {world && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Teams</DropdownMenuLabel>
                    {world.places.filter((p) => p.kind === 'room').map((p) => (
                      <DropdownMenuItem key={p.key} asChild>
                        <Link to={p.href}><span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />{p.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" onClick={() => setCommandOpen(true)} className="hidden items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-meta text-white/60 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring md:flex" aria-label="Jump to (⌘K)">
              <Search className="size-3.5" aria-hidden="true" />Jump to<kbd className="rounded bg-white/10 px-1.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            {world && (
              <span className="hidden items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-meta font-semibold text-emerald-200 lg:flex">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" aria-hidden="true" />
                {world.totals.workers} Workers · {world.totals.serving} serving
              </span>
            )}
            <Link to="/admin/people" aria-label="User management" title="User management" className="grid size-9 place-items-center rounded-lg bg-white/5 text-white/70 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring">
              <KeyRound className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* ── home overlays: the brief and the legend ── */}
        {atHome && world && <CampusHome world={world} lens={lens} />}

        {/* ── map controls ── */}
        {lens === 'campus' && desktop && (
          <div className="fixed right-4 bottom-4 z-20 w-48 rounded-2xl border border-white/10 bg-[#0b0f24]/85 p-3 backdrop-blur-xl">
            <div className="flex justify-between text-[10px] font-semibold tracking-[0.14em] text-white/50"><span>MAP</span><span>{use3d ? level.toUpperCase() : `${Math.round(camera.zoom * 100)}%`}</span></div>
            <svg viewBox="-900 -900 1800 1800" className="my-2 h-24 w-full rounded-lg border border-white/10" aria-hidden="true">
              <circle r={RING.sentinel} fill="none" stroke="#fbbf24" strokeOpacity=".6" strokeWidth="20" />
              <circle r="90" fill="#38bdf8" />
              {world?.places.map((p) => (
                <rect key={p.key} x={p.x - 110} y={p.y - 70} width="220" height="140" rx="30" fill={p.color} opacity={focus.place && focus.place !== p.key ? 0.4 : 1} transform={`rotate(-45 ${p.x} ${p.y})`} />
              ))}
            </svg>
            <div className="grid grid-cols-3 gap-1.5">
              <button type="button" className="rounded-lg bg-white/10 py-1 text-white/80 hover:bg-white/20" aria-label="Zoom out" onClick={() => (use3d ? cameraBus.send('out') : setZoomBias((z) => Math.max(0.5, z / 1.2)))}><Minus className="mx-auto size-3.5" /></button>
              <button type="button" className="rounded-lg bg-white/10 py-1 text-white/80 hover:bg-white/20" aria-label="Zoom in" onClick={() => (use3d ? cameraBus.send('in') : setZoomBias((z) => Math.min(2.5, z * 1.2)))}><Plus className="mx-auto size-3.5" /></button>
              <button type="button" className="rounded-lg bg-white/10 py-1 text-white/80 hover:bg-white/20" aria-label="Recentre" onClick={() => { if (use3d) cameraBus.send('reset'); setPan({ x: 0, y: 0 }); setZoomBias(1) }}><Scan className="mx-auto size-3.5" /></button>
            </div>
          </div>
        )}

        {/* ── the panel: every product page opens here, beside the place it belongs to ── */}
        {panelOpen && (
          <section
            aria-label={pageName}
            className="world-panel fixed top-16 bottom-0 left-0 z-20 flex flex-col border-r border-white/10 bg-background shadow-[20px_0_60px_#0008] motion-safe:animate-in motion-safe:slide-in-from-left-8 motion-safe:fade-in-0"
            style={{ width: panelWidth }}
          >
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 px-3">
              {where && <span className="truncate text-meta text-muted-foreground">{where}</span>}
              <span className="ml-auto" />
              {desktop && !roomPanel && (
                <button type="button" onClick={() => setExpanded((x) => !x)} className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label={expanded ? 'Show the campus beside this page' : 'Expand this page'} title={expanded ? 'Show the campus' : 'Expand'}>
                  {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
              )}
              <button type="button" onClick={close} className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close and return to the campus (Esc)" title="Back to the campus (Esc)">
                <X className="size-4" />
              </button>
            </div>
            <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
              <PageErrorBoundary>
                <Suspense
                  fallback={
                    <PageContainer>
                      <LoadingRegion label="Loading…" className="flex flex-col gap-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></LoadingRegion>
                    </PageContainer>
                  }
                >
                  <Outlet />
                </Suspense>
              </PageErrorBoundary>
            </main>
          </section>
        )}
        {!panelOpen && <main id="main" tabIndex={-1} className="sr-only">Campus overview. Use the Places menu or Jump to (⌘K) to open any area as a page.</main>}

        <WorkNotices />
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} features={MOCK_SESSION.features} />
      </div>
    </TooltipProvider>
  )
}
