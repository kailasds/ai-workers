// Experience Hub — conceptual model
//
// Worker generates Experience Events
//   -> grouped into Experience Patterns
//     -> validated into Learnings (Experience Library)
//       -> generate Update Recommendations
//         -> reviewed / approved -> rolled out (Update History)
//           -> monitored -> new Experience Events

export interface HubWorker {
  id: string;
  name: string;
  domain: string;
}

export const hubWorkers: HubWorker[] = [
  { id: "claims-processing", name: "Claims Processing Worker", domain: "Claims" },
  { id: "document-intelligence", name: "Document Intelligence Worker", domain: "Document Operations" },
  { id: "policy-validation", name: "Policy Validation Worker", domain: "Underwriting" },
  { id: "customer-service", name: "Customer Service Worker", domain: "Customer Operations" },
  { id: "underwriting", name: "Underwriting Worker", domain: "Underwriting" },
  { id: "fraud-investigation", name: "Fraud Investigation Worker", domain: "Fraud & Risk" },
];

export function hubWorker(id: string): HubWorker {
  return hubWorkers.find((w) => w.id === id) ?? hubWorkers[0];
}

// ---------------------------------------------------------------------------
// Experience Stream
// ---------------------------------------------------------------------------

export type ExperienceType =
  | "Successful Strategy"
  | "Failure Pattern"
  | "Human Correction"
  | "New Edge Case"
  | "Tool Behavior"
  | "Decision Pattern"
  | "Exception Handling"
  | "Performance Observation";

export type MaturityStage =
  | "raw-experience"
  | "observed-pattern"
  | "under-validation"
  | "validated-learning"
  | "used-in-recommendation";

export const maturityLabel: Record<MaturityStage, string> = {
  "raw-experience": "Raw Experience",
  "observed-pattern": "Observed Pattern",
  "under-validation": "Under Validation",
  "validated-learning": "Validated Learning",
  "used-in-recommendation": "Used in Recommendation",
};

export const maturityOrder: MaturityStage[] = [
  "raw-experience",
  "observed-pattern",
  "under-validation",
  "validated-learning",
  "used-in-recommendation",
];

export interface ExperienceEvent {
  id: string;
  workerId: string;
  type: ExperienceType;
  title: string;
  whatHappened: string;
  outcome: string;
  maturity: MaturityStage;
  timestamp: string;
  environment: string;
  inputsContext: string[];
  workerAction: string;
  humanIntervention?: string;
  relatedExperienceIds: string[];
  aiAnalysis: string;
}

export const experienceEvents: ExperienceEvent[] = [
  {
    id: "exp-101",
    workerId: "document-intelligence",
    type: "Human Correction",
    title: "Validation correction",
    whatHappened: "The worker detected a missing critical field after downstream validation failed on a coverage document.",
    outcome: "Worker successfully corrected the issue using an alternate validation sequence — check critical fields before downstream processing.",
    maturity: "used-in-recommendation",
    timestamp: "2026-09-01T09:14:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Coverage document PDF", "Policy schema v4", "Downstream validation service"],
    workerAction: "Ran standard field validation, downstream processing rejected the record for a missing effective-date field.",
    humanIntervention: "Reviewer flagged the rejection and confirmed the field should have been caught before downstream handoff.",
    relatedExperienceIds: ["exp-102", "exp-103", "exp-104"],
    aiAnalysis: "This is the 4th occurrence of the same rejection cause in 30 days. Reordering validation to check critical fields first would have prevented the downstream rejection.",
  },
  {
    id: "exp-102",
    workerId: "document-intelligence",
    type: "Decision Pattern",
    title: "Alternate validation sequence attempted",
    whatHappened: "Worker attempted an alternate validation sequence that checks critical fields before running the full validation pass.",
    outcome: "Document passed downstream processing without rejection.",
    maturity: "validated-learning",
    timestamp: "2026-09-03T11:02:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Coverage document PDF", "Revised validation order"],
    workerAction: "Checked critical fields (effective date, insured name, coverage type) before running the standard validation pass.",
    relatedExperienceIds: ["exp-101", "exp-103", "exp-104"],
    aiAnalysis: "Consistent with exp-101 — reordering validation avoided a repeat downstream rejection.",
  },
  {
    id: "exp-103",
    workerId: "document-intelligence",
    type: "Successful Strategy",
    title: "Pattern held on a second document type",
    whatHappened: "The same critical-field-first validation sequence was applied to a claims intake document.",
    outcome: "Document passed on first attempt — no downstream rejection.",
    maturity: "validated-learning",
    timestamp: "2026-09-05T15:40:00Z",
    environment: "Production — Northbridge Insurance",
    inputsContext: ["Claims intake PDF", "Revised validation order"],
    workerAction: "Applied critical-field-first validation before the standard pass.",
    relatedExperienceIds: ["exp-101", "exp-102", "exp-104"],
    aiAnalysis: "Pattern generalizes beyond the original document type — increases confidence this is a reusable validation strategy, not a one-off fix.",
  },
  {
    id: "exp-104",
    workerId: "document-intelligence",
    type: "Successful Strategy",
    title: "Fourth consecutive successful pass",
    whatHappened: "Critical-field-first validation applied on a renewal document.",
    outcome: "Document passed downstream processing without incident.",
    maturity: "validated-learning",
    timestamp: "2026-09-07T08:55:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Renewal document PDF", "Revised validation order"],
    workerAction: "Applied critical-field-first validation before the standard pass.",
    relatedExperienceIds: ["exp-101", "exp-102", "exp-103"],
    aiAnalysis: "4 of 4 recent applications of this sequence succeeded — pattern promoted to a validated learning.",
  },
  {
    id: "exp-110",
    workerId: "claims-processing",
    type: "Failure Pattern",
    title: "Repeated incomplete processing",
    whatHappened: "Claim record processed with an incomplete supporting-document set, causing a downstream reconciliation failure.",
    outcome: "Claim required manual reprocessing after the gap was found during reconciliation.",
    maturity: "observed-pattern",
    timestamp: "2026-08-22T13:12:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Claim intake bundle", "Supporting document checklist"],
    workerAction: "Processed the claim once the minimum required documents were present, without checking the full expected set.",
    relatedExperienceIds: ["exp-111", "exp-112"],
    aiAnalysis: "3rd occurrence this month of the same failure mode — same root cause each time (partial document set treated as complete).",
  },
  {
    id: "exp-111",
    workerId: "claims-processing",
    type: "Failure Pattern",
    title: "Incomplete set again",
    whatHappened: "Second occurrence of the same incomplete-document issue on a different claim type.",
    outcome: "Reconciliation failure, manual correction required.",
    maturity: "observed-pattern",
    timestamp: "2026-08-27T10:30:00Z",
    environment: "Production — Northbridge Insurance",
    inputsContext: ["Claim intake bundle", "Supporting document checklist"],
    workerAction: "Same processing path as exp-110.",
    relatedExperienceIds: ["exp-110", "exp-112"],
    aiAnalysis: "Confirms the pattern is not isolated to one customer environment.",
  },
  {
    id: "exp-112",
    workerId: "claims-processing",
    type: "Human Correction",
    title: "Reviewer flags root cause",
    whatHappened: "A human reviewer traced the reconciliation failures back to the document-completeness check running after processing instead of before.",
    outcome: "Reviewer recommended validating document completeness before processing begins.",
    maturity: "under-validation",
    timestamp: "2026-08-29T16:05:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Reconciliation failure logs", "Reviewer notes"],
    workerAction: "N/A — human review of prior failures.",
    humanIntervention: "Reviewer proposed moving the completeness check earlier in the workflow.",
    relatedExperienceIds: ["exp-110", "exp-111"],
    aiAnalysis: "AI is currently validating this proposed reordering against the last 12 similar claims before promoting it to a learning.",
  },
  {
    id: "exp-120",
    workerId: "underwriting",
    type: "Decision Pattern",
    title: "Routing decision reduced escalations",
    whatHappened: "Worker routed a borderline risk score to a secondary review queue instead of auto-approving.",
    outcome: "Secondary review caught a data inconsistency that would have caused an incorrect approval.",
    maturity: "validated-learning",
    timestamp: "2026-08-15T09:40:00Z",
    environment: "Production — ABC Mutual",
    inputsContext: ["Applicant risk score", "Routing thresholds"],
    workerAction: "Applied a tightened routing threshold for borderline scores (within 3 points of the auto-approve cutoff).",
    relatedExperienceIds: ["exp-121"],
    aiAnalysis: "Tightened threshold reduced downstream escalations by catching inconsistencies earlier, across 19 similar cases.",
  },
  {
    id: "exp-121",
    workerId: "underwriting",
    type: "Successful Strategy",
    title: "Threshold change held under load",
    whatHappened: "Same tightened routing threshold applied across a batch of 18 additional applications.",
    outcome: "No incorrect approvals; 2 additional data inconsistencies caught before approval.",
    maturity: "validated-learning",
    timestamp: "2026-08-20T14:00:00Z",
    environment: "Production — ABC Mutual",
    inputsContext: ["Applicant risk scores", "Routing thresholds"],
    workerAction: "Applied tightened routing threshold.",
    relatedExperienceIds: ["exp-120"],
    aiAnalysis: "19 of 19 applications processed under the tightened threshold showed no negative effect on approval throughput.",
  },
  {
    id: "exp-130",
    workerId: "fraud-investigation",
    type: "Tool Behavior",
    title: "Bureau lookup tool returned partial results",
    whatHappened: "The external bureau data feed returned a partial response for a high-value claim investigation.",
    outcome: "Worker retried with a fallback data source and completed the investigation successfully.",
    maturity: "under-validation",
    timestamp: "2026-09-02T12:20:00Z",
    environment: "Production — SafeGuard Ltd.",
    inputsContext: ["Bureau data feed response", "Fallback data source"],
    workerAction: "Detected an incomplete response and automatically retried using a fallback source before continuing.",
    relatedExperienceIds: [],
    aiAnalysis: "First observation of this fallback behavior — AI is tracking whether the bureau feed continues returning partial results before recommending a permanent fallback strategy.",
  },
  {
    id: "exp-140",
    workerId: "customer-service",
    type: "New Edge Case",
    title: "Unusual multi-policy request",
    whatHappened: "Customer requested a change spanning three linked policies in a single conversation.",
    outcome: "Worker escalated the request to a human agent after partially completing two of the three changes.",
    maturity: "raw-experience",
    timestamp: "2026-09-06T17:45:00Z",
    environment: "Production — Global Bank",
    inputsContext: ["Customer conversation transcript", "Linked policy records"],
    workerAction: "Attempted to process each policy change sequentially, escalated when the third change required cross-policy validation not currently supported.",
    relatedExperienceIds: [],
    aiAnalysis: "Too early to generalize — first occurrence of a multi-policy request of this shape. Flagged for monitoring.",
  },
  {
    id: "exp-150",
    workerId: "policy-validation",
    type: "Exception Handling",
    title: "Retry-before-validate order caused duplicate charge",
    whatHappened: "Worker retried a failed payment authorization before re-validating the policy state, resulting in a duplicate authorization hold.",
    outcome: "Hold was reversed manually; no customer impact, but flagged as a process risk.",
    maturity: "observed-pattern",
    timestamp: "2026-08-30T10:10:00Z",
    environment: "Production — Acme Corporation",
    inputsContext: ["Payment authorization response", "Policy state"],
    workerAction: "Retried the authorization immediately after a timeout without first re-checking policy state.",
    relatedExperienceIds: ["exp-151"],
    aiAnalysis: "2nd occurrence of a retry-before-validate ordering issue — evaluating whether validation should always precede retry.",
  },
  {
    id: "exp-151",
    workerId: "policy-validation",
    type: "Exception Handling",
    title: "Second retry-ordering incident",
    whatHappened: "Same retry-before-validate sequence occurred on a different policy.",
    outcome: "Duplicate hold again, reversed manually.",
    maturity: "observed-pattern",
    timestamp: "2026-09-04T09:25:00Z",
    environment: "Production — ABC Mutual",
    inputsContext: ["Payment authorization response", "Policy state"],
    workerAction: "Same as exp-150.",
    relatedExperienceIds: ["exp-150"],
    aiAnalysis: "Consistent root cause across both incidents — validating policy state before retrying should be tested next.",
  },
];

// ---------------------------------------------------------------------------
// Experience Library (validated, reusable intelligence)
// ---------------------------------------------------------------------------

export type LibraryCategory =
  | "Decision Strategies"
  | "Validation Patterns"
  | "Tool Strategies"
  | "Workflow Improvements"
  | "Failure Patterns"
  | "Human Corrections"
  | "Exception Handling"
  | "Domain Knowledge";

export interface ValidatedLearning {
  id: string;
  title: string;
  type: string;
  derivedFrom: string;
  applicableTo: string;
  category: LibraryCategory;
  usedInCount: number;
  whatWasLearned: string;
  whyItMatters: string;
  evidenceSummary: string;
  observedIn: string[];
  applicableWorkerTypes: string[];
  knownLimitations: string;
  relatedUpdateIds: string[];
  appliedToWorkerNames: string[];
  sourceExperienceIds: string[];
}

export const validatedLearnings: ValidatedLearning[] = [
  {
    id: "learn-1",
    title: "Enhanced Document Validation Pattern",
    type: "Validation Strategy",
    derivedFrom: "Multiple operational experiences on document processing",
    applicableTo: "Document Processing Workers",
    category: "Validation Patterns",
    usedInCount: 3,
    whatWasLearned: "Checking critical fields (effective date, insured name, coverage type) before running the standard validation pass consistently prevents downstream rejections.",
    whyItMatters: "Downstream rejections require manual reprocessing, adding delay and review overhead. Catching the gap earlier removes that cost entirely.",
    evidenceSummary: "4 of 4 recent applications of the reordered validation sequence completed without a downstream rejection, across two document types and two customer environments.",
    observedIn: ["Document Intelligence Worker — Acme Corporation", "Document Intelligence Worker — Northbridge Insurance"],
    applicableWorkerTypes: ["Document Processing Workers", "Claims Processing Workers"],
    knownLimitations: "Only validated on coverage, claims-intake, and renewal document types so far — not yet tested on endorsement documents.",
    relatedUpdateIds: ["upd-1"],
    appliedToWorkerNames: ["Document Intelligence Worker"],
    sourceExperienceIds: ["exp-101", "exp-102", "exp-103", "exp-104"],
  },
  {
    id: "learn-2",
    title: "Tightened Borderline Risk Routing",
    type: "Decision Strategy",
    derivedFrom: "Underwriting routing decisions",
    applicableTo: "Underwriting and Risk Scoring Workers",
    category: "Decision Strategies",
    usedInCount: 1,
    whatWasLearned: "Routing risk scores within 3 points of the auto-approve threshold to secondary review catches data inconsistencies before they become incorrect approvals.",
    whyItMatters: "Incorrect approvals are costly to unwind and carry compliance risk. A small routing change catches them before they happen.",
    evidenceSummary: "19 of 19 applications processed under the tightened threshold showed no negative effect on throughput, and caught 3 inconsistencies that would otherwise have auto-approved.",
    observedIn: ["Underwriting Worker — ABC Mutual"],
    applicableWorkerTypes: ["Underwriting Workers", "Policy Validation Workers"],
    knownLimitations: "Validated only on borderline scores within 3 points of threshold — has not been tested on a wider band.",
    relatedUpdateIds: ["upd-4"],
    appliedToWorkerNames: [],
    sourceExperienceIds: ["exp-120", "exp-121"],
  },
  {
    id: "learn-3",
    title: "Document Completeness Before Processing",
    type: "Workflow Sequence",
    derivedFrom: "Claims reconciliation failures",
    applicableTo: "Claims Processing Workers",
    category: "Workflow Improvements",
    usedInCount: 0,
    whatWasLearned: "Validating that the full expected supporting-document set is present before processing begins — rather than after — prevents reconciliation failures.",
    whyItMatters: "Reconciliation failures require manual reprocessing and delay claim resolution for the customer.",
    evidenceSummary: "3 reconciliation failures this month traced to the same root cause: a partial document set was treated as complete. A human reviewer proposed reordering the check; AI is validating the fix against recent claims.",
    observedIn: ["Claims Processing Worker — Acme Corporation", "Claims Processing Worker — Northbridge Insurance"],
    applicableWorkerTypes: ["Claims Processing Workers"],
    knownLimitations: "Reordering is still under validation — not yet confirmed across enough cases to promote to a full recommendation.",
    relatedUpdateIds: [],
    appliedToWorkerNames: [],
    sourceExperienceIds: ["exp-110", "exp-111", "exp-112"],
  },
  {
    id: "learn-4",
    title: "Validate Policy State Before Retry",
    type: "Exception Handling",
    derivedFrom: "Payment authorization retry incidents",
    applicableTo: "Policy Validation Workers",
    category: "Exception Handling",
    usedInCount: 0,
    whatWasLearned: "Re-checking policy state before retrying a failed payment authorization prevents duplicate authorization holds.",
    whyItMatters: "Duplicate holds require manual reversal and create unnecessary friction, even when there's no lasting customer impact.",
    evidenceSummary: "2 incidents of the same retry-before-validate ordering causing a duplicate hold, across two different customer environments.",
    observedIn: ["Policy Validation Worker — Acme Corporation", "Policy Validation Worker — ABC Mutual"],
    applicableWorkerTypes: ["Policy Validation Workers", "Claims Processing Workers"],
    knownLimitations: "Only 2 occurrences observed — pattern is still under validation, not yet a confirmed learning.",
    relatedUpdateIds: [],
    appliedToWorkerNames: [],
    sourceExperienceIds: ["exp-150", "exp-151"],
  },
  {
    id: "learn-5",
    title: "Fallback Data Source on Partial Bureau Response",
    type: "Tool Strategy",
    derivedFrom: "Fraud investigation tool behavior",
    applicableTo: "Fraud Investigation Workers",
    category: "Tool Strategies",
    usedInCount: 0,
    whatWasLearned: "When the primary bureau data feed returns a partial response, retrying with a fallback source completes the investigation without manual intervention.",
    whyItMatters: "Partial responses previously required a human to manually source the missing data, slowing high-value investigations.",
    evidenceSummary: "First observed occurrence — the worker's automatic fallback resolved the case successfully. AI is monitoring for repeat occurrences before recommending this as a standard strategy.",
    observedIn: ["Fraud Investigation Worker — SafeGuard Ltd."],
    applicableWorkerTypes: ["Fraud Investigation Workers"],
    knownLimitations: "Single occurrence — not yet a validated pattern.",
    relatedUpdateIds: [],
    appliedToWorkerNames: [],
    sourceExperienceIds: ["exp-130"],
  },
];

// ---------------------------------------------------------------------------
// Update Recommendations
// ---------------------------------------------------------------------------

export type UpdateType =
  | "Decision Strategy"
  | "Validation Logic"
  | "Tool Usage"
  | "Agent Collaboration"
  | "Knowledge Update"
  | "Prompt / Instruction Strategy"
  | "Workflow Sequence"
  | "Exception Handling"
  | "Safety Policy";

export type RecommendationStatus =
  | "New"
  | "Ready for Review"
  | "In Validation"
  | "Approved"
  | "Scheduled"
  | "Applied"
  | "Monitoring"
  | "Dismissed";

export interface ComparisonRow {
  component: string;
  current: string;
  recommended: string;
}

export interface EvidenceStep {
  id: string;
  label: string;
  description: string;
}

export interface CompatibilityCheck {
  label: string;
  ok: boolean;
  note?: string;
}

export interface CustomizablePart {
  id: string;
  label: string;
  defaultOn: boolean;
}

export interface UpdateRecommendation {
  id: string;
  title: string;
  targetWorkerId: string;
  sourceLearningId: string;
  updateType: UpdateType;
  aiReason: string;
  expectedOutcome: string;
  status: RecommendationStatus;
  recommendedDate: string;
  observedAcross: number;
  consistentOutcome: string;
  applicableToCount: number;
  impactLevel: "High" | "Medium" | "Low";
  impactReason: string;
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
  aiSummary: string;
  currentBehavior: string[];
  recommendedBehavior: string[];
  comparisonTable: ComparisonRow[];
  compatibility: CompatibilityCheck[];
  rolloutSteps: string[];
  customizableParts: CustomizablePart[];
  evidenceTimeline: EvidenceStep[];
}

export const updateRecommendations: UpdateRecommendation[] = [
  {
    id: "upd-1",
    title: "Improve Document Validation Strategy",
    targetWorkerId: "claims-processing",
    sourceLearningId: "learn-1",
    updateType: "Validation Logic",
    aiReason: "A revised validation sequence consistently reduced incomplete processing cases and improved successful task completion for a closely related worker.",
    expectedOutcome: "Reduce validation failures",
    status: "Ready for Review",
    recommendedDate: "2026-09-08",
    observedAcross: 38,
    consistentOutcome: "Reduced repeated validation failures",
    applicableToCount: 3,
    impactLevel: "High",
    impactReason: "This pattern has been consistently successful across similar workflows and addresses a known, repeated failure point.",
    riskLevel: "Low Risk",
    aiSummary: "AI identified a repeated validation pattern that reduced incomplete document processing across similar operational scenarios. The pattern is compatible with the target worker's current workflow and is recommended as an improvement to its validation strategy.",
    currentBehavior: ["Extract Document", "Validate Fields", "Process"],
    recommendedBehavior: ["Extract Document", "Check Critical Fields", "Enhanced Validation", "Process"],
    comparisonTable: [
      { component: "Validation Strategy", current: "Standard validation", recommended: "Enhanced validation sequence — critical fields checked first" },
      { component: "Tool Usage", current: "Validation Tool A", recommended: "Validation Tool A + fallback strategy" },
      { component: "Exception Handling", current: "Retry after failure", recommended: "Validate missing fields before retry" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
      { label: "Existing tools supported", ok: true },
      { label: "Requires validation policy update", ok: false, note: "The updated field-check order must be reflected in the worker's validation policy document." },
    ],
    rolloutSteps: ["Sandbox Validation", "Limited Rollout", "Monitor Outcomes", "Full Rollout"],
    customizableParts: [
      { id: "validation-strategy", label: "Validation strategy", defaultOn: true },
      { id: "exception-handling", label: "Exception handling", defaultOn: true },
      { id: "tool-fallback", label: "Tool fallback strategy", defaultOn: false },
    ],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Worker encountered an incomplete document — downstream validation rejected it for a missing critical field." },
      { id: "e2", label: "Experience 2", description: "AI attempted an alternate validation sequence, checking critical fields before the standard pass." },
      { id: "e3", label: "Experience 3", description: "Outcome improved — the document passed downstream processing without rejection." },
      { id: "e4", label: "Experience 4", description: "The same pattern succeeded again on a different document type and customer environment." },
    ],
  },
  {
    id: "upd-2",
    title: "Reorder Document Completeness Check",
    targetWorkerId: "claims-processing",
    sourceLearningId: "learn-3",
    updateType: "Workflow Sequence",
    aiReason: "Three reconciliation failures this month traced to the same root cause — the document-completeness check runs after processing instead of before.",
    expectedOutcome: "Reduce reconciliation failures caused by incomplete document sets",
    status: "In Validation",
    recommendedDate: "2026-09-05",
    observedAcross: 3,
    consistentOutcome: "Same root cause across all 3 failures",
    applicableToCount: 2,
    impactLevel: "Medium",
    impactReason: "The failure pattern is consistent, but the proposed fix has not yet been validated across enough cases to confirm it fully resolves the issue.",
    riskLevel: "Low Risk",
    aiSummary: "A human reviewer traced repeated reconciliation failures to the completeness check running too late in the workflow. AI is validating the proposed reordering against recent claims before this becomes a full recommendation.",
    currentBehavior: ["Receive Claim Bundle", "Process Claim", "Reconcile", "Flag Gaps"],
    recommendedBehavior: ["Receive Claim Bundle", "Validate Completeness", "Process Claim", "Reconcile"],
    comparisonTable: [
      { component: "Workflow Sequence", current: "Completeness checked during reconciliation", recommended: "Completeness checked before processing begins" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
      { label: "Existing tools supported", ok: true },
    ],
    rolloutSteps: ["Sandbox Validation", "Limited Rollout", "Monitor Outcomes"],
    customizableParts: [{ id: "workflow-sequence", label: "Workflow sequence", defaultOn: true }],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Claim processed with an incomplete supporting-document set, causing a reconciliation failure." },
      { id: "e2", label: "Experience 2", description: "Second occurrence of the same failure mode on a different claim type." },
      { id: "e3", label: "Experience 3", description: "A human reviewer traced both failures to the completeness check running too late in the workflow." },
    ],
  },
  {
    id: "upd-3",
    title: "Validate Policy State Before Payment Retry",
    targetWorkerId: "policy-validation",
    sourceLearningId: "learn-4",
    updateType: "Exception Handling",
    aiReason: "Two incidents of a retry-before-validate ordering issue caused duplicate authorization holds across two customer environments.",
    expectedOutcome: "Eliminate duplicate authorization holds",
    status: "In Validation",
    recommendedDate: "2026-09-04",
    observedAcross: 2,
    consistentOutcome: "Same root cause across both incidents",
    applicableToCount: 2,
    impactLevel: "Medium",
    impactReason: "Only two occurrences have been observed so far — enough to identify the pattern, but AI wants more evidence before recommending it for approval.",
    riskLevel: "Low Risk",
    aiSummary: "AI is evaluating whether re-checking policy state before retrying a failed payment authorization consistently prevents duplicate holds. Two incidents observed so far share the same root cause.",
    currentBehavior: ["Authorize Payment", "Retry on Failure"],
    recommendedBehavior: ["Authorize Payment", "Re-validate Policy State", "Retry on Failure"],
    comparisonTable: [
      { component: "Exception Handling", current: "Retry immediately on timeout", recommended: "Re-validate policy state before retrying" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
    ],
    rolloutSteps: ["Sandbox Validation", "Monitor Outcomes"],
    customizableParts: [{ id: "exception-handling", label: "Exception handling", defaultOn: true }],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Retry-before-validate sequence caused a duplicate authorization hold, reversed manually." },
      { id: "e2", label: "Experience 2", description: "Same sequence caused a second duplicate hold on a different policy." },
    ],
  },
  {
    id: "upd-4",
    title: "Tighten Borderline Risk Routing Threshold",
    targetWorkerId: "underwriting",
    sourceLearningId: "learn-2",
    updateType: "Decision Strategy",
    aiReason: "Routing borderline risk scores to secondary review caught data inconsistencies before they became incorrect approvals, with no measurable impact on throughput.",
    expectedOutcome: "Reduce incorrect approvals on borderline risk scores",
    status: "Applied",
    recommendedDate: "2026-08-21",
    observedAcross: 19,
    consistentOutcome: "No incorrect approvals across all 19 applications",
    applicableToCount: 2,
    impactLevel: "High",
    impactReason: "This pattern was validated across 19 consecutive applications with zero negative effect on approval throughput, while catching 3 real inconsistencies.",
    riskLevel: "Low Risk",
    aiSummary: "AI identified that routing borderline risk scores to secondary review consistently caught data inconsistencies before approval, with no negative effect on throughput.",
    currentBehavior: ["Score Application", "Auto-Approve if Above Threshold"],
    recommendedBehavior: ["Score Application", "Route to Secondary Review if Within 3 Points of Threshold", "Auto-Approve"],
    comparisonTable: [
      { component: "Routing Threshold", current: "Single approve/decline cutoff", recommended: "Secondary review band within 3 points of cutoff" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
      { label: "Existing tools supported", ok: true },
    ],
    rolloutSteps: ["Sandbox Validation", "Limited Rollout", "Monitor Outcomes", "Full Rollout"],
    customizableParts: [{ id: "routing-threshold", label: "Routing threshold", defaultOn: true }],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Worker routed a borderline score to secondary review instead of auto-approving." },
      { id: "e2", label: "Experience 2", description: "Secondary review caught a data inconsistency that would have caused an incorrect approval." },
      { id: "e3", label: "Experience 3", description: "Same threshold applied across 18 additional applications with no negative effect on throughput." },
    ],
  },
  {
    id: "upd-5",
    title: "Adopt Fallback Data Source for Bureau Lookups",
    targetWorkerId: "fraud-investigation",
    sourceLearningId: "learn-5",
    updateType: "Tool Usage",
    aiReason: "A single observed case showed that falling back to a secondary data source resolves partial bureau responses without manual intervention.",
    expectedOutcome: "Reduce manual intervention on partial bureau responses",
    status: "New",
    recommendedDate: "2026-09-02",
    observedAcross: 1,
    consistentOutcome: "Fallback resolved the case successfully",
    applicableToCount: 1,
    impactLevel: "Low",
    impactReason: "Only one occurrence has been observed. AI is monitoring for repeat occurrences before this is strong enough evidence to recommend for approval.",
    riskLevel: "Low Risk",
    aiSummary: "AI observed a single case where a fallback data source resolved a partial bureau response automatically. More occurrences are needed before this becomes a confident recommendation.",
    currentBehavior: ["Request Bureau Data", "Escalate on Partial Response"],
    recommendedBehavior: ["Request Bureau Data", "Retry with Fallback Source", "Escalate if Fallback Also Fails"],
    comparisonTable: [
      { component: "Tool Usage", current: "Primary bureau feed only", recommended: "Primary bureau feed + fallback source" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
    ],
    rolloutSteps: ["Continue Monitoring", "Sandbox Validation"],
    customizableParts: [{ id: "tool-fallback", label: "Tool fallback strategy", defaultOn: true }],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Bureau data feed returned a partial response for a high-value claim investigation." },
      { id: "e2", label: "Experience 2", description: "Worker automatically retried using a fallback source and completed the investigation successfully." },
    ],
  },
  {
    id: "upd-6",
    title: "Escalation Path for Multi-Policy Requests",
    targetWorkerId: "customer-service",
    sourceLearningId: "learn-3",
    updateType: "Exception Handling",
    aiReason: "A first-of-its-kind multi-policy request required escalation partway through. AI is flagging this for monitoring before proposing a handling strategy.",
    expectedOutcome: "Reduce partial completions on cross-policy requests",
    status: "New",
    recommendedDate: "2026-09-06",
    observedAcross: 1,
    consistentOutcome: "Too early to determine",
    applicableToCount: 1,
    impactLevel: "Low",
    impactReason: "This is the first occurrence of this request shape — not yet enough evidence to recommend a specific change.",
    riskLevel: "Low Risk",
    aiSummary: "AI observed a customer request spanning three linked policies that the worker could not fully complete. This is being monitored for repeat occurrences before a specific update is proposed.",
    currentBehavior: ["Process Policy Change Sequentially"],
    recommendedBehavior: ["Detect Cross-Policy Request", "Escalate Immediately if Unsupported"],
    comparisonTable: [],
    compatibility: [{ label: "Compatible with current workflow", ok: true }],
    rolloutSteps: ["Continue Monitoring"],
    customizableParts: [],
    evidenceTimeline: [{ id: "e1", label: "Experience 1", description: "Customer requested changes spanning three linked policies in one conversation; worker escalated after partially completing two of three." }],
  },
  {
    id: "upd-7",
    title: "Apply Enhanced Validation Pattern to Underwriting Intake",
    targetWorkerId: "policy-validation",
    sourceLearningId: "learn-1",
    updateType: "Validation Logic",
    aiReason: "The validated document-validation pattern from Document Intelligence Worker is applicable to Policy Validation Worker's intake workflow.",
    expectedOutcome: "Reduce validation failures on policy intake documents",
    status: "Ready for Review",
    recommendedDate: "2026-09-08",
    observedAcross: 38,
    consistentOutcome: "Reduced repeated validation failures",
    applicableToCount: 3,
    impactLevel: "Medium",
    impactReason: "The pattern is well validated on a related worker, but has not yet been tested directly on Policy Validation Worker's specific document types.",
    riskLevel: "Low Risk",
    aiSummary: "This is a cross-worker application of the validated Enhanced Document Validation Pattern. AI recommends applying the same critical-fields-first sequence to Policy Validation Worker's intake documents.",
    currentBehavior: ["Extract Document", "Validate Fields", "Process"],
    recommendedBehavior: ["Extract Document", "Check Critical Fields", "Enhanced Validation", "Process"],
    comparisonTable: [
      { component: "Validation Strategy", current: "Standard validation", recommended: "Enhanced validation sequence — critical fields checked first" },
    ],
    compatibility: [
      { label: "Compatible with current workflow", ok: true },
      { label: "No model changes required", ok: true },
      { label: "Existing tools supported", ok: true },
    ],
    rolloutSteps: ["Sandbox Validation", "Limited Rollout", "Monitor Outcomes", "Full Rollout"],
    customizableParts: [{ id: "validation-strategy", label: "Validation strategy", defaultOn: true }],
    evidenceTimeline: [
      { id: "e1", label: "Experience 1", description: "Pattern validated on Document Intelligence Worker across 4 consecutive applications." },
      { id: "e2", label: "Experience 2", description: "AI identified Policy Validation Worker as a compatible target based on similar document intake structure." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Update History (applied / monitored updates)
// ---------------------------------------------------------------------------

export type HistoryStatus = "Monitoring" | "Successful Improvement" | "No Significant Impact" | "Negative Impact Detected" | "Rolled Back";

export interface UpdateHistoryItem {
  id: string;
  recommendationId: string;
  updateTitle: string;
  targetWorkerId: string;
  sourceLearning: string;
  status: HistoryStatus;
  appliedDate: string;
  rolloutMethod: string;
  currentOutcome: string;
  changesApplied: string[];
  timeline: { label: string; date: string }[];
  monitoringObservation: string;
  observedImpact: string;
  issuesDetected?: string;
}

export const updateHistory: UpdateHistoryItem[] = [
  {
    id: "hist-1",
    recommendationId: "upd-4",
    updateTitle: "Tighten Borderline Risk Routing Threshold",
    targetWorkerId: "underwriting",
    sourceLearning: "Tightened Borderline Risk Routing",
    status: "Monitoring",
    appliedDate: "2026-08-22",
    rolloutMethod: "Limited Rollout",
    currentOutcome: "Positive outcomes observed",
    changesApplied: ["Routing threshold widened to a 3-point secondary-review band"],
    timeline: [
      { label: "Recommended", date: "2026-08-21" },
      { label: "Approved", date: "2026-08-21" },
      { label: "Sandbox validated", date: "2026-08-22" },
      { label: "Limited rollout started", date: "2026-08-22" },
    ],
    monitoringObservation: "No negative behavioral changes detected.",
    observedImpact: "Improved handling of similar borderline-risk scenarios — 3 inconsistencies caught before approval since rollout, no increase in review time.",
  },
  {
    id: "hist-2",
    recommendationId: "upd-1-prior",
    updateTitle: "Standardize Copybook-to-DTO Field Mapping",
    targetWorkerId: "document-intelligence",
    sourceLearning: "Copybook-to-DTO Mapping Pattern",
    status: "Successful Improvement",
    appliedDate: "2026-08-12",
    rolloutMethod: "Full Rollout",
    currentOutcome: "Adopted as standard behavior",
    changesApplied: ["Field mapping order standardized across all document types", "Fallback mapping removed — no longer needed"],
    timeline: [
      { label: "Recommended", date: "2026-08-05" },
      { label: "Approved", date: "2026-08-07" },
      { label: "Sandbox validated", date: "2026-08-09" },
      { label: "Full rollout", date: "2026-08-12" },
      { label: "Confirmed successful", date: "2026-08-26" },
    ],
    monitoringObservation: "Sustained improvement across two weeks of monitoring with no regressions.",
    observedImpact: "Field mapping errors dropped to zero across all monitored document types.",
  },
  {
    id: "hist-3",
    recommendationId: "upd-old-1",
    updateTitle: "Adjust Claim Triage Priority Scoring",
    targetWorkerId: "claims-processing",
    sourceLearning: "Triage Priority Pattern",
    status: "No Significant Impact",
    appliedDate: "2026-07-30",
    rolloutMethod: "Limited Rollout",
    currentOutcome: "No measurable change",
    changesApplied: ["Priority scoring weights adjusted for high-value claims"],
    timeline: [
      { label: "Recommended", date: "2026-07-24" },
      { label: "Approved", date: "2026-07-26" },
      { label: "Limited rollout", date: "2026-07-30" },
      { label: "Review completed", date: "2026-08-13" },
    ],
    monitoringObservation: "Two weeks of monitoring showed no measurable change in triage accuracy or processing time.",
    observedImpact: "Outcome was statistically indistinguishable from the prior scoring weights.",
  },
  {
    id: "hist-4",
    recommendationId: "upd-old-2",
    updateTitle: "Auto-Escalate on Repeated Tool Timeout",
    targetWorkerId: "fraud-investigation",
    sourceLearning: "Tool Timeout Escalation Pattern",
    status: "Negative Impact Detected",
    appliedDate: "2026-08-01",
    rolloutMethod: "Limited Rollout",
    currentOutcome: "Rolled back",
    changesApplied: ["Auto-escalate to human review after 2 consecutive tool timeouts"],
    timeline: [
      { label: "Recommended", date: "2026-07-28" },
      { label: "Approved", date: "2026-07-29" },
      { label: "Limited rollout", date: "2026-08-01" },
      { label: "Issue detected", date: "2026-08-06" },
      { label: "Rolled back", date: "2026-08-07" },
    ],
    monitoringObservation: "Escalation volume increased 4x more than expected — most escalations resolved themselves on a simple retry.",
    observedImpact: "Human reviewer queue load increased significantly with no corresponding increase in caught issues.",
    issuesDetected: "The escalation threshold was too aggressive — most timeouts were transient network issues that resolved on retry, not genuine tool failures.",
  },
  {
    id: "hist-5",
    recommendationId: "upd-old-3",
    updateTitle: "Simplify Customer Verification Prompt Sequence",
    targetWorkerId: "customer-service",
    sourceLearning: "Verification Prompt Pattern",
    status: "Successful Improvement",
    appliedDate: "2026-08-18",
    rolloutMethod: "Full Rollout",
    currentOutcome: "Adopted as standard behavior",
    changesApplied: ["Reduced verification prompts from 4 steps to 2 for returning customers"],
    timeline: [
      { label: "Recommended", date: "2026-08-10" },
      { label: "Approved", date: "2026-08-12" },
      { label: "Sandbox validated", date: "2026-08-14" },
      { label: "Full rollout", date: "2026-08-18" },
      { label: "Confirmed successful", date: "2026-08-29" },
    ],
    monitoringObservation: "Verification completion time improved with no increase in verification failures.",
    observedImpact: "Average verification time reduced; no negative effect on security outcomes observed.",
  },
];

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export const recommendedUpdatesStats = {
  total: updateRecommendations.length,
  readyForReview: updateRecommendations.filter((u) => u.status === "Ready for Review").length,
  inValidation: updateRecommendations.filter((u) => u.status === "In Validation").length,
  appliedRecently: updateRecommendations.filter((u) => u.status === "Applied").length,
};

export const experienceAnalysisStats = {
  experiencesBeingAnalyzed: experienceEvents.filter((e) => e.maturity === "raw-experience" || e.maturity === "observed-pattern").length,
  patternsUnderValidation: experienceEvents.filter((e) => e.maturity === "under-validation").length,
};

export function getRecommendation(id: string) {
  return updateRecommendations.find((u) => u.id === id);
}
export function getExperience(id: string) {
  return experienceEvents.find((e) => e.id === id);
}
export function getLearning(id: string) {
  return validatedLearnings.find((l) => l.id === id);
}
export function getHistoryItem(id: string) {
  return updateHistory.find((h) => h.id === id);
}
