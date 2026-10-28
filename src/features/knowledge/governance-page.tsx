import { Link, useNavigate, useParams } from 'react-router'
import { ChevronLeft, DatabaseZap } from 'lucide-react'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState } from '@/components/platform/states'

const VIEWS = {
  coverage: { label: 'Coverage', what: 'Migration constructs and the approved knowledge for each. Pending items are counted separately.' },
  inbox: { label: 'Candidate decisions', what: 'Approve, defer or reject proposed knowledge changes. Publishing still needs passing regression tests.' },
  packs: { label: 'Packs', what: 'Published versions, their test results and which Workers use them.' },
} as const

// Shared-knowledge governance. The offline capture holds none of its reads, so each view says
// it is unavailable (never an empty list that would read as "nothing to govern").
export function GovernancePage() {
  const { view = 'coverage' } = useParams()
  const navigate = useNavigate()
  const key = (view in VIEWS ? view : 'coverage') as keyof typeof VIEWS
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/knowledge/skills" className="inline-flex items-center gap-1 rounded-sm text-meta text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronLeft className="size-3.5" aria-hidden="true" />Knowledge library
        </Link>
        <h2 className="mt-1 text-section">Knowledge governance</h2>
      </div>
      <SectionNav variant="pills" value={key} onChange={(v) => navigate(`/knowledge/${v}`)} items={Object.entries(VIEWS).map(([value, v]) => ({ value, label: v.label }))} />
      <EmptyState
        icon={DatabaseZap}
        title="Knowledge source unavailable"
        description={
          <>
            {VIEWS[key].what}
            <br />
            Governance data isn’t available in this demo.
          </>
        }
      />
    </div>
  )
}
