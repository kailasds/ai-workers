export interface SkillEntry {
  id: string;
  name: string;
  group: string;
  origin: "TCS" | "Third party";
  description: string;
  tags: string[];
  usedByWorkers: number;
}

export const skillStats = { total: 101, categories: 26, live: 100, tcsAuthored: 0 };

export const skillsByGroup = [
  { label: "Engineering", value: 35, color: "var(--color-status-blue)" },
  { label: "Domain", value: 51, color: "var(--color-status-amber)" },
  { label: "Security", value: 8, color: "var(--color-status-green)" },
  { label: "Compliance", value: 7, color: "var(--color-status-purple)" },
];

export const skills: SkillEntry[] = [
  { id: "sk-1", name: "Java Spring Boot — Service Class Conversion", group: "Engineering", origin: "TCS", description: "Converts source code from any language or integration platform into Java Spring Boot service classes while preserving business logic exactly.", tags: ["java", "spring-boot"], usedByWorkers: 174 },
  { id: "sk-2", name: "MuleSoft to Spring Boot modernization", group: "Modernisation", origin: "TCS", description: "Use when converting MuleSoft Mule 4 applications to Spring Boot. Applies only MuleSoft-to-target component mapping.", tags: ["dataweave", "java"], usedByWorkers: 174 },
  { id: "sk-3", name: "Spring Boot enterprise standards", group: "Development", origin: "TCS", description: "Enforces comprehensive Java Spring Boot standards including architecture, security, testing, validation and observability.", tags: ["java", "junit"], usedByWorkers: 174 },
  { id: "sk-4", name: "TIBCO BusinessWorks to Spring Boot modernization", group: "Modernisation", origin: "TCS", description: "Source-to-target conversion guidance for modernizing TIBCO ActiveMatrix BusinessWorks applications to Java Spring Boot.", tags: ["businessworks", "bw5"], usedByWorkers: 174 },
  { id: "sk-5", name: "Java Spring Boot — Code Quality Checklist (Java 21+)", group: "Engineering", origin: "TCS", description: "A gating checklist for validating generated Java Spring Boot code against Java 21+ standards across twelve dimensions.", tags: ["java", "spring-boot"], usedByWorkers: 170 },
  { id: "sk-6", name: "Anthropic Security Review — Context-Aware Secure-Code Review", group: "Security", origin: "Third party", description: "Context-aware secure-code review: traces attacker-controlled inputs to dangerous sinks and reports only exploitable vulnerabilities.", tags: ["security", "code-review"], usedByWorkers: 167 },
  { id: "sk-7", name: "Payments Data Handling", group: "Domain", origin: "TCS", description: "How every agent in the payments suite handles card data, bank account identifiers and the values that sit next to them.", tags: ["pci-dss", "card-data"], usedByWorkers: 133 },
  { id: "sk-8", name: "Payments Integration API Standards", group: "Domain", origin: "TCS", description: "The standards a partner integration has to meet before it is certified: idempotency keys, retry and timeout semantics.", tags: ["api-standards", "idempotency"], usedByWorkers: 90 },
  { id: "sk-9", name: "webMethods Integration Server to Spring Boot modernization", group: "Modernisation", origin: "TCS", description: "Use when converting IBM webMethods Integration Server applications to Spring Boot. Applies only webMethods-to-target mapping.", tags: ["flow-service", "integration-server"], usedByWorkers: 9 },
  { id: "sk-10", name: "Adverse Media Classification Standards", group: "Domain", origin: "TCS", description: "How adverse media findings about a party are classified, weighted and reported: the event categories that matter.", tags: ["adverse-media", "negative-news"], usedByWorkers: 174 },
  { id: "sk-11", name: "Agentic Harness Blueprint", group: "Architecture", origin: "TCS", description: "System-level reference for designing a multi-agent harness in BFSI: framework-agnostic patterns, context engineering, durability.", tags: ["harness", "multi-agent"], usedByWorkers: 12 },
  { id: "sk-12", name: "BDD Feature File Authoring Standards", group: "Quality engineering", origin: "TCS", description: "House standards for turning an approved test case into a Cucumber feature file: one test case to one scenario.", tags: ["bdd", "cucumber"], usedByWorkers: 6 },
  { id: "sk-13", name: "BSA/AML SME Lending Overlay", group: "Lending", origin: "TCS", description: "BSA/AML overlay for SME lending — KYB depth, beneficial-ownership reporting under the Corporate Transparency Act.", tags: ["lending", "bsa_aml"], usedByWorkers: 4 },
  { id: "sk-14", name: "CDD Enhanced Due Diligence Brief", group: "Risk", origin: "TCS", description: "Produce structured EDD briefs for high-risk onboarding cases, including risk drivers, controls and escalation recommendation.", tags: ["cdd", "edd"], usedByWorkers: 3 },
  { id: "sk-15", name: "Card Scheme Rules", group: "Payments", origin: "TCS", description: "The scheme rules an acquiring agent has to work inside: the dispute lifecycle and the response windows for each network.", tags: ["card-schemes", "dispute-lifecycle"], usedByWorkers: 5 },
  { id: "sk-16", name: "Card authorisation and acquiring — domain intelligence", group: "Domain intelligence", origin: "TCS", description: "Use the card authorisation and acquiring domain model to process, validate and reason about work in this domain.", tags: [], usedByWorkers: 11 },
  { id: "sk-17", name: "Catastrophic Exposure Brief", group: "Operations", origin: "TCS", description: "Generate an internal decision brief with trigger, exposure math, actions, human approvals and evidence sources.", tags: ["brief", "catastrophic-exposure"], usedByWorkers: 2 },
  { id: "sk-18", name: "Company Secretarial Governance", group: "Governance", origin: "TCS", description: "Evidence contract for entity-record matching, board-action preparation and statutory controls.", tags: ["company-secretarial", "entity-records"], usedByWorkers: 3 },
];

export interface DslEntry {
  id: string;
  name: string;
  scope: string[];
  axioms: number;
  measures: number;
  entities: number;
  hybridRules: number;
  version: string;
  available: boolean;
}

export interface BusinessArea {
  id: string;
  name: string;
  children?: BusinessArea[];
  dsls?: DslEntry[];
}

export const dslStats = { languagesPublished: 6, businessAreasWithOne: 6 };

export const businessAreas: BusinessArea[] = [
  {
    id: "bfsi",
    name: "BFSI",
    children: [
      {
        id: "banking",
        name: "Banking",
        children: [
          { id: "lending", name: "Lending", dsls: [{ id: "d-1", name: "US Small Commercial", scope: ["Workers Compensation", "Business Owners Policy"], axioms: 14, measures: 14, entities: 14, hybridRules: 27, version: "1.0.0", available: true }] },
          { id: "kyc", name: "KYC & Onboarding", dsls: [{ id: "d-2", name: "Merchant onboarding and risk", scope: ["Merchant Acquiring", "Payment Facilitation", "Marketplace"], axioms: 8, measures: 8, entities: 13, hybridRules: 7, version: "1.0.0", available: true }] },
          { id: "deposits", name: "Deposits", dsls: [] },
          { id: "collections", name: "Collections", dsls: [] },
          { id: "fraud-aml", name: "Fraud & AML", dsls: [{ id: "d-3", name: "Correspondent and instant payment rails", scope: ["High Value Wire", "Instant Payment", "Bulk Low Value Transfer", "Card Authorisation"], axioms: 14, measures: 7, entities: 10, hybridRules: 4, version: "1.1.0", available: true }] },
        ],
      },
      {
        id: "insurance",
        name: "Insurance",
        children: [
          { id: "underwriting", name: "Underwriting", dsls: [{ id: "d-4", name: "Longevity Risk", scope: ["Longevity Swap", "Longevity Reinsurance Treaty"], axioms: 12, measures: 8, entities: 13, hybridRules: 5, version: "1.0.0", available: false }] },
          { id: "claims", name: "Claims", dsls: [] },
          { id: "actuarial", name: "Actuarial", dsls: [] },
        ],
      },
      {
        id: "payments",
        name: "Payments",
        dsls: [
          { id: "d-5", name: "Payment exception and repair", scope: ["High Value Wire", "Instant Payment", "Bulk Low Value Transfer", "Correspondent Banking"], axioms: 9, measures: 10, entities: 14, hybridRules: 8, version: "1.0.0", available: true },
          { id: "d-6", name: "Card authorisation and acquiring", scope: ["Card Present", "Card Not Present", "Merchant Acquiring", "Issuing"], axioms: 11, measures: 8, entities: 15, hybridRules: 6, version: "1.0.0", available: true },
        ],
      },
    ],
  },
];

export interface EvalCriterion {
  id: string;
  name: string;
  category: "Engineering" | "Security" | "Compliance" | "Domain";
  kind: string;
  description: string;
  threshold: number;
  filedAs: string;
}

export const evalCounts = { Engineering: 30, Security: 15, Compliance: 10, Domain: 45 };

export const evalPlaybooks: EvalCriterion[] = [
  { id: "e-1", name: "Trajectory — strict match", category: "Engineering", kind: "Accuracy", description: "Compares the agent's tool-call trajectory against a reference trajectory using LangChain Agentevals' strict matcher.", threshold: 100, filedAs: "bfsi.harness.trajectory.strict" },
  { id: "e-2", name: "Trajectory — unordered match", category: "Engineering", kind: "Accuracy", description: "Set match of tool calls regardless of order (Agentevals unordered). Right calls present, no forbidden calls.", threshold: 90, filedAs: "bfsi.harness.trajectory.unordered" },
  { id: "e-3", name: "No Fabricated Requirements (Assumptions Declared)", category: "Engineering", kind: "Safety", description: "A test case may only assert behaviour the story, the acceptance criteria or the supplied application context actually states.", threshold: 80, filedAs: "qe.no_fabricated_requirements" },
  { id: "e-4", name: "Cost & latency budget", category: "Engineering", kind: "Operational", description: "Run cost <= envelope; P95 latency <= budget; tokens per agent <= cap. The Stop-Decision Backstop (FM9).", threshold: 90, filedAs: "bfsi.harness.budget.cost_latency" },
  { id: "e-5", name: "Handoff sufficiency", category: "Engineering", kind: "Operational", description: "Did the receiving agent proceed without re-clarification? Detects ping-pong handoffs early.", threshold: 85, filedAs: "bfsi.harness.handoff.sufficiency" },
  { id: "e-6", name: "Council consensus integrity", category: "Compliance", kind: "Compliance", description: "Counsel veto honored; 4/5 supermajority applied; skeptic never approves; re-deliberation triggered on split.", threshold: 100, filedAs: "bfsi.harness.council.consensus_integrity" },
  { id: "e-7", name: "No Real or Plausibly-Real Personal Data", category: "Security", kind: "Safety", description: "Every value in a generated dataset must be synthesized. No value may be a real personal identifier carried over from a source system.", threshold: 100, filedAs: "qe.pii_safety" },
  { id: "e-8", name: "Referential Integrity", category: "Engineering", kind: "Accuracy", description: "Deterministic cross-table check: every child record's parent keys must resolve to a parent record that was actually generated.", threshold: 100, filedAs: "qe.referential_integrity" },
  { id: "e-9", name: "Source Construct Mapping Accuracy", category: "Domain", kind: "Accuracy", description: "Was each source construct converted to the right target? A JMS topic subscriber must become a point-to-point listener.", threshold: 75, filedAs: "modernisation.construct_mapping_accuracy" },
  { id: "e-10", name: "Business Logic Fidelity", category: "Domain", kind: "Accuracy", description: "Did every piece of behaviour in the source survive the conversion? Each field mapping, derived value, default, branch.", threshold: 80, filedAs: "modernisation.logic_fidelity" },
];

export interface DodCriterion {
  id: string;
  workerType: string;
  name: string;
  clearedRate: number;
  runsCleared: number;
  runsTotal: number;
  measuredBy: string;
  reportedAs: string;
  graded: boolean;
}

export const definitionOfDoneCriteria: DodCriterion[] = [
  { id: "dod-1", workerType: "Modernization Worker", name: "Functional Equivalence", clearedRate: 85, runsCleared: 27, runsTotal: 39, measuredBy: "A model reading the source and the result", reportedAs: "Functional Equivalence", graded: true },
  { id: "dod-2", workerType: "Modernization Worker", name: "Specification coverage", clearedRate: 85, runsCleared: 39, runsTotal: 39, measuredBy: "A model reading the source and the result", reportedAs: "Specs Coverage", graded: true },
  { id: "dod-3", workerType: "Modernization Worker", name: "Golden dataset EVAL pass rate", clearedRate: 80, runsCleared: 15, runsTotal: 39, measuredBy: "A model reading the source and the result, one judgement per case", reportedAs: "EVALs Pass Rate", graded: true },
  { id: "dod-4", workerType: "Modernization Worker", name: "CodeBleu Score", clearedRate: 80, runsCleared: 0, runsTotal: 0, measuredBy: "A number the conversion pipeline computes", reportedAs: "CodeBleu Score", graded: false },
  { id: "dod-5", workerType: "Modernization Worker", name: "Code Quality", clearedRate: 80, runsCleared: 0, runsTotal: 0, measuredBy: "A number the conversion pipeline computes", reportedAs: "Code Quality", graded: false },
  { id: "dod-6", workerType: "Modernization Worker", name: "SonarQube Run score", clearedRate: 0, runsCleared: 0, runsTotal: 0, measuredBy: "An outside system", reportedAs: "SonarQube Run score", graded: false },
];

export interface SlmModel {
  id: string;
  name: string;
  domain: string;
  parameters: string;
  memory: string;
  weights: string;
  baseModel: string;
  description: string;
}

export const slmFarmStats = { fineTunedModels: 1, businessDomainsServed: 1, catalogue: 3 };

export const slmFarmModels: SlmModel[] = [
  { id: "slm-1", name: "FinChat XS (finance fine-tune)", domain: "finance", parameters: "0.36B parameters", memory: "About 2.2 GB", weights: "oopere/FinChat-XS", baseModel: "local/smollm2-360m", description: "Finance fine-tune of SmolLM2 360M — same architecture, so the workspace is directly comparable." },
];
