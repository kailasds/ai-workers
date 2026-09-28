import { useSyncExternalStore } from "react";
import { constructs, getCandidate, getConstruct } from "./data";
import type { CandidateStatus } from "./types";

interface Overlay {
  candidateStatus: Record<string, CandidateStatus>;
  candidateHistory: Record<string, { stage: string; at: string; note?: string }[]>;
  constructStatus: Record<string, (typeof constructs)[number]["status"]>;
}

const STORAGE_KEY = "knowledge-hub-overlay";

function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Overlay;
  } catch {
    // ignore — fall through to defaults
  }
  return { candidateStatus: {}, candidateHistory: {}, constructStatus: {} };
}

const overlay: Overlay = loadOverlay();

const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    // storage unavailable — state stays in-memory for this session only
  }
}

function emit() {
  persist();
  for (const l of listeners) l();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return overlay;
}

function nowLabel() {
  return new Date().toISOString();
}

function appendHistory(candidateId: string, stage: string, note?: string) {
  const base = getCandidate(candidateId)?.decisionHistory ?? [];
  const extra = overlay.candidateHistory[candidateId] ?? [];
  overlay.candidateHistory[candidateId] = [...extra, { stage, at: nowLabel(), note }];
  void base;
}

export function currentCandidateStatus(candidateId: string): CandidateStatus {
  return overlay.candidateStatus[candidateId] ?? getCandidate(candidateId)?.status ?? "Pending";
}

export function currentCandidateHistory(candidateId: string) {
  const base = getCandidate(candidateId)?.decisionHistory ?? [];
  return [...base, ...(overlay.candidateHistory[candidateId] ?? [])];
}

export function currentConstructStatus(constructId: string) {
  return overlay.constructStatus[constructId] ?? getConstruct(constructId)?.status ?? "Nothing yet";
}

export function acceptCandidate(candidateId: string) {
  const candidate = getCandidate(candidateId);
  if (!candidate) return;
  overlay.candidateStatus[candidateId] = "Accepted";
  appendHistory(candidateId, "Decision made", "Accepted by platform reviewer.");
  appendHistory(candidateId, "Certification");
  overlay.constructStatus[candidate.constructId] = "Certified";
  emit();
}

export function rejectCandidate(candidateId: string) {
  const candidate = getCandidate(candidateId);
  if (!candidate) return;
  overlay.candidateStatus[candidateId] = "Rejected";
  appendHistory(candidateId, "Decision made", "Rejected by platform reviewer.");
  emit();
}

export function deferCandidate(candidateId: string) {
  const candidate = getCandidate(candidateId);
  if (!candidate) return;
  overlay.candidateStatus[candidateId] = "Deferred";
  appendHistory(candidateId, "Decision made", "Deferred pending additional evidence.");
  emit();
}

export function useKnowledgeOverlayVersion() {
  return useSyncExternalStore(subscribe, () => JSON.stringify(overlay), () => JSON.stringify(overlay));
}
