import type { LucideIcon } from 'lucide-react'
import { IconTile } from './icon-tile'

// A single supporting fact: what kind of thing (tile), what it is (label), the number, and
// the one caption that says over what and from where (P-09). Value-as-state ("Not measured")
// is rendered by <MeasuredValue> in body type.
export function Stat({ icon, tone = 'brand', label, children, caption }: { icon: LucideIcon; tone?: 'brand' | 'primary'; label: React.ReactNode; children: React.ReactNode; caption: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <dt className="text-meta text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-xl leading-tight font-semibold tracking-tight tabular-nums">{children}</dd>
        <dd className="mt-0.5 text-meta text-muted-foreground">{caption}</dd>
      </div>
    </div>
  )
}
