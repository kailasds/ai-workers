import { integrationWorkerIds, domainWorkerIds, skills, domainTerms } from "../capabilities/data";
import type { KnowledgeEvent, SME } from "./types";

function skillIdsByName(names: string[]): string[] {
  return names.map((n) => skills.find((s) => s.name === n)?.id).filter((id): id is string => !!id);
}
function termIdsByName(names: string[]): string[] {
  return names.map((n) => domainTerms.find((t) => t.term === n)?.id).filter((id): id is string => !!id);
}

// ---------------------------------------------------------------------------
// Events — first-class Knowledge type (execution/domain events, not UI clicks)
// ---------------------------------------------------------------------------

const eventCatalog: { name: string; description: string; category: string; skills: string[]; workers: string[]; topics: string[]; occurrences: number }[] = [
  {
    name: "Migration Started",
    description: "A Worker began converting a TIBCO BusinessWorks process to Spring Boot.",
    category: "Lifecycle",
    skills: ["TIBCO process analysis"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 47,
  },
  {
    name: "Migration Completed",
    description: "A Worker finished converting a process and produced a candidate Spring Boot service.",
    category: "Lifecycle",
    skills: ["TIBCO → Spring Boot migration", "Service orchestration"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 38,
  },
  {
    name: "Validation Failed",
    description: "An independent validation pass found the converted service did not match source behavior.",
    category: "Quality gate",
    skills: ["Code quality analysis"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 6,
  },
  {
    name: "Evidence Generated",
    description: "A run produced evidence (metrics, DoD checks, or timeline steps) supporting an outcome.",
    category: "Evidence",
    skills: ["Specification extraction"],
    workers: integrationWorkerIds,
    topics: ["Service conversion with tests and traceability"],
    occurrences: 132,
  },
  {
    name: "Evaluation Passed",
    description: "A configured evaluation (e.g. Functional Equivalence, Code Quality) met its threshold.",
    category: "Quality gate",
    skills: ["Code quality analysis"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 94,
  },
  {
    name: "Evaluation Failed",
    description: "A configured evaluation did not meet its threshold and blocked progress.",
    category: "Quality gate",
    skills: ["Code quality analysis"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 11,
  },
  {
    name: "Deployment Completed",
    description: "A validated service was packaged and promoted toward release.",
    category: "Lifecycle",
    skills: ["TIBCO → Spring Boot migration"],
    workers: integrationWorkerIds,
    topics: ["Service conversion"],
    occurrences: 21,
  },
  {
    name: "Regression Detected",
    description: "A previously passing check failed on a subsequent run against the same construct.",
    category: "Quality gate",
    skills: ["Code quality analysis"],
    workers: integrationWorkerIds,
    topics: ["Service conversion with unit tests"],
    occurrences: 4,
  },
];

export const events: KnowledgeEvent[] = eventCatalog.map((e) => ({
  id: `event-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: e.name,
  description: e.description,
  category: e.category,
  relatedWorkerIds: e.workers,
  relatedSkillIds: skillIdsByName(e.skills),
  topics: e.topics,
  occurrences: e.occurrences,
}));

export function getEvent(id: string) {
  return events.find((e) => e.id === id);
}

// ---------------------------------------------------------------------------
// SMEs — subject-matter-expertise resources, distinct from knowledge they
// contribute to or validate.
// ---------------------------------------------------------------------------

const smeCatalog: { name: string; area: string; skills: string[]; terms: string[]; workers: string[]; contributions: number }[] = [
  {
    name: "Integration Architecture",
    area: "TIBCO BusinessWorks process design and service orchestration patterns",
    skills: ["TIBCO process analysis", "TIBCO → Spring Boot migration", "Service orchestration"],
    terms: ["BusinessWorks", "Service orchestration", "Process variable"],
    workers: integrationWorkerIds,
    contributions: 9,
  },
  {
    name: "Java Modernization",
    area: "Spring Boot service design, code quality and test generation standards",
    skills: ["Code quality analysis", "Unit test generation", "Integration test generation"],
    terms: ["Message contract"],
    workers: integrationWorkerIds,
    contributions: 6,
  },
  {
    name: "Messaging Systems",
    area: "JMS delivery guarantees, acknowledgement modes and dead-letter handling",
    skills: ["JMS migration"],
    terms: ["JMS", "JMS delivery guarantee", "Acknowledgement", "Durable subscription", "DLQ", "Redelivery"],
    workers: ["w-36", "w-29", "w-11"],
    contributions: 11,
  },
  {
    name: "Payments Domain",
    area: "Settlement, clearing and regulatory payment processing rules",
    skills: ["Payment instruction mapping", "Settlement reconciliation analysis", "Payments compliance validation"],
    terms: ["Settlement", "Clearing", "Authorization", "Payment instruction", "Reconciliation"],
    workers: [domainWorkerIds.payments],
    contributions: 5,
  },
];

export const smes: SME[] = smeCatalog.map((s) => ({
  id: `sme-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: s.name,
  areaOfExpertise: s.area,
  relatedSkillIds: skillIdsByName(s.skills),
  relatedDomainTermIds: termIdsByName(s.terms),
  workerIds: s.workers,
  contributions: s.contributions,
}));

export function getSME(id: string) {
  return smes.find((s) => s.id === id);
}
