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
import { Sparkle, X } from "lucide-react";
import { graphNodeTypes } from "./graph-node";
import { graphEdgeTypes } from "./graph-edge";
import { GraphToolbar } from "./graph-toolbar";
import { GraphLegend } from "./graph-legend";
import { GraphDetailPanel } from "./graph-detail-panel";
import { layoutGraph } from "@/lib/knowledge/elk-layout";
import {
  buildLandscapeGraph,
  buildEvidenceGraph,
  buildKnowledgeFlowGraph,
  getLineage,
  getDownstreamUsage,
  filterGraph,
  getNeighborIds,
  kindOf,
} from "@/lib/knowledge/graph-builder";
import { getObservation, getRun, getWorker } from "@/lib/knowledge/service";
import type { GraphFilters, GraphMode, KnowledgeGraphData, KnowledgeGraphNode } from "@/lib/knowledge/graph-types";
import { defaultFilters } from "@/lib/knowledge/graph-types";
import { useKnowledgeOverlayVersion } from "@/lib/knowledge/store";
import { Button } from "@/components/ui/button";

function buildGraphForMode(mode: GraphMode, contextId: string, focusConstructId: string | null): KnowledgeGraphData {
  if (mode === "evidence") {
    if (!focusConstructId) return { nodes: [], edges: [] };
    return buildEvidenceGraph(contextId, focusConstructId);
  }
  if (mode === "flow") return buildKnowledgeFlowGraph(contextId);
  return buildLandscapeGraph(contextId);
}

function TraceBanner({ nodeId, direction, onExit }: { nodeId: string; direction: "evidence" | "usage"; onExit: () => void }) {
  const graph = direction === "evidence" ? getLineage(nodeId) : getDownstreamUsage(nodeId);
  const obsNode = graph.nodes.find((n) => n.kind === "observation");
  const observation = obsNode ? getObservation(obsNode.refId) : undefined;
  const run = observation ? getRun(observation.runId) : undefined;
  const worker = observation ? getWorker(observation.workerId) : undefined;

  return (
    <div className="border-b border-accent-border bg-accent-soft px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
            <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
            {direction === "evidence" ? "Why this knowledge exists" : "Where this knowledge is being used"}
          </p>
          {observation && worker && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
              {direction === "evidence"
                ? `This knowledge originated from ${worker.name.split("·")[0].trim()}'s run converting the TIBCO source. ${observation.summary}`
                : `This knowledge was retrieved by ${worker.name.split("·")[0].trim()} and produced a new observation: ${observation.summary}`}
            </p>
          )}
          {run && direction === "evidence" && (
            <div className="mt-2 flex flex-wrap gap-3">
              {run.metrics.map((m) => (
                <span key={m.label} className="text-[11.5px] text-ink-soft">
                  {m.label}: <span className="font-semibold tabular-nums">{m.value === null ? "Not measured" : `${m.value}% ≥ ${m.target}%`}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" className="shrink-0" onClick={onExit}>
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Exit trace
        </Button>
      </div>
    </div>
  );
}

function KnowledgeGraphInner({
  contextId,
  focusConstructId,
  lifecycleFilter,
  onLifecycleConsumed,
}: {
  contextId: string;
  focusConstructId: string | null;
  lifecycleFilter?: GraphFilters["lifecycle"] | null;
  onLifecycleConsumed?: () => void;
}) {
  useKnowledgeOverlayVersion();
  const rf = useReactFlow();

  const [mode, setMode] = useState<GraphMode>(focusConstructId ? "evidence" : "landscape");
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [trace, setTrace] = useState<{ nodeId: string; direction: "evidence" | "usage" } | null>(null);
  const [positionedNodes, setPositionedNodes] = useState<RFNode[]>([]);
  const layoutToken = useRef(0);

  useEffect(() => {
    if (lifecycleFilter) {
      setFilters((f) => ({ ...f, lifecycle: lifecycleFilter === "Reused" ? "all" : lifecycleFilter }));
      onLifecycleConsumed?.();
    }
  }, [lifecycleFilter, onLifecycleConsumed]);

  const structuralGraph = useMemo(() => {
    if (trace) return trace.direction === "evidence" ? getLineage(trace.nodeId) : getDownstreamUsage(trace.nodeId);
    const base = buildGraphForMode(mode, contextId, focusConstructId);
    return filterGraph(base, filters);
  }, [mode, filters, focusConstructId, trace, contextId]);

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
      data: { kind: n.kind, label: n.label, refId: n.refId, payload: n.data, state: "normal" },
    }));
    const rfInputEdges: RFEdge[] = structuralGraph.edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));

    layoutGraph(rfInputNodes, rfInputEdges, trace ? "RIGHT" : "RIGHT").then((laidOut) => {
      if (layoutToken.current !== token) return;
      setPositionedNodes(laidOut);
      requestAnimationFrame(() => rf.fitView({ padding: 0.2, duration: 300 }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureSignature]);

  const activeId = hoveredNodeId ?? selectedNodeId;
  const neighborIds = useMemo(() => (activeId ? getNeighborIds(activeId, structuralGraph.edges) : new Set<string>()), [activeId, structuralGraph.edges]);

  const rfNodes: RFNode[] = useMemo(
    () =>
      positionedNodes.map((n) => {
        let state: "normal" | "selected" | "highlighted" | "dimmed" = "normal";
        if (activeId) {
          if (n.id === activeId) state = "selected";
          else if (neighborIds.has(n.id)) state = "highlighted";
          else state = "dimmed";
        }
        return { ...n, data: { ...n.data, state } };
      }),
    [positionedNodes, activeId, neighborIds]
  );

  const rfEdges: RFEdge[] = useMemo(
    () =>
      structuralGraph.edges.map((e) => {
        let state: "normal" | "highlighted" | "dimmed" = "normal";
        if (activeId) {
          state = e.source === activeId || e.target === activeId ? "highlighted" : "dimmed";
        }
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "knowledge",
          data: { label: e.label, contradiction: e.contradiction, state, animated: e.relation === "used_by" },
        };
      }),
    [structuralGraph.edges, activeId]
  );

  const selectedNode: KnowledgeGraphNode | null = useMemo(() => {
    if (!selectedNodeId) return null;
    return structuralGraph.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, structuralGraph.nodes]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

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
        setTrace(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleTraceEvidence = useCallback((nodeId: string) => {
    setTrace({ nodeId, direction: "evidence" });
    setSelectedNodeId(nodeId);
  }, []);
  const handleTraceUsage = useCallback((nodeId: string) => {
    setTrace({ nodeId, direction: "usage" });
    setSelectedNodeId(nodeId);
  }, []);
  const handleSelectFromSearch = useCallback((nodeId: string) => {
    setMode("landscape");
    setTrace(null);
    setFilters(defaultFilters);
    setSelectedNodeId(nodeId);
    const construct = kindOf(nodeId) === "construct" ? nodeId : null;
    if (construct) setMode("evidence");
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GraphToolbar
        mode={mode}
        onModeChange={(m) => {
          setTrace(null);
          setMode(m);
        }}
        filters={filters}
        onFiltersChange={setFilters}
        onZoomIn={() => rf.zoomIn({ duration: 200 })}
        onZoomOut={() => rf.zoomOut({ duration: 200 })}
        onFitView={() => rf.fitView({ padding: 0.2, duration: 300 })}
        onReset={() => {
          setSelectedNodeId(null);
          setTrace(null);
          setFilters(defaultFilters);
        }}
        onSelectNode={handleSelectFromSearch}
        disabled={!!trace}
      />

      {trace && <TraceBanner nodeId={trace.nodeId} direction={trace.direction} onExit={() => setTrace(null)} />}

      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex-1 min-w-0">
          {structuralGraph.nodes.length === 0 ? (
            <div className="grid h-full place-items-center px-8 text-center">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">
                  {contextId !== "tibco-to-springboot" ? "No knowledge recorded for this context yet" : "No knowledge recorded for this view yet"}
                </p>
                <p className="mt-1 text-[12px] text-ink-mute">
                  {contextId !== "tibco-to-springboot"
                    ? "No Worker has run against this migration context yet. Switch back to TIBCO → Java Spring Boot to see recorded knowledge."
                    : "Choose a different construct, mode, or clear filters to see more of the graph."}
                </p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={graphNodeTypes}
              edgeTypes={graphEdgeTypes}
              onNodeClick={onNodeClick}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseLeave={onNodeMouseLeave}
              onNodeDoubleClick={onNodeDoubleClick}
              onPaneClick={onPaneClick}
              minZoom={0.15}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ type: "knowledge" }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
            </ReactFlow>
          )}
          <GraphLegend />
        </div>

        {selectedNode && (
          <div className="w-[320px] shrink-0 border-l border-border bg-card overflow-hidden">
            <GraphDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onTraceEvidence={handleTraceEvidence}
              onTraceUsage={handleTraceUsage}
              onFocus={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function KnowledgeGraph(props: {
  contextId: string;
  focusConstructId?: string | null;
  lifecycleFilter?: GraphFilters["lifecycle"] | null;
  onLifecycleConsumed?: () => void;
}) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner
        contextId={props.contextId}
        focusConstructId={props.focusConstructId ?? null}
        lifecycleFilter={props.lifecycleFilter}
        onLifecycleConsumed={props.onLifecycleConsumed}
      />
    </ReactFlowProvider>
  );
}
