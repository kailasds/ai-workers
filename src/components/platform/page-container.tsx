import { cn } from '@/lib/utils'

// Page gutters and the vertical rhythm between sections come from design.md §6:
// 32px gutter on desktop (16px on phones), 24px between major sections.
export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8', className)} {...props} />
}
