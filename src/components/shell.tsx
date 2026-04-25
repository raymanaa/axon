"use client";

import { AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuditView } from "@/components/audit-view";
import { CandidatesView } from "@/components/candidates-view";
import { CriteriaView } from "@/components/criteria-view";
import { Onboarding, type OnboardingObs } from "@/components/onboarding";
import { RoleTabs, type RoleTab } from "@/components/role-tabs";
import { RolesNav } from "@/components/roles-nav";
import { HelpPopover } from "@/components/top-bar";
import {
  appendDecisionEntry,
  appendRescoreEntry,
  loadAuditLog,
  loadDecisions,
  loadScores,
  saveDecisions,
  saveScores,
  scoreKey,
  type AuditEntry,
  type DecisionMap,
  type ScoreMap,
} from "@/lib/audit-log";
import {
  CANDIDATES,
  CRITERIA,
  ROLES,
  type Candidate,
  type RoleId,
} from "@/lib/mock-data";

export function Shell() {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>(ROLES[0].id);
  const [activeTab, setActiveTab] = useState<RoleTab>("candidates");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [candidateDecisions, setCandidateDecisions] = useState<DecisionMap>({});
  const [scoreOverrides, setScoreOverrides] = useState<ScoreMap>({});
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setCandidateDecisions(loadDecisions());
    setScoreOverrides(loadScores());
    setAuditEntries(loadAuditLog());
  }, []);

  const role = useMemo(
    () => ROLES.find((r) => r.id === activeRoleId) ?? ROLES[0],
    [activeRoleId],
  );
  const candidates = useMemo(() => {
    const base = CANDIDATES[activeRoleId] ?? [];
    return base.map((c) =>
      candidateDecisions[c.id]
        ? { ...c, status: candidateDecisions[c.id] }
        : c,
    );
  }, [activeRoleId, candidateDecisions]);
  const criteriaCount = (CRITERIA[activeRoleId] ?? []).length;

  const onDecision = useCallback(
    (id: string, next: Candidate["status"]) => {
      const base = CANDIDATES[activeRoleId]?.find((c) => c.id === id);
      if (!base) return;
      const previous = candidateDecisions[id] ?? base.status;
      if (previous === next) return;

      setCandidateDecisions((prev) => {
        const nextMap = { ...prev, [id]: next };
        saveDecisions(nextMap);
        return nextMap;
      });

      const entry = appendDecisionEntry({
        candidateId: id,
        roleId: activeRoleId,
        from: previous,
        to: next,
      });
      if (entry) setAuditEntries((prev) => [entry, ...prev]);
    },
    [activeRoleId, candidateDecisions],
  );

  const onRescore = useCallback(
    (
      candidateId: string,
      criterionId: string,
      previousScore: number,
      next: { score: number; evidence: string[]; reasoning: string; model: string },
    ) => {
      const key = scoreKey(candidateId, criterionId);
      setScoreOverrides((prev) => {
        const nextMap: ScoreMap = {
          ...prev,
          [key]: {
            score: next.score,
            evidence: next.evidence,
            reasoning: next.reasoning,
            model: next.model,
            ts: Date.now(),
          },
        };
        saveScores(nextMap);
        return nextMap;
      });

      const entry = appendRescoreEntry({
        candidateId,
        roleId: activeRoleId,
        criterionId,
        previousScore,
        newScore: next.score,
        model: next.model,
      });
      if (entry) setAuditEntries((prev) => [entry, ...prev]);
    },
    [activeRoleId],
  );

  function selectRole(id: RoleId) {
    setActiveRoleId(id);
    setSelectedCandidateId(null);
    setActiveTab("candidates");
  }

  function setTab(t: RoleTab) {
    setActiveTab(t);
    if (t !== "candidates") setSelectedCandidateId(null);
  }

  const obs = useMemo<OnboardingObs>(
    () => ({
      selectedCandidateId,
      activeTab,
      activeRoleId,
    }),
    [selectedCandidateId, activeTab, activeRoleId],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !helpOpen) {
        const tag = (e.target as HTMLElement | null)?.tagName ?? "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setHelpOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [helpOpen]);

  return (
    <div className="flex h-full w-full bg-paper text-ink">
      <RolesNav activeRoleId={activeRoleId} onSelectRole={selectRole} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex shrink-0 items-end justify-between border-b border-line px-8 pt-5">
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
              <Link
                href="/"
                className="hover:text-ink transition-colors"
              >
                Axon
              </Link>
              <span aria-hidden>/</span>
              <span>{role.dept}</span>
            </div>
            <h1 className="mt-1 serif text-[26px] leading-[1.15] tracking-[-0.015em] text-ink truncate">
              {role.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-[11.5px] text-ink-3">
              <span>{candidates.length} candidates</span>
              <span aria-hidden>·</span>
              <span>{criteriaCount} criteria</span>
              <span aria-hidden>·</span>
              <span>Hiring manager: {role.hiringManager}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{role.openedAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-3">
            <button
              onClick={() => setHelpOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="flex shrink-0 items-center justify-between border-b border-line px-8">
          <RoleTabs active={activeTab} onChange={setTab} />
          <div className="font-mono text-[10.5px] text-ink-3">
            pipeline v12 · 3a7f9c2
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {activeTab === "candidates" && (
            <CandidatesView
              roleId={activeRoleId}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
              onDecision={onDecision}
              onRescore={onRescore}
              auditEntries={auditEntries}
              scoreOverrides={scoreOverrides}
            />
          )}
          {activeTab === "criteria" && <CriteriaView roleId={activeRoleId} />}
          {activeTab === "audit" && <AuditView />}
        </div>
      </div>

      <AnimatePresence>
        {helpOpen && <HelpPopover onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>

      <Onboarding obs={obs} onShowTab={setTab} />
    </div>
  );
}
