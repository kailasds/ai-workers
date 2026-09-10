import { workers } from "../knowledge/data";
import type { Skill, DomainTerm, Evaluation, Model, Agent, Tool, Policy, Connector, Capability, Workflow } from "./types";

export const integrationWorkerIds = ["w-36", "w-29", "w-11", "w-42", "w-18", "w-52", "w-07"];
export const domainWorkerIds = {
  payments: "w-payments",
  claims: "w-claims",
  regulatory: "w-regulatory",
  underwriting: "w-underwriting",
} as const;

function byId<T extends { id: string }>(list: T[], id: string): T {
  const found = list.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown id: ${id}`);
  return found;
}
function byName<T extends { name: string }>(list: T[], name: string): T {
  const found = list.find((x) => x.name === name);
  if (!found) throw new Error(`Unknown name: ${name}`);
  return found;
}

// ---------------------------------------------------------------------------
// Tools (40)
// ---------------------------------------------------------------------------

const toolCatalog: { name: string; category: string }[] = [
  { name: "GitHub", category: "Source Control" },
  { name: "Repository Analyzer", category: "Analysis" },
  { name: "Static Analyzer", category: "Quality" },
  { name: "Java Compiler", category: "Build" },
  { name: "Maven", category: "Build" },
  { name: "Test Runner", category: "Testing" },
  { name: "Code Search", category: "Analysis" },
  { name: "Dependency Analyzer", category: "Analysis" },
  { name: "XML Parser", category: "Data" },
  { name: "API Schema Analyzer", category: "API" },
  { name: "JUnit Runner", category: "Testing" },
  { name: "Gradle", category: "Build" },
  { name: "SonarQube Scanner", category: "Quality" },
  { name: "Checkstyle", category: "Quality" },
  { name: "PMD", category: "Quality" },
  { name: "JaCoCo Coverage", category: "Testing" },
  { name: "Spring Boot CLI", category: "Build" },
  { name: "Docker", category: "Build" },
  { name: "Kubernetes CLI", category: "Observability" },
  { name: "Postman", category: "API" },
  { name: "Swagger Validator", category: "API" },
  { name: "JSON Schema Validator", category: "Data" },
  { name: "YAML Linter", category: "Quality" },
  { name: "Git Diff Analyzer", category: "Analysis" },
  { name: "Code Formatter", category: "Quality" },
  { name: "Dependency Vulnerability Scanner", category: "Governance" },
  { name: "License Scanner", category: "Governance" },
  { name: "Log Analyzer", category: "Observability" },
  { name: "Metrics Collector", category: "Observability" },
  { name: "Trace Visualizer", category: "Observability" },
  { name: "Database Schema Analyzer", category: "Data" },
  { name: "SQL Migration Tool", category: "Data" },
  { name: "Message Queue Inspector", category: "Messaging" },
  { name: "JMS Client", category: "Messaging" },
  { name: "REST Client", category: "API" },
  { name: "SOAP Client", category: "API" },
  { name: "Contract Test Runner", category: "Testing" },
  { name: "Mutation Test Runner", category: "Testing" },
  { name: "Build Cache Analyzer", category: "Build" },
  { name: "Artifact Repository Client", category: "Build" },
];

export const tools: Tool[] = toolCatalog.map((t) => ({
  id: `tool-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: t.name,
  category: t.category,
  status: "Active",
  workerIds: [],
  agentIds: [],
}));

export function getTool(id: string) {
  return tools.find((t) => t.id === id);
}
const toolByName = (name: string) => byName(tools, name);

// ---------------------------------------------------------------------------
// Evaluations (15)
// ---------------------------------------------------------------------------

const evaluationCatalog: { name: string; purpose: string; threshold?: string; hardGate: boolean }[] = [
  { name: "Functional Equivalence", purpose: "Confirms converted behavior matches the source system.", threshold: "≥85%", hardGate: true },
  { name: "Code Quality", purpose: "Assesses maintainability and adherence to code standards.", threshold: "≥80%", hardGate: true },
  { name: "SPEC Coverage", purpose: "Confirms the generated implementation satisfies the SPEC.", threshold: "≥85%", hardGate: true },
  { name: "Unit Test Coverage", purpose: "Measures generated unit test line coverage.", threshold: "≥70%", hardGate: false },
  { name: "Traceability", purpose: "Confirms each converted activity traces to its source.", hardGate: false },
  { name: "Security Compliance", purpose: "Screens for known vulnerability classes before handoff.", threshold: "No critical findings", hardGate: true },
  { name: "Integration Test Coverage", purpose: "Measures coverage of cross-service integration paths.", threshold: "≥60%", hardGate: false },
  { name: "Performance Regression", purpose: "Flags latency or throughput regressions vs. baseline.", threshold: "No regression >10%", hardGate: false },
  { name: "API Compatibility", purpose: "Confirms external contracts are preserved across conversion.", threshold: "No breaking changes", hardGate: true },
  { name: "Data Integrity", purpose: "Confirms record-level parity between source and target.", threshold: "Zero data loss", hardGate: true },
  { name: "Error Handling Coverage", purpose: "Measures how many source error paths are reproduced.", threshold: "≥75%", hardGate: false },
  { name: "Documentation Completeness", purpose: "Confirms generated docs cover public interfaces.", threshold: "≥90%", hardGate: false },
  { name: "Mapping Accuracy", purpose: "Confirms field-level mapping correctness for transformed data.", threshold: "≥95%", hardGate: true },
  { name: "Transaction Consistency", purpose: "Confirms transactional boundaries preserve ACID guarantees.", threshold: "ACID preserved", hardGate: true },
  { name: "Regulatory Compliance", purpose: "Screens output against applicable regulatory requirements.", threshold: "No violations", hardGate: true },
];

export const evaluations: Evaluation[] = evaluationCatalog.map((e) => ({
  id: `eval-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: e.name,
  purpose: e.purpose,
  threshold: e.threshold,
  hardGate: e.hardGate,
  status: "Configured",
  workerIds: [],
}));

export function getEvaluation(id: string) {
  return evaluations.find((e) => e.id === id);
}
const evalByName = (name: string) => byName(evaluations, name);

// ---------------------------------------------------------------------------
// Models / SLMs (4) — reuse the platform's real model names where the app
// already names them (see src/lib/data.ts ModelConfig).
// ---------------------------------------------------------------------------

export const models: Model[] = [
  { id: "model-sonnet-5", name: "Claude Sonnet 5", purpose: "Primary reasoning model", status: "Active", workerIds: [], agentIds: [] },
  { id: "model-opus-5", name: "Claude Opus 5 (independent)", purpose: "Independent verification / code analysis model", status: "Active", workerIds: [], agentIds: [] },
  { id: "model-haiku-4-5", name: "Claude Haiku 4.5", purpose: "Fast classification and triage model", status: "Active", workerIds: [], agentIds: [] },
  { id: "model-embedding", name: "Platform Embedding Model", purpose: "Semantic search and retrieval over code, docs and evidence", status: "Active", workerIds: [], agentIds: [] },
]

export function getModel(id: string) {
  return models.find((m) => m.id === id);
}
const modelByName = (name: string) => byName(models, name);

// ---------------------------------------------------------------------------
// Agents (18)
// ---------------------------------------------------------------------------

const agentCatalog: { name: string; description: string; model: string }[] = [
  { name: "Orchestrator Agent", description: "Plans and sequences the specialist agents against the SPEC & Contract.", model: "Claude Sonnet 5" },
  { name: "Repository Discovery Agent", description: "Locates and inventories source repositories and modules to migrate.", model: "Claude Haiku 4.5" },
  { name: "Code Analysis Agent", description: "Builds a structured understanding of source code and dependencies.", model: "Claude Sonnet 5" },
  { name: "Migration Agent", description: "Generates the target Spring Boot implementation from the source design.", model: "Claude Sonnet 5" },
  { name: "Mapping Agent", description: "Produces field- and message-level mappings between source and target.", model: "Claude Sonnet 5" },
  { name: "Test Generation Agent", description: "Generates unit, integration and contract tests for converted services.", model: "Claude Sonnet 5" },
  { name: "Validation Agent", description: "Runs an independent pass to check parity and gate compliance.", model: "Claude Opus 5 (independent)" },
  { name: "Documentation Agent", description: "Produces migration documentation and API references.", model: "Claude Haiku 4.5" },
  { name: "Traceability Agent", description: "Builds source-to-target traceability matrices.", model: "Claude Sonnet 5" },
  { name: "Payments Mapping Agent", description: "Maps legacy payment instruction formats to target schemas.", model: "Claude Sonnet 5" },
  { name: "Claims Extraction Agent", description: "Extracts structured claims data from unstructured intake documents.", model: "Claude Sonnet 5" },
  { name: "Regulatory Monitoring Agent", description: "Tracks and classifies incoming regulatory changes.", model: "Claude Haiku 4.5" },
  { name: "Underwriting Risk Agent", description: "Extracts and scores risk factors from underwriting submissions.", model: "Claude Sonnet 5" },
  { name: "Dependency Resolution Agent", description: "Resolves and upgrades third-party dependency graphs.", model: "Claude Haiku 4.5" },
  { name: "Security Review Agent", description: "Screens generated code for known vulnerability classes.", model: "Claude Opus 5 (independent)" },
  { name: "Data Reconciliation Agent", description: "Reconciles record counts and field values between source and target.", model: "Claude Sonnet 5" },
  { name: "Reporting Agent", description: "Assembles run and evidence summaries for stakeholders.", model: "Claude Haiku 4.5" },
  { name: "Deployment Agent", description: "Packages and promotes validated services toward release.", model: "Claude Haiku 4.5" },
];

export const agents: Agent[] = agentCatalog.map((a) => ({
  id: `agent-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: a.name,
  description: a.description,
  status: "Active",
  workerIds: [],
  skillIds: [],
  toolIds: [],
  modelId: modelByName(a.model).id,
}));

export function getAgent(id: string) {
  return agents.find((a) => a.id === id);
}
const agentByName = (name: string) => byName(agents, name);

function linkAgentTools(agentName: string, toolNames: string[]) {
  const agent = agentByName(agentName);
  for (const tn of toolNames) {
    const tool = toolByName(tn);
    agent.toolIds.push(tool.id);
    tool.agentIds.push(agent.id);
  }
}
function linkAgentWorkers(agentName: string, workerIds: string[]) {
  const agent = agentByName(agentName);
  agent.workerIds.push(...workerIds);
  const model = models.find((m) => m.id === agent.modelId);
  if (model) {
    model.agentIds.push(agent.id);
    for (const wid of workerIds) if (!model.workerIds.includes(wid)) model.workerIds.push(wid);
  }
  for (const wid of workerIds) {
    for (const toolId of agent.toolIds) {
      const tool = getTool(toolId)!;
      if (!tool.workerIds.includes(wid)) tool.workerIds.push(wid);
    }
  }
}

linkAgentTools("Orchestrator Agent", ["GitHub", "Metrics Collector"]);
linkAgentTools("Repository Discovery Agent", ["GitHub", "Repository Analyzer", "Code Search"]);
linkAgentTools("Code Analysis Agent", ["Static Analyzer", "Dependency Analyzer", "SonarQube Scanner"]);
linkAgentTools("Migration Agent", ["Java Compiler", "Maven", "Spring Boot CLI", "Code Formatter"]);
linkAgentTools("Mapping Agent", ["XML Parser", "API Schema Analyzer", "JSON Schema Validator"]);
linkAgentTools("Test Generation Agent", ["Test Runner", "JUnit Runner", "JaCoCo Coverage", "Contract Test Runner"]);
linkAgentTools("Validation Agent", ["Test Runner", "Mutation Test Runner", "Checkstyle", "PMD"]);
linkAgentTools("Documentation Agent", ["GitHub", "YAML Linter"]);
linkAgentTools("Traceability Agent", ["Git Diff Analyzer", "Database Schema Analyzer"]);
linkAgentTools("Payments Mapping Agent", ["JSON Schema Validator", "SQL Migration Tool"]);
linkAgentTools("Claims Extraction Agent", ["XML Parser", "Code Search"]);
linkAgentTools("Regulatory Monitoring Agent", ["Log Analyzer", "Metrics Collector"]);
linkAgentTools("Underwriting Risk Agent", ["Database Schema Analyzer", "SQL Migration Tool"]);
linkAgentTools("Dependency Resolution Agent", ["Dependency Analyzer", "Dependency Vulnerability Scanner", "License Scanner"]);
linkAgentTools("Security Review Agent", ["Dependency Vulnerability Scanner", "Static Analyzer"]);
linkAgentTools("Data Reconciliation Agent", ["Database Schema Analyzer", "SQL Migration Tool", "Message Queue Inspector"]);
linkAgentTools("Reporting Agent", ["Metrics Collector", "Trace Visualizer"]);
linkAgentTools("Deployment Agent", ["Docker", "Kubernetes CLI", "Artifact Repository Client"]);

linkAgentWorkers("Orchestrator Agent", integrationWorkerIds);
linkAgentWorkers("Repository Discovery Agent", integrationWorkerIds);
linkAgentWorkers("Code Analysis Agent", integrationWorkerIds);
linkAgentWorkers("Migration Agent", integrationWorkerIds);
linkAgentWorkers("Mapping Agent", ["w-36", "w-29", "w-11", "w-42"]);
linkAgentWorkers("Test Generation Agent", ["w-36", "w-29", "w-11", "w-42"]);
linkAgentWorkers("Validation Agent", integrationWorkerIds);
linkAgentWorkers("Documentation Agent", ["w-36", "w-29", "w-11"]);
linkAgentWorkers("Traceability Agent", ["w-36", "w-29"]);
linkAgentWorkers("Payments Mapping Agent", [domainWorkerIds.payments]);
linkAgentWorkers("Claims Extraction Agent", [domainWorkerIds.claims]);
linkAgentWorkers("Regulatory Monitoring Agent", [domainWorkerIds.regulatory]);
linkAgentWorkers("Underwriting Risk Agent", [domainWorkerIds.underwriting]);
linkAgentWorkers("Dependency Resolution Agent", integrationWorkerIds);
linkAgentWorkers("Security Review Agent", [...integrationWorkerIds, domainWorkerIds.payments]);
linkAgentWorkers("Data Reconciliation Agent", [domainWorkerIds.payments, domainWorkerIds.claims]);
linkAgentWorkers("Reporting Agent", [...integrationWorkerIds, domainWorkerIds.regulatory]);
linkAgentWorkers("Deployment Agent", integrationWorkerIds);

// ---------------------------------------------------------------------------
// Skills (24)
// ---------------------------------------------------------------------------

interface SkillSeed {
  name: string;
  description: string;
  agents: string[];
  evals: string[];
  workers: string[];
  relatedConstructId?: string;
}

const skillCatalog: SkillSeed[] = [
  {
    name: "TIBCO process analysis",
    description: "Parses TIBCO BusinessWorks processes into a structured activity graph.",
    agents: ["Repository Discovery Agent", "Code Analysis Agent"],
    evals: ["Traceability"],
    workers: integrationWorkerIds,
  },
  {
    name: "TIBCO → Spring Boot migration",
    description: "Converts a TIBCO BusinessWorks process into an equivalent Spring Boot service.",
    agents: ["Migration Agent"],
    evals: ["Functional Equivalence", "Code Quality"],
    workers: integrationWorkerIds,
    relatedConstructId: "construct-orchestration-service_orchestration",
  },
  {
    name: "XML mapping transformation",
    description: "Converts TIBCO XML mapping activities into Java data transformation code.",
    agents: ["Mapping Agent"],
    evals: ["Mapping Accuracy"],
    workers: ["w-36", "w-29", "w-11", "w-42"],
    relatedConstructId: "construct-mapping-message_transformation",
  },
  {
    name: "API transformation",
    description: "Converts TIBCO SOAP/HTTP bindings into Spring Boot REST controllers.",
    agents: ["Mapping Agent"],
    evals: ["API Compatibility"],
    workers: ["w-36", "w-29", "w-11", "w-42"],
  },
  {
    name: "Service orchestration",
    description: "Reproduces TIBCO activity sequencing as Spring Boot service orchestration.",
    agents: ["Migration Agent"],
    evals: ["Functional Equivalence"],
    workers: integrationWorkerIds,
    relatedConstructId: "construct-orchestration-service_orchestration",
  },
  {
    name: "JMS migration",
    description: "Converts TIBCO JMS receivers and senders to Spring JMS equivalents.",
    agents: ["Migration Agent", "Mapping Agent"],
    evals: ["Functional Equivalence"],
    workers: ["w-36", "w-29", "w-11"],
    relatedConstructId: "construct-jms-delivery_guarantee",
  },
  {
    name: "Transaction migration",
    description: "Preserves transactional boundaries when converting TIBCO XA-scoped activities.",
    agents: ["Migration Agent"],
    evals: ["Transaction Consistency"],
    workers: ["w-36", "w-29"],
  },
  {
    name: "Error handling migration",
    description: "Converts TIBCO error transitions into Spring Boot exception handling.",
    agents: ["Migration Agent"],
    evals: ["Error Handling Coverage"],
    workers: ["w-36", "w-11"],
  },
  {
    name: "Unit test generation",
    description: "Generates JUnit 5 test scaffolding mirroring the original TIBCO test suite.",
    agents: ["Test Generation Agent"],
    evals: ["Unit Test Coverage"],
    workers: ["w-36", "w-11"],
    relatedConstructId: "construct-testing-unit_test_generation",
  },
  {
    name: "Integration test generation",
    description: "Generates cross-service integration tests for converted workflows.",
    agents: ["Test Generation Agent"],
    evals: ["Integration Test Coverage"],
    workers: ["w-36", "w-29"],
  },
  {
    name: "Code quality analysis",
    description: "Screens generated code against enterprise code quality standards.",
    agents: ["Validation Agent"],
    evals: ["Code Quality"],
    workers: integrationWorkerIds,
  },
  {
    name: "Specification extraction",
    description: "Derives a source-to-target traceability matrix from converted activities.",
    agents: ["Traceability Agent"],
    evals: ["Traceability", "SPEC Coverage"],
    workers: ["w-36", "w-29"],
    relatedConstructId: "construct-testing-source_to_target_traceability",
  },
  {
    name: "Payment instruction mapping",
    description: "Maps legacy payment instruction formats to the target payments schema.",
    agents: ["Payments Mapping Agent"],
    evals: ["Mapping Accuracy", "Data Integrity"],
    workers: [domainWorkerIds.payments],
  },
  {
    name: "Settlement reconciliation analysis",
    description: "Reconciles settlement records between legacy and target payment systems.",
    agents: ["Data Reconciliation Agent"],
    evals: ["Data Integrity"],
    workers: [domainWorkerIds.payments],
  },
  {
    name: "Payments compliance validation",
    description: "Validates converted payment flows against regulatory payment rules.",
    agents: ["Security Review Agent"],
    evals: ["Regulatory Compliance"],
    workers: [domainWorkerIds.payments],
  },
  {
    name: "Claims data extraction",
    description: "Extracts structured claim fields from unstructured intake documents.",
    agents: ["Claims Extraction Agent"],
    evals: ["Data Integrity"],
    workers: [domainWorkerIds.claims],
  },
  {
    name: "Claims workflow migration",
    description: "Converts legacy claims adjudication workflows to the target platform.",
    agents: ["Migration Agent"],
    evals: ["Functional Equivalence"],
    workers: [domainWorkerIds.claims],
  },
  {
    name: "Claims document classification",
    description: "Classifies incoming claim documents by type prior to extraction.",
    agents: ["Claims Extraction Agent"],
    evals: ["Documentation Completeness"],
    workers: [domainWorkerIds.claims],
  },
  {
    name: "Regulatory change detection",
    description: "Detects and classifies newly published regulatory changes.",
    agents: ["Regulatory Monitoring Agent"],
    evals: ["Regulatory Compliance"],
    workers: [domainWorkerIds.regulatory],
  },
  {
    name: "Policy impact analysis",
    description: "Assesses the impact of a regulatory change on existing internal policy.",
    agents: ["Regulatory Monitoring Agent"],
    evals: ["Regulatory Compliance"],
    workers: [domainWorkerIds.regulatory],
  },
  {
    name: "Regulatory reporting generation",
    description: "Assembles regulatory filings from source-of-record data.",
    agents: ["Reporting Agent"],
    evals: ["Documentation Completeness"],
    workers: [domainWorkerIds.regulatory],
  },
  {
    name: "Risk factor extraction",
    description: "Extracts risk-relevant fields from underwriting submissions.",
    agents: ["Underwriting Risk Agent"],
    evals: ["Data Integrity"],
    workers: [domainWorkerIds.underwriting],
  },
  {
    name: "Underwriting rule migration",
    description: "Converts legacy underwriting rule sets to the target rules engine.",
    agents: ["Migration Agent"],
    evals: ["Functional Equivalence"],
    workers: [domainWorkerIds.underwriting],
  },
  {
    name: "Underwriting decision analysis",
    description: "Analyzes underwriting decision consistency against rating guidelines.",
    agents: ["Underwriting Risk Agent"],
    evals: ["Regulatory Compliance"],
    workers: [domainWorkerIds.underwriting],
  },
];

export const skills: Skill[] = skillCatalog.map((s) => {
  const agentIds = s.agents.map((n) => agentByName(n).id);
  const toolIds = Array.from(new Set(agentIds.flatMap((aid) => byId(agents, aid).toolIds)));
  return {
    id: `skill-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: s.name,
    description: s.description,
    status: "Active",
    workerIds: s.workers,
    agentIds,
    toolIds,
    evaluationIds: s.evals.map((n) => evalByName(n).id),
    relatedConstructId: s.relatedConstructId,
  };
});

export function getSkill(id: string) {
  return skills.find((s) => s.id === id);
}
const skillByName = (name: string) => byName(skills, name);

for (const skill of skills) {
  for (const agentId of skill.agentIds) byId(agents, agentId).skillIds.push(skill.id);
  for (const evalId of skill.evaluationIds) {
    const ev = byId(evaluations, evalId);
    for (const wid of skill.workerIds) if (!ev.workerIds.includes(wid)) ev.workerIds.push(wid);
  }
}

// ---------------------------------------------------------------------------
// Domain Language (grouped terms)
// ---------------------------------------------------------------------------

const domainTermCatalog: { term: string; description: string; ruleCount: number; group: string; workers: string[]; skills: string[] }[] = [
  { term: "JMS", description: "Java Message Service — the messaging API TIBCO JMS activities are converted onto.", ruleCount: 2, group: "TIBCO Integration", workers: ["w-36", "w-29", "w-11"], skills: ["JMS migration"] },
  { term: "BusinessWorks", description: "The TIBCO process engine and its activity/process-definition model.", ruleCount: 1, group: "TIBCO Integration", workers: integrationWorkerIds, skills: ["TIBCO process analysis"] },
  { term: "Service orchestration", description: "The ordered sequence of activities that make up a TIBCO process.", ruleCount: 2, group: "TIBCO Integration", workers: integrationWorkerIds, skills: ["Service orchestration"] },
  { term: "Message contract", description: "The schema a message must satisfy to be accepted by a receiver.", ruleCount: 1, group: "TIBCO Integration", workers: ["w-36", "w-29", "w-11", "w-42"], skills: ["API transformation"] },
  { term: "Transaction boundary", description: "The scope within which activities commit or roll back together.", ruleCount: 2, group: "TIBCO Integration", workers: ["w-36", "w-29"], skills: ["Transaction migration"] },
  { term: "Acknowledgement", description: "The mode by which a JMS consumer confirms message receipt.", ruleCount: 2, group: "TIBCO Integration", workers: ["w-36", "w-11"], skills: ["JMS migration"] },
  { term: "Durable subscription", description: "A subscription that retains messages for a consumer while it is offline.", ruleCount: 1, group: "TIBCO Integration", workers: ["w-36", "w-29", "w-11"], skills: ["JMS migration"] },
  { term: "DLQ", description: "Dead-letter queue — where messages land after exceeding redelivery limits.", ruleCount: 2, group: "TIBCO Integration", workers: ["w-36", "w-11"], skills: ["JMS migration"] },
  { term: "Redelivery", description: "The retry behavior applied to a message before it is dead-lettered.", ruleCount: 1, group: "TIBCO Integration", workers: ["w-36", "w-11"], skills: ["JMS migration"] },
  { term: "JMS delivery guarantee", description: "The at-least-once / at-most-once contract a JMS destination provides.", ruleCount: 4, group: "TIBCO Integration", workers: ["w-36", "w-29", "w-11"], skills: ["JMS migration"] },
  { term: "Correlation ID", description: "The identifier used to associate related messages across a process.", ruleCount: 1, group: "TIBCO Integration", workers: ["w-36", "w-29"], skills: ["Service orchestration"] },
  { term: "Idempotency key", description: "The field used to detect and suppress duplicate message processing.", ruleCount: 1, group: "TIBCO Integration", workers: ["w-36"], skills: ["Service orchestration"] },
  { term: "Process variable", description: "A TIBCO process-scoped variable carried across activities.", ruleCount: 2, group: "TIBCO Integration", workers: integrationWorkerIds, skills: ["TIBCO process analysis"] },

  { term: "Settlement", description: "The exchange of funds that finalizes a payment instruction.", ruleCount: 4, group: "Payments", workers: [domainWorkerIds.payments], skills: ["Settlement reconciliation analysis"] },
  { term: "Clearing", description: "The process of reconciling and confirming a payment prior to settlement.", ruleCount: 3, group: "Payments", workers: [domainWorkerIds.payments], skills: ["Settlement reconciliation analysis"] },
  { term: "Authorization", description: "The approval step confirming a payment instruction may proceed.", ruleCount: 3, group: "Payments", workers: [domainWorkerIds.payments], skills: ["Payments compliance validation"] },
  { term: "Payment instruction", description: "The structured request initiating a funds transfer.", ruleCount: 5, group: "Payments", workers: [domainWorkerIds.payments], skills: ["Payment instruction mapping"] },
  { term: "Reconciliation", description: "The process of matching payment records across two systems.", ruleCount: 4, group: "Payments", workers: [domainWorkerIds.payments], skills: ["Settlement reconciliation analysis"] },

  { term: "Claim intake", description: "The initial structured capture of a filed claim.", ruleCount: 3, group: "Claims", workers: [domainWorkerIds.claims], skills: ["Claims data extraction"] },
  { term: "Adjudication", description: "The evaluation determining whether and how much of a claim is payable.", ruleCount: 4, group: "Claims", workers: [domainWorkerIds.claims], skills: ["Claims workflow migration"] },
  { term: "Loss reserve", description: "The estimated liability set aside for an open claim.", ruleCount: 2, group: "Claims", workers: [domainWorkerIds.claims], skills: ["Claims workflow migration"] },
  { term: "Subrogation", description: "The right to recover a paid claim amount from a responsible third party.", ruleCount: 2, group: "Claims", workers: [domainWorkerIds.claims], skills: ["Claims workflow migration"] },

  { term: "Regulatory filing", description: "A structured submission required by a regulatory body.", ruleCount: 3, group: "Regulatory", workers: [domainWorkerIds.regulatory], skills: ["Regulatory reporting generation"] },
  { term: "Compliance obligation", description: "A specific requirement a regulated process must satisfy.", ruleCount: 4, group: "Regulatory", workers: [domainWorkerIds.regulatory], skills: ["Policy impact analysis"] },
  { term: "Reporting deadline", description: "The date by which a regulatory filing must be submitted.", ruleCount: 2, group: "Regulatory", workers: [domainWorkerIds.regulatory], skills: ["Regulatory reporting generation"] },

  { term: "Risk appetite", description: "The level of risk an underwriting guideline permits accepting.", ruleCount: 2, group: "Underwriting", workers: [domainWorkerIds.underwriting], skills: ["Underwriting decision analysis"] },
  { term: "Rating factor", description: "A variable used to price risk on an underwriting submission.", ruleCount: 3, group: "Underwriting", workers: [domainWorkerIds.underwriting], skills: ["Risk factor extraction"] },
  { term: "Underwriting guideline", description: "A documented rule constraining acceptable risk decisions.", ruleCount: 3, group: "Underwriting", workers: [domainWorkerIds.underwriting], skills: ["Underwriting rule migration"] },
];

export const domainTerms: DomainTerm[] = domainTermCatalog.map((d) => ({
  id: `term-${d.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  term: d.term,
  description: d.description,
  ruleCount: d.ruleCount,
  domainGroup: d.group,
  workerIds: d.workers,
  skillIds: d.skills.map((n) => skillByName(n).id),
}));

export function getDomainTerm(id: string) {
  return domainTerms.find((d) => d.id === id);
}

export function domainGroupsForWorker(workerId: string): { group: string; ruleCount: number; termCount: number }[] {
  const forWorker = domainTerms.filter((t) => t.workerIds.includes(workerId));
  const groups = new Map<string, { ruleCount: number; termCount: number }>();
  for (const t of forWorker) {
    const g = groups.get(t.domainGroup) ?? { ruleCount: 0, termCount: 0 };
    g.ruleCount += t.ruleCount;
    g.termCount += 1;
    groups.set(t.domainGroup, g);
  }
  return Array.from(groups.entries()).map(([group, v]) => ({ group, ...v }));
}

// ---------------------------------------------------------------------------
// Connectors (9)
// ---------------------------------------------------------------------------

const connectorCatalog: { name: string; description: string; tools: string[]; workers: string[] }[] = [
  { name: "GitHub Connector", description: "Reads and writes source repositories.", tools: ["GitHub"], workers: integrationWorkerIds },
  { name: "Jira Connector", description: "Reads work items and links generated changes back to tickets.", tools: [], workers: integrationWorkerIds },
  { name: "ServiceNow Connector", description: "Raises and tracks change requests for production deployment.", tools: [], workers: integrationWorkerIds },
  { name: "Slack Connector", description: "Posts run summaries and gate results to a review channel.", tools: [], workers: integrationWorkerIds },
  { name: "JMS Broker Connector", description: "Connects to source and target JMS brokers for migration verification.", tools: ["JMS Client", "Message Queue Inspector"], workers: ["w-36", "w-29", "w-11"] },
  { name: "Database Connector", description: "Connects to source and target relational databases.", tools: ["Database Schema Analyzer", "SQL Migration Tool"], workers: [domainWorkerIds.payments, domainWorkerIds.claims] },
  { name: "S3 Connector", description: "Reads and writes migration artifacts and evidence archives.", tools: ["Artifact Repository Client"], workers: integrationWorkerIds },
  { name: "REST API Connector", description: "Invokes and verifies converted REST endpoints.", tools: ["REST Client", "Postman"], workers: ["w-36", "w-29", "w-11", "w-42"] },
  { name: "SOAP Gateway Connector", description: "Invokes legacy SOAP endpoints during equivalence verification.", tools: ["SOAP Client"], workers: ["w-36", "w-29", "w-11"] },
];

export const connectors: Connector[] = connectorCatalog.map((c) => ({
  id: `connector-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: c.name,
  description: c.description,
  status: "Active",
  workerIds: c.workers,
  toolIds: c.tools.map((n) => toolByName(n).id),
}));

export function getConnector(id: string) {
  return connectors.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Policies (10)
// ---------------------------------------------------------------------------

const policyCatalog: { name: string; description: string; workers: string[] }[] = [
  { name: "Data Residency Policy", description: "Constrains where migration data and artifacts may be stored.", workers: [...integrationWorkerIds, domainWorkerIds.payments, domainWorkerIds.claims] },
  { name: "PII Handling Policy", description: "Governs how personally identifiable information is processed and logged.", workers: [...integrationWorkerIds, domainWorkerIds.payments, domainWorkerIds.claims, domainWorkerIds.underwriting] },
  { name: "Change Approval Policy", description: "Requires reviewer sign-off before a candidate decision is certified.", workers: integrationWorkerIds },
  { name: "Code Review Policy", description: "Requires an independent validation pass before code is proposed for merge.", workers: integrationWorkerIds },
  { name: "Secrets Management Policy", description: "Governs how credentials are retrieved and never persisted in artifacts.", workers: integrationWorkerIds },
  { name: "Production Deployment Policy", description: "Requires a passed regression gate before a pack may be published.", workers: integrationWorkerIds },
  { name: "Model Usage Policy", description: "Constrains which model may be used for which task category.", workers: integrationWorkerIds },
  { name: "Evidence Retention Policy", description: "Sets the minimum retention period for observation and evidence records.", workers: integrationWorkerIds },
  { name: "Access Control Policy", description: "Constrains which systems and data a Worker's tools may reach.", workers: [...integrationWorkerIds, domainWorkerIds.regulatory, domainWorkerIds.underwriting] },
  { name: "Third-Party Tool Policy", description: "Constrains which external tools may be invoked without additional approval.", workers: integrationWorkerIds },
];

export const policies: Policy[] = policyCatalog.map((p) => ({
  id: `policy-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: p.name,
  description: p.description,
  status: "Active",
  workerIds: p.workers,
}));

export function getPolicy(id: string) {
  return policies.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Capabilities (composed, 8)
// ---------------------------------------------------------------------------

const capabilityCatalog: { name: string; description: string; skills: string[]; workers: string[] }[] = [
  { name: "Service Modernization Capability", description: "End-to-end conversion of a TIBCO service orchestration process to Spring Boot.", skills: ["TIBCO → Spring Boot migration", "Service orchestration"], workers: integrationWorkerIds },
  { name: "Integration Testing Capability", description: "Generates and runs unit and integration tests for converted services.", skills: ["Unit test generation", "Integration test generation"], workers: ["w-36", "w-11", "w-29"] },
  { name: "Code Quality Assurance Capability", description: "Screens generated code against enterprise quality and security standards.", skills: ["Code quality analysis"], workers: integrationWorkerIds },
  { name: "Message Migration Capability", description: "Converts TIBCO JMS messaging behavior to Spring JMS equivalents.", skills: ["JMS migration"], workers: ["w-36", "w-29", "w-11"] },
  { name: "Payments Modernization Capability", description: "Converts and reconciles legacy payment instruction processing.", skills: ["Payment instruction mapping", "Settlement reconciliation analysis", "Payments compliance validation"], workers: [domainWorkerIds.payments] },
  { name: "Claims Modernization Capability", description: "Extracts, classifies and migrates legacy claims workflows.", skills: ["Claims data extraction", "Claims workflow migration", "Claims document classification"], workers: [domainWorkerIds.claims] },
  { name: "Regulatory Intelligence Capability", description: "Detects regulatory change and assesses its impact on internal policy.", skills: ["Regulatory change detection", "Policy impact analysis", "Regulatory reporting generation"], workers: [domainWorkerIds.regulatory] },
  { name: "Underwriting Analysis Capability", description: "Extracts risk factors and analyzes underwriting decision consistency.", skills: ["Risk factor extraction", "Underwriting rule migration", "Underwriting decision analysis"], workers: [domainWorkerIds.underwriting] },
];

export const capabilities: Capability[] = capabilityCatalog.map((c) => {
  const skillIds = c.skills.map((n) => skillByName(n).id);
  const agentIds = Array.from(new Set(skillIds.flatMap((sid) => byId(skills, sid).agentIds)));
  const toolIds = Array.from(new Set(agentIds.flatMap((aid) => byId(agents, aid).toolIds)));
  const evaluationIds = Array.from(new Set(skillIds.flatMap((sid) => byId(skills, sid).evaluationIds)));
  return {
    id: `capability-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: c.name,
    description: c.description,
    status: "Active",
    workerIds: c.workers,
    skillIds,
    agentIds,
    toolIds,
    evaluationIds,
  };
});

export function getCapability(id: string) {
  return capabilities.find((c) => c.id === id);
}
const capabilityByName = (name: string) => byName(capabilities, name);

// ---------------------------------------------------------------------------
// Workflows (5)
// ---------------------------------------------------------------------------

const workflowCatalog: { name: string; description: string; capabilities: string[]; workers: string[] }[] = [
  { name: "TIBCO Migration Workflow", description: "Orchestrates discovery, conversion, testing and gate evaluation for a TIBCO process.", capabilities: ["Service Modernization Capability", "Code Quality Assurance Capability"], workers: integrationWorkerIds },
  { name: "Test Generation Workflow", description: "Generates and executes the test suite for a converted service.", capabilities: ["Integration Testing Capability"], workers: ["w-36", "w-11", "w-29"] },
  { name: "Payments Modernization Workflow", description: "Converts, reconciles and validates legacy payment processing.", capabilities: ["Payments Modernization Capability"], workers: [domainWorkerIds.payments] },
  { name: "Claims Intake Workflow", description: "Extracts, classifies and migrates a legacy claim through to adjudication.", capabilities: ["Claims Modernization Capability"], workers: [domainWorkerIds.claims] },
  { name: "Regulatory Change Workflow", description: "Monitors, assesses and reports on incoming regulatory changes.", capabilities: ["Regulatory Intelligence Capability"], workers: [domainWorkerIds.regulatory] },
];

export const workflows: Workflow[] = workflowCatalog.map((w) => {
  const capabilityIds = w.capabilities.map((n) => capabilityByName(n).id);
  const skillIds = Array.from(new Set(capabilityIds.flatMap((cid) => byId(capabilities, cid).skillIds)));
  return {
    id: `workflow-${w.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: w.name,
    description: w.description,
    status: "Active",
    workerIds: w.workers,
    skillIds,
    capabilityIds,
  };
});

export function getWorkflow(id: string) {
  return workflows.find((w) => w.id === id);
}

// ---------------------------------------------------------------------------
// Worker lookups (shared Worker entity, defined in ../knowledge/data)
// ---------------------------------------------------------------------------

export { workers };
export function getCapabilityWorker(id: string) {
  return workers.find((w) => w.id === id);
}
