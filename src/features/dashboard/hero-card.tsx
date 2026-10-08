import { Link } from 'react-router'
import { Bar, BarChart, XAxis } from 'recharts'
import { ArrowRight, CalendarSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { MeasuredValue } from '@/components/platform/measured-value'
import { EmptyState } from '@/components/platform/states'
import { VerdictBar, VerdictLegend } from '@/components/platform/verdict-meter'
import { PERIODS } from '@/lib/api/dashboard'
import { formatCount, formatDurationShort, formatUsd, isObserved } from '@/lib/format'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'

const chartConfig = {
  met: { label: 'Met', color: 'var(--success)' },
  not_met: { label: 'Not met', color: 'var(--destructive)' },
  not_adjudicable: { label: 'Awaiting evidence', color: 'var(--muted-foreground)' },
} satisfies ChartConfig

// A quiet trend: no grid, no y-axis. The exact figures live in the tooltip and the Runs sheet.
function Trend({ data }: { data: ExecutiveDashboard }) {
  const unit = data.window.bucket === 'all' ? 'month' : data.window.bucket
  return (
    <figure className="flex flex-col gap-2">
      <ChartContainer config={chartConfig} className="aspect-auto h-20 w-full border-b border-border sm:h-28">
        <BarChart data={data.outcome_series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} accessibilityLayer barCategoryGap="18%">
          <XAxis dataKey="label" hide />
          <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent indicator="dot" />} />
          <Bar isAnimationActive={false} dataKey="met" stackId="r" fill="var(--color-met)" />
          <Bar isAnimationActive={false} dataKey="not_met" stackId="r" fill="var(--color-not_met)" />
          <Bar isAnimationActive={false} dataKey="not_adjudicable" stackId="r" fill="var(--color-not_adjudicable)" fillOpacity={0.45} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <figcaption className="flex justify-between text-meta text-muted-foreground">
        <span>{data.outcome_series[0]?.label}</span>
        <span>Completed runs per {unit}</span>
        <span>{data.outcome_series.at(-1)?.label}</span>
      </figcaption>
    </figure>
  )
}

function Figure({ label, children, caption, to }: { label: string; children: React.ReactNode; caption: React.ReactNode; to?: string }) {
  // Phones: one compact row (label and caption left, value right). From `sm`: stacked figure.
  const body = (
    <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 sm:block">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className="row-span-2 text-lg font-semibold tracking-tight tabular-nums sm:mt-1 sm:text-xl">{children}</dd>
      <dd className="text-meta text-muted-foreground sm:mt-0.5">{caption}</dd>
    </dl>
  )
  const pad = 'block px-5 py-3.5 sm:px-6 sm:py-5'
  return to ? (
    <Link to={to} className={`${pad} outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`}>
      {body}
    </Link>
  ) : (
    <div className={pad}>{body}</div>
  )
}

// PRIMARY. One answer, read in seconds: did the Workers deliver? Everything else on the card
// is quieter than that sentence.
export function HeroCard({ data, onChoosePeriod, detailLink }: { data: ExecutiveDashboard; onChoosePeriod: () => void; detailLink: (view: string, extra?: Record<string, string>) => string }) {
  const { headlines, definition_of_done: dod, run_economics: econ } = data
  const completed = headlines.completed_runs.value ?? 0
  const period = PERIODS.find((p) => p.value === data.window.key)!
  const counts = { MET: dod.met, NOT_MET: dod.not_met, NOT_ADJUDICABLE: dod.not_adjudicable }

  return (
    <Card role="region" aria-labelledby="hero-title" className="gap-0 py-0">
      {completed === 0 ? (
        <div className="p-6">
          <h2 id="hero-title" className="sr-only">Outcomes</h2>
          <EmptyState
            icon={CalendarSearch}
            title="No completed runs in this period"
            description="Nothing finished in the window shown, so there is nothing to judge yet."
            action={data.window.key !== 'all' ? <Button variant="outline" onClick={onChoosePeriod}>Show all time</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-12">
          <div className="min-w-0">
            <p className="text-overline text-muted-foreground uppercase">{period.long}</p>
            <h2 id="hero-title" className="mt-3 text-balance">
              <span className="text-5xl leading-none font-semibold tracking-tight tabular-nums">{formatCount(dod.met)}</span>
              <span className="text-2xl font-medium tracking-tight text-muted-foreground tabular-nums"> of {formatCount(completed)}</span>
              <span className="mt-2 block text-lg font-normal text-muted-foreground">runs met their Definition of Done</span>
            </h2>
            <VerdictBar counts={counts} className="mt-6 h-2.5" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <VerdictLegend counts={counts} />
              <Link to={detailLink('criteria')} className="inline-flex items-center gap-1 rounded-sm text-meta font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                Criteria
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <Trend data={data} />
        </div>
      )}

      <div className="grid border-t sm:grid-cols-3 sm:divide-x max-sm:divide-y">
        <Figure label="Serving now" caption="Workers answering · snapshot" to="/workers?runtime=serving">
          <MeasuredValue metric={headlines.active_workers} format={formatCount} empty="Not reported" />
        </Figure>
        <Figure label="Reported model cost" caption={isObserved(econ.total_cost) ? `${econ.cost_coverage.measured_runs} of ${econ.completed_runs} runs reported · not a bill` : 'No run reported it'} to={detailLink('cost')}>
          <MeasuredValue metric={econ.total_cost} format={formatUsd} />
        </Figure>
        <Figure label="Average run" caption={isObserved(headlines.average_run_duration) ? `over ${headlines.average_run_duration.samples} measured runs` : 'No run measured it'}>
          <MeasuredValue metric={headlines.average_run_duration} format={formatDurationShort} />
        </Figure>
      </div>
    </Card>
  )
}
