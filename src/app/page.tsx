import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CANDIDATES, CRITERIA, ROLES } from "@/lib/mock-data";

export default function Landing() {
  const role = ROLES[0];
  const candidate = CANDIDATES[role.id]?.[0];
  const criterion = CRITERIA[role.id]?.[0];
  const cell = candidate?.scores[criterion?.id ?? ""];
  const rolesRow = ROLES.slice(0, 3);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />

      <section>
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
                  className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[14px] rounded-[4px] hover:bg-ink-2 transition-colors"
                >
                  Open the pipeline
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            {candidate && criterion && cell && (
              <div className="border border-line bg-card rounded-[4px] p-5">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[10px] text-ink-3 tracking-[0.12em]">{role.short.toUpperCase()}</span>
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
                <div className="display mt-2 text-[22px] leading-tight text-ink">{candidate.name}</div>
                <div className="text-[11.5px] text-ink-3 mt-0.5">{candidate.headline}</div>
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
      </section>

      <section className="border-y border-line">
        <div className="mx-auto max-w-[1120px] px-6 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat n="per role" label="Rubric, pinned by version" />
          <Stat n="every" label="Score cites a quote from the résumé" />
          <Stat n="0" label="Unexplained advances or rejections" />
          <Stat n="100%" label="Audit trail exportable on demand" />
        </div>
      </section>

      <Section label="The EEOC conversation">
        <p className="display-italic text-[30px] leading-[1.25] text-ink max-w-[34ch] md:text-[42px]">
          A screener you cannot defend is a liability, not a tool.
        </p>
        <p className="mt-6 max-w-[60ch] text-[15px] leading-[1.7] text-ink-2">
          When the candidate asks why they weren&apos;t advanced, recruiting needs more than a score. Axon pins every decision to its rubric version, the criteria evaluated, and the exact quote from the résumé that produced the score. The audit trail isn&apos;t a feature — it&apos;s the product.
        </p>
      </Section>

      <Section label="How a candidate is screened">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <Move n="01" verb="Receive" detail="PDF or structured submission. Pinned to a role and rubric version at intake." />
          <Move n="02" verb="Score" detail="Each criterion scored independently, 0–5, with a mandatory evidence quote." />
          <Move n="03" verb="Cite" detail="No score ships without a quote. Quotes are rendered inline in the scorecard." />
          <Move n="04" verb="Decide" detail="Advance / hold / reject with the rubric passing line shown on the card." />
          <Move n="05" verb="Audit" detail="Every decision exported to the audit log with rubric hash and model version." />
        </ol>
      </Section>

      <Section label="Three things only Axon does">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature title="Rubric-first, not LLM-first." body="The rubric decides what matters. The model reads and cites. Changing the rubric is a deliberate act — versioned, logged, pinned." />
          <Feature title="Quote on every score." body="No score is a number alone. Every number has a quoted sentence from the candidate&apos;s submission next to it." />
          <Feature title="Audit trail by default." body="Not a feature flag. Every advance or rejection ships with its rubric version, its prompt version, its quotes, and its timestamp." />
        </div>
      </Section>

      <Section label="Made for">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[14px] leading-[1.65] text-ink-2">
          <Persona title="The hiring manager">Cares about the top of the pipeline being honest. Can point to the rubric when asked why a candidate didn&apos;t advance.</Persona>
          <Persona title="The recruiter">Needs to screen fifty résumés and keep every decision defensible. Axon makes the cited quote a requirement, not an afterthought.</Persona>
          <Persona title="The head of people">Owns compliance. Runs audits quarterly. Wants the screening log to look the same shape every time.</Persona>
        </ul>
      </Section>

      <Section label="Roles open this week" right={<Link href="/app" className="mono text-[11px] text-ink-3 hover:text-ink transition-colors">all pipelines →</Link>}>
        <ul className="border-y border-line divide-y divide-line">
          {rolesRow.map((r) => (
            <li key={r.id}>
              <Link href={`/app`} className="group grid grid-cols-[auto_1fr_auto] gap-5 py-4 items-baseline hover:bg-paper-2/40 transition-colors px-1">
                <span className="mono text-[10px] tracking-[0.14em] text-ink-3">{r.dept.toUpperCase()}</span>
                <div>
                  <div className="display text-[18px] text-ink leading-tight">{r.name}.</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{r.openedAt} · {r.hiringManager}</div>
                </div>
                <span className="mono text-[10.5px] text-ink-3 group-hover:text-ink">open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <section className="mx-auto max-w-[1120px] px-6 md:px-10 py-16">
        <blockquote className="border-l-2 pl-6 max-w-[60ch]" style={{ borderColor: "var(--accent, #c2502d)" }}>
          <p className="display-italic text-[28px] leading-[1.3] text-ink md:text-[34px]">
            &ldquo;I can show a candidate, in one page, exactly why they advanced — with the sentence from their résumé that got them there.&rdquo;
          </p>
          <footer className="mt-4 smallcaps mono text-[11px] text-ink-3 tracking-[0.14em]">
            — A. Mehta · hiring manager · &lt;pilot · not a customer&gt;
          </footer>
        </blockquote>
      </section>

      <Section label="Questions">
        <dl className="divide-y divide-line border-y border-line">
          <Faq q="How is this different from an ATS?">Your ATS stores résumés. Axon scores them. Axon writes to your ATS, not around it.</Faq>
          <Faq q="Is this fair / EEOC-safe?">Axon does not score protected characteristics. Every scored criterion is typed and auditable. Bias testing is done per-rubric; reports are exportable.</Faq>
          <Faq q="Can we customize the rubric?">Yes. Rubrics are versioned text. Every edit bumps the version; prior versions stay inspectable.</Faq>
          <Faq q="Does the candidate see their score?">Only if you publish it. The evidence-quoted scorecard is designed to be sharable with candidates when appropriate.</Faq>
          <Faq q="What happens on low-confidence scores?">Flagged in amber. Recruiters are prompted to review before the candidate advances.</Faq>
        </dl>
      </Section>

      <section className="border-t-2 border-ink">
        <div className="mx-auto max-w-[1120px] px-6 md:px-10 py-20 text-center">
          <div className="label">Next résumé</div>
          <h2 className="display mt-3 text-[40px] leading-[1.05] tracking-[-0.02em] text-ink md:text-[54px]">
            Screened.{" "}
            <span className="display-italic" style={{ color: "var(--accent, #c2502d)" }}>
              And defensible.
            </span>
          </h2>
          <div className="mt-8">
            <Link href="/app" className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[14px] rounded-[4px] hover:bg-ink-2 transition-colors">
              Open the pipeline
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Section({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mx-auto max-w-[1120px] px-6 md:px-10 py-16">
        <div className="flex items-baseline justify-between border-b border-line pb-3 mb-8">
          <span className="label">{label}</span>
          {right}
        </div>
        {children}
      </div>
    </section>
  );
}
function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="display text-[28px] leading-none tabular-nums text-ink md:text-[32px]">{n}</div>
      <div className="mt-2 text-[11.5px] leading-[1.45] text-ink-3 max-w-[28ch]">{label}</div>
    </div>
  );
}
function Move({ n, verb, detail }: { n: string; verb: string; detail: string }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 items-baseline">
      <span className="mono text-[11px] text-ink-3 tabular-nums tracking-[0.16em]">{n}</span>
      <div>
        <div className="display text-[22px] leading-none text-ink">{verb}.</div>
        <div className="mt-1 text-[13.5px] leading-[1.6] text-ink-2 max-w-[40ch]">{detail}</div>
      </div>
    </li>
  );
}
function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="display text-[20px] leading-[1.2] text-ink">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-[1.65] text-ink-2 max-w-[36ch]">{body}</p>
    </div>
  );
}
function Persona({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="border-t-2 border-ink pt-3">
      <div className="display text-[18px] leading-tight text-ink">{title}</div>
      <p className="mt-2 max-w-[36ch]">{children}</p>
    </li>
  );
}
function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-10 py-5">
      <dt className="display text-[17px] text-ink leading-tight">{q}</dt>
      <dd className="text-[14px] leading-[1.7] text-ink-2 max-w-[62ch]">{children}</dd>
    </div>
  );
}
