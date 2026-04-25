"use client";

import type { Candidate, Criterion, ScoreCell } from "@/lib/mock-data";

export type FitGateDecision = {
  decision: "advance" | "hold" | "reject";
  reasoning: string;
  model: string;
  pipelineVersion: string;
  pipelineHash: string;
};

export async function decideCandidate(
  candidate: Pick<Candidate, "name" | "headline" | "resumeSummary">,
  criteria: {
    name: string;
    type: string;
    strictness: number;
    score: number;
    evidence: string[];
  }[],
  model: "gemini-2.5-flash" | "gemini-2.5-pro" = "gemini-2.5-flash",
): Promise<FitGateDecision> {
  const resp = await fetch("/api/decide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate, criteria, model }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Decide error ${resp.status}: ${text.slice(0, 200) || "no body"}`,
    );
  }
  return (await resp.json()) as FitGateDecision;
}

export type ScoreResult = ScoreCell & {
  reasoning: string;
  model: string;
  pipelineVersion: string;
  pipelineHash: string;
};

export type StreamCallbacks = {
  onStatus?: (phase: string) => void;
  onPartial?: (text: string, total: number) => void;
  onComplete?: (result: ScoreResult) => void;
  onError?: (err: string) => void;
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

  return (await resp.json()) as ScoreResult;
}

export async function scoreCandidateStream(
  candidate: Pick<Candidate, "name" | "headline" | "resumeSummary">,
  criterion: Pick<
    Criterion,
    "name" | "type" | "strictness" | "description" | "excludes"
  >,
  model: "gemini-2.5-flash" | "gemini-2.5-pro" = "gemini-2.5-flash",
  callbacks: StreamCallbacks = {},
  signal?: AbortSignal,
): Promise<ScoreResult> {
  const resp = await fetch("/api/score-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate, criterion, model }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    const msg = `Score stream error ${resp.status}: ${text.slice(0, 200) || "no body"}`;
    callbacks.onError?.(msg);
    throw new Error(msg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final: ScoreResult | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let msg: {
          type: string;
          phase?: string;
          text?: string;
          total?: number;
          data?: ScoreResult;
          error?: string;
        };
        try {
          msg = JSON.parse(trimmed);
        } catch {
          continue;
        }
        if (msg.type === "status" && msg.phase) {
          callbacks.onStatus?.(msg.phase);
        } else if (msg.type === "partial" && msg.text) {
          callbacks.onPartial?.(msg.text, msg.total ?? 0);
        } else if (msg.type === "complete" && msg.data) {
          final = msg.data;
          callbacks.onComplete?.(msg.data);
        } else if (msg.type === "error") {
          const err = msg.error ?? "unknown stream error";
          callbacks.onError?.(err);
          throw new Error(err);
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
  }

  if (!final) throw new Error("stream ended without complete event");
  return final;
}
