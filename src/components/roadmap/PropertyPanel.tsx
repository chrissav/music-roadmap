"use client";

import { Trash2, Plus, X } from "lucide-react";
import type {
  RoadmapMeta,
  RoadmapNodeData,
  RoadmapEdgeData,
  RoadmapLevel,
  RoadmapCategory,
  Resource,
} from "@/lib/types";

interface PropertyPanelProps {
  selectedNode: RoadmapNodeData | null;
  selectedEdge: RoadmapEdgeData | null;
  meta: RoadmapMeta;
  onUpdateNode: (node: RoadmapNodeData) => void;
  onDeleteNode: (id: string) => void;
  onUpdateEdge: (edge: RoadmapEdgeData) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateMeta: (meta: RoadmapMeta) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
    />
  );
}

function ResourceRow({
  resource,
  onChange,
  onRemove,
}: {
  resource: Resource;
  onChange: (r: Resource) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-background p-2">
      <div className="flex items-center gap-1">
        <input
          value={resource.title}
          onChange={(e) => onChange({ ...resource, title: e.target.value })}
          placeholder="Title"
          className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
        <button
          onClick={onRemove}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={12} />
        </button>
      </div>
      <input
        value={resource.url}
        onChange={(e) => onChange({ ...resource, url: e.target.value })}
        placeholder="URL"
        className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
      />
      <select
        value={resource.type ?? "article"}
        onChange={(e) =>
          onChange({
            ...resource,
            type: e.target.value as Resource["type"],
          })
        }
        className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
      >
        <option value="article">Article</option>
        <option value="video">Video</option>
        <option value="course">Course</option>
        <option value="tool">Tool</option>
      </select>
    </div>
  );
}

function NodeEditor({
  node,
  onUpdate,
  onDelete,
}: {
  node: RoadmapNodeData;
  onUpdate: (n: RoadmapNodeData) => void;
  onDelete: (id: string) => void;
}) {
  const updateField = <K extends keyof RoadmapNodeData>(
    key: K,
    value: RoadmapNodeData[K]
  ) => {
    onUpdate({ ...node, [key]: value });
  };

  const updateDetails = (content: string) => {
    onUpdate({ ...node, details: { ...node.details, content } });
  };

  const updateResources = (resources: Resource[]) => {
    onUpdate({ ...node, details: { ...node.details, resources } });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
        <button
          onClick={() => onDelete(node.id)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <div>
        <Label>Label</Label>
        <Input
          value={node.label}
          onChange={(v) => updateField("label", v)}
          placeholder="Node label"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={node.description}
          onChange={(v) => updateField("description", v)}
          placeholder="Short description"
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={node.type}
          onChange={(v) =>
            updateField("type", v as RoadmapNodeData["type"])
          }
          options={[
            { value: "milestone", label: "Milestone" },
            { value: "topic", label: "Topic" },
            { value: "subtopic", label: "Subtopic" },
          ]}
        />
      </div>

      <div>
        <Label>Group</Label>
        <Input
          value={node.group}
          onChange={(v) => updateField("group", v)}
          placeholder="e.g. basics, scales"
        />
      </div>

      <div>
        <Label>Details Content</Label>
        <Textarea
          value={node.details.content}
          onChange={updateDetails}
          placeholder="Detailed markdown content..."
          rows={6}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Resources</Label>
          <button
            onClick={() =>
              updateResources([
                ...node.details.resources,
                { title: "", url: "", type: "article" },
              ])
            }
            className="flex items-center gap-0.5 text-xs text-primary hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {node.details.resources.map((r, i) => (
            <ResourceRow
              key={i}
              resource={r}
              onChange={(updated) => {
                const copy = [...node.details.resources];
                copy[i] = updated;
                updateResources(copy);
              }}
              onRemove={() => {
                updateResources(node.details.resources.filter((_, j) => j !== i));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EdgeEditor({
  edge,
  onUpdate,
  onDelete,
}: {
  edge: RoadmapEdgeData;
  onUpdate: (e: RoadmapEdgeData) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Edit Edge</h3>
        <button
          onClick={() => onDelete(edge.id)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <div>
        <Label>Style</Label>
        <div className="flex gap-2">
          {(["spine", "branch"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate({ ...edge, style: s })}
              className={`flex-1 rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${
                edge.style === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {edge.source} → {edge.target}
      </div>
    </div>
  );
}

function MetaEditor({
  meta,
  onUpdate,
}: {
  meta: RoadmapMeta;
  onUpdate: (m: RoadmapMeta) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Roadmap Settings</h3>

      <div>
        <Label>Title</Label>
        <Input
          value={meta.title}
          onChange={(v) => onUpdate({ ...meta, title: v })}
          placeholder="My Roadmap"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={meta.description}
          onChange={(v) => onUpdate({ ...meta, description: v })}
          placeholder="Describe this roadmap..."
          rows={3}
        />
      </div>

      <div>
        <Label>Level</Label>
        <Select
          value={meta.level}
          onChange={(v) => onUpdate({ ...meta, level: v as RoadmapLevel })}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select
          value={meta.category}
          onChange={(v) =>
            onUpdate({ ...meta, category: v as RoadmapCategory })
          }
          options={[
            { value: "theory", label: "Theory" },
            { value: "instrument", label: "Instrument" },
            { value: "production", label: "Production" },
            { value: "composition", label: "Composition" },
            { value: "history", label: "History" },
          ]}
        />
      </div>

      <div>
        <Label>Estimated Hours</Label>
        <Input
          type="number"
          value={meta.estimatedHours ?? ""}
          onChange={(v) =>
            onUpdate({
              ...meta,
              estimatedHours: v ? parseInt(v, 10) : undefined,
            })
          }
          placeholder="40"
        />
      </div>
    </div>
  );
}

export function PropertyPanel(props: PropertyPanelProps & { mobile?: boolean }) {
  const {
    selectedNode,
    selectedEdge,
    meta,
    onUpdateNode,
    onDeleteNode,
    onUpdateEdge,
    onDeleteEdge,
    onUpdateMeta,
    mobile,
  } = props;

  return (
    <div
      className={
        mobile
          ? "flex flex-col overflow-y-auto p-3"
          : "hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card p-3 md:flex"
      }
    >
      {selectedNode ? (
        <NodeEditor
          node={selectedNode}
          onUpdate={onUpdateNode}
          onDelete={onDeleteNode}
        />
      ) : selectedEdge ? (
        <EdgeEditor
          edge={selectedEdge}
          onUpdate={onUpdateEdge}
          onDelete={onDeleteEdge}
        />
      ) : (
        <MetaEditor meta={meta} onUpdate={onUpdateMeta} />
      )}
    </div>
  );
}
