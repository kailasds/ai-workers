import { useState } from 'react'
import { BadgeCheck, Calculator, ClipboardCheck, Code, Eye, FileOutput, Gauge, ListOrdered, Scale, SearchX, ShieldCheck, Sparkles, Tags, Target, TriangleAlert, Wrench, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Paged } from '@/components/platform/section-pager'
import { IconTile, Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { TabBar } from '@/components/platform/tab-bar'
import type { DodRubric } from '@/lib/types/catalog'
import { DemoNote, FactGrid, LIBRARY_PAGE, LibraryRow, Mono, SearchBox, SheetHero, SheetSection } from './list-parts'

export const METHOD: Record<string, string> = {
  llm_judge: 'Judged by a model',
  harness_metric: 'Measured by the harness',
  code_skill: 'Decided by code',
  external_tool: 'Measured by an external tool',
}
const METHOD_ICON: Record<string, LucideIcon> = { llm_judge: Sparkles, harness_metric: Gauge, code_skill: Code, external_tool: Wrench }
const AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'Measurable',
  REQUIRES_TOOL: 'Needs a tool',
  NOT_IMPLEMENTED: 'Can’t be measured yet',
}

type View = 'gates' | 'tracked'

export function DodTab({ rubrics }: { rubrics: DodRubric[] }) {
  const blocked = (r: DodRubric) => r.availability !== 'AVAILABLE'
  // Open on the list that holds a criterion that can't be measured yet: it needs attention.
  const [view, setView] = useState<View>(() => (!rubrics.some((r) => r.gating_by_default && blocked(r)) && rubrics.some((r) => !r.gating_by_default && blocked(r)) ? 'tracked' : 'gates'))
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<DodRubric | null>(null)
  const needle = q.trim().toLowerCase()
  const found = rubrics.filter((r) => !needle || `${r.display_name} ${r.criterion_key} ${r.aliases.join(' ')}`.toLowerCase().includes(needle))
  const gating = found.filter((r) => r.gating_by_default)
  const observed = found.filter((r) => !r.gating_by_default)
  // A criterion that can't be measured yet needs attention, so it leads its list.
  const rows = [...(view === 'gates' ? gating : observed)].sort((a, b) => Number(blocked(b)) - Number(blocked(a)))

  return (
    <>
      <Panel id="dod" title="Definition of Done" icon={ClipboardCheck} hue="amber" count={found.length} flush aside={<SearchBox value={q} onChange={setQ} label="Search criteria" />}>
        <TabBar
          label="Release role"
          value={view}
          onChange={(v) => setView(v as View)}
          items={[
            { value: 'gates', label: 'Release gates', icon: ShieldCheck, count: gating.length, alert: gating.some(blocked) },
            { value: 'tracked', label: 'Tracked only', icon: Eye, count: observed.length, alert: observed.some(blocked) },
          ]}
        />
        {rows.length === 0 ? (
          <EmptyState className="m-5" icon={SearchX} title="Nothing matches that" action={<Button variant="outline" onClick={() => setQ('')}>Clear search</Button>} />
        ) : (
          <Paged key={[view, q].join('|')} rows={rows} label={view === 'gates' ? 'Release gates' : 'Tracked only'} size={LIBRARY_PAGE}>{(page) => (
            <ul className="divide-y">
              {page.map((r) => (
                <LibraryRow
                  key={r.criterion_key}
                  icon={<IconTile icon={METHOD_ICON[r.method] ?? Gauge} hue={r.gating_by_default ? 'amber' : 'blue'} size="sm" />}
                  label={`Open ${r.display_name}`}
                  onOpen={() => setOpen(r)}
                  title={r.display_name}
                  aside={blocked(r) ? <span className="inline-flex items-center gap-1.5 text-warning" title={AVAILABILITY[r.availability] ?? r.availability}><TriangleAlert className="size-4" aria-hidden="true" /><span className="sr-only">{AVAILABILITY[r.availability] ?? r.availability}</span></span> : undefined}
                />
              ))}
            </ul>
          )}</Paged>
        )}
      </Panel>

      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.display_name} description={open ? METHOD[open.method] ?? open.method : undefined} width="2xl">
        {open && (
          <>
            <SheetHero
              icon={METHOD_ICON[open.method] ?? Gauge}
              hue={open.gating_by_default ? 'amber' : 'blue'}
              text={open.computation?.summary || open.calculation || METHOD[open.method] || open.method}
              badges={
                <>
                  <StatusBadge tone={open.gating_by_default ? 'warning' : 'neutral'} icon={null}>{open.gating_by_default ? 'Release gate' : 'Tracked only'}</StatusBadge>
                  <StatusBadge tone={open.availability === 'AVAILABLE' ? 'success' : 'warning'}>{AVAILABILITY[open.availability] ?? open.availability}</StatusBadge>
                </>
              }
            />
            <FactGrid
              facts={[
                { icon: Target, label: 'Passes at', value: open.default_threshold?.trim() || 'No required threshold' },
                { icon: Scale, label: 'Decided by', value: METHOD[open.method] ?? open.method },
                { icon: FileOutput, label: 'Reported as', value: <Mono>{open.criterion_key}</Mono> },
                ...(open.skill_ref ? [{ icon: BadgeCheck, label: 'Measured by', value: <Mono>{open.skill_ref}</Mono> }] : []),
              ]}
            />
            {open.computation && open.computation.steps.length > 0 && (
              <SheetSection icon={ListOrdered} title="How it’s calculated">
                <ol className="flex flex-col gap-3">
                  {open.computation.steps.map((s, i) => (
                    <li key={s} className="flex items-start gap-3 text-body">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-chip-neutral text-meta font-medium tabular-nums">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </SheetSection>
            )}
            {open.computation?.rule && (
              <SheetSection icon={Calculator} title="Pass criteria">
                <p className="text-body">{open.computation.rule}</p>
              </SheetSection>
            )}
            {open.aliases.length > 0 && (
              <SheetSection icon={Tags} title="Also called">
                <div className="flex flex-wrap gap-2">{open.aliases.map((a) => <span key={a} className="rounded-full bg-chip-neutral px-2.5 py-0.5 text-meta">{a}</span>)}</div>
              </SheetSection>
            )}
            {open.availability !== 'AVAILABLE' && open.availability_detail && (
              <SheetSection icon={TriangleAlert} title="Why it can’t be measured yet">
                <p className="text-body">{open.availability_detail}</p>
              </SheetSection>
            )}
            {open.computation?.summary && open.calculation && <DemoNote>{open.calculation}</DemoNote>}
          </>
        )}
      </DetailSheet>
    </>
  )
}
