"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/security", label: "Security" },
  { href: "/compliance", label: "Compliance" },
];

export function MarketingNav() {
  const pathname = usePathname();
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
      <Link href="/" className="flex items-baseline gap-1.5 group">
        <span className="serif-italic text-[22px] leading-none text-ink group-hover:text-ink/80 transition-colors">
          Axon
        </span>
        <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.22em]">
          α
        </span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "px-3 py-1.5 text-[13px] rounded-md transition-colors",
                active
                  ? "text-ink bg-paper-2"
                  : "text-ink-2 hover:text-ink hover:bg-paper-2",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/app"
          className="group flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
        >
          <span>Open console</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </header>
  );
}
