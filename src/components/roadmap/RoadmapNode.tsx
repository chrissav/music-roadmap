"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StatusIndicator } from "./StatusIndicator";
import { Play } from "lucide-react";
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

function RoadmapNodeComponent({ data, selected }: RoadmapNodeProps) {
  const borderColor =
    data.nodeType === "milestone"
      ? "border-primary"
      : BORDER_COLORS[data.status];

  const isMilestone = data.nodeType === "milestone";
  const isTopic = data.nodeType === "topic";
  const isSubtopic = data.nodeType === "subtopic";

  const sizeClass = isMilestone
    ? "w-[280px] px-6 py-4"
    : isTopic
      ? "w-[230px] px-4 py-3"
      : "w-[190px] px-3 py-2";

  const textClass = isMilestone
    ? "text-lg font-bold"
    : isTopic
      ? "text-base font-semibold"
      : "text-sm font-medium";

  const roundedClass = isMilestone
    ? "rounded-xl"
    : isTopic
      ? "rounded-lg"
      : "rounded-md";

  const shadowClass = isMilestone
    ? "shadow-md hover:shadow-lg"
    : isTopic
      ? "shadow-sm hover:shadow-md"
      : "shadow-none hover:shadow-sm";

  const bgClass = isMilestone
    ? "bg-gradient-to-br from-primary/15 to-primary/5"
    : "bg-card";

  const borderWidth = isSubtopic ? "border" : "border-2";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2 !opacity-0" />
      <div
        className={`group cursor-pointer transition-all ${roundedClass} ${borderWidth} ${bgClass} ${sizeClass} ${shadowClass} ${borderColor} ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
        onContextMenu={(e) => {
          e.preventDefault();
          data.onStatusCycle();
        }}
      >
        {isMilestone ? (
          <div className="flex flex-col items-center gap-1.5">
            <Play size={18} className="text-primary fill-primary/30" />
            <span className={`${textClass} leading-tight text-card-foreground text-center`}>
              {data.label}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onStatusCycle();
              }}
              className="shrink-0"
              aria-label="Toggle status"
            >
              <StatusIndicator status={data.status} size={isTopic ? 16 : 12} />
            </button>
            <span
              className={`${textClass} leading-tight text-card-foreground ${data.status === "skipped" ? "line-through opacity-60" : ""}`}
            >
              {data.label}
            </span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2 !opacity-0" />
    </>
  );
}

export const RoadmapNode = memo(RoadmapNodeComponent);
