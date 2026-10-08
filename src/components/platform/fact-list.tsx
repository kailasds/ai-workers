import { cn } from '@/lib/utils'

// Label → value pairs, the workhorse of detail views. Labels are meta, values are body;
// one column on phones, label-beside-value from `sm`.
export function FactList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <dl className={cn('divide-y', className)}>{children}</dl>
}

export function Fact({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4', className)}>
      <dt className="text-meta text-muted-foreground sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-body">{children}</dd>
    </div>
  )
}
