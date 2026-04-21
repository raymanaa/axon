"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import { useCallback, useState, type DragEvent } from "react";
import { ConfigPanel } from "@/components/config-panel";
import { nodeTypes } from "@/components/nodes";
import { Palette, PALETTE_MIME } from "@/components/palette";
import {
  makeNodeData,
  NODE_META,
  type AxonNode,
  type AxonNodeData,
  type NodeKind,
} from "@/lib/node-types";

const INITIAL_NODES: AxonNode[] = [
  {
    id: "n1",
    type: "trigger",
    position: { x: 80, y: 200 },
    data: makeNodeData("trigger"),
  },
  {
    id: "n2",
    type: "llm",
    position: { x: 400, y: 180 },
    data: makeNodeData("llm"),
  },
  {
    id: "n3",
    type: "reply",
    position: { x: 740, y: 200 },
    data: makeNodeData("reply"),
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2", animated: true },
  { id: "e2-3", source: "n2", target: "n3", animated: true },
];

function Workspace() {
  const { screenToFlowPosition } = useReactFlow<AxonNode>();
  const [nodes, setNodes, onNodesChange] =
    useNodesState<AxonNode>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onConnect = useCallback(
    (conn: Connection) => setEdges((eds) => addEdge(conn, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData(PALETTE_MIME) as NodeKind;
      if (!kind) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const id = `n${crypto.randomUUID().slice(0, 8)}`;
      const newNode: AxonNode = {
        id,
        type: kind,
        position,
        data: makeNodeData(kind),
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const first = params.nodes?.[0];
    setSelectedId(first ? first.id : null);
  }, []);

  const updateNodeData = useCallback(
    (id: string, patch: Partial<AxonNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? ({ ...n, data: { ...n.data, ...patch } } as AxonNode)
            : n,
        ),
      );
    },
    [setNodes],
  );

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex h-full w-full">
      <Palette />
      <main className="relative flex-1">
        <ReactFlow<AxonNode>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
          defaultEdgeOptions={{
            animated: true,
            style: {
              stroke: "color-mix(in oklab, var(--foreground) 35%, transparent)",
              strokeWidth: 1.5,
            },
          }}
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.2}
            color="color-mix(in oklab, var(--foreground) 22%, transparent)"
          />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) =>
              NODE_META[(n.type ?? "trigger") as NodeKind].accent
            }
            nodeStrokeWidth={0}
            maskColor="rgba(10,10,11,0.75)"
          />
        </ReactFlow>
      </main>
      <ConfigPanel node={selected} onUpdate={updateNodeData} />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <Workspace />
    </ReactFlowProvider>
  );
}
