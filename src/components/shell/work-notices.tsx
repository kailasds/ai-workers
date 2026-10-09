import { Link } from 'react-router'
import { CircleCheck, CircleX, X } from 'lucide-react'
import { dismissOperation, useOperations } from '@/lib/operations'

// P-22: background work keeps running when you leave its page; how it ended is always shown.
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
