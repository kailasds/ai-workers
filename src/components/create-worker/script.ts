import { RefreshCw, Code2, FlaskConical, FileCode2, TestTube2, Route } from "lucide-react";
import type {
  AssemblyLogEntry,
  AutonomyLevelOption,
  BoundedContextOption,
  BusinessDomainOption,
  ComposeState,
  DodGate,
  IdentityOption,
  SampleProject,
  WorkerTypeOption,
} from "./types";

export const workerTypes: WorkerTypeOption[] = [
  {
    id: "modernization",
    name: "Modernization Worker",
    description: "Rebuilds a legacy application in a modern language and proves the behaviour still matches.",
    icon: RefreshCw,
    available: true,
  },
  {
    id: "fullstack",
    name: "Full Stack Software Engineering Worker",
    description: "Builds new software and changes existing systems, with tests.",
    icon: Code2,
    available: false,
  },
  {
    id: "quality",
    name: "Quality Engineering Worker",
    description: "Designs the tests for a change, runs them, and reports what it could not cover.",
    icon: FlaskConical,
    available: false,
  },
];

export const identities: IdentityOption[] = [
  {
    id: "integration-modernization",
    name: "Integration modernization",
    description: "Middleware estates: the flows, orchestrations, adapters and message contracts that hold systems together.",
    scopeCount: 3,
    available: true,
  },
  {
    id: "mainframe-modernization",
    name: "Mainframe modernization",
    description: "COBOL, JCL and CICS estates, and the batch and online workloads that run on them.",
    scopeCount: 0,
    available: false,
  },
  {
    id: "tech-currency-upgrade",
    name: "Tech currency upgrade",
    description: "In-place version uplift, where the architecture stays and the runtime, framework and dependencies move forward.",
    scopeCount: 0,
    available: false,
  },
];

export const businessDomains: BusinessDomainOption[] = [
  { id: "payments", name: "Payments", description: "Payment initiation, clearing, settlement and the message estate around them.", skillCount: 19, dslCount: 4 },
  { id: "cards-merchant", name: "Cards and merchant services", description: "Card authorisation, merchant onboarding, disputes and interchange.", skillCount: 17, dslCount: 2 },
  { id: "core-banking", name: "Core banking deposits", description: "Account mastering, posting, interest accrual and statementing.", skillCount: 3, dslCount: 0 },
  { id: "commercial-lending", name: "Commercial lending", description: "Origination, credit decisioning, covenant tracking and servicing for business borrowers.", skillCount: 8, dslCount: 0 },
  { id: "retail-lending", name: "Retail lending and mortgage", description: "Consumer origination, affordability, servicing and collections.", skillCount: 7, dslCount: 0 },
];

const baseExcluded = [
  "Generate unit tests",
  "Produce a traceability report",
  "Promote generated code to production",
  "Modify approved business rules",
  "Use production credentials",
  "Skip the Definition of Done gate",
];

export const boundedContexts: BoundedContextOption[] = [
  {
    id: "target-code",
    name: "Analysis, SPEC generation and code generation",
    description: "Converts Integration Service to Target Code",
    icon: FileCode2,
    produces: "Produce Spring Boot service classes that meet the selected functional equivalence, specification coverage and evaluation pass-rate thresholds.",
    procedureLabel: "Spec Driven Engineering",
    procedureStages: 4,
    excludedActions: baseExcluded,
  },
  {
    id: "unit-tested",
    name: "Analysis, SPEC generation and code generation + Unit testing",
    description: "Converts Integration Service to Unit Tested Target Code",
    icon: TestTube2,
    produces: "Produce Spring Boot service classes and an accompanying unit test suite that meet the selected functional equivalence, specification coverage and evaluation pass-rate thresholds.",
    procedureLabel: "Spec Driven Engineering",
    procedureStages: 5,
    excludedActions: baseExcluded.slice(1),
  },
  {
    id: "traced",
    name: "Analysis, SPEC generation and code generation + Unit testing + a traceability report",
    description: "Converts Integration Service to Traced Target Code",
    icon: Route,
    produces: "Produce Spring Boot service classes, a unit test suite and a source-to-target traceability report that meet the selected thresholds.",
    procedureLabel: "Spec Driven Engineering",
    procedureStages: 6,
    excludedActions: baseExcluded.slice(2),
  },
];

export const dodGates: DodGate[] = [
  { id: "evals", label: "EVALs Pass Rate", description: "The share of the evaluation suite this Worker's output must pass before release." },
  { id: "functional", label: "Functional Equivalence", description: "How closely generated behaviour must match the source system before release." },
  { id: "specs", label: "Specs Coverage", description: "The share of the generated SPEC this Worker's output must satisfy before release." },
];

export const autonomyLevels: AutonomyLevelOption[] = [
  {
    level: 1,
    name: "Observed",
    description: "Watches and reports; nothing it produces is applied.",
    release: "Nothing is released. Findings are recorded for review.",
    whereItMayRun: "TCS Training",
    needsAPerson: "Any output leaving the observation log",
  },
  {
    level: 2,
    name: "Assisted",
    description: "Proposes the next step; a person applies it.",
    release: "A person applies each change individually.",
    whereItMayRun: "TCS Training",
    needsAPerson: "Applying any generated change",
  },
  {
    level: 3,
    name: "Supervised",
    description: "Runs end to end; a person approves release.",
    release: "A person approves release at Level 3.",
    whereItMayRun: "TCS Training",
    needsAPerson: "Promote generated code · Release outside the TCS environment",
  },
  {
    level: 4,
    name: "Autonomous",
    description: "Runs end to end and releases within policy, on its own.",
    release: "Releases automatically once the Definition of Done gates pass.",
    whereItMayRun: "TCS Training · Customer environments in scope",
    needsAPerson: "Only exceptions the Definition of Done gates flag",
  },
];

export const sampleProjects: SampleProject[] = [
  { id: "appetite-check", name: "Appetite check service", path: "TIBCO BusinessWorks → Java Spring Boot" },
  { id: "covenant-check", name: "Covenant check service", path: "TIBCO BusinessWorks → Java Spring Boot" },
  { id: "credit-check", name: "Credit check service", path: "TIBCO BusinessWorks → Java Spring Boot" },
  { id: "first-notice-of-loss", name: "First notice of loss", path: "TIBCO BusinessWorks → Java Spring Boot" },
  { id: "sanctions-screening", name: "Sanctions screening service", path: "TIBCO BusinessWorks → Java Spring Boot" },
];

export const assemblyLog: AssemblyLogEntry[] = [
  { id: "log-1", facet: "meta", label: "Narrowed by bounded context", detail: "tibco-bw-to-spring-boot-services · 7 left" },
  { id: "log-2", facet: "skill", label: "Java Spring Boot — Service Class Conversion", detail: "Named by this bounded context." },
  { id: "log-3", facet: "dsl", label: "Spring Boot enterprise standards", detail: "Named by this bounded context." },
  { id: "log-4", facet: "skill", label: "MuleSoft to Spring Boot modernization", detail: "Converts MuleSoft to Spring Boot, which is this Worker's pathway." },
  { id: "log-5", facet: "skill", label: "TIBCO BusinessWorks to Spring Boot modernization", detail: "Converts TIBCO BusinessWorks to Spring Boot, which is this Worker's pathway." },
  { id: "log-6", facet: "skill", label: "webMethods Integration Server to Spring Boot modernization", detail: "Converts webMethods Integration Server to Spring Boot, which is this Worker's pathway." },
  { id: "log-7", facet: "eval", label: "Java Spring Boot — Code Quality Checklist (Java 21+)", detail: "Output is Java 21+ Spring Boot service classes and must pass a code quality gate." },
  { id: "log-8", facet: "eval", label: "Anthropic Security Review — Context-Aware Secure-Code Review", detail: "Generated service classes handle payments logic and need a secure-code pass." },
  { id: "log-9", facet: "meta", label: "Opened Domain languages for this business", detail: "4 entries" },
  { id: "log-10", facet: "dsl", label: "Payment message contract grammar", detail: "Opened from Domain languages for this business." },
  { id: "log-11", facet: "dsl", label: "Clearing and settlement event grammar", detail: "Opened from Domain languages for this business." },
  { id: "log-12", facet: "skill", label: "Independent Verification — Parity Check", detail: "Cross-checks generated output against the source before handoff." },
];

export const provisioningSteps = [
  "Rendering Worker intent",
  "Packaging Skills",
  "Bundling Domain languages",
  "Packaging EVALs and Definition of Done gates",
  "Attaching Sentinel policy",
  "Signing the artefact",
];

export function createComposeDefaults(): ComposeState {
  return {
    workerTypeId: null,
    identityId: null,
    businessDomainId: null,
    boundedContextId: boundedContexts[0].id,
    autoAssemblePreset: true,
    identityConfirmed: false,
    workerIntent: {
      agentCount: 1,
      harnessLabel: "Integration Modernization Harness",
      tools: ["Repository Access", "Code Analysis Tool", "Java Build System", "Sandbox"],
    },
    intentConfirmed: false,
    brain: {
      status: "idle",
      read: 0,
      bound: 0,
      screenedOut: 0,
      skillsCount: 0,
      dslsCount: 0,
      evalsCount: 5,
      sentinelState: "Resolving",
    },
    dodConfirmed: false,
    autonomyLevel: 3,
    autonomyConfirmed: false,
    revision: 1,
    selectedSampleProjects: [],
    publishToGitLab: true,
    packageState: "idle",
  };
}
