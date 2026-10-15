import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Shared tab treatments (design.md §8). Tabs are padded 16px left/right; line tabs 4px and pills
// 6px top/bottom. The lists override the primitive's fixed 32px height so the padding shows.
// Line tabs: navy text and a 3px navy bar.
// Pills: a white track, the selected item filled navy. A count is a chip that stays readable on
// both: grey-blue with ink figures, inverting with the selected tab.
export const LINE_TABS_LIST = 'h-auto group-data-horizontal/tabs:h-auto w-full justify-start gap-1 border-b pb-1'
export const LINE_TAB = 'h-auto flex-none px-4 py-1 text-[0.9375rem] data-active:[&>.tab-count]:bg-primary data-active:[&>.tab-count]:text-primary-foreground'
export const PILL_TABS_LIST = 'h-auto group-data-horizontal/tabs:h-auto gap-1 rounded-lg bg-card p-1 ring-1 ring-border'
export const PILL_TAB = 'h-auto flex-none rounded-md px-4 py-1.5 text-[0.9375rem] text-muted-foreground hover:bg-muted data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none data-active:hover:bg-primary data-active:[&>.tab-count]:bg-primary-foreground data-active:[&>.tab-count]:text-primary-strong'

export function TabCount({ n }: { n: number | null | undefined }) {
  if (n === null || n === undefined) return null
  return <span className="tab-count rounded-full bg-chip-neutral px-2 py-px text-meta font-medium text-foreground tabular-nums">{n}</span>
}

export interface SectionItem {
  value: string
  label: string
  count?: number | null
}

/**
 * P-02: a page's local sections. Tabs on wide screens; below 768px one select labelled
 * "Section", same order, counts kept. Only one of the two is in the accessibility tree.
 */
export function SectionNav({ items, value, onChange, label = 'Section', variant = 'line', className }: { items: SectionItem[]; value: string; onChange: (value: string) => void; label?: string; variant?: 'line' | 'pills'; className?: string }) {
  return (
    <div className={className}>
      <div className="md:hidden">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full" aria-label={label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
                {i.count !== undefined && i.count !== null ? ` (${i.count})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs value={value} onValueChange={onChange} className="hidden md:flex">
        <TabsList variant={variant === 'pills' ? 'default' : 'line'} className={variant === 'pills' ? PILL_TABS_LIST : LINE_TABS_LIST} aria-label={label}>
          {items.map((i) => (
            <TabsTrigger key={i.value} value={i.value} className={variant === 'pills' ? PILL_TAB : LINE_TAB}>
              {i.label}
              <TabCount n={i.count} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
