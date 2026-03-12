"use client";

import { Check, Clock, X, Circle } from "lucide-react";
import type { NodeStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  NodeStatus,
  { icon: typeof Check; label: string; className: string }
> = {
  not_started: {
    icon: Circle,
    label: "Not Started",
    className: "text-muted-foreground",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    className: "text-blue-500",
  },
  done: {
    icon: Check,
    label: "Done",
    className: "text-emerald-500",
  },
  skipped: {
    icon: X,
    label: "Skipped",
    className: "text-zinc-400",
  },
};

export function StatusIndicator({
  status,
  size = 14,
}: {
  status: NodeStatus;
  size?: number;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${config.className}`}>
      <Icon size={size} />
    </span>
  );
}

export function StatusBadge({ status }: { status: NodeStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const bgMap: Record<NodeStatus, string> = {
    not_started: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    skipped: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bgMap[status]}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}
