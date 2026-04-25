"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  RefreshCcw,
  ScrollText,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import {
  formatRelative,
  type AuditEntry,
  type DecisionEntry,
  type FitGateEntry,
  type RescoreEntry,
} from "@/lib/audit-log";
import {
  CANDIDATES,
  CRITERIA,
  ROLES,
  type RoleId,
} from "@/lib/mock-data";

type Props = {
  roleId: RoleId;
  entries: AuditEntry[];
};

type KindFilter = "all" | "decision" | "rescore" | "fitgate";

export function AuditLogView({ roleId, entries }: Props) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const role = ROLES.find((r) => r.id === roleId);
  const candidates = CANDIDATES[roleId] ?? [];
  const criteria = CRITERIA[roleId] ?? [];

  const candidateById = useMemo(() => {
    const m = new Map<string, (typeof candidates)[number]>();
    for (const c of candidates) m.set(c.id, c);
    return m;
  }, [candidates]);

  const criterionById = useMemo(() => {
    const m = new Map<string, (typeof criteria)[number]>();
    for (const c of criteria) m.set(c.id, c);
    return m;
  }, [criteria]);

  const filtered = useMemo(() => {
    const roleEntries = entries.filter((e) => e.roleId === roleId);
    const q = query.trim().toLowerCase();
    return roleEntries.filter((e) => {
      if (kind !== "all" && e.kind !== kind) return false;
      if (!q) return true;
      const candidate = candidateById.get(e.candidateId);
      const haystack = [
        candidate?.name ?? e.candidateId,
        e.kind,
        e.reviewer,
        "pipelineVersion" in e ? e.pipelineVersion : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, roleId, kind, query, candidateById]);

  function toggle(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  function downloadJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      roleId,
      roleName: role?.name ?? roleId,
      pipelineVersion: "v12",
      pipelineHash: "3a7f9c2",
      entries: filtered,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axon-audit-${roleId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const counts = useMemo(() => {
    const roleEntries = entries.filter((e) => e.roleId === roleId);
    return {
      all: roleEntries.length,
      decision: roleEntries.filter((e) => e.kind === "decision").length,
      rescore: roleEntries.filter((e) => e.kind === "rescore").length,
      fitgate: roleEntries.filter((e) => e.kind === "fitgate").length,
    };
  }, [entries, roleId]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b border-line px-8 py-5">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
                <ScrollText className="h-3 w-3" strokeWidth={1.75} />
                <span>Audit log</span>
              </div>
              <h2 className="serif mt-2 text-[22px] leading-[1.2] tracking-[-0.015em] text-ink">
                Every decision, every rescore,{" "}
                <span className="serif-italic">signed.</span>
              </h2>
              <p className="mt-2 max-w-[640px] text-[12.5px] leading-[1.65] text-ink-2">
                Append-only log for this role. Each row captures the pipeline
                version, reviewer, and transition. Export the filtered slice as
                JSON for your next bias audit.
              </p>
            </div>
            <button
              onClick={downloadJson}
              disabled={filtered.length === 0}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Export JSON</span>
              <span className="font-mono text-[10px] text-paper/70 tabular-nums">
                {filtered.length}
              </span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-md border border-line bg-card p-0.5">
              <FilterChip
                active={kind === "all"}
                onClick={() => setKind("all")}
                count={counts.all}
              >
                All
              </FilterChip>
              <FilterChip
                active={kind === "fitgate"}
                onClick={() => setKind("fitgate")}
                count={counts.fitgate}
              >
                <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Fit gate
              </FilterChip>
              <FilterChip
                active={kind === "rescore"}
                onClick={() => setKind("rescore")}
                count={counts.rescore}
              >
                <RefreshCcw className="h-3 w-3" strokeWidth={2} /> Rescore
              </FilterChip>
              <FilterChip
                active={kind === "decision"}
                onClick={() => setKind("decision")}
                count={counts.decision}
              >
                <UserCog className="h-3 w-3" strokeWidth={2} /> Override
              </FilterChip>
            </div>

            <div className="relative ml-auto max-w-[320px] flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-3"
                strokeWidth={2}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidate or reviewer…"
                className="w-full rounded-md border border-line bg-card pl-8 pr-3 py-1.5 text-[13px] text-ink placeholder:text-ink-3 outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>

            {filtered.length !== counts.all && (
              <span className="flex items-center gap-1.5 text-[11px] text-ink-3 font-mono">
                <Filter className="h-3 w-3" strokeWidth={2} />
                {filtered.length} of {counts.all}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-[1100px]">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-2">
              {filtered.map((e) => {
                const isOpen = !!expanded[e.id];
                const candidate = candidateById.get(e.candidateId);
                return (
                  <motion.li
                    key={e.id}
                    layout
                    className="rounded-lg border border-line bg-card"
                  >
                    <button
                      onClick={() => toggle(e.id)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-paper-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <EntryIcon entry={e} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[13px] text-ink min-w-0">
                            <span className="font-medium truncate max-w-[200px]">
                              {candidate?.name ?? e.candidateId}
                            </span>
                            <span aria-hidden className="text-ink-3">
                              ·
                            </span>
                            <EntrySummary
                              entry={e}
                              criterionName={
                                e.kind === "rescore"
                                  ? criterionById.get(e.criterionId)?.name ??
                                    e.criterionId
                                  : undefined
                              }
                            />
                          </div>
                          <div className="mt-1 font-mono text-[10.5px] text-ink-3">
                            {formatRelative(e.ts)} · by {e.reviewer} · pipeline{" "}
                            {e.pipelineVersion} · {e.pipelineHash}
                          </div>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-ink-3 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-ink-3 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-line px-4 py-3"
                      >
                        <EntryDetail entry={e} criterionName={
                          e.kind === "rescore"
                            ? criterionById.get(e.criterionId)?.name
                            : undefined
                        } candidateHeadline={candidate?.headline} />
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] transition-colors",
        active
          ? "bg-ink text-paper"
          : "text-ink-2 hover:bg-paper-2 hover:text-ink",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "font-mono text-[10.5px] tabular-nums",
          active ? "text-paper/70" : "text-ink-3",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function EntryIcon({ entry }: { entry: AuditEntry }) {
  const base =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border";
  if (entry.kind === "fitgate") {
    return (
      <span className={`${base} border-line bg-paper-2 text-ink-2`}>
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
    );
  }
  if (entry.kind === "rescore") {
    return (
      <span className={`${base} border-line bg-paper-2 text-ink-2`}>
        <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
    );
  }
  return (
    <span className={`${base} border-line bg-paper-2 text-ink-2`}>
      <UserCog className="h-3.5 w-3.5" strokeWidth={1.75} />
    </span>
  );
}

function EntrySummary({
  entry,
  criterionName,
}: {
  entry: AuditEntry;
  criterionName?: string;
}) {
  if (entry.kind === "fitgate") {
    return (
      <span className="flex items-center gap-1.5 text-ink-2 text-[12.5px]">
        Fit gate
        <span aria-hidden className="text-ink-3">→</span>
        <StatusPill status={entry.decision} size="sm" />
      </span>
    );
  }
  if (entry.kind === "rescore") {
    return (
      <span className="flex items-center gap-1.5 text-ink-2 text-[12.5px]">
        <span className="truncate max-w-[180px]">
          {criterionName ?? "criterion"}
        </span>
        <span className="font-mono tabular-nums text-ink-3">
          {entry.previousScore.toFixed(1)}
        </span>
        <span aria-hidden className="text-ink-3">→</span>
        <span className="font-mono tabular-nums text-ink">
          {entry.newScore.toFixed(1)}
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[12.5px]">
      <StatusPill status={entry.from} size="sm" />
      <span aria-hidden className="text-ink-3">→</span>
      <StatusPill status={entry.to} size="sm" />
    </span>
  );
}

function EntryDetail({
  entry,
  criterionName,
  candidateHeadline,
}: {
  entry: AuditEntry;
  criterionName?: string;
  candidateHeadline?: string;
}) {
  return (
    <div className="space-y-3">
      {candidateHeadline && (
        <div className="text-[12px] text-ink-3">{candidateHeadline}</div>
      )}
      {entry.kind === "fitgate" && <FitGateDetail entry={entry} />}
      {entry.kind === "rescore" && (
        <RescoreDetail entry={entry} criterionName={criterionName} />
      )}
      {entry.kind === "decision" && <DecisionDetail entry={entry} />}
      <KeyValueTable
        rows={[
          ["entry id", entry.id],
          ["candidate id", entry.candidateId],
          ["pipeline version", `${entry.pipelineVersion} · ${entry.pipelineHash}`],
          ["reviewer", entry.reviewer],
          ["timestamp", new Date(entry.ts).toISOString()],
        ]}
      />
    </div>
  );
}

function FitGateDetail({ entry }: { entry: FitGateEntry }) {
  return (
    <div className="rounded-md border border-line bg-paper px-3 py-2.5">
      <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 mb-1">
        Pipeline reasoning
      </div>
      <p className="text-[13px] leading-[1.65] text-ink">{entry.reasoning}</p>
      <div className="mt-2 font-mono text-[10.5px] text-ink-3">
        model: {entry.model}
      </div>
    </div>
  );
}

function RescoreDetail({
  entry,
  criterionName,
}: {
  entry: RescoreEntry;
  criterionName?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-paper px-3 py-2.5">
      <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 mb-1">
        Rescore
      </div>
      <p className="text-[13px] text-ink-2">
        <span className="text-ink font-medium">
          {criterionName ?? entry.criterionId}
        </span>{" "}
        was re-scored using <span className="font-mono">{entry.model}</span>.
        Previous <span className="font-mono">{entry.previousScore.toFixed(1)}</span>,
        new <span className="font-mono">{entry.newScore.toFixed(1)}</span>.
      </p>
    </div>
  );
}

function DecisionDetail({ entry }: { entry: DecisionEntry }) {
  return (
    <div className="rounded-md border border-line bg-paper px-3 py-2.5">
      <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 mb-1">
        Reviewer override
      </div>
      <p className="text-[13px] text-ink-2 flex items-center gap-2 flex-wrap">
        <span>
          {entry.reviewer} changed the decision from
        </span>
        <StatusPill status={entry.from} size="sm" />
        <span>to</span>
        <StatusPill status={entry.to} size="sm" />
      </p>
    </div>
  );
}

function KeyValueTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-md border border-line bg-paper overflow-hidden">
      <dl>
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={[
              "grid grid-cols-[160px_1fr] px-3 py-2 text-[11.5px] font-mono",
              i !== rows.length - 1 ? "border-b border-line" : "",
            ].join(" ")}
          >
            <dt className="text-ink-3 uppercase tracking-[0.12em]">{k}</dt>
            <dd className="text-ink-2 break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-[420px] text-center pt-16">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line text-ink-3">
        <ScrollText className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <h3 className="serif text-[20px] leading-[1.2] text-ink">
        No entries yet.
      </h3>
      <p className="mt-2 text-[12.5px] leading-[1.65] text-ink-2">
        Every re-score, fit-gate decision, and reviewer override appears here
        in append-only order. Open a candidate and click{" "}
        <span className="font-mono">Re-score with Gemini</span> to populate.
      </p>
    </div>
  );
}
