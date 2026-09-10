export type GraphNodeKind =
  | "worker"
  | "topic"
  | "construct"
  | "run"
  | "observation"
  | "evidence"
  | "candidate"
  | "certified"
  | "pack";

export type GraphMode = "landscape" | "evidence" | "flow" | "trace";

export type EdgeRelation =
  | "recorded"
  | "executed"
  | "produced"
  | "supports"
  | "supported_by"
  | "contradicts"
  | "proposed_as"
  | "informs"
  | "certified_as"
  | "included_in"
  | "used_by";

export interface KnowledgeGraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  refId: string;
  data: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
  label: string;
  contradiction?: boolean;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface GraphContext {
  id: string;
  label: string;
}

export const graphContexts: GraphContext[] = [
  { id: "tibco-to-springboot", label: "TIBCO → Java Spring Boot" },
  { id: "oracle-to-postgresql", label: "Oracle → PostgreSQL" },
  { id: "legacy-rest-to-spring", label: "Legacy REST → Spring" },
];

export const PRIMARY_CONTEXT = "tibco-to-springboot";

export interface GraphFilters {
  worker: string | null;
  topic: string | null;
  kind: GraphNodeKind | "all";
  lifecycle: "all" | "Observed" | "Corroborated" | "Certified" | "Published" | "Reused" | "Contradictory";
  time: "all" | "24h" | "7d" | "30d";
}

export const defaultFilters: GraphFilters = {
  worker: null,
  topic: null,
  kind: "all",
  lifecycle: "all",
  time: "all",
};
