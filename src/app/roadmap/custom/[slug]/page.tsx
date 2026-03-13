"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";
import { getCustomRoadmap } from "@/lib/custom-roadmaps";
import type { RoadmapDefinition } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export default function CustomRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [roadmap, setRoadmap] = useState<RoadmapDefinition | null | undefined>(
    undefined
  );

  useEffect(() => {
    const data = getCustomRoadmap(slug);
    setRoadmap(data ?? null);
  }, [slug]);

  if (roadmap === undefined) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (roadmap === null) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          Custom roadmap not found
        </p>
        <p className="text-sm text-muted-foreground">
          This roadmap may have been deleted or only exists in another browser.
        </p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-4 z-10">
        <Link
          href={`/roadmap/editor?slug=${slug}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Pencil size={12} /> Edit
        </Link>
      </div>
      <ReactFlowProvider>
        <RoadmapViewer roadmap={roadmap} />
      </ReactFlowProvider>
    </div>
  );
}
