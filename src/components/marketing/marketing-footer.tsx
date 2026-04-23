import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line px-6 py-12 md:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="serif-italic text-[20px] leading-none text-ink">
              Axon
            </span>
            <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.22em]">
              α
            </span>
          </div>
          <p className="mt-3 max-w-[260px] text-[12px] leading-[1.65] text-ink-3">
            Transparent résumé screening. Every score explainable, every
            decision auditable.
          </p>
        </div>

        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Product
          </div>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li>
              <Link
                href="/app"
                className="text-ink-2 hover:text-ink transition-colors"
              >
                Console
              </Link>
            </li>
            <li>
              <Link
                href="/security"
                className="text-ink-2 hover:text-ink transition-colors"
              >
                Security
              </Link>
            </li>
            <li>
              <Link
                href="/compliance"
                className="text-ink-2 hover:text-ink transition-colors"
              >
                Compliance
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Context
          </div>
          <ul className="mt-3 space-y-2 text-[13px] text-ink-2">
            <li>Built by Rayen Manaa</li>
            <li>Portfolio project #1</li>
            <li>
              <a
                href="https://github.com/raymanaa/axon"
                target="_blank"
                rel="noopener"
                className="text-ink-2 hover:text-ink transition-colors"
              >
                github.com/raymanaa/axon ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-line pt-6 text-[11px] text-ink-3">
        <div>© 2026 Axon · alpha</div>
        <div className="font-mono">axon.raymnz.com</div>
      </div>
    </footer>
  );
}
