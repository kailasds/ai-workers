import { useState } from 'react'
import { Link } from 'react-router'
import { Building2, ChevronDown, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tag } from '@/components/platform/hue'
import { RuntimeStatusDot, runtimeStatus } from '@/components/platform/runtime-status'
import { EmptyState } from '@/components/platform/states'
import { VerdictBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount, formatDay } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CustomerPackage, WorkerVersion, WorkerWorkspace } from '@/lib/types/worker'
import { CustomerPackageStateBadge } from '../registry/customer-packages'

const customerName = (p: CustomerPackage) => p.destination_label ?? 'Customer not named'

/** design.md §8 icon containers: a 32px disc beside a contact-style row. */
function CustomerDisc() {
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-icon-circle text-primary-strong">
      <Building2 className="size-4" />
    </span>
  )
}

function Customers({ deliveries }: { deliveries: CustomerPackage[] }) {
  if (deliveries.length === 0) return <p className="text-meta text-muted-foreground md:pt-1.5">Not prepared for any customer yet</p>
  return (
    <ul className="flex flex-col gap-2" aria-label="Customers">
      {deliveries.map((d) => (
        <li key={d.delivery_id} className="flex flex-wrap items-center gap-2">
          <CustomerDisc />
          <span className="text-body">{customerName(d)}</span>
          <CustomerPackageStateBadge state={d.state} />
        </li>
      ))}
    </ul>
  )
}

function VersionRow({ version, currentId }: { version: WorkerVersion; currentId: string }) {
  const [open, setOpen] = useState(false)
  const current = version.builds.some((b) => b.composition_id === currentId)
  const newest = version.builds[0]
  const oldest = version.builds[version.builds.length - 1]
  return (
    <li className={cn('rounded-block p-4', current ? 'bg-primary-soft ring-1 ring-primary/30' : 'bg-muted')}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <Tag hue="blue" icon={GitBranch} className="bg-card">Revision {version.revision}</Tag>
              {current && <span className="rounded-full bg-primary px-2 py-0.5 text-overline text-primary-foreground">This version</span>}
            </p>
            <p className="mt-2 text-meta text-muted-foreground">
              {version.builds.length === 1 ? '1 build' : `${formatCount(version.builds.length)} builds`} · composed {formatDay(oldest.created_at)}
              {oldest !== newest && <> – {formatDay(newest.created_at)}</>}
            </p>
          </div>
          <Customers deliveries={version.deliveries} />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="justify-self-start md:justify-self-end">
              {open ? 'Hide builds' : 'Show builds'}
              <ChevronDown className={cn(open && 'rotate-180')} aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="mt-4 flex flex-col gap-1.5" aria-label={`Builds at revision ${version.revision}`}>
            {version.builds.map((b) => {
              const here = b.composition_id === currentId
              const delivered = version.deliveries.filter((d) => d.composition_id === b.composition_id)
              return (
                <li key={b.composition_id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-card px-3 py-2.5 text-meta">
                  {here ? (
                    <span className="font-mono text-foreground" aria-current="page">{b.composition_id.slice(0, 8)} · this build</span>
                  ) : (
                    <Link to={`/workers/${b.composition_id}?view=versions`} className="rounded-sm font-mono text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
                      {b.composition_id.slice(0, 8)}
                    </Link>
                  )}
                  <span className="text-muted-foreground">{formatDay(b.created_at)}</span>
                  <RuntimeStatusDot status={runtimeStatus(b.runtime)} />
                  {b.last_outcome.verdict && b.last_outcome.runs > 0 && <VerdictBadge verdict={b.last_outcome.verdict} />}
                  {delivered.length > 0 && <span className="text-muted-foreground md:ml-auto">Prepared for {delivered.map(customerName).join(', ')}</span>}
                </li>
              )
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

/** Which customer holds which version, with the latest transfer evidence. */
function CustomersCard({ versions }: { versions: WorkerVersion[] }) {
  const deliveries = versions.flatMap((v) => v.deliveries)
  const customers = [...new Set(deliveries.map(customerName))].sort()
  return (
    <Card className="gap-4 p-5">
      <h2 className="text-section">Customers</h2>
      {customers.length === 0 ? (
        <EmptyState icon={Building2} title="No customer has a version of this Worker yet" />
      ) : (
        <ul className="flex flex-col gap-2">
          {customers.map((c) => (
            <li key={c} className="grid gap-3 rounded-block bg-muted p-3 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-start">
              <span className="flex items-center gap-2.5 text-item">
                <CustomerDisc />
                {c}
              </span>
              <ul className="flex flex-col gap-2 md:pt-1">
                {deliveries
                  .filter((d) => customerName(d) === c)
                  .map((d) => (
                    <li key={d.delivery_id} className="flex flex-wrap items-center gap-2 text-meta">
                      <Tag hue="blue" icon={GitBranch} className="bg-card">Revision {d.revision}</Tag>
                      <CustomerPackageStateBadge state={d.state} />
                      {d.last_evidence_at && <span className="text-muted-foreground">last evidence <Timestamp iso={d.last_evidence_at} /></span>}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// A version is a revision of this Worker (same name and bounded context); each revision may have
// several builds. Customer packages name their version by revision, so customers group under it.
export function VersionsTab({ ws }: { ws: WorkerWorkspace }) {
  const { versions } = ws
  return (
    <div className="flex flex-col gap-5">
      <Card className="gap-4 p-5">
        <h2 className="text-section">Versions</h2>
        <ul className="flex flex-col gap-2">
          {versions.map((v) => (
            <VersionRow key={v.revision} version={v} currentId={ws.worker.composition_id} />
          ))}
        </ul>
      </Card>
      <CustomersCard versions={versions} />
    </div>
  )
}
