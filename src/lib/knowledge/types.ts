export type Outcome = "Met" | "Not met" | "Awaiting evidence" | "Not adjudicable" | "Not measured";
export type RunStatus = "Completed" | "In Progress";

export type ConstructStatus = "Nothing yet" | "Observed" | "Corroborated" | "Certified" | "Published";

export type CandidateStatus = "Pending" | "Ready to Certify" | "Contradictory" | "Deferred" | "Accepted" | "Rejected";
export type DecisionType = "Mapping" | "Pitfall" | "Procedure" | "Recommendation" | "Rule";

export type MemoryStatus = "Healthy, holding nothing" | "Lost on restart" | "Retained";

export type PackStatus = "Draft" | "Published" | "Blocked";

export interface Worker {
  id: string;
  name: string;
  boundedContext: string;
  runNumber: number;
}

export interface MetricResult {
  label: string;
  value: number | null;
  target: number;
  comparator: ">=";
  status: Outcome;
}

export interface DodCheck {
  label: string;
  status: Outcome;
  note?: string;
}

export interface EvidenceTimelineStep {
  label: string;
  at: string;
}

export interface Run {
  id: string;
  workerId: string;
  status: RunStatus;
  outcome: Outcome;
  startedAt: string;
  completedAt: string | null;
  metrics: MetricResult[];
  dodChecks: DodCheck[];
  timeline: EvidenceTimelineStep[];
  note?: string;
}

export interface Observation {
  id: string;
  runId: string;
  workerId: string;
  constructId: string;
  topicId: string;
  recordedAt: string;
  outcome: Outcome;
  summary: string;
  contradicts?: string[];
}

export interface LearningTopic {
  id: string;
  name: string;
}

export interface Construct {
  id: string;
  name: string;
  technicalKey: string;
  category: string;
  status: ConstructStatus;
  blockingReason: string | null;
}

export interface DecisionHistoryEntry {
  stage: string;
  at: string;
  note?: string;
}

export interface CandidateDecision {
  id: string;
  constructId: string;
  claim: string;
  type: DecisionType;
  status: CandidateStatus;
  supportingObservationIds: string[];
  contradictingObservationIds: string[];
  aiRecommendation: string;
  decisionHistory: DecisionHistoryEntry[];
  certifiedAt: string | null;
}

export interface RegressionGate {
  itemsTested: number;
  itemsTotal: number;
  previousPassRate: number | null;
  contradictions: number;
  requiredEvidenceComplete: boolean;
  status: "Passed" | "Blocked";
  blockingItemIds: string[];
}

export interface PackVersionRecord {
  version: string;
  publishedAt: string | null;
  status: PackStatus;
  summary: string;
}

export interface Pack {
  id: string;
  name: string;
  context: string;
  version: string;
  status: PackStatus;
  knowledgeItemIds: string[];
  publishedAt: string | null;
  publishedBy: string | null;
  regressionGate: RegressionGate;
  versions: PackVersionRecord[];
  limitations: string[];
}

export interface KnowledgeUsage {
  id: string;
  packId: string;
  workerId: string;
  runId: string;
  retrievedAt: string;
  outcome: Outcome;
}

export interface MemoryRecord {
  id: string;
  workerId: string;
  status: MemoryStatus;
  engine: string;
  documents: number;
  note: string;
  unavailable: { field: string; reason: string }[];
}

export interface GovernanceEvent {
  id: string;
  relatedId: string;
  type: string;
  at: string;
  actor: string;
  note: string;
}
