import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        </CardHeader>
        <CardContent className="py-5">
          <FactList>
            <Fact label="Source">From Package · r{ws.composition?.package?.composition_revision ?? ws.worker.revision}</Fact>
            <Fact label="Worker Sentinel">
              <StatusBadge tone="neutral" icon={null}>{configured ? 'With Sentinel' : 'Without Sentinel'}</StatusBadge>
            </Fact>
          </FactList>
          {!configured && <p className="mt-4 text-meta text-muted-foreground">No Sentinel settings configured.</p>}
        </CardContent>
      </Card>
      <Card className="gap-0 py-0 [--card-spacing:--spacing(5)]">
        <CardHeader className="pt-5">
          <CardTitle>Running</CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <FactList>
            <Fact label="Reporting">
              {running ? <StatusBadge tone="neutral" icon={null}>From its Worker Runtime</StatusBadge> : <span className="text-muted-foreground">Not running</span>}
            </Fact>
            <Fact label="Last action">{s.last_action ?? <span className="text-muted-foreground">None reported</span>}</Fact>
            <Fact label="Observed"><Timestamp iso={s.observed_at} /></Fact>
          </FactList>
          <p className="mt-4 text-meta text-muted-foreground">
            This Worker’s Sentinel decides what it keeps. Reuse by other Workers, stops and restrictions are{' '}
            <Link to="/sentinel" className="text-primary-strong underline-offset-4 hover:underline">Platform Sentinel</Link> decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
