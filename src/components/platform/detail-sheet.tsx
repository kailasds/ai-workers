import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/**
 * Deep detail on demand: a right-hand sheet with a titled header, a scrolling body, optional footer.
 * The close button sits in the header row, centred on the title block however many lines it takes.
 */
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
        showCloseButton={false}
        className={cn('w-full gap-0', width === 'md' && 'data-[side=right]:sm:max-w-md', width === 'lg' && 'data-[side=right]:sm:max-w-lg', width === '2xl' && 'data-[side=right]:sm:max-w-2xl')}
      >
        <SheetHeader className="flex-row items-center gap-4 border-b px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <SheetTitle className="text-section">{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : <SheetDescription className="sr-only">Details</SheetDescription>}
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Close"><X aria-hidden="true" /></Button>
          </SheetClose>
        </SheetHeader>
        {/* Radix lays the viewport out as a table, so a nowrap line would widen it; block keeps text wrapping. */}
        <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>
        {footer && <SheetFooter className="flex-row border-t px-6">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
