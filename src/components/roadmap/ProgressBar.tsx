"use client";

import { CheckCircle2, Clock, SkipForward } from "lucide-react";

interface ProgressStats {
  done: number;
  inProgress: number;
  skipped: number;
  percentage: number;
}

export function ProgressBar({
  stats,
  totalNodes,
  title,
}: {
  stats: ProgressStats;
  totalNodes: number;
  title: string;
}) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <h1 className="shrink-0 text-sm font-semibold text-card-foreground">
          {title}
        </h1>

        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            {stats.done}/{totalNodes}
          </span>
          {stats.inProgress > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-blue-500" />
              {stats.inProgress}
            </span>
          )}
          {stats.skipped > 0 && (
            <span className="flex items-center gap-1">
              <SkipForward size={12} className="text-zinc-400" />
              {stats.skipped}
            </span>
          )}
          <span className="font-medium text-card-foreground">
            {stats.percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
