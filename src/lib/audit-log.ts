"use client";

import type { Candidate } from "@/lib/mock-data";

const STORAGE_DECISIONS = "axon.decisions.v1";
const STORAGE_LOG = "axon.audit.v1";

export type DecisionMap = Record<string, Candidate["status"]>;

export type AuditEntry = {
  id: string;
  ts: number;
  candidateId: string;
  roleId: string;
  from: Candidate["status"];
  to: Candidate["status"];
  reviewer: string;
  pipelineVersion: string;
  pipelineHash: string;
};

const DEFAULT_PIPELINE_VERSION = "v12";
const DEFAULT_PIPELINE_HASH = "3a7f9c2";
const DEFAULT_REVIEWER = "you";

/* Decisions persistence */

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
    /* quota, private mode */
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

export function appendAuditEntry(entry: Omit<AuditEntry, "id" | "ts" | "pipelineVersion" | "pipelineHash" | "reviewer">) {
  if (typeof window === "undefined") return;
  const full: AuditEntry = {
    id: cryptoId(),
    ts: Date.now(),
    pipelineVersion: DEFAULT_PIPELINE_VERSION,
    pipelineHash: DEFAULT_PIPELINE_HASH,
    reviewer: DEFAULT_REVIEWER,
    ...entry,
  };
  const current = loadAuditLog();
  current.unshift(full);
  // Keep bounded to last 500 entries
  const bounded = current.slice(0, 500);
  try {
    window.localStorage.setItem(STORAGE_LOG, JSON.stringify(bounded));
  } catch {
    /* ignore */
  }
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
