import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { DetailSheet } from '@/components/platform/detail-sheet'
import { Fact, FactList } from '@/components/platform/fact-list'
import { StatusBadge } from '@/components/platform/status-badge'
import type { DodRubric } from '@/lib/types/catalog'
import { GroupHeader, LibraryRow } from './list-parts'

export const METHOD: Record<string, string> = {
  llm_judge: 'Judged by a model',
  harness_metric: 'Measured by the harness',
  code_skill: 'Decided by code',
  external_tool: 'Measured by an external tool',
}
const AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'Measurable',
  REQUIRES_TOOL: 'Needs a tool',
  NOT_IMPLEMENTED: 'Nothing can measure this yet',
}

export function DodTab({ rubrics }: { rubrics: DodRubric[] }) {
  const [open, setOpen] = useState<DodRubric | null>(null)
  const gating = rubrics.filter((r) => r.gating_by_default)
  const observed = rubrics.filter((r) => !r.gating_by_default)

  const row = (r: DodRubric) => (
    <LibraryRow
      key={r.criterion_key}
      label={`Open ${r.display_name}`}
      onOpen={() => setOpen(r)}
      title={r.display_name}
      meta={`${METHOD[r.method] ?? r.method}${r.default_threshold ? ` · passes at ${r.default_threshold}` : ' · no required threshold'}`}
      aside={r.availability !== 'AVAILABLE' ? <StatusBadge tone="warning">{AVAILABILITY[r.availability] ?? r.availability}</StatusBadge> : undefined}
    />
  )

  return (
    <>
      <p className="mb-4 text-meta text-muted-foreground">What a Worker has to prove before its work counts as done. A narrower scope may tighten a gate, never loosen one. Not measured is not the same as failed.</p>
      <Card className="gap-0 overflow-hidden py-0">
        <section aria-label="Release gates">
          <GroupHeader label="Release gates · stop a release" count={gating.length} />
          <ul className="divide-y">{gating.map(row)}</ul>
        </section>
        <section aria-label="Observed, not gating">
          <GroupHeader label="Observed, not gating" count={observed.length} />
          <ul className="divide-y">{observed.map(row)}</ul>
        </section>
      </Card>
      <DetailSheet open={open !== null} onClose={() => setOpen(null)} title={open?.display_name} description={open ? METHOD[open.method] ?? open.method : undefined} width="2xl">
        {open && (
          <div className="flex flex-col gap-6">
            {open.computation?.summary && <p className="text-body">{open.computation.summary}</p>}
            <FactList>
              <Fact label="Reported as"><span className="font-mono text-meta">{open.criterion_key}</span></Fact>
              <Fact label="Passes at">{open.default_threshold ?? 'No required threshold'}</Fact>
              <Fact label="Release">{open.gating_by_default ? 'Release gate: stops a release' : 'Observed, not gating'}</Fact>
              <Fact label="Can it be measured">{AVAILABILITY[open.availability] ?? open.availability}{open.availability_detail ? <span className="block text-meta text-muted-foreground">{open.availability_detail}</span> : null}</Fact>
              {open.skill_ref && <Fact label="Measured by"><span className="font-mono text-meta break-all">{open.skill_ref}</span></Fact>}
              {open.aliases.length > 0 && <Fact label="Also called">{open.aliases.join(', ')}</Fact>}
            </FactList>
            {open.computation && open.computation.steps.length > 0 && (
              <section>
                <h3 className="text-item">How the number is produced</h3>
                <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-body">{open.computation.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              </section>
            )}
            {open.computation?.rule && (
              <section>
                <h3 className="text-item">What makes it pass</h3>
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
