"use client";

import Link from "next/link";
import {
  Music,
  Guitar,
  Mic2,
  Headphones,
  Ear,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCompletionStats } from "@/lib/progress";
import type { RoadmapMeta } from "@/lib/types";

const CATEGORY_ICONS: Record<string, typeof Music> = {
  theory: Music,
  instrument: Guitar,
  production: Headphones,
  composition: Mic2,
  "ear-training": Ear,
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function RoadmapCard({
  meta,
  nodeCount,
}: {
  meta: RoadmapMeta;
  nodeCount: number;
}) {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const stats = getCompletionStats(meta.slug, nodeCount);
    setPercentage(stats.percentage);
  }, [meta.slug, nodeCount]);

  const Icon = CATEGORY_ICONS[meta.category] ?? Music;

  return (
    <Link
      href={`/roadmap/${meta.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />

      <div className="flex flex-1 flex-col p-5">
        {/* Icon & Level */}
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon size={20} className="text-primary" />
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${LEVEL_COLORS[meta.level]}`}
          >
            {meta.level}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {meta.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {meta.description}
        </p>

        {/* Footer: Progress + CTA */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {percentage}%
            </span>
          </div>
          {meta.estimatedHours && (
            <span className="text-xs text-muted-foreground">
              ~{meta.estimatedHours}h
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Start Learning <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
