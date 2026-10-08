import { useId, useState } from 'react'
import { CirclePause, CirclePlay, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { changeIdentity } from '@/lib/api/workers'
import type { IdentityState } from '@/lib/types/worker'

type Action = 'pause' | 'resume' | 'revoke'

const COPY: Record<Action, { title: string; verb: string; consequence: string }> = {
  pause: {
    title: 'Pause identity',
    verb: 'Pause identity',
    consequence: 'The Worker stops being issued new credentials until its identity is resumed. Credentials already issued stay valid until they expire.',
  },
  resume: {
    title: 'Resume identity',
    verb: 'Resume identity',
    consequence: 'The Worker can be issued credentials again and authenticate within its recorded scope.',
  },
  revoke: {
    title: 'Revoke identity',
    verb: 'Revoke identity',
    consequence:
      'Revoking stops this Worker authenticating to anything. Every runtime it has loses access when its current credential expires, and the identity cannot be issued again.',
  },
}

const RESULT: Record<IdentityState, string> = {
  PAUSED: 'Identity paused. No new credentials are issued until it is resumed.',
  ACTIVE: 'Identity resumed. The Worker can be issued credentials again.',
  REVOKED: 'Identity revoked. This is permanent.',
  PROVISIONED: 'Identity provisioned.',
}

/**
 * Pause / resume / revoke. Revoke is terminal and needs the Worker's exact name typed (P-12);
 * every dialog names the target and the consequence, and the commit says what it does (P-10).
 * The identity realm changes before anything is recorded, so a failure is always shown.
 */
export function IdentityControls({ compositionId, workerName, state, onChanged }: { compositionId: string; workerName: string; state: IdentityState; onChanged: () => void }) {
  const [action, setAction] = useState<Action | null>(null)
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const inputId = useId()

  if (state === 'REVOKED') {
    return <p className="text-meta text-muted-foreground">Revoked identities cannot be paused, resumed or issued again.</p>
  }

  const open = (next: Action) => {
    setAction(next)
    setTyped('')
    setError(null)
  }
  const commit = async () => {
    if (!action) return
    setPending(true)
    setError(null)
    try {
      const next = await changeIdentity(compositionId, action)
      setResult(RESULT[next])
      setAction(null)
      onChanged()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The change could not be applied.')
    } finally {
      setPending(false)
    }
  }

  const copy = action ? COPY[action] : null
  const blocked = action === 'revoke' && typed !== workerName

  return (
    <div className="flex flex-col gap-3">
      {result && (
        <Alert role="status" className="border-border">
          <AlertTitle className="text-item">{result}</AlertTitle>
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        {state === 'PAUSED' ? (
          <Button variant="outline" size="sm" onClick={() => open('resume')}>
            <CirclePlay aria-hidden="true" />
            Resume identity
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => open('pause')}>
            <CirclePause aria-hidden="true" />
            Pause identity
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => open('revoke')}>
          <ShieldOff aria-hidden="true" />
          Revoke…
        </Button>
      </div>

      <Dialog open={action !== null} onOpenChange={(o) => !o && !pending && setAction(null)}>
        <DialogContent className="sm:max-w-md">
          {copy && (
            <>
              <DialogHeader>
                <DialogTitle className="text-section">{copy.title}</DialogTitle>
                <DialogDescription className="text-body">
                  <span className="font-medium text-foreground">{workerName}</span>. {copy.consequence}
                </DialogDescription>
              </DialogHeader>
              {action === 'revoke' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={inputId}>Type the Worker’s name to confirm</Label>
                  <Input id={inputId} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" placeholder={workerName} />
                  <p className="text-meta text-muted-foreground">This only guards against the wrong Worker. Permission is checked by the platform.</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>The change could not be applied.</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={pending}>Cancel</Button>
                </DialogClose>
                <Button variant={action === 'revoke' ? 'destructive' : 'default'} className={action === 'revoke' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined} disabled={blocked || pending} onClick={commit}>
                  {pending && <Spinner />}
                  {copy.verb}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
