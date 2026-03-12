"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StatusIndicator } from "./StatusIndicator";
import type { NodeStatus } from "@/lib/types";

export interface RoadmapNodePayload {
  label: string;
  description: string;
  nodeType: "topic" | "subtopic" | "milestone";
  status: NodeStatus;
  group: string;
  onStatusCycle: () => void;
}

type RoadmapNodeProps = NodeProps & { data: RoadmapNodePayload };

const BORDER_COLORS: Record<NodeStatus, string> = {
  not_started: "border-border",
  in_progress: "border-blue-500",
  done: "border-emerald-500",
  skipped: "border-zinc-400 opacity-60",
};

const TYPE_STYLES: Record<string, string> = {
  milestone:
    "min-w-[200px] bg-primary/10 border-primary text-center font-semibold",
  topic: "min-w-[160px]",
  subtopic: "min-w-[140px] text-sm",
};

function RoadmapNodeComponent({ data, selected }: RoadmapNodeProps) {
  const borderColor =
    data.nodeType === "milestone"
      ? "border-primary"
      : BORDER_COLORS[data.status];

  const typeStyle = TYPE_STYLES[data.nodeType] ?? "";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <div
        className={`group cursor-pointer rounded-lg border-2 bg-card px-4 py-3 shadow-sm transition-all hover:shadow-md ${borderColor} ${typeStyle} ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
        onContextMenu={(e) => {
          e.preventDefault();
          data.onStatusCycle();
        }}
      >
        <div className="flex items-center gap-2">
          {data.nodeType !== "milestone" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onStatusCycle();
              }}
              className="shrink-0"
              aria-label="Toggle status"
            >
              <StatusIndicator status={data.status} />
            </button>
          )}
          <span
            className={`font-medium leading-tight text-card-foreground ${data.status === "skipped" ? "line-through" : ""}`}
          >
            {data.label}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </>
  );
}

export const RoadmapNode = memo(RoadmapNodeComponent);
