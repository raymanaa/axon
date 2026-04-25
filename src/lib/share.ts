"use client";

import type {
  AuditEntry,
  FitGateResult,
  ScoreOverride,
} from "@/lib/audit-log";
import type { Candidate, Criterion, Role } from "@/lib/mock-data";

/**
 * Shape of a shared audit receipt encoded in the ?c= query param of /audit.
 * Kept intentionally small; if it grows, switch to a signed short-id backed by
 * a store. Pilot uses browser-only URLs.
 */
export type ShareableAudit = {
  v: 1;
  exportedAt: number;
  role: Pick<Role, "id" | "name" | "dept" | "hiringManager">;
  candidate: Pick<
    Candidate,
    "id" | "name" | "headline" | "location" | "submittedAt" | "resumeSummary"
  > & { status: Candidate["status"] };
  criteria: (Pick<
    Criterion,
    "id" | "name" | "type" | "strictness" | "description" | "excludes"
  > & {
    score: number;
    evidence: string[];
  })[];
  fitGate: FitGateResult | null;
  entries: AuditEntry[];
  pipelineVersion: string;
  pipelineHash: string;
};

export function encodeShareable(data: ShareableAudit): string {
  const json = JSON.stringify(data);
  // Use URL-safe base64
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShareable(encoded: string): ShareableAudit | null {
  try {
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    let json: string;
    if (typeof window === "undefined") {
      json = Buffer.from(b64, "base64").toString("utf-8");
    } else {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      json = new TextDecoder().decode(bytes);
    }
    const parsed = JSON.parse(json) as ShareableAudit;
    if (parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildCandidateShare(args: {
  role: Role;
  candidate: Candidate;
  criteria: Criterion[];
  scoreOverrides: Record<string, ScoreOverride>;
  fitGate: FitGateResult | null;
  entries: AuditEntry[];
  effectiveStatus: Candidate["status"];
}): ShareableAudit {
  const {
    role,
    candidate,
    criteria,
    scoreOverrides,
    fitGate,
    entries,
    effectiveStatus,
  } = args;

  const criteriaPayload = criteria.map((crit) => {
    const key = `${candidate.id}:${crit.id}`;
    const override = scoreOverrides[key];
    const fallback = candidate.scores[crit.id];
    return {
      id: crit.id,
      name: crit.name,
      type: crit.type,
      strictness: crit.strictness,
      description: crit.description,
      excludes: crit.excludes,
      score: override?.score ?? fallback?.score ?? 0,
      evidence: override?.evidence ?? fallback?.evidence ?? [],
    };
  });

  return {
    v: 1,
    exportedAt: Date.now(),
    role: {
      id: role.id,
      name: role.name,
      dept: role.dept,
      hiringManager: role.hiringManager,
    },
    candidate: {
      id: candidate.id,
      name: candidate.name,
      headline: candidate.headline,
      location: candidate.location,
      submittedAt: candidate.submittedAt,
      resumeSummary: candidate.resumeSummary,
      status: effectiveStatus,
    },
    criteria: criteriaPayload,
    fitGate,
    entries: entries.filter((e) => e.candidateId === candidate.id),
    pipelineVersion: "v12",
    pipelineHash: "3a7f9c2",
  };
}
