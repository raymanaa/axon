"use client";

import {
  FileSearch,
  GitBranch,
  ScrollText,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export type RoleTab = "candidates" | "criteria" | "pipeline" | "audit";

const TABS: {
  id: RoleTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "criteria", label: "Criteria", icon: SlidersHorizontal },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "audit", label: "Audit", icon: ScrollText },
];

export function RoleTabs({
  active,
  onChange,
}: {
  active: RoleTab;
  onChange: (t: RoleTab) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {TABS.map((t) => {
        const isActive = active === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            data-onboarding-target={`tab-${t.id}`}
            className={[
              "relative flex items-center gap-2 px-3 py-2 text-[13px] transition-colors",
              isActive
                ? "text-ink"
                : "text-ink-2 hover:text-ink",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="font-medium">{t.label}</span>
            {isActive && (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-ink"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
// Keep FileSearch import referenced to avoid unused warning if a consumer still expects it
void FileSearch;
