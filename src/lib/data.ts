import type { AIWorker, ExecutionEvent, WorkHistoryItem } from "./types";
import { workerStatusLabel } from "./status";

const cobolModernizationWorker: AIWorker = {
  id: "cobol-modernization-worker",
  name: "COBOL Modernization Worker",
  role: "Legacy Modernization Engineer",
  purpose:
    "Modernize legacy COBOL systems into Java while preserving business behavior, data integrity, integration contracts and compliance obligations.",
  owner: "Application Modernization",
  department: "Engineering Transformation",
  domain: "Legacy Modernization",
  status: "review",
  statusLabel: workerStatusLabel.review,
  autonomy: "guarded",
  operatingMode: "act-with-approval",
  version: "v2.4",
  avatarInitials: "CM",
  accentColor: "blue",
  sentinel: "intervention-required",

  identity: {
    workerId: "wkr-cobol-mod-0142",
    environment: "Sandbox · us-east-1",
    tenant: "Meridian Capital / Claims Platform",
    createdAt: "2026-03-02",
    credentialStatus: "Active",
  },

  modelConfig: {
    routingMode: "fixed",
    primaryModel: "Claude Sonnet 5",
    verifierModel: "Claude Opus 5 (independent)",
    fallbackModel: "Claude Haiku 4.5",
    monthlyBudgetEstimate: 1420,
  },

  learningConfig: {
    memoryScope: "worker",
    retentionDays: 30,
    sharedLearning: "none",
    useApprovedFeedback: true,
    sharedLearningApproved: false,
  },

  deployment: {
    runtime: "Agent Runtime v3 (containerized)",
    architecture: "x86_64",
    workerProfile: "Standard — bounded transformation worker",
    sizeProfile: "Medium (4 vCPU / 8GB)",
    deliveryTarget: "local-bundle",
    deploymentMethod: "Sandbox provisioning, promoted via pipeline after review",
  },

  scope: {
    primaryPurpose:
      "Modernize legacy COBOL systems into Java while preserving business behavior, data integrity, integration contracts and compliance obligations.",
    boundedScope: "A single COBOL batch or online unit, rebuilt in Java with functional equivalence proven.",
    expectedOutcome: "A Java implementation certified functionally equivalent to its COBOL source, with evidence attached.",
    acceptedInputBoundary:
      "Approved COBOL BusinessWorks source artifacts, JCL, copybooks and associated documentation from the assigned application boundary only.",
    outOfScope: [
      "Production cutover",
      "Changes to approved business rules",
      "Work outside the assigned application boundary",
    ],
  },

  responsibility: {
    primary: "Own the modernization of bounded legacy application units from COBOL to Java.",
    inputs: ["COBOL source", "JCL", "Copybooks", "VSAM / DB2 structures", "Business rules", "Integration dependencies"],
    expectedOutputs: ["Java implementation", "Architecture documentation", "Test suite", "Validation evidence", "Migration artifacts"],
    boundaries: [
      "No production cutover authority",
      "No direct production modification",
      "Cannot change approved business rules",
      "Cannot exceed assigned application scope",
    ],
  },

  skills: [
    { id: "sk-1", name: "Legacy Code Comprehension", description: "Parses COBOL, JCL and copybooks into a structured module inventory.", version: "3.2", status: "Active", evalStatus: "Passed", linkedTools: ["Code Analysis Tool", "Repository Access"], linkedSpecs: ["Legacy Ingestion Spec"] },
    { id: "sk-2", name: "Business Rule Extraction", description: "Extracts and formalizes business rules embedded in procedural logic.", version: "2.8", status: "Active", evalStatus: "Passed", linkedTools: ["Code Analysis Tool"], linkedSpecs: ["Rule Extraction Spec"] },
    { id: "sk-3", name: "Target Architecture Design", description: "Proposes a target Java architecture consistent with enterprise patterns.", version: "2.1", status: "Active", evalStatus: "Passed", linkedTools: ["Documentation System"], linkedSpecs: ["Architecture Spec"] },
    { id: "sk-4", name: "Java Code Generation", description: "Generates idiomatic Java implementations from the target design.", version: "3.0", status: "Active", evalStatus: "Passed", linkedTools: ["Java Build System", "Sandbox"], linkedSpecs: ["Codegen Spec"] },
    { id: "sk-5", name: "Data Structure Conversion", description: "Converts VSAM / DB2 record layouts to the target data model.", version: "1.9", status: "Active", evalStatus: "Needs Review", linkedTools: ["Static Analysis"], linkedSpecs: ["Data Mapping Spec"] },
    { id: "sk-6", name: "Integration Mapping", description: "Maps upstream and downstream integration contracts to their Java equivalents.", version: "2.0", status: "Active", evalStatus: "Passed", linkedTools: ["MCP Tools"], linkedSpecs: ["Integration Spec"] },
    { id: "sk-7", name: "Behavioral Reconciliation", description: "Replays representative workloads and reconciles source vs. target output.", version: "2.4", status: "Active", evalStatus: "Passed", linkedTools: ["Test Environment", "Sandbox"], linkedSpecs: ["Reconciliation Spec"] },
    { id: "sk-8", name: "Independent Verification", description: "Runs an independent pass to validate parity and compliance before handoff.", version: "1.6", status: "Active", evalStatus: "Not Evaluated", linkedTools: ["Static Analysis", "Test Environment"], linkedSpecs: ["Verification Spec"] },
  ],

  agentMesh: [
    { id: "ag-orch", name: "Orchestrator", role: "Owns the modernization unit end-to-end", isOrchestrator: true, status: "running", description: "Plans, sequences and supervises the specialist agents against the SPEC & Contract." },
    { id: "ag-1", name: "Legacy Comprehension", role: "Parses COBOL, JCL and copybooks", status: "completed", description: "Builds the structured module inventory the rest of the mesh works from." },
    { id: "ag-2", name: "Target Design", role: "Defines the target architecture and contracts", status: "completed", description: "Produces the Java target architecture and integration contracts." },
    { id: "ag-3", name: "Reconstitution", role: "Generates Java implementation", status: "running", description: "Generates the Java implementation against the target design." },
    { id: "ag-4", name: "Data Structures", role: "Converts VSAM / DB2 structures", status: "waiting", description: "Converts legacy record layouts to the target data model." },
    { id: "ag-5", name: "Transformation Fidelity", role: "Ensures business behavior is preserved", status: "waiting", description: "Cross-checks generated code against extracted business rules." },
    { id: "ag-6", name: "Reconciliation", role: "Replays and compares outputs", status: "waiting", description: "Replays representative workloads and reconciles source vs. target." },
    { id: "ag-7", name: "Verification", role: "Independently validates parity and compliance", status: "idle", description: "Final independent check before the Definition of Done is evaluated." },
  ],

  tools: [
    { id: "tl-1", name: "Repository Access", category: "Source Control", connected: true, permissions: ["Read", "Write"] },
    { id: "tl-2", name: "Code Analysis Tool", category: "Analysis", connected: true, permissions: ["Read", "Execute"] },
    { id: "tl-3", name: "Java Build System", category: "Build", connected: true, permissions: ["Execute"] },
    { id: "tl-4", name: "Test Environment", category: "Testing", connected: true, permissions: ["Read", "Execute"] },
    { id: "tl-5", name: "Documentation System", category: "Knowledge", connected: true, permissions: ["Read", "Write"] },
    { id: "tl-6", name: "Static Analysis", category: "Code Quality", connected: true, permissions: ["Read", "Execute"] },
    { id: "tl-7", name: "Sandbox", category: "Runtime", connected: true, permissions: ["Read", "Write", "Execute"] },
    { id: "tl-8", name: "GitHub / GitLab", category: "Source Control", connected: true, permissions: ["Read", "Write"], restriction: "Pull request only — no direct merge" },
    { id: "tl-9", name: "MCP Tools", category: "Integration", connected: true, permissions: ["Read"] },
  ],

  governance: {
    accessScope: ["Read-only access to legacy artifacts", "Write access limited to target branches", "No production access", "Sandbox validation only"],
    environmentPermissions: ["Sandbox: Read / Write / Execute", "Staging: Read only", "Production: No access"],
    leastPrivilegeRules: ["Credentials scoped to the assigned repository only", "No cross-tenant data access", "Time-boxed sandbox credentials, rotated every 24 hours"],
    policies: [
      { id: "pl-1", name: "Production Access", statusLabel: "Restricted", tone: "red" },
      { id: "pl-2", name: "Sensitive Data Access", statusLabel: "Masked", tone: "amber" },
      { id: "pl-3", name: "External System Writes", statusLabel: "Approval Required", tone: "amber" },
      { id: "pl-4", name: "Code Merge", statusLabel: "Pull Request Only", tone: "neutral" },
      { id: "pl-5", name: "Production Deployment", statusLabel: "Human Approval Required", tone: "red" },
    ],
    approvalMatrix: [
      { id: "am-1", action: "Read source code", autonomy: "Allowed" },
      { id: "am-2", action: "Create target branch", autonomy: "Allowed" },
      { id: "am-3", action: "Generate code", autonomy: "Allowed" },
      { id: "am-4", action: "Run sandbox tests", autonomy: "Allowed" },
      { id: "am-5", action: "Create Pull Request", autonomy: "Allowed" },
      { id: "am-6", action: "Merge Pull Request", autonomy: "Approval Required" },
      { id: "am-7", action: "Production Deployment", autonomy: "Restricted" },
    ],
    alwaysRequireApproval: [
      "Promote generated code to a shared branch",
      "Change a shared integration contract",
      "Use customer or production data",
      "Release outside the approved sandbox environment",
      "Modify production configuration",
    ],
    evaluation: {
      suiteName: "COBOL→Java Modernization Eval Suite v3",
      lastRun: "2026-08-30",
      passRate: 96,
      llmJudgeStatus: "Passed",
      redTeamStatus: "Passed",
      regressionStatus: "Passed",
    },
    budget: {
      monthly: 5000,
      used: 3240,
      projected: 4120,
      perTaskLimit: 50,
      approvalThreshold: 100,
      costPerOutcome: 410,
      valueGenerated: 38000,
      breakdown: [
        { label: "Model Usage", amount: 1420 },
        { label: "Agent Runtime", amount: 830 },
        { label: "Tools & Sandbox", amount: 620 },
        { label: "Evaluation", amount: 370 },
      ],
    },
  },

  definitionOfDone: {
    title: "COBOL to Java Modernization",
    overallStatus: "ready-for-review",
    sections: [
      {
        id: "dod-1",
        title: "Functional Equivalence",
        requirements: [
          { id: "r1", label: "Business rules extracted", status: "passed", evidence: ["42 business rules extracted"], check: "Rule extraction coverage report", owner: "Legacy Comprehension", adjudicator: "Verification" },
          { id: "r2", label: "Rules traceable to source", status: "passed", evidence: ["42 mapped to Java implementation"], check: "Traceability matrix complete", owner: "Legacy Comprehension", adjudicator: "Verification" },
          { id: "r3", label: "Expected behavior reproduced", status: "passed", evidence: ["Validation run #324 completed"], check: "Migration parity test suite passes", owner: "Reconstitution", adjudicator: "Verification" },
          { id: "r4", label: "Data behavior reconciled", status: "pending", evidence: [], check: "Reconciliation report within tolerance", owner: "Reconciliation", adjudicator: "Verification" },
        ],
      },
      {
        id: "dod-2",
        title: "Validation",
        requirements: [
          { id: "r5", label: "Unit tests passed", status: "passed", evidence: ["312 / 312 unit tests passed"], check: "Unit test suite passes", owner: "Reconstitution", adjudicator: "Verification" },
          { id: "r6", label: "Integration tests passed", status: "passed", evidence: ["48 / 48 integration tests passed"], check: "Integration test suite passes", owner: "Reconstitution", adjudicator: "Verification" },
          { id: "r7", label: "Regression checks passed", status: "pending", evidence: [], check: "Regression suite passes against baseline", owner: "Verification", adjudicator: "Verification" },
          { id: "r8", label: "Representative production scenarios replayed", status: "pending", evidence: [], check: "Replay parity within tolerance", owner: "Reconciliation", adjudicator: "Verification" },
        ],
      },
      {
        id: "dod-3",
        title: "Code Quality",
        requirements: [
          { id: "r9", label: "Static analysis passed", status: "passed", evidence: ["SonarQube scan completed, 0 new high severity findings"], check: "Static analysis scan clean", owner: "Reconstitution", adjudicator: "Verification" },
          { id: "r10", label: "No high severity security issues", status: "passed", evidence: ["Security scan #118 — clean"], check: "Security scan clean", owner: "Reconstitution", adjudicator: "Verification" },
          { id: "r11", label: "Code review completed", status: "pending", evidence: [], check: "Human code review signed off", owner: "Reconstitution", adjudicator: "Human Reviewer" },
        ],
      },
      {
        id: "dod-4",
        title: "Data Integrity",
        requirements: [
          { id: "r12", label: "Record counts reconciled", status: "pending", evidence: [], check: "Record count parity achieved", owner: "Data Structures", adjudicator: "Verification" },
          { id: "r13", label: "Checksums validated", status: "pending", evidence: [], check: "Checksum validation completed", owner: "Data Structures", adjudicator: "Verification" },
          { id: "r14", label: "Field precision preserved", status: "pending", evidence: [], check: "Field-level precision diff clean", owner: "Data Structures", adjudicator: "Verification" },
        ],
      },
      {
        id: "dod-5",
        title: "Governance",
        requirements: [
          { id: "r15", label: "Policy checks passed", status: "passed", evidence: ["12 policies evaluated, 12 compliant"], check: "All applicable policies compliant", owner: "AI Sentinel", adjudicator: "AI Sentinel" },
          { id: "r16", label: "Required evidence attached", status: "passed", evidence: ["48 evidence items attached"], check: "Evidence bundle complete", owner: "Orchestrator", adjudicator: "AI Sentinel" },
          { id: "r17", label: "Required approvals received", status: "pending", evidence: [], check: "Human approval recorded", owner: "Orchestrator", adjudicator: "Human Reviewer" },
        ],
      },
    ],
  },

  knowledgeSources: [
    { id: "kn-1", name: "Enterprise Architecture Guidelines", type: "Guideline", status: "Active", lastUpdated: "2026-07-14" },
    { id: "kn-2", name: "Java Development Standards", type: "Standard", status: "Active", lastUpdated: "2026-06-02" },
    { id: "kn-3", name: "Legacy System Documentation", type: "Reference", status: "Active", lastUpdated: "2026-05-11" },
    { id: "kn-4", name: "Migration Playbooks", type: "Playbook", status: "Active", lastUpdated: "2026-05-21" },
    { id: "kn-5", name: "Approved Past Modernization Examples", type: "Historical Record", status: "Connected", lastUpdated: "2026-08-11" },
  ],

  memory: [
    { id: "mem-1", name: "Procedural Memory", description: "Step-by-step transformation sequences validated across prior runs.", itemCount: 214 },
    { id: "mem-2", name: "Domain Knowledge", description: "Insurance claims and policy domain concepts grounded from enterprise sources.", itemCount: 86 },
    { id: "mem-3", name: "Approved Patterns", description: "Transformation patterns promoted from the Learning Plan after certification.", itemCount: 31 },
    { id: "mem-4", name: "Execution Learnings", description: "Observations captured from completed and reviewed work items.", itemCount: 58 },
  ],

  learningPlan: {
    fastLoopSummary: "Learns within controlled boundaries from execution history, memory, playbooks and approved outcomes.",
    slowLoopSummary: "Changes to skills, specifications, policies or evaluation rules go through champion/challenger certification before promotion.",
    championVersion: { version: "v2.4", role: "champion", summary: "Current certified version — updated testing strategy.", evaluationStatus: "Certified", date: "2026-08-11" },
    challengerVersion: { version: "v2.5", role: "challenger", summary: "Improved legacy data mapping accuracy.", evaluationStatus: "Awaiting certification", date: "2026-08-29" },
    improvementCandidates: [
      { id: "lc-1", title: "Reliable pattern for CICS transaction modernization", description: "A repeatable way to modernize a specific COBOL CICS transaction pattern into idiomatic Spring Boot controllers.", evidenceCount: 24, successRate: 98, status: "pending-review", date: "2026-08-29" },
      { id: "lc-2", title: "Copybook-to-DTO mapping shortcut", description: "A consistent mapping from nested copybook redefinitions to flattened Java DTOs, validated across claims and policy modules.", evidenceCount: 31, successRate: 96, status: "promoted", date: "2026-08-12" },
      { id: "lc-3", title: "Batch job checkpoint restart pattern", description: "Proposed pattern for resumable batch jobs was rejected — didn't generalize to settlement jobs with external callouts.", evidenceCount: 9, successRate: 61, status: "rejected", date: "2026-07-30" },
    ],
  },

  workHistory: [
    { id: "wh-1", title: "Customer Billing COBOL Modernization", outcome: "Billing calculation engine rebuilt in Java with full parity.", status: "certified-complete", dodPassed: 12, dodTotal: 12, cost: 412, durationHrs: 18.5, evidenceAvailable: true, humanReview: "Approved", completedAt: "2026-08-20" },
    { id: "wh-2", title: "Payment Batch Modernization", outcome: "Nightly settlement batch rebuilt in Java.", status: "needs-review", dodPassed: 9, dodTotal: 12, cost: 388, durationHrs: 21.0, evidenceAvailable: true, humanReview: "Pending", reason: "Data reconciliation variance detected", completedAt: "2026-08-27" },
    { id: "wh-3", title: "Policy Rating Engine Modernization", outcome: "Rating engine rebuilt with 100% functional parity.", status: "certified-complete", dodPassed: 12, dodTotal: 12, cost: 455, durationHrs: 22.3, evidenceAvailable: true, humanReview: "Approved", completedAt: "2026-08-05" },
    { id: "wh-4", title: "Batch Settlement Job Modernization", outcome: "Attempt failed during build validation.", status: "failed", dodPassed: 3, dodTotal: 12, cost: 96, durationHrs: 4.2, evidenceAvailable: true, humanReview: "Rejected", reason: "Build failed against target Java 17 baseline", completedAt: "2026-07-14" },
  ],

  currentWork: {
    id: "cw-1",
    title: "Modernize Customer Batch Processing Module",
    status: "paused",
    stage: "Validate Behavior — paused for review",
    stages: [
      { label: "Understand Legacy System", state: "done" },
      { label: "Extract Business Rules", state: "done" },
      { label: "Create Target Design", state: "done" },
      { label: "Generate Implementation", state: "done" },
      { label: "Validate Behavior", state: "current" },
      { label: "Definition of Done", state: "pending" },
    ],
    progress: 82,
    startedAt: "2026-08-31T08:12:00Z",
    cost: 38.4,
    budget: 50,
  },

  executionTimeline: cobolTimeline(),

  health: { capability: 96, governance: 98, evaluation: 94, cost: 88 },
  costPerTask: 37,
  activeTasks: 1,
};

function cobolTimeline(): ExecutionEvent[] {
  return [
    { id: "ev-1", time: "09:12", title: "Work Assigned", actor: "System", type: "assignment", result: "Modernize Customer Batch Processing Module assigned to worker.", inputs: ["ClaimsService.cbl", "CLMCOPY01.cpy", "Batch schedule JCL"] },
    { id: "ev-2", time: "09:14", title: "Legacy Comprehension Agent started", actor: "Legacy Comprehension", type: "agent-start", decisionSummary: "Began parsing COBOL modules, copybooks and JCL to build a structured inventory before any transformation begins.", policiesApplied: ["Repository Access Policy"], agentsInvolved: ["Legacy Comprehension"] },
    { id: "ev-3", time: "09:22", title: "Business rules extracted", actor: "Legacy Comprehension", type: "milestone", decisionSummary: "Identified 24 modules and extracted 42 discrete business rules from procedural logic.", evidence: ["Module inventory report", "Rule extraction log #214"], agentsInvolved: ["Legacy Comprehension"] },
    { id: "ev-4", time: "09:35", title: "Target Design created", actor: "Target Design", type: "milestone", decisionSummary: "Selected Enterprise Java Pattern B based on transaction shape, architecture guideline v4.2, and a prior approved migration.", evidence: ["Architecture decision record ADR-118"], rulesApplied: ["Enterprise Architecture Guideline v4.2"], policiesApplied: ["Enterprise Architecture Policy"], agentsInvolved: ["Target Design"] },
    { id: "ev-5", time: "09:48", title: "Java implementation generated", actor: "Reconstitution", type: "milestone", decisionSummary: "Generated Java implementation for 18 of 24 modules against the approved target design.", outputs: ["18 generated Java classes", "Build manifest"], agentsInvolved: ["Reconstitution"] },
    { id: "ev-6", time: "10:12", title: "Validation started", actor: "Reconciliation", type: "validation", decisionSummary: "Began replaying representative production workloads to compare source and target output.", agentsInvolved: ["Reconciliation"] },
    { id: "ev-7", time: "10:18", title: "Data reconciliation mismatch detected", actor: "Reconciliation", type: "validation", decisionSummary: "3 of 1,240 replayed transactions produced a rounding variance in interest accrual beyond the 0.01 tolerance.", evidence: ["Reconciliation report #77", "Transaction diff export"], rulesApplied: ["Data Reconciliation Tolerance Policy"], result: "Variance flagged for review — does not meet Data Integrity checkpoint.", agentsInvolved: ["Reconciliation"] },
    { id: "ev-8", time: "10:20", title: "AI Sentinel intervention", actor: "AI Sentinel", type: "sentinel", decisionSummary: "Sentinel detected a Definition of Done checkpoint failure (data reconciliation variance) and paused further execution pending human review, per policy.", policiesApplied: ["Data Security Policy", "Definition of Done Enforcement"], result: "Execution paused." },
    { id: "ev-9", time: "10:24", title: "Worker paused for review", actor: "System", type: "pause", result: "Worker paused. Awaiting human review of the reconciliation variance before continuing." },
  ];
}

const fullStackJavaEngineer: AIWorker = {
  id: "fullstack-java-engineer",
  name: "Full Stack Java Engineer",
  role: "Product Engineering Worker",
  purpose: "Own complete bounded features end to end — from API contract through service, database and UI — with tests and evidence attached.",
  owner: "Product Engineering",
  department: "Product Engineering",
  domain: "Application Development",
  status: "working",
  statusLabel: workerStatusLabel.working,
  autonomy: "guarded",
  operatingMode: "act-with-approval",
  version: "v1.6",
  avatarInitials: "FJ",
  accentColor: "blue",
  sentinel: "guarding",

  identity: {
    workerId: "wkr-fs-java-0071",
    environment: "Sandbox · us-east-1",
    tenant: "Meridian Capital / Claims Platform",
    createdAt: "2026-04-18",
    credentialStatus: "Active",
  },

  modelConfig: {
    routingMode: "fixed",
    primaryModel: "Claude Sonnet 5",
    verifierModel: "Claude Opus 5 (independent)",
    fallbackModel: "Claude Haiku 4.5",
    monthlyBudgetEstimate: 980,
  },

  learningConfig: {
    memoryScope: "worker",
    retentionDays: 30,
    sharedLearning: "team",
    useApprovedFeedback: true,
    sharedLearningApproved: true,
  },

  deployment: {
    runtime: "Agent Runtime v3 (containerized)",
    architecture: "x86_64",
    workerProfile: "Standard — bounded feature delivery worker",
    sizeProfile: "Medium (4 vCPU / 8GB)",
    deliveryTarget: "deployment-pipeline",
    deploymentMethod: "CI pipeline, promoted on pull request approval",
  },

  scope: {
    primaryPurpose: "Own a complete bounded feature — API, service, database and UI — from request through to a reviewed pull request.",
    boundedScope: "A single bounded feature within an approved repository and service boundary.",
    expectedOutcome: "A working, tested feature delivered as a pull request with evidence of test coverage and contract compliance.",
    acceptedInputBoundary: "Approved feature requests, existing API contracts and design system components within the assigned service boundary.",
    outOfScope: ["Merging its own pull requests", "Production deployment", "Schema changes outside the assigned service boundary"],
  },

  responsibility: {
    primary: "Own the delivery of a complete bounded feature from API contract through UI, with tests and evidence attached.",
    inputs: ["Feature request", "Existing API contracts", "Design system components", "Data model"],
    expectedOutputs: ["API implementation", "Data model changes", "Frontend implementation", "Test suite", "Pull request with evidence"],
    boundaries: ["Cannot merge its own pull requests", "Cannot deploy to production", "Cannot modify schemas outside its assigned service boundary"],
  },

  skills: [
    { id: "sk-1", name: "Requirements Comprehension", description: "Turns a feature request into a bounded implementation plan.", version: "1.4", status: "Active", evalStatus: "Passed", linkedTools: ["Documentation System"], linkedSpecs: ["Feature Intake Spec"] },
    { id: "sk-2", name: "API Contract Design", description: "Defines request/response contracts consistent with existing services.", version: "1.7", status: "Active", evalStatus: "Passed", linkedTools: ["API Gateway"], linkedSpecs: ["Contract Spec"] },
    { id: "sk-3", name: "Backend Implementation", description: "Implements service and persistence logic in Java / Spring Boot.", version: "2.1", status: "Active", evalStatus: "Passed", linkedTools: ["Java Build System"], linkedSpecs: ["Backend Spec"] },
    { id: "sk-4", name: "Frontend Implementation", description: "Implements UI against the design system and API contract.", version: "1.9", status: "Active", evalStatus: "Passed", linkedTools: ["Frontend Build System"], linkedSpecs: ["Frontend Spec"] },
    { id: "sk-5", name: "Test Engineering", description: "Writes unit, integration and contract tests for generated code.", version: "1.5", status: "Active", evalStatus: "Passed", linkedTools: ["Test Environment"], linkedSpecs: ["Test Spec"] },
    { id: "sk-6", name: "Release Readiness Verification", description: "Runs an independent check before opening a pull request.", version: "1.2", status: "Active", evalStatus: "Needs Review", linkedTools: ["Static Analysis"], linkedSpecs: ["Verification Spec"] },
  ],

  agentMesh: [
    { id: "ag-orch", name: "Orchestrator", role: "Owns the feature end-to-end", isOrchestrator: true, status: "running", description: "Plans and sequences the specialist agents against the feature's SPEC & Contract." },
    { id: "ag-1", name: "Design & Contract", role: "Defines API contract and data model", status: "completed", description: "Produces the API contract and data model changes for the feature." },
    { id: "ag-2", name: "Backend Implementation", role: "Builds the service layer", status: "running", description: "Implements backend logic and persistence against the approved contract." },
    { id: "ag-3", name: "Frontend Implementation", role: "Builds the UI", status: "waiting", description: "Implements the UI against the design system and API contract." },
    { id: "ag-4", name: "Test Engineering", role: "Writes and runs tests", status: "waiting", description: "Writes unit, integration and contract tests." },
    { id: "ag-5", name: "Verification", role: "Independently validates release readiness", status: "idle", description: "Final check before pull request creation." },
    { id: "ag-6", name: "Integration & Release", role: "Opens the pull request", status: "idle", description: "Packages evidence and opens the pull request for human review." },
  ],

  tools: [
    { id: "tl-1", name: "Repository Access", category: "Source Control", connected: true, permissions: ["Read", "Write"] },
    { id: "tl-2", name: "Java Build System", category: "Build", connected: true, permissions: ["Execute"] },
    { id: "tl-3", name: "Frontend Build System", category: "Build", connected: true, permissions: ["Execute"] },
    { id: "tl-4", name: "Test Environment", category: "Testing", connected: true, permissions: ["Read", "Execute"] },
    { id: "tl-5", name: "Static Analysis", category: "Code Quality", connected: true, permissions: ["Read", "Execute"] },
    { id: "tl-6", name: "API Gateway", category: "Integration", connected: true, permissions: ["Read"] },
    { id: "tl-7", name: "GitHub / GitLab", category: "Source Control", connected: true, permissions: ["Read", "Write"], restriction: "Pull request only — no direct merge" },
  ],

  governance: {
    accessScope: ["Read / write access to assigned service repositories", "No production access", "Sandbox and staging environments only"],
    environmentPermissions: ["Sandbox: Read / Write / Execute", "Staging: Read / Execute", "Production: No access"],
    leastPrivilegeRules: ["Credentials scoped to assigned repositories only", "No schema access outside the assigned service boundary"],
    policies: [
      { id: "pl-1", name: "Production Access", statusLabel: "Restricted", tone: "red" },
      { id: "pl-2", name: "Schema Changes", statusLabel: "Scoped to Service Boundary", tone: "amber" },
      { id: "pl-3", name: "Code Merge", statusLabel: "Pull Request Only", tone: "neutral" },
      { id: "pl-4", name: "Production Deployment", statusLabel: "Human Approval Required", tone: "red" },
    ],
    approvalMatrix: [
      { id: "am-1", action: "Read repository", autonomy: "Allowed" },
      { id: "am-2", action: "Create feature branch", autonomy: "Allowed" },
      { id: "am-3", action: "Generate code", autonomy: "Allowed" },
      { id: "am-4", action: "Run tests", autonomy: "Allowed" },
      { id: "am-5", action: "Create Pull Request", autonomy: "Allowed" },
      { id: "am-6", action: "Merge Pull Request", autonomy: "Approval Required" },
      { id: "am-7", action: "Production Deployment", autonomy: "Restricted" },
    ],
    alwaysRequireApproval: [
      "Promote generated code to a shared branch",
      "Change a shared API contract",
      "Use customer or production data",
      "Release outside the approved environment",
    ],
    evaluation: {
      suiteName: "Full Stack Feature Delivery Eval Suite v2",
      lastRun: "2026-08-29",
      passRate: 93,
      llmJudgeStatus: "Passed",
      redTeamStatus: "Passed",
      regressionStatus: "Passed",
    },
    budget: {
      monthly: 3600,
      used: 2110,
      projected: 3300,
      perTaskLimit: 45,
      approvalThreshold: 90,
      costPerOutcome: 265,
      valueGenerated: 21400,
      breakdown: [
        { label: "Model Usage", amount: 980 },
        { label: "Agent Runtime", amount: 560 },
        { label: "Tools & Build", amount: 410 },
        { label: "Evaluation", amount: 160 },
      ],
    },
  },

  definitionOfDone: {
    title: "Full Stack Feature Delivery",
    overallStatus: "not-ready",
    sections: [
      {
        id: "dod-1",
        title: "Functional Delivery",
        requirements: [
          { id: "r1", label: "API contract honored", status: "passed", evidence: ["Contract test suite passed"], check: "Contract test suite passes", owner: "Design & Contract", adjudicator: "Verification" },
          { id: "r2", label: "Backend implementation complete", status: "passed", evidence: ["12 endpoints implemented"], check: "All endpoints implemented", owner: "Backend Implementation", adjudicator: "Verification" },
          { id: "r3", label: "Frontend implementation complete", status: "pending", evidence: [], check: "UI matches design system", owner: "Frontend Implementation", adjudicator: "Verification" },
        ],
      },
      {
        id: "dod-2",
        title: "Validation",
        requirements: [
          { id: "r4", label: "Tests passed", status: "passed", evidence: ["84 / 84 unit tests passed"], check: "Unit test suite passes", owner: "Test Engineering", adjudicator: "Verification" },
          { id: "r5", label: "No regression", status: "pending", evidence: [], check: "Regression suite passes", owner: "Test Engineering", adjudicator: "Verification" },
        ],
      },
      {
        id: "dod-3",
        title: "Quality & Security",
        requirements: [
          { id: "r6", label: "Security scans passed", status: "passed", evidence: ["Dependency scan clean"], check: "Dependency + security scan clean", owner: "Verification", adjudicator: "Verification" },
          { id: "r7", label: "Code review completed", status: "pending", evidence: [], check: "Human code review signed off", owner: "Backend Implementation", adjudicator: "Human Reviewer" },
        ],
      },
      {
        id: "dod-4",
        title: "Release",
        requirements: [
          { id: "r8", label: "Pull request approved", status: "pending", evidence: [], check: "Human approval recorded", owner: "Integration & Release", adjudicator: "Human Reviewer" },
          { id: "r9", label: "Evidence attached", status: "passed", evidence: ["Evidence bundle #41 attached"], check: "Evidence bundle complete", owner: "Orchestrator", adjudicator: "AI Sentinel" },
        ],
      },
    ],
  },

  knowledgeSources: [
    { id: "kn-1", name: "Enterprise Architecture Guidelines", type: "Guideline", status: "Active", lastUpdated: "2026-07-14" },
    { id: "kn-2", name: "Java Development Standards", type: "Standard", status: "Active", lastUpdated: "2026-06-02" },
    { id: "kn-3", name: "Design System Reference", type: "Reference", status: "Active", lastUpdated: "2026-08-04" },
    { id: "kn-4", name: "API Contract Playbook", type: "Playbook", status: "Active", lastUpdated: "2026-05-30" },
  ],

  memory: [
    { id: "mem-1", name: "Procedural Memory", description: "Feature delivery sequences validated across prior runs.", itemCount: 96 },
    { id: "mem-2", name: "Domain Knowledge", description: "Claims platform domain concepts grounded from enterprise sources.", itemCount: 54 },
    { id: "mem-3", name: "Approved Patterns", description: "Implementation patterns promoted after certification.", itemCount: 19 },
    { id: "mem-4", name: "Execution Learnings", description: "Observations captured from completed and reviewed work items.", itemCount: 33 },
  ],

  learningPlan: {
    fastLoopSummary: "Learns within controlled boundaries from execution history, memory and approved outcomes.",
    slowLoopSummary: "Changes to skills, contracts or evaluation rules go through champion/challenger certification before promotion.",
    championVersion: { version: "v1.6", role: "champion", summary: "Current certified version — improved contract test generation.", evaluationStatus: "Certified", date: "2026-08-10" },
    challengerVersion: { version: "v1.7", role: "challenger", summary: "Improved frontend accessibility defaults.", evaluationStatus: "Awaiting certification", date: "2026-08-26" },
    improvementCandidates: [
      { id: "lc-1", title: "Consistent pagination pattern for list endpoints", description: "A reusable contract pattern for paginated list endpoints, validated across 3 services.", evidenceCount: 17, successRate: 94, status: "pending-review", date: "2026-08-27" },
    ],
  },

  workHistory: [
    { id: "wh-1", title: "Claims Attachment Upload Feature", outcome: "Upload feature delivered end to end with tests.", status: "certified-complete", dodPassed: 9, dodTotal: 9, cost: 224, durationHrs: 9.5, evidenceAvailable: true, humanReview: "Approved", completedAt: "2026-08-22" },
    { id: "wh-2", title: "Policy Search Filters", outcome: "Search filter feature delivered.", status: "certified-complete", dodPassed: 9, dodTotal: 9, cost: 198, durationHrs: 7.2, evidenceAvailable: true, humanReview: "Approved", completedAt: "2026-08-09" },
    { id: "wh-3", title: "Underwriting Notes API", outcome: "API delivered; frontend integration incomplete.", status: "needs-review", dodPassed: 6, dodTotal: 9, cost: 176, durationHrs: 8.1, evidenceAvailable: true, humanReview: "Pending", reason: "Frontend test coverage below threshold", completedAt: "2026-08-30" },
  ],

  currentWork: {
    id: "cw-1",
    title: "Claims Timeline Widget",
    status: "in-progress",
    stage: "Backend Implementation",
    stages: [
      { label: "Understand Request", state: "done" },
      { label: "Define API Contract", state: "done" },
      { label: "Backend Implementation", state: "current" },
      { label: "Frontend Implementation", state: "pending" },
      { label: "Validate & Test", state: "pending" },
      { label: "Definition of Done", state: "pending" },
    ],
    progress: 38,
    startedAt: "2026-08-31T07:40:00Z",
    cost: 14.2,
    budget: 45,
  },

  executionTimeline: [
    { id: "ev-1", time: "07:40", title: "Work Assigned", actor: "System", type: "assignment", result: "Claims Timeline Widget assigned to worker.", inputs: ["Feature request FR-2291"] },
    { id: "ev-2", time: "07:44", title: "Design & Contract Agent started", actor: "Design & Contract", type: "agent-start", decisionSummary: "Began defining the API contract for the claims timeline endpoint.", agentsInvolved: ["Design & Contract"] },
    { id: "ev-3", time: "08:02", title: "API contract approved", actor: "Design & Contract", type: "milestone", decisionSummary: "Contract validated against existing claims service conventions.", evidence: ["Contract test suite passed"], agentsInvolved: ["Design & Contract"] },
    { id: "ev-4", time: "08:15", title: "Backend implementation started", actor: "Backend Implementation", type: "agent-start", decisionSummary: "Began implementing the service layer against the approved contract.", agentsInvolved: ["Backend Implementation"] },
  ],

  health: { capability: 92, governance: 95, evaluation: 90, cost: 91 },
  costPerTask: 22,
  activeTasks: 1,
};

function stubWorker(
  id: string,
  name: string,
  role: string,
  domain: string,
  department: string,
  status: AIWorker["status"],
  autonomy: AIWorker["autonomy"],
  accentColor: AIWorker["accentColor"],
  sentinel: AIWorker["sentinel"],
  currentWorkTitle: string | undefined,
  costPerTask: number,
  activeTasks: number
): AIWorker {
  return {
    id,
    name,
    role,
    purpose: `${role} operations for ${domain}.`,
    owner: department,
    department,
    domain,
    status,
    statusLabel: workerStatusLabel[status],
    autonomy,
    operatingMode: "act-with-approval",
    version: "v1.0",
    avatarInitials: name.split(" ").map((w) => w[0]).slice(0, 2).join(""),
    accentColor,
    sentinel,
    identity: { workerId: `wkr-${id}`, environment: "Sandbox · us-east-1", tenant: "Meridian Capital", createdAt: "2026-05-01", credentialStatus: "Active" },
    modelConfig: {
      routingMode: "fixed",
      primaryModel: "Claude Sonnet 5",
      verifierModel: "Claude Opus 5 (independent)",
      fallbackModel: "Claude Haiku 4.5",
      monthlyBudgetEstimate: 600,
    },
    learningConfig: { memoryScope: "worker", retentionDays: 30, sharedLearning: "none", useApprovedFeedback: true, sharedLearningApproved: false },
    deployment: {
      runtime: "Agent Runtime v3 (containerized)",
      architecture: "x86_64",
      workerProfile: "Standard",
      sizeProfile: "Small (2 vCPU / 4GB)",
      deliveryTarget: "local-bundle",
      deploymentMethod: "Not yet configured.",
    },
    scope: { primaryPurpose: `${role} operations for ${domain}.`, boundedScope: "Not yet configured.", expectedOutcome: "Not yet configured.", acceptedInputBoundary: "Not yet configured.", outOfScope: [] },
    responsibility: { primary: "Not yet configured.", inputs: [], expectedOutputs: [], boundaries: [] },
    skills: [],
    agentMesh: [],
    tools: [],
    governance: {
      accessScope: [],
      environmentPermissions: [],
      leastPrivilegeRules: [],
      policies: [],
      approvalMatrix: [],
      alwaysRequireApproval: [],
      evaluation: { suiteName: "—", lastRun: "—", passRate: 0, llmJudgeStatus: "Not Run", redTeamStatus: "Not Run", regressionStatus: "Not Run" },
      budget: { monthly: 2000, used: 900, projected: 1500, perTaskLimit: 30, approvalThreshold: 60, costPerOutcome: 0, valueGenerated: 0, breakdown: [] },
    },
    definitionOfDone: { title: `${role} Definition of Done`, overallStatus: "not-ready", sections: [] },
    knowledgeSources: [],
    memory: [],
    learningPlan: {
      fastLoopSummary: "Not yet configured.",
      slowLoopSummary: "Not yet configured.",
      championVersion: { version: "v1.0", role: "champion", summary: "Initial version.", evaluationStatus: "Certified", date: "2026-05-01" },
      improvementCandidates: [],
    },
    workHistory: [],
    currentWork: currentWorkTitle
      ? {
          id: `cw-${id}`,
          title: currentWorkTitle,
          status: "in-progress",
          stage: "In Progress",
          stages: [],
          progress: 50,
          startedAt: "2026-08-31T08:00:00Z",
          cost: 10,
          budget: 30,
        }
      : undefined,
    executionTimeline: [],
    health: { capability: 90, governance: 90, evaluation: 88, cost: 90 },
    costPerTask,
    activeTasks,
  };
}

export const workers: AIWorker[] = [
  cobolModernizationWorker,
  fullStackJavaEngineer,
  stubWorker("java-modernization-worker", "Java Modernization Worker", "Modernization Engineer", "Legacy Modernization", "Engineering Transformation", "active", "guarded", "blue", "observing", "Modernize InventoryService.java 8 → 21", 34, 2),
  stubWorker("integration-modernization-worker", "Integration Modernization Worker", "Integration Engineer", "Legacy Modernization", "Engineering Transformation", "idle", "guarded", "neutral", "observing", undefined, 29, 0),
  stubWorker("claims-review-worker", "Claims Review Worker", "Claims Analyst", "Claims", "Claims Operations", "review", "supervised", "amber", "intervention-required", "Review Claim #CX-118", 26, 1),
  stubWorker("underwriting-analyst", "Underwriting Analyst", "Risk Analyst", "Insurance", "Underwriting", "working", "guarded", "blue", "guarding", "Score Policy Application #4591", 24, 2),
];

export const orgMetrics = {
  activeWorkers: workers.length,
  runningWork: workers.filter((w) => w.currentWork).length + 34,
  requiresAttention: 4,
  escalations: 2,
  monthlySpend: 2840,
  monthlyBudget: 5071,
};

export const attentionItems = [
  { id: "at-1", type: "Sentinel Intervention", worker: "COBOL Modernization Worker", detail: "Data reconciliation variance detected — execution paused.", severity: "red" as const },
  { id: "at-2", type: "Definition of Done", worker: "Payment Batch Modernization", detail: "Needs review — 9 / 12 checkpoints passed.", severity: "amber" as const },
  { id: "at-3", type: "Approval Required", worker: "Underwriting Analyst", detail: "High-risk decision awaiting sign-off.", severity: "red" as const },
  { id: "at-4", type: "Learning Candidate", worker: "COBOL Modernization Worker", detail: "Improvement candidate pending governed review.", severity: "amber" as const },
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
    type: "Sentinel Intervention",
    workerId: "cobol-modernization-worker",
    workerName: "COBOL Modernization Worker",
    summary: "Data reconciliation variance detected during Customer Batch Processing modernization — execution paused by AI Sentinel.",
    aiRecommendation: "Review the 3 flagged transactions — variance is a rounding tolerance issue, not a logic defect. Safe to adjust tolerance and resume.",
    evidence: ["3 of 1,240 replayed transactions exceeded the 0.01 rounding tolerance", "Reconciliation report #77 attached"],
    policy: "Data Reconciliation Tolerance Policy",
    risk: "Medium",
    impact: "Blocks the Data Integrity checkpoint in the Definition of Done until resolved.",
    alternatives: ["Widen tolerance to 0.02 for interest accrual fields only — narrower fix, avoids re-running full reconciliation."],
    requestedAt: "2026-08-31T10:20:00Z",
  },
  {
    id: "ap-2",
    type: "Definition of Done Review",
    workerId: "cobol-modernization-worker",
    workerName: "COBOL Modernization Worker",
    summary: "Payment Batch Modernization is at 9 / 12 Definition of Done checkpoints — needs human review before certification.",
    aiRecommendation: "Approve with follow-up — the 3 outstanding checkpoints are documentation and approval steps, not functional gaps.",
    evidence: ["Functional Equivalence: 4 / 4 passed", "Validation: 3 / 4 passed", "Governance: 2 / 4 passed"],
    policy: "Definition of Done Enforcement",
    risk: "Low",
    impact: "Work item stays in Needs Review status until resolved; does not block other workers.",
    alternatives: ["Return to worker for another validation pass before human review."],
    requestedAt: "2026-08-31T07:15:00Z",
  },
  {
    id: "ap-3",
    type: "High-Risk Decision",
    workerId: "underwriting-analyst",
    workerName: "Underwriting Analyst",
    summary: "Policy Application #4591 risk score falls just above the automated-approval ceiling — requires senior underwriter sign-off.",
    aiRecommendation: "Route to senior underwriter — the applicant profile falls outside the automated approval band by a narrow margin.",
    evidence: ["Risk score 72 vs. 70 automated-approval ceiling", "Conflicting guideline match: commercial vs. mixed-use classification"],
    policy: "Underwriting Escalation Policy",
    risk: "High",
    impact: "Delays binding by up to 2 business days pending manual review.",
    alternatives: ["Auto-decline pending clarification — would likely require reprocessing once classification is resolved."],
    requestedAt: "2026-08-31T07:41:00Z",
  },
];

export const allWorkHistory: (WorkHistoryItem & { workerId: string; workerName: string })[] = workers.flatMap((w) =>
  w.workHistory.map((item) => ({ ...item, workerId: w.id, workerName: w.name }))
);

export const allCurrentWork = workers.filter((w) => w.currentWork).map((w) => ({ worker: w, work: w.currentWork! }));
