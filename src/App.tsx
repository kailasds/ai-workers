import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import Overview from "@/pages/overview";
import WorkersDirectory from "@/pages/workers-directory";
import CreateWorker from "@/pages/create-worker";
import AssignWork from "@/pages/assign-work";
import WorkerLayout from "@/pages/worker/worker-layout";
import WorkerOverview from "@/pages/worker/overview";
import Responsibilities from "@/pages/worker/responsibilities";
import Capabilities from "@/pages/worker/capabilities";
import Governance from "@/pages/worker/governance";
import DefinitionOfDone from "@/pages/worker/definition-of-done";
import Knowledge from "@/pages/worker/knowledge";
import WorkHistory from "@/pages/worker/work-history";
import WorkHistoryDetail from "@/pages/worker/work-history-detail";
import Operations from "@/pages/worker/operations";
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
import GlobalGovernance from "@/pages/global-governance";
import GlobalAnalytics from "@/pages/global-analytics";
import Settings from "@/pages/settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="workers" element={<WorkersDirectory />} />
          <Route path="workers/new" element={<CreateWorker />} />
          <Route path="workers/:workerId" element={<WorkerLayout />}>
            <Route index element={<WorkerOverview />} />
            <Route path="responsibilities" element={<Responsibilities />} />
            <Route path="capabilities" element={<Capabilities />} />
            <Route path="governance" element={<Governance />} />
            <Route path="definition-of-done" element={<DefinitionOfDone />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="work-history" element={<WorkHistory />} />
            <Route path="work-history/:workId" element={<WorkHistoryDetail />} />
            <Route path="operations" element={<Operations />} />
          </Route>
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
          <Route path="governance" element={<GlobalGovernance />} />
          <Route path="analytics" element={<GlobalAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
