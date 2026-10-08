import { Link } from 'react-router'
import { Activity, CircleCheck, CircleX, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { SidebarMenuBadge, SidebarMenuButton } from '@/components/ui/sidebar'
import { dismissOperation, useOperations } from '@/lib/operations'

// P-22: background work is visible from anywhere, with a way back to it.
export function ActiveWork() {
  const ops = useOperations()
  const active = ops.filter((o) => o.state === 'RUNNING' || o.state === 'QUEUED')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton className="h-9" tooltip="Active work">
          <Activity aria-hidden="true" />
          <span>Active work</span>
        </SidebarMenuButton>
      </PopoverTrigger>
      {active.length > 0 && <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground">{active.length}</SidebarMenuBadge>}
      <PopoverContent side="right" align="end" className="w-80">
        <p className="text-item">Work in progress</p>
        {active.length === 0 ? (
          <p className="mt-1 text-body text-muted-foreground">No background work is running.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {active.map((o) => (
              <li key={o.id}>
                <Link to={o.href} className="block rounded-lg outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="block text-item">{o.label}</span>
                  <span className="block truncate text-meta text-muted-foreground">{o.subject} · {o.phase}</span>
                  <Progress value={o.progress} aria-label={`${o.label}: ${o.progress}%`} className="mt-2 h-1.5 [&_[data-slot=progress-indicator]]:bg-brand" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-meta text-muted-foreground">Work keeps going if you close the page.</p>
      </PopoverContent>
    </Popover>
  )
}

const ENDED: Record<string, { word: string; detail: string }> = {
  SUCCEEDED: { word: 'finished', detail: 'It finished while you were elsewhere.' },
  FAILED: { word: 'failed', detail: 'It stopped before it finished.' },
  CANCELLED: { word: 'cancelled', detail: 'It did not finish.' },
}

/** How background work ended: persistent and dismissible, never a toast, never steals focus. */
export function WorkNotices() {
  const ops = useOperations().filter((o) => !o.dismissed && ENDED[o.state])
  if (ops.length === 0) return null
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-40 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {ops.map((o) => {
        const ended = ENDED[o.state]
        const ok = o.state === 'SUCCEEDED'
        return (
          <div key={o.id} className="pointer-events-auto flex gap-3 rounded-xl border bg-popover p-4 shadow-lg">
            {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />}
            <div className="min-w-0 flex-1">
              <p className="text-item">{o.label} {ended.word}</p>
              <p className="truncate text-meta text-muted-foreground">{o.subject}. {ended.detail}</p>
              <Link to={o.href} onClick={() => dismissOperation(o.id)} className="mt-1 inline-block rounded-sm text-meta font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Open
              </Link>
            </div>
            <button type="button" onClick={() => dismissOperation(o.id)} aria-label={`Dismiss: ${o.label} ${ended.word}`} className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
