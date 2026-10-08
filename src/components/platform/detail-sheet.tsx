import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/** Deep detail on demand: a right-hand sheet with a titled header, a scrolling body, optional footer. */
export function DetailSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg' | '2xl'
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className={cn('w-full gap-0', width === 'md' && 'data-[side=right]:sm:max-w-md', width === 'lg' && 'data-[side=right]:sm:max-w-lg', width === '2xl' && 'data-[side=right]:sm:max-w-2xl')}
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="pr-6 text-section">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : <SheetDescription className="sr-only">Details</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>
        {footer && <SheetFooter className="flex-row border-t px-6">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
