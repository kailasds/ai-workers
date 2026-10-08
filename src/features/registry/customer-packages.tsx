import { Link } from 'react-router'
import { Ellipsis, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CopyValue } from '@/components/platform/copy-value'
import { EmptyState } from '@/components/platform/states'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import type { CustomerPackage } from '@/lib/types/worker'

const STATE: Record<CustomerPackage['state'], { tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; label: string }> = {
  PREPARING: { tone: 'info', label: 'Preparing' },
  PREPARED: { tone: 'neutral', label: 'Prepared' },
  SHARED: { tone: 'info', label: 'Shared' },
  DOWNLOADED: { tone: 'info', label: 'Downloaded' },
  ACKNOWLEDGED: { tone: 'success', label: 'Acknowledged' },
  EXPIRED: { tone: 'warning', label: 'Expired' },
  FAILED: { tone: 'danger', label: 'Failed' },
}

export function CustomerPackageStateBadge({ state }: { state: CustomerPackage['state'] }) {
  return <StatusBadge tone={STATE[state].tone}>{STATE[state].label}</StatusBadge>
}

function Actions({ pkg }: { pkg: CustomerPackage }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${pkg.worker_name} ${pkg.version}`}>
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild><Link to="/customer-delivery?view=delivered">Share, acknowledge or publish</Link></DropdownMenuItem>
        <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">Transfer actions live with the record in Customer delivery.</DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CustomerPackagesTable({ packages, compact = false }: { packages: CustomerPackage[]; compact?: boolean }) {
  if (packages.length === 0)
    return (
      <EmptyState
        className="m-5"
        icon={PackageOpen}
        title="No customer Packages prepared"
        description="Prepared Packages appear here with their transfer evidence."
        action={<Button asChild variant="outline"><Link to="/customer-delivery">Go to Customer delivery</Link></Button>}
      />
    )
  return (
    <>
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {!compact && <TableHead className="pl-5">Worker</TableHead>}
            <TableHead className={compact ? 'pl-5' : undefined}>Package</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Last evidence</TableHead>
            <TableHead className="pr-5"><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((p) => (
            <TableRow key={p.delivery_id}>
              {!compact && (
                <TableCell className="pl-5">
                  <Link to={`/workers/${p.composition_id}?view=delivery`} className="rounded-sm text-item outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                    {p.worker_name}
                  </Link>
                </TableCell>
              )}
              <TableCell className={compact ? 'pl-5' : undefined}>
                <span className="text-body">{p.version}</span>
                <CopyValue value={p.digest} label={`digest of ${p.version}`} className="flex text-muted-foreground" />
              </TableCell>
              <TableCell>{p.destination_label ?? <span className="text-muted-foreground">Not named</span>}</TableCell>
              <TableCell><CustomerPackageStateBadge state={p.state} /></TableCell>
              <TableCell className="text-meta text-muted-foreground"><Timestamp iso={p.last_evidence_at} /></TableCell>
              <TableCell className="pr-5 text-right"><Actions pkg={p} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ul className="divide-y md:hidden">
        {packages.map((p) => (
          <li key={p.delivery_id} className="flex flex-col gap-1.5 px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-item">{compact ? p.version : `${p.worker_name} · ${p.version}`}</span>
              <CustomerPackageStateBadge state={p.state} />
            </div>
            <span className="text-meta text-muted-foreground">{p.destination_label ?? 'Customer not named'} · last evidence <Timestamp iso={p.last_evidence_at} /></span>
          </li>
        ))}
      </ul>
    </>
  )
}
