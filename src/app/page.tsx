import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <span
              aria-hidden
              className="block h-[7px] w-[7px] rounded-sm bg-[color:var(--accent)]"
            />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink-2">
              Alpha · portfolio pilot
            </span>
          </div>

          <h1 className="serif text-[44px] leading-[1.02] tracking-[-0.025em] text-ink max-w-[780px] md:text-[64px]">
            Hiring you can{" "}
            <span className="serif-italic">explain.</span>
          </h1>

          <p className="mt-6 max-w-[560px] text-[15px] leading-[1.7] text-ink-2 md:text-[17px]">
            Axon screens résumés through a visible, auditable pipeline. Every
            score carries evidence, every decision is signed with the rubric
            version that produced it. Built for regulated hiring — NYC Local
            Law 144, EU AI Act Article 6.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="group flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
            >
              <span>Open the console</span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <Link
              href="/compliance"
              className="group flex items-center gap-1.5 rounded-md border border-line bg-card px-5 py-2.5 text-[14px] font-medium text-ink-2 hover:border-line-2 hover:text-ink transition-colors"
            >
              <span>Why transparency matters</span>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-ink-3">
            <ComplianceBadge
              primary="NYC Local Law 144"
              secondary="AEDT bias audits · enforced Jul 2023"
            />
            <ComplianceBadge
              primary="EU AI Act Art. 6"
              secondary="Annex III · enforcement 2026"
            />
            <ComplianceBadge
              primary="Illinois AIVIA · Maryland HB 1202 · Colorado SB 205"
              secondary="State AEDT regimes"
            />
          </div>
        </div>

        {/* Background pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 40% 30%, black 30%, transparent 80%)",
          }}
        />
      </section>

      {/* Problem */}
      <section className="border-t border-line px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[280px_1fr] md:gap-20">
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
                The problem
              </div>
              <h2 className="serif mt-3 text-[28px] leading-[1.15] tracking-[-0.02em] text-ink">
                AI is already{" "}
                <span className="serif-italic">screening</span>{" "}
                the world's résumés.
              </h2>
            </div>
            <div className="space-y-8">
              <Stat
                number="93%"
                caption="of Fortune 500 companies use automated screening somewhere in their hiring stack."
                source="SHRM · 2024"
              />
              <Stat
                number="5"
                caption="U.S. jurisdictions and the EU have passed laws requiring bias audits or explainability for hiring AI — with more in pipeline."
                source="NYC LL 144 · Illinois AIVIA · Maryland HB 1202 · Colorado SB 205 · EU AI Act"
              />
              <Stat
                number="0"
                caption="major ATS platforms expose their scoring logic. 'Our model scored you low' is the answer candidates and regulators get."
                source="Axon · competitive review"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product pillars */}
      <section className="border-t border-line bg-paper-2 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-[640px]">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
              How Axon works
            </div>
            <h2 className="serif mt-3 text-[30px] leading-[1.15] tracking-[-0.02em] text-ink">
              Three ideas,{" "}
              <span className="serif-italic">one</span>{" "}
              product.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            <Pillar
              n="01"
              title="Rubrics, not prompts"
              body="What you're screening for is a card — name, type, strictness slider, plain-English notes. The pipeline turns it into a prompt. Recruiters edit criteria; engineers don't gatekeep."
            />
            <Pillar
              n="02"
              title="Evidence per score"
              body="Every 1–5 comes with verbatim snippets from the résumé. A candidate asks why; you copy-paste the evidence. A regulator asks why; you export the run."
            />
            <Pillar
              n="03"
              title="Signed audit trail"
              body="Every decision is attached to the pipeline version hash that produced it. Change the rubric, past candidates still read against their rubric. The pipeline IS the audit."
            />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="serif text-[36px] leading-[1.1] tracking-[-0.02em] text-ink md:text-[48px]">
            Open the console.{" "}
            <span className="serif-italic">See it work.</span>
          </h2>
          <p className="mt-5 max-w-[520px] mx-auto text-[14.5px] leading-[1.7] text-ink-2">
            The alpha is seeded with three open roles and a dozen candidates
            already scored. Review one, override a decision, watch the audit
            log grow.
          </p>
          <div className="mt-8">
            <Link
              href="/app"
              className="group inline-flex items-center gap-1.5 rounded-md bg-ink px-6 py-3 text-[14px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
            >
              <span>Open the console</span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function ComplianceBadge({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="h-[5px] w-[5px] rounded-full bg-ink-3"
      />
      <span>
        <span className="text-ink-2 font-medium">{primary}</span>
        <span className="text-ink-3"> · {secondary}</span>
      </span>
    </div>
  );
}

function Stat({
  number,
  caption,
  source,
}: {
  number: string;
  caption: string;
  source: string;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="serif w-[92px] shrink-0 text-[44px] leading-none tracking-[-0.03em] text-ink tabular-nums">
        {number}
      </div>
      <div className="flex-1 pt-2">
        <p className="text-[14.5px] leading-[1.6] text-ink">{caption}</p>
        <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
          {source}
        </div>
      </div>
    </div>
  );
}

function Pillar({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative">
      <div className="font-mono text-[11.5px] tabular-nums text-ink-3">
        {n}
      </div>
      <h3 className="serif mt-2 text-[22px] leading-[1.2] tracking-[-0.015em] text-ink">
        {title}
      </h3>
      <p className="mt-3 text-[13.5px] leading-[1.7] text-ink-2">{body}</p>
    </div>
  );
}
