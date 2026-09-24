export type CapabilityStatus = "Defined" | "Configured" | "Validated" | "Active" | "Deprecated";

export interface Skill {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
  agentIds: string[];
  toolIds: string[];
  evaluationIds: string[];
  relatedConstructId?: string;
}

export interface DomainTerm {
  id: string;
  term: string;
  description: string;
  ruleCount: number;
  domainGroup: string;
  workerIds: string[];
  skillIds: string[];
}

export interface Evaluation {
  id: string;
  name: string;
  purpose: string;
  threshold?: string;
  hardGate: boolean;
  status: CapabilityStatus;
  workerIds: string[];
}

export interface Model {
  id: string;
  name: string;
  purpose: string;
  status: CapabilityStatus;
  workerIds: string[];
  agentIds: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
  skillIds: string[];
  toolIds: string[];
  modelId?: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  status: CapabilityStatus;
  workerIds: string[];
  agentIds: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
  toolIds: string[];
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
  skillIds: string[];
  agentIds: string[];
  toolIds: string[];
  evaluationIds: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  workerIds: string[];
  skillIds: string[];
  capabilityIds: string[];
}
