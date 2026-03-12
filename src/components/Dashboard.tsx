"use client";

import { Music, BookOpen, Guitar, Headphones } from "lucide-react";
import { RoadmapCard } from "@/components/ui/RoadmapCard";
import { roadmaps } from "@/data";

const CATEGORY_FILTERS = [
  { label: "All", value: "all", icon: BookOpen },
  { label: "Theory", value: "theory", icon: Music },
  { label: "Instruments", value: "instrument", icon: Guitar },
  { label: "Production", value: "production", icon: Headphones },
];

export function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Music size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Music Roadmap
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
          Interactive learning paths for music theory, instruments, and
          production. Click any topic to learn more and track your progress.
        </p>
      </div>

      {/* Category Filters (visual only for now — functional when more roadmaps exist) */}
      <div className="mb-8 flex justify-center gap-2">
        {CATEGORY_FILTERS.map((cat) => {
          const Icon = cat.icon;
          const isAll = cat.value === "all";
          return (
            <button
              key={cat.value}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isAll
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Roadmap Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.meta.slug}
            meta={roadmap.meta}
            nodeCount={roadmap.nodes.length}
          />
        ))}

        {/* Placeholder cards for future roadmaps */}
        {["Ear Training Basics", "Music Production 101"].map(
          (title) => (
            <div
              key={title}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Music size={20} className="text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-muted-foreground">
                {title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Coming Soon
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
