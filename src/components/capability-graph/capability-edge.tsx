import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export interface CapabilityEdgeData extends Record<string, unknown> {
  state: "normal" | "highlighted" | "dimmed";
}

function CapabilityEdgeImpl({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: EdgeProps) {
  const d = data as unknown as CapabilityEdgeData;
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isDimmed = d?.state === "dimmed";
  const isHighlighted = d?.state === "highlighted";

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: isHighlighted ? "var(--color-accent)" : "var(--color-border-strong)",
        strokeWidth: isHighlighted ? 1.75 : 1.25,
        opacity: isDimmed ? 0.15 : 1,
        transition: "stroke 150ms, opacity 150ms, stroke-width 150ms",
      }}
    />
  );
}

export const CapabilityEdge = memo(CapabilityEdgeImpl);
export const capabilityEdgeTypes = { capability: CapabilityEdge };
