"use client";

import type { Candidate } from "@/lib/mock-data";

const STYLES: Record<
  Candidate["status"],
  { dot: string; label: string; text: string }
> = {
  advance: {
    dot: "#3d8b5a",
    label: "Advance",
    text: "text-ink",
  },
  hold: {
    dot: "#b45309",
    label: "Hold",
    text: "text-ink",
  },
  reject: {
    dot: "#8a3a20",
    label: "Reject",
    text: "text-ink-2",
  },
  scoring: {
    dot: "#9b968d",
    label: "Scoring…",
    text: "text-ink-3",
  },
};

export function StatusPill({
  status,
  size = "md",
}: {
  status: Candidate["status"];
  size?: "sm" | "md";
}) {
  const s = STYLES[status];
  const sizeCls =
    size === "sm" ? "text-[10.5px] gap-1.5" : "text-[11.5px] gap-2";
  return (
    <span className={`inline-flex items-center ${sizeCls} ${s.text}`}>
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: s.dot }}
      />
      <span className="font-medium">{s.label}</span>
    </span>
  );
}
