import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams, useLocation } from 'react-router'
import { AppShell } from '@/components/shell/app-shell'

// Every content route is lazy-loaded, so the first screen does not pay for the whole console.
const named = <T,>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] as unknown as React.ComponentType })))

const DashboardPage = named(() => import('@/features/dashboard/dashboard-page'), 'DashboardPage')
const RegistryPage = named(() => import('@/features/registry/registry-page'), 'RegistryPage')
const WorkerPage = named(() => import('@/features/worker/worker-page'), 'WorkerPage')
const DeclarationPage = named(() => import('@/features/compose/declaration-page'), 'DeclarationPage')
const JourneyPage = named(() => import('@/features/compose/journey-page'), 'JourneyPage')
const DraftsPage = named(() => import('@/features/compose/drafts-page'), 'DraftsPage')
const KnowledgePage = named(() => import('@/features/knowledge/knowledge-page'), 'KnowledgePage')
const GovernancePage = named(() => import('@/features/knowledge/governance-page'), 'GovernancePage')
const SkillWizard = named(() => import('@/features/knowledge/skill-wizard'), 'SkillWizard')
const LearningPage = named(() => import('@/features/learning/learning-page'), 'LearningPage')
const WorkerLearningPage = named(() => import('@/features/learning/worker-learning-page'), 'WorkerLearningPage')
const WorkerLearningSubpage = named(() => import('@/features/learning/worker-learning-page'), 'WorkerLearningSubpage')
const SentinelOverviewPage = named(() => import('@/features/sentinel/overview-page'), 'SentinelOverviewPage')
const SentinelWorkersPage = named(() => import('@/features/sentinel/workers-page'), 'SentinelWorkersPage')
const SentinelDecisionsPage = named(() => import('@/features/sentinel/decisions-page'), 'SentinelDecisionsPage')
const SentinelDecisionPage = named(() => import('@/features/sentinel/decisions-page'), 'SentinelDecisionPage')
const SentinelPolicyPage = named(() => import('@/features/sentinel/policy-dimension-pages'), 'SentinelPolicyPage')
const SentinelDimensionPage = named(() => import('@/features/sentinel/policy-dimension-pages'), 'SentinelDimensionPage')
const PackagingPage = named(() => import('@/features/packaging/packaging-page'), 'PackagingPage')
const DeliveryPage = named(() => import('@/features/delivery/delivery-page'), 'DeliveryPage')
const DeliveryWizard = named(() => import('@/features/delivery/delivery-wizard'), 'DeliveryWizard')
const HarnessCataloguePage = named(() => import('@/features/harnesses/harness-pages'), 'HarnessCataloguePage')
const HarnessPage = named(() => import('@/features/harnesses/harness-pages'), 'HarnessPage')
const CertifyPage = named(() => import('@/features/harnesses/harness-pages'), 'CertifyPage')
const ConformancePage = named(() => import('@/features/harnesses/harness-pages'), 'ConformancePage')
const ConformanceReportPage = named(() => import('@/features/harnesses/harness-pages'), 'ConformanceReportPage')
const SdkPage = named(() => import('@/features/harnesses/harness-pages'), 'SdkPage')
const PeoplePage = named(() => import('@/features/admin/admin-pages'), 'PeoplePage')
const PersonPage = named(() => import('@/features/admin/admin-pages'), 'PersonPage')
const GroupsPage = named(() => import('@/features/admin/admin-pages'), 'GroupsPage')
const LoginPage = named(() => import('@/features/auth/auth-pages'), 'LoginPage')
const ForgotPage = named(() => import('@/features/auth/auth-pages'), 'ForgotPage')
const LauncherPage = named(() => import('@/features/auth/auth-pages'), 'LauncherPage')
const InvitePage = lazy(() => import('@/features/auth/auth-pages').then((m) => ({ default: () => <m.SetPasswordPage mode="invite" /> })))
const ResetPage = lazy(() => import('@/features/auth/auth-pages').then((m) => ({ default: () => <m.SetPasswordPage mode="reset" /> })))
const ConfigurationPage = named(() => import('@/features/worker/configuration-page'), 'ConfigurationPage')
const NotFoundPage = named(() => import('@/pages/not-found-page'), 'NotFoundPage')

/** Old links keep working: redirect while keeping the query string. */
function Redirect({ to }: { to: (params: Record<string, string | undefined>) => string }) {
  const params = useParams()
  const { search } = useLocation()
  return <Navigate to={`${to(params)}${search}`} replace />
}

// Library tabs and governance views share /knowledge/:x; anything else goes to Learning.
function KnowledgeRouter() {
  const { view = '' } = useParams()
  if (['coverage', 'inbox', 'packs'].includes(view)) return <GovernancePage />
  if (['skills', 'languages', 'evals', 'dod', 'models'].includes(view)) return <KnowledgePage />
  return <Navigate to="/learning" replace />
}

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />
          <Route path="auth/forgot" element={<Suspense fallback={null}><ForgotPage /></Suspense>} />
          <Route path="auth/set-password" element={<Suspense fallback={null}><InvitePage /></Suspense>} />
          <Route path="auth/reset" element={<Suspense fallback={null}><ResetPage /></Suspense>} />
          <Route path="home" element={<Suspense fallback={null}><LauncherPage /></Suspense>} />
          <Route index element={<Navigate to="/home" replace />} />
          <Route element={<AppShell />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="govern/*" element={<Navigate to="/dashboard" replace />} />

            <Route path="workers" element={<RegistryPage />} />
            <Route path="workers/:id" element={<WorkerPage />} />
            <Route path="workers/:id/okf" element={<Redirect to={(p) => `/learning/workers/${p.id}/okf`} />} />
            <Route path="workers/:id/runtimes/:runtimeId/configuration" element={<ConfigurationPage />} />
            <Route path="operate" element={<Navigate to="/workers" replace />} />
            <Route path="fleet/*" element={<Navigate to="/workers" replace />} />
            <Route path="observe/*" element={<Navigate to="/workers" replace />} />

            <Route path="compose" element={<DeclarationPage />} />
            <Route path="compose/expert" element={<Navigate to="/compose" replace />} />
            <Route path="compose/drafts" element={<DraftsPage />} />
            <Route path="compose/guided/:id" element={<JourneyPage />} />
            <Route path="compose/:id" element={<Redirect to={(p) => `/compose/guided/${p.id}`} />} />

            <Route path="packaging" element={<PackagingPage />} />
            <Route path="customer-delivery" element={<DeliveryPage />} />
            <Route path="customer-delivery/prepare/:packageId" element={<DeliveryWizard />} />
            <Route path="knowledge" element={<Navigate to="/knowledge/skills" replace />} />
            <Route path="knowledge/brains" element={<Navigate to="/learning" replace />} />
            <Route path="knowledge/capture" element={<SkillWizard />} />
            <Route path="knowledge/:view" element={<KnowledgeRouter />} />
            <Route path="learning/workers/:id" element={<WorkerLearningPage />} />
            <Route path="learning/workers/:id/:sub/*" element={<WorkerLearningSubpage />} />
            <Route path="learning/*" element={<LearningPage />} />
            <Route path="sentinel" element={<SentinelOverviewPage />} />
            <Route path="sentinel/workers" element={<SentinelWorkersPage />} />
            <Route path="sentinel/decisions" element={<SentinelDecisionsPage />} />
            <Route path="sentinel/decisions/:decisionId" element={<SentinelDecisionPage />} />
            <Route path="sentinel/policy" element={<SentinelPolicyPage />} />
            <Route path="sentinel/:dimension" element={<SentinelDimensionPage />} />
            <Route path="harnesses" element={<HarnessCataloguePage />} />
            <Route path="harnesses/certify" element={<CertifyPage />} />
            <Route path="harnesses/conformance" element={<ConformancePage />} />
            <Route path="harnesses/conformance/:reportId" element={<ConformanceReportPage />} />
            <Route path="harnesses/sdk" element={<Navigate to="/harnesses/sdk/overview" replace />} />
            <Route path="harnesses/sdk/:page" element={<SdkPage />} />
            <Route path="harnesses/reference/*" element={<Navigate to="/harnesses/sdk/overview" replace />} />
            <Route path="harnesses/:key" element={<HarnessPage />} />
            <Route path="admin" element={<Navigate to="/admin/people" replace />} />
            <Route path="admin/people" element={<PeoplePage />} />
            <Route path="admin/people/:personId" element={<PersonPage />} />
            <Route path="admin/groups" element={<GroupsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
