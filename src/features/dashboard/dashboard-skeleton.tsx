import { LoadingRegion } from '@/components/platform/states'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

// Shaped like the page it stands in for; labelled, with no progress claims.
export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading Dashboard…" className="flex flex-col gap-6">
      <Card className="gap-0 py-0">
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-5 w-72" />
            <Skeleton className="mt-4 h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-6 border-t p-6">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} className="gap-3 p-5">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 3 }, (_, j) => <Skeleton key={j} className="h-10 w-full" />)}
          </Card>
        ))}
      </div>
    </LoadingRegion>
  )
}
