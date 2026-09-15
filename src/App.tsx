import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import Overview from "@/pages/overview";
import CreateWorker from "@/pages/create-worker";
import AssignWork from "@/pages/assign-work";
import WorkerRegistryList from "@/pages/registry/worker-registry-list";
import WorkerPackageDetail from "@/pages/registry/worker-package-detail";
import Packaging from "@/pages/packaging";
import CustomerDelivery from "@/pages/delivery";
import KnowledgeHub from "@/pages/knowledge-hub/knowledge-hub";
import LearningHub from "@/pages/learning-hub/learning-hub";
import GlobalWork from "@/pages/global-work";
import { ExperienceHubLayout } from "@/pages/experience-hub/hub-layout";
import RecommendedUpdates from "@/pages/experience-hub/recommended-updates";
import ExperienceStream from "@/pages/experience-hub/experience-stream";
import ExperienceLibrary from "@/pages/experience-hub/experience-library";
import UpdateHistory from "@/pages/experience-hub/update-history";
import UpdateReview from "@/pages/experience-hub/update-review";
import ExperienceDetail from "@/pages/experience-hub/experience-detail";
import LearningDetail from "@/pages/experience-hub/learning-detail";
import UpdateDetail from "@/pages/experience-hub/update-detail";
import { OperateLayout } from "@/pages/operate/operate-layout";
import DeploymentsOverview from "@/pages/operate/deployments-overview";
import CustomerWorkers from "@/pages/operate/customer-workers";
import WorkerConfiguration from "@/pages/operate/worker-configuration";
import VersionsRollouts from "@/pages/operate/versions-rollouts";
import Monitoring from "@/pages/operate/monitoring";
import DeployWorker from "@/pages/operate/deploy-worker";
import DeploymentDetail from "@/pages/operate/deployment-detail";
import { CapabilitiesLayout } from "@/pages/capabilities/capabilities-layout";
import CapabilityLandscape from "@/pages/capabilities/capability-landscape";
import WorkerRegistry from "@/pages/capabilities/worker-registry";
import WorkerBrainTree from "@/pages/capabilities/worker-brain-tree";
import ConstructDetail from "@/pages/learning/construct-detail";
import CandidateDetail from "@/pages/learning/candidate-detail";
import PackDetail from "@/pages/learning/pack-detail";
import ObservationDetail from "@/pages/learning/observation-detail";
import WorkerMemoryDetail from "@/pages/learning/worker-memory-detail";
import TopicDetail from "@/pages/learning/topic-detail";
import GlobalGovernance from "@/pages/global-governance";
import GlobalAnalytics from "@/pages/global-analytics";
import Settings from "@/pages/settings";
import Sentinel from "@/pages/sentinel";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="workers" element={<WorkerRegistryList />} />
          <Route path="workers/new" element={<CreateWorker />} />
          <Route path="workers/:workerId" element={<WorkerPackageDetail />} />
          <Route path="work" element={<GlobalWork />} />
          <Route path="work/assign" element={<AssignWork />} />
          <Route path="experience-hub" element={<ExperienceHubLayout />}>
            <Route index element={<RecommendedUpdates />} />
            <Route path="stream" element={<ExperienceStream />} />
            <Route path="library" element={<ExperienceLibrary />} />
            <Route path="history" element={<UpdateHistory />} />
          </Route>
          <Route path="experience-hub/updates/:id" element={<UpdateReview />} />
          <Route path="experience-hub/stream/:id" element={<ExperienceDetail />} />
          <Route path="experience-hub/library/:id" element={<LearningDetail />} />
          <Route path="experience-hub/history/:id" element={<UpdateDetail />} />
          <Route path="operations" element={<OperateLayout />}>
            <Route index element={<DeploymentsOverview />} />
            <Route path="customer-workers" element={<CustomerWorkers />} />
            <Route path="worker-configuration" element={<WorkerConfiguration />} />
            <Route path="versions-rollouts" element={<VersionsRollouts />} />
            <Route path="monitoring" element={<Monitoring />} />
          </Route>
          <Route path="operations/deploy" element={<DeployWorker />} />
          <Route path="operations/deployments/:id" element={<DeploymentDetail />} />
          <Route path="capabilities" element={<CapabilitiesLayout />}>
            <Route index element={<CapabilityLandscape />} />
            <Route path="workers" element={<WorkerRegistry />} />
          </Route>
          <Route path="capabilities/worker/:id" element={<WorkerBrainTree />} />
          <Route path="learning" element={<LearningHub />} />
          <Route path="learning/topics/:id" element={<TopicDetail />} />
          <Route path="learning/constructs/:id" element={<ConstructDetail />} />
          <Route path="learning/candidates/:id" element={<CandidateDetail />} />
          <Route path="learning/packs/:id" element={<PackDetail />} />
          <Route path="learning/observations/:id" element={<ObservationDetail />} />
          <Route path="learning/memory/:id" element={<WorkerMemoryDetail />} />
          <Route path="knowledge" element={<KnowledgeHub />} />
          <Route path="sentinel" element={<Sentinel />} />
          <Route path="packaging" element={<Packaging />} />
          <Route path="delivery" element={<CustomerDelivery />} />
          <Route path="user-management" element={<ComingSoon label="User management" />} />
          <Route path="governance" element={<GlobalGovernance />} />
          <Route path="analytics" element={<GlobalAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
