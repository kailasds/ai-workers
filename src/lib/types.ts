export type WorkerStatus = "active" | "working" | "review" | "paused" | "blocked" | "idle";

export type StatusColor = "blue" | "green" | "amber" | "red" | "purple" | "neutral";

export type AutonomyLevel = "supervised" | "guarded" | "autonomous";

export type SentinelState =
  | "observing"
  | "guarding"
  | "intervention-required"
  | "certified"
  | "policy-violation"
  | "learning-signal";

export type DoDOverallStatus = "not-ready" | "ready-for-review" | "certified-complete";

export interface WorkerIdentity {
  workerId: string;
  environment: string;
  tenant: string;
  createdAt: string;
  credentialStatus: "Active" | "Rotated" | "Suspended";
}

export interface ScopeDefinition {
  primaryPurpose: string;
  boundedScope: string;
  expectedOutcome: string;
  outOfScope: string[];
}

export interface Responsibility {
  primary: string;
  inputs: string[];
  expectedOutputs: string[];
  boundaries: string[];
}

export interface SkillV2 {
  id: string;
  name: string;
  description: string;
  version: string;
  status: "Active" | "Deprecated" | "Draft";
  evalStatus: "Passed" | "Needs Review" | "Failed" | "Not Evaluated";
  linkedTools: string[];
  linkedSpecs: string[];
}

export interface AgentMeshNode {
  id: string;
  name: string;
  role: string;
  isOrchestrator?: boolean;
  status: "completed" | "running" | "waiting" | "idle";
  description: string;
}

export interface ToolAccessV2 {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  permissions: ("Read" | "Write" | "Execute")[];
  restriction?: string;
}

export interface ApprovalMatrixRow {
  id: string;
  action: string;
  autonomy: "Allowed" | "Approval Required" | "Restricted";
  note?: string;
}

export interface PolicyCard {
  id: string;
  name: string;
  statusLabel: string;
  tone: "green" | "amber" | "red" | "neutral";
  description?: string;
}

export interface GovernanceProfile {
  accessScope: string[];
  environmentPermissions: string[];
  leastPrivilegeRules: string[];
  policies: PolicyCard[];
  approvalMatrix: ApprovalMatrixRow[];
  evaluation: {
    suiteName: string;
    lastRun: string;
    passRate: number;
    llmJudgeStatus: "Passed" | "Needs Review" | "Not Run";
    redTeamStatus: "Passed" | "Findings Open" | "Not Run";
    regressionStatus: "Passed" | "Failed" | "Not Run";
  };
  budget: {
    monthly: number;
    used: number;
    projected: number;
    perTaskLimit: number;
    approvalThreshold: number;
    costPerOutcome: number;
    valueGenerated: number;
    breakdown: { label: string; amount: number }[];
  };
}

export interface DoDRequirement {
  id: string;
  label: string;
  status: "passed" | "failed" | "pending";
  evidence: string[];
}

export interface DoDSection {
  id: string;
  title: string;
  requirements: DoDRequirement[];
}

export interface DefinitionOfDoneContract {
  title: string;
  overallStatus: DoDOverallStatus;
  sections: DoDSection[];
}

export interface KnowledgeSourceV2 {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Connected" | "Stale";
  lastUpdated: string;
}

export interface MemoryCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface WorkerVersion {
  version: string;
  role: "champion" | "challenger";
  summary: string;
  evaluationStatus: string;
  date: string;
}

export interface ImprovementCandidate {
  id: string;
  title: string;
  description: string;
  evidenceCount: number;
  successRate: number;
  status: "pending-review" | "promoted" | "rejected";
  date: string;
}

export interface LearningPlanData {
  fastLoopSummary: string;
  slowLoopSummary: string;
  championVersion: WorkerVersion;
  challengerVersion?: WorkerVersion;
  improvementCandidates: ImprovementCandidate[];
}

export interface WorkHistoryItem {
  id: string;
  title: string;
  outcome: string;
  status: "certified-complete" | "needs-review" | "in-progress" | "failed";
  dodPassed: number;
  dodTotal: number;
  cost: number;
  durationHrs: number;
  evidenceAvailable: boolean;
  humanReview: "Approved" | "Pending" | "Not Required" | "Rejected";
  reason?: string;
  completedAt?: string;
}

export interface ExecutionEvent {
  id: string;
  time: string;
  title: string;
  actor: string;
  type: "assignment" | "agent-start" | "milestone" | "validation" | "sentinel" | "pause" | "completion";
  decisionSummary?: string;
  evidence?: string[];
  inputs?: string[];
  outputs?: string[];
  rulesApplied?: string[];
  policiesApplied?: string[];
  agentsInvolved?: string[];
  result?: string;
}

export interface WorkerHealthMetrics {
  capability: number;
  governance: number;
  evaluation: number;
  cost: number;
}

export interface CurrentWorkStage {
  label: string;
  state: "done" | "current" | "pending";
}

export interface CurrentWork {
  id: string;
  title: string;
  status: "in-progress" | "awaiting-approval" | "paused";
  stage: string;
  stages: CurrentWorkStage[];
  progress: number;
  startedAt: string;
  cost: number;
  budget: number;
}

export interface AIWorker {
  id: string;
  name: string;
  role: string;
  purpose: string;
  department: string;
  domain: string;
  status: WorkerStatus;
  statusLabel: string;
  autonomy: AutonomyLevel;
  version: string;
  avatarInitials: string;
  accentColor: StatusColor;
  sentinel: SentinelState;
  identity: WorkerIdentity;
  scope: ScopeDefinition;
  responsibility: Responsibility;
  skills: SkillV2[];
  agentMesh: AgentMeshNode[];
  tools: ToolAccessV2[];
  governance: GovernanceProfile;
  definitionOfDone: DefinitionOfDoneContract;
  knowledgeSources: KnowledgeSourceV2[];
  memory: MemoryCategory[];
  learningPlan: LearningPlanData;
  workHistory: WorkHistoryItem[];
  currentWork?: CurrentWork;
  executionTimeline: ExecutionEvent[];
  health: WorkerHealthMetrics;
  costPerTask: number;
  activeTasks: number;
}
