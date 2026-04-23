"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Quote,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FilterBar } from "@/components/filter-bar";
import { ScoreBar, ScoreNumber } from "@/components/score-bar";
import { StatusPill } from "@/components/status-pill";
import {
  CANDIDATES,
  CRITERIA,
  type Candidate,
  type Criterion,
  type RoleId,
} from "@/lib/mock-data";

type Props = {
  roleId: RoleId;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDecision: (id: string, decision: Candidate["status"]) => void;
  candidates: Candidate[];
};

export type CandidatesViewHandle = {
  focusFilter: () => void;
  navigate: (dir: "next" | "prev") => void;
  openSelected: () => void;
  decideSelected: (d: Candidate["status"]) => void;
};

export const CandidatesView = forwardRef<CandidatesViewHandle, Props>(
  function CandidatesView(
    { roleId, selectedId, onSelect, onDecision, candidates },
    ref,
  ) {
    const criteria = CRITERIA[roleId] ?? [];
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      Candidate["status"] | "all"
    >("all");
    const filterInputRef = useRef<HTMLInputElement>(null);

    // Filter + sort
    const filteredList = useMemo(() => {
      const q = query.toLowerCase().trim();
      return candidates.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.headline.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
        );
      });
    }, [candidates, query, statusFilter]);

    // Group by status
    const groups = useMemo(() => {
      const order: Candidate["status"][] = ["advance", "hold", "reject", "scoring"];
      const by = new Map<Candidate["status"], Candidate[]>();
      for (const c of filteredList) {
        const arr = by.get(c.status) ?? [];
        arr.push(c);
        by.set(c.status, arr);
      }
      return order
        .filter((s) => by.has(s))
        .map((s) => ({ status: s, items: by.get(s)! }));
    }, [filteredList]);

    // Flat list in display order — needed for keyboard J/K navigation
    const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

    // Expose imperative controls to Shell
    useImperativeHandle(
      ref,
      () => ({
        focusFilter: () => filterInputRef.current?.focus(),
        navigate: (dir) => {
          if (flat.length === 0) return;
          const curIdx = flat.findIndex((c) => c.id === selectedId);
          let next: number;
          if (curIdx === -1) {
            next = dir === "next" ? 0 : flat.length - 1;
          } else {
            next = dir === "next" ? curIdx + 1 : curIdx - 1;
            next = Math.max(0, Math.min(flat.length - 1, next));
          }
          onSelect(flat[next].id);
        },
        openSelected: () => {
          // Panel opens automatically when selected; noop
        },
        decideSelected: (d) => {
          if (selectedId) onDecision(selectedId, d);
        },
      }),
      [flat, selectedId, onSelect, onDecision],
    );

    const selected = useMemo(
      () => candidates.find((c) => c.id === selectedId) ?? null,
      [candidates, selectedId],
    );

    return (
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1 flex-col min-w-0">
          <FilterBar
            ref={filterInputRef}
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            total={candidates.length}
            shown={filteredList.length}
          />

          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              groups.map((g) => (
                <Group
                  key={g.status}
                  status={g.status}
                  items={g.items}
                  criteria={criteria}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDecision={onDecision}
                />
              ))
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <DetailPanel
              key={selected.id}
              candidate={selected}
              criteria={criteria}
              onClose={() => onSelect(null)}
              onDecision={onDecision}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

/* ---------- Group (status section) ---------- */

const GROUP_LABELS: Record<Candidate["status"], string> = {
  advance: "Advance",
  hold: "Hold",
  reject: "Reject",
  scoring: "Still scoring",
};
const GROUP_DOTS: Record<Candidate["status"], string> = {
  advance: "#3d8b5a",
  hold: "#b45309",
  reject: "#8a3a20",
  scoring: "#9b968d",
};

function Group({
  status,
  items,
  criteria,
  selectedId,
  onSelect,
  onDecision,
}: {
  status: Candidate["status"];
  items: Candidate[];
  criteria: Criterion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDecision: (id: string, d: Candidate["status"]) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="sticky top-0 z-[5] flex w-full items-center gap-2 bg-paper px-6 py-2 text-left transition-colors hover:bg-paper-2"
      >
        <ChevronRight
          className={[
            "h-3 w-3 text-ink-3 transition-transform",
            open ? "rotate-90" : "rotate-0",
          ].join(" ")}
          strokeWidth={2.25}
        />
        <span
          aria-hidden
          className="inline-block h-[7px] w-[7px] rounded-full"
          style={{ background: GROUP_DOTS[status] }}
        />
        <span className="text-[11.5px] font-semibold text-ink uppercase tracking-[0.08em]">
          {GROUP_LABELS[status]}
        </span>
        <span className="font-mono text-[10.5px] text-ink-3 tabular-nums">
          {items.length}
        </span>
      </button>
      {open && (
        <ul>
          {items.map((c) => (
            <CandidateRow
              key={c.id}
              candidate={c}
              criteria={criteria}
              selected={c.id === selectedId}
              onSelect={() => onSelect(c.id)}
              onDecision={onDecision}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Row (dense 36px) ---------- */

function CandidateRow({
  candidate,
  criteria,
  selected,
  onSelect,
  onDecision,
}: {
  candidate: Candidate;
  criteria: Criterion[];
  selected: boolean;
  onSelect: () => void;
  onDecision: (id: string, d: Candidate["status"]) => void;
}) {
  return (
    <li
      onClick={onSelect}
      data-onboarding-target={
        candidate.id === "cand-maya" ? "candidate-row-first" : undefined
      }
      className={[
        "group flex cursor-pointer items-center gap-3 border-b border-line/70 pl-6 pr-4 py-[7px] transition-colors",
        selected ? "bg-[color:var(--accent-soft)]/50" : "hover:bg-paper-2",
      ].join(" ")}
    >
      <Avatar name={candidate.name} />

      <div className="flex min-w-0 items-baseline gap-2 flex-1">
        <span className="text-[13px] font-medium text-ink truncate">
          {candidate.name}
        </span>
        <span className="text-[11.5px] text-ink-3 truncate hidden md:inline">
          {candidate.headline}
        </span>
      </div>

      <Scores candidate={candidate} criteria={criteria} />

      <span className="hidden md:inline font-mono text-[10.5px] text-ink-3 tabular-nums w-12 text-right">
        {candidate.submittedAt}
      </span>

      {/* Hover quick-actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <QuickAction
          kind="advance"
          active={candidate.status === "advance"}
          onClick={(e) => {
            e.stopPropagation();
            onDecision(candidate.id, "advance");
          }}
        />
        <QuickAction
          kind="hold"
          active={candidate.status === "hold"}
          onClick={(e) => {
            e.stopPropagation();
            onDecision(candidate.id, "hold");
          }}
        />
        <QuickAction
          kind="reject"
          active={candidate.status === "reject"}
          onClick={(e) => {
            e.stopPropagation();
            onDecision(candidate.id, "reject");
          }}
        />
      </div>
    </li>
  );
}

function Scores({
  candidate,
  criteria,
}: {
  candidate: Candidate;
  criteria: Criterion[];
}) {
  return (
    <div className="flex items-center gap-0 font-mono text-[11.5px] text-ink tabular-nums">
      {criteria.map((c, i) => {
        const cell = candidate.scores[c.id];
        return (
          <span key={c.id} className="flex items-center">
            {i > 0 && (
              <span
                aria-hidden
                className="mx-1.5 inline-block h-3 w-px bg-line"
              />
            )}
            <span
              title={c.name}
              className={cell && cell.score >= 4 ? "text-ink" : "text-ink-2"}
            >
              {cell ? cell.score.toFixed(1) : "—"}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function QuickAction({
  kind,
  active,
  onClick,
}: {
  kind: Candidate["status"];
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const cfg: Record<string, { Icon: typeof Check; label: string; key: string }> = {
    advance: { Icon: Check, label: "Advance", key: "A" },
    hold: { Icon: ArrowRight, label: "Hold", key: "H" },
    reject: { Icon: X, label: "Reject", key: "R" },
  };
  const { Icon, label, key } = cfg[kind];
  return (
    <button
      onClick={onClick}
      title={`${label} (${key})`}
      className={[
        "relative flex h-6 w-6 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-ink text-paper"
          : "text-ink-3 hover:bg-card hover:text-ink hover:shadow-[0_0_0_1px_var(--line)]",
      ].join(" ")}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} />
    </button>
  );
}

/* ---------- Avatar ---------- */

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  // Stable color from name hash
  const hue = hash(name) % 360;
  const bg = `oklch(0.92 0.04 ${hue})`;
  const fg = `oklch(0.42 0.06 ${hue})`;
  return (
    <span
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums"
      style={{ background: bg, color: fg }}
    >
      {initials}
    </span>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ---------- Empty ---------- */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="text-center max-w-[280px]">
        <div className="serif text-[18px] leading-snug text-ink">
          {query ? "No candidates match." : "No candidates yet."}
        </div>
        <p className="mt-2 text-[12.5px] text-ink-3 leading-relaxed">
          {query
            ? "Try a different search or clear the filter."
            : "When applications come in through your ATS webhook, they'll show up here."}
        </p>
      </div>
    </div>
  );
}

/* ---------- Detail panel (kept, lightly tightened) ---------- */

function DetailPanel({
  candidate,
  criteria,
  onClose,
  onDecision,
}: {
  candidate: Candidate;
  criteria: Criterion[];
  onClose: () => void;
  onDecision: (id: string, d: Candidate["status"]) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.aside
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 16, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
      data-onboarding-target="candidate-panel"
      className="flex h-full w-[440px] shrink-0 flex-col border-l border-line bg-paper"
    >
      <header className="flex items-start justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={candidate.name} />
          <div className="min-w-0 pt-[1px]">
            <div className="text-[14px] font-semibold text-ink">
              {candidate.name}
            </div>
            <div className="text-[11.5px] text-ink-2 truncate">
              {candidate.headline}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10.5px] text-ink-3">
              <span>{candidate.location}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{candidate.submittedAt}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
          aria-label="Close (Esc)"
          title="Close (Esc)"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-5 py-3.5 border-b border-line">
          <div className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Résumé summary
          </div>
          <p className="text-[12.5px] leading-[1.6] text-ink-2">
            {candidate.resumeSummary}
          </p>
        </section>

        <section className="px-5 py-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-3">
              Scores with evidence
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
              <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
              <span>audit trail</span>
            </span>
          </div>

          <div className="space-y-3">
            {criteria.map((crit) => {
              const cell = candidate.scores[crit.id];
              if (!cell) return null;
              return (
                <div
                  key={crit.id}
                  className="rounded-lg border border-line bg-card"
                >
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-line">
                    <div>
                      <div className="text-[12.5px] font-medium text-ink">
                        {crit.name}
                      </div>
                      <div className="text-[10px] text-ink-3 capitalize">
                        {crit.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12.5px]">
                        <ScoreNumber score={cell.score} />
                      </div>
                      <div className="mt-1 w-[88px]">
                        <ScoreBar score={cell.score} />
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5">
                    <ul className="space-y-1.5">
                      {cell.evidence.map((ev, i) => (
                        <li
                          key={i}
                          className="flex gap-1.5 text-[12px] leading-[1.55] text-ink-2"
                        >
                          <Quote
                            className="h-2.5 w-2.5 shrink-0 mt-1 text-ink-3"
                            strokeWidth={2}
                          />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-5 py-3.5 border-t border-line">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Decision
          </div>
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status={candidate.status} />
            <span className="text-[10.5px] text-ink-3">
              pipeline recommendation
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <PanelDecide
              kind="advance"
              active={candidate.status === "advance"}
              onClick={() => onDecision(candidate.id, "advance")}
              shortcut="A"
            />
            <PanelDecide
              kind="hold"
              active={candidate.status === "hold"}
              onClick={() => onDecision(candidate.id, "hold")}
              shortcut="H"
            />
            <PanelDecide
              kind="reject"
              active={candidate.status === "reject"}
              onClick={() => onDecision(candidate.id, "reject")}
              shortcut="R"
            />
          </div>
          <p className="mt-3 text-[10.5px] leading-[1.55] text-ink-3">
            Your override is recorded alongside the pipeline's recommendation.
          </p>
        </section>
      </div>
    </motion.aside>
  );
}

function PanelDecide({
  kind,
  active,
  onClick,
  shortcut,
}: {
  kind: Candidate["status"];
  active: boolean;
  onClick: () => void;
  shortcut: string;
}) {
  const cfg: Record<string, { label: string; color: string; Icon: typeof Check }> =
    {
      advance: { label: "Advance", color: "#3d8b5a", Icon: Check },
      hold: { label: "Hold", color: "#b45309", Icon: ArrowRight },
      reject: { label: "Reject", color: "#8a3a20", Icon: X },
    };
  const { label, color, Icon } = cfg[kind];
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors border",
        active
          ? "bg-ink text-paper border-ink"
          : "bg-card text-ink border-line hover:border-ink-3",
      ].join(" ")}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} style={active ? undefined : { color }} />
      <span>{label}</span>
      <kbd
        className={[
          "ml-1 inline-flex h-4 items-center rounded border px-1 font-mono text-[10px]",
          active
            ? "border-paper/25 bg-transparent text-paper/60"
            : "border-line bg-paper text-ink-3",
        ].join(" ")}
      >
        {shortcut}
      </kbd>
    </button>
  );
}
