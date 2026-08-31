import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import Overview from "@/pages/overview";
import WorkersDirectory from "@/pages/workers-directory";
import CreateWorker from "@/pages/create-worker";
import WorkerLayout from "@/pages/worker/worker-layout";
import WorkerOverview from "@/pages/worker/worker-overview";
import ConfigurationHub from "@/pages/worker/configuration-hub";
import ManageSkills from "@/pages/worker/manage-skills";
import ManageKnowledge from "@/pages/worker/manage-knowledge";
import AgentTeam from "@/pages/worker/agent-team";
import ToolsAccess from "@/pages/worker/tools-access";
import WorkerGovernance from "@/pages/worker/worker-governance";
import WorkerBudget from "@/pages/worker/worker-budget";
import CompletionContractPage from "@/pages/worker/completion-contract";
import WorkerWork from "@/pages/worker/worker-work";
import WorkExecution from "@/pages/worker/work-execution";
import GlobalWork from "@/pages/global-work";
import GlobalApprovals from "@/pages/global-approvals";
import GlobalGovernance from "@/pages/global-governance";
import GlobalAnalytics from "@/pages/global-analytics";
import Settings from "@/pages/settings";
import WorkerPerformance from "@/pages/worker/worker-performance";
import WorkerLearning from "@/pages/worker/worker-learning";
import WorkerAudit from "@/pages/worker/worker-audit";

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
            <Route path="configuration" element={<ConfigurationHub />} />
            <Route path="configuration/skills" element={<ManageSkills />} />
            <Route path="configuration/knowledge" element={<ManageKnowledge />} />
            <Route path="configuration/agents" element={<AgentTeam />} />
            <Route path="configuration/tools" element={<ToolsAccess />} />
            <Route path="configuration/governance" element={<WorkerGovernance />} />
            <Route path="configuration/budget" element={<WorkerBudget />} />
            <Route path="configuration/completion" element={<CompletionContractPage />} />
            <Route path="work" element={<WorkerWork />} />
            <Route path="work/:taskId" element={<WorkExecution />} />
            <Route path="performance" element={<WorkerPerformance />} />
            <Route path="learning" element={<WorkerLearning />} />
            <Route path="audit" element={<WorkerAudit />} />
          </Route>
          <Route path="work" element={<GlobalWork />} />
          <Route path="approvals" element={<GlobalApprovals />} />
          <Route path="governance" element={<GlobalGovernance />} />
          <Route path="analytics" element={<GlobalAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
