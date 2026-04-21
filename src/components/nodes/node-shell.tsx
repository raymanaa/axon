"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NODE_META, type NodeKind } from "@/lib/node-types";

type Props = {
  kind: NodeKind;
  icon: LucideIcon;
  title: string;
  selected: boolean | undefined;
  children: ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  extraHandles?: ReactNode;
};

export function NodeShell({
  kind,
  icon: Icon,
  title,
  selected,
  children,
  hasInput = true,
  hasOutput = true,
  extraHandles,
}: Props) {
  const accent = NODE_META[kind].accent;

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0, y: 4 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={[
        "relative w-[230px] rounded-xl border backdrop-blur-sm",
        "bg-elevated/92 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
        "transition-colors",
        selected
          ? "border-transparent ring-2"
          : "border-border hover:border-foreground/30",
      ].join(" ")}
      style={
        selected
          ? {
              boxShadow: `0 0 0 2px ${accent}55, 0 10px 30px rgba(0,0,0,0.5)`,
            }
          : undefined
      }
    >
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/60"
        style={{ color: accent }}
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/60">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          <span
            className="absolute inset-0 rounded-md opacity-40 blur-[8px]"
            style={{ background: accent }}
            aria-hidden
          />
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono">
          {title}
        </span>
      </div>

      <div className="px-3.5 py-3 text-foreground">{children}</div>

      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-background"
          style={{ background: accent }}
        />
      )}
      {hasOutput && !extraHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-background"
          style={{ background: accent }}
        />
      )}
      {extraHandles}
    </motion.div>
  );
}
