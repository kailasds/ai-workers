import { useSyncExternalStore } from "react";
import { ago, capabilityLadder, initialEvents, initialKnowledge, initialReviews, initialWorkers } from "./data";
import type {
  HistoryEvent,
  Knowledge,
  LearningEvent,
  LearningEventType,
  ReviewStatus,
  SentinelReview,
  V2Worker,
} from "./types";

// A tiny in-memory store. Actions mutate a copy and notify subscribers, so the
// mock UI behaves like a live system (share, revoke, approve) within a session.

interface State {
  workers: V2Worker[];
  knowledge: Knowledge[];
  events: LearningEvent[];
  reviews: SentinelReview[];
}

let state: State = {
  workers: initialWorkers,
  knowledge: initialKnowledge,
  events: initialEvents,
  reviews: initialReviews,
};

const listeners = new Set<() => void>();
function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useV2() {
  return useSyncExternalStore(subscribe, () => state);
}

let counter = 100;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

function event(workerId: string, type: LearningEventType, title: string, description: string, knowledgeId?: string): LearningEvent {
  return { id: nextId("le"), workerId, type, title, description, knowledgeId, timestamp: ago(0) };
}

function withHistory(k: Knowledge, label: string, detail?: string, tone?: HistoryEvent["tone"]): Knowledge {
  return { ...k, history: [...k.history, { id: nextId("h"), label, detail, tone, at: ago(0) }] };
}

function patchKnowledge(id: string, fn: (k: Knowledge) => Knowledge) {
  set({ knowledge: state.knowledge.map((k) => (k.id === id ? fn(k) : k)) });
}

function closeReviews(subjectId: string, type: SentinelReview["type"], status: ReviewStatus, decision: string) {
  set({
    reviews: state.reviews.map((r) =>
      r.subjectId === subjectId && r.type === type && r.status === "needs-review" ? { ...r, status, decision, decidedAt: ago(0) } : r
    ),
  });
}

// ── Knowledge actions ──────────────────────────────────────────────────────

function recordDecision(subjectId: string, decision: string, reasoning: string, automatic: boolean, suggestedScope?: string[]) {
  const review: SentinelReview = {
    id: nextId("r"),
    level: "platform",
    type: "knowledge-sharing",
    subjectId,
    status: "approved",
    automatic,
    decision,
    reasoning,
    suggestedScope,
    createdAt: ago(0),
    decidedAt: ago(0),
  };
  set({ reviews: [review, ...state.reviews] });
}

export function shareWithPlatform(gainedId: string, availableTo: string[], opts: { automatic?: boolean; reasoning?: string } = {}) {
  const source = state.knowledge.find((k) => k.id === gainedId);
  if (!source || source.sharedAsId) return;
  const platformId = nextId("p");
  const platform: Knowledge = {
    ...source,
    id: platformId,
    scope: "platform",
    status: "active",
    availableTo,
    usedByWorkerIds: [],
    derivedFromId: source.id,
    sharedAsId: undefined,
    validation: ["Reviewed by Worker Sentinel", "Approved for platform use"],
    history: [...source.history, { id: nextId("h"), label: "Shared", detail: "Approved by Platform Sentinel.", at: ago(0) }],
  };
  set({
    knowledge: [
      ...state.knowledge.map((k) =>
        k.id === gainedId
          ? { ...withHistory(k, "Shared with platform"), sharedAsId: platformId, validation: [...(k.validation ?? []), "Shared with the platform"] }
          : k
      ),
      platform,
    ],
    events: [
      event(source.sourceWorkerId ?? "", "knowledge-shared", "Knowledge shared with platform", `${source.title} is now trusted for ${availableTo.join(", ")}.`, platformId),
      ...state.events,
    ],
  });
  recordDecision(
    gainedId,
    "Shared with platform",
    opts.reasoning ?? (opts.automatic ? "The evidence agreed across Workers." : "Shared by you."),
    !!opts.automatic,
    availableTo
  );
}

export function keepWithWorker(gainedId: string, opts: { automatic?: boolean; reasoning?: string } = {}) {
  const k = state.knowledge.find((x) => x.id === gainedId);
  patchKnowledge(gainedId, (x) => withHistory(x, "Kept with the Worker", "Platform Sentinel decided not to share it yet."));
  recordDecision(gainedId, "Kept with the Worker", opts.reasoning ?? "Kept with the Worker.", !!opts.automatic);
  set({
    events: [
      event(k?.sourceWorkerId ?? "", "learning-reviewed", "Kept with the Worker", `Platform Sentinel kept ${k?.title ?? "this learning"} with the Worker for now.`, gainedId),
      ...state.events,
    ],
  });
}

/** Platform Sentinel weighs the evidence and decides on its own, with no person asked. */
function platformSentinelDecides(id: string) {
  const k = state.knowledge.find((x) => x.id === id);
  if (!k || k.sharedAsId) return;
  const evidence = k.evidence ?? [];
  const agree = evidence.filter((e) => e.result === "ok").length;
  if (evidence.length >= 2 && agree === evidence.length) {
    shareWithPlatform(id, ["Integration Workers"], { automatic: true, reasoning: `All ${evidence.length} Workers that tried it agreed.` });
  } else {
    keepWithWorker(id, {
      automatic: true,
      reasoning: evidence.length < 2 ? "Only one Worker has evidence so far." : "Workers disagreed, so it stays with this Worker for now.",
    });
  }
}

export function rejectKnowledge(id: string) {
  const k = state.knowledge.find((x) => x.id === id);
  if (!k) return;
  patchKnowledge(id, (x) => ({ ...withHistory(x, "Rejected", undefined, "bad"), status: "rejected" }));
  closeReviews(id, "learning", "rejected", "Rejected");
  closeReviews(id, "knowledge-sharing", "rejected", "Rejected");
  set({ events: [event(k.sourceWorkerId ?? "", "learning-rejected", "Learning rejected", `${k.title} was not kept.`, id), ...state.events] });
}

export function approveLearning(id: string) {
  const k = state.knowledge.find((x) => x.id === id);
  if (!k) return;
  patchKnowledge(id, (x) => ({
    ...withHistory(x, "Reviewed", "Worker Sentinel validated the learning."),
    status: "active",
    validation: ["Reviewed by Worker Sentinel"],
  }));
  closeReviews(id, "learning", "approved", "Kept by the Worker");
  set({ events: [event(k.sourceWorkerId ?? "", "knowledge-gained", "Knowledge gained", `${k.title} was added to the Worker.`, id), ...state.events] });
  platformSentinelDecides(id);
}

export function holdReview(reviewId: string) {
  set({ reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, status: "held", decision: "Held", decidedAt: ago(0) } : r)) });
}

export function reopenReview(reviewId: string) {
  set({ reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, status: "needs-review", decision: undefined, decidedAt: undefined } : r)) });
}

export function revokeKnowledge(id: string, reason: string, context: string, replacementId?: string) {
  const k = state.knowledge.find((x) => x.id === id);
  if (!k) return;
  patchKnowledge(id, (x) => {
    const withRevoke = withHistory(x, "Revoked", context || reason, "bad");
    const next: Knowledge = {
      ...withRevoke,
      status: "revoked",
      reason,
      reasonContext: context,
      health: undefined,
      healthNote: undefined,
      replacementKnowledgeId: replacementId ?? x.replacementKnowledgeId,
    };
    return replacementId ? withHistory(next, "Replaced", `Superseded by ${state.knowledge.find((r) => r.id === replacementId)?.title ?? "newer knowledge"}.`) : next;
  });
  set({ events: [event(k.sourceWorkerId ?? "", "knowledge-revoked", "Knowledge revoked", `${k.title} was revoked: ${reason.toLowerCase()}.`, id), ...state.events] });
}

export function retireKnowledge(id: string, context: string) {
  patchKnowledge(id, (k) => ({ ...withHistory(k, "Retired", context || "No longer recommended for future use."), status: "retired", reason: "No longer recommended", reasonContext: context, health: undefined, healthNote: undefined }));
}

export function replaceKnowledge(id: string, replacementId: string) {
  const replacement = state.knowledge.find((k) => k.id === replacementId);
  patchKnowledge(id, (k) => ({
    ...withHistory(k, "Replaced", `Superseded by ${replacement?.title ?? "newer knowledge"}.`),
    status: "replaced",
    reason: "Replaced by newer knowledge",
    reasonContext: replacement ? `Superseded by ${replacement.title}.` : undefined,
    replacementKnowledgeId: replacementId,
    health: undefined,
    healthNote: undefined,
  }));
}

export function restrictScope(id: string, availableTo: string[]) {
  patchKnowledge(id, (k) => withHistory({ ...k, availableTo }, "Scope restricted", `Now available to ${availableTo.join(", ")}.`));
}

export function clearHealth(id: string) {
  patchKnowledge(id, (k) => withHistory({ ...k, health: undefined, healthNote: undefined }, "Confirmed still valid", "Reviewed and no action needed."));
}

// ── Evolution ──────────────────────────────────────────────────────────────

export function decideEvolution(reviewId: string, decision: "approve" | "hold" | "reject") {
  const review = state.reviews.find((r) => r.id === reviewId);
  if (!review || review.type !== "evolution") return;
  if (decision === "hold") return holdReview(reviewId);
  if (decision === "reject") {
    set({ reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, status: "rejected", decision: "Rejected", decidedAt: ago(0) } : r)) });
    return;
  }
  const worker = state.workers.find((w) => w.id === review.subjectId);
  const to = review.proposedCapability;
  if (!worker || !to) return;
  const from = worker.evolution.currentCapability;
  set({
    workers: state.workers.map((w) =>
      w.id === worker.id
        ? {
            ...w,
            evolution: {
              ...w.evolution,
              currentCapability: to,
              availablePaths: capabilityLadder.slice(capabilityLadder.indexOf(to) + 1),
              history: [...w.evolution.history, { id: nextId("ev"), from, to, at: ago(0), reasons: ["Platform Sentinel approved"] }],
            },
          }
        : w
    ),
    reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, status: "approved", decision: "Evolution approved", decidedAt: ago(0) } : r)),
    events: [event(worker.id, "evolution-approved", "Evolution approved", `The Worker can now do ${to}.`), ...state.events],
  });
}

// ── Compose ────────────────────────────────────────────────────────────────

export function addComposedWorker(input: {
  name: string;
  purpose: string;
  context: string;
  learningEnabled: boolean;
  evolutionEnabled: boolean;
  autoEvolve: boolean;
  assignedKnowledgeIds: string[];
}): string {
  const id = nextId("wr");
  const worker: V2Worker = {
    id,
    name: input.name,
    purpose: input.purpose,
    context: input.context,
    contextTag: "Service conversion",
    status: "draft",
    revision: 1,
    maturityReasons: [],
    learningEnabled: input.learningEnabled,
    assignedKnowledgeIds: input.assignedKnowledgeIds,
    evolution: {
      enabled: input.evolutionEnabled,
      autoEvolve: input.evolutionEnabled && input.autoEvolve,
      currentCapability: capabilityLadder[0],
      availablePaths: capabilityLadder.slice(1),
      history: [],
    },
  };
  set({ workers: [worker, ...state.workers] });
  return id;
}

// ── Selectors ──────────────────────────────────────────────────────────────

export function needsAttentionCount(s: State) {
  return (
    s.reviews.filter((r) => r.status === "needs-review").length +
    s.knowledge.filter((k) => k.scope === "platform" && k.status === "active" && k.health).length
  );
}

export function workerById(s: State, id: string | undefined) {
  return s.workers.find((w) => w.id === id);
}
export function knowledgeById(s: State, id: string | undefined) {
  return s.knowledge.find((k) => k.id === id);
}
export function learnedBy(s: State, workerId: string) {
  return s.knowledge.filter((k) => k.scope === "gained" && k.sourceWorkerId === workerId);
}
export function givenTo(s: State, w: V2Worker) {
  return w.assignedKnowledgeIds.map((id) => knowledgeById(s, id)).filter((k): k is Knowledge => !!k);
}
