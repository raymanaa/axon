"use client";

import { Plus } from "lucide-react";
import { CANDIDATES, ROLES, type RoleId } from "@/lib/mock-data";

export function RolesNav({
  activeRoleId,
  onSelectRole,
}: {
  activeRoleId: RoleId;
  onSelectRole: (id: RoleId) => void;
}) {
  return (
    <aside
      data-onboarding-target="roles-nav"
      className="flex h-full w-[236px] shrink-0 flex-col border-r border-line bg-paper"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
          Open roles
        </span>
        <span className="font-mono text-[10.5px] text-ink-3 tabular-nums">
          {ROLES.length}
        </span>
      </div>

      <nav className="flex flex-col px-2 py-0.5">
        {ROLES.map((role) => {
          const active = role.id === activeRoleId;
          const count = CANDIDATES[role.id]?.length ?? 0;
          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              data-onboarding-target={`role-${role.id}`}
              className={[
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
                active
                  ? "bg-card shadow-[0_0_0_1px_var(--line)]"
                  : "hover:bg-paper-2",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "h-[6px] w-[6px] rounded-full shrink-0 transition-colors",
                  active ? "bg-[color:var(--accent)]" : "bg-line-2",
                ].join(" ")}
              />
              <span className="flex-1 min-w-0 text-[12.5px] text-ink truncate">
                {role.short}
              </span>
              <span className="font-mono text-[10.5px] text-ink-3 tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      <button
        disabled
        className="mx-2 mt-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-ink-3 disabled:cursor-not-allowed hover:bg-paper-2 transition-colors"
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
        <span>New role</span>
        <span className="ml-auto font-mono text-[10px]">soon</span>
      </button>

      <div className="mt-auto border-t border-line px-5 py-4">
        <p className="text-[10.5px] leading-[1.55] text-ink-3">
          Every score and every decision is recorded in the audit log.
          <br />
          <span className="text-ink-2">
            Built for NYC Local Law 144 &amp; EU AI Act Art. 6.
          </span>
        </p>
      </div>
    </aside>
  );
}
