export type NodeStatus = "not_started" | "in_progress" | "done" | "skipped";

export type RoadmapLevel = "beginner" | "intermediate" | "advanced";

export type RoadmapCategory =
  | "theory"
  | "instrument"
  | "production"
  | "composition"
  | "history";

export interface Resource {
  title: string;
  url: string;
  type?: "article" | "video" | "course" | "tool";
}

export interface TopicDetails {
  content: string;
  resources: Resource[];
}

export interface RoadmapNodeData {
  id: string;
  type: "topic" | "subtopic" | "milestone";
  label: string;
  description: string;
  position: { x: number; y: number };
  group: string;
  details: TopicDetails;
}

export interface RoadmapEdgeData {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: "spine" | "branch";
}

export interface RoadmapMeta {
  slug: string;
  title: string;
  description: string;
  level: RoadmapLevel;
  category: RoadmapCategory;
  icon?: string;
  estimatedHours?: number;
}

export interface RoadmapDefinition {
  meta: RoadmapMeta;
  nodes: RoadmapNodeData[];
  edges: RoadmapEdgeData[];
}

export interface NodeProgress {
  status: NodeStatus;
  updatedAt: string;
}

export type RoadmapProgress = Record<string, NodeProgress>;

export type AllProgress = Record<string, RoadmapProgress>;
