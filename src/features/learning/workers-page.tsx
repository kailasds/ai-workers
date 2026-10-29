import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Pager } from '@/components/platform/pager'
import { ErrorState, LoadingRegion } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { contextOf } from '@/features/compose/compose-model'
import { PAGE_SIZES, usePaged } from '@/hooks/use-paged'
import { formatCount } from '@/lib/format'
import { LearningLayout, WorkerName } from './learning-layout'
import { useLearning } from './use-learning'

const SHOW = [
  { value: 'learning', label: 'With learning activity' },
  { value: 'review', label: 'Awaiting review' },
  { value: 'all', label: 'All Workers' },
]
const SORT = [
  { value: 'recent', label: 'Most recent activity' },
  { value: 'review', label: 'Most awaiting review' },
  { value: 'memory', label: 'Most memory records' },
]

interface Row {
  id: string
  name: string
  context: string
  runs: number | null
  met: number | null
  memories: number
  review: number | null
  held: number
  last: string | null
}

/**
 * One row per Worker and its learning: what it gained, what awaits a person, when it last
 * learned. A Worker's full learning opens on its own page. Figures come from the portfolio,
 * the compositions and the brain reads; a figure the source doesn't give is "–", never 0.
 */
export function LearningWorkersPage() {
  const l = useLearning()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const show = SHOW.find((x) => x.value === params.get('show'))?.value ?? 'learning'
  const sort = SORT.find((x) => x.value === params.get('sort'))?.value ?? 'recent'
  const set = (k: string, v: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (!v) n.delete(k)
      else n.set(k, v)
      n.delete('page')
      return n
    }, { replace: true, preventScrollReset: true })

  const all: Row[] = useMemo(() => {
    const comp = new Map((l.compositions ?? []).map((c) => [c.composition_id, c]))
    return l.workers.map((w) => {
      const c = comp.get(w.composition_id)
      return {
        id: w.composition_id,
        name: w.name,
        context: contextOf(w.bounded_context.key)?.scope ?? w.bounded_context.label,
        runs: c ? c.maturity.runs : null,
        met: c ? c.maturity.runs_met : null,
        memories: w.learning.memories,
        review: c ? c.maturity.skill_changes : null,
        held: l.held.filter((h) => h.worker?.id === w.composition_id).length,
        last: w.learning.last_at ?? c?.maturity.last_run_at ?? null,
      }
    })
  }, [l.workers, l.compositions, l.held])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = all.filter((r) => {
      if (show === 'learning' && r.memories === 0 && r.held === 0 && !r.review) return false
      if (show === 'review' && !r.review) return false
      return !needle || [r.name, r.id, r.context].some((f) => f.toLowerCase().includes(needle))
    })
    const by = (r: Row) => (sort === 'review' ? r.review ?? -1 : sort === 'memory' ? r.memories : 0)
    return filtered.sort((a, b) => by(b) - by(a) || (b.last ?? '').localeCompare(a.last ?? '') || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  }, [all, q, show, sort])
  const paged = usePaged(rows)
  const counts = { learning: all.filter((r) => r.memories || r.held || r.review).length, review: all.filter((r) => r.review).length, all: all.length }

  return (
    <LearningLayout view="workers" source={l.ready ? l.source : undefined} onRetry={l.refresh}>
      {l.error ? (
        <ErrorState title="Workers couldn’t be loaded." message={l.error.message} onRetry={l.refresh} />
      ) : !l.ready || (!l.compositions && !l.compositionsFailed) ? (
        <LoadingRegion label="Loading Workers…" className="flex flex-col gap-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12 bg-track" />)}</LoadingRegion>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Find Workers">
            <InputGroup className="w-full sm:w-72">
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
              <InputGroupInput type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search Workers" aria-label="Search by name, ID or capability" />
            </InputGroup>
            <Select value={show} onValueChange={(v) => set('show', v === 'learning' ? null : v)}>
              <SelectTrigger className="w-56" aria-label="Show"><SelectValue /></SelectTrigger>
              <SelectContent>{SHOW.map((x) => <SelectItem key={x.value} value={x.value}>{x.label} <span className="text-muted-foreground tabular-nums">{counts[x.value as keyof typeof counts]}</span></SelectItem>)}</SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => set('sort', v === 'recent' ? null : v)}>
              <SelectTrigger className="w-52" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent>{SORT.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-block border border-dashed px-5 py-4 text-body text-muted-foreground">{q ? 'No Workers match this search.' : show === 'review' ? 'No Worker has proposals awaiting review.' : 'No Worker has learning activity yet.'}</p>
          ) : (
            <>
              <Card className="gap-0 overflow-x-auto py-0">
                <table className="w-full text-left">
                  <caption className="sr-only">Workers and their learning</caption>
                  <thead className="border-b bg-muted/40 text-meta text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-2.5 font-medium">Worker</th>
                      <th scope="col" className="hidden px-5 py-2.5 text-right font-medium md:table-cell">Runs met</th>
                      <th scope="col" className="px-5 py-2.5 text-right font-medium">Memory</th>
                      <th scope="col" className="hidden px-5 py-2.5 text-right font-medium sm:table-cell">Collecting evidence</th>
                      <th scope="col" className="px-5 py-2.5 font-medium">Awaiting review</th>
                      <th scope="col" className="hidden px-5 py-2.5 font-medium lg:table-cell">Last activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-body">
                    {paged.rows.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <Link to={`/learning/workers/${r.id}`} className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                            <WorkerName worker={l.refs.get(r.id) ?? null} link={false} />
                          </Link>
                          <span className="block text-meta text-muted-foreground">{r.context}</span>
                        </td>
                        <td className="hidden px-5 py-3 text-right tabular-nums md:table-cell">{r.runs === null ? '–' : `${formatCount(r.met ?? 0)} of ${formatCount(r.runs)}`}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatCount(r.memories)}</td>
                        <td className="hidden px-5 py-3 text-right tabular-nums sm:table-cell">{r.held ? formatCount(r.held) : <span className="text-muted-foreground">–</span>}</td>
                        <td className="px-5 py-3">{r.review === null ? <span className="text-muted-foreground">Not reported</span> : r.review > 0 ? <StatusBadge tone="warning">{r.review}<span className="max-sm:sr-only"> Skill {r.review === 1 ? 'change' : 'changes'}</span></StatusBadge> : <span className="text-muted-foreground">None</span>}</td>
                        <td className="hidden px-5 py-3 text-meta lg:table-cell"><Timestamp iso={r.last} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Pager page={paged.page} pageSize={paged.size} total={paged.total} onPage={paged.setPage} pageSizes={PAGE_SIZES} onPageSize={paged.setSize} label="Workers" />
              <p className="text-meta text-muted-foreground">“Collecting evidence” is read from {formatCount(l.brainsRead)} of {formatCount(l.workers.length)} Workers’ brains; “–” means not read.</p>
            </>
          )}
        </>
      )}
    </LearningLayout>
  )
}
