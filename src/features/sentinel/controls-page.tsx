import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Ban, ChevronDown, Gavel, ChevronRight, FileText, History, Hourglass, Lock, OctagonX, PauseCircle, Search, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconTile, Panel } from '@/components/platform/panel'
import { Paged } from '@/components/platform/section-pager'
import { Timestamp } from '@/components/platform/timestamp'
import { WORKERS, workerLabel } from './demo/platform'
import { useDemo } from './demo/store'
import { AUTHORITY_LABEL, awaitingReview, CONTROL_LABEL } from './demo/selectors'
import type { Control } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { stopSpec, withParam } from './specs'
import { ActionDialog, type ActionSpec } from './ui'

const ALL = '__all'
const KINDS = Object.keys(CONTROL_LABEL) as Control['kind'][]

/** Picks a running Worker, then hands over to the one stop confirmation. */
function StopPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: string) => void }) {
  const s = useDemo()
  const [id, setId] = useState('')
  const options = WORKERS.filter((w) => s.workers[w.composition_id]?.status !== 'stopped').map((w) => w.composition_id).sort((a, b) => workerLabel(a).localeCompare(workerLabel(b)))
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-section">Stop a Worker</DialogTitle>
          <DialogDescription className="sr-only">Choose the Worker to stop.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stop-worker">Worker</Label>
          <Select value={id} onValueChange={setId}>
            <SelectTrigger id="stop-worker" className="w-full"><SelectValue placeholder="Choose a Worker" /></SelectTrigger>
            <SelectContent>{options.map((w) => <SelectItem key={w} value={w}>{workerLabel(w)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button disabled={!id} onClick={() => { onPick(id); setId('') }}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Controls as a table: what, who, applied by and when, and state. A row opens the control's drawer. */
const CONTROL_ICON: Record<Control['kind'], LucideIcon> = { admin_stop: OctagonX, harness_block: Ban, sharing_suspension: PauseCircle, recording_only: FileText }

function ControlsTable({ rows, params, caption }: { rows: Control[]; params: URLSearchParams; caption: string }) {
  return (
    <Paged rows={rows} label={caption}>{(page) => <div className="relative overflow-x-auto">
      <table className="w-full text-left text-body">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-2.5 font-medium">Control</th>
            <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Worker</th>
            <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Applied</th>
            <th scope="col" className="px-2 py-2.5"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {page.map((c) => {
            const Icon = CONTROL_ICON[c.kind]
            return (
              <tr key={c.id} className="hover:bg-muted/40">
                <td className="max-w-0 px-5 py-3">
                  <Link to={withParam(params, 'control', c.id)} preventScrollReset title={`${CONTROL_LABEL[c.kind]} · ${c.reason}`} className="flex min-w-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <IconTile icon={Icon} hue={c.active ? 'rose' : 'blue'} size="sm" />
                    <span className="truncate font-medium hover:underline">{c.title}</span>
                  </Link>
                </td>
                <td className="hidden max-w-56 truncate px-4 py-3 text-meta text-muted-foreground md:table-cell" title={c.workerIds.map(workerLabel).join(', ') || c.scope}>{c.workerIds.length === 0 ? c.scope : c.workerIds.length === 1 ? workerLabel(c.workerIds[0]) : `${c.workerIds.length} Workers`}</td>
                <td className="hidden px-4 py-3 text-meta whitespace-nowrap text-muted-foreground lg:table-cell"><Timestamp iso={c.since} /></td>
                <td className="w-10 px-2 py-3"><Link to={withParam(params, 'control', c.id)} preventScrollReset aria-label={`Open ${c.title}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></Link></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>}</Paged>
  )
}

/**
 * Restrictions, kept apart by state: what is in force now, recommendations still waiting for a
 * person (not in force), and what was lifted. Filters live in the URL and apply to all three. A
 * row opens the control's drawer with its history and actions.
 */
export function SentinelControlsPage() {
  const s = useDemo()
  const [params, setParams] = useSearchParams()
  const [picking, setPicking] = useState(false)
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const get = (k: string) => params.get(k)
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (!v || v === ALL) n.delete(k)
      else n.set(k, v)
      return n
    }, { replace: true, preventScrollReset: true })
  const kind = KINDS.find((k) => k === get('kind')) ?? null
  const worker = get('worker')
  const q = (get('q') ?? '').trim().toLowerCase()
  const [showLifted, setShowLifted] = useState(get('state') === 'lifted' || get('state') === 'all')
  const match = (c: Control) => (!kind || c.kind === kind) && (!worker || c.workerIds.includes(worker)) && (!q || [c.title, c.reason, c.scope, ...c.workerIds.map(workerLabel)].some((x) => x.toLowerCase().includes(q)))
  const sorted = s.controls.filter(match).sort((a, b) => b.since.localeCompare(a.since))
  const active = sorted.filter((c) => c.active)
  const lifted = sorted.filter((c) => !c.active)
  // Recommendations that would restrict something, still waiting for a person. Not controls yet.
  const pending = kind ? [] : awaitingReview(s).filter((d) => (!worker || d.workerIds.includes(worker)) && (!q || [d.title, d.reason, ...d.workerIds.map(workerLabel)].some((x) => x.toLowerCase().includes(q))))
  const filtering = Boolean(kind || worker || q)

  return (
    <SentinelLayout view="controls">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter controls">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput type="search" value={get('q') ?? ''} onChange={(e) => set('q', e.target.value)} placeholder="Worker, control or reason" aria-label="Search controls by Worker, control or reason" />
        </InputGroup>
        <Select value={kind ?? ALL} onValueChange={(v) => set('kind', v)}>
          <SelectTrigger className="w-52" aria-label="Control type"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All control types</SelectItem>{KINDS.map((k) => <SelectItem key={k} value={k}>{CONTROL_LABEL[k]}</SelectItem>)}</SelectContent>
        </Select>
        {worker && <Button variant="secondary" size="sm" onClick={() => set('worker', null)} aria-label={`Remove Worker filter: ${workerLabel(worker)}`}>{workerLabel(worker)} ×</Button>}
        {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
        <Button variant="outline" className="sm:ml-auto" onClick={() => setPicking(true)}><OctagonX aria-hidden="true" />Stop a Worker…</Button>
      </div>

      <Panel id="in-force" title="In force" icon={Lock} hue="rose" count={active.length} flush>
        {active.length === 0 ? <p className="px-5 py-4 text-body text-muted-foreground">{filtering ? 'No control in force matches these filters.' : 'No controls are in force.'}</p> : <ControlsTable key={[kind, worker, q].join('|')} rows={active} params={params} caption="Controls in force" />}
      </Panel>

      {pending.length > 0 && (
        <Panel id="pending" title="Pending recommendations" icon={Hourglass} hue="amber" count={pending.length} flush>
          <ul className="divide-y">
            {pending.map((d) => (
              <li key={d.id}>
                <Link to={`/sentinel/decisions/${d.id}`} className="flex items-center gap-3 px-5 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                  <IconTile icon={Gavel} hue="amber" size="sm" />
                  <span className="min-w-0 flex-1 truncate text-body" title={`${d.workerIds.map(workerLabel).join(', ') || 'Platform-wide'} · ${AUTHORITY_LABEL[d.decidedBy.kind]}`}>{d.title}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {lifted.length > 0 && (
        <Panel
          id="lifted"
          title="Lifted"
          icon={History}
          hue="blue"
          count={lifted.length}
          flush
          aside={<Button variant="ghost" size="sm" onClick={() => setShowLifted((v) => !v)} aria-expanded={showLifted} aria-controls="lifted-list">{showLifted ? 'Hide' : 'Show'}<ChevronDown className={showLifted ? 'rotate-180' : undefined} aria-hidden="true" /></Button>}
        >
          {showLifted && <div id="lifted-list"><ControlsTable key={[kind, worker, q].join('|')} rows={lifted} params={params} caption="Lifted controls" /></div>}
        </Panel>
      )}

      <StopPicker open={picking} onClose={() => setPicking(false)} onPick={(id) => { setPicking(false); setSpec(stopSpec(s, id)) }} />
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelLayout>
  )
}
