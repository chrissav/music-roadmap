import { notFound } from "next/navigation";
import { getRoadmapBySlug, getAllRoadmapSlugs } from "@/data";
import { RoadmapPageClient } from "./RoadmapPageClient";

export function generateStaticParams() {
  return getAllRoadmapSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);
  if (!roadmap) return { title: "Not Found" };

  return {
    title: `${roadmap.meta.title} — Music Roadmap`,
    description: roadmap.meta.description,
  };
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);

  if (!roadmap) {
    notFound();
  }

  return <RoadmapPageClient roadmap={roadmap} />;
}
