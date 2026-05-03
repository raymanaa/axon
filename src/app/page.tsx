/**
 * Axon landing — institutional fintech centered
 * (grammar inspired by Ramp / Brex landings).
 *
 * Centered big black sans-serif hero. A small "trusted by" logo strip of
 * mock company marks (rendered as tiny SVG symbols). A single framed
 * product screenshot below. Confident understated institutional voice.
 */
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CANDIDATES, CRITERIA, ROLES } from "@/lib/mock-data";

export default function Landing() {
  const role = ROLES[0];
  const candidate = CANDIDATES[role.id]?.[0];
  const criteria = CRITERIA[role.id] ?? [];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      {/* Centered hero */}
      <section className="mx-auto max-w-[1000px] px-6 md:px-10 pt-24 pb-12 md:pt-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11.5px] text-ink-2">
          <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-black" />
          <span className="mono tracking-[0.12em] uppercase">Axon · Screening Pipeline</span>
        </div>

        <h1 className="display mt-7 text-[56px] leading-[1.02] tracking-[-0.024em] text-ink md:text-[96px]">
          Screening that{" "}
          <span className="display-italic" style={{ color: "var(--accent, #c2502d)" }}>
            holds up in review.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[54ch] text-[16.5px] leading-[1.6] text-ink-2">
          Every score cites a quote from the résumé. Every rubric is pinned by version. Every advance or rejection ships with an audit trail.
        </p>

        <div className="mt-9 flex items-center justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-[14px] rounded-md hover:bg-ink-2 transition-colors"
          >
            Open the pipeline
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/audit"
            className="text-[14px] text-ink-2 hover:text-ink transition-colors"
          >
            See a sample audit →
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-16">
          <div className="smallcaps text-[10.5px] tracking-[0.22em] text-ink-3 mb-5">
            Quietly in use at
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Keel", "Lumen", "Thatch", "Atlas", "Meridian", "Harrow", "Parallel", "Drift"].map((name) => (
              <span
                key={name}
                className="flex items-center gap-1.5 text-[13px] tracking-[0.08em] uppercase text-ink-2"
              >
                <LogoMark />
                {name}
              </span>
            ))}
          </div>
          <div className="smallcaps text-[10.5px] tracking-[0.2em] text-ink-3 mt-5 italic">
            — pilot deployments · not endorsements —
          </div>
        </div>
      </section>

      {/* Framed product screenshot */}
      <section className="mx-auto max-w-[1040px] px-6 md:px-10 pb-16">
        <div className="rounded-xl border border-line bg-card overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25),0_10px_30px_-20px_rgba(0,0,0,0.15)]">
          {/* chrome */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-[#28c840]" />
            <span className="mono ml-4 text-[11px] text-ink-3">
              axon.raymnz.com/app/{role.id}
            </span>
          </div>

          {/* content */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] divide-x divide-line">
            <aside className="p-5">
              <div className="label">Open roles</div>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {ROLES.map((r) => (
                  <li
                    key={r.id}
                    className={[
                      "rounded-md px-2.5 py-2",
                      r.id === role.id
                        ? "border border-ink bg-paper-2/50"
                        : "text-ink-2",
                    ].join(" ")}
                  >
                    <div className="text-ink text-[13px] font-medium leading-tight">{r.short}</div>
                    <div className="mono text-[10px] text-ink-3 mt-0.5">{r.openedAt}</div>
                  </li>
                ))}
              </ul>
            </aside>

            {candidate && (
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="label">Candidate</div>
                    <div className="display mt-1 text-[26px] leading-tight text-ink">
                      {candidate.name}
                    </div>
                    <div className="text-[12.5px] text-ink-3 mt-1">{candidate.headline}</div>
                  </div>
                  <span
                    className="mono text-[10px] font-semibold tracking-[0.14em] rounded-full px-2.5 py-1"
                    style={{
                      background:
                        candidate.status === "advance"
                          ? "rgba(58,123,85,0.1)"
                          : candidate.status === "reject"
                            ? "rgba(161,58,56,0.1)"
                            : "rgba(183,122,31,0.1)",
                      color:
                        candidate.status === "advance"
                          ? "#3a7b55"
                          : candidate.status === "reject"
                            ? "#a13a38"
                            : "#b77a1f",
                    }}
                  >
                    {candidate.status.toUpperCase()}
                  </span>
                </div>

                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {criteria.slice(0, 4).map((c) => {
                    const cell = candidate.scores[c.id];
                    if (!cell) return null;
                    return (
                      <li key={c.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline py-3">
                        <span className="text-[12.5px] text-ink">{c.name}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className="inline-block h-[8px] w-[14px] rounded-[2px]"
                              style={{
                                background: n <= cell.score ? "var(--accent, #c2502d)" : "var(--line)",
                              }}
                            />
                          ))}
                        </div>
                        <span className="mono text-[11px] tabular-nums text-ink">
                          {cell.score}/5
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Institutional three-up — text only, no cards */}
      <section className="mx-auto max-w-[1000px] px-6 md:px-10 py-16 border-t border-line">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <InstitutionalNote label="Audit-ready" body="Rubric version, quote-source, model version pinned on every decision." />
          <InstitutionalNote label="Playbook-first" body="Change the rubric; change what matters. Axon reads; the rubric decides." />
          <InstitutionalNote label="Candidate-facing" body="The scorecard is designed to be sharable with candidates without redaction." />
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function LogoMark() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="text-ink-2">
      <path d="M2 2 L7 11 L12 2 M4 6 L10 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function InstitutionalNote({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="smallcaps text-[11px] tracking-[0.2em] text-ink-3">{label}</div>
      <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-2 max-w-[32ch] mx-auto">{body}</p>
    </div>
  );
}
