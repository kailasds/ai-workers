import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Fact, FactList } from '@/components/platform/fact-list'
import { StatusBadge } from '@/components/platform/status-badge'
import { Timestamp } from '@/components/platform/timestamp'
import type { WorkerWorkspace } from '@/lib/types/worker'

// Configured vs running are two facts, side by side so they are never read as one.
export function SentinelTab({ ws }: { ws: WorkerWorkspace }) {
  const s = ws.worker.sentinel
  const configured = s.state === 'CONFIGURED'
  const running = s.worker_runtime === 'WORKER_RUNTIME'
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
        <CardHeader className="pt-5">
          <CardTitle>Configured</CardTitle>
          <CardDescription>What the Package says this Worker’s Sentinel should do.</CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          <FactList>
            <Fact label="Source">From Package · r{ws.composition?.package?.composition_revision ?? ws.worker.revision}</Fact>
            <Fact label="Worker Sentinel">
              <StatusBadge tone="neutral" icon={null}>{configured ? 'Composed with one' : 'Composed without'}</StatusBadge>
            </Fact>
          </FactList>
          {!configured && <p className="mt-4 text-meta text-muted-foreground">No authority is inferred when configuration is absent.</p>}
        </CardContent>
      </Card>
      <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
        <CardHeader className="pt-5">
          <CardTitle>Running</CardTitle>
          <CardDescription>What a serving Worker Runtime applies right now.</CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          <FactList>
            <Fact label="Reporting">
              {running ? <StatusBadge tone="neutral" icon={null}>From its Worker Runtime</StatusBadge> : <span className="text-muted-foreground">Not reporting: no Worker Runtime is running</span>}
            </Fact>
            <Fact label="Last action">{s.last_action ?? <span className="text-muted-foreground">None reported</span>}</Fact>
            <Fact label="Observed"><Timestamp iso={s.observed_at} /></Fact>
          </FactList>
          <p className="mt-4 text-meta text-muted-foreground">Fleet-wide decisions, restrictions and stops are in Sentinel.</p>
        </CardContent>
      </Card>
    </div>
  )
}
