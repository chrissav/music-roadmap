"use client";

import { X, ExternalLink, BookOpen, Video, GraduationCap, Wrench } from "lucide-react";
import { StatusBadge } from "./StatusIndicator";
import type { RoadmapNodeData, NodeStatus } from "@/lib/types";

const RESOURCE_ICONS: Record<string, typeof BookOpen> = {
  article: BookOpen,
  video: Video,
  course: GraduationCap,
  tool: Wrench,
};

const STATUS_OPTIONS: { value: NodeStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "skipped", label: "Skip" },
];

export function TopicPanel({
  node,
  open,
  onClose,
  status,
  onSetStatus,
}: {
  node: RoadmapNodeData | null;
  open: boolean;
  onClose: () => void;
  status: NodeStatus;
  onSetStatus: (status: NodeStatus) => void;
}) {
  return (
    <div
      className={`fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-full max-w-md transform border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      {node && (
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                {node.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {node.description}
              </p>
              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Topic content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {node.details.content.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="mb-3 leading-relaxed text-card-foreground/90"
                >
                  {paragraph.split(/(\*\*[^*]+\*\*)/).map((segment, j) => {
                    if (segment.startsWith("**") && segment.endsWith("**")) {
                      return (
                        <strong key={j} className="text-card-foreground">
                          {segment.slice(2, -2)}
                        </strong>
                      );
                    }
                    return segment;
                  })}
                </p>
              ))}
            </div>

            {/* Resources */}
            {node.details.resources.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Resources
                </h3>
                <div className="space-y-2">
                  {node.details.resources.map((resource, i) => {
                    const Icon =
                      RESOURCE_ICONS[resource.type ?? "article"] ?? BookOpen;
                    return (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
                      >
                        <Icon
                          size={16}
                          className="shrink-0 text-primary"
                        />
                        <span className="flex-1 text-card-foreground">
                          {resource.title}
                        </span>
                        <ExternalLink
                          size={14}
                          className="shrink-0 text-muted-foreground"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Actions */}
          <div className="border-t border-border p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Mark as:
            </p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSetStatus(opt.value)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    status === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
