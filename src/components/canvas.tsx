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
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState, type DragEvent } from "react";
import { ConfigPanel } from "@/components/config-panel";
import { nodeTypes } from "@/components/nodes";
import { Onboarding } from "@/components/onboarding";
import { Palette, PALETTE_MIME } from "@/components/palette";
import { HelpPopover, TopBar } from "@/components/top-bar";
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
    position: { x: 80, y: 220 },
    data: makeNodeData("trigger"),
  },
  {
    id: "n2",
    type: "llm",
    position: { x: 380, y: 200 },
    data: makeNodeData("llm"),
  },
  {
    id: "n3",
    type: "reply",
    position: { x: 700, y: 220 },
    data: makeNodeData("reply"),
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2" },
  { id: "e2-3", source: "n2", target: "n3" },
];

function Workspace() {
  const { screenToFlowPosition } = useReactFlow<AxonNode>();
  const [nodes, setNodes, onNodesChange] =
    useNodesState<AxonNode>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

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

  // Keyboard shortcut for help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !helpOpen) {
        const tag = (e.target as HTMLElement | null)?.tagName ?? "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setHelpOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [helpOpen]);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex h-full w-full flex-col bg-paper">
      <TopBar
        nodeCount={nodes.length}
        onShowHelp={() => setHelpOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
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
            fitViewOptions={{ padding: 0.28, maxZoom: 1.1 }}
            defaultEdgeOptions={{ type: "default" }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1}
              color="color-mix(in oklab, var(--ink) 14%, transparent)"
            />
            <Controls showInteractive={false} position="bottom-left" />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) =>
                NODE_META[(n.type ?? "trigger") as NodeKind].accent
              }
              nodeStrokeColor="var(--line-2)"
              nodeStrokeWidth={1}
              maskColor="rgba(250, 249, 246, 0.75)"
              position="bottom-right"
            />
          </ReactFlow>

          <CanvasHint empty={nodes.length === 0} />
        </main>
        <ConfigPanel node={selected} onUpdate={updateNodeData} />
      </div>

      <AnimatePresence>
        {helpOpen && <HelpPopover onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>

      <Onboarding />
    </div>
  );
}

function CanvasHint({ empty }: { empty: boolean }) {
  if (!empty) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-none max-w-[340px] text-center">
        <div className="serif-italic text-[28px] leading-[1.15] text-ink-2">
          Drop a Trigger to begin.
        </div>
        <p className="mt-3 text-[12.5px] text-ink-3 leading-relaxed">
          Pick a node from the left panel and drag it here. Press{" "}
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line bg-card px-1.5 font-mono text-[11px] text-ink-2">
            ?
          </kbd>{" "}
          for shortcuts.
        </p>
      </div>
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
