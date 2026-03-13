"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from "@xyflow/react";
import { useRouter } from "next/navigation";
import {
  Save,
  Download,
  Upload,
  Eye,
  AlertCircle,
  Check,
} from "lucide-react";
import { RoadmapNode, type RoadmapNodePayload } from "./RoadmapNode";
import { RoadmapEdge } from "./RoadmapEdge";
import { NodePalette } from "./NodePalette";
import { PropertyPanel } from "./PropertyPanel";
import { AIChatPanel } from "./AIChatPanel";
import {
  getCustomRoadmap,
  saveCustomRoadmap,
  deleteCustomRoadmap,
  generateSlug,
  isSlugAvailable,
  importRoadmapJSON,
} from "@/lib/custom-roadmaps";
import type {
  RoadmapDefinition,
  RoadmapMeta,
  RoadmapNodeData,
  RoadmapEdgeData,
} from "@/lib/types";

const nodeTypes = { roadmapNode: RoadmapNode };
const edgeTypes = { roadmapEdge: RoadmapEdge };

function createDefaultMeta(): RoadmapMeta {
  return {
    slug: "",
    title: "Untitled Roadmap",
    description: "",
    level: "beginner",
    category: "theory",
    estimatedHours: undefined,
  };
}

function createDefaultNode(
  type: RoadmapNodeData["type"],
  position: { x: number; y: number }
): RoadmapNodeData {
  const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    type,
    label: type === "milestone" ? "New Section" : type === "topic" ? "New Topic" : "New Subtopic",
    description: "",
    position,
    group: "default",
    details: { content: "", resources: [] },
  };
}

function toFlowNodes(nodeData: RoadmapNodeData[]): Node[] {
  return nodeData.map((n) => ({
    id: n.id,
    type: "roadmapNode",
    position: n.position,
    data: {
      label: n.label,
      description: n.description,
      nodeType: n.type,
      status: "not_started",
      group: n.group,
      onStatusCycle: () => {},
    } satisfies RoadmapNodePayload,
  }));
}

function toFlowEdges(edgeData: RoadmapEdgeData[]): Edge[] {
  return edgeData.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "roadmapEdge",
    data: { edgeStyle: e.style ?? "branch" },
  }));
}

export function RoadmapEditor({ editSlug }: { editSlug?: string }) {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNodeData[]>([]);
  const [roadmapEdges, setRoadmapEdges] = useState<RoadmapEdgeData[]>([]);
  const [meta, setMeta] = useState<RoadmapMeta>(createDefaultMeta);
  const [originalSlug, setOriginalSlug] = useState<string | undefined>(
    editSlug
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editSlug) {
      const existing = getCustomRoadmap(editSlug);
      if (existing) {
        setMeta(existing.meta);
        setRoadmapNodes(existing.nodes);
        setRoadmapEdges(existing.edges);
        setOriginalSlug(editSlug);
      }
    }
  }, [editSlug]);

  const flowNodes = useMemo(() => toFlowNodes(roadmapNodes), [roadmapNodes]);
  const flowEdges = useMemo(() => toFlowEdges(roadmapEdges), [roadmapEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const selectedNode = useMemo(
    () => roadmapNodes.find((n) => n.id === selectedNodeId) ?? null,
    [roadmapNodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => roadmapEdges.find((e) => e.id === selectedEdgeId) ?? null,
    [roadmapEdges, selectedEdgeId]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      const newEdge: RoadmapEdgeData = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        style: "branch",
      };
      setRoadmapEdges((prev) => [...prev, newEdge]);
      setEdges((eds) => addEdge({ ...params, type: "roadmapEdge", data: { edgeStyle: "branch" } }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setRoadmapNodes((prev) =>
        prev.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        )
      );
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData(
        "application/roadmap-node-type"
      ) as RoadmapNodeData["type"];
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createDefaultNode(nodeType, position);
      setRoadmapNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
      setSelectedEdgeId(null);
    },
    [screenToFlowPosition]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

        if (selectedNodeId) {
          setRoadmapNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
          setRoadmapEdges((prev) =>
            prev.filter(
              (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
            )
          );
          setSelectedNodeId(null);
        } else if (selectedEdgeId) {
          setRoadmapEdges((prev) =>
            prev.filter((e) => e.id !== selectedEdgeId)
          );
          setSelectedEdgeId(null);
        }
      }
    },
    [selectedNodeId, selectedEdgeId]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const handleUpdateNode = useCallback((updated: RoadmapNodeData) => {
    setRoadmapNodes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setRoadmapNodes((prev) => prev.filter((n) => n.id !== id));
    setRoadmapEdges((prev) =>
      prev.filter((e) => e.source !== id && e.target !== id)
    );
    setSelectedNodeId(null);
  }, []);

  const handleUpdateEdge = useCallback((updated: RoadmapEdgeData) => {
    setRoadmapEdges((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setRoadmapEdges((prev) => prev.filter((e) => e.id !== id));
    setSelectedEdgeId(null);
  }, []);

  const handleAIAddNodes = useCallback((newNodes: RoadmapNodeData[]) => {
    setRoadmapNodes((prev) => [...prev, ...newNodes]);
  }, []);

  const handleAIAddEdges = useCallback((newEdges: RoadmapEdgeData[]) => {
    setRoadmapEdges((prev) => [...prev, ...newEdges]);
  }, []);

  const handleAIUpdateNodes = useCallback((updated: RoadmapNodeData[]) => {
    setRoadmapNodes((prev) => {
      const updateMap = new Map(updated.map((n) => [n.id, n]));
      return prev.map((n) => updateMap.get(n.id) ?? n);
    });
  }, []);

  const handleAIUpdateMeta = useCallback(
    (update: Partial<Pick<RoadmapMeta, "title" | "description">>) => {
      setMeta((prev) => ({ ...prev, ...update }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!meta.title.trim()) {
      setErrorMsg("Title is required");
      setSaveStatus("error");
      return;
    }

    const slug = generateSlug(meta.title);
    if (!slug) {
      setErrorMsg("Title must produce a valid slug");
      setSaveStatus("error");
      return;
    }

    if (!isSlugAvailable(slug, originalSlug)) {
      setErrorMsg(`Slug "${slug}" is already taken`);
      setSaveStatus("error");
      return;
    }

    if (roadmapNodes.length === 0) {
      setErrorMsg("Add at least one node before saving");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    const definition: RoadmapDefinition = {
      meta: { ...meta, slug },
      nodes: roadmapNodes,
      edges: roadmapEdges,
    };

    try {
      if (originalSlug && originalSlug !== slug) {
        deleteCustomRoadmap(originalSlug);
      }
      saveCustomRoadmap(definition);
      setMeta((prev) => ({ ...prev, slug }));
      setOriginalSlug(slug);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setErrorMsg("Failed to save");
      setSaveStatus("error");
    }
  }, [meta, roadmapNodes, roadmapEdges, originalSlug]);

  const handleExport = useCallback(() => {
    const slug = meta.slug || generateSlug(meta.title);
    const definition: RoadmapDefinition = {
      meta: { ...meta, slug },
      nodes: roadmapNodes,
      edges: roadmapEdges,
    };
    const json = JSON.stringify(definition, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "roadmap"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [meta, roadmapNodes, roadmapEdges]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = ev.target?.result as string;
          const imported = importRoadmapJSON(json);
          setMeta(imported.meta);
          setRoadmapNodes(imported.nodes);
          setRoadmapEdges(imported.edges);
          setOriginalSlug(undefined);
          setErrorMsg("");
          setSaveStatus("idle");
        } catch (err) {
          setErrorMsg(
            err instanceof Error ? err.message : "Invalid JSON file"
          );
          setSaveStatus("error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handlePreview = useCallback(() => {
    if (meta.slug) {
      router.push(`/roadmap/custom/${meta.slug}`);
    } else {
      setErrorMsg("Save the roadmap first to preview it");
      setSaveStatus("error");
    }
  }, [meta.slug, router]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">
            {editSlug ? "Edit Roadmap" : "Create Roadmap"}
          </h1>
          {meta.title && (
            <span className="text-xs text-muted-foreground">
              — {meta.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={12} />
              {errorMsg}
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <Check size={12} />
              Saved
            </span>
          )}

          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Upload size={12} /> Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={12} />
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />

        <div ref={reactFlowWrapper} className="flex-1 roadmap-editor">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            deleteKeyCode={null}
            minZoom={0.2}
            maxZoom={3}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: "roadmapEdge" }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--border)"
            />
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeWidth={3}
              pannable
              zoomable
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </div>

        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          meta={meta}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onUpdateMeta={setMeta}
        />

        <AIChatPanel
          currentNodes={roadmapNodes}
          currentEdges={roadmapEdges}
          meta={meta}
          onAddNodes={handleAIAddNodes}
          onAddEdges={handleAIAddEdges}
          onUpdateNodes={handleAIUpdateNodes}
          onUpdateMeta={handleAIUpdateMeta}
        />
      </div>
    </div>
  );
}
