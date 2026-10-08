import { cva, type VariantProps } from 'class-variance-authority'
import { Ban, CircleCheck, CircleDashed, CirclePause, CirclePlay, CircleSlash, CircleX, Clock, Info, Loader, PowerOff, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FreshnessState, Verdict } from '@/lib/types/dashboard'
import type { IdentityState, PortfolioWorker, RuntimeHealth, RuntimeRecord, RuntimeState } from '@/lib/types/worker'

// One shared treatment for every recorded state (design.md §8): a filled, low-opacity tint pill
// with a leading icon AND a word, so colour is never the only cue. Tone follows the product's
// rules: green only for a verified result; neutral for waiting/unknown; warning for stale/attention;
// danger for failed / not met; info for in-flight.
const statusBadgeVariants = cva(
  'inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 text-meta font-medium whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0',
  {
    variants: {
      tone: {
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-destructive/10 text-destructive',
        info: 'bg-info/10 text-info',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

const toneIcon: Record<NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>, LucideIcon> = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
  neutral: CircleDashed,
}

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  icon?: LucideIcon | null
  className?: string
}

export function StatusBadge({ tone = 'neutral', icon, className, children }: StatusBadgeProps) {
  const Icon = icon === null ? null : (icon ?? toneIcon[tone ?? 'neutral'])
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  )
}

const verdictMap: Record<Verdict, { tone: 'success' | 'danger' | 'neutral'; label: string }> = {
  MET: { tone: 'success', label: 'Met' },
  NOT_MET: { tone: 'danger', label: 'Not met' },
  NOT_ADJUDICABLE: { tone: 'neutral', label: 'Awaiting evidence' },
}

export const verdictLabel = (v: Verdict) => verdictMap[v].label

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const { tone, label } = verdictMap[verdict]
  return (
    <StatusBadge tone={tone} className={className}>
      {label}
    </StatusBadge>
  )
}

const freshnessMap: Record<FreshnessState, { tone: 'neutral' | 'warning' | 'danger'; label: string; icon: LucideIcon }> = {
  CURRENT: { tone: 'neutral', label: 'Current', icon: CircleCheck },
  DELAYED: { tone: 'warning', label: 'Delayed', icon: Clock },
  STALE: { tone: 'warning', label: 'Stale', icon: Clock },
  UNAVAILABLE: { tone: 'danger', label: 'Unavailable', icon: CircleX },
}

export function FreshnessBadge({ state, className }: { state: FreshnessState; className?: string }) {
  const { tone, label, icon } = freshnessMap[state]
  return (
    <StatusBadge tone={tone} icon={icon} className={className}>
      {label}
    </StatusBadge>
  )
}

// ── Worker states ────────────────────────────────────────────────────────────


/** Portfolio runtime facet: Serving · N / Stopped · N / No runtime, warning when any runtime failed. */
export function RuntimeSummaryBadge({ runtime }: { runtime: PortfolioWorker['runtime'] }) {
  if (runtime.attention > 0)
    return <StatusBadge tone="warning">{runtime.attention === 1 ? '1 runtime needs attention' : `${runtime.attention} runtimes need attention`}</StatusBadge>
  if (runtime.serving > 0) return <StatusBadge tone="success" icon={CirclePlay}>Serving · {runtime.serving}</StatusBadge>
  if (runtime.stopped > 0) return <StatusBadge tone="neutral" icon={CirclePause}>Stopped · {runtime.stopped}</StatusBadge>
  return <StatusBadge tone="neutral" icon={CircleSlash}>No runtime</StatusBadge>
}

const identityMap: Record<IdentityState, { tone: 'neutral' | 'warning' | 'danger'; label: string; icon: LucideIcon }> = {
  PROVISIONED: { tone: 'neutral', label: 'Identity provisioned', icon: CircleDashed },
  ACTIVE: { tone: 'neutral', label: 'Identity active', icon: CircleCheck },
  PAUSED: { tone: 'warning', label: 'Identity paused', icon: CirclePause },
  REVOKED: { tone: 'danger', label: 'Identity revoked', icon: Ban },
}

export function IdentityBadge({ state }: { state: IdentityState }) {
  const { tone, label, icon } = identityMap[state]
  return <StatusBadge tone={tone} icon={icon}>{label}</StatusBadge>
}

const lifecycleMap: Record<RuntimeState, { tone: 'success' | 'neutral' | 'danger' | 'info'; label: string; icon: LucideIcon }> = {
  DEPLOYING: { tone: 'info', label: 'Deploying', icon: Loader },
  RUNNING: { tone: 'neutral', label: 'Running', icon: CirclePlay },
  STOPPED: { tone: 'neutral', label: 'Stopped', icon: CirclePause },
  FAILED: { tone: 'danger', label: 'Failed', icon: CircleX },
  TERMINATED: { tone: 'neutral', label: 'Terminated', icon: PowerOff },
}
const healthMap: Record<RuntimeHealth, { tone: 'success' | 'neutral' | 'warning'; label: string }> = {
  STARTING: { tone: 'neutral', label: 'Starting' },
  HEALTHY: { tone: 'success', label: 'Healthy' },
  UNHEALTHY: { tone: 'warning', label: 'Unhealthy' },
  STOPPED: { tone: 'neutral', label: 'Stopped' },
  UNKNOWN: { tone: 'neutral', label: 'Health unknown' },
}

/** Lifecycle and health are two observations. Health is never printed over a stopped,
 *  failed or terminated lifecycle (RULE-094). */
export function RuntimeStateBadges({ runtime }: { runtime: Pick<RuntimeRecord, 'state' | 'health'> }) {
  const life = lifecycleMap[runtime.state]
  const showHealth = runtime.state === 'RUNNING' || runtime.state === 'DEPLOYING'
  const health = healthMap[runtime.health]
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <StatusBadge tone={life.tone} icon={life.icon}>{life.label}</StatusBadge>
      {showHealth && <StatusBadge tone={health.tone}>{health.label}</StatusBadge>}
    </span>
  )
}

export const STOP_REASON: Record<string, string> = {
  stopped: 'Stopped by an operator',
  expired: 'Expired at its auto-stop time',
  terminated: 'Terminated',
  termination_failed: 'Termination failed. Retrying.',
}
