import ELK from "elkjs/lib/elk.bundled.js";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

const elk = new ELK();

const NODE_WIDTH = 220;
const NODE_HEIGHT = 92;

export async function layoutGraph(
  nodes: RFNode[],
  edges: RFEdge[],
  direction: "RIGHT" | "DOWN" = "RIGHT"
): Promise<RFNode[]> {
  if (nodes.length === 0) return [];

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.layered.spacing.nodeNodeBetweenLayers": "90",
      "elk.spacing.nodeNode": "48",
      "elk.layered.spacing.edgeNodeBetweenLayers": "36",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.edgeRouting": "SPLINES",
    },
    children: nodes.map((n) => ({
      id: n.id,
      width: (n.data?.width as number | undefined) ?? NODE_WIDTH,
      height: (n.data?.height as number | undefined) ?? NODE_HEIGHT,
    })),
    edges: edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };

  const result = await elk.layout(elkGraph);
  const positioned = new Map<string, { x: number; y: number }>();
  for (const child of result.children ?? []) {
    positioned.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  return nodes.map((n) => ({
    ...n,
    position: positioned.get(n.id) ?? n.position,
  }));
}
