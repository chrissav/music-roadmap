"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Music,
  BookOpen,
  Guitar,
  Headphones,
  Ear,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { RoadmapCard } from "@/components/ui/RoadmapCard";
import { roadmaps } from "@/data";
import {
  getCustomRoadmaps,
  deleteCustomRoadmap,
} from "@/lib/custom-roadmaps";
import type { RoadmapCategory, RoadmapDefinition } from "@/lib/types";

type FilterValue = "all" | RoadmapCategory;

const CATEGORY_FILTERS: {
  label: string;
  value: FilterValue;
  icon: typeof Music;
}[] = [
  { label: "All", value: "all", icon: BookOpen },
  { label: "Theory", value: "theory", icon: Music },
  { label: "Instruments", value: "instrument", icon: Guitar },
  { label: "Production", value: "production", icon: Headphones },
  { label: "Ear Training", value: "ear-training", icon: Ear },
];

const PLACEHOLDER_ROADMAPS: { title: string; category: RoadmapCategory }[] = [
  { title: "Ear Training Basics", category: "ear-training" },
  { title: "Music Production 101", category: "production" },
];

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [customRoadmaps, setCustomRoadmaps] = useState<RoadmapDefinition[]>(
    []
  );

  useEffect(() => {
    const store = getCustomRoadmaps();
    setCustomRoadmaps(Object.values(store));
  }, []);

  const filteredRoadmaps =
    activeFilter === "all"
      ? roadmaps
      : roadmaps.filter((r) => r.meta.category === activeFilter);

  const filteredCustom =
    activeFilter === "all"
      ? customRoadmaps
      : customRoadmaps.filter((r) => r.meta.category === activeFilter);

  const filteredPlaceholders =
    activeFilter === "all"
      ? PLACEHOLDER_ROADMAPS
      : PLACEHOLDER_ROADMAPS.filter((p) => p.category === activeFilter);

  const handleDeleteCustom = (slug: string) => {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return;
    deleteCustomRoadmap(slug);
    setCustomRoadmaps((prev) => prev.filter((r) => r.meta.slug !== slug));
  };

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

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {CATEGORY_FILTERS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
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

      {/* My Roadmaps Section */}
      {(filteredCustom.length > 0 || activeFilter === "all") && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Roadmaps
            </h2>
            <Link
              href="/roadmap/editor"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={14} /> Create
            </Link>
          </div>

          {filteredCustom.length === 0 ? (
            <Link
              href="/roadmap/editor"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Plus size={24} className="text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-foreground">
                Create your first roadmap
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag and drop nodes to build a custom learning path
              </p>
            </Link>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCustom.map((r) => (
                <div key={r.meta.slug} className="group relative">
                  <RoadmapCard
                    meta={r.meta}
                    nodeCount={r.nodes.length}
                    href={`/roadmap/custom/${r.meta.slug}`}
                  />
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/roadmap/editor?slug=${r.meta.slug}`}
                      className="rounded-md bg-card/90 p-1.5 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
                    >
                      <Pencil size={12} />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteCustom(r.meta.slug);
                      }}
                      className="rounded-md bg-card/90 p-1.5 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span className="absolute top-3 left-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Custom
                  </span>
                </div>
              ))}

              <Link
                href="/roadmap/editor"
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/50"
              >
                <Plus size={20} className="text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">
                  New Roadmap
                </span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Built-in Roadmap Cards Grid */}
      {filteredRoadmaps.length > 0 && (
        <>
          {filteredCustom.length > 0 && (
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Built-in Roadmaps
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.meta.slug}
                meta={roadmap.meta}
                nodeCount={roadmap.nodes.length}
              />
            ))}

            {filteredPlaceholders.map((placeholder) => (
              <div
                key={placeholder.title}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Music size={20} className="text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-muted-foreground">
                  {placeholder.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Coming Soon
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {filteredRoadmaps.length === 0 &&
        filteredCustom.length === 0 &&
        filteredPlaceholders.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No roadmaps in this category yet. Check back soon!
          </div>
        )}
    </div>
  );
}
