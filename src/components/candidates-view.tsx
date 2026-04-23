"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, FileSignature, Quote, ShieldCheck, X } from "lucide-react";
import { useMemo } from "react";
import { ScoreBar, ScoreNumber } from "@/components/score-bar";
import { StatusPill } from "@/components/status-pill";
import {
  auditEntriesForCandidate,
  formatRelative,
  type AuditEntry,
} from "@/lib/audit-log";
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
  auditEntries: AuditEntry[];
};

export function CandidatesView({
  roleId,
  selectedId,
  onSelect,
  onDecision,
  auditEntries,
}: Props) {
  const baseCandidates = CANDIDATES[roleId] ?? [];
  const criteria = CRITERIA[roleId] ?? [];

  // Apply persisted decisions to the displayed roster
  const decisionForId = useMemo(() => {
    const m = new Map<string, Candidate["status"]>();
    for (const e of auditEntries) {
      if (!m.has(e.candidateId)) m.set(e.candidateId, e.to);
    }
    return m;
  }, [auditEntries]);

  const candidates = useMemo(
    () =>
      baseCandidates.map((c) =>
        decisionForId.has(c.id) ? { ...c, status: decisionForId.get(c.id)! } : c,
      ),
    [baseCandidates, decisionForId],
  );

  const selected = useMemo(
    () => candidates.find((c) => c.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const selectedEntries = useMemo(
    () =>
      selected ? auditEntriesForCandidate(auditEntries, selected.id) : [],
    [auditEntries, selected],
  );

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-1 flex-col min-w-0">
        <Table
          criteria={criteria}
          candidates={candidates}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
      <AnimatePresence mode="wait">
        {selected && (
          <DetailPanel
            key={selected.id}
            candidate={selected}
            criteria={criteria}
            entries={selectedEntries}
            onClose={() => onSelect(null)}
            onDecision={onDecision}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Table ---------- */

function Table({
  criteria,
  candidates,
  selectedId,
  onSelect,
}: {
  criteria: Criterion[];
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="sticky top-0 z-10 bg-paper">
          <tr className="text-left">
            <th className="sticky left-0 bg-paper px-6 py-3 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 border-b border-line">
              Candidate
            </th>
            {criteria.map((c) => (
              <th
                key={c.id}
                className="px-4 py-3 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 border-b border-line"
              >
                {c.name}
              </th>
            ))}
            <th className="px-4 py-3 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3 border-b border-line">
              Status
            </th>
            <th className="px-4 py-3 border-b border-line" />
          </tr>
        </thead>
        <tbody>
          {candidates.map((cand, i) => {
            const isSelected = cand.id === selectedId;
            return (
              <tr
                key={cand.id}
                onClick={() => onSelect(cand.id)}
                data-onboarding-target={i === 0 ? "candidate-row-first" : undefined}
                className={[
                  "cursor-pointer transition-colors",
                  isSelected
                    ? "bg-[color:var(--accent-soft)]/60"
                    : "hover:bg-paper-2",
                ].join(" ")}
              >
                <td className="sticky left-0 bg-inherit px-6 py-3.5 border-b border-line">
                  <div className="flex items-center gap-3">
                    <Avatar name={cand.name} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-ink">
                        {cand.name}
                      </div>
                      <div className="text-[11.5px] text-ink-3 truncate max-w-[260px]">
                        {cand.headline}
                      </div>
                    </div>
                  </div>
                </td>
                {criteria.map((crit) => {
                  const cell = cand.scores[crit.id];
                  return (
                    <td
                      key={crit.id}
                      className="px-4 py-3.5 border-b border-line"
                    >
                      {cell ? (
                        <div className="min-w-[80px]">
                          <div className="font-mono text-[12px] tabular-nums text-ink">
                            {cell.score.toFixed(1)}
                            <span className="text-ink-3">/5</span>
                          </div>
                          <div className="mt-1">
                            <ScoreBar score={cell.score} size="sm" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-ink-3 text-[11px]">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3.5 border-b border-line">
                  <StatusPill status={cand.status} />
                </td>
                <td className="px-4 py-3.5 border-b border-line">
                  <div className="text-[11px] text-ink-3 font-mono whitespace-nowrap">
                    {cand.submittedAt}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-2 border border-line text-[11px] font-medium text-ink-2">
      {initials}
    </span>
  );
}

/* ---------- Detail Panel ---------- */

function DetailPanel({
  candidate,
  criteria,
  entries,
  onClose,
  onDecision,
}: {
  candidate: Candidate;
  criteria: Criterion[];
  entries: AuditEntry[];
  onClose: () => void;
  onDecision: (id: string, d: Candidate["status"]) => void;
}) {
  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
      data-onboarding-target="candidate-panel"
      className="flex h-full w-[440px] shrink-0 flex-col border-l border-line bg-paper"
    >
      <header className="flex items-start justify-between border-b border-line px-6 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={candidate.name} />
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-ink">
              {candidate.name}
            </div>
            <div className="text-[12px] text-ink-2 truncate">
              {candidate.headline}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-3">
              <span>{candidate.location}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{candidate.submittedAt}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-6 py-4 border-b border-line">
          <div className="mb-2 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Résumé summary
          </div>
          <p className="text-[13px] leading-[1.65] text-ink-2">
            {candidate.resumeSummary}
          </p>
        </section>

        <section className="px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
              Scores with evidence
            </div>
            <span className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
              <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
              <span>audit trail</span>
            </span>
          </div>

          <div className="space-y-4">
            {criteria.map((crit) => {
              const cell = candidate.scores[crit.id];
              if (!cell) return null;
              return (
                <div
                  key={crit.id}
                  className="rounded-lg border border-line bg-card"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                    <div>
                      <div className="text-[13px] font-medium text-ink">
                        {crit.name}
                      </div>
                      <div className="text-[10.5px] text-ink-3 capitalize">
                        {crit.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13.5px]">
                        <ScoreNumber score={cell.score} />
                      </div>
                      <div className="mt-1 w-[100px]">
                        <ScoreBar score={cell.score} />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <ul className="space-y-2">
                      {cell.evidence.map((ev, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[12.5px] leading-[1.6] text-ink-2"
                        >
                          <Quote
                            className="h-3 w-3 shrink-0 mt-1 text-ink-3"
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

        <section className="px-6 py-4 border-t border-line">
          <div className="mb-2 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Pipeline decision
          </div>
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status={candidate.status} size="md" />
            <span className="text-[11px] text-ink-3">
              based on weighted scores
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <DecisionButton
              kind="advance"
              active={candidate.status === "advance"}
              onClick={() => onDecision(candidate.id, "advance")}
            />
            <DecisionButton
              kind="hold"
              active={candidate.status === "hold"}
              onClick={() => onDecision(candidate.id, "hold")}
            />
            <DecisionButton
              kind="reject"
              active={candidate.status === "reject"}
              onClick={() => onDecision(candidate.id, "reject")}
            />
          </div>
          <p className="mt-3 text-[10.5px] leading-[1.55] text-ink-3">
            Your override is recorded alongside the pipeline's recommendation
            in the audit log.
          </p>
        </section>

        {entries.length > 0 && (
          <section className="px-6 py-4 border-t border-line bg-paper-2/60">
            <div className="mb-3 flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
              <FileSignature className="h-3 w-3" strokeWidth={1.75} />
              <span>Audit log · {entries.length} entr{entries.length === 1 ? "y" : "ies"}</span>
            </div>
            <ul className="space-y-2.5">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-md border border-line bg-card px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[12px] text-ink">
                      <StatusPill status={e.from} size="sm" />
                      <span aria-hidden className="text-ink-3">→</span>
                      <StatusPill status={e.to} size="sm" />
                    </div>
                    <span className="font-mono text-[10.5px] text-ink-3">
                      {formatRelative(e.ts)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10.5px] text-ink-3">
                    <span>by {e.reviewer}</span>
                    <span>
                      pipeline {e.pipelineVersion} ·{" "}
                      <span className="text-ink-2">{e.pipelineHash}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </motion.aside>
  );
}

function DecisionButton({
  kind,
  active,
  onClick,
}: {
  kind: Candidate["status"];
  active: boolean;
  onClick: () => void;
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
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors border",
        active
          ? "bg-ink text-paper border-ink"
          : "bg-card text-ink border-line hover:border-ink-3",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: active ? "#fff" : color }}
      />
      <span>{label}</span>
    </button>
  );
}
