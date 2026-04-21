"use client";

import { NODE_META, type NodeKind } from "@/lib/node-types";

const ORDER: NodeKind[] = ["trigger", "llm", "tool", "route", "reply"];

export const PALETTE_MIME = "application/x-axon-node-kind";

export function Palette() {
  return (
    <aside className="flex h-full w-[244px] shrink-0 flex-col border-r border-line bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
          Nodes
        </div>
        <div className="text-[10.5px] font-mono text-ink-3">05</div>
      </div>

      <div className="flex flex-col py-2">
        {ORDER.map((kind) => {
          const meta = NODE_META[kind];
          return (
            <div
              key={kind}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(PALETTE_MIME, kind);
                event.dataTransfer.setData("text/plain", kind);
                event.dataTransfer.effectAllowed = "move";
              }}
              className="group relative mx-2 my-0.5 flex cursor-grab items-start gap-3 rounded-md px-3 py-2.5 active:cursor-grabbing hover:bg-paper-2 transition-colors"
            >
              <span
                aria-hidden
                className="mt-[5px] block h-[9px] w-[9px] rounded-sm shrink-0"
                style={{ background: meta.accent }}
              />
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-ink">
                  {meta.title}
                </div>
                <div className="text-[11.5px] text-ink-2 truncate">
                  {meta.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-line px-5 py-3">
        <p className="text-[11px] text-ink-3 leading-relaxed">
          Drag any node onto the canvas, then click to configure it on the
          right.
        </p>
      </div>
    </aside>
  );
}
