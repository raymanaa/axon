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
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[
        "relative w-[220px] rounded-xl border backdrop-blur-sm",
        "bg-elevated/90 px-4 py-3",
        "shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
        selected
          ? "border-accent ring-2 ring-accent/40"
          : "border-border hover:border-accent/50",
        "transition-colors",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="relative inline-block h-2 w-2 rounded-full bg-accent"
        >
          <span className="absolute inset-0 rounded-full bg-accent blur-[6px] opacity-70" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-accent font-mono">
          trigger
        </span>
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">
        {data.label}
      </div>
      <div className="mt-0.5 text-xs text-foreground/60">{data.subtitle}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-background !bg-accent"
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
        position: { x: 160, y: 180 },
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
      fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
      defaultEdgeOptions={{ animated: true }}
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
        nodeColor={() => "var(--accent)"}
        nodeStrokeWidth={0}
        maskColor="rgba(10,10,11,0.75)"
      />
    </ReactFlow>
  );
}
