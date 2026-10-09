import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// design.md §8: a rounded-square (8px) icon container. The soft blue tile marks "what kind of
// thing is this"; solid blue is reserved for the one thing that wants action. Status tones are
// tinted with their own hue.
const iconTileVariants = cva('grid shrink-0 place-items-center rounded-xl [&>svg]:shrink-0', {
  variants: {
    tone: {
      brand: 'bg-primary-soft text-primary',
      primary: 'bg-primary text-primary-foreground',
      danger: 'bg-destructive/10 text-destructive',
      warning: 'bg-warning/10 text-warning',
      info: 'bg-info/10 text-info',
      neutral: 'bg-muted text-muted-foreground',
    },
    size: {
      md: 'size-10 [&>svg]:size-5',
      sm: 'size-8 [&>svg]:size-4',
    },
  },
  defaultVariants: { tone: 'brand', size: 'md' },
})

export function IconTile({ icon: Icon, tone, size, className }: { icon: LucideIcon; className?: string } & VariantProps<typeof iconTileVariants>) {
  return (
    <span aria-hidden="true" className={cn(iconTileVariants({ tone, size }), className)}>
      <Icon />
    </span>
  )
}
