import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useReactFlow,
  type Node as RFNode,
  type Edge as RFEdge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Route, X } from "lucide-react";
import { capabilityNodeTypes } from "./capability-node";
import { capabilityEdgeTypes } from "./capability-edge";
import { CapabilityToolbar } from "./capability-toolbar";
import { CapabilityDetailPanel } from "./capability-detail-panel";
import { layoutGraph } from "@/lib/knowledge/elk-layout";
import {
  buildWorkerCapabilityGraph,
  buildCapabilityTrace,
  getCapabilityDependencies,
  nodeKey,
  kindOf,
} from "@/lib/capabilities/graph-builder";
import { primaryCategories, type BrainCategoryKey, type CapabilityGraphNode } from "@/lib/capabilities/graph-types";
import { Button } from "@/components/ui/button";

const expandableKinds = new Set(["brainCategory", "skill", "agent", "capability", "workflow", "domainLanguage"]);
const categoryForKind: Record<string, BrainCategoryKey> = {
  skill: "skills",
  domainLanguage: "domainLanguage",
  evaluation: "evaluations",
  model: "models",
  agent: "agents",
  tool: "tools",
  policy: "policies",
  connector: "connectors",
  capability: "capabilities",
  workflow: "workflows",
};

function hasDependencies(nodeId: string): boolean {
  if (kindOf(nodeId) === "brainCategory") return true;
  return getCapabilityDependencies(nodeId).nodes.length > 0;
}

function CapabilityTreeInner({ workerId, focusNodeId }: { workerId: string; focusNodeId?: string }) {
  const rf = useReactFlow();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const cat of primaryCategories) initial.add(nodeKey("brainCategory", `${workerId}:${cat}`));
    if (focusNodeId) {
      const cat = categoryForKind[kindOf(focusNodeId)];
      if (cat) initial.add(nodeKey("brainCategory", `${workerId}:${cat}`));
    }
    return initial;
  });
  const [categoryFilter, setCategoryFilter] = useState<BrainCategoryKey | "all">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(focusNodeId ?? null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [traceNodeId, setTraceNodeId] = useState<string | null>(null);
  const [positionedNodes, setPositionedNodes] = useState<RFNode[]>([]);
  const layoutToken = useRef(0);

  const structuralGraph = useMemo(() => {
    if (traceNodeId) return buildCapabilityTrace(traceNodeId);
    const base = buildWorkerCapabilityGraph(workerId, expandedIds);
    if (categoryFilter === "all") return base;
    const keepCategoryId = nodeKey("brainCategory", `${workerId}:${categoryFilter}`);
    const keepIds = new Set<string>([nodeKey("worker", workerId), keepCategoryId]);
    for (const e of base.edges) {
      if (e.source === keepCategoryId) keepIds.add(e.target);
    }
    // include dependency nodes of anything already kept (in case expanded further)
    let changed = true;
    while (changed) {
      changed = false;
      for (const e of base.edges) {
        if (keepIds.has(e.source) && !keepIds.has(e.target)) {
          keepIds.add(e.target);
          changed = true;
        }
      }
    }
    return { nodes: base.nodes.filter((n) => keepIds.has(n.id)), edges: base.edges.filter((e) => keepIds.has(e.source) && keepIds.has(e.target)) };
  }, [workerId, expandedIds, traceNodeId, categoryFilter]);

  const structureSignature = useMemo(
    () => structuralGraph.nodes.map((n) => n.id).join(",") + "|" + structuralGraph.edges.map((e) => e.id).join(","),
    [structuralGraph]
  );

  useEffect(() => {
    const token = ++layoutToken.current;
    const rfInputNodes: RFNode[] = structuralGraph.nodes.map((n) => ({
      id: n.id,
      type: n.kind,
      position: { x: 0, y: 0 },
      data: {
        kind: n.kind,
        label: n.label,
        refId: n.refId,
        payload: n.data,
        state: "normal",
        expandable: expandableKinds.has(n.kind) && hasDependencies(n.id),
        expanded: expandedIds.has(n.id),
      },
    }));
    const rfInputEdges: RFEdge[] = structuralGraph.edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));

    layoutGraph(rfInputNodes, rfInputEdges, "DOWN").then((laidOut) => {
      if (layoutToken.current !== token) return;
      setPositionedNodes(laidOut);
      requestAnimationFrame(() => rf.fitView({ padding: 0.2, duration: 300 }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureSignature]);

  const activeId = hoveredNodeId ?? selectedNodeId;
  const neighborIds = useMemo(() => {
    const ids = new Set<string>();
    if (!activeId) return ids;
    for (const e of structuralGraph.edges) {
      if (e.source === activeId) ids.add(e.target);
      if (e.target === activeId) ids.add(e.source);
    }
    return ids;
  }, [activeId, structuralGraph.edges]);

  const rfNodes: RFNode[] = useMemo(
    () =>
      positionedNodes.map((n) => {
        let state: "normal" | "selected" | "highlighted" | "dimmed" = "normal";
        if (activeId) {
          if (n.id === activeId) state = "selected";
          else if (neighborIds.has(n.id)) state = "highlighted";
          else state = "dimmed";
        }
        return { ...n, data: { ...n.data, state, expanded: expandedIds.has(n.id) } };
      }),
    [positionedNodes, activeId, neighborIds, expandedIds]
  );

  const rfEdges: RFEdge[] = useMemo(
    () =>
      structuralGraph.edges.map((e) => {
        let state: "normal" | "highlighted" | "dimmed" = "normal";
        if (activeId) state = e.source === activeId || e.target === activeId ? "highlighted" : "dimmed";
        return { id: e.id, source: e.source, target: e.target, type: "capability", data: { state } };
      }),
    [structuralGraph.edges, activeId]
  );

  const selectedNode: CapabilityGraphNode | null = useMemo(() => {
    if (!selectedNodeId) return null;
    return structuralGraph.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, structuralGraph.nodes]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
      if (expandableKinds.has(kindOf(node.id)) && hasDependencies(node.id)) toggleExpand(node.id);
    },
    [toggleExpand]
  );
  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => setHoveredNodeId(node.id), []);
  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => setHoveredNodeId(null), []);
  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
      rf.fitView({ nodes: [{ id: node.id }], padding: 0.6, duration: 400 });
    },
    [rf]
  );
  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setTraceNodeId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSelectResult = useCallback(
    (id: string) => {
      setTraceNodeId(null);
      setCategoryFilter("all");
      const catMap: Record<string, BrainCategoryKey> = { skill: "skills", domainLanguage: "domainLanguage", agent: "agents", capability: "capabilities", workflow: "workflows" };
      const cat = catMap[kindOf(id)];
      if (cat) {
        setExpandedIds((prev) => new Set(prev).add(nodeKey("brainCategory", `${workerId}:${cat}`)));
      }
      setSelectedNodeId(id);
    },
    [workerId]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CapabilityToolbar
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(c) => {
          setTraceNodeId(null);
          setCategoryFilter(c);
        }}
        onZoomIn={() => rf.zoomIn({ duration: 200 })}
        onZoomOut={() => rf.zoomOut({ duration: 200 })}
        onFitView={() => rf.fitView({ padding: 0.2, duration: 300 })}
        onReset={() => {
          setSelectedNodeId(null);
          setTraceNodeId(null);
          setCategoryFilter("all");
        }}
        onSelectResult={handleSelectResult}
        disabled={!!traceNodeId}
      />

      {traceNodeId && (
        <div className="flex items-center justify-between gap-3 border-b border-accent-border bg-accent-soft px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
            <Route className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2} />
            <span className="font-semibold text-accent-ink">How does this Worker do this?</span> — showing the composition chain behind the selected capability.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setTraceNodeId(null)}>
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Exit trace
          </Button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex-1 min-w-0">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={capabilityNodeTypes}
            edgeTypes={capabilityEdgeTypes}
            onNodeClick={onNodeClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            minZoom={0.15}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: "capability" }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="w-[320px] shrink-0 border-l border-border bg-card overflow-hidden">
            <CapabilityDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onTrace={(id) => {
                setTraceNodeId(id);
                setSelectedNodeId(id);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function CapabilityTree({ workerId, focusNodeId }: { workerId: string; focusNodeId?: string }) {
  return (
    <ReactFlowProvider>
      <CapabilityTreeInner workerId={workerId} focusNodeId={focusNodeId} />
    </ReactFlowProvider>
  );
}
