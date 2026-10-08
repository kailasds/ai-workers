import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ALL_NAV_ITEMS } from './nav'

// Jump to any area from the keyboard. Worker search joins this list when the Registry data
// layer lands; the pages are enough to be useful today.
export function CommandMenu({ open, onOpenChange, features }: { open: boolean; onOpenChange: (open: boolean) => void; features: string[] }) {
  const navigate = useNavigate()
  const items = ALL_NAV_ITEMS.filter((item) => !item.feature || features.includes(item.feature))

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Jump to" description="Search the console's areas" className="sm:max-w-xl">
      <Command>
      <CommandInput placeholder="Jump to an area…" />
      <CommandList>
        <CommandEmpty>Nothing in the console matches that.</CommandEmpty>
        <CommandGroup heading="Areas">
          {items.map((item) => (
            <CommandItem
              key={item.to}
              value={`${item.label} ${item.purpose}`}
              onSelect={() => {
                onOpenChange(false)
                navigate(item.to)
              }}
            >
              <item.icon aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
              <span className="truncate text-xs text-muted-foreground">{item.purpose}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  )
}

export function useCommandShortcut() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return [open, setOpen] as const
}
