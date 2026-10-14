import { Link, useNavigate, useParams } from 'react-router'
import { ChevronLeft, DatabaseZap } from 'lucide-react'
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
            The offline capture this console runs on does not include the governance reads, so nothing is shown rather than an empty list.
          </>
        }
      />
    </div>
  )
}
