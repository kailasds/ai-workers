import { knowledgeWorkerIdsFor, primaryKnowledgeWorkerId } from "./worker-links";
import { observationsForWorker, coverageRow } from "../knowledge/service";
import { skills, domainTerms } from "../capabilities/data";

export interface LearningActivitySummary {
  measured: boolean;
  knowledgeWorkerId: string | null;
  observations: number;
  constructs: number;
  candidateDecisions: number;
}

export function getLearningSummaryForWorker(aiWorkerId: string): LearningActivitySummary {
  const knowledgeIds = knowledgeWorkerIdsFor(aiWorkerId);
  if (knowledgeIds.length === 0) {
    return { measured: false, knowledgeWorkerId: null, observations: 0, constructs: 0, candidateDecisions: 0 };
  }
  const observations = knowledgeIds.flatMap((id) => observationsForWorker(id));
  const constructIds = new Set(observations.map((o) => o.constructId));
  const candidateIds = new Set<string>();
  for (const cid of constructIds) {
    const row = coverageRow(cid);
    if (row?.candidate) candidateIds.add(row.candidate.id);
  }
  return {
    measured: true,
    knowledgeWorkerId: primaryKnowledgeWorkerId(aiWorkerId),
    observations: observations.length,
    constructs: constructIds.size,
    candidateDecisions: candidateIds.size,
  };
}

export interface KnowledgeUsageSummary {
  measured: boolean;
  skillCount: number;
  domainLanguageCount: number;
}

export function getKnowledgeUsageForWorker(aiWorkerId: string): KnowledgeUsageSummary {
  const knowledgeIds = knowledgeWorkerIdsFor(aiWorkerId);
  if (knowledgeIds.length === 0) return { measured: false, skillCount: 0, domainLanguageCount: 0 };
  const skillCount = skills.filter((s) => s.workerIds.some((id) => knowledgeIds.includes(id))).length;
  const domainLanguageCount = domainTerms.filter((t) => t.workerIds.some((id) => knowledgeIds.includes(id))).length;
  return { measured: true, skillCount, domainLanguageCount };
}
