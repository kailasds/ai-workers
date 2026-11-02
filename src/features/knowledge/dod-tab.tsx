import { useState } from 'react'
import { Code, Eye, Gauge, ShieldCheck, Sparkles, Wrench, type LucideIcon } from 'lucide-react'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Details, IconTile, Panel } from '@/components/platform/panel'
import { StatusBadge } from '@/components/platform/status-badge'
import type { DodRubric } from '@/lib/types/catalog'
import { LibraryRow } from './list-parts'

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

export function DodTab({ rubrics }: { rubrics: DodRubric[] }) {
  const [open, setOpen] = useState<DodRubric | null>(null)
  const gating = rubrics.filter((r) => r.gating_by_default)
  const observed = rubrics.filter((r) => !r.gating_by_default)

  const row = (r: DodRubric) => (
    <LibraryRow
      key={r.criterion_key}
      icon={<IconTile icon={METHOD_ICON[r.method] ?? Gauge} hue={r.gating_by_default ? 'amber' : 'blue'} />}
      label={`Open ${r.display_name}`}
      onOpen={() => setOpen(r)}
      title={r.display_name}
      meta={`${METHOD[r.method] ?? r.method}${r.default_threshold ? ` · passes at ${r.default_threshold}` : ' · no required threshold'}`}
      aside={r.availability !== 'AVAILABLE' ? <StatusBadge tone="warning">{AVAILABILITY[r.availability] ?? r.availability}</StatusBadge> : undefined}
    />
  )

  return (
    <>
      <div className="flex flex-col gap-6">
        <Panel id="gates" title="Release gates" icon={ShieldCheck} hue="amber" count={gating.length} flush>
          <ul className="divide-y">{gating.map(row)}</ul>
        </Panel>
        <Panel id="tracked" title="Tracked only" icon={Eye} hue="blue" count={observed.length} flush>
          <ul className="divide-y">{observed.map(row)}</ul>
        </Panel>
      </div>
      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.display_name} description={open ? METHOD[open.method] ?? open.method : undefined} width="2xl">
        {open && (
          <div className="flex flex-col gap-6">
            {open.computation?.summary && <p className="text-body">{open.computation.summary}</p>}
            <div className="border-t pt-6">
              <Details
                rows={[
                  { label: 'Passes at', value: open.default_threshold ?? 'No required threshold' },
                  { label: 'Release', value: open.gating_by_default ? 'Release gate' : 'Tracked only' },
                  { label: 'Measurable', value: AVAILABILITY[open.availability] ?? open.availability },
                  { label: 'Reported as', value: <span className="font-mono text-meta break-all">{open.criterion_key}</span> },
                  ...(open.skill_ref ? [{ label: 'Measured by', value: <span className="font-mono text-meta break-all">{open.skill_ref}</span> }] : []),
                  ...(open.aliases.length > 0 ? [{ label: 'Also called', value: open.aliases.join(', ') }] : []),
                ]}
              />
            </div>
            {open.computation && open.computation.steps.length > 0 && (
              <section>
                <h3 className="text-item">How it’s calculated</h3>
                <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-body">{open.computation.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              </section>
            )}
            {open.computation?.rule && (
              <section>
                <h3 className="text-item">Pass criteria</h3>
                <p className="mt-1 text-body">{open.computation.rule}</p>
              </section>
            )}
            {open.calculation && <p className="rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground">{open.calculation}</p>}
          </div>
        )}
      </DetailSheet>
    </>
  )
}
