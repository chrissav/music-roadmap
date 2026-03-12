import type { RoadmapDefinition } from "@/lib/types";
import musicTheoryFundamentals from "./roadmaps/music-theory-fundamentals.json";
import guitarFundamentals from "./roadmaps/guitar-fundamentals.json";

export const roadmaps: RoadmapDefinition[] = [
  musicTheoryFundamentals as RoadmapDefinition,
  guitarFundamentals as RoadmapDefinition,
];

export function getRoadmapBySlug(
  slug: string
): RoadmapDefinition | undefined {
  return roadmaps.find((r) => r.meta.slug === slug);
}

export function getAllRoadmapSlugs(): string[] {
  return roadmaps.map((r) => r.meta.slug);
}
