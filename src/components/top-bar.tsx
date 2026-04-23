"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, Play } from "lucide-react";
import { useState } from "react";

type Props = {
  workflowName?: string;
  nodeCount: number;
  onShowHelp: () => void;
};

export function TopBar({
  workflowName = "Senior backend engineer · screening",
  nodeCount,
  onShowHelp,
}: Props) {
  const [runHover, setRunHover] = useState(false);

  return (
    <header className="relative z-20 flex h-12 items-center justify-between border-b border-line bg-paper/95 backdrop-blur px-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="serif-italic text-[20px] leading-none text-ink">
            Axon
          </span>
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-[0.18em]">
            α
          </span>
        </div>

        <span aria-hidden className="h-4 w-px bg-line mx-1" />

        <button
          type="button"
          className="group flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-paper-2 transition-colors min-w-0"
        >
          <span className="text-[13px] text-ink truncate">{workflowName}</span>
          <ChevronDown
            className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink-2 transition-colors"
            strokeWidth={2}
          />
        </button>

        <span className="font-mono text-[10.5px] text-ink-3 ml-1 tabular-nums">
          {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-ink-3">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-3" />
          <span className="font-mono uppercase tracking-[0.14em]">Draft</span>
        </span>

        <button
          type="button"
          onClick={onShowHelp}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-2 hover:bg-paper-2 hover:text-ink transition-colors"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setRunHover(true)}
          onHoverEnd={() => setRunHover(false)}
          disabled
          title="Run comes in M4"
          className="relative flex items-center gap-1.5 rounded-md bg-ink text-paper px-3 py-1.5 text-[12.5px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="h-3 w-3 fill-current" strokeWidth={0} />
          <span>Run</span>
          <span className="hidden sm:inline font-mono text-[10px] text-paper/60 ml-1 tabular-nums">
            ⏎
          </span>
          {runHover && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute -bottom-8 right-0 whitespace-nowrap rounded-md border border-line bg-card px-2 py-1 text-[11px] text-ink-2 shadow-[0_4px_12px_rgba(24,23,21,0.06)]"
            >
              Arrives in M4
            </motion.span>
          )}
        </motion.button>
      </div>
    </header>
  );
}

export function HelpPopover({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-start justify-center bg-ink/8 pt-24"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] rounded-lg border border-line bg-card shadow-[0_12px_40px_rgba(24,23,21,0.12)]"
      >
        <div className="border-b border-line px-5 py-3.5 flex items-center justify-between">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
            Keyboard shortcuts
          </span>
          <button
            onClick={onClose}
            className="font-mono text-[10.5px] text-ink-3 hover:text-ink"
          >
            ESC
          </button>
        </div>
        <ul className="px-5 py-3 text-[13px] text-ink">
          {SHORTCUTS.map(({ keys, label }) => (
            <li
              key={label}
              className="flex items-center justify-between py-1.5"
            >
              <span>{label}</span>
              <span className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line bg-paper px-1.5 font-mono text-[11px] text-ink-2"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Command palette" },
  { keys: ["/"], label: "Focus filter" },
  { keys: ["J"], label: "Next candidate" },
  { keys: ["K"], label: "Previous candidate" },
  { keys: ["A"], label: "Mark selected: advance" },
  { keys: ["H"], label: "Mark selected: hold" },
  { keys: ["R"], label: "Mark selected: reject" },
  { keys: ["Esc"], label: "Close panel / dismiss" },
  { keys: ["?"], label: "Show this help" },
];
