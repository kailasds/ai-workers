import type { StatusColor, WorkerStatus } from "./types";

export const workerStatusColor: Record<WorkerStatus, StatusColor> = {
  active: "blue",
  working: "blue",
  review: "amber",
  paused: "neutral",
  blocked: "red",
  completed: "green",
};

export const taskStatusMeta: Record<string, { color: StatusColor; label: string }> = {
  running: { color: "blue", label: "Running" },
  completed: { color: "green", label: "Completed" },
  "awaiting-approval": { color: "amber", label: "Awaiting Approval" },
  failed: { color: "red", label: "Failed" },
  scheduled: { color: "neutral", label: "Scheduled" },
};
