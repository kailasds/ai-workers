export type WorkerStatus = "active" | "working" | "review" | "paused" | "blocked" | "completed";

export type StatusColor = "blue" | "green" | "amber" | "red" | "purple" | "neutral";

export interface Skill {
  id: string;
  name: string;
  level: "Intermediate" | "Advanced" | "Expert";
  scope: string;
  restrictions?: string;
  usedByAgents: string[];
  usageCount: number;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: "Guideline" | "Standard" | "Playbook" | "Historical Record" | "Reference";
  version?: string;
  status: "Active" | "Connected" | "Stale";
  lastUpdated: string;
  usageCount: number;
  detail?: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  purpose: string;
  capabilities: string[];
  restrictions: string[];
  status: "completed" | "running" | "waiting" | "idle";
  usageCount: number;
  performance: number;
  costPerRun: number;
}

export interface ToolAccess {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  permissions: ("READ" | "WRITE" | "EXECUTE" | "ADMIN" | "CREATE PR" | "RUN SCAN" | "RUN PIPELINE")[];
  restriction?: string;
}

export interface Policy {
  id: string;
  name: string;
  scope: "Organization" | "Worker-Specific";
  status: "Enforced" | "Exception";
  appliesTo?: string;
  version?: string;
  lastUpdated?: string;
}

export interface CompletionCheckpoint {
  id: string;
  order: number;
  label: string;
  required: boolean;
  status: "complete" | "pending" | "in-progress";
  validationType: string;
  responsibleAgent: string;
  evidenceRequirement: string;
  humanApproval: boolean;
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: "%" | "hrs" | "$" | "";
  target: number;
  targetDirection: "min" | "max";
  trend: number[];
}

export interface WorkTask {
  id: string;
  workerId: string;
  title: string;
  status: "running" | "completed" | "awaiting-approval" | "failed" | "scheduled";
  progress: number;
  currentStage: string;
  startedAt: string;
  completedAt?: string;
  cost: number;
  budget: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  policy?: string;
  outcome: "allowed" | "blocked" | "info";
  detail?: string;
}

export interface LearningCandidate {
  id: string;
  title: string;
  description: string;
  evidenceCount: number;
  successRate: number;
  status: "pending-review" | "promoted" | "rejected";
  date: string;
}

export interface VersionEvent {
  version: string;
  label: string;
  date: string;
  current?: boolean;
}

export interface AIWorker {
  id: string;
  name: string;
  role: string;
  department: string;
  status: WorkerStatus;
  statusLabel: string;
  version: string;
  mission: string;
  avatarInitials: string;
  accentColor: StatusColor;
  currentTask?: string;
  currentStage?: string;
  progress?: number;
  performance: number;
  costPerTask: number;
  activeTasks: number;
  skills: Skill[];
  knowledge: KnowledgeSource[];
  agents: AgentDefinition[];
  tools: ToolAccess[];
  policies: Policy[];
  budget: {
    monthly: number;
    used: number;
    projected: number;
    perTaskLimit: number;
    approvalThreshold: number;
    breakdown: { label: string; amount: number }[];
  };
  kpis: KPI[];
  completionContract: CompletionCheckpoint[];
  authority: { allowed: string[]; forbidden: string[] };
  escalationRules: string[];
  tasks: WorkTask[];
  auditTrail: AuditEvent[];
  learning: LearningCandidate[];
  versionHistory: VersionEvent[];
  responsibilities: string[];
}
