"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";
import type { RoadmapDefinition } from "@/lib/types";

export function RoadmapPageClient({
  roadmap,
}: {
  roadmap: RoadmapDefinition;
}) {
  return (
    <ReactFlowProvider>
      <RoadmapViewer roadmap={roadmap} />
    </ReactFlowProvider>
  );
}
