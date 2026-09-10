import { useEffect, useMemo, useState } from "react";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, type Node as RFNode, type Edge as RFEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Blocks, Type as TypeIcon, Zap, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { layoutGraph } from "@/lib/knowledge/elk-layout";

type RelationKind = "center" | "Domain Language" | "Event" | "SME" | "Skill";

interface RelationNodeData extends Record<string, unknown> {
  label: string;
  kind: RelationKind;
}

const kindMeta: Record<RelationKind, { icon: typeof Blocks; iconBg: string; iconColor: string; border: string }> = {
  center: { icon: Blocks, iconBg: "bg-accent", iconColor: "text-white", border: "border-accent" },
  Skill: { icon: Blocks, iconBg: "bg-status-blue-soft", iconColor: "text-status-blue", border: "border-l-status-blue" },
  "Domain Language": { icon: TypeIcon, iconBg: "bg-status-purple-soft", iconColor: "text-status-purple", border: "border-l-status-purple" },
  Event: { icon: Zap, iconBg: "bg-status-amber-soft", iconColor: "text-status-amber", border: "border-l-status-amber" },
  SME: { icon: UserCog, iconBg: "bg-accent-soft", iconColor: "text-accent-ink", border: "border-l-accent" },
};

function RelationNodeImpl({ data }: NodeProps) {
  const d = data as unknown as RelationNodeData;
  const meta = kindMeta[d.kind];
  const Icon = meta.icon;
  const isCenter = d.kind === "center";
  return (
    <div
      className={cn(
        "w-[200px] rounded-lg border bg-card shadow-card px-3 py-2.5",
        isCenter ? "border-2 border-accent shadow-float" : cn("border border-l-4", meta.border)
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />
      {!isCenter && <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-ink-faint">{d.kind}</p>}
      <div className="flex items-start gap-2">
        <div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", meta.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", meta.iconColor)} strokeWidth={2} />
        </div>
        <p className="min-w-0 text-[11.5px] font-semibold leading-snug text-ink line-clamp-2">{d.label}</p>
      </div>
    </div>
  );
}
const RelationNode = memo(RelationNodeImpl);
const relationNodeTypes = { relation: RelationNode };

export interface RelationItem {
  id: string;
  name: string;
  kind: Exclude<RelationKind, "center">;
}

export function KnowledgeRelationGraph({ centerLabel, related }: { centerLabel: string; related: RelationItem[] }) {
  return (
    <ReactFlowProvider>
      <RelationGraphInner centerLabel={centerLabel} related={related} />
    </ReactFlowProvider>
  );
}

function RelationGraphInner({ centerLabel, related }: { centerLabel: string; related: RelationItem[] }) {
  const [nodes, setNodes] = useState<RFNode[]>([]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const n: RFNode[] = [
      { id: "center", type: "relation", position: { x: 0, y: 0 }, data: { label: centerLabel, kind: "center" } },
      ...related.map((r) => ({
        id: r.id,
        type: "relation",
        position: { x: 0, y: 0 },
        data: { label: r.name, kind: r.kind } satisfies RelationNodeData,
      })),
    ];
    const e: RFEdge[] = related.map((r) => ({
      id: `center-${r.id}`,
      source: "center",
      target: r.id,
      type: "smoothstep",
      style: { stroke: "var(--color-border-strong)", strokeWidth: 1.5 },
    }));
    return { initialNodes: n, initialEdges: e };
  }, [centerLabel, related]);

  useEffect(() => {
    let cancelled = false;
    layoutGraph(initialNodes, initialEdges, "RIGHT").then((positioned) => {
      if (!cancelled) setNodes(positioned);
    });
    return () => {
      cancelled = true;
    };
  }, [initialNodes, initialEdges]);

  if (related.length === 0) {
    return <div className="flex h-full items-center justify-center text-[12.5px] text-ink-mute">No related knowledge recorded yet.</div>;
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={initialEdges}
      nodeTypes={relationNodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-card-sunken/40" />
    </ReactFlow>
  );
}
