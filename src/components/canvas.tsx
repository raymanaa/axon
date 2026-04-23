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
import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import { ConfigPanel } from "@/components/config-panel";
import { nodeTypes } from "@/components/nodes";
import { Onboarding, type OnboardingObs } from "@/components/onboarding";
import { Palette, PALETTE_MIME } from "@/components/palette";
import { HelpPopover, TopBar } from "@/components/top-bar";
import {
  NODE_META,
  type AxonNode,
  type AxonNodeData,
  type LLMData,
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
        "decision: {{decision}}\nevidence: {{evidence}}\npipeline_version: v{{version}}\nscored_at: {{ts}}",
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2" },
  { id: "e2-3", source: "n2", target: "n3" },
  { id: "e3-4", source: "n3", target: "n4" },
  { id: "e4-5", source: "n4", target: "n5", sourceHandle: "advance" },
];

const INITIAL_IDS = new Set(INITIAL_NODES.map((n) => n.id));

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
        data: {
          ...(NODE_META[kind] as unknown as object),
          // re-seed with default data for kind
          ...defaultDataFor(kind),
        } as unknown as AxonNodeData,
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

  // Onboarding observations
  const obs = useMemo<OnboardingObs>(() => {
    const scoreNode = nodes.find((n) => n.id === "n3");
    const scorePrompt = (scoreNode?.data as LLMData | undefined)?.prompt;
    const userAdded = nodes.filter((n) => !INITIAL_IDS.has(n.id));
    const userAddedLLM = userAdded.some((n) => n.type === "llm");
    const userEdgesOnNew = edges.some((e) => {
      const sourceIsUser = !INITIAL_IDS.has(e.source);
      const targetIsUser = !INITIAL_IDS.has(e.target);
      return sourceIsUser || targetIsUser;
    });
    return {
      selectedId,
      scorePromptEdited:
        scorePrompt !== undefined && scorePrompt !== SCORE_LLM_PROMPT,
      userAddedCount: userAdded.length,
      userAddedLLM,
      userEdgesOnNew,
    };
  }, [nodes, edges, selectedId]);

  // '?' key opens help popover (except in inputs)
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
      <TopBar nodeCount={nodes.length} onShowHelp={() => setHelpOpen(true)} />

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
            fitViewOptions={{ padding: 0.3, maxZoom: 1.05 }}
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

      <Onboarding obs={obs} />
    </div>
  );
}

function defaultDataFor(kind: NodeKind): AxonNodeData {
  // Imported lazily to avoid circular; re-exported from lib
  // Deliberately mirrors makeNodeData to avoid needing a second pass.
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

function CanvasHint({ empty }: { empty: boolean }) {
  if (!empty) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-none max-w-[340px] text-center">
        <div className="serif-italic text-[28px] leading-[1.15] text-ink-2">
          Drop a <span className="not-italic">Candidate-in</span> node to begin.
        </div>
        <p className="mt-3 text-[12.5px] text-ink-3 leading-relaxed">
          Pick one from the left panel. Press{" "}
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
