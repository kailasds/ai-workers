import type {
  Worker,
  Run,
  Observation,
  LearningTopic,
  Construct,
  CandidateDecision,
  Pack,
  KnowledgeUsage,
  MemoryRecord,
  GovernanceEvent,
} from "./types";

function pseudoId(seed: string): string {
  let h1 = 0,
    h2 = 0;
  for (let i = 0; i < seed.length; i++) {
    h1 = (Math.imul(h1, 31) + seed.charCodeAt(i)) >>> 0;
    h2 = (Math.imul(h2, 131) + seed.charCodeAt(i)) >>> 0;
  }
  const hex = (n: number, len: number) => n.toString(16).padStart(8, "0").slice(0, len);
  return `${hex(h1, 8)}-${hex(h2 >>> 16, 4)}-4${hex(h1 >>> 12, 3)}-9${hex(h2 >>> 8, 3)}-${hex(h1, 6)}${hex(h2, 6)}`;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

// ---------------------------------------------------------------------------
// Workers
// ---------------------------------------------------------------------------

export const workers: Worker[] = [
  { id: "w-36", name: "Integration Modernization Worker · Service orchestration #36", boundedContext: "Service orchestration", runNumber: 36 },
  { id: "w-29", name: "Integration Modernization Worker · Service orchestration #29", boundedContext: "Service orchestration", runNumber: 29 },
  { id: "w-11", name: "Integration Modernization Worker · Service orchestration #11", boundedContext: "Service orchestration", runNumber: 11 },
  { id: "w-42", name: "Integration Modernization Worker · Service orchestration #42", boundedContext: "Service orchestration", runNumber: 42 },
  { id: "w-18", name: "Integration Modernization Worker · Service orchestration #18", boundedContext: "Service orchestration", runNumber: 18 },
  { id: "w-52", name: "Integration Modernization Worker · Service orchestration #52", boundedContext: "Service orchestration", runNumber: 52 },
  { id: "w-07", name: "Integration Modernization Worker · Service orchestration #07", boundedContext: "Service orchestration", runNumber: 7 },
  { id: "w-payments", name: "Payments Modernization Worker", boundedContext: "Payments modernization", runNumber: 101 },
  { id: "w-claims", name: "Claims Modernization Worker", boundedContext: "Claims modernization", runNumber: 102 },
  { id: "w-regulatory", name: "Regulatory Intelligence Worker", boundedContext: "Regulatory intelligence", runNumber: 103 },
  { id: "w-underwriting", name: "Underwriting Analysis Worker", boundedContext: "Underwriting analysis", runNumber: 104 },
];

export function getWorker(id: string): Worker | undefined {
  return workers.find((w) => w.id === id);
}

// ---------------------------------------------------------------------------
// Learning topics (Learning Landscape)
// ---------------------------------------------------------------------------

export const topics: LearningTopic[] = [
  { id: "topic-service-conversion", name: "Service conversion" },
  { id: "topic-unit-tests", name: "Service conversion with unit tests" },
  { id: "topic-tests-traceability", name: "Service conversion with tests and traceability" },
];

// ---------------------------------------------------------------------------
// Constructs (Coverage — semantic knowledge units)
// ---------------------------------------------------------------------------

const constructCatalog: { name: string; key: string; category: string }[] = [
  { name: "JMS delivery guarantee", key: "jms.delivery_guarantee", category: "Messaging" },
  { name: "Acknowledgement mode", key: "jms.acknowledgement_mode", category: "Messaging" },
  { name: "Durable subscription", key: "jms.durable_subscription", category: "Messaging" },
  { name: "Message ordering", key: "jms.message_ordering", category: "Messaging" },
  { name: "Redelivery count and backoff", key: "jms.redelivery_backoff", category: "Messaging" },
  { name: "Duplicate suppression", key: "jms.duplicate_suppression", category: "Messaging" },
  { name: "DLQ routing and payload", key: "jms.dlq_routing_payload", category: "Messaging" },
  { name: "XA transaction boundary", key: "tx.xa_boundary", category: "Transactions" },
  { name: "Message expiry and TTL", key: "jms.message_ttl", category: "Messaging" },
  { name: "Service orchestration", key: "orchestration.service_orchestration", category: "Orchestration" },
  { name: "Error handling", key: "orchestration.error_handling", category: "Orchestration" },
  { name: "Retry policy", key: "orchestration.retry_policy", category: "Orchestration" },
  { name: "Timeout behavior", key: "orchestration.timeout_behavior", category: "Orchestration" },
  { name: "Correlation ID propagation", key: "orchestration.correlation_id", category: "Orchestration" },
  { name: "Transaction handling", key: "tx.transaction_handling", category: "Transactions" },
  { name: "Message transformation", key: "mapping.message_transformation", category: "Mapping" },
  { name: "Mapping rules", key: "mapping.mapping_rules", category: "Mapping" },
  { name: "Conditional routing", key: "orchestration.conditional_routing", category: "Orchestration" },
  { name: "Exception handling", key: "orchestration.exception_handling", category: "Orchestration" },
  { name: "Logging behavior", key: "observability.logging_behavior", category: "Observability" },
  { name: "Security configuration", key: "config.security_configuration", category: "Configuration" },
  { name: "Endpoint configuration", key: "config.endpoint_configuration", category: "Configuration" },
  { name: "Environment properties", key: "config.environment_properties", category: "Configuration" },
  { name: "Shared variables", key: "config.shared_variables", category: "Configuration" },
  { name: "Process state", key: "orchestration.process_state", category: "Orchestration" },
  { name: "Scheduling behavior", key: "orchestration.scheduling_behavior", category: "Orchestration" },
  { name: "Idempotency", key: "orchestration.idempotency", category: "Orchestration" },
  { name: "Audit traceability", key: "observability.audit_traceability", category: "Observability" },
  { name: "Unit test generation", key: "testing.unit_test_generation", category: "Testing" },
  { name: "Source-to-target traceability", key: "testing.source_to_target_traceability", category: "Testing" },
];

export const constructs: Construct[] = constructCatalog.map((c) => ({
  id: `construct-${c.key.replace(/\./g, "-")}`,
  name: c.name,
  technicalKey: c.key,
  category: c.category,
  status: "Nothing yet",
  blockingReason: "No Worker has reported an observation against this construct yet.",
}));

export function getConstruct(id: string): Construct | undefined {
  return constructs.find((c) => c.id === id);
}
export function findConstructByName(name: string): Construct {
  const c = constructs.find((x) => x.name === name);
  if (!c) throw new Error(`Unknown construct: ${name}`);
  return c;
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export const runs: Run[] = [
  {
    id: pseudoId("run-36-flagship"),
    workerId: "w-36",
    status: "Completed",
    outcome: "Met",
    startedAt: hoursAgo(14.6),
    completedAt: hoursAgo(14),
    metrics: [
      { label: "Functional Equivalence", value: 90, target: 85, comparator: ">=", status: "Met" },
      { label: "Code Quality", value: 88, target: 80, comparator: ">=", status: "Met" },
      { label: "Specs Coverage", value: 92, target: 85, comparator: ">=", status: "Met" },
    ],
    dodChecks: [
      { label: "Functional equivalence threshold", status: "Met" },
      { label: "Code quality threshold", status: "Met" },
      { label: "Specs coverage threshold", status: "Met" },
    ],
    timeline: [
      { label: "Run started", at: hoursAgo(14.6) },
      { label: "Source analyzed", at: hoursAgo(14.55) },
      { label: "TIBCO process interpreted", at: hoursAgo(14.45) },
      { label: "Conversion generated", at: hoursAgo(14.3) },
      { label: "Tests executed", at: hoursAgo(14.15) },
      { label: "Functional equivalence measured", at: hoursAgo(14.05) },
      { label: "Definition of Done evaluated", at: hoursAgo(14.02) },
      { label: "Observation recorded", at: hoursAgo(14) },
    ],
  },
  {
    id: pseudoId("run-29-flagship"),
    workerId: "w-29",
    status: "Completed",
    outcome: "Awaiting evidence",
    startedAt: hoursAgo(20.6),
    completedAt: hoursAgo(20),
    metrics: [
      { label: "Functional Equivalence", value: 91, target: 85, comparator: ">=", status: "Met" },
      { label: "Code Quality", value: null, target: 80, comparator: ">=", status: "Not measured" },
      { label: "Specs Coverage", value: 96, target: 85, comparator: ">=", status: "Met" },
    ],
    dodChecks: [
      { label: "Functional equivalence threshold", status: "Met" },
      { label: "Code quality threshold", status: "Not measured", note: "The runtime did not provide a code quality measurement for this run." },
      { label: "Specs coverage threshold", status: "Met" },
    ],
    timeline: [
      { label: "Run started", at: hoursAgo(20.6) },
      { label: "Source analyzed", at: hoursAgo(20.5) },
      { label: "TIBCO process interpreted", at: hoursAgo(20.4) },
      { label: "Conversion generated", at: hoursAgo(20.25) },
      { label: "Tests executed", at: hoursAgo(20.1) },
      { label: "Functional equivalence measured", at: hoursAgo(20.05) },
      { label: "Definition of Done evaluated", at: hoursAgo(20.02) },
      { label: "Observation recorded", at: hoursAgo(20) },
    ],
    note: "Some Definition of Done checks were not measured.",
  },
];

function addRun(seed: string, workerId: string, hAgo: number, outcome: Run["outcome"], status: Run["status"] = "Completed"): Run {
  const fe = outcome === "Met" ? 86 + (hAgo % 9) : outcome === "Not met" ? 71 + (hAgo % 6) : 80 + (hAgo % 10);
  const cq = outcome === "Not adjudicable" ? null : 78 + (hAgo % 12);
  const specs = outcome === "Not adjudicable" ? null : 84 + (hAgo % 13);
  const run: Run = {
    id: pseudoId(seed),
    workerId,
    status,
    outcome,
    startedAt: hoursAgo(hAgo + 0.4),
    completedAt: status === "Completed" ? hoursAgo(hAgo) : null,
    metrics: [
      { label: "Functional Equivalence", value: fe, target: 85, comparator: ">=", status: fe >= 85 ? "Met" : "Not met" },
      { label: "Code Quality", value: cq, target: 80, comparator: ">=", status: cq === null ? "Not measured" : cq >= 80 ? "Met" : "Not met" },
      { label: "Specs Coverage", value: specs, target: 85, comparator: ">=", status: specs === null ? "Not measured" : specs >= 85 ? "Met" : "Not met" },
    ],
    dodChecks: [
      { label: "Functional equivalence threshold", status: fe >= 85 ? "Met" : "Not met" },
      { label: "Code quality threshold", status: cq === null ? "Not measured" : cq >= 80 ? "Met" : "Not met" },
      { label: "Specs coverage threshold", status: specs === null ? "Not measured" : specs >= 85 ? "Met" : "Not met" },
    ],
    timeline: [
      { label: "Run started", at: hoursAgo(hAgo + 0.4) },
      { label: "Source analyzed", at: hoursAgo(hAgo + 0.3) },
      { label: "TIBCO process interpreted", at: hoursAgo(hAgo + 0.2) },
      { label: "Conversion generated", at: hoursAgo(hAgo + 0.12) },
      { label: "Tests executed", at: hoursAgo(hAgo + 0.06) },
      { label: "Functional equivalence measured", at: hoursAgo(hAgo + 0.03) },
      { label: "Definition of Done evaluated", at: hoursAgo(hAgo + 0.01) },
      { label: "Observation recorded", at: hoursAgo(hAgo) },
    ],
  };
  runs.push(run);
  return run;
}

// ---------------------------------------------------------------------------
// Observations — the authoritative 22 observations behind the whole module
// ---------------------------------------------------------------------------

const svcOrch = findConstructByName("Service orchestration").id;
const jmsGuarantee = findConstructByName("JMS delivery guarantee").id;
const msgOrdering = findConstructByName("Message ordering").id;
const dlqRouting = findConstructByName("DLQ routing and payload").id;
const ackMode = findConstructByName("Acknowledgement mode").id;
const unitTestGen = findConstructByName("Unit test generation").id;
const sourceTraceability = findConstructByName("Source-to-target traceability").id;

const topicA = "topic-service-conversion";
const topicB = "topic-unit-tests";
const topicC = "topic-tests-traceability";

export const observations: Observation[] = [];

function addObservation(
  seed: string,
  run: Run,
  constructId: string,
  topicId: string,
  hAgo: number,
  summary: string,
  contradicts?: string[]
) {
  const obs: Observation = {
    id: pseudoId(seed),
    runId: run.id,
    workerId: run.workerId,
    constructId,
    topicId,
    recordedAt: hoursAgo(hAgo),
    outcome: run.outcome,
    summary,
    contradicts,
  };
  observations.push(obs);
  return obs;
}

// Topic A — Service conversion (8 baseline + 1 reuse-generated = 9)
// obs-a1 is backed by the flagship #36 run (Met · FE 90% · Code Quality 88% · Specs 92%).
const r1 = runs[0];
addObservation("obs-a1", r1, svcOrch, topicA, 14, "Converted TIBCO service orchestration process to a Spring Boot @Service class with equivalent activity sequencing.");
const r2 = addRun("run-a2", "w-29", 16.5, "Met");
addObservation("obs-a2", r2, svcOrch, topicA, 16.5, "Independently reproduced the service orchestration conversion pattern with matching activity sequencing.");
const r3 = addRun("run-a3", "w-11", 17, "Met");
addObservation("obs-a3", r3, svcOrch, topicA, 17, "Applied the same orchestration conversion pattern to a three-activity TIBCO process; sequencing preserved.");
const r4 = addRun("run-a4", "w-36", 18.5, "Met");
addObservation("obs-a4", r4, svcOrch, topicA, 18.5, "Reused the orchestration conversion pattern on a process containing a nested sub-process call.");
// obs-a5 is backed by the flagship #29 run (Awaiting evidence · FE 91% · Specs 96% · Code Quality not measured).
const r5 = runs[1];
addObservation("obs-a5", r5, jmsGuarantee, topicA, 20, "Observed at-least-once delivery preserved after converting a TIBCO JMS receiver, but only one run has reported this so far.");
const r6 = addRun("run-a6", "w-11", 21, "Met");
addObservation("obs-a6", r6, msgOrdering, topicA, 21, "FIFO ordering held for a single-consumer queue conversion; no second Worker has reproduced this yet.");
const r7 = addRun("run-a7", "w-36", 22, "Not met");
const obsDlq1 = addObservation("obs-a7", r7, dlqRouting, topicA, 22, "DLQ payload envelope retained the original TIBCO XML wrapper after redelivery threshold was exceeded.");
const r8 = addRun("run-a8", "w-11", 23, "Not met");
addObservation("obs-a8", r8, dlqRouting, topicA, 23, "DLQ payload envelope was re-serialized to JSON after redelivery threshold was exceeded, contradicting the earlier observation.", [obsDlq1.id]);
obsDlq1.contradicts = [pseudoId("obs-a8")];

// Topic B — Service conversion with unit tests (8, workers #36 & #11 only)
const r9 = addRun("run-b1", "w-36", 14.2, "Met");
addObservation("obs-b1", r9, ackMode, topicB, 14.2, "CLIENT_ACKNOWLEDGE mode on the TIBCO JMS receiver mapped cleanly to Spring's manual acknowledgement mode.");
const r10 = addRun("run-b2", "w-11", 23.5, "Met");
addObservation("obs-b2", r10, ackMode, topicB, 23.5, "Reproduced the CLIENT_ACKNOWLEDGE-to-manual-acknowledgement mapping on a second, unrelated JMS listener.");
const r11 = addRun("run-b3", "w-36", 25, "Met");
addObservation("obs-b3", r11, ackMode, topicB, 25, "AUTO_ACKNOWLEDGE mode mapped to Spring's default container acknowledgement with no behavioral drift.");
const r12 = addRun("run-b4", "w-11", 27, "Met");
addObservation("obs-b4", r12, unitTestGen, topicB, 27, "Generated JUnit 5 scaffolding mirroring the TIBCO test suite for a converted order-intake service.");
const r13 = addRun("run-b5", "w-36", 29, "Met");
addObservation("obs-b5", r13, unitTestGen, topicB, 29, "JUnit 5 scaffolding generation reproduced on a converted payment-status service with equivalent assertions.");
const r14 = addRun("run-b6", "w-11", 31, "Met");
addObservation("obs-b6", r14, unitTestGen, topicB, 31, "Test scaffolding generation held for a service with mocked downstream HTTP dependencies.");
const r15 = addRun("run-b7", "w-11", 33, "Met");
addObservation("obs-b7", r15, ackMode, topicB, 33, "CLIENT_ACKNOWLEDGE mapping held on a queue with concurrent consumers.");
const r16 = addRun("run-b8", "w-36", 35, "Met");
addObservation("obs-b8", r16, unitTestGen, topicB, 35, "Test scaffolding generation reused successfully on a fourth converted service, no manual adjustment required.");

// Topic C — Service conversion with tests and traceability (5, workers #36 & #29)
const r17 = addRun("run-c1", "w-29", 14, "Met");
addObservation("obs-c1", r17, ackMode, topicC, 14, "AUTO_ACKNOWLEDGE mapping reproduced during a traceability-scoped conversion, third independent Worker to confirm.");
const r18 = addRun("run-c2", "w-29", 36, "Met");
addObservation("obs-c2", r18, ackMode, topicC, 36, "Second traceability-scoped run confirming AUTO_ACKNOWLEDGE mapping stability under audit logging.");
const r19 = addRun("run-c3", "w-36", 37.5, "Met");
addObservation("obs-c3", r19, sourceTraceability, topicC, 37.5, "Generated a source-to-target traceability matrix entry linking a TIBCO activity to its Spring Boot method.");
const r20 = addRun("run-c4", "w-29", 39, "Met");
addObservation("obs-c4", r20, sourceTraceability, topicC, 39, "Traceability matrix generation reproduced on a process with a conditional branch.");
const r21 = addRun("run-c5", "w-36", 40.5, "Not adjudicable");
addObservation("obs-c5", r21, sourceTraceability, topicC, 40.5, "Traceability matrix entry was generated, but the run terminated before functional equivalence could be measured.");

// Reuse loop: a previously non-contributing Worker retrieves the published pack
// and generates a new observation in Topic A — closes REUSE → NEW OBSERVATIONS.
const r22 = addRun("run-a9-reuse", "w-42", 2, "Met");
addObservation(
  "obs-a9-reuse",
  r22,
  svcOrch,
  topicA,
  2,
  "Retrieved the certified service orchestration conversion procedure from the published pack and reproduced it on a first run.",
);

// A couple of exploratory runs that did not produce an admissible observation —
// present in the run ledger but do not contribute construct evidence.
addRun("run-x1", "w-18", 44, "Not adjudicable");
addRun("run-x2", "w-52", 46, "Not adjudicable");
addRun("run-x3", "w-42", 5, "Not met", "Completed");

export function getObservation(id: string): Observation | undefined {
  return observations.find((o) => o.id === id);
}
export function getRun(id: string): Run | undefined {
  return runs.find((r) => r.id === id);
}
export function observationsFor(constructId: string): Observation[] {
  return observations.filter((o) => o.constructId === constructId);
}
export function observationsForTopic(topicId: string): Observation[] {
  return observations.filter((o) => o.topicId === topicId);
}
export function observationsForWorker(workerId: string): Observation[] {
  return observations.filter((o) => o.workerId === workerId);
}

// ---------------------------------------------------------------------------
// Candidate decisions
// ---------------------------------------------------------------------------

const evAckMode = observationsFor(ackMode).map((o) => o.id);
const evSvcOrch = observationsFor(svcOrch)
  .filter((o) => o.topicId === topicA && o.workerId !== "w-42")
  .map((o) => o.id);
const evUnitTest = observationsFor(unitTestGen).map((o) => o.id);
const evTraceability = observationsFor(sourceTraceability).map((o) => o.id);
const evDlq = observationsFor(dlqRouting).map((o) => o.id);
const evOrdering = observationsFor(msgOrdering).map((o) => o.id);

export const candidateDecisions: CandidateDecision[] = [
  {
    id: "cand-jms-ack",
    constructId: ackMode,
    claim: "JMS acknowledgement mode CLIENT_ACKNOWLEDGE maps to Spring Boot's manual-acknowledgement container mode.",
    type: "Mapping",
    status: "Ready to Certify",
    supportingObservationIds: evAckMode,
    contradictingObservationIds: [],
    aiRecommendation:
      "Recommended for certification because the mapping was observed across 3 Workers and 6 runs. All six runs produced equivalent results, with no contradicting observations recorded.",
    decisionHistory: [
      { stage: "Candidate created", at: hoursAgo(33) },
      { stage: "Evidence accumulated", at: hoursAgo(23.5) },
      { stage: "Evidence reviewed", at: hoursAgo(12) },
    ],
    certifiedAt: null,
  },
  {
    id: "cand-orchestration-procedure",
    constructId: svcOrch,
    claim: "Convert a TIBCO service orchestration process to a Spring Boot @Service class with equivalent activity sequencing.",
    type: "Procedure",
    status: "Accepted",
    supportingObservationIds: evSvcOrch,
    contradictingObservationIds: [],
    aiRecommendation:
      "Recommended for certification because the conversion procedure was observed across 3 Workers and 4 runs with no contradicting evidence.",
    decisionHistory: [
      { stage: "Candidate created", at: hoursAgo(18.5) },
      { stage: "Evidence accumulated", at: hoursAgo(17) },
      { stage: "Evidence reviewed", at: hoursAgo(9) },
      { stage: "Decision made", at: hoursAgo(8), note: "Accepted by platform reviewer." },
      { stage: "Certification", at: hoursAgo(8) },
      { stage: "Added to pack", at: hoursAgo(3) },
    ],
    certifiedAt: hoursAgo(8),
  },
  {
    id: "cand-unit-test-procedure",
    constructId: unitTestGen,
    claim: "Generate JUnit 5 test scaffolding mirroring TIBCO test cases for each converted service method.",
    type: "Procedure",
    status: "Accepted",
    supportingObservationIds: evUnitTest,
    contradictingObservationIds: [],
    aiRecommendation:
      "Recommended for certification because scaffolding generation was reproduced across 2 Workers and 4 runs with consistent assertions.",
    decisionHistory: [
      { stage: "Candidate created", at: hoursAgo(31) },
      { stage: "Evidence accumulated", at: hoursAgo(27) },
      { stage: "Evidence reviewed", at: hoursAgo(6) },
      { stage: "Decision made", at: hoursAgo(5), note: "Accepted by platform reviewer." },
      { stage: "Certification", at: hoursAgo(5) },
      { stage: "Added to pack", at: hoursAgo(3) },
    ],
    certifiedAt: hoursAgo(5),
  },
  {
    id: "cand-source-traceability-rule",
    constructId: sourceTraceability,
    claim: "Generate a source-to-target traceability matrix entry for each converted TIBCO activity referencing its Spring Boot equivalent.",
    type: "Rule",
    status: "Pending",
    supportingObservationIds: evTraceability,
    contradictingObservationIds: [],
    aiRecommendation:
      "Under initial review — the rule has been observed across 2 Workers and 3 runs. One run did not reach functional equivalence measurement before completing.",
    decisionHistory: [{ stage: "Candidate created", at: hoursAgo(39) }, { stage: "Evidence accumulated", at: hoursAgo(37.5) }],
    certifiedAt: null,
  },
  {
    id: "cand-dlq-pitfall",
    constructId: dlqRouting,
    claim: "DLQ payload envelope shape after redelivery differs depending on whether the TIBCO source used JMSQueueReceiver or a JMS bridge.",
    type: "Pitfall",
    status: "Contradictory",
    supportingObservationIds: evDlq,
    contradictingObservationIds: evDlq.length > 1 ? [evDlq[1]] : [],
    aiRecommendation:
      "Not recommended yet — two runs produced conflicting payload envelope shapes after the redelivery threshold was exceeded. Additional independent runs are needed before this can be certified.",
    decisionHistory: [{ stage: "Candidate created", at: hoursAgo(23) }, { stage: "Contradiction identified", at: hoursAgo(22) }],
    certifiedAt: null,
  },
  {
    id: "cand-message-ordering-rule",
    constructId: msgOrdering,
    claim: "FIFO message ordering is not guaranteed after conversion without an explicit sequencing key configuration.",
    type: "Rule",
    status: "Rejected",
    supportingObservationIds: evOrdering,
    contradictingObservationIds: [],
    aiRecommendation:
      "Not recommended for certification — only one Worker has reported this observation. Independent corroboration from at least one additional Worker is required.",
    decisionHistory: [
      { stage: "Candidate created", at: hoursAgo(21) },
      { stage: "Evidence reviewed", at: hoursAgo(10) },
      { stage: "Decision made", at: hoursAgo(9), note: "Rejected pending independent corroboration." },
    ],
    certifiedAt: null,
  },
  {
    id: "cand-xa-recommendation",
    constructId: findConstructByName("XA transaction boundary").id,
    claim: "Configure an explicit XA transaction manager bean when converting TIBCO processes that use JTA-scoped activities.",
    type: "Recommendation",
    status: "Deferred",
    supportingObservationIds: [],
    contradictingObservationIds: [],
    aiRecommendation:
      "Deferred — this recommendation was raised by a reviewer ahead of Worker evidence. No runs have yet exercised a JTA-scoped TIBCO process.",
    decisionHistory: [{ stage: "Candidate created", at: hoursAgo(50) }, { stage: "Decision made", at: hoursAgo(48), note: "Deferred pending evidence." }],
    certifiedAt: null,
  },
];

export function getCandidate(id: string): CandidateDecision | undefined {
  return candidateDecisions.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export const packs: Pack[] = [
  {
    id: "pack-tibco-springboot",
    name: "TIBCO BusinessWorks → Spring Boot Migration Pack",
    context: "tibco-to-springboot",
    version: "1.0",
    status: "Published",
    knowledgeItemIds: ["cand-orchestration-procedure", "cand-unit-test-procedure"],
    publishedAt: hoursAgo(3),
    publishedBy: "Platform Governance",
    regressionGate: {
      itemsTested: 2,
      itemsTotal: 2,
      previousPassRate: 100,
      contradictions: 0,
      requiredEvidenceComplete: true,
      status: "Passed",
      blockingItemIds: [],
    },
    versions: [
      { version: "1.0", publishedAt: hoursAgo(3), status: "Published", summary: "Initial publication: service orchestration procedure and unit test scaffolding procedure." },
    ],
    limitations: [
      "Does not yet include a certified JMS acknowledgement-mode mapping — still under review.",
      "Does not cover DLQ routing/payload behavior — evidence is currently contradictory.",
    ],
  },
  {
    id: "pack-tibco-springboot-v2-draft",
    name: "TIBCO BusinessWorks → Spring Boot Migration Pack",
    context: "tibco-to-springboot",
    version: "2.0-draft",
    status: "Blocked",
    knowledgeItemIds: ["cand-jms-ack", "cand-dlq-pitfall", "cand-message-ordering-rule"],
    publishedAt: null,
    publishedBy: null,
    regressionGate: {
      itemsTested: 1,
      itemsTotal: 3,
      previousPassRate: null,
      contradictions: 2,
      requiredEvidenceComplete: false,
      status: "Blocked",
      blockingItemIds: ["cand-dlq-pitfall", "cand-message-ordering-rule"],
    },
    versions: [{ version: "2.0-draft", publishedAt: null, status: "Blocked", summary: "Draft — blocked by unresolved contradictions in 2 candidate decisions." }],
    limitations: ["DLQ routing pitfall has contradicting evidence across 2 runs.", "Message ordering rule was rejected for insufficient independent corroboration."],
  },
];

export function getPack(id: string): Pack | undefined {
  return packs.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Knowledge usage (pack reuse)
// ---------------------------------------------------------------------------

export const knowledgeUsage: KnowledgeUsage[] = [
  { id: "usage-1", packId: "pack-tibco-springboot", workerId: "w-29", runId: r2.id, retrievedAt: hoursAgo(16.5), outcome: "Met" },
  { id: "usage-2", packId: "pack-tibco-springboot", workerId: "w-11", runId: r3.id, retrievedAt: hoursAgo(17), outcome: "Met" },
  { id: "usage-3", packId: "pack-tibco-springboot", workerId: "w-36", runId: r4.id, retrievedAt: hoursAgo(18.5), outcome: "Met" },
  { id: "usage-4", packId: "pack-tibco-springboot", workerId: "w-42", runId: r22.id, retrievedAt: hoursAgo(2), outcome: "Met" },
];

// ---------------------------------------------------------------------------
// Worker memory
// ---------------------------------------------------------------------------

export const memoryRecords: MemoryRecord[] = workers.map((w) => {
  const obsCount = observationsForWorker(w.id).length;
  if (obsCount === 0) {
    return {
      id: `mem-${w.id}`,
      workerId: w.id,
      status: "Healthy, holding nothing",
      engine: "gbrain 0.48.1.0",
      documents: 0,
      note: "The memory engine is healthy and holds nothing yet. Memory is written after a run, so a Worker that has not run holds none.",
      unavailable: [
        { field: "holds_entities", reason: "The engine publishes no entity count." },
        { field: "housekeeping", reason: "This engine version publishes no maintenance history." },
      ],
    };
  }
  return {
    id: `mem-${w.id}`,
    workerId: w.id,
    status: "Lost on restart",
    engine: "gbrain 0.48.1.0",
    documents: obsCount,
    note: "Memory is on task-local storage and is destroyed every time the task is replaced.",
    unavailable: [
      { field: "verbs", reason: "This engine version publishes no per-verb call counts." },
      {
        field: "recall",
        reason: "The engine's statistics do not name the embedding model, so the route shown comes from Worker configuration rather than the engine itself.",
      },
    ],
  };
});

export function getMemory(workerId: string): MemoryRecord | undefined {
  return memoryRecords.find((m) => m.workerId === workerId);
}

// ---------------------------------------------------------------------------
// Governance events
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Derive initial construct status from the evidence and decisions above
// ---------------------------------------------------------------------------

function setConstructStatus(id: string, status: Construct["status"], blockingReason: string | null) {
  const c = constructs.find((x) => x.id === id);
  if (c) {
    c.status = status;
    c.blockingReason = blockingReason;
  }
}

setConstructStatus(svcOrch, "Published", null);
setConstructStatus(unitTestGen, "Published", null);
setConstructStatus(ackMode, "Corroborated", "Certification requires an approved candidate decision.");
setConstructStatus(sourceTraceability, "Corroborated", "Certification requires an approved candidate decision.");
setConstructStatus(dlqRouting, "Observed", "Evidence is conflicting across 2 runs.");
setConstructStatus(msgOrdering, "Observed", "Needs at least 1 additional independent Worker observation before corroboration.");
setConstructStatus(jmsGuarantee, "Observed", "Needs at least 1 additional independent Worker observation before corroboration.");

export const governanceEvents: GovernanceEvent[] = [
  { id: "gov-1", relatedId: "cand-orchestration-procedure", type: "Certification", at: hoursAgo(8), actor: "Platform Governance", note: "Certified after 3 independent Workers and 4 runs with no contradictions." },
  { id: "gov-2", relatedId: "cand-unit-test-procedure", type: "Certification", at: hoursAgo(5), actor: "Platform Governance", note: "Certified after 2 independent Workers and 4 runs with consistent assertions." },
  { id: "gov-3", relatedId: "pack-tibco-springboot", type: "Publication", at: hoursAgo(3), actor: "Platform Governance", note: "Published v1.0 with 2 certified knowledge items after regression gate passed." },
  { id: "gov-4", relatedId: "cand-message-ordering-rule", type: "Rejection", at: hoursAgo(9), actor: "Platform Governance", note: "Rejected pending independent corroboration from a second Worker." },
];
