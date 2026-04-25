"use client";

import type { Candidate } from "@/lib/mock-data";

const STORAGE_DECISIONS = "axon.decisions.v1";
const STORAGE_LOG = "axon.audit.v2";
const STORAGE_SCORES = "axon.scores.v1";
const STORAGE_FITGATE = "axon.fitgate.v1";

export type DecisionMap = Record<string, Candidate["status"]>;

export type ScoreOverride = {
  score: number;
  evidence: string[];
  reasoning?: string;
  model?: string;
  ts: number;
};
/** keyed by `${candidateId}:${criterionId}` */
export type ScoreMap = Record<string, ScoreOverride>;

type BaseEntry = {
  id: string;
  ts: number;
  candidateId: string;
  roleId: string;
  reviewer: string;
  pipelineVersion: string;
  pipelineHash: string;
};

export type DecisionEntry = BaseEntry & {
  kind: "decision";
  from: Candidate["status"];
  to: Candidate["status"];
};

export type RescoreEntry = BaseEntry & {
  kind: "rescore";
  criterionId: string;
  previousScore: number;
  newScore: number;
  model: string;
};

export type FitGateEntry = BaseEntry & {
  kind: "fitgate";
  decision: Exclude<Candidate["status"], "scoring">;
  reasoning: string;
  model: string;
};

export type AuditEntry = DecisionEntry | RescoreEntry | FitGateEntry;

export type FitGateResult = {
  decision: Exclude<Candidate["status"], "scoring">;
  reasoning: string;
  model: string;
  ts: number;
};
export type FitGateMap = Record<string, FitGateResult>;

const DEFAULT_PIPELINE_VERSION = "v12";
const DEFAULT_PIPELINE_HASH = "3a7f9c2";
const DEFAULT_REVIEWER = "you";

/* Decisions */

export function loadDecisions(): DecisionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_DECISIONS);
    return raw ? (JSON.parse(raw) as DecisionMap) : {};
  } catch {
    return {};
  }
}

export function saveDecisions(map: DecisionMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_DECISIONS, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

/* Scores */

export function loadScores(): ScoreMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_SCORES);
    return raw ? (JSON.parse(raw) as ScoreMap) : {};
  } catch {
    return {};
  }
}

export function saveScores(map: ScoreMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_SCORES, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function scoreKey(candidateId: string, criterionId: string): string {
  return `${candidateId}:${criterionId}`;
}

/* Fit gate */

export function loadFitGate(): FitGateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_FITGATE);
    return raw ? (JSON.parse(raw) as FitGateMap) : {};
  } catch {
    return {};
  }
}

export function saveFitGate(map: FitGateMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_FITGATE, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/* Audit log */

export function loadAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_LOG);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: AuditEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_LOG, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function appendDecisionEntry(
  entry: Omit<
    DecisionEntry,
    "id" | "ts" | "kind" | "pipelineVersion" | "pipelineHash" | "reviewer"
  >,
): DecisionEntry | null {
  if (typeof window === "undefined") return null;
  const full: DecisionEntry = {
    id: cryptoId(),
    ts: Date.now(),
    kind: "decision",
    pipelineVersion: DEFAULT_PIPELINE_VERSION,
    pipelineHash: DEFAULT_PIPELINE_HASH,
    reviewer: DEFAULT_REVIEWER,
    ...entry,
  };
  const current = loadAuditLog();
  current.unshift(full);
  persist(current.slice(0, 500));
  return full;
}

export function appendRescoreEntry(
  entry: Omit<
    RescoreEntry,
    "id" | "ts" | "kind" | "pipelineVersion" | "pipelineHash" | "reviewer"
  >,
): RescoreEntry | null {
  if (typeof window === "undefined") return null;
  const full: RescoreEntry = {
    id: cryptoId(),
    ts: Date.now(),
    kind: "rescore",
    pipelineVersion: DEFAULT_PIPELINE_VERSION,
    pipelineHash: DEFAULT_PIPELINE_HASH,
    reviewer: DEFAULT_REVIEWER,
    ...entry,
  };
  const current = loadAuditLog();
  current.unshift(full);
  persist(current.slice(0, 500));
  return full;
}

export function appendFitGateEntry(
  entry: Omit<
    FitGateEntry,
    "id" | "ts" | "kind" | "pipelineVersion" | "pipelineHash" | "reviewer"
  >,
): FitGateEntry | null {
  if (typeof window === "undefined") return null;
  const full: FitGateEntry = {
    id: cryptoId(),
    ts: Date.now(),
    kind: "fitgate",
    pipelineVersion: DEFAULT_PIPELINE_VERSION,
    pipelineHash: DEFAULT_PIPELINE_HASH,
    reviewer: "pipeline",
    ...entry,
  };
  const current = loadAuditLog();
  current.unshift(full);
  persist(current.slice(0, 500));
  return full;
}

export function auditEntriesForCandidate(
  entries: AuditEntry[],
  candidateId: string,
): AuditEntry[] {
  return entries.filter((e) => e.candidateId === candidateId);
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
