"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import { RoadmapNode, type RoadmapNodePayload } from "./RoadmapNode";
import { RoadmapEdge } from "./RoadmapEdge";
import { TopicPanel } from "./TopicPanel";
import { ProgressBar } from "./ProgressBar";
import {
  getRoadmapProgress,
  cycleNodeStatus,
  setNodeStatus,
  getCompletionStats,
} from "@/lib/progress";
import type {
  RoadmapDefinition,
  RoadmapProgress,
  NodeStatus,
  RoadmapNodeData,
} from "@/lib/types";

const nodeTypes = { roadmapNode: RoadmapNode };
const edgeTypes = { roadmapEdge: RoadmapEdge };

function buildFlowNodes(
  roadmap: RoadmapDefinition,
  progress: RoadmapProgress,
  onStatusCycle: (nodeId: string) => void
): Node[] {
  return roadmap.nodes.map((n) => ({
    id: n.id,
    type: "roadmapNode",
    position: n.position,
    data: {
      label: n.label,
      description: n.description,
      nodeType: n.type,
      status: progress[n.id]?.status ?? "not_started",
      group: n.group,
      onStatusCycle: () => onStatusCycle(n.id),
    } satisfies RoadmapNodePayload,
  }));
}

function buildFlowEdges(roadmap: RoadmapDefinition): Edge[] {
  return roadmap.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "roadmapEdge",
    animated: e.animated ?? false,
  }));
}

export function RoadmapViewer({ roadmap }: { roadmap: RoadmapDefinition }) {
  const slug = roadmap.meta.slug;
  const [progress, setProgress] = useState<RoadmapProgress>({});
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(
    null
  );
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setProgress(getRoadmapProgress(slug));
  }, [slug]);

  const handleStatusCycle = useCallback(
    (nodeId: string) => {
      const { progress: updated } = cycleNodeStatus(slug, nodeId);
      setProgress({ ...updated });
    },
    [slug]
  );

  const handleSetStatus = useCallback(
    (nodeId: string, status: NodeStatus) => {
      const updated = setNodeStatus(slug, nodeId, status);
      setProgress({ ...updated });
    },
    [slug]
  );

  const flowNodes = useMemo(
    () => buildFlowNodes(roadmap, progress, handleStatusCycle),
    [roadmap, progress, handleStatusCycle]
  );
  const flowEdges = useMemo(() => buildFlowEdges(roadmap), [roadmap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  const stats = useMemo(
    () => getCompletionStats(slug, roadmap.nodes.length),
    [slug, roadmap.nodes.length, progress]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodeData = roadmap.nodes.find((n) => n.id === node.id);
      if (nodeData) {
        setSelectedNode(nodeData);
        setPanelOpen(true);
      }
    },
    [roadmap.nodes]
  );

  const handlePanelClose = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => setSelectedNode(null), 300);
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <div className="flex-1">
        <ProgressBar
          stats={stats}
          totalNodes={roadmap.nodes.length}
          title={roadmap.meta.title}
        />
        <div className="h-[calc(100vh-8rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
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
      </div>

      <TopicPanel
        node={selectedNode}
        open={panelOpen}
        onClose={handlePanelClose}
        status={
          selectedNode ? progress[selectedNode.id]?.status ?? "not_started" : "not_started"
        }
        onSetStatus={(status) => {
          if (selectedNode) handleSetStatus(selectedNode.id, status);
        }}
      />
    </div>
  );
}
