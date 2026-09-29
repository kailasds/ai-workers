// UI models for the V2 experience. These describe what the interface shows;
// they are not a backend contract.

export type Maturity = "silver" | "gold" | "platinum";
export type WorkerStatus = "active" | "paused" | "draft";

export type KnowledgeScope = "assigned" | "gained" | "platform";
export type KnowledgeKind = "skill" | "company" | "rule" | "safety" | "pattern";
export type KnowledgeStatus =
  | "active"
  | "under-review"
  | "revoked"
  | "replaced"
  | "retired"
  | "rejected";
export type KnowledgeHealth = "outdated" | "contradictory";

export interface HistoryEvent {
  id: string;
  label: string;
  detail?: string;
  tone?: "default" | "warn" | "bad";
  at: string;
}

export interface Knowledge {
  id: string;
  title: string;
  summary: string;
  scope: KnowledgeScope;
  kind: KnowledgeKind;
  status: KnowledgeStatus;
  /** Workers that were given this (assigned) or that use it (platform). */
  usedByWorkerIds: string[];
  sourceWorkerId?: string;
  /** Plain-language audiences, e.g. "Integration Modernization Workers". */
  availableTo: string[];
  notRecommendedFor?: string[];
  validation?: string[];
  reason?: string;
  reasonContext?: string;
  replacementKnowledgeId?: string;
  /** For a gained item that has been shared, the platform item it became. */
  sharedAsId?: string;
  /** For a platform item, the gained item it came from. */
  derivedFromId?: string;
  health?: KnowledgeHealth;
  healthNote?: string;
  history: HistoryEvent[];
  evidence?: { workerId: string; result: "ok" | "warn" }[];
}

export interface EvolutionStep {
  capability: string;
}

export interface EvolutionRecord {
  id: string;
  from: string;
  to: string;
  at: string;
  /** Only reasons the data actually supports. */
  reasons: string[];
}

export interface V2Worker {
  id: string;
  name: string;
  purpose: string;
  context: string;
  contextTag: string;
  status: WorkerStatus;
  revision: number;
  maturity?: Maturity;
  maturityReasons: string[];
  learningEnabled: boolean;
  assignedKnowledgeIds: string[];
  evolution: {
    enabled: boolean;
    autoEvolve: boolean;
    currentCapability: string;
    availablePaths: string[];
    history: EvolutionRecord[];
  };
}

export type LearningEventType =
  | "pattern-identified"
  | "learning-reviewed"
  | "knowledge-gained"
  | "knowledge-shared"
  | "knowledge-revoked"
  | "learning-rejected"
  | "evolution-proposed"
  | "evolution-approved";

export interface LearningEvent {
  id: string;
  workerId: string;
  type: LearningEventType;
  title: string;
  description: string;
  timestamp: string;
  knowledgeId?: string;
}

export type ReviewType = "learning" | "knowledge-sharing" | "evolution";
export type ReviewStatus = "needs-review" | "approved" | "rejected" | "held";

export interface SentinelReview {
  id: string;
  level: "worker" | "platform";
  type: ReviewType;
  /** Knowledge id for learning / sharing reviews, worker id for evolution. */
  subjectId: string;
  status: ReviewStatus;
  /** Evolution reviews only. */
  proposedCapability?: string;
  why?: string;
  impact?: string;
  validation?: string;
  /** Sharing reviews only: suggested audience. */
  suggestedScope?: string[];
  createdAt: string;
  decidedAt?: string;
  decision?: string;
  /** Decided by Platform Sentinel on its own, with no person asked. */
  automatic?: boolean;
  reasoning?: string;
}
