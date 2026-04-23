"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuditView } from "@/components/audit-view";
import {
  CandidatesView,
  type CandidatesViewHandle,
} from "@/components/candidates-view";
import { CommandPalette } from "@/components/command-palette";
import { CriteriaView } from "@/components/criteria-view";
import { IconRail, type RailDest } from "@/components/icon-rail";
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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [rail, setRail] = useState<RailDest>("roles");

  const candidatesRef = useRef<CandidatesViewHandle>(null);

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

  function setDecision(id: string, d: Candidate["status"]) {
    setCandidateDecisions((prev) => ({ ...prev, [id]: d }));
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      const isEditing = tag === "INPUT" || tag === "TEXTAREA";

      // ⌘K / Ctrl+K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }

      if (isEditing || cmdOpen) return;

      // ? — help
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // / — focus filter (only on candidates tab)
      if (e.key === "/" && activeTab === "candidates") {
        e.preventDefault();
        candidatesRef.current?.focusFilter();
        return;
      }

      // Candidates-tab-specific
      if (activeTab !== "candidates") return;

      // J / ArrowDown — next row
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        candidatesRef.current?.navigate("next");
        return;
      }
      // K / ArrowUp — prev row
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        candidatesRef.current?.navigate("prev");
        return;
      }
      // A / H / R — decide (requires selection)
      if (selectedCandidateId) {
        if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          candidatesRef.current?.decideSelected("advance");
          return;
        }
        if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          candidatesRef.current?.decideSelected("hold");
          return;
        }
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          candidatesRef.current?.decideSelected("reject");
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, selectedCandidateId, cmdOpen]);

  const obs = useMemo<OnboardingObs>(
    () => ({
      selectedCandidateId,
      activeTab,
      activeRoleId,
    }),
    [selectedCandidateId, activeTab, activeRoleId],
  );

  return (
    <div className="flex h-full w-full bg-paper text-ink">
      <IconRail
        active={rail}
        onNavigate={(d) => {
          setRail(d);
          if (d === "audit") setActiveTab("audit");
          if (d === "roles") setActiveTab("candidates");
        }}
        onOpenCommand={() => setCmdOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <RolesNav activeRoleId={activeRoleId} onSelectRole={selectRole} />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex shrink-0 items-end justify-between border-b border-line px-6 pt-4">
          <div className="min-w-0 pb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-3">
              {role.dept}
            </div>
            <h1 className="mt-1 serif text-[22px] leading-[1.15] text-ink truncate">
              {role.name}
            </h1>
            <div className="mt-1 flex items-center gap-2.5 text-[11px] text-ink-3">
              <span className="tabular-nums">
                {candidates.length} candidates
              </span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{criteriaCount} criteria</span>
              <span aria-hidden>·</span>
              <span>HM: {role.hiringManager}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{role.openedAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 rounded-md border border-line bg-card px-2 py-1 text-[11.5px] text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
            >
              <span>Jump to…</span>
              <kbd className="inline-flex h-4 items-center rounded border border-line bg-paper px-1 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <div className="flex shrink-0 items-center justify-between border-b border-line px-6">
          <RoleTabs active={activeTab} onChange={setTab} />
          <div className="font-mono text-[10px] text-ink-3">
            pipeline v12 · 3a7f9c2
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-1 min-h-0">
          {activeTab === "candidates" && (
            <CandidatesView
              ref={candidatesRef}
              roleId={activeRoleId}
              candidates={candidates}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
              onDecision={setDecision}
            />
          )}
          {activeTab === "criteria" && <CriteriaView roleId={activeRoleId} />}
          {activeTab === "audit" && <AuditView />}
        </div>
      </div>

      <AnimatePresence>
        {helpOpen && <HelpPopover onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        activeRoleId={activeRoleId}
        activeTab={activeTab}
        onSelectRole={selectRole}
        onSelectTab={setTab}
        onSelectCandidate={setSelectedCandidateId}
      />

      <Onboarding obs={obs} onShowTab={setTab} />
    </div>
  );
}
