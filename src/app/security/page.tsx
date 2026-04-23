import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <MarketingNav />

      <article className="flex-1 px-6 pb-20 pt-10 md:px-10 md:pt-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[220px_1fr] md:gap-20">
          {/* Sticky side */}
          <aside className="md:sticky md:top-12 md:self-start">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
              Architecture
            </div>
            <h1 className="serif mt-3 text-[30px] leading-[1.15] tracking-[-0.02em] text-ink">
              Security &amp;{" "}
              <span className="serif-italic">auditability.</span>
            </h1>
            <nav className="mt-6 space-y-2 text-[12.5px]">
              <a
                href="#pipeline-versioning"
                className="block text-ink-2 hover:text-ink"
              >
                Pipeline versioning
              </a>
              <a
                href="#signed-records"
                className="block text-ink-2 hover:text-ink"
              >
                Signed decision records
              </a>
              <a
                href="#evidence"
                className="block text-ink-2 hover:text-ink"
              >
                Evidence extraction
              </a>
              <a
                href="#exclusions"
                className="block text-ink-2 hover:text-ink"
              >
                Demographic exclusions
              </a>
              <a
                href="#data"
                className="block text-ink-2 hover:text-ink"
              >
                Data handling
              </a>
            </nav>
          </aside>

          {/* Body */}
          <div className="max-w-[720px] space-y-14">
            <Section
              id="pipeline-versioning"
              title="Pipeline versioning"
              body={
                <>
                  <p>
                    Every criterion edit creates a new pipeline version. The
                    version is a cryptographic hash of the ordered graph of
                    nodes and their parameters — including rubric prompts.
                    Candidates scored under one version stay permanently
                    linked to it, even after the rubric evolves.
                  </p>
                  <p className="mt-4">
                    Practically: if you tighten the backend-experience rubric
                    tomorrow, the candidates you rejected today cannot
                    retroactively be re-scored by the new rubric without
                    creating a separate, explicit re-score run. Both runs
                    remain in the audit log side by side.
                  </p>
                  <Monoblock>
                    POST /api/decisions
                    {"\n"}
                    ↳ includes pipeline_version:{" "}
                    <span className="text-[color:var(--accent)]">3a7f9c2</span>
                    {"\n"}
                    ↳ server validates hash against stored graph
                    {"\n"}
                    ↳ record is append-only
                  </Monoblock>
                </>
              }
            />

            <Section
              id="signed-records"
              title="Signed decision records"
              body={
                <>
                  <p>
                    Each decision — advance, hold, reject, or reviewer
                    override — is serialized with:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-2">
                    <Bullet>candidate_id · pipeline_version_id</Bullet>
                    <Bullet>
                      per-criterion scores with evidence snippets (verbatim)
                    </Bullet>
                    <Bullet>
                      pipeline recommendation · reviewer override · reviewer
                      id
                    </Bullet>
                    <Bullet>timestamp</Bullet>
                  </ul>
                  <p className="mt-4">
                    The resulting record is hashed and the hash is stored with
                    the record, making tampering detectable at audit time.
                    Records are append-only — corrections are written as new
                    records, never overwrites.
                  </p>
                </>
              }
            />

            <Section
              id="evidence"
              title="Evidence extraction"
              body={
                <>
                  <p>
                    Every score ships with verbatim snippets from the résumé
                    that support it. The scoring model is prompted to quote
                    rather than paraphrase; quotes shorter than three words or
                    exceeding 320 characters are rejected and re-requested.
                  </p>
                  <p className="mt-4">
                    If a score lacks at least one supporting quote, the score
                    is flagged rather than accepted. This makes{" "}
                    <em>"the model said so"</em> an impossible outcome.
                  </p>
                </>
              }
            />

            <Section
              id="exclusions"
              title="Demographic exclusions"
              body={
                <>
                  <p>
                    Each criterion's generated prompt includes a{" "}
                    <em>do-not-consider</em> list. Default exclusions span
                    name, age, location, school, gender, and any explicit
                    demographic signals. Criterion-specific additions (e.g.,
                    "native-English fluency" on communication criteria) are
                    applied automatically.
                  </p>
                  <p className="mt-4">
                    Exclusions are visible on every criterion card and are
                    recorded in the audit log, so an auditor can verify what
                    was told to be ignored for any past run.
                  </p>
                </>
              }
            />

            <Section
              id="data"
              title="Data handling"
              body={
                <>
                  <p>
                    The pilot runs entirely on Cloudflare: static frontend
                    served from Workers Static Assets, scoring engine on a
                    separate Worker, records persisted in D1 (pilot uses
                    browser localStorage).
                  </p>
                  <p className="mt-4">
                    Résumé PDFs are stored in R2 with per-bucket lifecycle
                    rules. Raw text is never sent to the model in whole;
                    candidate-profile JSON is prepared first and only
                    relevant fields are included in each scoring call.
                  </p>
                </>
              }
            />
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <CTA />
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}

function Section({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-3">
        {title}
      </h2>
      <div className="mt-4 text-[14.5px] leading-[1.75] text-ink">{body}</div>
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

function Monoblock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-card px-4 py-3 font-mono text-[12px] leading-[1.65] text-ink-2 whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function CTA() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-line bg-paper-2 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
      <div>
        <h3 className="serif text-[22px] leading-[1.2] tracking-[-0.015em] text-ink">
          See it in the console.
        </h3>
        <p className="mt-1 text-[13px] text-ink-2">
          Twelve candidates prewired. Click any row and inspect the audit
          chain.
        </p>
      </div>
      <Link
        href="/app"
        className="group flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[13.5px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
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
  );
}
