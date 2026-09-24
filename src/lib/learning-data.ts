export interface LearningFunnelStat {
  id: string;
  label: string;
  value: number;
  sub: string;
}

export const learningFunnel: LearningFunnelStat[] = [
  { id: "fed", label: "Runs that fed it", value: 39, sub: "Scored, and kept" },
  { id: "records", label: "Records kept", value: 39, sub: "One per scored run" },
  { id: "agreed", label: "Agreed across runs", value: 4, sub: "Several runs, same answer" },
  { id: "changed", label: "Skills changed", value: 1, sub: "Written into its own copy" },
];

export interface SkillChange {
  id: string;
  skill: string;
  kind: "checks" | "pitfalls";
  runsAgreed: number;
  summary: string;
  context: string;
  changedAt: string;
}

export const skillChanges: SkillChange[] = [
  {
    id: "sc-1",
    skill: "java-spring-boot-services",
    kind: "checks",
    runsAgreed: 6,
    summary:
      'Check the evaluation pass rate before finishing: on TIBCO to Java Spring Boot it is the tightest gate, clearing its bar of 80% on 82–88% across 6 runs that met their Definition of Done. What the scoring found: "No executed golden-dataset evaluation run or CI test report artifact was found in the workspace; this score is inferred from static alignment between the unit/controller test suite in target_codebase and the spec-defined scenarios they claim to cover, not from an observed test-execution result."',
    context: "Integration modernization · Insurance claims · Service conversion",
    changedAt: "2026-09-11",
  },
  {
    id: "sc-2",
    skill: "java-spring-boot-services",
    kind: "pitfalls",
    runsAgreed: 4,
    summary:
      "Converting TIBCO to Java Spring Boot, the evaluation pass rate is what falls short: 70–79% against a bar of 80% in 4 runs. What the scoring found: \"No external golden-dataset eval suite is present in the repository; evaluation relies on the modernizer's own 9 unit/integration tests, which pass logically against the spec but leave several use cases without direct automated verification.\"",
    context: "Integration modernization · Insurance claims · Service conversion",
    changedAt: "2026-09-11",
  },
];

export interface WorkerLearningCard {
  id: string;
  identityLabel: string;
  workerType: string;
  status: "Learning" | "Not running";
  recordsKept: number;
  runsThatFedIt: number;
  skillsChanged: number;
  boundedContext: string;
}

export const workersByWorkerLearning: WorkerLearningCard[] = [
  {
    id: "wl-1",
    identityLabel: "Integration modernization · Insurance claims · Service conversion",
    workerType: "modernization",
    status: "Learning",
    recordsKept: 18,
    runsThatFedIt: 18,
    skillsChanged: 2,
    boundedContext: "Converts Integration Service to Target Code",
  },
  {
    id: "wl-2",
    identityLabel: "Integration modernization · Commercial lending · Service conversion with tests and traceability",
    workerType: "modernization",
    status: "Not running",
    recordsKept: 8,
    runsThatFedIt: 8,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Traced Target Code",
  },
  {
    id: "wl-3",
    identityLabel: "Integration modernization · Payments · Service conversion with unit tests",
    workerType: "modernization",
    status: "Learning",
    recordsKept: 4,
    runsThatFedIt: 4,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Unit Tested Target Code",
  },
  {
    id: "wl-4",
    identityLabel: "Integration modernization · Payments",
    workerType: "modernization",
    status: "Not running",
    recordsKept: 2,
    runsThatFedIt: 2,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Unit Tested Target Code",
  },
  {
    id: "wl-5",
    identityLabel: "Integration modernization · Payments · Service conversion",
    workerType: "modernization",
    status: "Learning",
    recordsKept: 1,
    runsThatFedIt: 1,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Target Code",
  },
  {
    id: "wl-6",
    identityLabel: "Integration modernization · Payments",
    workerType: "modernization",
    status: "Not running",
    recordsKept: 1,
    runsThatFedIt: 1,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Unit Tested Target Code",
  },
  {
    id: "wl-7",
    identityLabel: "Integration modernization · Payments",
    workerType: "modernization",
    status: "Not running",
    recordsKept: 1,
    runsThatFedIt: 1,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Target Code",
  },
  {
    id: "wl-8",
    identityLabel: "Integration modernization · Payments",
    workerType: "modernization",
    status: "Not running",
    recordsKept: 1,
    runsThatFedIt: 1,
    skillsChanged: 0,
    boundedContext: "Converts Integration Service to Unit Tested Target Code",
  },
];

export const totalLearningWorkers = 184;
export const workersKeptNothingCount = 173;

export const everyBrainSummary = {
  workers: 184,
  avgRecordsPerWorker: 1.1,
  totalRunsFed: 39,
  totalSkillsChanged: 4,
};

export interface SharingPair {
  a: string;
  b: string;
  agreedAcrossRuns: number;
}

export interface SharingContextGroup {
  id: string;
  label: string;
  workersCouldCompare: number;
  pairs: SharingPair[];
  morePairs?: number;
}

export const sharingContexts: SharingContextGroup[] = [
  {
    id: "target-code",
    label: "Converts Integration Service to Target Code",
    workersCouldCompare: 166,
    pairs: [
      { a: "Integration modernization · Insurance claims · Service conversion", b: "Integration modernization · Payments · Service conversion", agreedAcrossRuns: 2 },
      { a: "Integration modernization · Cards and merchant services", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments · Service conversion #10", b: "Integration modernization · Payments · Service conversion #11", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments · Service conversion #12", b: "Integration modernization · Payments · Service conversion #13", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments", b: "Integration modernization · Policy administration", agreedAcrossRuns: 0 },
    ],
    morePairs: 77,
  },
  {
    id: "unit-tested",
    label: "Converts Integration Service to Unit Tested Target Code",
    workersCouldCompare: 16,
    pairs: [
      { a: "Integration modernization · Payments · Service conversion with unit tests", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
      { a: "Integration modernization · Payments · Service conversion with unit tests #2", b: "Integration modernization · Payments", agreedAcrossRuns: 0 },
    ],
    morePairs: 4,
  },
  {
    id: "traced",
    label: "Converts Integration Service to Traced Target Code",
    workersCouldCompare: 2,
    pairs: [
      {
        a: "Integration modernization · Commercial lending · Service conversion with tests and traceability",
        b: "Integration modernization · Payments · Service conversion with tests and traceability",
        agreedAcrossRuns: 2,
      },
    ],
  },
];

export const admissionRule = {
  agreeCount: "2",
  dodRequirement: "Required",
  whatTravels: "The shape of a conversion only",
  note: "Nothing a Worker saw is shared. What travels is the shape of a conversion, never the material it was performed on.",
  availability: "Not available yet",
};
