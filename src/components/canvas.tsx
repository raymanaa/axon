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
import { useCallback, useMemo, useState, type DragEvent } from "react";
import { ConfigPanel } from "@/components/config-panel";
import { nodeTypes } from "@/components/nodes";
import { Palette, PALETTE_MIME } from "@/components/palette";
import {
  NODE_META,
  type AxonNode,
  type AxonNodeData,
  type NodeKind,
} from "@/lib/node-types";

const SCORE_LLM_PROMPT =
  "Score this candidate 1–5 on senior backend experience. Evidence must be three verbatim snippets from the résumé. Rubric:\n1  No relevant experience\n3  3–5 yrs, some distributed systems\n5  7+ yrs, clear on-call + architecture ownership\n\nIgnore name, age, school, location, gender, and any demographic signals.";

const INITIAL_NODES: AxonNode[] = [
  {
    id: "n1",
    type: "trigger",
    position: { x: 40, y: 80 },
    data: {
      kind: "trigger",
      label: "New application",
      subtitle: "Webhook from Greenhouse",
    },
  },
  {
    id: "n2",
    type: "tool",
    position: { x: 300, y: 80 },
    data: {
      kind: "tool",
      label: "Parse résumé",
      method: "POST",
      url: "/api/parse/resume",
    },
  },
  {
    id: "n3",
    type: "llm",
    position: { x: 560, y: 80 },
    data: {
      kind: "llm",
      label: "Score: Backend experience",
      model: "gemini-2.5-flash",
      prompt: SCORE_LLM_PROMPT,
    },
  },
  {
    id: "n4",
    type: "route",
    position: { x: 560, y: 310 },
    data: {
      kind: "route",
      label: "Fit gate",
      classifier:
        "Given the score + evidence, advance, hold, or reject this candidate.",
      classes: ["advance", "hold", "reject"],
    },
  },
  {
    id: "n5",
    type: "reply",
    position: { x: 840, y: 310 },
    data: {
      kind: "reply",
      label: "Commit decision",
      template:
        "decision: {{decision}}\nevidence: {{evidence}}\npipeline_version: v{{version}}",
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2" },
  { id: "e2-3", source: "n2", target: "n3" },
  { id: "e3-4", source: "n3", target: "n4" },
  { id: "e4-5", source: "n4", target: "n5", sourceHandle: "advance" },
];

function Surface() {
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
        data: defaultDataFor(kind),
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

  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

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
          fitViewOptions={{ padding: 0.3, maxZoom: 1.05 }}
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
      </main>
      <ConfigPanel node={selected} onUpdate={updateNodeData} />
    </div>
  );
}

function defaultDataFor(kind: NodeKind): AxonNodeData {
  switch (kind) {
    case "trigger":
      return {
        kind,
        label: "New application",
        subtitle: "Webhook from ATS",
      };
    case "llm":
      return {
        kind,
        label: "Score: Communication skills",
        model: "gemini-2.5-flash",
        prompt:
          "Score this candidate 1–5 on written communication. Cite two snippets from the résumé. Ignore name, age, school, location, and any demographic signals.",
      };
    case "tool":
      return {
        kind,
        label: "Enrich from LinkedIn",
        method: "GET",
        url: "https://api.example.com/enrich/linkedin",
      };
    case "route":
      return {
        kind,
        label: "Fit gate",
        classifier: "Advance, hold, or reject?",
        classes: ["advance", "hold", "reject"],
      };
    case "reply":
      return {
        kind,
        label: "Commit decision",
        template: "decision: {{decision}}\nevidence: {{evidence}}",
      };
  }
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <Surface />
    </ReactFlowProvider>
  );
}
