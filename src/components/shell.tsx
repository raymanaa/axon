"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuditView } from "@/components/audit-view";
import { CandidatesView } from "@/components/candidates-view";
import { CriteriaView } from "@/components/criteria-view";
import { Onboarding, type OnboardingObs } from "@/components/onboarding";
import { RoleTabs, type RoleTab } from "@/components/role-tabs";
import { RolesNav } from "@/components/roles-nav";
import { HelpPopover } from "@/components/top-bar";
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
  const [candidateDecisions, setCandidateDecisions] = useState<
    Record<string, Candidate["status"]>
  >({});
  const [helpOpen, setHelpOpen] = useState(false);

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

  function selectRole(id: RoleId) {
    setActiveRoleId(id);
    setSelectedCandidateId(null);
    setActiveTab("candidates");
  }

  function setTab(t: RoleTab) {
    setActiveTab(t);
    if (t !== "candidates") setSelectedCandidateId(null);
  }

  // Onboarding observations
  const obs = useMemo<OnboardingObs>(
    () => ({
      selectedCandidateId,
      activeTab,
      activeRoleId,
    }),
    [selectedCandidateId, activeTab, activeRoleId],
  );

  // ? key for help
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
        {/* Header */}
        <header className="flex shrink-0 items-end justify-between border-b border-line px-8 pt-5">
          <div className="min-w-0 pb-1">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
              {role.dept}
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

        {/* Tab content */}
        <div className="flex flex-1 min-h-0">
          {activeTab === "candidates" && (
            <CandidatesView
              roleId={activeRoleId}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
              onDecision={(id, d) =>
                setCandidateDecisions((prev) => ({ ...prev, [id]: d }))
              }
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
