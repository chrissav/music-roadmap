"use client";

import { Play, Circle, GitBranch } from "lucide-react";

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

export function NodePalette() {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/roadmap-node-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex w-48 shrink-0 flex-col gap-2 border-r border-border bg-card p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Drag to add
      </h3>
      {NODE_TYPES.map(({ type, label, description, icon: Icon }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
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
