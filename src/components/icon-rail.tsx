"use client";

import {
  Command,
  HelpCircle,
  Home,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type RailDest = "roles" | "audit" | "home";

type Props = {
  active: RailDest;
  onNavigate: (dest: RailDest) => void;
  onOpenCommand: () => void;
  onOpenHelp: () => void;
};

export function IconRail({
  active,
  onNavigate,
  onOpenCommand,
  onOpenHelp,
}: Props) {
  return (
    <div className="flex h-full w-[48px] shrink-0 flex-col items-center border-r border-line bg-paper-2/40 py-2.5">
      <Logo />

      <div className="mt-2 flex flex-1 flex-col items-center gap-0.5">
        <RailItem
          icon={Home}
          label="Home"
          disabled
          hint="Coming soon"
        />
        <RailItem
          icon={Users}
          label="Roles"
          active={active === "roles"}
          onClick={() => onNavigate("roles")}
          hint="G then R"
        />
        <RailItem
          icon={ShieldCheck}
          label="All audits"
          disabled
          hint="Coming soon"
        />
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <RailItem
          icon={Command}
          label="Command palette"
          onClick={onOpenCommand}
          hint="⌘ K"
        />
        <RailItem
          icon={HelpCircle}
          label="Help"
          onClick={onOpenHelp}
          hint="?"
        />
        <RailItem icon={Settings} label="Settings" disabled />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div
      aria-label="Axon"
      className="relative flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper"
    >
      <span className="serif text-[15px] leading-none tracking-[-0.02em]">
        A
      </span>
      <span
        aria-hidden
        className="absolute -right-0.5 -top-0.5 h-[6px] w-[6px] rounded-full bg-[color:var(--accent)]"
      />
    </div>
  );
}

function RailItem({
  icon: Icon,
  label,
  hint,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={[
          "relative flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          active
            ? "bg-card text-ink shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(24,23,21,0.04)]"
            : "text-ink-3 hover:text-ink hover:bg-card disabled:hover:bg-transparent disabled:hover:text-ink-3/60 disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {active && (
          <span
            aria-hidden
            className="absolute -left-[6px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-[color:var(--accent)]"
          />
        )}
      </button>

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-[44px] top-1/2 z-50 -translate-y-1/2 opacity-0 translate-x-[-4px] transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="flex items-center gap-2 rounded-md border border-line bg-card px-2.5 py-1.5 shadow-[0_4px_12px_rgba(24,23,21,0.08)] whitespace-nowrap">
          <span className="text-[12px] text-ink">{label}</span>
          {hint && (
            <kbd className="inline-flex h-4 items-center rounded border border-line bg-paper px-1 font-mono text-[10px] text-ink-3">
              {hint}
            </kbd>
          )}
        </div>
      </div>
    </div>
  );
}
