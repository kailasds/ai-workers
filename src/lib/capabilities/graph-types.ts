export type CapabilityNodeKind =
  | "worker"
  | "brainCategory"
  | "skill"
  | "domainLanguage"
  | "evaluation"
  | "model"
  | "agent"
  | "tool"
  | "policy"
  | "connector"
  | "capability"
  | "workflow";

export type BrainCategoryKey =
  | "skills"
  | "domainLanguage"
  | "evaluations"
  | "models"
  | "agents"
  | "tools"
  | "policies"
  | "connectors"
  | "capabilities"
  | "workflows";

export const primaryCategories: BrainCategoryKey[] = ["skills", "domainLanguage", "evaluations", "models"];
export const secondaryCategories: BrainCategoryKey[] = ["agents", "tools", "policies", "connectors", "capabilities", "workflows"];

export const categoryLabel: Record<BrainCategoryKey, string> = {
  skills: "Skills",
  domainLanguage: "Domain Language",
  evaluations: "Evaluations",
  models: "SLMs",
  agents: "Agents",
  tools: "Tools",
  policies: "Policies",
  connectors: "Connectors",
  capabilities: "Capabilities",
  workflows: "Workflows",
};

export interface CapabilityGraphNode {
  id: string;
  kind: CapabilityNodeKind;
  label: string;
  refId: string;
  data: Record<string, unknown>;
}

export interface CapabilityGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface CapabilityGraphData {
  nodes: CapabilityGraphNode[];
  edges: CapabilityGraphEdge[];
}

export interface CapabilityFilters {
  category: BrainCategoryKey | "all";
  status: string | "all";
}

export const defaultCapabilityFilters: CapabilityFilters = { category: "all", status: "all" };
