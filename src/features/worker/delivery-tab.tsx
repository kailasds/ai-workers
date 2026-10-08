import { Link } from 'react-router'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkerWorkspace } from '@/lib/types/worker'
import { CustomerPackagesTable } from '../registry/customer-packages'

export function DeliveryTab({ ws }: { ws: WorkerWorkspace }) {
  const pkg = ws.composition?.package
  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="border-b py-5">
        <CardTitle>Customer packages</CardTitle>
        <CardDescription>Packages prepared from this Worker for a named customer, with their transfer evidence.</CardDescription>
        <CardAction>
          {pkg ? (
            <Button asChild size="sm">
              <Link to={`/customer-delivery/prepare/${pkg.id}`}>
                <Send aria-hidden="true" />
                Prepare customer package
              </Link>
            </Button>
          ) : (
            <span className="text-meta text-muted-foreground">Needs a built Package first</span>
          )}
        </CardAction>
      </CardHeader>
      <CustomerPackagesTable packages={ws.deliveries} compact />
    </Card>
  )
}
