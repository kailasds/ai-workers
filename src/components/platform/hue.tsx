import { Code, FlaskConical, ListChecks, RefreshCcwDot, Repeat2, Route, TestTubes, Workflow, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// design.md §3 category hues. A hue names WHICH kind of thing (a bounded context, a Worker type),
// never a state: status keeps its own green/amber/red. The same thing always gets the same hue.

export type Hue = 'blue' | 'cyan' | 'violet' | 'teal' | 'amber' | 'rose'

// Literal class strings so Tailwind can see them.
export const HUE: Record<Hue, { solid: string; soft: string; text: string; ring: string }> = {
  blue: { solid: 'bg-hue-blue text-white', soft: 'bg-hue-blue-soft', text: 'text-hue-blue', ring: 'ring-hue-blue/25' },
  cyan: { solid: 'bg-hue-cyan text-white', soft: 'bg-hue-cyan-soft', text: 'text-hue-cyan', ring: 'ring-hue-cyan/25' },
  violet: { solid: 'bg-hue-violet text-white', soft: 'bg-hue-violet-soft', text: 'text-hue-violet', ring: 'ring-hue-violet/25' },
  teal: { solid: 'bg-hue-teal text-white', soft: 'bg-hue-teal-soft', text: 'text-hue-teal', ring: 'ring-hue-teal/25' },
  amber: { solid: 'bg-hue-amber text-white', soft: 'bg-hue-amber-soft', text: 'text-hue-amber', ring: 'ring-hue-amber/25' },
  rose: { solid: 'bg-hue-rose text-white', soft: 'bg-hue-rose-soft', text: 'text-hue-rose', ring: 'ring-hue-rose/25' },
}

const ORDER: Hue[] = ['blue', 'violet', 'teal', 'cyan', 'amber', 'rose']

// The four captured contexts get fixed hues; any other key hashes onto the same order.
const CONTEXT_HUE: Record<string, Hue> = {
  'qe-testcases-to-executed-scripts': 'violet',
  'tibco-bw-to-spring-boot-services': 'blue',
  'tibco-bw-to-spring-boot-services-tests': 'teal',
  'tibco-bw-to-spring-boot-services-tests-traceability': 'cyan',
}

// Each captured context also has its own icon, so a context reads the same on its banner, its
// shelf and every Worker card in it. Unknown contexts fall back to Workflow.
const CONTEXT_ICON: Record<string, LucideIcon> = {
  'qe-testcases-to-executed-scripts': ListChecks,
  'tibco-bw-to-spring-boot-services': Repeat2,
  'tibco-bw-to-spring-boot-services-tests': TestTubes,
  'tibco-bw-to-spring-boot-services-tests-traceability': Route,
}

export function contextIcon(key: string | null | undefined): LucideIcon {
  return (key && CONTEXT_ICON[key]) || Workflow
}

export function contextHue(key: string | null | undefined): Hue {
  if (!key) return 'blue'
  if (CONTEXT_HUE[key]) return CONTEXT_HUE[key]
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return ORDER[h % ORDER.length]
}

const TYPE: Record<string, { icon: LucideIcon; hue: Hue; short: string }> = {
  'quality-engineering': { icon: FlaskConical, hue: 'violet', short: 'Quality Engineering' },
  modernization: { icon: RefreshCcwDot, hue: 'blue', short: 'Modernisation' },
  'software-engineering': { icon: Code, hue: 'teal', short: 'Software Engineering' },
}

export function workerTypeMeta(key: string) {
  return TYPE[key] ?? { icon: Workflow, hue: 'blue' as Hue, short: key }
}

/** A category tag (design.md §8): 6px radius, the hue's soft fill and strong text. */
export function Tag({ hue, icon: Icon, children, className }: { hue: Hue; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 max-w-full items-center gap-1 rounded-tag px-2 text-meta font-medium whitespace-nowrap', HUE[hue].soft, HUE[hue].text, className)}>
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** A solid hue tile holding a white icon: the visual hook for a kind of thing. */
export function HueTile({ hue, icon: Icon, size = 'md', className }: { hue: Hue; icon: LucideIcon; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dim = size === 'lg' ? 'size-12 rounded-block [&>svg]:size-6' : size === 'sm' ? 'size-7 rounded-lg [&>svg]:size-4' : 'size-10 rounded-block [&>svg]:size-5'
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center', dim, HUE[hue].solid, className)}>
      <Icon />
    </span>
  )
}
