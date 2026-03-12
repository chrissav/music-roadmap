import type {
  AllProgress,
  NodeProgress,
  NodeStatus,
  RoadmapProgress,
} from "./types";

const STORAGE_KEY = "music-roadmap-progress";

const STATUS_CYCLE: NodeStatus[] = [
  "not_started",
  "in_progress",
  "done",
  "skipped",
];

function readAll(): AllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllProgress) : {};
  } catch {
    return {};
  }
}

function writeAll(data: AllProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRoadmapProgress(slug: string): RoadmapProgress {
  const all = readAll();
  return all[slug] ?? {};
}

export function getNodeStatus(slug: string, nodeId: string): NodeStatus {
  const progress = getRoadmapProgress(slug);
  return progress[nodeId]?.status ?? "not_started";
}

export function setNodeStatus(
  slug: string,
  nodeId: string,
  status: NodeStatus
): RoadmapProgress {
  const all = readAll();
  if (!all[slug]) all[slug] = {};

  if (status === "not_started") {
    delete all[slug][nodeId];
  } else {
    all[slug][nodeId] = {
      status,
      updatedAt: new Date().toISOString(),
    } satisfies NodeProgress;
  }

  writeAll(all);
  return all[slug];
}

export function cycleNodeStatus(
  slug: string,
  nodeId: string
): { newStatus: NodeStatus; progress: RoadmapProgress } {
  const current = getNodeStatus(slug, nodeId);
  const currentIdx = STATUS_CYCLE.indexOf(current);
  const newStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
  const progress = setNodeStatus(slug, nodeId, newStatus);
  return { newStatus, progress };
}

export function getCompletionStats(
  slug: string,
  totalNodes: number
): { done: number; inProgress: number; skipped: number; percentage: number } {
  const progress = getRoadmapProgress(slug);
  let done = 0;
  let inProgress = 0;
  let skipped = 0;

  for (const entry of Object.values(progress)) {
    if (entry.status === "done") done++;
    else if (entry.status === "in_progress") inProgress++;
    else if (entry.status === "skipped") skipped++;
  }

  const percentage = totalNodes > 0 ? Math.round((done / totalNodes) * 100) : 0;
  return { done, inProgress, skipped, percentage };
}

export function resetRoadmapProgress(slug: string): void {
  const all = readAll();
  delete all[slug];
  writeAll(all);
}
