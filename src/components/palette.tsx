"use client";

import { motion } from "framer-motion";
import { Brain, Globe, Play, Send, Split, type LucideIcon } from "lucide-react";
import { NODE_META, type NodeKind } from "@/lib/node-types";

const ITEMS: Array<{ kind: NodeKind; icon: LucideIcon }> = [
  { kind: "trigger", icon: Play },
  { kind: "llm", icon: Brain },
  { kind: "tool", icon: Globe },
  { kind: "route", icon: Split },
  { kind: "reply", icon: Send },
];

export const PALETTE_MIME = "application/x-axon-node-kind";

export function Palette() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span aria-hidden className="relative inline-block h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full bg-accent" />
          <span className="absolute inset-0 rounded-full bg-accent blur-[8px] opacity-80" />
        </span>
        <span className="font-mono text-sm tracking-[0.22em] text-foreground/90">
          AXON
        </span>
      </div>
      <div className="px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/40">
        Nodes · drag onto canvas
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-1">
        {ITEMS.map(({ kind, icon: Icon }) => {
          const meta = NODE_META[kind];
          return (
            <motion.div
              key={kind}
              draggable
              onDragStart={(event) => {
                const dt = (event as unknown as DragEvent).dataTransfer;
                if (!dt) return;
                dt.setData(PALETTE_MIME, kind);
                dt.setData("text/plain", kind);
                dt.effectAllowed = "move";
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group flex cursor-grab items-center gap-3 rounded-lg border border-border/80 bg-elevated/80 px-3 py-2.5 active:cursor-grabbing transition-colors hover:border-foreground/30"
            >
              <span
                className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/70"
                style={{ color: meta.accent }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                <span
                  className="absolute inset-0 rounded-md opacity-30 blur-[8px] group-hover:opacity-55 transition-opacity"
                  style={{ background: meta.accent }}
                  aria-hidden
                />
              </span>
              <div className="min-w-0">
                <div
                  className="text-[10px] uppercase tracking-[0.18em] font-mono"
                  style={{ color: meta.accent }}
                >
                  {meta.title}
                </div>
                <div className="text-[11px] text-foreground/60 truncate">
                  {meta.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto px-4 py-3 text-[10px] font-mono text-foreground/35 tracking-[0.14em] uppercase">
        M2 · node types
      </div>
    </aside>
  );
}
