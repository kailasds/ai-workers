import type { LucideIcon } from 'lucide-react'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

/** A radio choice laid out as a selectable row: title, one-line detail, right-aligned meta, and a stated reason when unavailable (P-20). */
export function ChoiceCard({
  value,
  id,
  title,
  icon: Icon,
  detail,
  meta,
  disabledReason,
  selected,
  children,
}: {
  value: string
  id: string
  title: React.ReactNode
  icon?: LucideIcon
  detail?: React.ReactNode
  meta?: React.ReactNode
  disabledReason?: string | null
  selected: boolean
  children?: React.ReactNode
}) {
  const disabled = Boolean(disabledReason)
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer gap-3 rounded-xl border bg-card p-4 hover:bg-muted/40 has-focus-visible:ring-2 has-focus-visible:ring-ring sm:px-5',
        selected && 'border-primary bg-primary-soft shadow-[inset_0_0_0_0.5px_var(--primary)] hover:bg-primary-soft',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
      )}
    >
      <RadioGroupItem id={id} value={value} disabled={disabled} className="mt-0.5" />
      {Icon && <Icon className={cn('mt-0.5 size-4 shrink-0', selected ? 'text-primary-strong' : 'text-muted-foreground')} aria-hidden="true" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-item font-semibold">{title}</span>
          {meta && <span className="shrink-0 text-meta text-muted-foreground">{meta}</span>}
        </span>
        {detail && <span className="mt-0.5 block text-meta text-muted-foreground">{detail}</span>}
        {disabledReason && <span className="mt-1 block text-meta text-muted-foreground">Not available · {disabledReason}</span>}
        {children}
      </span>
    </label>
  )
}
