import { Building2, Cpu, FileCheck2, GitBranch, HardDrive, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/platform/states'
import { HUE, Tag, type Hue } from '@/components/platform/hue'
import { Timestamp } from '@/components/platform/timestamp'
import { cn } from '@/lib/utils'
import type { CustomerPackage, WorkerVersion } from '@/lib/types/worker'
import { CustomerPackageStateBadge } from '../registry/customer-packages'

const NOT_NAMED = 'Customer not named'
const customerName = (p: CustomerPackage) => p.destination_label ?? NOT_NAMED

// Customers carry no logo in the delivery record, so each gets a monogram mark: its initials on a
// hue picked from its name, so the same customer always looks the same.
const LOGO_HUES: Hue[] = ['blue', 'teal', 'violet', 'cyan', 'amber', 'rose']

function hueOf(name: string): Hue {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return LOGO_HUES[h % LOGO_HUES.length]
}

const monogram = (name: string) =>
  name === NOT_NAMED ? '?' : name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')

export function CustomerLogo({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const hue = hueOf(name)
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center font-semibold tracking-tight', HUE[hue].solid, size === 'lg' ? 'size-14 rounded-2xl text-[1.25rem]' : 'size-8 rounded-lg text-meta')}>
      {monogram(name)}
    </span>
  )
}

function Figure({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-block bg-muted p-3">
      <dt className="flex items-center gap-1.5 text-meta text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="truncate text-[1.125rem] leading-6 font-medium tabular-nums">{children}</dd>
    </div>
  )
}

const kb = (bytes: number | null) => (bytes === null ? '–' : `${Math.round(bytes / 1024)} KB`)

/** Every customer that holds a version of this Worker, as a card with its mark and its latest delivery. */
export function CustomerShowcase({ versions }: { versions: WorkerVersion[] }) {
  const deliveries = versions.flatMap((v) => v.deliveries)
  const names = [...new Set(deliveries.map(customerName))].sort()
  return (
    <section aria-labelledby="customers-title" className="flex flex-col gap-4">
      <h2 id="customers-title" className="flex items-center gap-2 text-section">
        Customers
        <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{names.length}</span>
      </h2>
      {names.length === 0 ? (
        <EmptyState icon={Building2} title="No customer has a version of this Worker yet" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {names.map((name) => {
            const held = deliveries.filter((d) => customerName(d) === name).sort((a, b) => b.revision - a.revision)
            const latest = held[0]
            const verified = latest.contents.filter((c) => c.integrity === 'VERIFIED').length
            const arch = latest.requirements?.architecture
            return (
              <li key={name}>
                <article className="flex h-full flex-col gap-4 rounded-xl bg-card p-5">
                  <div className="flex items-start gap-4">
                    <CustomerLogo name={name} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-section">{name}</h3>
                      <p className="mt-0.5 text-meta text-muted-foreground">Using revision {latest.revision}</p>
                    </div>
                    <CustomerPackageStateBadge state={latest.state} />
                  </div>
                  <dl className="grid grid-cols-3 gap-1.5">
                    <Figure icon={GitBranch} label="Versions">{held.length}</Figure>
                    <Figure icon={FileCheck2} label="Verified">{verified}/{latest.contents.length}</Figure>
                    <Figure icon={HardDrive} label="Size">{kb(latest.size_bytes)}</Figure>
                  </dl>
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 text-meta text-muted-foreground">
                    {held.map((d) => <Tag key={d.delivery_id} hue="blue" icon={GitBranch}>{d.version}</Tag>)}
                    {arch && <Tag hue="cyan" icon={Cpu}>{arch}</Tag>}
                    <span className="ml-auto">{latest.last_evidence_at ? <>Last evidence <Timestamp iso={latest.last_evidence_at} /></> : 'No evidence yet'}</span>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
