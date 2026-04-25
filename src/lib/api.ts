"use client";

import type { Candidate, Criterion, ScoreCell } from "@/lib/mock-data";

export type ScoreResult = ScoreCell & {
  reasoning: string;
  model: string;
  pipelineVersion: string;
  pipelineHash: string;
};

export async function scoreCandidate(
  candidate: Pick<Candidate, "name" | "headline" | "resumeSummary">,
  criterion: Pick<
    Criterion,
    "name" | "type" | "strictness" | "description" | "excludes"
  >,
  model: "gemini-2.5-flash" | "gemini-2.5-pro" = "gemini-2.5-flash",
): Promise<ScoreResult> {
  const resp = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate, criterion, model }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Score API error ${resp.status}: ${text.slice(0, 200) || "no body"}`,
    );
  }

  const data = (await resp.json()) as {
    score: number;
    evidence: string[];
    reasoning: string;
    model: string;
    pipelineVersion: string;
    pipelineHash: string;
  };

  return data;
}
