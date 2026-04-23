"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CornerDownLeft,
  FileSearch,
  Search,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RoleTab } from "@/components/role-tabs";
import { CANDIDATES, ROLES, type RoleId } from "@/lib/mock-data";

type CmdSection = "Jump to candidate" | "Roles" | "Tabs" | "Actions";

type Cmd = {
  id: string;
  section: CmdSection;
  title: string;
  subtitle?: string;
  keywords?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  run: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  activeRoleId: RoleId;
  activeTab: RoleTab;
  onSelectRole: (id: RoleId) => void;
  onSelectTab: (t: RoleTab) => void;
  onSelectCandidate: (id: string) => void;
};

export function CommandPalette({
  open,
  onClose,
  activeRoleId,
  onSelectRole,
  onSelectTab,
  onSelectCandidate,
}: Props) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(0);
      // focus after paint
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const cmds: Cmd[] = [];

    // Tabs
    const tabs: { id: RoleTab; title: string; hint: string }[] = [
      { id: "candidates", title: "Go to Candidates", hint: "G C" },
      { id: "criteria", title: "Go to Criteria", hint: "G R" },
      { id: "audit", title: "Go to Audit", hint: "G A" },
    ];
    for (const t of tabs) {
      cmds.push({
        id: `tab-${t.id}`,
        section: "Tabs",
        title: t.title,
        hint: t.hint,
        icon: SlidersHorizontal,
        run: () => {
          onSelectTab(t.id);
          onClose();
        },
      });
    }

    // Roles
    for (const r of ROLES) {
      cmds.push({
        id: `role-${r.id}`,
        section: "Roles",
        title: r.name,
        subtitle: r.dept,
        keywords: `${r.short} ${r.dept}`,
        icon: Users,
        run: () => {
          onSelectRole(r.id);
          onClose();
        },
      });
    }

    // Candidates for active role
    for (const c of CANDIDATES[activeRoleId] ?? []) {
      cmds.push({
        id: `cand-${c.id}`,
        section: "Jump to candidate",
        title: c.name,
        subtitle: c.headline,
        keywords: `${c.location} ${c.headline}`,
        icon: User,
        run: () => {
          onSelectTab("candidates");
          onSelectCandidate(c.id);
          onClose();
        },
      });
    }

    // Cross-role candidates too (shallow)
    for (const rid of Object.keys(CANDIDATES) as RoleId[]) {
      if (rid === activeRoleId) continue;
      for (const c of CANDIDATES[rid] ?? []) {
        const role = ROLES.find((r) => r.id === rid);
        cmds.push({
          id: `cand-${c.id}`,
          section: "Jump to candidate",
          title: c.name,
          subtitle: `${c.headline} · ${role?.short ?? ""}`,
          keywords: `${c.location} ${c.headline} ${role?.short}`,
          icon: User,
          run: () => {
            onSelectRole(rid);
            onSelectTab("candidates");
            onSelectCandidate(c.id);
            onClose();
          },
        });
      }
    }

    // Actions
    cmds.push({
      id: "open-audit",
      section: "Actions",
      title: "Open audit trail for current role",
      icon: FileSearch,
      run: () => {
        onSelectTab("audit");
        onClose();
      },
    });

    return cmds;
  }, [activeRoleId, onClose, onSelectRole, onSelectTab, onSelectCandidate]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay = `${c.title} ${c.subtitle ?? ""} ${c.keywords ?? ""} ${c.section}`.toLowerCase();
      return hay.includes(q);
    });
  }, [commands, query]);

  // Clamp highlight when list changes
  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered, highlight]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        filtered[highlight]?.run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, highlight, onClose]);

  // Group by section preserving order
  const bySection = useMemo(() => {
    const groups = new Map<CmdSection, Cmd[]>();
    for (const c of filtered) {
      const arr = groups.get(c.section) ?? [];
      arr.push(c);
      groups.set(c.section, arr);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  if (!open) return null;

  let runningIndex = 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-ink/20"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.99 }}
          transition={{ duration: 0.14 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line bg-card shadow-[0_24px_60px_rgba(24,23,21,0.18)]"
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Search className="h-4 w-4 text-ink-3" strokeWidth={2} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to a candidate, role, or view…"
              className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
            />
            <kbd className="inline-flex h-5 items-center rounded border border-line bg-paper px-1.5 font-mono text-[10.5px] text-ink-3">
              Esc
            </kbd>
          </div>

          <div className="max-h-[48vh] overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12.5px] text-ink-3">
                Nothing matches &ldquo;{query}&rdquo;
              </div>
            ) : (
              bySection.map(([section, items]) => (
                <div key={section}>
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-ink-3">
                    {section}
                  </div>
                  {items.map((cmd) => {
                    const myIdx = runningIndex++;
                    const isActive = myIdx === highlight;
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.run}
                        onMouseEnter={() => setHighlight(myIdx)}
                        className={[
                          "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                          isActive ? "bg-paper-2" : "hover:bg-paper-2/60",
                        ].join(" ")}
                      >
                        <Icon
                          className="h-3.5 w-3.5 shrink-0 text-ink-3"
                          strokeWidth={1.75}
                        />
                        <div className="flex min-w-0 flex-1 items-baseline gap-2">
                          <span className="text-[13px] text-ink truncate">
                            {cmd.title}
                          </span>
                          {cmd.subtitle && (
                            <span className="text-[11.5px] text-ink-3 truncate">
                              {cmd.subtitle}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <CornerDownLeft
                            className="h-3 w-3 shrink-0 text-ink-3"
                            strokeWidth={2}
                          />
                        )}
                        {!isActive && cmd.hint && (
                          <span className="font-mono text-[10.5px] text-ink-3">
                            {cmd.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[10.5px] text-ink-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border border-line bg-paper px-1 font-mono text-[10px]">
                  ↑
                </kbd>
                <kbd className="inline-flex h-4 items-center rounded border border-line bg-paper px-1 font-mono text-[10px]">
                  ↓
                </kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 items-center rounded border border-line bg-paper px-1 font-mono text-[10px]">
                  ↵
                </kbd>
                <span>select</span>
              </span>
            </div>
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
