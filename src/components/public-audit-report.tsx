"use client";

import {
  FileSignature,
  Printer,
  Quote,
  RefreshCcw,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ScoreBar, ScoreNumber } from "@/components/score-bar";
import { StatusPill } from "@/components/status-pill";
import { formatRelative, type AuditEntry } from "@/lib/audit-log";
import { decodeShareable } from "@/lib/share";

export function PublicAuditReport() {
  const searchParams = useSearchParams();
  const c = searchParams.get("c");
  const data = useMemo(() => (c ? decodeShareable(c) : null), [c]);

  if (!c) {
    return <IntroPage />;
  }

  if (!data) {
    return <ErrorState />;
  }

  return (
    <article className="flex-1 px-6 py-10 md:px-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
              <FileSignature className="h-3 w-3" strokeWidth={1.75} />
              <span>Audit receipt</span>
            </div>
            <h1 className="serif mt-2 text-[38px] leading-[1.08] tracking-[-0.025em] text-ink md:text-[44px]">
              {data.candidate.name}
            </h1>
            <p className="mt-2 text-[14px] text-ink-2">
              {data.candidate.headline}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11.5px] text-ink-3">
              <span>{data.candidate.location}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{data.candidate.submittedAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-md border border-line bg-card px-3 py-1.5 text-[12.5px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Role + decision context */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded-xl border border-line bg-paper-2 px-5 py-4">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
              Role
            </div>
            <div className="mt-1 text-[14px] font-medium text-ink">
              {data.role.name}
            </div>
            <div className="mt-0.5 text-[11.5px] text-ink-3">
              {data.role.dept} · Hiring manager: {data.role.hiringManager}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-paper-2 px-5 py-4 md:min-w-[240px]">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
              Decision
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusPill status={data.candidate.status} size="md" />
            </div>
            <div className="mt-1.5 font-mono text-[10.5px] text-ink-3">
              pipeline {data.pipelineVersion} · {data.pipelineHash}
            </div>
          </div>
        </div>

        {/* Résumé summary */}
        <Section title="Résumé summary">
          <p className="text-[13.5px] leading-[1.7] text-ink-2">
            {data.candidate.resumeSummary}
          </p>
        </Section>

        {/* Scores with evidence */}
        <Section title="Scores with evidence">
          <div className="space-y-4">
            {data.criteria.map((crit) => (
              <div
                key={crit.id}
                className="rounded-lg border border-line bg-card"
              >
                <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-line">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-ink">
                      {crit.name}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-ink-3 capitalize font-mono">
                      {crit.type} · strictness {crit.strictness}/5
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px]">
                      <ScoreNumber score={crit.score} />
                    </div>
                    <div className="mt-1 w-[120px]">
                      <ScoreBar score={crit.score} />
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 space-y-3">
                  {crit.evidence.length > 0 ? (
                    <ul className="space-y-2">
                      {crit.evidence.map((ev, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[12.5px] leading-[1.65] text-ink-2"
                        >
                          <Quote
                            className="h-3 w-3 shrink-0 mt-[5px] text-ink-3"
                            strokeWidth={2}
                          />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12px] text-ink-3 italic">
                      No evidence recorded.
                    </p>
                  )}
                  {crit.excludes.length > 0 && (
                    <div className="pt-2 border-t border-line">
                      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-ink-3">
                        Ignored when scoring
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {crit.excludes.map((ex) => (
                          <span
                            key={ex}
                            className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-1.5 py-0.5 text-[10.5px] text-ink-3"
                          >
                            <span
                              aria-hidden
                              className="h-[3px] w-[3px] rounded-full bg-ink-3"
                            />
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Fit gate reasoning */}
        {data.fitGate && (
          <Section title="Fit-gate reasoning">
            <div className="rounded-lg border border-line bg-card px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-ink-2"
                  strokeWidth={2}
                />
                <StatusPill status={data.fitGate.decision} size="md" />
                <span className="font-mono text-[10.5px] text-ink-3 uppercase tracking-[0.14em] ml-1">
                  · pipeline recommendation
                </span>
              </div>
              <p className="mt-3 text-[13.5px] leading-[1.7] text-ink">
                {data.fitGate.reasoning}
              </p>
              <div className="mt-3 font-mono text-[10.5px] text-ink-3 uppercase tracking-[0.14em]">
                {data.fitGate.model} · {formatRelative(data.fitGate.ts)}
              </div>
            </div>
          </Section>
        )}

        {/* Audit trail */}
        {data.entries.length > 0 && (
          <Section title={`Audit trail (${data.entries.length})`}>
            <ol className="relative border-l border-line pl-6 space-y-4">
              {data.entries.map((e) => (
                <li key={e.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[29px] top-2 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-paper"
                  >
                    <EntryDot entry={e} />
                  </span>
                  <EntryLine entry={e} />
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-12 rounded-xl border border-line bg-paper-2 px-5 py-4">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-ink-3">
            Signing
          </div>
          <div className="mt-1.5 font-mono text-[12.5px] text-ink-2 break-all">
            pipeline {data.pipelineVersion} · hash {data.pipelineHash} ·
            exported{" "}
            {new Date(data.exportedAt).toISOString()}
          </div>
          <p className="mt-2 text-[11.5px] leading-[1.65] text-ink-3">
            This receipt was produced by Axon's pipeline. Every score is
            backed by verbatim résumé evidence; every decision is traceable
            to the pipeline version hash above. For the live console,{" "}
            <Link href="/app" className="underline hover:text-ink-2">
              open Axon
            </Link>
            .
          </p>
        </div>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-3">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EntryDot({ entry }: { entry: AuditEntry }) {
  if (entry.kind === "fitgate")
    return <ShieldCheck className="h-3 w-3 text-ink-2" strokeWidth={2} />;
  if (entry.kind === "rescore")
    return <RefreshCcw className="h-3 w-3 text-ink-2" strokeWidth={2} />;
  return <UserCog className="h-3 w-3 text-ink-2" strokeWidth={2} />;
}

function EntryLine({ entry }: { entry: AuditEntry }) {
  const meta = (
    <div className="mt-1 font-mono text-[10.5px] text-ink-3">
      {formatRelative(entry.ts)} · by {entry.reviewer} · {entry.pipelineHash}
    </div>
  );

  if (entry.kind === "fitgate") {
    return (
      <div>
        <div className="flex items-center gap-2 text-[12.5px] text-ink">
          <span className="font-medium">Fit gate</span>
          <span aria-hidden className="text-ink-3">
            →
          </span>
          <StatusPill status={entry.decision} size="sm" />
        </div>
        <p className="mt-1.5 text-[12px] leading-[1.65] text-ink-2">
          {entry.reasoning}
        </p>
        {meta}
      </div>
    );
  }
  if (entry.kind === "rescore") {
    return (
      <div>
        <div className="flex items-center gap-2 text-[12.5px] text-ink">
          <span className="font-medium">Re-scored · {entry.criterionId}</span>
          <span className="font-mono text-ink-3 tabular-nums">
            {entry.previousScore.toFixed(1)}
          </span>
          <span aria-hidden className="text-ink-3">
            →
          </span>
          <span className="font-mono tabular-nums">
            {entry.newScore.toFixed(1)}
          </span>
        </div>
        {meta}
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-2 text-[12.5px] text-ink flex-wrap">
        <span className="font-medium">Reviewer override</span>
        <StatusPill status={entry.from} size="sm" />
        <span aria-hidden className="text-ink-3">
          →
        </span>
        <StatusPill status={entry.to} size="sm" />
      </div>
      {meta}
    </div>
  );
}

function IntroPage() {
  return (
    <div className="flex-1 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-3">
          <FileSignature className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <h1 className="serif text-[32px] leading-[1.15] tracking-[-0.02em] text-ink md:text-[40px]">
          An audit receipt lives at this URL.
        </h1>
        <p className="mt-4 text-[14px] leading-[1.7] text-ink-2">
          Append <span className="font-mono text-[12px]">?c=…</span> to this
          page to render a candidate's full audit trail — rubric, evidence,
          pipeline recommendation, and every state transition signed with a
          pipeline version hash. Generate a shareable link from the Audit tab
          inside the console.
        </p>
        <div className="mt-6">
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[13.5px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
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
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex-1 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="serif text-[26px] leading-[1.2] text-ink">
          This receipt link is invalid.
        </h1>
        <p className="mt-3 text-[13px] leading-[1.65] text-ink-2">
          The encoded data in the URL couldn't be decoded. This can happen if
          the link was truncated, modified, or belongs to an older pipeline
          version that we no longer parse.
        </p>
        <div className="mt-6">
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-4 py-2 text-[13px] text-ink-2 hover:border-ink-3 hover:text-ink transition-colors"
          >
            <span>Open the console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
