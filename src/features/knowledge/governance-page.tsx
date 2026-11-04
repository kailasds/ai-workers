import { Link, useNavigate, useParams } from 'react-router'
import { Boxes, ChevronLeft, DatabaseZap, Grid3x3, Inbox } from 'lucide-react'
import { TabBar } from '@/components/platform/tab-bar'
import { Panel } from '@/components/platform/panel'
import { EmptyState } from '@/components/platform/states'

const VIEWS = {
  coverage: { label: 'Coverage', icon: Grid3x3 },
  inbox: { label: 'Candidate decisions', icon: Inbox },
  packs: { label: 'Packs', icon: Boxes },
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
      <Panel id={`governance-${key}`} flush>
        <TabBar label="Governance" value={key} onChange={(v) => navigate(`/knowledge/${v}`)} items={Object.entries(VIEWS).map(([value, v]) => ({ value, label: v.label, icon: v.icon }))} />
        <EmptyState className="m-5" icon={DatabaseZap} title="Not available in this demo" />
      </Panel>
    </div>
  )
}
