"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { NODE_META, type NodeKind } from "@/lib/node-types";

type Props = {
  kind: NodeKind;
  selected: boolean | undefined;
  children: ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  extraHandles?: ReactNode;
};

export function NodeShell({
  kind,
  selected,
  children,
  hasInput = true,
  hasOutput = true,
  extraHandles,
}: Props) {
  const meta = NODE_META[kind];

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0.2, 1] }}
      className={[
        "relative w-[220px] rounded-[10px] bg-card",
        "transition-shadow",
        selected
          ? "shadow-[0_0_0_1.5px_var(--accent),0_2px_6px_rgba(24,23,21,0.06)]"
          : "shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(24,23,21,0.03)] hover:shadow-[0_0_0_1px_var(--line-2),0_2px_6px_rgba(24,23,21,0.05)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        <span
          aria-hidden
          className="block h-[9px] w-[9px] rounded-sm shrink-0"
          style={{ background: meta.accent }}
        />
        <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-2">
          {meta.title}
        </span>
      </div>

      <div className="px-3.5 pb-3 text-ink">{children}</div>

      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!-ml-[1px]"
        />
      )}
      {hasOutput && !extraHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="!-mr-[1px]"
        />
      )}
      {extraHandles}
    </motion.div>
  );
}
