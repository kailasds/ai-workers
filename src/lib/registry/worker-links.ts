import { integrationWorkerIds, domainWorkerIds } from "../capabilities/data";

// Maps the canonical Registry worker (AIWorker.id, from src/lib/data.ts) to
// the knowledge/learning-module Worker id(s) (w-36 etc., from
// src/lib/knowledge/data.ts) that record its runs, observations and
// evidence. No data is merged — this is a lookup only, so both models keep
// their own identity and a Worker missing from here just reports
// "Not measured" learning/evaluation evidence rather than an error.
export const aiWorkerToKnowledgeWorkerIds: Record<string, string[]> = {
  "integration-modernization-worker": integrationWorkerIds,
  "claims-review-worker": [domainWorkerIds.claims],
  "underwriting-analyst": [domainWorkerIds.underwriting],
};

export function knowledgeWorkerIdsFor(aiWorkerId: string): string[] {
  return aiWorkerToKnowledgeWorkerIds[aiWorkerId] ?? [];
}

export function primaryKnowledgeWorkerId(aiWorkerId: string): string | null {
  const ids = knowledgeWorkerIdsFor(aiWorkerId);
  return ids[0] ?? null;
}
