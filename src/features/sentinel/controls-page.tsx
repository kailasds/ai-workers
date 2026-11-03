import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronRight, OctagonX, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Panel } from '@/components/platform/panel'
import { Paged } from '@/components/platform/section-pager'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { WORKERS, workerLabel } from './demo/platform'
import { useDemo } from './demo/store'
import { CONTROL_LABEL, controlSource } from './demo/selectors'
import type { Control } from './demo/types'
import { SentinelLayout } from './sentinel-layout'
import { stopSpec, withParam } from './specs'
import { ActionDialog, ControlPill, WorkerLink, type ActionSpec } from './ui'

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

/**
 * Every restriction in one list: what it is, who it affects, who applied it, why and since when.
 * Filters live in the URL. A row opens the control's drawer with its history and actions.
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
  const state = get('state') === 'lifted' || get('state') === 'all' ? get('state')! : 'active'
  const worker = get('worker')
  const q = (get('q') ?? '').trim().toLowerCase()
  const rows = s.controls
    .filter((c) => (state === 'all' ? true : state === 'active' ? c.active : !c.active))
    .filter((c) => !kind || c.kind === kind)
    .filter((c) => !worker || c.workerIds.includes(worker))
    .filter((c) => !q || [c.title, c.reason, c.scope, ...c.workerIds.map(workerLabel)].some((x) => x.toLowerCase().includes(q)))
    .sort((a, b) => Number(b.active) - Number(a.active) || b.since.localeCompare(a.since))
  const filtering = Boolean(kind || worker || q || state !== 'active')

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
        <Select value={state} onValueChange={(v) => set('state', v === 'active' ? null : v)}>
          <SelectTrigger className="w-36" aria-label="State"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="active">In force</SelectItem><SelectItem value="lifted">Lifted</SelectItem><SelectItem value="all">In force and lifted</SelectItem></SelectContent>
        </Select>
        {worker && <Button variant="secondary" size="sm" onClick={() => set('worker', null)} aria-label={`Remove Worker filter: ${workerLabel(worker)}`}>{workerLabel(worker)} ×</Button>}
        {filtering && <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
        <Button variant="outline" className="sm:ml-auto" onClick={() => setPicking(true)}><OctagonX aria-hidden="true" />Stop a Worker…</Button>
      </div>

      <Panel id="controls" flush>
        {rows.length === 0 ? (
          <p className="px-5 py-4 text-body text-muted-foreground">{filtering ? 'No controls match these filters.' : 'No controls are in force.'}</p>
        ) : (
          <Paged key={[state, kind, worker, q].join('|')} rows={rows} label="Controls">{(page) => <div className="relative overflow-x-auto">
            <table className="w-full text-left text-body">
              <caption className="sr-only">Controls</caption>
              <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-medium">Control</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Worker</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Applied by</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Applied</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="px-2 py-2.5"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {page.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <ControlPill kind={c.kind} />
                      <Link to={withParam(params, 'control', c.id)} preventScrollReset className="mt-1 block rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{c.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-meta">{c.workerIds.length === 0 ? <span className="text-muted-foreground">{c.scope}</span> : c.workerIds.map((w, i) => <span key={w}>{i > 0 && ', '}<WorkerLink id={w} /></span>)}</td>
                    <td className="hidden px-4 py-3 text-meta md:table-cell">{controlSource(s, c)}</td>
                    <td className="hidden px-4 py-3 text-meta whitespace-nowrap text-muted-foreground lg:table-cell"><Timestamp iso={c.since} /></td>
                    <td className="px-4 py-3">{c.active ? <StatusBadge tone="warning">In force</StatusBadge> : <StatusBadge tone="neutral">Lifted</StatusBadge>}</td>
                    <td className="px-2 py-3"><Link to={withParam(params, 'control', c.id)} preventScrollReset aria-label={`Open ${c.title}`} className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="size-4" aria-hidden="true" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}</Paged>
        )}
      </Panel>

      <StopPicker open={picking} onClose={() => setPicking(false)} onPick={(id) => { setPicking(false); setSpec(stopSpec(s, id)) }} />
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </SentinelLayout>
  )
}
