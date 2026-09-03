import { hubWorkers, updateRecommendations, hubWorker } from "./experience-hub-data";

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface DeploymentCustomer {
  id: string;
  name: string;
  industry: string;
  region: string;
  portal: string;
}

export const deploymentCustomers: DeploymentCustomer[] = [
  { id: "cust-a", name: "Customer A", industry: "Insurance", region: "US-East", portal: "customer-a.portal.com" },
  { id: "cust-b", name: "Customer B", industry: "Banking", region: "US-West", portal: "customer-b.portal.com" },
  { id: "cust-c", name: "Customer C", industry: "Insurance", region: "EU-Central", portal: "customer-c.portal.com" },
  { id: "cust-d", name: "Customer D", industry: "Healthcare", region: "US-East", portal: "customer-d.portal.com" },
];

export function deploymentCustomer(id: string): DeploymentCustomer {
  return deploymentCustomers.find((c) => c.id === id) ?? deploymentCustomers[0];
}

// ---------------------------------------------------------------------------
// Worker catalog (for the Deploy flow's Select Worker step)
// ---------------------------------------------------------------------------

export interface DeployableWorker {
  id: string;
  name: string;
  purpose: string;
  version: string;
  deployedToCount: number;
  experienceLevel: "High" | "Medium" | "Low";
  validatedLearnings: number;
}

export const deployableWorkers: DeployableWorker[] = [
  { id: "document-intelligence", name: "Document Intelligence Worker", purpose: "Extract and validate information from enterprise documents.", version: "v2.4.1", deployedToCount: 12, experienceLevel: "High", validatedLearnings: 156 },
  { id: "claims-processing", name: "Claims Processing Worker", purpose: "Process claims intake and reconcile supporting documentation.", version: "v3.1.0", deployedToCount: 8, experienceLevel: "Medium", validatedLearnings: 64 },
  { id: "policy-validation", name: "Policy Validation Worker", purpose: "Validate policy intake and payment authorization workflows.", version: "v1.8.3", deployedToCount: 6, experienceLevel: "Medium", validatedLearnings: 41 },
  { id: "underwriting", name: "Underwriting Worker", purpose: "Score risk applications and route borderline cases for review.", version: "v2.0.4", deployedToCount: 5, experienceLevel: "High", validatedLearnings: 88 },
  { id: "fraud-investigation", name: "Fraud Investigation Worker", purpose: "Investigate flagged transactions using bureau and internal data.", version: "v1.6.5", deployedToCount: 3, experienceLevel: "Low", validatedLearnings: 12 },
  { id: "customer-service", name: "Customer Service Worker", purpose: "Resolve common customer requests within approved policy boundaries.", version: "v2.0.3", deployedToCount: 9, experienceLevel: "Medium", validatedLearnings: 57 },
];

export function deployableWorker(id: string): DeployableWorker {
  return deployableWorkers.find((w) => w.id === id) ?? deployableWorkers[0];
}

// ---------------------------------------------------------------------------
// Deployments
// ---------------------------------------------------------------------------

export type DeploymentStatus = "Healthy" | "Needs Attention" | "Degraded" | "Provisioning";
export type PerformanceProfile = "Starter" | "Standard" | "Advanced" | "Enterprise" | "Custom";
export type ExperienceSharingState = "Shared Learnings Enabled" | "Private Learnings" | "Learning Review Required";

export interface ConfigItem {
  id: string;
  label: string;
  currentValue: string;
  customerCanView: boolean;
  customerCanModify: boolean;
  platformControlled: boolean;
  owner: "platform" | "customer" | "ai-recommended" | "customer-modified";
}

export interface VersionRecord {
  version: string;
  label: "Current" | "Previous" | "Rolled Back";
  date: string;
  changeSummary: string;
}

export interface ActivityEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  actor: string;
}

export interface ChangeLogEntry {
  id: string;
  setting: string;
  from: string;
  to: string;
  impactAnalysis: string;
  status: "Requires Review" | "Approved" | "Rejected";
}

export interface Deployment {
  id: string;
  workerId: string;
  customerId: string;
  version: string;
  environment: "Production" | "Staging";
  status: DeploymentStatus;
  performanceProfile: PerformanceProfile;
  experienceSharing: ExperienceSharingState;
  budgetMonthly: number;
  budgetUsed: number;
  lastUpdated: string;
  configuration: ConfigItem[];
  versions: VersionRecord[];
  activity: ActivityEntry[];
  changeLog: ChangeLogEntry[];
  experienceStats: {
    generated: number;
    validated: number;
    private: number;
    shared: number;
    updatesReceived: number;
    updatesApplied: number;
  };
  updateIds: string[];
}

function baseConfiguration(): ConfigItem[] {
  return [
    { id: "model-selection", label: "Model Selection", currentValue: "Primary Model — Claude Sonnet 5", customerCanView: true, customerCanModify: false, platformControlled: true, owner: "platform" },
    { id: "confidence-threshold", label: "Confidence Threshold", currentValue: "85%", customerCanView: true, customerCanModify: true, platformControlled: false, owner: "customer" },
    { id: "fallback-tool", label: "Fallback Tool", currentValue: "OCR Tool B", customerCanView: true, customerCanModify: false, platformControlled: true, owner: "platform" },
    { id: "monthly-budget", label: "Monthly Budget", currentValue: "$4,500", customerCanView: true, customerCanModify: true, platformControlled: false, owner: "ai-recommended" },
    { id: "safety-policy", label: "Safety Policy", currentValue: "Enterprise Policy", customerCanView: true, customerCanModify: false, platformControlled: true, owner: "platform" },
    { id: "experience-updates", label: "Experience Updates", currentValue: "Manual Approval", customerCanView: true, customerCanModify: true, platformControlled: false, owner: "platform" },
  ];
}

export const deployments: Deployment[] = [
  {
    id: "dep-1",
    workerId: "document-intelligence",
    customerId: "cust-a",
    version: "v2.4.1",
    environment: "Production",
    status: "Healthy",
    performanceProfile: "Standard",
    experienceSharing: "Shared Learnings Enabled",
    budgetMonthly: 4500,
    budgetUsed: 3120,
    lastUpdated: "2026-09-08T07:00:00Z",
    configuration: baseConfiguration(),
    versions: [
      { version: "v2.4.1", label: "Current", date: "2026-09-01", changeSummary: "Applied Enhanced Document Validation Pattern." },
      { version: "v2.4.0", label: "Previous", date: "2026-08-10", changeSummary: "Updated fallback tool strategy." },
      { version: "v2.3.5", label: "Rolled Back", date: "2026-07-15", changeSummary: "Rolled back after regression in extraction accuracy." },
    ],
    activity: [
      { id: "a1", date: "Today", time: "10:42 AM", description: "Customer changed confidence threshold.", actor: "Customer A" },
      { id: "a2", date: "Today", time: "10:43 AM", description: "Platform analyzed configuration impact.", actor: "AI" },
      { id: "a3", date: "Today", time: "10:44 AM", description: "Change requires platform approval.", actor: "System" },
      { id: "a4", date: "Yesterday", time: "3:10 PM", description: "Experience update v2.4.1 applied.", actor: "Platform Admin" },
    ],
    changeLog: [
      { id: "cl-1", setting: "Confidence Threshold", from: "85%", to: "78%", impactAnalysis: "May increase manual review cases.", status: "Requires Review" },
    ],
    experienceStats: { generated: 214, validated: 4, private: 6, shared: 4, updatesReceived: 2, updatesApplied: 1 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "document-intelligence" || u.targetWorkerId === "claims-processing").map((u) => u.id),
  },
  {
    id: "dep-2",
    workerId: "policy-validation",
    customerId: "cust-b",
    version: "v1.8.3",
    environment: "Production",
    status: "Healthy",
    performanceProfile: "Advanced",
    experienceSharing: "Private Learnings",
    budgetMonthly: 2000,
    budgetUsed: 1180,
    lastUpdated: "2026-09-07T12:00:00Z",
    configuration: baseConfiguration(),
    versions: [
      { version: "v1.8.3", label: "Current", date: "2026-08-28", changeSummary: "Adjusted exception handling for payment retries." },
      { version: "v1.8.2", label: "Previous", date: "2026-08-01", changeSummary: "Initial production rollout." },
    ],
    activity: [
      { id: "a1", date: "Yesterday", time: "9:15 AM", description: "Budget alert threshold reached 60%.", actor: "System" },
      { id: "a2", date: "3 days ago", time: "2:00 PM", description: "Deployment marked healthy after monitoring window.", actor: "AI" },
    ],
    changeLog: [],
    experienceStats: { generated: 96, validated: 2, private: 5, shared: 0, updatesReceived: 1, updatesApplied: 0 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "policy-validation").map((u) => u.id),
  },
  {
    id: "dep-3",
    workerId: "claims-processing",
    customerId: "cust-c",
    version: "v3.1.0",
    environment: "Staging",
    status: "Needs Attention",
    performanceProfile: "Custom",
    experienceSharing: "Learning Review Required",
    budgetMonthly: 1200,
    budgetUsed: 980,
    lastUpdated: "2026-09-05T09:00:00Z",
    configuration: baseConfiguration(),
    versions: [{ version: "v3.1.0", label: "Current", date: "2026-08-20", changeSummary: "Staging rollout for reconciliation workflow update." }],
    activity: [
      { id: "a1", date: "Today", time: "8:05 AM", description: "AI Sentinel flagged repeated reconciliation failures.", actor: "AI Sentinel" },
      { id: "a2", date: "3 days ago", time: "11:30 AM", description: "Deployment created in staging.", actor: "Platform Admin" },
    ],
    changeLog: [],
    experienceStats: { generated: 42, validated: 0, private: 3, shared: 0, updatesReceived: 1, updatesApplied: 0 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "claims-processing").map((u) => u.id),
  },
  {
    id: "dep-4",
    workerId: "underwriting",
    customerId: "cust-b",
    version: "v2.0.4",
    environment: "Production",
    status: "Healthy",
    performanceProfile: "Enterprise",
    experienceSharing: "Shared Learnings Enabled",
    budgetMonthly: 3200,
    budgetUsed: 2760,
    lastUpdated: "2026-09-06T15:20:00Z",
    configuration: baseConfiguration(),
    versions: [
      { version: "v2.0.4", label: "Current", date: "2026-08-22", changeSummary: "Applied tightened borderline risk routing threshold." },
      { version: "v2.0.3", label: "Previous", date: "2026-07-30", changeSummary: "Initial rollout." },
    ],
    activity: [{ id: "a1", date: "2 days ago", time: "1:00 PM", description: "Update applied — routing threshold tightened.", actor: "Platform Admin" }],
    changeLog: [],
    experienceStats: { generated: 128, validated: 2, private: 1, shared: 2, updatesReceived: 1, updatesApplied: 1 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "underwriting").map((u) => u.id),
  },
  {
    id: "dep-5",
    workerId: "fraud-investigation",
    customerId: "cust-d",
    version: "v1.6.5",
    environment: "Production",
    status: "Degraded",
    performanceProfile: "Standard",
    experienceSharing: "Private Learnings",
    budgetMonthly: 1800,
    budgetUsed: 1750,
    lastUpdated: "2026-09-08T05:00:00Z",
    configuration: baseConfiguration(),
    versions: [{ version: "v1.6.5", label: "Current", date: "2026-08-15", changeSummary: "Initial production rollout." }],
    activity: [{ id: "a1", date: "Today", time: "6:00 AM", description: "Budget usage exceeded 95% of monthly allocation.", actor: "System" }],
    changeLog: [],
    experienceStats: { generated: 18, validated: 0, private: 1, shared: 0, updatesReceived: 1, updatesApplied: 0 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "fraud-investigation").map((u) => u.id),
  },
  {
    id: "dep-6",
    workerId: "customer-service",
    customerId: "cust-a",
    version: "v2.0.3",
    environment: "Production",
    status: "Healthy",
    performanceProfile: "Standard",
    experienceSharing: "Shared Learnings Enabled",
    budgetMonthly: 1500,
    budgetUsed: 640,
    lastUpdated: "2026-09-04T10:00:00Z",
    configuration: baseConfiguration(),
    versions: [{ version: "v2.0.3", label: "Current", date: "2026-08-18", changeSummary: "Simplified customer verification prompt sequence." }],
    activity: [{ id: "a1", date: "4 days ago", time: "4:30 PM", description: "Experience update applied — verification prompt sequence.", actor: "Platform Admin" }],
    changeLog: [],
    experienceStats: { generated: 64, validated: 1, private: 2, shared: 1, updatesReceived: 1, updatesApplied: 1 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "customer-service").map((u) => u.id),
  },
  {
    id: "dep-7",
    workerId: "document-intelligence",
    customerId: "cust-c",
    version: "v2.4.0",
    environment: "Production",
    status: "Healthy",
    performanceProfile: "Advanced",
    experienceSharing: "Shared Learnings Enabled",
    budgetMonthly: 3800,
    budgetUsed: 2100,
    lastUpdated: "2026-09-02T08:00:00Z",
    configuration: baseConfiguration(),
    versions: [{ version: "v2.4.0", label: "Current", date: "2026-08-10", changeSummary: "Standard rollout." }],
    activity: [{ id: "a1", date: "6 days ago", time: "9:00 AM", description: "Deployment created.", actor: "Platform Admin" }],
    changeLog: [],
    experienceStats: { generated: 88, validated: 3, private: 2, shared: 3, updatesReceived: 2, updatesApplied: 0 },
    updateIds: updateRecommendations.filter((u) => u.targetWorkerId === "document-intelligence").map((u) => u.id),
  },
  {
    id: "dep-8",
    workerId: "policy-validation",
    customerId: "cust-d",
    version: "v1.8.3",
    environment: "Staging",
    status: "Provisioning",
    performanceProfile: "Starter",
    experienceSharing: "Learning Review Required",
    budgetMonthly: 900,
    budgetUsed: 0,
    lastUpdated: "2026-09-08T11:00:00Z",
    configuration: baseConfiguration(),
    versions: [{ version: "v1.8.3", label: "Current", date: "2026-09-08", changeSummary: "Deployment provisioning in progress." }],
    activity: [{ id: "a1", date: "Today", time: "11:00 AM", description: "Deployment package built, awaiting provisioning.", actor: "Platform Admin" }],
    changeLog: [],
    experienceStats: { generated: 0, validated: 0, private: 0, shared: 0, updatesReceived: 0, updatesApplied: 0 },
    updateIds: [],
  },
];

export function getDeployment(id: string) {
  return deployments.find((d) => d.id === id);
}

export function deploymentWorkerName(d: Deployment) {
  return hubWorker(d.workerId).name;
}
export function deploymentCustomerName(d: Deployment) {
  return deploymentCustomer(d.customerId).name;
}

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export const deploymentStats = {
  total: deployments.length,
  activeCustomers: new Set(deployments.map((d) => d.customerId)).size,
  withUpdatesAvailable: deployments.filter((d) => d.updateIds.length > 0).length,
  experienceSharingEnabled: deployments.filter((d) => d.experienceSharing === "Shared Learnings Enabled").length,
  needingAttention: deployments.filter((d) => d.status === "Needs Attention" || d.status === "Degraded").length,
};

export const performanceProfiles: Record<
  PerformanceProfile,
  { description: string; experienceAccess: string; optimizationPatterns: string; advancedStrategies: string }
> = {
  Starter: {
    description: "Uses the base worker configuration with foundational validated experience.",
    experienceAccess: "25% of the approved experience package",
    optimizationPatterns: "12 of 60",
    advancedStrategies: "Not included",
  },
  Standard: {
    description: "Uses a selected set of validated learning patterns.",
    experienceAccess: "70% of the approved experience package",
    optimizationPatterns: "42 of 60",
    advancedStrategies: "Limited",
  },
  Advanced: {
    description: "Includes more validated experiences, optimization strategies, and performance improvements.",
    experienceAccess: "90% of the approved experience package",
    optimizationPatterns: "54 of 60",
    advancedStrategies: "Included",
  },
  Enterprise: {
    description: "Includes the complete approved experience package and advanced optimization.",
    experienceAccess: "100% of the approved experience package",
    optimizationPatterns: "60 of 60",
    advancedStrategies: "Full access",
  },
  Custom: {
    description: "Administrator manually configures the experience access level.",
    experienceAccess: "Configured manually",
    optimizationPatterns: "Configured manually",
    advancedStrategies: "Configured manually",
  },
};

export { hubWorkers };
