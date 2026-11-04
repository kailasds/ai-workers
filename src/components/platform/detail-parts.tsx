import type { LucideIcon } from 'lucide-react'

/** A divider row inside a details panel: icon, label, optional trailing link. */
export function PanelPart({ icon: Icon, title, aside }: { icon: LucideIcon; title: string; aside?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 border-t bg-muted/40 px-5 py-2.5 text-meta font-medium text-muted-foreground">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{title}</span>
      {aside}
    </h3>
  )
}

/** A details page's few facts, three to a row: label, then value. */
export function FactList({ facts }: { facts: { label: string; value: React.ReactNode }[] }) {
  if (facts.length === 0) return null
  return (
    <dl className="grid gap-x-6 gap-y-2 border-t pt-3 sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="text-meta text-muted-foreground">{f.label}</dt>
          <dd className="text-body break-words">{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}
