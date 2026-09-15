import type { ComponentType } from "react";

export type StepId = "identity" | "intent" | "brain" | "dod" | "autonomy";

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;

export interface WorkerTypeOption {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  available: boolean;
}

export interface IdentityOption {
  id: string;
  name: string;
  description: string;
  scopeCount: number;
  available: boolean;
}

export interface BusinessDomainOption {
  id: string;
  name: string;
  description: string;
  skillCount: number;
  dslCount: number;
}

export interface BoundedContextOption {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  produces: string;
  procedureLabel: string;
  procedureStages: number;
  excludedActions: string[];
}

export interface AutonomyLevelOption {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  release: string;
  whereItMayRun: string;
  needsAPerson: string;
}

export interface DodGate {
  id: string;
  label: string;
  description: string;
}

export interface SampleProject {
  id: string;
  name: string;
  path: string;
}

export type BrainFacet = "skill" | "dsl" | "eval" | "meta";

export interface AssemblyLogEntry {
  id: string;
  facet: BrainFacet;
  label: string;
  detail: string;
}

export interface WorkerIntentState {
  agentCount: number;
  harnessLabel: string;
  tools: string[];
}

export interface BrainState {
  status: "idle" | "assembling" | "done";
  read: number;
  bound: number;
  screenedOut: number;
  skillsCount: number;
  dslsCount: number;
  evalsCount: number;
  sentinelState: string;
}

export interface ComposeState {
  workerTypeId: string | null;
  identityId: string | null;
  businessDomainId: string | null;
  boundedContextId: string;
  autoAssemblePreset: boolean;
  identityConfirmed: boolean;
  workerIntent: WorkerIntentState;
  intentConfirmed: boolean;
  brain: BrainState;
  dodConfirmed: boolean;
  autonomyLevel: 1 | 2 | 3 | 4;
  autonomyConfirmed: boolean;
  revision: number;
  selectedSampleProjects: string[];
  publishToGitLab: boolean;
  packageState: "idle" | "building" | "built";
}
