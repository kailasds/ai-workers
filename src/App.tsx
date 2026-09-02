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
import ExperienceHub from "@/pages/experience-hub";
import GlobalOperations from "@/pages/global-operations";
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
          <Route path="experience-hub" element={<ExperienceHub />} />
          <Route path="operations" element={<GlobalOperations />} />
          <Route path="governance" element={<GlobalGovernance />} />
          <Route path="analytics" element={<GlobalAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
