import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ChevronRight, Info, Plus, Search, SearchX, Trash2, UserPlus, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Fact, FactList } from '@/components/platform/fact-list'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { useResource } from '@/hooks/use-resource'
import { deleteGroup, effectiveFeatures, FEATURES, getPerson, inheritedFeatures, listGroups, listPeople, ROLES, saveGroup, savePerson, setPersonEnabled, type Group, type Person } from '@/lib/api/admin'
import { formatRelative } from '@/lib/format'

const FIXTURE_NOTE = 'Example people from the console’s test fixtures: the captured session could not read the real list.'

function AdminLayout({ view, children, actions }: { view: 'people' | 'groups'; children: React.ReactNode; actions?: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <PageContainer>
      <PageHeader title="People and access" description="Onboard people, set what each may do, and group them. The platform checks authority on every request." actions={actions} />
      <SectionNav value={view} onChange={(v) => navigate(`/admin/${v}`)} items={[{ value: 'people', label: 'People' }, { value: 'groups', label: 'Groups' }]} />
      <Alert><Info aria-hidden="true" /><AlertDescription>{FIXTURE_NOTE}</AlertDescription></Alert>
      {children}
    </PageContainer>
  )
}

const SIGN_IN: Record<Person['status'], { tone: 'neutral' | 'info'; label: string }> = {
  active: { tone: 'neutral', label: 'Active' },
  invited: { tone: 'info', label: 'Awaiting setup' },
  disabled: { tone: 'neutral', label: 'Disabled' },
}

export function PeoplePage() {
  const { data, refresh } = useResource('people', (signal) => listPeople(signal))
  const groups = useResource('groups', (signal) => listGroups(signal))
  const [q, setQ] = useState('')
  const [state, setState] = useState('all')
  const list = (data ?? []).filter((p) => (state === 'all' || p.status === state) && (!q.trim() || `${p.displayName} ${p.email} ${p.role} ${p.groups.map((g) => groups.data?.find((x) => x.id === g)?.name).join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())))
  const count = (s: Person['status']) => (data ?? []).filter((p) => p.status === s).length

  return (
    <AdminLayout view="people" actions={<Button asChild><Link to="/admin/people/new"><UserPlus aria-hidden="true" />Invite someone</Link></Button>}>
      {!data ? <LoadingRegion label="Reading people…"><Skeleton className="h-48" /></LoadingRegion> : (
        <>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[['Active', count('active'), 'Have set a password'], ['Awaiting setup', count('invited'), 'Invited, no password yet'], ['Disabled', count('disabled'), 'Cannot sign in'], ['Office network only', data.filter((p) => !p.internetAccess).length, 'Cannot sign in over the internet']].map(([l, n, c]) => (
              <div key={l as string}><dt className="text-meta text-muted-foreground">{l}</dt><dd className="text-xl font-semibold tabular-nums">{n}</dd><dd className="text-meta text-muted-foreground">{c}</dd></div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputGroup className="sm:max-w-sm"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, address, role or group" aria-label="Search people" /></InputGroup>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Sign-in state"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Every state</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="invited">Awaiting setup</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent>
            </Select>
          </div>
          {list.length === 0 ? (
            <EmptyState icon={SearchX} title="No match" description="Change the search or the sign-in filter." />
          ) : (
            <Card className="gap-0 py-0">
              <ul className="divide-y">
                {list.map((p) => (
                  <li key={p.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
                    <Link to={`/admin/people/${p.id}`} className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="block truncate text-item hover:underline">{p.displayName}</span>
                      <span className="block truncate text-meta text-muted-foreground">{p.email} · {ROLES.find((r) => r.key === p.role)?.label}{p.groups.length ? ` · ${p.groups.map((g) => groups.data?.find((x) => x.id === g)?.name).join(', ')}` : ''}</span>
                    </Link>
                    <span className="text-meta text-muted-foreground">{p.internetAccess ? 'Internet sign-in' : 'Office network only'} · last active {p.lastActiveAt ? formatRelative(p.lastActiveAt) : 'never'}</span>
                    <StatusBadge tone={SIGN_IN[p.status].tone} icon={null}>{SIGN_IN[p.status].label}</StatusBadge>
                    <Button variant="ghost" size="sm" onClick={async () => { await setPersonEnabled(p.id, p.status === 'disabled'); refresh() }} aria-label={`${p.status === 'disabled' ? 'Enable' : 'Disable'} ${p.displayName}`}>
                      {p.status === 'disabled' ? 'Enable' : 'Disable'}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </AdminLayout>
  )
}

export function PersonPage() {
  const { personId = 'new' } = useParams()
  const isNew = personId === 'new'
  const navigate = useNavigate()
  const person = useResource(`person:${personId}`, (signal) => (isNew ? Promise.resolve(null) : getPerson(personId, signal)))
  const groups = useResource('groups', (signal) => listGroups(signal))
  const [form, setForm] = useState({ email: '', username: '', displayName: '', role: 'viewer', groups: [] as string[], internetAccess: false, effective: new Set<string>() })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = person.data
    if (p) setForm({ email: p.email, username: p.username, displayName: p.displayName, role: p.role, groups: p.groups, internetAccess: p.internetAccess, effective: effectiveFeatures(p) })
    else if (isNew) setForm((f) => ({ ...f, effective: inheritedFeatures({ role: f.role, groups: f.groups }) }))
  }, [person.data, isNew])

  const inherited = useMemo(() => inheritedFeatures({ role: form.role, groups: form.groups }), [form.role, form.groups])
  const setRoleOrGroups = (next: Partial<typeof form>) => setForm((f) => { const merged = { ...f, ...next }; return { ...merged, effective: inheritedFeatures({ role: merged.role, groups: merged.groups }) } })

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      // Only the exceptions travel: grants = effective − inherited, denies = inherited − effective.
      await savePerson({ id: isNew ? undefined : personId, email: form.email, username: form.username || form.email.split('@')[0], displayName: form.displayName || form.email, role: form.role, groups: form.groups, internetAccess: form.internetAccess, grants: [...form.effective].filter((f) => !inherited.has(f)), denies: [...inherited].filter((f) => !form.effective.has(f)) })
      navigate('/admin/people')
    } catch (c) {
      setError(c instanceof Error ? c.message : 'That did not save')
      setBusy(false)
    }
  }

  const p = person.data
  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'People', to: '/admin/people' }, { label: isNew ? 'Invite someone' : (p?.displayName ?? 'Person') }]} title={isNew ? 'Invite someone' : (p?.displayName ?? 'Person')} description={isNew ? 'They receive a link to set a password. No password is created for them.' : 'Changing anything here signs this person out of every open session.'} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-8 p-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-3 text-section">Who</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="display">Display name</Label><Input id="display" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} aria-describedby="display-hint" /><p id="display-hint" className="text-meta text-muted-foreground">Shown in the console and in the invite.</p></div>
            </div>
            {!isNew && <p className="text-meta text-muted-foreground">Sign-in identifier <span className="font-mono">{form.username}</span> cannot be changed.</p>}
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-section">Role</legend>
            <Select value={form.role} onValueChange={(v) => setRoleOrGroups({ role: v })}>
              <SelectTrigger className="w-full sm:w-72" aria-label="Role"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-meta text-muted-foreground">{ROLES.find((r) => r.key === form.role)?.description}</p>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-3 text-section">Groups</legend>
            {(groups.data ?? []).map((g) => (
              <label key={g.id} className="flex items-start gap-3 rounded-xl border px-4 py-3">
                <Checkbox checked={form.groups.includes(g.id)} onCheckedChange={(v) => setRoleOrGroups({ groups: v === true ? [...form.groups, g.id] : form.groups.filter((x) => x !== g.id) })} className="mt-0.5" />
                <span><span className="block text-item">{g.name}</span><span className="block text-meta text-muted-foreground">{g.features.length ? `Adds ${g.features.join(', ')}` : 'No access beyond the role'}</span></span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-section">Where they can sign in from</legend>
            <label className="flex items-center gap-3"><Switch checked={form.internetAccess} onCheckedChange={(v) => setForm({ ...form, internetAccess: v })} /><span className="text-body">Allow sign-in over the internet</span></label>
            <p className="mt-1 text-meta text-muted-foreground">Otherwise office network only.</p>
          </fieldset>
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-section">What they can do</legend>
            <p className="text-meta text-muted-foreground">A tick from the role or a group says so. Only differences from that baseline are saved.</p>
            {[...new Set(FEATURES.map((f) => f.group))].map((group) => (
              <div key={group}>
                <p className="text-overline text-muted-foreground uppercase">{group}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {FEATURES.filter((f) => f.group === group).map((f) => (
                    <li key={f.key}>
                      <label className="flex items-start gap-3">
                        <Checkbox checked={form.effective.has(f.key)} onCheckedChange={(v) => setForm((s) => { const n = new Set(s.effective); if (v === true) n.add(f.key); else n.delete(f.key); return { ...s, effective: n } })} className="mt-0.5" />
                        <span><span className="block text-body">{f.label}{inherited.has(f.key) && <span className="text-meta text-muted-foreground"> · from role or group</span>}</span><span className="block text-meta text-muted-foreground">{f.description}</span></span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </fieldset>
          {error && <Alert variant="destructive"><AlertTitle>That did not save</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="flex gap-2 border-t pt-6">
            <Button onClick={save} disabled={busy}>{busy && <Spinner />}{isNew ? 'Send invite' : 'Save changes'}</Button>
            <Button asChild variant="outline"><Link to="/admin/people">Cancel</Link></Button>
          </div>
        </Card>
        {p && (
          <Card className="gap-0 p-5">
            <h2 className="text-item">Account</h2>
            <FactList className="mt-3">
              <Fact label="Invited" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{p.invitedAt ? <><Timestamp iso={p.invitedAt} />{p.invitedBy ? ` by ${p.invitedBy}` : ''}</> : 'Not invited through the console'}</Fact>
              <Fact label="Password" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{p.activatedAt ? 'Set' : 'Not set yet'}</Fact>
              <Fact label="Last active" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{p.lastActiveAt ? <Timestamp iso={p.lastActiveAt} /> : 'Never'}</Fact>
              <Fact label="Last invite" className="sm:grid-cols-[6rem_minmax(0,1fr)]">{p.lastInviteStatus ?? 'None'}</Fact>
            </FactList>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}

export function GroupsPage() {
  const { data, refresh } = useResource('groups', (signal) => listGroups(signal))
  const [editing, setEditing] = useState<Partial<Group> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    if (!editing) return
    try {
      await saveGroup({ id: editing.id, name: editing.name ?? '', description: editing.description ?? '', defaultRole: editing.defaultRole ?? null, defaultInternetAccess: editing.defaultInternetAccess ?? false, features: editing.features ?? [] })
      setEditing(null)
      setError(null)
      refresh()
    } catch (c) {
      setError(c instanceof Error ? c.message : 'That did not save')
    }
  }
  return (
    <AdminLayout view="groups" actions={<Button onClick={() => setEditing({ features: [] })}><Plus aria-hidden="true" />New group</Button>}>
      {editing && (
        <Card className="gap-5 p-6">
          <h2 className="text-section">{editing.id ? `Edit ${editing.name}` : 'New group'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><Label htmlFor="g-name">Name</Label><Input id="g-name" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="g-role">Default role</Label>
              <Select value={editing.defaultRole ?? 'none'} onValueChange={(v) => setEditing({ ...editing, defaultRole: v === 'none' ? null : v })}>
                <SelectTrigger id="g-role" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">No default</SelectItem>{ROLES.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="g-desc">Description</Label><Textarea id="g-desc" rows={2} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div>
            <p className="text-item">What this group grants</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.key}><label className="flex items-center gap-2 text-body"><Checkbox checked={(editing.features ?? []).includes(f.key)} onCheckedChange={(v) => setEditing({ ...editing, features: v === true ? [...(editing.features ?? []), f.key] : (editing.features ?? []).filter((x) => x !== f.key) })} />{f.label}</label></li>
              ))}
            </ul>
          </div>
          {error && <p className="text-meta text-destructive">{error}</p>}
          <div className="flex gap-2"><Button onClick={save}>Save group</Button><Button variant="outline" onClick={() => { setEditing(null); setError(null) }}>Cancel</Button></div>
        </Card>
      )}
      {!data ? <Skeleton className="h-32" /> : data.length === 0 ? (
        <EmptyState icon={Users} title="No groups yet" description="Create one to give a team the same access in a single step." />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {data.map((g) => (
              <li key={g.id} className="flex items-center gap-4 px-5 py-4">
                <button type="button" onClick={() => setEditing(g)} className="min-w-0 flex-1 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="block text-item hover:underline">{g.name}</span>
                  <span className="block truncate text-meta text-muted-foreground">{g.features.length ? `Grants ${g.features.join(', ')}` : 'No access beyond the role'} · {g.memberCount} members</span>
                </button>
                <Button variant="ghost" size="icon-sm" aria-label={`Delete ${g.name}`} onClick={async () => { await deleteGroup(g.id); refresh() }}><Trash2 aria-hidden="true" /></Button>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AdminLayout>
  )
}
