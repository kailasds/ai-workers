import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export interface SectionItem {
  value: string
  label: string
  count?: number | null
}

/**
 * P-02: a page's local sections. Tabs on wide screens; below 768px one select labelled
 * "Section", same order, counts kept. Only one of the two is in the accessibility tree.
 */
export function SectionNav({ items, value, onChange, label = 'Section', className }: { items: SectionItem[]; value: string; onChange: (value: string) => void; label?: string; className?: string }) {
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
        <TabsList variant="line" className={cn('w-full justify-start border-b')} aria-label={label}>
          {items.map((i) => (
            <TabsTrigger key={i.value} value={i.value} className="flex-none px-3">
              {i.label}
              {i.count !== undefined && i.count !== null && <span className="text-muted-foreground tabular-nums">{i.count}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
