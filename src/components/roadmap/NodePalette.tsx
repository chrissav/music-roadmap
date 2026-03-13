"use client";

import { Play, Circle, GitBranch } from "lucide-react";
import type { RoadmapNodeData } from "@/lib/types";

const NODE_TYPES = [
  {
    type: "milestone",
    label: "Milestone",
    description: "Major section header",
    icon: Play,
  },
  {
    type: "topic",
    label: "Topic",
    description: "Main spine node",
    icon: Circle,
  },
  {
    type: "subtopic",
    label: "Subtopic",
    description: "Branch detail node",
    icon: GitBranch,
  },
] as const;

interface NodePaletteProps {
  onAddNode?: (type: RoadmapNodeData["type"]) => void;
  mobile?: boolean;
}

export function NodePalette({ onAddNode, mobile }: NodePaletteProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/roadmap-node-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  if (mobile) {
    return (
      <div className="p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Tap a node type to add it to the center of your canvas.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {NODE_TYPES.map(({ type, label, description, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onAddNode?.(type)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-colors active:bg-accent"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden w-48 shrink-0 flex-col gap-2 border-r border-border bg-card p-3 md:flex">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Drag to add
      </h3>
      {NODE_TYPES.map(({ type, label, description, icon: Icon }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          onClick={() => onAddNode?.(type)}
          className="flex cursor-grab items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon size={14} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-card-foreground">
              {label}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
