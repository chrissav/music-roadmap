"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapEditor } from "@/components/roadmap/RoadmapEditor";

function EditorInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;

  return (
    <ReactFlowProvider>
      <RoadmapEditor editSlug={slug} />
    </ReactFlowProvider>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
          Loading editor...
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
