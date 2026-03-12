"use client";

import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

export function RoadmapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const edgeStyle = (data as Record<string, unknown> | undefined)?.edgeStyle;
  const isSpine = edgeStyle === "spine";

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: isSpine ? "var(--primary)" : "var(--border)",
        strokeWidth: isSpine ? 2.5 : 1.5,
        strokeDasharray: isSpine ? undefined : "6 4",
        opacity: isSpine ? 0.4 : 0.8,
      }}
    />
  );
}
