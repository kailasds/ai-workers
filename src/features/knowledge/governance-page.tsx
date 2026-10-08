import { useNavigate, useParams } from 'react-router'
import { DatabaseZap } from 'lucide-react'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState } from '@/components/platform/states'

const VIEWS = {
  coverage: { label: 'Coverage', what: 'Defined migration constructs and the admitted knowledge a Worker can retrieve for each. Candidates are counted separately until they are admitted.' },
  inbox: { label: 'Candidate decisions', what: 'Review literal evidence before changing shared knowledge: promote, defer or reject each candidate. Publication still needs regression evidence.' },
  packs: { label: 'Packs', what: 'Immutable published versions, their regression result and observed Worker use.' },
} as const

// Shared-knowledge governance. The offline capture holds none of its reads, so each view says
// it is unavailable (never an empty list that would read as "nothing to govern").
export function GovernancePage() {
  const { view = 'coverage' } = useParams()
  const navigate = useNavigate()
  const key = (view in VIEWS ? view : 'coverage') as keyof typeof VIEWS
  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Knowledge', to: '/knowledge/skills' }, { label: 'Governance' }]} title="Knowledge governance" description="How a candidate becomes shared knowledge: a person promotes it, and a pack is published only after its regression gate passes." />
      <SectionNav value={key} onChange={(v) => navigate(`/knowledge/${v}`)} items={Object.entries(VIEWS).map(([value, v]) => ({ value, label: v.label }))} />
      <EmptyState
        icon={DatabaseZap}
        title="Knowledge source unavailable"
        description={
          <>
            {VIEWS[key].what}
            <br />
            The offline capture this console runs on does not include the governance reads, so nothing is shown rather than an empty list.
          </>
        }
      />
    </PageContainer>
  )
}
