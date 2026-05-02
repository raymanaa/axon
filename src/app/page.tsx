import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CANDIDATES, CRITERIA, ROLES } from "@/lib/mock-data";

export default function Landing() {
  const role = ROLES[0];
  const candidate = CANDIDATES[role.id]?.[0];
  const criterion = CRITERIA[role.id]?.[0];
  const cell = candidate?.scores[criterion?.id ?? ""];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />

      <section className="flex-1">
        <div className="mx-auto max-w-[1120px] px-6 md:px-10 pt-24 pb-20 md:pt-32">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-16">
            <div>
              <div className="label">Résumé screening you can defend</div>
              <h1 className="display mt-5 text-[64px] leading-[0.94] tracking-[-0.02em] md:text-[96px]">
                Every score,{" "}
                <span className="display-italic" style={{ color: "var(--accent, #c2502d)" }}>
                  every quote.
                </span>
              </h1>
              <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.65] text-ink-2">
                An audit trail by default. Every rubric version pinned. Every quote sourced.
              </p>
              <div className="mt-8">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[14px] rounded-[3px] hover:bg-ink-2 transition-colors"
                >
                  Open the pipeline
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            {candidate && criterion && cell && (
              <div className="border border-line bg-card rounded-[4px] p-5">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[10px] text-ink-3 tracking-[0.12em]">
                    {role.short.toUpperCase()}
                  </span>
                  <span
                    className="mono text-[10px] font-semibold tracking-[0.14em]"
                    style={{
                      color:
                        candidate.status === "advance"
                          ? "var(--ok, #3a7b55)"
                          : candidate.status === "reject"
                            ? "var(--crit, #a13a38)"
                            : "var(--warn, #b77a1f)",
                    }}
                  >
                    {candidate.status.toUpperCase()}
                  </span>
                </div>
                <div className="display mt-2 text-[22px] leading-tight text-ink">
                  {candidate.name}
                </div>
                <div className="text-[11.5px] text-ink-3 mt-0.5">
                  {candidate.headline}
                </div>
                <div className="rule my-3" />
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] text-ink">{criterion.name}</span>
                  <span className="mono text-[20px] tabular-nums text-ink leading-none">
                    {cell.score}
                    <span className="text-[12px] text-ink-3">/5</span>
                  </span>
                </div>
                {cell.evidence[0] && (
                  <blockquote
                    className="mt-2 border-l-2 pl-3 py-1 text-[11.5px] italic leading-[1.5] text-ink-2"
                    style={{ borderColor: "var(--accent, #c2502d)" }}
                  >
                    &ldquo;{cell.evidence[0].slice(0, 140)}{cell.evidence[0].length > 140 ? "…" : ""}&rdquo;
                  </blockquote>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-y border-line">
          <div className="mx-auto max-w-[1120px] px-6 md:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step n="01" verb="Score" detail="Against your rubric" />
            <Step n="02" verb="Cite" detail="Every score — its quote" />
            <Step n="03" verb="Audit" detail="Rubric version pinned" />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Step({ n, verb, detail }: { n: string; verb: string; detail: string }) {
  return (
    <div>
      <div className="mono text-[10.5px] text-ink-3 tracking-[0.16em]">{n}</div>
      <div className="display mt-1 text-[26px] leading-none text-ink">{verb}.</div>
      <div className="mt-1 text-[13px] text-ink-2">{detail}</div>
    </div>
  );
}
