import { BookOpen, ClipboardCheck, Languages, ListChecks, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HUE, type Hue } from '@/components/platform/hue'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { cn } from '@/lib/utils'
import type { Composition } from './use-composition'

interface Item {
  key: string
  title: string
  meta?: React.ReactNode
}

function Part({ title, icon: Icon, hue, items }: { title: string; icon: LucideIcon; hue: Hue; items: Item[] }) {
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4', HUE[hue].soft, HUE[hue].text)}><Icon /></span>
        <h2 className="min-w-0 flex-1 text-section">{title}</h2>
        <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-body text-muted-foreground">None</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-3 rounded-block bg-muted px-3 py-2.5">
              <span className="min-w-0 truncate text-body" title={i.title}>{i.title}</span>
              {i.meta && <span className="shrink-0 text-meta text-muted-foreground">{i.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** What this Worker was given from the Knowledge library, read the way Compose assembles it. */
export function KnowledgeTab({ comp }: { comp: Composition }) {
  const { draft, catalogs, proposal } = comp
  if (draft.error) return <ErrorState title="The composition record could not be read." message={draft.error.message} onRetry={draft.refresh} retrying={draft.pending} />
  if (catalogs.error) return <ErrorState title="The catalogues could not be read." message={catalogs.error.message} onRetry={catalogs.refresh} retrying={catalogs.pending} />
  if (!proposal)
    return (
      <LoadingRegion label="Reading what this Worker knows…" className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl bg-track" />)}
      </LoadingRegion>
    )
  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <Part title="Skills" icon={BookOpen} hue="blue" items={proposal.skills.map((s) => ({ key: s.name, title: s.title, meta: `v${s.version}` }))} />
      <Part title="Domain languages" icon={Languages} hue="cyan" items={proposal.languages.map((l) => ({ key: l.domain_id, title: l.name, meta: `v${l.version}` }))} />
      <Part title="EVAL Playbooks" icon={ClipboardCheck} hue="amber" items={proposal.evals.map((e) => ({ key: e.id, title: e.name, meta: e.hard_gate ? 'Hard gate' : undefined }))} />
      <Part title="Definition of Done" icon={ListChecks} hue="violet" items={proposal.rubrics.map((r) => ({ key: r.criterion_key, title: r.display_name, meta: r.gating_by_default ? 'Gating' : 'Advisory' }))} />
    </div>
  )
}
