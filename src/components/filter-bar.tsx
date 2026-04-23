"use client";

import { ListFilter, Search } from "lucide-react";
import { forwardRef } from "react";
import type { Candidate } from "@/lib/mock-data";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: Candidate["status"] | "all";
  onStatusFilterChange: (s: Candidate["status"] | "all") => void;
  total: number;
  shown: number;
};

export const FilterBar = forwardRef<HTMLInputElement, Props>(function FilterBar(
  {
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    total,
    shown,
  },
  inputRef,
) {
  const filters: { id: Props["statusFilter"]; label: string }[] = [
    { id: "all", label: "All" },
    { id: "advance", label: "Advance" },
    { id: "hold", label: "Hold" },
    { id: "reject", label: "Reject" },
  ];

  return (
    <div className="flex items-center gap-3 border-b border-line bg-paper px-6 py-2.5">
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[320px]">
        <Search className="h-3.5 w-3.5 text-ink-3" strokeWidth={2} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter candidates…"
          className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
        />
        {!query && (
          <kbd className="inline-flex h-4 items-center rounded border border-line bg-card px-1 font-mono text-[10px] text-ink-3">
            /
          </kbd>
        )}
      </div>

      <div className="h-4 w-px bg-line" aria-hidden />

      <div className="flex items-center gap-0.5">
        <ListFilter className="h-3.5 w-3.5 text-ink-3 mr-1" strokeWidth={2} />
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onStatusFilterChange(f.id)}
            className={[
              "rounded px-2 py-1 text-[11.5px] transition-colors",
              f.id === statusFilter
                ? "bg-paper-2 text-ink"
                : "text-ink-2 hover:text-ink hover:bg-paper-2",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="ml-auto font-mono text-[11px] text-ink-3 tabular-nums">
        {shown === total ? `${total}` : `${shown} / ${total}`}{" "}
        <span>{total === 1 ? "candidate" : "candidates"}</span>
      </div>
    </div>
  );
});
