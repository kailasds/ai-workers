import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Bot } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

function PublicFrame({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[10px] bg-primary text-primary-foreground"><Bot className="size-5" aria-hidden="true" /></span>
          <span className="leading-tight"><span className="block text-item">AI Worker Platform</span><span className="block text-meta text-muted-foreground">Tata Consultancy Services</span></span>
        </div>
        <Card className="gap-5 p-6">
          <div>
            <h1 className="text-section">{title}</h1>
            <p className="mt-1 text-meta text-muted-foreground">{lead}</p>
          </div>
          {children}
        </Card>
        <p className="mt-6 text-center text-meta text-muted-foreground">Offline mock · no credentials leave this browser</p>
      </div>
    </main>
  )
}

// MOCK: the real console posts credentials to its own API, which exchanges them with the
// identity provider and sets an httpOnly cookie; the browser never holds a token. Here any
// username with a non-empty password signs in; "locked" shows a named failure.
export function LoginPage() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { from?: string } | null }
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<{ title: string; detail: string } | null>(null)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFailure(null)
    setTimeout(() => {
      setBusy(false)
      if (username.trim().toLowerCase() === 'locked') {
        setFailure({ title: 'Account locked', detail: 'Try again in 300 seconds, or contact your platform administrator.' })
      } else if (!username.trim() || !password) {
        setFailure({ title: 'Username or password is incorrect', detail: 'Check both fields and try again.' })
      } else {
        navigate(state?.from ?? '/home', { replace: true })
        return
      }
      setPassword('')
    }, 600)
  }
  return (
    <PublicFrame title="Sign in" lead="Compose, operate and govern accountable AI workers. Use your platform identity to continue.">
      {failure && <Alert variant="destructive" aria-live="polite"><AlertTitle>{failure.title}</AlertTitle><AlertDescription>{failure.detail}</AlertDescription></Alert>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="username">Username</Label><Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" disabled={busy}>{busy && <Spinner />}Sign in</Button>
      </form>
      <Link to="/auth/forgot" className="text-meta underline underline-offset-4">Forgot your password?</Link>
      <p className="border-t pt-4 text-meta text-muted-foreground">Protected platform access</p>
    </PublicFrame>
  )
}

export function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <PublicFrame title="Reset your password" lead="We send a link to the address on the account. The link expires in one hour.">
      {sent ? (
        // Identical whether or not the address has an account.
        <Alert role="status"><AlertTitle className="text-item">Check your email</AlertTitle><AlertDescription>If an account uses that address, a reset link is on its way.</AlertDescription></Alert>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button type="submit">Send link</Button>
        </form>
      )}
      <Link to="/login" className="text-meta underline underline-offset-4">Back to sign in</Link>
    </PublicFrame>
  )
}

export function SetPasswordPage({ mode }: { mode: 'invite' | 'reset' }) {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [done, setDone] = useState(false)
  const strong = a.length >= 8 && /[A-Z]/.test(a) && /[a-z]/.test(a) && /\d/.test(a) && /[^A-Za-z0-9]/.test(a)
  const title = mode === 'invite' ? 'Set up your account' : 'Choose a new password'
  if (!token) return <PublicFrame title={title} lead="This link is incomplete."><Link to="/login" className="text-meta underline underline-offset-4">Back to sign in</Link></PublicFrame>
  return (
    <PublicFrame title={title} lead="At least 8 characters, with an upper-case letter, a lower-case letter, a digit and a symbol.">
      {done ? (
        <Alert role="status"><AlertTitle className="text-item">You can sign in now.</AlertTitle></Alert>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (strong && a === b) setDone(true) }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><Label htmlFor="p1">New password</Label><Input id="p1" type="password" autoComplete="new-password" value={a} onChange={(e) => setA(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="p2">Repeat it</Label><Input id="p2" type="password" autoComplete="new-password" value={b} onChange={(e) => setB(e.target.value)} aria-invalid={b !== '' && a !== b} />{b !== '' && a !== b && <p className="text-meta text-destructive">The two passwords are not the same.</p>}</div>
          <Button type="submit" disabled={!strong || a !== b}>{mode === 'invite' ? 'Set password and activate' : 'Set new password'}</Button>
        </form>
      )}
      <Link to="/login" className="text-meta underline underline-offset-4">Back to sign in</Link>
    </PublicFrame>
  )
}
