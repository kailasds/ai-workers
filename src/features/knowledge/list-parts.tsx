import { ChevronRight } from 'lucide-react'

/** One row of a library list: an icon, the title and its facts. The whole row opens the item. */
export function LibraryRow({ icon, title, meta, aside, onOpen, label }: { icon?: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; aside?: React.ReactNode; onOpen: () => void; label: string }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-item">{title}</span>
          {meta && <span className="mt-0.5 block truncate text-meta text-muted-foreground">{meta}</span>}
        </span>
        {aside && <span className="hidden shrink-0 items-center gap-2 sm:flex">{aside}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

/** Search and filters, as a tinted strip under a panel's header. */
export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-b bg-muted/30 px-5 py-3 lg:flex-row lg:items-center">{children}</div>
}
