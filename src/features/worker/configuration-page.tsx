import { Link, useParams } from 'react-router'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'

// Post-deploy configuration: only what the owner was allowed to change, each with its bounds,
// whether it applies live or needs a restart, and an ETag on save. The maintenance schema is
// read from the runtime, which the offline capture does not include.
export function ConfigurationPage() {
  const { id = '' } = useParams()
  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Registry', to: '/workers' }, { label: 'Worker', to: `/workers/${id}?view=runtimes` }, { label: 'Configuration' }]} title="Configuration and maintenance" description="Change only the settings this Worker’s owner was allowed to change. Everything else is locked in the Package and changes through a new revision." />
      <EmptyState
        icon={Settings2}
        title="Worker configuration is unavailable"
        description="The packaged settings are read from the runtime itself. This console runs on captured data, which holds no runtime’s maintenance schema."
        action={<Button asChild variant="outline"><Link to={`/workers/${id}?view=runtimes`}>Back to runtimes</Link></Button>}
      />
    </PageContainer>
  )
}
