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
        <TabsList variant={variant === 'pills' ? 'default' : 'line'} className={cn(variant === 'pills' ? 'h-11 rounded-lg bg-card p-1 ring-1 ring-border' : 'w-full justify-start border-b')} aria-label={label}>
          {items.map((i) => (
            <TabsTrigger key={i.value} value={i.value} className={cn('flex-none px-3', variant === 'pills' && 'rounded-md px-4 text-muted-foreground hover:bg-muted data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none data-active:hover:bg-primary [&_.tabular-nums]:data-active:text-primary-foreground/80')}>
              {i.label}
              {i.count !== undefined && i.count !== null && <span className="text-muted-foreground tabular-nums">{i.count}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
