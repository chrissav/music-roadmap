import type { RoadmapDefinition } from "./types";
import { getAllRoadmapSlugs } from "@/data";

const STORAGE_KEY = "music-roadmap-custom";

type CustomRoadmapStore = Record<string, RoadmapDefinition>;

function readStore(): CustomRoadmapStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomRoadmapStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CustomRoadmapStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getCustomRoadmaps(): CustomRoadmapStore {
  return readStore();
}

export function getCustomRoadmap(
  slug: string
): RoadmapDefinition | undefined {
  return readStore()[slug];
}

export function saveCustomRoadmap(roadmap: RoadmapDefinition): void {
  const store = readStore();
  store[roadmap.meta.slug] = roadmap;
  writeStore(store);
}

export function deleteCustomRoadmap(slug: string): void {
  const store = readStore();
  delete store[slug];
  writeStore(store);
}

export function getAllCustomSlugs(): string[] {
  return Object.keys(readStore());
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function isSlugAvailable(slug: string, currentSlug?: string): boolean {
  if (slug === currentSlug) return true;
  const builtIn = getAllRoadmapSlugs();
  const custom = getAllCustomSlugs();
  return !builtIn.includes(slug) && !custom.includes(slug);
}

export function exportRoadmapJSON(slug: string): string {
  const roadmap = getCustomRoadmap(slug);
  if (!roadmap) throw new Error(`Roadmap "${slug}" not found`);
  return JSON.stringify(roadmap, null, 2);
}

export function importRoadmapJSON(json: string): RoadmapDefinition {
  const data = JSON.parse(json);
  if (!data?.meta?.slug || !data?.meta?.title || !Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
    throw new Error("Invalid roadmap JSON: missing required fields (meta.slug, meta.title, nodes, edges)");
  }
  return data as RoadmapDefinition;
}
