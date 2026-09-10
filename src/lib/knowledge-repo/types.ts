export type KnowledgeItemType = "Skill" | "Domain Language" | "Event" | "SME" | "Concept" | "Pattern" | "Rule";

export interface KnowledgeEvent {
  id: string;
  name: string;
  description: string;
  category: string;
  relatedWorkerIds: string[];
  relatedSkillIds: string[];
  topics: string[];
  occurrences: number;
}

export interface SME {
  id: string;
  name: string;
  areaOfExpertise: string;
  relatedSkillIds: string[];
  relatedDomainTermIds: string[];
  workerIds: string[];
  contributions: number;
}

export interface KnowledgeItemSummary {
  id: string;
  name: string;
  type: KnowledgeItemType;
  workerIds: string[];
  workersUsingCount: number;
  topics: string[];
  learningLabel: string;
}
