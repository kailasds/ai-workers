import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PERIODS } from '@/lib/api/dashboard'
import type { ExecutiveDashboard } from '@/lib/types/dashboard'
import { ContextsPanel } from './contexts-panel'
import { CostPanel } from './cost-panel'
import { CriteriaPanel } from './criteria-panel'
import { RunsPanel, type RunsPanelProps } from './runs-panel'
import type { Measure, View } from './use-dashboard-params'

const TITLES: Record<View, string> = {
  criteria: 'Definition of Done criteria',
  cost: 'Model cost',
  contexts: 'Compare bounded contexts',
  runs: 'Runs',
}

interface Props extends Pick<RunsPanelProps, 'verdict' | 'context' | 'page' | 'onChange'> {
  data: ExecutiveDashboard
  detail: View | null
  measure: Measure
  detailLink: (view: string, extra?: Record<string, string>) => string
}

// DEEP DETAIL. The analysis that used to crowd the page opens on demand, deep-linkably
// (`?detail=`), so the first screen stays a brief.
export function DrillSheet({ data, detail, measure, detailLink, verdict, context, page, onChange }: Props) {
  const period = PERIODS.find((p) => p.value === data.window.key)!.long
  return (
    <Sheet open={detail !== null} onOpenChange={(open) => !open && onChange({ detail: null, verdict: null, context: null, page: null }, { resetPage: false })}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-3xl">
        {detail && (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-section">{TITLES[detail]}</SheetTitle>
              <SheetDescription>{period[0].toUpperCase() + period.slice(1)}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1">
              <div className="px-6 py-5">
                {detail === 'criteria' && <CriteriaPanel criteria={data.definition_of_done.criteria} />}
                {detail === 'cost' && <CostPanel data={data} measure={measure} onMeasure={(m) => onChange({ measure: m }, { resetPage: false })} />}
                {detail === 'contexts' && <ContextsPanel data={data} detailLink={detailLink} />}
                {detail === 'runs' && <RunsPanel data={data} verdict={verdict} context={context} measure={measure} page={page} onChange={onChange} />}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
