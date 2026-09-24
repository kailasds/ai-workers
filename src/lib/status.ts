import type {
  AutonomyLevel,
  DoDOverallStatus,
  SentinelState,
  StatusColor,
  WorkerStatus,
} from "./types";

export const workerStatusColor: Record<WorkerStatus, StatusColor> = {
  active: "blue",
  working: "blue",
  review: "amber",
  paused: "neutral",
  blocked: "red",
  idle: "neutral",
};

export const workerStatusLabel: Record<WorkerStatus, string> = {
  active: "Active",
  working: "Working",
  review: "Needs Review",
  paused: "Paused",
  blocked: "Blocked",
  idle: "Idle",
};

export const autonomyMeta: Record<AutonomyLevel, { label: string; color: StatusColor; description: string }> = {
  supervised: {
    label: "Supervised",
    color: "amber",
    description: "Every major action requires review.",
  },
  guarded: {
    label: "Guarded",
    color: "purple",
    description: "Operates autonomously within policy boundaries.",
  },
  autonomous: {
    label: "Autonomous",
    color: "green",
    description: "Completes approved work independently within its defined scope.",
  },
};

export const sentinelMeta: Record<SentinelState, { label: string; color: StatusColor; description: string }> = {
  observing: { label: "Observing", color: "blue", description: "Watching execution — no intervention required." },
  guarding: { label: "Guarding", color: "purple", description: "Enforcing policy boundaries in real time." },
  "intervention-required": {
    label: "Intervention Required",
    color: "red",
    description: "Sentinel has paused execution pending review.",
  },
  certified: { label: "Certified", color: "green", description: "Work independently verified against policy and evidence." },
  "policy-violation": { label: "Policy Violation", color: "red", description: "An action was blocked by policy." },
  "learning-signal": { label: "Learning Signal Captured", color: "purple", description: "An improvement candidate was recorded for governed review." },
};

export const dodStatusMeta: Record<DoDOverallStatus, { label: string; color: StatusColor }> = {
  "not-ready": { label: "Not Ready", color: "red" },
  "ready-for-review": { label: "Ready for Review", color: "amber" },
  "certified-complete": { label: "Certified Complete", color: "green" },
};

export const taskStatusMeta: Record<string, { color: StatusColor; label: string }> = {
  running: { color: "blue", label: "Running" },
  completed: { color: "green", label: "Completed" },
  "awaiting-approval": { color: "amber", label: "Awaiting Approval" },
  failed: { color: "red", label: "Failed" },
  scheduled: { color: "neutral", label: "Scheduled" },
  "in-progress": { color: "blue", label: "In Progress" },
  paused: { color: "amber", label: "Paused" },
  "certified-complete": { color: "green", label: "Certified Complete" },
  "needs-review": { color: "amber", label: "Needs Review" },
};
