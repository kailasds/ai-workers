import { Ban, Check } from 'lucide-react'
import { Fact, FactList } from '@/components/platform/fact-list'
import { StatusBadge } from '@/components/platform/status-badge'
import type { Draft } from '@/lib/api/compose'
import { domainOf, widerContexts, type CheckpointKey } from './compose-model'
import type { Proposal } from './proposal'

function Items({ items }: { items: { key: string; title: string; detail?: React.ReactNode; meta?: React.ReactNode }[] }) {
  if (items.length === 0) return <p className="text-body text-muted-foreground">Nothing was selected for this part.</p>
  return (
    <ul className="divide-y rounded-xl border">
      {items.map((i) => (
        <li key={i.key} className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="min-w-0">
            <span className="block text-item">{i.title}</span>
            {i.detail && <span className="mt-0.5 line-clamp-2 block text-meta text-muted-foreground">{i.detail}</span>}
          </span>
          {i.meta && <span className="shrink-0">{i.meta}</span>}
        </li>
      ))}
    </ul>
  )
}

/** What a checkpoint proposes. Confirming it is what writes it into the Worker. */
export function CheckpointBody({ k, draft, p }: { k: CheckpointKey; draft: Draft; p: Proposal }) {
  switch (k) {
    case 'bounded_context': {
      const wider = widerContexts(draft.context_key)
      return (
        <div className="flex flex-col gap-5">
          <FactList>
            <Fact label="Bounded context">{p.context?.label}</Fact>
            <Fact label="Business domain">{domainOf(draft.business_domain_key)?.label ?? <span className="text-muted-foreground">None</span>}</Fact>
            <Fact label="Procedure">{p.procedure.length ? `${p.procedure.map((s) => s.title).join(' → ')} · ${p.procedure.length} stages` : 'Set by the harness'}</Fact>
            <Fact label="Growth">{draft.growth_ceiling ? `May grow up to ${wider.find((w) => w.key === draft.growth_ceiling)?.label}` : 'Keeps this bounded context'}</Fact>
          </FactList>
          <div className="grid gap-5 md:grid-cols-2">
            <section>
              <h3 className="text-overline text-muted-foreground uppercase">Includes</h3>
              <p className="mt-2 flex gap-2 text-body"><Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{p.context?.includes}</p>
            </section>
            <section>
              <h3 className="text-overline text-muted-foreground uppercase">Refuses</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {draft.identity.scope_excludes.map((x) => (
                  <li key={x} className="flex gap-2 text-body"><Ban className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{x}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )
    }
    case 'worker_intent':
      return (
        <div className="flex flex-col gap-5">
          <p className="text-[0.9375rem] leading-relaxed">{p.context?.outcome}</p>
          <FactList>
            <Fact label="Harness">{p.harness?.display_name ?? 'Generic runtime'}</Fact>
            <Fact label="Model routing">{p.models.routing}</Fact>
            <Fact label="Maker model">{p.models.maker}</Fact>
            <Fact label="Verifier model">{p.models.verifier} <span className="text-meta text-muted-foreground">· independent of the maker</span></Fact>
          </FactList>
          {p.procedure.length > 0 && (
            <ol className="flex flex-col gap-2">
              {p.procedure.map((s, i) => (
                <li key={s.key} className="flex gap-3 rounded-xl border px-4 py-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-meta tabular-nums">{i + 1}</span>
                  <span><span className="block text-item">{s.title}</span><span className="block text-meta text-muted-foreground">{s.adds}</span></span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )
    case 'skills':
      return <Items items={p.skills.map((s) => ({ key: s.name, title: s.title, detail: s.description, meta: <span className="text-meta text-muted-foreground tabular-nums">{s.worker_count} Workers</span> }))} />
    case 'domain_language':
      return <Items items={p.languages.map((l) => ({ key: l.domain_id, title: l.name, detail: `${l.path}. Bound because the work answers to this area.`, meta: l.plugin_slug ? null : <StatusBadge tone="neutral" icon={null}>Not yet available</StatusBadge> }))} />
    case 'evals':
      return <Items items={p.evals.map((e) => ({ key: e.id, title: e.name, detail: e.description?.split('. ')[0], meta: <StatusBadge tone="neutral" icon={null}>{e.hard_gate ? 'Required gate' : 'Measured check'}</StatusBadge> }))} />
    case 'gbrain':
      return (
        <FactList>
          <Fact label="Memory engine">{p.memory.engine}</Fact>
          <Fact label="Durability">{p.memory.durability}</Fact>
          <Fact label="Memory types">{p.memory.types.join(' · ')}</Fact>
          <Fact label="Before it compounds">{p.memory.minimumObservations} agreeing runs{p.memory.requiresDodMet ? ' that met the Definition of Done' : ''}</Fact>
          <Fact label="Shared Skills">Never written by a Worker. It records proposals only.</Fact>
        </FactList>
      )
    case 'definition_of_done': {
      const gating = p.rubrics.filter((r) => r.gating_by_default).length
      return (
        <div className="flex flex-col gap-3">
          <p className="text-meta text-muted-foreground">{gating} stop a release · {p.rubrics.length - gating} observed · evidence retained per run</p>
          <Items
            items={p.rubrics.map((r) => ({
              key: r.criterion_key,
              title: r.display_name,
              detail: r.availability === 'AVAILABLE' ? (r.default_threshold ? `Passes at ${r.default_threshold}` : 'No required threshold') : (r.availability_detail ?? 'Nothing here can measure this yet.'),
              meta: <StatusBadge tone={r.availability === 'AVAILABLE' ? 'neutral' : 'warning'} icon={null}>{r.availability !== 'AVAILABLE' ? 'Not measurable yet' : r.gating_by_default ? 'Stops a release' : 'Observed'}</StatusBadge>,
            }))}
          />
        </div>
      )
    }
    case 'autonomy':
      return (
        <FactList>
          <Fact label="Operating mode">{p.autonomy.mode}</Fact>
          <Fact label="Autonomy level">Level {p.autonomy.level} <span className="text-meta text-muted-foreground">· each level widens what it may do without being asked</span></Fact>
          <Fact label="Worker Sentinel">{p.autonomy.sentinel}</Fact>
          <Fact label="Spending limit">Set at deployment, never here</Fact>
        </FactList>
      )
  }
}
