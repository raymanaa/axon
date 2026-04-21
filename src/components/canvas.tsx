"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { motion } from "framer-motion";
import { useMemo } from "react";

type TriggerData = { label: string; subtitle: string };

function TriggerNode({ data, selected }: NodeProps<Node<TriggerData>>) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[
        "relative w-[220px] rounded-xl border bg-[--muted]/90 backdrop-blur-sm",
        "px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
        selected
          ? "border-[--accent] ring-2 ring-[--accent-glow]"
          : "border-[--border]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-[--accent] shadow-[0_0_12px_var(--accent-glow)]"
        />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[--accent] font-mono">
          trigger
        </span>
      </div>
      <div className="mt-2 text-sm font-medium text-[--foreground]">
        {data.label}
      </div>
      <div className="mt-0.5 text-xs text-[--foreground]/60">
        {data.subtitle}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-[--background] !bg-[--accent]"
      />
    </motion.div>
  );
}

export function Canvas() {
  const nodeTypes = useMemo(() => ({ trigger: TriggerNode }), []);

  const initialNodes: Node<TriggerData>[] = useMemo(
    () => [
      {
        id: "1",
        type: "trigger",
        position: { x: 120, y: 160 },
        data: { label: "Start", subtitle: "Manual run" },
      },
    ],
    [],
  );

  return (
    <ReactFlow
      nodes={initialNodes}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.35 }}
      proOptions={{ hideAttribution: false }}
      defaultEdgeOptions={{ animated: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="color-mix(in oklab, var(--foreground) 18%, transparent)"
      />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={() => "var(--accent)"}
        maskColor="rgba(10,10,11,0.7)"
      />
    </ReactFlow>
  );
}
