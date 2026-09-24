import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface GraphEdgeData extends Record<string, unknown> {
  label: string;
  contradiction?: boolean;
  state: "normal" | "highlighted" | "dimmed";
  animated?: boolean;
}

function GraphEdgeImpl({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: EdgeProps) {
  const d = data as unknown as GraphEdgeData;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  const isDimmed = d?.state === "dimmed";
  const isHighlighted = d?.state === "highlighted";

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: d?.contradiction ? "var(--color-status-red)" : isHighlighted ? "var(--color-accent)" : "var(--color-border-strong)",
          strokeWidth: isHighlighted || d?.contradiction ? 1.75 : 1.25,
          strokeDasharray: d?.contradiction ? "4 3" : undefined,
          opacity: isDimmed ? 0.15 : 1,
          transition: "stroke 150ms, opacity 150ms, stroke-width 150ms",
        }}
        className={cn(d?.animated && !isDimmed && "react-flow__edge-path-selected")}
      />
      {d?.label && (isHighlighted || d?.contradiction) && !isDimmed && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[9.5px] font-medium whitespace-nowrap shadow-pill",
              d.contradiction ? "border-status-red bg-status-red-soft text-status-red" : "border-accent-border bg-card text-accent-ink"
            )}
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const GraphEdge = memo(GraphEdgeImpl);

export const graphEdgeTypes = { knowledge: GraphEdge };
