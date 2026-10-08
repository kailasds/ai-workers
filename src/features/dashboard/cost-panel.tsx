import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChevronDown, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { EmptyState } from '@/components/platform/states'
import { formatCount, formatTokens, formatUsd, isObserved } from '@/lib/format'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'
import type { Measure } from './use-dashboard-params'

interface SpendBucket {
  label: string
  runs: number
  measured: number
  value: number | undefined
}

// Built from the same ledger rows as the Runs table, so the two cannot disagree. A bucket where
// runs finished but none reported spend has NO bar (unknown), not a zero bar.
function bucketSpend(data: ExecutiveDashboard, measure: Measure): SpendBucket[] {
  return data.outcome_series.map((bucket) => {
    const from = Date.parse(bucket.start_at)
    const to = Date.parse(bucket.end_at)
    const rows = data.run_ledger.rows.filter((r) => {
      const t = Date.parse(r.completed_at)
      return t >= from && t < to
    })
    const measured = rows.filter((r) => (measure === 'cost' ? r.model_cost_usd.state : r.total_tokens.state) === 'OBSERVED')
    const value = measured.reduce((sum, r) => sum + (measure === 'cost' ? Number(r.model_cost_usd.value) : (r.total_tokens.value ?? 0)), 0)
    return { label: bucket.label, runs: rows.length, measured: measured.length, value: measured.length ? value : undefined }
  })
}

const chartConfig = { value: { label: 'Reported spend', color: 'var(--chart-teal)' } } satisfies ChartConfig

export function CostPanel({ data, measure, onMeasure }: { data: ExecutiveDashboard; measure: Measure; onMeasure: (m: Measure) => void }) {
  const [tableOpen, setTableOpen] = useState(false)
  const econ = data.run_economics
  const buckets = useMemo(() => bucketSpend(data, measure), [data, measure])
  const fmt = measure === 'cost' ? formatUsd : formatTokens
  const total = measure === 'cost' ? econ.total_cost : econ.total_tokens
  const perRun = measure === 'cost' ? econ.model_cost_per_run : econ.tokens_per_run
  const coverage = measure === 'cost' ? econ.cost_coverage : econ.token_coverage
  const unit = measure === 'cost' ? 'cost' : 'tokens'
  const routing = data.model_routing.models

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-meta text-muted-foreground">Reported model cost is what the runs reported, not a bill.</p>
        <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={measure} onValueChange={(v) => v && onMeasure(v as Measure)} aria-label="Measure">
          <ToggleGroupItem value="cost">Cost</ToggleGroupItem>
          <ToggleGroupItem value="tokens">Tokens</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {!isObserved(total) ? (
        <EmptyState className="mt-4" icon={Coins} title={`No run in this period reported its ${unit}`} description="A Worker that could not read its usage says so. Nothing is shown as zero." />
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{fmt(total.value)}</p>
            <p className="text-sm text-muted-foreground">
              reported by <span className="font-medium text-foreground tabular-nums">{coverage.measured_runs} of {coverage.completed_runs}</span> runs
            </p>
          </div>
          {isObserved(perRun) && (
            <p className="mt-1 text-meta text-muted-foreground">
              Average <span className="font-medium text-foreground tabular-nums">{fmt(perRun.value)}</span> per reporting run: the {formatCount(perRun.samples ?? 0)} that measured it, not all {formatCount(econ.completed_runs)}.
            </p>
          )}

          <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-40 w-full justify-start">
            <BarChart data={buckets} margin={{ top: 4, right: 0, left: -4, bottom: 0 }} accessibilityLayer barCategoryGap="22%">
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={22} />
              <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => (measure === 'cost' ? `$${v}` : formatTokens(v))} />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)' }}
                content={<ChartTooltipContent hideLabel={false} formatter={(v, _n, item) => (
                  <span className="flex w-full items-baseline justify-between gap-4">
                    <span className="text-muted-foreground">{(item.payload as SpendBucket).measured} of {(item.payload as SpendBucket).runs} runs reported</span>
                    <span className="font-medium tabular-nums">{fmt(Number(v))}</span>
                  </span>
                )} />}
              />
              <Bar isAnimationActive={false} dataKey="value" fill="var(--color-value)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>

          <Collapsible open={tableOpen} onOpenChange={setTableOpen} className="mt-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-2.5">
                {tableOpen ? 'Hide data' : 'View data'}
                <ChevronDown className={tableOpen ? 'rotate-180' : undefined} aria-hidden="true" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <table className="mt-2 w-full text-sm">
                <caption className="sr-only">Reported {unit} by period</caption>
                <thead>
                  <tr className="border-b text-left text-meta text-muted-foreground">
                    <th scope="col" className="py-2 font-medium">Period</th>
                    <th scope="col" className="py-2 text-right font-medium">{measure === 'cost' ? 'Model cost' : 'Tokens'}</th>
                    <th scope="col" className="py-2 text-right font-medium">Runs</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {buckets.filter((b) => b.runs > 0).map((b) => (
                    <tr key={b.label}>
                      <th scope="row" className="py-2 text-left font-normal">{b.label}</th>
                      <td className="py-2 text-right tabular-nums">{b.value === undefined ? <span className="text-muted-foreground">Not measured</span> : fmt(b.value)}</td>
                      <td className="py-2 text-right text-meta text-muted-foreground tabular-nums">{b.measured} reported · {b.runs - b.measured} not measured</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1 text-meta text-muted-foreground">Periods in which no run finished are left out.</p>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {routing.length > 0 && (
        <p className="mt-3 border-t pt-3 text-meta text-muted-foreground">
          {routing.map((m) => `${m.model} was selected ${formatCount(m.selections)} times across ${m.stages.length} stages`).join('; ')}
          {data.model_routing.state === 'SELECTIONS_ONLY' && '. Selections only: token usage is not attributed per model.'}
        </p>
      )}
    </div>
  )
}
