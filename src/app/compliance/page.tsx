import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />

      <article className="flex-1 px-6 pb-20 pt-10 md:px-10 md:pt-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
            Regulatory landscape
          </div>
          <h1 className="serif mt-3 text-[38px] leading-[1.08] tracking-[-0.025em] text-ink md:text-[48px]">
            Why black-box hiring AI is{" "}
            <span className="serif-italic">already</span> a liability.
          </h1>
          <p className="mt-5 max-w-[640px] text-[15.5px] leading-[1.7] text-ink-2">
            Five jurisdictions have made AI-driven hiring decisions legally
            risky in the last three years. A pipeline that can't be explained
            fails every one of these regimes — not in theory, in active
            enforcement. This page is a short primer on what you owe, and
            how Axon is structured so you satisfy each of them by
            construction.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl space-y-14">
          <LawCard
            badge="NYC · Local Law 144"
            enforcement="Enforced since July 2023"
            title="AEDT bias audits for NYC hires."
            body={
              <>
                <p>
                  Any automated employment decision tool (AEDT) used to
                  substantially assist a hiring decision for a role located in
                  or managed from New York City must:
                </p>
                <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-2">
                  <Bullet>
                    Undergo an <em>annual</em> bias audit by an independent
                    auditor, published publicly.
                  </Bullet>
                  <Bullet>
                    Disclose the use of an AEDT to candidates at least 10
                    business days before use.
                  </Bullet>
                  <Bullet>
                    Allow candidates to request an alternative non-AEDT
                    selection process.
                  </Bullet>
                </ul>
                <p className="mt-4">
                  Penalties start at $500 per violation and escalate to
                  $1,500 per subsequent violation per day. "We used ChatGPT
                  to screen résumés" is a per-candidate violation.
                </p>
              </>
            }
            axonResponse="Every Axon decision carries a pipeline version hash. Auditors re-run your stored candidate-input on the stored pipeline version and verify the scoring is deterministic. Bias testing happens on the same interface, not as an afterthought PDF."
          />

          <LawCard
            badge="EU · AI Act Article 6 + Annex III"
            enforcement="Obligations phase in through 2026"
            title="Hiring AI is high-risk. Treat it that way."
            body={
              <>
                <p>
                  The EU AI Act classifies AI used in employment, worker
                  management, and access to self-employment as{" "}
                  <em>high-risk</em> (Annex III, point 4). High-risk systems
                  must have:
                </p>
                <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-2">
                  <Bullet>
                    Risk management over the full lifecycle (Art. 9)
                  </Bullet>
                  <Bullet>
                    Record-keeping of each operation with tamper-resistant
                    logs (Art. 12)
                  </Bullet>
                  <Bullet>
                    Transparency and information to deployers and users
                    (Art. 13)
                  </Bullet>
                  <Bullet>
                    Human oversight built into the design (Art. 14)
                  </Bullet>
                </ul>
                <p className="mt-4">
                  Maximum administrative fines for non-compliance reach €35M
                  or 7% of global turnover. "The vendor's model did it"
                  doesn't shift liability to the vendor.
                </p>
              </>
            }
            axonResponse="The audit log is append-only and hash-chained — tamper-resistant by design. Every decision records the reviewer (the human-oversight surface) next to the pipeline recommendation. The criteria UI makes it impossible to ship a rubric that hasn't been reviewed by a person."
          />

          <LawCard
            badge="Illinois · AIVIA"
            enforcement="In force since 2020"
            title="AI in video interviews requires consent + disclosure."
            body={
              <p>
                The Artificial Intelligence Video Interview Act requires
                employers using AI to analyze interview videos to: notify
                applicants, explain how it works, obtain consent, limit
                sharing, and destroy copies on request.
              </p>
            }
            axonResponse="Axon doesn't touch video in the pilot, but the disclosure-and-destruction scaffolding applies equally to résumé analysis and is exposed via per-candidate data retention controls."
          />

          <LawCard
            badge="Maryland · HB 1202"
            enforcement="In force since 2020"
            title="Facial recognition in hiring requires consent."
            body={
              <p>
                Maryland prohibits using facial recognition services during
                pre-employment interviews without written candidate consent.
              </p>
            }
            axonResponse="Axon's node palette does not include a facial-recognition primitive. The audit log would surface such a node immediately if introduced."
          />

          <LawCard
            badge="Colorado · SB 205"
            enforcement="Takes effect Feb 2026"
            title="Colorado AI Act: duty of care + impact assessments."
            body={
              <p>
                Colorado will impose a duty of reasonable care on deployers
                of high-risk AI to prevent algorithmic discrimination,
                including mandatory impact assessments and documentation
                obligations very similar to the EU AI Act's.
              </p>
            }
            axonResponse="Axon produces impact-assessment-ready artifacts by default: pipeline version graphs, exclusion lists per criterion, distribution of scores per run, reviewer-override rates."
          />
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          <div className="rounded-xl border border-line bg-paper-2 px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
                  Fine print
                </div>
                <h3 className="serif mt-2 text-[22px] leading-[1.25] tracking-[-0.015em] text-ink">
                  This is an alpha. Not legal advice.
                </h3>
                <p className="mt-2 max-w-[580px] text-[13px] leading-[1.65] text-ink-2">
                  Axon is a portfolio pilot. It is structured to satisfy the
                  above regimes, but any production deployment requires
                  counsel review, real audit partners, and per-jurisdiction
                  rollout plans. Talk to your lawyers.
                </p>
              </div>
              <Link
                href="/app"
                className="group flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[13.5px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
              >
                <span>Open console</span>
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}

function LawCard({
  badge,
  enforcement,
  title,
  body,
  axonResponse,
}: {
  badge: string;
  enforcement: string;
  title: string;
  body: React.ReactNode;
  axonResponse: string;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:gap-10">
      <div>
        <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-2">
          {badge}
        </div>
        <div className="mt-1 text-[10.5px] text-ink-3 font-mono">
          {enforcement}
        </div>
      </div>
      <div>
        <h2 className="serif text-[22px] leading-[1.25] tracking-[-0.015em] text-ink">
          {title}
        </h2>
        <div className="mt-3 text-[14px] leading-[1.75] text-ink">{body}</div>
        <div className="mt-5 border-l-2 border-[color:var(--accent)] pl-4">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-[color:var(--accent)]">
            How Axon answers
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.7] text-ink-2">
            {axonResponse}
          </p>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-ink-3"
      />
      <span>{children}</span>
    </li>
  );
}
