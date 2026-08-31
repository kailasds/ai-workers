import type { AIWorker, AuditEvent, WorkTask } from "./types";

const legacyModernizationEngineer: AIWorker = {
  id: "legacy-modernization-engineer",
  name: "Legacy Modernization Engineer",
  role: "Software Engineering",
  department: "Engineering Transformation",
  status: "working",
  statusLabel: "Working",
  version: "v2.4",
  mission:
    "Modernize legacy enterprise applications into Java while preserving business functionality and following enterprise architecture, coding, security, and compliance standards.",
  avatarInitials: "LM",
  accentColor: "blue",
  currentTask: "Modernizing ClaimsService.cbl",
  currentStage: "Business Logic Extraction",
  progress: 62,
  performance: 97,
  costPerTask: 37,
  activeTasks: 3,
  responsibilities: [
    "Analyze legacy COBOL and mainframe source for modernization scope",
    "Extract and preserve business logic during transformation",
    "Generate modern Java implementations against enterprise standards",
    "Coordinate the specialized agent team through each migration stage",
    "Produce test coverage sufficient to validate functional parity",
    "Flag architecture or policy conflicts for human review",
    "Document generated code and migration decisions",
    "Escalate ambiguous business rules rather than guessing",
  ],
  skills: [
    { id: "sk-1", name: "Legacy Code Analysis", level: "Expert", scope: "COBOL, PL/I, JCL across mainframe estates", usedByAgents: ["Code Analysis Agent"], usageCount: 412 },
    { id: "sk-2", name: "COBOL Understanding", level: "Expert", scope: "Copybooks, batch jobs, CICS transactions", usedByAgents: ["Code Analysis Agent", "Business Logic Agent"], usageCount: 388 },
    { id: "sk-3", name: "Java Development", level: "Advanced", scope: "Java 17+, Spring Boot, enterprise patterns", usedByAgents: ["Migration Agent"], usageCount: 340 },
    { id: "sk-4", name: "Architecture Analysis", level: "Advanced", scope: "Dependency mapping, pattern recommendation", usedByAgents: ["Architecture Agent"], usageCount: 226 },
    { id: "sk-5", name: "Code Transformation", level: "Advanced", scope: "AST-level rule-driven transpilation", restrictions: "No transformation without validated business rule mapping", usedByAgents: ["Migration Agent"], usageCount: 301 },
    { id: "sk-6", name: "Test Generation", level: "Advanced", scope: "JUnit 5, integration test scaffolding", usedByAgents: ["Testing Agent"], usageCount: 279 },
    { id: "sk-7", name: "Debugging", level: "Intermediate", scope: "Build failure and regression triage", usedByAgents: ["Migration Agent", "Testing Agent"], usageCount: 154 },
    { id: "sk-8", name: "Documentation", level: "Intermediate", scope: "Migration notes, ADRs, API docs", usedByAgents: ["Documentation Agent"], usageCount: 198 },
  ],
  knowledge: [
    { id: "kn-1", name: "Enterprise Architecture Guidelines", type: "Guideline", version: "4.2", status: "Active", lastUpdated: "2026-07-14", usageCount: 89, detail: "Reference architecture patterns and layering rules for Java services." },
    { id: "kn-2", name: "Java Coding Standards", type: "Standard", version: "6.0", status: "Active", lastUpdated: "2026-06-02", usageCount: 214, detail: "Naming, structure, and null-safety conventions enforced at generation time." },
    { id: "kn-3", name: "Legacy Modernization Playbook", type: "Playbook", status: "Active", lastUpdated: "2026-05-21", usageCount: 176, detail: "Stepwise transformation approach for common COBOL patterns." },
    { id: "kn-4", name: "Historical Migration Decisions", type: "Historical Record", status: "Connected", lastUpdated: "2026-08-11", usageCount: 2480, detail: "2,480 prior architecture and transformation decisions with outcomes." },
    { id: "kn-5", name: "Data Privacy Policy", type: "Standard", version: "3.1", status: "Active", lastUpdated: "2026-04-09", usageCount: 61 },
    { id: "kn-6", name: "Security Architecture Guidelines", type: "Guideline", version: "2.0", status: "Stale", lastUpdated: "2025-11-30", usageCount: 12, detail: "Superseded by v2.3 — not yet connected to this worker." },
  ],
  agents: [
    { id: "ag-1", name: "Code Analysis Agent", purpose: "Parse and inventory legacy source for modernization scope.", capabilities: ["Module inventory", "Copybook resolution", "Complexity scoring"], restrictions: ["Read-only repository access"], status: "completed", usageCount: 412, performance: 98, costPerRun: 3.2 },
    { id: "ag-2", name: "Architecture Agent", purpose: "Analyze current and target architecture and recommend patterns.", capabilities: ["Dependency analysis", "Architecture mapping", "Pattern recommendation"], restrictions: ["Cannot modify production infrastructure"], status: "completed", usageCount: 226, performance: 96, costPerRun: 4.8 },
    { id: "ag-3", name: "Business Logic Agent", purpose: "Extract and formalize business rules embedded in legacy code.", capabilities: ["Transaction rule extraction", "Rule-to-spec mapping", "Ambiguity flagging"], restrictions: ["Escalates on conflicting rule interpretations"], status: "running", usageCount: 388, performance: 94, costPerRun: 6.1 },
    { id: "ag-4", name: "Migration Agent", purpose: "Generate modern Java implementations from extracted logic.", capabilities: ["Code generation", "Framework scaffolding", "Build validation"], restrictions: ["Cannot merge to production branches"], status: "waiting", usageCount: 340, performance: 95, costPerRun: 8.4 },
    { id: "ag-5", name: "Testing Agent", purpose: "Generate and execute unit and integration tests.", capabilities: ["Test generation", "Coverage analysis", "Regression detection"], restrictions: ["Cannot run against production data"], status: "waiting", usageCount: 279, performance: 97, costPerRun: 5.0 },
    { id: "ag-6", name: "Security Agent", purpose: "Run security scans and enforce data handling policy.", capabilities: ["SAST scanning", "Dependency vulnerability checks", "Data policy enforcement"], restrictions: ["Cannot bypass security controls", "Blocks external API calls to unapproved hosts"], status: "waiting", usageCount: 231, performance: 99, costPerRun: 3.6 },
    { id: "ag-7", name: "Documentation Agent", purpose: "Produce migration documentation and architecture decision records.", capabilities: ["ADR generation", "API documentation", "Migration notes"], restrictions: [], status: "waiting", usageCount: 198, performance: 93, costPerRun: 2.1 },
    { id: "ag-8", name: "Code Review Agent", purpose: "Perform automated review against enterprise coding standards.", capabilities: ["Style enforcement", "Pattern conformance", "PR annotation"], restrictions: ["Cannot approve its own generated PRs"], status: "idle", usageCount: 167, performance: 96, costPerRun: 1.9 },
  ],
  tools: [
    { id: "tl-1", name: "GitHub", category: "Source Control", connected: true, permissions: ["READ", "WRITE", "CREATE PR"] },
    { id: "tl-2", name: "Jira", category: "Project Tracking", connected: true, permissions: ["READ", "WRITE"] },
    { id: "tl-3", name: "Enterprise Knowledge Base", category: "Knowledge", connected: true, permissions: ["READ"] },
    { id: "tl-4", name: "Coding Worker", category: "AI Worker", connected: true, permissions: ["EXECUTE"] },
    { id: "tl-5", name: "CI/CD Pipeline", category: "Infrastructure", connected: true, permissions: ["RUN PIPELINE"], restriction: "No production deployment" },
    { id: "tl-6", name: "SonarQube", category: "Code Quality", connected: true, permissions: ["RUN SCAN", "READ"] },
    { id: "tl-7", name: "Test Infrastructure", category: "Testing", connected: true, permissions: ["EXECUTE", "READ"] },
  ],
  policies: [
    { id: "pl-1", name: "Enterprise Security Policy", scope: "Organization", status: "Enforced", appliesTo: "All AI Workers", version: "5.1", lastUpdated: "2026-07-01" },
    { id: "pl-2", name: "Data Privacy Policy", scope: "Organization", status: "Enforced", appliesTo: "Workers handling customer information", version: "3.1", lastUpdated: "2026-04-09" },
    { id: "pl-3", name: "Java Coding Standards", scope: "Worker-Specific", status: "Enforced", version: "6.0", lastUpdated: "2026-06-02" },
    { id: "pl-4", name: "Architecture Guidelines", scope: "Worker-Specific", status: "Enforced", version: "4.2", lastUpdated: "2026-07-14" },
    { id: "pl-5", name: "Production Access Restriction", scope: "Organization", status: "Enforced", appliesTo: "Engineering Workers", version: "2.0", lastUpdated: "2026-03-18" },
  ],
  budget: {
    monthly: 5000,
    used: 3240,
    projected: 4120,
    perTaskLimit: 50,
    approvalThreshold: 100,
    breakdown: [
      { label: "Model Usage", amount: 1420 },
      { label: "Agents", amount: 830 },
      { label: "Tools", amount: 620 },
      { label: "Infrastructure", amount: 370 },
    ],
  },
  kpis: [
    { id: "kpi-1", label: "Completion Rate", value: 97, unit: "%", target: 95, targetDirection: "max", trend: [91, 93, 94, 95, 96, 96, 97] },
    { id: "kpi-2", label: "Human Intervention", value: 11, unit: "%", target: 15, targetDirection: "min", trend: [16, 15, 14, 13, 12, 12, 11] },
    { id: "kpi-3", label: "Avg. Turnaround", value: 6.4, unit: "hrs", target: 8, targetDirection: "min", trend: [8.1, 7.8, 7.2, 6.9, 6.7, 6.5, 6.4] },
    { id: "kpi-4", label: "Defect Rate", value: 1.8, unit: "%", target: 3, targetDirection: "min", trend: [2.6, 2.4, 2.2, 2.1, 1.9, 1.9, 1.8] },
    { id: "kpi-5", label: "Cost Per Task", value: 37, unit: "$", target: 50, targetDirection: "min", trend: [44, 42, 41, 39, 38, 38, 37] },
  ],
  completionContract: [
    { id: "cc-1", order: 1, label: "Legacy source analyzed", required: true, status: "complete", validationType: "Automated scan", responsibleAgent: "Code Analysis Agent", evidenceRequirement: "Module inventory report", humanApproval: false },
    { id: "cc-2", order: 2, label: "Business logic mapped", required: true, status: "complete", validationType: "Rule extraction review", responsibleAgent: "Business Logic Agent", evidenceRequirement: "Rule-to-spec mapping document", humanApproval: false },
    { id: "cc-3", order: 3, label: "Modern Java code generated", required: true, status: "in-progress", validationType: "Generation checkpoint", responsibleAgent: "Migration Agent", evidenceRequirement: "Generated source diff", humanApproval: false },
    { id: "cc-4", order: 4, label: "Application builds successfully", required: true, status: "pending", validationType: "Build pipeline", responsibleAgent: "Migration Agent", evidenceRequirement: "CI build log", humanApproval: false },
    { id: "cc-5", order: 5, label: "Unit tests generated", required: true, status: "pending", validationType: "Coverage scaffold", responsibleAgent: "Testing Agent", evidenceRequirement: "Test suite manifest", humanApproval: false },
    { id: "cc-6", order: 6, label: "Test coverage threshold reached", required: true, status: "pending", validationType: "Coverage report ≥ 85%", responsibleAgent: "Testing Agent", evidenceRequirement: "Coverage report", humanApproval: false },
    { id: "cc-7", order: 7, label: "Security validation passed", required: true, status: "pending", validationType: "SAST + dependency scan", responsibleAgent: "Security Agent", evidenceRequirement: "SonarQube scan result", humanApproval: false },
    { id: "cc-8", order: 8, label: "Architecture validation passed", required: true, status: "pending", validationType: "Pattern conformance check", responsibleAgent: "Architecture Agent", evidenceRequirement: "Conformance report", humanApproval: false },
    { id: "cc-9", order: 9, label: "Documentation generated", required: true, status: "pending", validationType: "Completeness check", responsibleAgent: "Documentation Agent", evidenceRequirement: "ADR + migration notes", humanApproval: false },
    { id: "cc-10", order: 10, label: "Human approval completed", required: true, status: "pending", validationType: "Manual review", responsibleAgent: "—", evidenceRequirement: "Approval record", humanApproval: true },
  ],
  authority: {
    allowed: ["Read repositories", "Create branches", "Modify code", "Run tests", "Create pull requests"],
    forbidden: ["Merge to production", "Access restricted data", "Modify production infrastructure", "Bypass security controls"],
  },
  escalationRules: [
    "Business logic is ambiguous",
    "Policy conflict is detected",
    "Security violation is detected",
    "Budget exceeds threshold",
    "Tests repeatedly fail",
  ],
  tasks: [
    { id: "tk-1", workerId: "legacy-modernization-engineer", title: "Modernize ClaimsService.cbl", status: "running", progress: 62, currentStage: "Business Logic Extraction", startedAt: "2026-08-31T08:12:00Z", cost: 23.8, budget: 50 },
    { id: "tk-2", workerId: "legacy-modernization-engineer", title: "Modernize PaymentEngine.cbl", status: "completed", progress: 100, currentStage: "Complete", startedAt: "2026-08-30T09:00:00Z", completedAt: "2026-08-31T02:14:00Z", cost: 41.2, budget: 50 },
    { id: "tk-3", workerId: "legacy-modernization-engineer", title: "LegacyCustomerSystem.cbl", status: "awaiting-approval", progress: 88, currentStage: "Architecture Review", startedAt: "2026-08-29T14:20:00Z", cost: 46.5, budget: 50 },
    { id: "tk-4", workerId: "legacy-modernization-engineer", title: "Modernize PolicyRatingEngine.cbl", status: "scheduled", progress: 0, currentStage: "Queued", startedAt: "2026-09-01T09:00:00Z", cost: 0, budget: 50 },
    { id: "tk-5", workerId: "legacy-modernization-engineer", title: "Modernize BatchSettlementJob.jcl", status: "failed", progress: 34, currentStage: "Build Validation", startedAt: "2026-08-27T11:05:00Z", cost: 18.9, budget: 50 },
  ],
  auditTrail: [
    { id: "au-1", timestamp: "2026-08-31T08:12:04Z", actor: "System", action: "Worker received modernization task: ClaimsService.cbl", outcome: "info" },
    { id: "au-2", timestamp: "2026-08-31T08:14:22Z", actor: "Code Analysis Agent", action: "Accessed repository claims-platform/legacy", policy: "Repository Access Policy", outcome: "allowed" },
    { id: "au-3", timestamp: "2026-08-31T08:37:51Z", actor: "Code Analysis Agent", action: "Identified 24 modules across 3 copybooks", outcome: "info" },
    { id: "au-4", timestamp: "2026-08-31T09:42:10Z", actor: "Architecture Agent", action: "Created architecture decision: Enterprise Java Pattern B", policy: "Enterprise Architecture Policy", outcome: "allowed" },
    { id: "au-5", timestamp: "2026-08-31T09:48:33Z", actor: "Security Agent", action: "Blocked outbound call to unapproved host api.external-vendor.net", policy: "Data Security Policy", outcome: "blocked" },
    { id: "au-6", timestamp: "2026-08-31T10:02:15Z", actor: "Business Logic Agent", action: "Began extracting transaction rules from ClaimsService.cbl", outcome: "info" },
  ],
  learning: [
    { id: "lc-1", title: "Reliable pattern for CICS transaction modernization", description: "The worker discovered a reliable way to modernize a specific COBOL CICS transaction pattern into idiomatic Spring Boot controllers.", evidenceCount: 24, successRate: 98, status: "pending-review", date: "2026-08-29" },
    { id: "lc-2", title: "Copybook-to-DTO mapping shortcut", description: "A consistent mapping from nested copybook redefinitions to flattened Java DTOs, validated across claims and policy modules.", evidenceCount: 31, successRate: 96, status: "promoted", date: "2026-08-12" },
    { id: "lc-3", title: "Batch job checkpoint restart pattern", description: "Proposed pattern for resumable batch jobs was rejected — didn't generalize to settlement jobs with external callouts.", evidenceCount: 9, successRate: 61, status: "rejected", date: "2026-07-30" },
  ],
  versionHistory: [
    { version: "v2.1", label: "Added architecture knowledge", date: "2026-05-02" },
    { version: "v2.2", label: "Improved dependency analysis", date: "2026-06-14" },
    { version: "v2.3", label: "Updated testing strategy", date: "2026-07-20" },
    { version: "v2.4", label: "Current version", date: "2026-08-11", current: true },
  ],
};

const underwritingSpecialist: AIWorker = {
  id: "underwriting-specialist",
  name: "Underwriting Specialist",
  role: "Risk Assessment",
  department: "Insurance",
  status: "review",
  statusLabel: "Awaiting Human Review",
  version: "v1.8",
  mission: "Evaluate commercial policy applications against underwriting guidelines and flag high-risk exceptions for review.",
  avatarInitials: "US",
  accentColor: "amber",
  currentTask: "Reviewing Policy #4582",
  currentStage: "Conflict Resolution",
  progress: 74,
  performance: 94,
  costPerTask: 24,
  activeTasks: 2,
  responsibilities: ["Score incoming applications against risk models", "Detect conflicting underwriting policies", "Route high-risk decisions to human underwriters"],
  skills: [],
  knowledge: [],
  agents: [],
  tools: [],
  policies: [],
  budget: { monthly: 3000, used: 1780, projected: 2600, perTaskLimit: 35, approvalThreshold: 75, breakdown: [] },
  kpis: [],
  completionContract: [],
  authority: { allowed: [], forbidden: [] },
  escalationRules: [],
  tasks: [
    { id: "tk-us-1", workerId: "underwriting-specialist", title: "Review Policy #4582", status: "awaiting-approval", progress: 74, currentStage: "Conflict Resolution", startedAt: "2026-08-31T07:40:00Z", cost: 19.4, budget: 35 },
  ],
  auditTrail: [],
  learning: [],
  versionHistory: [],
};

const claimsInvestigationWorker: AIWorker = {
  id: "claims-investigation-worker",
  name: "Claims Investigation Worker",
  role: "Fraud & Claims Analysis",
  department: "Claims",
  status: "working",
  statusLabel: "Working",
  version: "v3.0",
  mission: "Investigate flagged claims for inconsistencies, cross-reference evidence, and produce investigation reports.",
  avatarInitials: "CI",
  accentColor: "blue",
  currentTask: "Investigating Claim #CX-102",
  currentStage: "Evidence Analysis",
  progress: 45,
  performance: 96,
  costPerTask: 31,
  activeTasks: 4,
  responsibilities: ["Cross-reference claim data against policy history", "Analyze submitted evidence for inconsistency", "Draft investigation findings for adjuster review"],
  skills: [],
  knowledge: [],
  agents: [],
  tools: [],
  policies: [],
  budget: { monthly: 4200, used: 3570, projected: 4550, perTaskLimit: 40, approvalThreshold: 90, breakdown: [] },
  kpis: [],
  completionContract: [],
  authority: { allowed: [], forbidden: [] },
  escalationRules: [],
  tasks: [
    { id: "tk-ci-1", workerId: "claims-investigation-worker", title: "Investigate Claim #CX-102", status: "running", progress: 45, currentStage: "Evidence Analysis", startedAt: "2026-08-31T06:55:00Z", cost: 14.1, budget: 40 },
  ],
  auditTrail: [],
  learning: [],
  versionHistory: [],
};

const financialReportingWorker: AIWorker = {
  id: "financial-reporting-worker",
  name: "Financial Reporting Worker",
  role: "Financial Analysis",
  department: "Finance",
  status: "completed",
  statusLabel: "Completed",
  version: "v1.5",
  mission: "Generate variance reports and quarterly financial summaries from ERP data feeds.",
  avatarInitials: "FR",
  accentColor: "green",
  currentTask: "Generated Q2 variance report",
  progress: 100,
  performance: 99,
  costPerTask: 18,
  activeTasks: 0,
  responsibilities: ["Reconcile ERP feeds against budget", "Generate variance narratives", "Distribute reports to finance stakeholders"],
  skills: [],
  knowledge: [],
  agents: [],
  tools: [],
  policies: [],
  budget: { monthly: 1800, used: 640, projected: 900, perTaskLimit: 25, approvalThreshold: 60, breakdown: [] },
  kpis: [],
  completionContract: [],
  authority: { allowed: [], forbidden: [] },
  escalationRules: [],
  tasks: [
    { id: "tk-fr-1", workerId: "financial-reporting-worker", title: "Generate Q2 variance report", status: "completed", progress: 100, currentStage: "Complete", startedAt: "2026-08-30T05:00:00Z", completedAt: "2026-08-31T04:10:00Z", cost: 17.6, budget: 25 },
  ],
  auditTrail: [],
  learning: [],
  versionHistory: [],
};

function stubWorker(
  id: string,
  name: string,
  role: string,
  department: string,
  status: AIWorker["status"],
  statusLabel: string,
  accentColor: AIWorker["accentColor"],
  performance: number,
  costPerTask: number,
  activeTasks: number,
  currentTask?: string
): AIWorker {
  return {
    id,
    name,
    role,
    department,
    status,
    statusLabel,
    version: "v1.0",
    mission: `${role} operations for ${department}.`,
    avatarInitials: name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join(""),
    accentColor,
    currentTask,
    performance,
    costPerTask,
    activeTasks,
    responsibilities: [],
    skills: [],
    knowledge: [],
    agents: [],
    tools: [],
    policies: [],
    budget: { monthly: 2000, used: 900, projected: 1500, perTaskLimit: 30, approvalThreshold: 60, breakdown: [] },
    kpis: [],
    completionContract: [],
    authority: { allowed: [], forbidden: [] },
    escalationRules: [],
    tasks: [],
    auditTrail: [],
    learning: [],
    versionHistory: [],
  };
}

export const workers: AIWorker[] = [
  legacyModernizationEngineer,
  underwritingSpecialist,
  claimsInvestigationWorker,
  financialReportingWorker,
  stubWorker("contract-review-analyst", "Contract Review Analyst", "Legal Operations", "Legal", "active", "Active", "blue", 95, 22, 2, "Reviewing MSA #7741"),
  stubWorker("customer-support-triage", "Customer Support Triage", "Support Operations", "Customer Success", "active", "Active", "green", 92, 9, 6, "Triaging inbound tickets"),
  stubWorker("vendor-onboarding-worker", "Vendor Onboarding Worker", "Procurement", "Procurement", "paused", "Paused", "neutral", 90, 15, 0),
  stubWorker("data-quality-auditor", "Data Quality Auditor", "Data Governance", "Data Platform", "active", "Active", "purple", 93, 12, 3, "Auditing customer master data"),
  stubWorker("hr-policy-assistant", "HR Policy Assistant", "People Operations", "Human Resources", "active", "Active", "blue", 91, 7, 1, "Answering policy queries"),
  stubWorker("code-security-reviewer", "Code Security Reviewer", "AppSec", "Engineering Transformation", "blocked", "Blocked", "red", 88, 19, 0),
  stubWorker("inventory-forecast-worker", "Inventory Forecast Worker", "Supply Chain", "Operations", "active", "Active", "green", 96, 11, 2, "Forecasting Q4 demand"),
  stubWorker("regulatory-filing-assistant", "Regulatory Filing Assistant", "Compliance", "Legal", "review", "Awaiting Human Review", "amber", 94, 28, 1, "Preparing 10-Q disclosures"),
];

export const orgMetrics = {
  activeWorkers: 12,
  runningWork: 38,
  requiresAttention: 4,
  escalations: 2,
  monthlySpend: 2840,
  monthlyBudget: 5071,
};

export const attentionItems = [
  { id: "at-1", type: "Policy Conflict", worker: "Legacy Modernization Engineer", detail: "Architecture policy conflict detected.", severity: "amber" as const },
  { id: "at-2", type: "Budget Threshold", worker: "Claims Investigation Worker", detail: "85% of monthly budget used.", severity: "amber" as const },
  { id: "at-3", type: "Approval Required", worker: "Underwriting Specialist", detail: "High-risk decision awaiting sign-off.", severity: "red" as const },
  { id: "at-4", type: "Escalation", worker: "Code Security Reviewer", detail: "Blocked by unresolved permission request.", severity: "red" as const },
];

export const allTasks: WorkTask[] = workers.flatMap((w) => w.tasks);

export const globalAuditFeed: AuditEvent[] = [
  ...legacyModernizationEngineer.auditTrail,
  { id: "au-g1", timestamp: "2026-08-31T07:41:02Z", actor: "Underwriting Specialist", action: "Escalated Policy #4582 for conflicting guideline match", policy: "Underwriting Escalation Policy", outcome: "info" },
  { id: "au-g2", timestamp: "2026-08-31T06:58:40Z", actor: "Claims Investigation Worker", action: "Accessed claims history for CX-102", policy: "Data Access Policy", outcome: "allowed" },
];

export function getWorker(id: string): AIWorker | undefined {
  return workers.find((w) => w.id === id);
}

export interface Approval {
  id: string;
  type: string;
  workerId: string;
  workerName: string;
  summary: string;
  aiRecommendation: string;
  evidence: string[];
  policy: string;
  risk: "Low" | "Medium" | "High";
  impact: string;
  alternatives: string[];
  requestedAt: string;
}

export const approvals: Approval[] = [
  {
    id: "ap-1",
    type: "Architecture Decision",
    workerId: "legacy-modernization-engineer",
    workerName: "Legacy Modernization Engineer",
    summary: "Two valid architecture patterns identified for ClaimsService.cbl.",
    aiRecommendation: "Proceed with Enterprise Java Pattern B — matches 3 of 3 evidence sources and one prior approved migration.",
    evidence: [
      "Legacy transaction structure matches Pattern B (ClaimsService.cbl)",
      "Enterprise Architecture Guideline v4.2 recommends Pattern B",
      "Pattern B used successfully in Claims Platform Modernization",
    ],
    policy: "Enterprise Architecture Policy",
    risk: "Medium",
    impact: "Affects 6 downstream services consuming ClaimsService transactions.",
    alternatives: ["Enterprise Java Pattern A — lower complexity, weaker fit to existing transaction boundaries."],
    requestedAt: "2026-08-31T09:42:00Z",
  },
  {
    id: "ap-2",
    type: "Budget Increase",
    workerId: "claims-investigation-worker",
    workerName: "Claims Investigation Worker",
    summary: "Monthly budget threshold exceeded — 85% of $4,200 used with 9 days remaining in the cycle.",
    aiRecommendation: "Approve a $600 increase — current investigation volume is 22% above forecast, not runaway spend.",
    evidence: [
      "34 investigations opened this cycle vs. 28 forecast",
      "Cost per investigation ($31) is within the $40 target",
    ],
    policy: "Budget Approval Policy",
    risk: "Low",
    impact: "Extends runway through end of cycle without pausing active investigations.",
    alternatives: ["Pause new investigations until next cycle — would delay 6 pending claims reviews."],
    requestedAt: "2026-08-31T07:15:00Z",
  },
  {
    id: "ap-3",
    type: "Policy Exception",
    workerId: "underwriting-specialist",
    workerName: "Underwriting Specialist",
    summary: "High-risk decision on Policy #4582 conflicts with standard underwriting guideline.",
    aiRecommendation: "Route to senior underwriter — the applicant profile falls outside the automated approval band by a narrow margin.",
    evidence: [
      "Risk score 72 falls just above the 70 automated-approval ceiling",
      "Conflicting guideline match: commercial vs. mixed-use classification",
    ],
    policy: "Underwriting Escalation Policy",
    risk: "High",
    impact: "Delays binding by up to 2 business days pending manual review.",
    alternatives: ["Auto-decline pending clarification — would likely require reprocessing if classification is resolved."],
    requestedAt: "2026-08-31T07:41:00Z",
  },
];
