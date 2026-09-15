export interface WorkerComposition {
  id: string;
  identityLabel: string;
  domainLabel: string;
  boundedContextLabel: string;
  boundedContextDescription: string;
  revision: number;
  skills: number;
  languages: number;
  evals: number;
  dodCount: number;
  authority: string;
  runsOn: string;
  composedAt: string;
  sealedAt?: string;
  status: "assembling" | "ready-to-package" | "sealed";
}

export const assemblingCount = 40;

export const readyToPackage: WorkerComposition[] = [
  {
    id: "wc-1",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-15T05:11:00Z",
    status: "ready-to-package",
  },
  {
    id: "wc-2",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T17:52:00Z",
    status: "ready-to-package",
  },
];

export const alreadyPackaged: WorkerComposition[] = [
  {
    id: "wc-3",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Unit Tested Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 6,
    languages: 4,
    evals: 5,
    dodCount: 4,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-15T00:09:00Z",
    sealedAt: "2026-09-15T00:10:00Z",
    status: "sealed",
  },
  {
    id: "wc-4",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Unit Tested Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 4,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T18:36:00Z",
    sealedAt: "2026-09-14T18:37:00Z",
    status: "sealed",
  },
  {
    id: "wc-5",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T04:07:00Z",
    sealedAt: "2026-09-14T04:10:00Z",
    status: "sealed",
  },
  {
    id: "wc-6",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T16:17:00Z",
    sealedAt: "2026-09-13T16:18:00Z",
    status: "sealed",
  },
  {
    id: "wc-7",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T04:07:00Z",
    sealedAt: "2026-09-13T04:11:00Z",
    status: "sealed",
  },
  {
    id: "wc-8",
    identityLabel: "Integration modernization · Policy administration",
    domainLabel: "Policy administration",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "policy-administration",
    revision: 11,
    skills: 7,
    languages: 0,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T15:58:00Z",
    sealedAt: "2026-09-13T15:59:00Z",
    status: "sealed",
  },
  {
    id: "wc-9",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 9,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T12:38:00Z",
    sealedAt: "2026-09-13T12:47:00Z",
    status: "sealed",
  },
  {
    id: "wc-10",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 5,
    languages: 1,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T09:37:00Z",
    sealedAt: "2026-09-13T09:40:00Z",
    status: "sealed",
  },
];

export interface DeliveryRecipient {
  id: string;
  workerLabel: string;
  customer: string;
  state: "Prepared" | "Shared" | "Acknowledged";
  expires: string;
  digest: string;
}

export const readyToDeliver: WorkerComposition[] = [
  {
    id: "wc-8",
    identityLabel: "Integration modernization · Policy administration",
    domainLabel: "Policy administration",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "policy-administration",
    revision: 11,
    skills: 7,
    languages: 0,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T15:58:00Z",
    sealedAt: "2026-09-13T15:59:00Z",
    status: "sealed",
  },
  {
    id: "wc-9",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 9,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T12:38:00Z",
    sealedAt: "2026-09-13T12:47:00Z",
    status: "sealed",
  },
];

export const deliveredHistory: DeliveryRecipient[] = [
  { id: "d-1", workerLabel: "Integration modernization · Payments", customer: "UK Bank", state: "Prepared", expires: "No share window", digest: "sha256:f863bc098c90…" },
  { id: "d-2", workerLabel: "Integration modernization · Payments", customer: "US Customer", state: "Prepared", expires: "No share window", digest: "sha256:66d0c86f0b61…" },
  { id: "d-3", workerLabel: "Integration modernization · Payments", customer: "Test", state: "Prepared", expires: "No share window", digest: "sha256:e54fccb63c12…" },
  { id: "d-4", workerLabel: "Integration modernization · Payments", customer: "End-to-end verification recipient", state: "Prepared", expires: "No share window", digest: "sha256:e565ae6f8986…" },
  { id: "d-5", workerLabel: "Integration modernization · Payments", customer: "End-to-end verification recipient", state: "Prepared", expires: "No share window", digest: "sha256:f36490d286ae…" },
  { id: "d-6", workerLabel: "Integration modernization · Payments", customer: "Customer secure delivery", state: "Prepared", expires: "No share window", digest: "sha256:3eca298b2265…" },
];

export const registryStats = {
  workers: 181,
  servingNow: 3,
  readyRevision: 0,
  needsAttention: 0,
  boundedContextDistribution: [
    { label: "Converts Integration Service to Target Code", value: 163 },
    { label: "Converts Integration Service to Unit Tested Target Code", value: 16 },
    { label: "Converts Integration Service to Traced Target Code", value: 2 },
  ],
};

export interface RegistryCard {
  id: string;
  identityLabel: string;
  boundedContextLabel: string;
  owner: string;
  revision: number;
  composedAt: string;
  status: "New" | "Evolving" | "Learning";
  serving: "Provisioned" | "Active" | "Not run";
  runtime: string;
  gbrainMemories: number;
}

export const tcsManagedWorkers: RegistryCard[] = [
  { id: "wr-1", identityLabel: "Integration modernization · Payments", boundedContextLabel: "Converts Integration Service to Target Code", owner: "Ancy P S", revision: 11, composedAt: "2026-09-15", status: "New", serving: "Provisioned", runtime: "No runtime", gbrainMemories: 0 },
  { id: "wr-2", identityLabel: "Integration modernization · Insurance claims", boundedContextLabel: "Converts Integration Service to Target Code", owner: "rebuild", revision: 11, composedAt: "2026-09-10", status: "Evolving", serving: "Active", runtime: "1 serving · LOCAL", gbrainMemories: 18 },
  { id: "wr-3", identityLabel: "Integration modernization · Commercial lending", boundedContextLabel: "Converts Integration Service to Traced Target Code", owner: "rebuild", revision: 11, composedAt: "2026-09-10", status: "Learning", serving: "Active", runtime: "No runtime · ECS", gbrainMemories: 8 },
  { id: "wr-4", identityLabel: "Integration modernization · Payments", boundedContextLabel: "Converts Integration Service to Unit Tested Target Code", owner: "rebuild", revision: 11, composedAt: "2026-09-10", status: "Learning", serving: "Active", runtime: "1 serving · LOCAL", gbrainMemories: 4 },
];

export interface CustomerPackageRow {
  id: string;
  workerLabel: string;
  destination: string;
  digest: string;
  state: "Prepared" | "Shared" | "Acknowledged";
  preparedAt: string;
}

export const customerPackages: CustomerPackageRow[] = deliveredHistory.map((d, i) => ({
  id: `cp-${i}`,
  workerLabel: d.workerLabel,
  destination: d.customer,
  digest: d.digest,
  state: d.state,
  preparedAt: "2026-09-15",
}));

export interface RunRecord {
  id: string;
  convertedFrom: string;
  convertedTo: string;
  verdict: "Met" | "Not met";
  finishedAt: string;
  criteria: { label: string; verdict: "pass" | "fail"; score: number; threshold: number }[];
}

export const workerDetail = {
  id: "wr-4",
  title: "Integration modernization · Payments · Service conversion with unit tests",
  subtitle: "Integration pattern · Service orchestration modernization with unit testing",
  workerType: "modernization",
  owner: "rebuild",
  revision: 11,
  boundedContext: "Service orchestration modernization with unit testing",
  readinessCheck: "Not run",
  runtime: "1 serving · LOCAL",
  lastOutcome: "Not met",
  openException: "None observed · 0 memory contradictions",
  package: {
    intent: { summary: "1 Agent · Service orchestration with tests Harness · 2 Tools", outcome: "Convert the supplied legacy source into a compiling, testable target-language service that preserves the behaviour and integration contract of the source.", procedureStages: 4 },
    brain: { skills: 9, languages: 0, evals: 5, sentinel: "Watching" },
    dodCount: 4,
    autonomy: "Level 3 · Bounded",
    packagedRuntime: "TCS environment · 2h stop",
    sourcePath: "workers/integration_modernization_payments_service_conversion_with_unit_tests/r11-4b35290e2b35",
  },
  operatingProcedure: [
    { step: 1, name: "Analyzer", description: "Shallow and quick analysis the source code." },
    { step: 2, name: "Spec Generator", description: "Generates specifications from source code." },
    { step: 3, name: "Modernizer", description: "Generate code from the given specifications." },
    { step: 4, name: "Evaluator", description: "Evaluate the generated target codebase against input." },
  ],
  runs: [
    {
      id: "f7bfcf8d-4cb",
      convertedFrom: "Tibco",
      convertedTo: "Java Spring Boot",
      verdict: "Not met",
      finishedAt: "2026-09-10T16:16:41Z",
      criteria: [
        { label: "Functional Equivalence", verdict: "fail", score: 78, threshold: 85 },
        { label: "Specs Coverage", verdict: "pass", score: 93, threshold: 85 },
        { label: "EVALs Pass Rate", verdict: "fail", score: 45, threshold: 80 },
        { label: "Unit test Cases passed", verdict: "fail", score: 0, threshold: 85 },
      ],
    },
    { id: "2ec98327-223d", convertedFrom: "Tibco", convertedTo: "Java Spring Boot", verdict: "Not met", finishedAt: "2026-09-10T14:46:15Z", criteria: [] },
    { id: "b44204d9-3ec2", convertedFrom: "Tibco", convertedTo: "Java Spring Boot", verdict: "Met", finishedAt: "2026-09-10T13:44:10Z", criteria: [] },
    { id: "d227c069-29de", convertedFrom: "Tibco", convertedTo: "Java Spring Boot", verdict: "Not met", finishedAt: "2026-09-10T13:01:45Z", criteria: [] },
  ] as RunRecord[],
  routing: [
    { tier: "Tier 1", steps: 0, runsUsed: 0, metBar: null as number | null },
    { tier: "Tier 2", steps: 6, runsUsed: 4, metBar: 25 },
    { tier: "Tier 3", steps: 16, runsUsed: 4, metBar: 25 },
  ],
  brainActivity: {
    records: 1,
    documents: 0,
    entities: null as number | null,
    passages: 0,
    links: 0,
    timelineEntries: 0,
    consolidatesAfter: "After every scored run, and standing knowledge needs 3 runs that agree",
    lastPass: "No pass has run yet",
    nearMemory: "Kept close 14 days, moving away after 30 unused",
  },
  knowledgeLearning: {
    memoryEngineHealthy: true,
    runFacts: 1,
    pages: 0,
    chunks: 0,
    engine: "gbrain 0.48.1.0",
    status: "Healthy and learning",
    documents: 0,
    becomesKnowledgeAfter: "3 runs that agree, each having met its Definition of Done",
    recalledWithoutAsking: "The last 14 days, cooling after 30 days with nothing recalling it",
    skillsRule: "Adds to its own copy of a Skill",
    mayBecomeStanding: ["Conversion pathways it has proved", "Conventions of the target platform", "Failures it has learned to avoid"],
    neverDoes: ["Anything contested", "Credentials", "Anything that identifies a customer", "Customer source", "One-off workarounds", "Anything it has not verified"],
    memoryEntries: [
      { id: "m-1", summary: "A run converting Tibco to Java Spring Boot did not meet its Definition of Done. Functional Equivalence: 78.0 against 85%; Specs Coverage: 93.0 against 85%; EVALs Pass Rate: 45.0 against 80%; Unit test Cases passed: 0.0 against 85%.", age: "4 days ago" },
      { id: "m-2", summary: "A run converting Tibco to Java Spring Boot did not meet its Definition of Done. Functional Equivalence: 90.0 against 85%; Specs Coverage: 97.0 against 85%; EVALs Pass Rate: 82.0 against 80%; Unit test Cases passed: 81.8 against 85%.", age: "4 days ago" },
      { id: "m-3", summary: "A run converting Tibco to Java Spring Boot met its Definition of Done. Functional Equivalence: 87.0 against 85%; Specs Coverage: 93.0 against 85%; EVALs Pass Rate: 84.0 against 80%; Unit test Cases passed: 92.0 against 85%.", age: "4 days ago" },
      { id: "m-4", summary: "A run converting Tibco to Java Spring Boot did not meet its Definition of Done. Functional Equivalence: 86.0 against 85%; Specs Coverage: 93.0 against 85%; EVALs Pass Rate: 62.0 against 80%.", age: "4 days ago" },
    ],
  },
  sentinel: {
    configuredPosture: "Configured",
    lastObservedDecision: "No intervention observed",
    mode: "Shadow — detections are recorded and do not stop a run",
    checks: "The rules it was given — a banned action, work outside its scope, a fixed claim being rewritten; what the run is spending against its ceiling",
    tells: "rebuild",
    onContradiction: "Holds both and uses neither until a person settles it",
    heldFor: "30 days, escalating after 5 unresolved",
    neverChanges: ["bounded context", "definition of done", "policy floor", "domain language", "identity", "autonomy level"],
    neverConcludes: ["Work outside what it was composed to do", "Act further than its autonomy allows", "Revise anything it may never change", "Turn customer material into standing knowledge", "Carry on after it has been stopped"],
    recallBudget: "4,096 tokens · 10 items",
    onOverflow: "Drops what it was least likely to use",
    whoMayStop: "platform:worker-operations",
    furthestItMayGo: "Stop the run",
    stopsItselfOn: "a prohibition breach · an attempt to change something immutable · an exhausted budget",
  },
  runtimes: [
    { id: "rt-1", slot: "LOCAL · slot 1", kind: "Live", state: "running", image: "candidates@aa1d8f6711b8", createdAt: "2026-09-10 04:15 PM" },
    { id: "rt-2", slot: "LOCAL · slot 1", kind: "History", state: "terminated", image: "Not observed", createdAt: "2026-09-10 02:16 PM" },
    { id: "rt-3", slot: "LOCAL · slot 1", kind: "History", state: "terminated", image: "Not observed", createdAt: "2026-09-10 01:16 PM" },
    { id: "rt-4", slot: "LOCAL · slot 1", kind: "History", state: "terminated", image: "Not observed", createdAt: "2026-09-10 11:34 AM" },
  ],
  testPush: {
    name: "Credit check service",
    conversion: "TIBCO BusinessWorks → Java Spring Boot",
    size: "32 KB",
    description: "One credit-check process exposed as a SOAP service bound to a JMS queue, with its abstract WSDL, two XSD schemas, three substitution-variable sets, a deployment archive and a ZUnit test project.",
  },
  delivery: {
    builtPackages: 1,
    customerDeliveries: 0,
    sourcePublication: "Not published",
  },
};
