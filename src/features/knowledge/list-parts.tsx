import { ChevronRight, Info, Search, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconTile } from '@/components/platform/panel'
import type { Hue } from '@/components/platform/hue'

/** Rows per page in a library list. */
export const LIBRARY_PAGE = 5
export const ALL = '__all'
export const human = (key: string) => key.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

/** One row of a library list: an icon, the name, at most one short fact, a chevron. The whole row opens the item. */
export function LibraryRow({ icon, title, aside, onOpen, label }: { icon: React.ReactNode; title: React.ReactNode; aside?: React.ReactNode; onOpen: () => void; label: string }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="flex w-full items-center gap-4 px-5 py-3 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-item">{title}</span>
        {aside && <span className="hidden shrink-0 items-center gap-2 text-meta text-muted-foreground tabular-nums sm:flex">{aside}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

/** The search box that sits on the right of a panel header. */
export function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <InputGroup className="h-8 w-full sm:w-56">
      <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
      <InputGroupInput type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} />
    </InputGroup>
  )
}

export interface FilterField {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  /** The first option is the "any" choice. */
  options: { value: string; label: string }[]
}

/** One Filters button beside the search box; each field is a select inside its popover. */
export function FiltersButton({ fields, onClear }: { fields: FilterField[]; onClear: () => void }) {
  const active = fields.filter((f) => f.value !== f.options[0].value).length
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {active > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 tabular-nums">{active}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-72 flex-col gap-4">
        {fields.map((f) => (
          <div key={f.id} className="flex flex-col gap-1.5">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Select value={f.value} onValueChange={f.onChange}>
              <SelectTrigger id={f.id} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
        {active > 0 && <Button variant="ghost" size="sm" className="self-start" onClick={onClear}>Clear filters</Button>}
      </PopoverContent>
    </Popover>
  )
}

/* ---- Side panel parts, shared by every library item. ---- */

/** What the item is, at the top of its panel: icon, one line of summary, its badges. */
export function SheetHero({ icon, hue, text, badges }: { icon: LucideIcon; hue: Hue; text: React.ReactNode; badges?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-5">
      <div className="flex items-start gap-4">
        <IconTile icon={icon} hue={hue} />
        <p className="min-w-0 flex-1 self-center text-body whitespace-pre-line">{text}</p>
      </div>
      {badges && <div className="mt-4 flex flex-wrap items-center gap-2">{badges}</div>}
    </div>
  )
}

/** Key facts as small tiles, two or three to a row: icon, label, value. */
export function FactGrid({ facts }: { facts: { icon: LucideIcon; label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {facts.map((f) => (
        <div key={f.label} className="flex items-center gap-3 rounded-block border px-4 py-3">
          <f.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-meta text-muted-foreground">{f.label}</dt>
            <dd className="text-item break-words">{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/** A titled part of a side panel, with its icon. */
export function SheetSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t pt-6">
      <h3 className="mb-4 flex items-center gap-2 text-item font-semibold"><Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{title}</h3>
      {children}
    </section>
  )
}

/** A quiet note on what this demo can't show. */
export function DemoNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-meta text-muted-foreground"><Info className="size-4 shrink-0" aria-hidden="true" />{children}</p>
}

/** A key or code value, wrapped in mono. */
export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-meta break-all">{children}</span>
}
