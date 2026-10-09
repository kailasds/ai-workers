import { useEffect, useRef } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEPS, type StationKey } from './compose-model'

export type StepState = 'done' | 'current' | 'upcoming' | 'attention'

// design.md §7.1: one framed strip of equal cells. Done = green check disc; current = soft blue
// cell, underline and filled disc; upcoming = grey disc and subtle text, not clickable.
export function ComposeStepper({ states, onSelect }: { states: Record<StationKey, StepState>; onSelect?: (k: StationKey) => void }) {
  const strip = useRef<HTMLElement>(null)
  const current = useRef<HTMLLIElement>(null)
  const currentKey = STEPS.find((s) => states[s.key] === 'current')?.key
  useEffect(() => {
    // On phones the strip scrolls; keep the current step in view. Scroll only the strip itself —
    // scrollIntoView would also shift clipped ancestors of the page.
    const nav = strip.current
    const li = current.current
    if (nav && li) nav.scrollLeft = li.offsetLeft - (nav.clientWidth - li.offsetWidth) / 2
  }, [currentKey])

  return (
    <nav ref={strip} aria-label="Compose steps" className="relative overflow-x-auto rounded-xl border bg-card [scrollbar-width:none]">
      <ol className="grid min-w-max auto-cols-[minmax(10.5rem,1fr)] grid-flow-col lg:min-w-0">
        {STEPS.map((s, i) => {
          const state = states[s.key]
          const here = state === 'current'
          const reachable = Boolean(onSelect) && state !== 'upcoming' && !here
          const body = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-meta font-medium tabular-nums',
                  state === 'done' && 'bg-success text-success-foreground',
                  here && 'bg-primary text-primary-foreground',
                  state === 'upcoming' && 'bg-muted text-subtle-foreground',
                  state === 'attention' && 'bg-warning/10 text-warning',
                )}
              >
                {state === 'done' ? <Check className="size-4" strokeWidth={2.5} /> : state === 'attention' ? <TriangleAlert className="size-3.5" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn('block truncate text-[0.875rem] leading-5 font-semibold', here ? 'text-primary-strong' : state === 'upcoming' ? 'text-subtle-foreground' : 'text-foreground')}>{s.label}</span>
                <span className={cn('block truncate text-meta', state === 'upcoming' ? 'text-subtle-foreground' : 'text-muted-foreground')}>{s.sub}</span>
              </span>
              <span className="sr-only">{state === 'done' ? '(confirmed)' : state === 'attention' ? '(needs attention)' : here ? '(current step)' : '(not started)'}</span>
            </>
          )
          const cell = cn(
            'flex h-full w-full items-center gap-3 px-3.5 py-3.5 xl:px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            here && 'bg-primary-soft shadow-[inset_0_-2px_0_var(--primary)]',
          )
          return (
            <li key={s.key} ref={here ? current : undefined} aria-current={here ? 'step' : undefined} className={cn(i === 0 && 'overflow-hidden rounded-l-xl', i === STEPS.length - 1 && 'overflow-hidden rounded-r-xl')}>
              {reachable ? (
                <button type="button" onClick={() => onSelect?.(s.key)} className={cn(cell, 'hover:bg-muted/50')}>
                  {body}
                </button>
              ) : (
                <div className={cell}>{body}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
