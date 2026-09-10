import { skills, domainTerms, getSkill, getDomainTerm, getCapabilityWorker, shortWorkerName } from "../capabilities/service";
import { constructs } from "../knowledge/data";
import { coverageRow, topics as learningTopics } from "../knowledge/service";
import { events, smes, getEvent, getSME } from "./data";
import type { KnowledgeItemSummary, KnowledgeItemType } from "./types";

export { events, smes, getEvent, getSME };

// ---------------------------------------------------------------------------
// Cross-reference into the Learning module: resolve a Knowledge item to the
// construct(s) it's been observed against, purely by exact name match — no
// data is duplicated, and items with no observed construct report
// "Not measured" rather than a fabricated number (spec §37).
// ---------------------------------------------------------------------------

function constructByExactName(name: string) {
  return constructs.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

// Reverse lookup used by the Learning detail panel's "Open knowledge" link —
// only renders when a real mapping exists (spec §31: no dead links).
export function findKnowledgeItemIdForConstruct(constructId: string): string | null {
  const skill = skills.find((s) => (s.relatedConstructId ?? constructByExactName(s.name)?.id) === constructId);
  if (skill) return skill.id;
  const term = domainTerms.find((t) => constructByExactName(t.term)?.id === constructId);
  if (term) return term.id;
  return null;
}

export interface LearningSignal {
  observationCount: number;
  corroborated: boolean;
  certified: boolean;
  workerCount: number;
  topics: string[];
  label: string;
}

function learningSignalForConstructId(constructId: string | undefined): LearningSignal {
  if (!constructId) return { observationCount: 0, corroborated: false, certified: false, workerCount: 0, topics: [], label: "Not measured" };
  const row = coverageRow(constructId);
  if (!row || row.evidenceCount === 0) {
    return { observationCount: 0, corroborated: false, certified: false, workerCount: 0, topics: [], label: "Not measured" };
  }
  const topicIds = new Set(row.observations.map((o) => o.topicId));
  const topicNames = learningTopics.filter((t) => topicIds.has(t.id)).map((t) => t.name);
  return {
    observationCount: row.evidenceCount,
    corroborated: row.construct.liveStatus === "Corroborated" || row.construct.liveStatus === "Certified" || row.construct.liveStatus === "Published",
    certified: row.construct.liveStatus === "Certified" || row.construct.liveStatus === "Published",
    workerCount: row.workerCount,
    topics: topicNames,
    label: `${row.evidenceCount} observation${row.evidenceCount === 1 ? "" : "s"}`,
  };
}

export function skillLearningSignal(skillId: string): LearningSignal {
  const skill = getSkill(skillId);
  const constructId = skill?.relatedConstructId ?? (skill ? constructByExactName(skill.name)?.id : undefined);
  return learningSignalForConstructId(constructId);
}

export function domainTermLearningSignal(termId: string): LearningSignal {
  const term = getDomainTerm(termId);
  const constructId = term ? constructByExactName(term.term)?.id : undefined;
  return learningSignalForConstructId(constructId);
}

export function eventLearningSignal(eventId: string): LearningSignal {
  const event = getEvent(eventId);
  if (!event) return learningSignalForConstructId(undefined);
  // Events aren't tied to a single construct — approximate with occurrence count.
  return {
    observationCount: event.occurrences,
    corroborated: event.occurrences > 10,
    certified: false,
    workerCount: event.relatedWorkerIds.length,
    topics: event.topics,
    label: `${event.occurrences} occurrence${event.occurrences === 1 ? "" : "s"}`,
  };
}

export function smeLearningSignal(smeId: string): LearningSignal {
  const sme = getSME(smeId);
  if (!sme) return learningSignalForConstructId(undefined);
  return {
    observationCount: sme.contributions,
    corroborated: sme.contributions > 5,
    certified: false,
    workerCount: sme.workerIds.length,
    topics: [],
    label: `${sme.contributions} contribution${sme.contributions === 1 ? "" : "s"}`,
  };
}

function skillTopics(skillId: string): string[] {
  const signal = skillLearningSignal(skillId);
  if (signal.topics.length > 0) return signal.topics;
  const skill = getSkill(skillId);
  return skill ? [skill.name.split("→")[0].trim()] : [];
}

function termTopics(termId: string): string[] {
  const signal = domainTermLearningSignal(termId);
  if (signal.topics.length > 0) return signal.topics;
  const term = getDomainTerm(termId);
  return term ? [term.domainGroup] : [];
}

// ---------------------------------------------------------------------------
// Unified repository listing
// ---------------------------------------------------------------------------

export function getAllKnowledgeItems(): KnowledgeItemSummary[] {
  const rows: KnowledgeItemSummary[] = [];
  for (const s of skills) {
    rows.push({ id: s.id, name: s.name, type: "Skill", workerIds: s.workerIds, workersUsingCount: s.workerIds.length, topics: skillTopics(s.id), learningLabel: skillLearningSignal(s.id).label });
  }
  for (const t of domainTerms) {
    rows.push({ id: t.id, name: t.term, type: "Domain Language", workerIds: t.workerIds, workersUsingCount: t.workerIds.length, topics: termTopics(t.id), learningLabel: domainTermLearningSignal(t.id).label });
  }
  for (const e of events) {
    rows.push({ id: e.id, name: e.name, type: "Event", workerIds: e.relatedWorkerIds, workersUsingCount: e.relatedWorkerIds.length, topics: e.topics, learningLabel: eventLearningSignal(e.id).label });
  }
  for (const s of smes) {
    rows.push({ id: s.id, name: s.name, type: "SME", workerIds: s.workerIds, workersUsingCount: s.workerIds.length, topics: [], learningLabel: smeLearningSignal(s.id).label });
  }
  return rows;
}

export function getKnowledgeItemsByType(type: KnowledgeItemType | "All"): KnowledgeItemSummary[] {
  const all = getAllKnowledgeItems();
  return type === "All" ? all : all.filter((r) => r.type === type);
}

export function searchKnowledgeItems(query: string): KnowledgeItemSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllKnowledgeItems();
  return getAllKnowledgeItems().filter((r) => r.name.toLowerCase().includes(q));
}

export function knowledgeItemWorkerNames(item: { type: KnowledgeItemType; id: string }): string[] {
  let workerIds: string[] = [];
  if (item.type === "Skill") workerIds = getSkill(item.id)?.workerIds ?? [];
  else if (item.type === "Domain Language") workerIds = getDomainTerm(item.id)?.workerIds ?? [];
  else if (item.type === "Event") workerIds = getEvent(item.id)?.relatedWorkerIds ?? [];
  else if (item.type === "SME") workerIds = getSME(item.id)?.workerIds ?? [];
  return workerIds.map((id) => getCapabilityWorker(id)).filter((w): w is NonNullable<typeof w> => !!w).map((w) => shortWorkerName(w.name));
}

export function knowledgeTypeCounts(): Record<KnowledgeItemType | "All", number> {
  const all = getAllKnowledgeItems();
  const base: Record<string, number> = { All: all.length, Skill: 0, "Domain Language": 0, Event: 0, SME: 0, Concept: 0, Pattern: 0, Rule: 0 };
  for (const r of all) base[r.type] += 1;
  return base as Record<KnowledgeItemType | "All", number>;
}

// ---------------------------------------------------------------------------
// Detail view — relationships, evidence, and recent observations for a
// single Knowledge item.
// ---------------------------------------------------------------------------

export interface KnowledgeItemDetail {
  id: string;
  name: string;
  type: KnowledgeItemType;
  description: string;
  status: string;
  workerNames: string[];
  topics: string[];
  relatedDomainLanguage: { id: string; name: string }[];
  relatedEvents: { id: string; name: string }[];
  relatedSMEs: { id: string; name: string }[];
  relatedSkills: { id: string; name: string }[];
  learning: LearningSignal;
  recentObservations: { id: string; summary: string; recordedAt: string; outcome: string }[];
  candidateKnowledge: { id: string; claim: string; status: string } | null;
  certifiedKnowledge: { name: string } | null;
  learningFocusId: string | null;
}

function recentObservationsForConstruct(constructId: string | undefined, limit = 5) {
  if (!constructId) return [];
  const row = coverageRow(constructId);
  if (!row) return [];
  return [...row.observations]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, limit)
    .map((o) => ({ id: o.id, summary: o.summary, recordedAt: o.recordedAt, outcome: o.outcome }));
}

function candidateAndCertifiedFor(constructId: string | undefined) {
  if (!constructId) return { candidateKnowledge: null, certifiedKnowledge: null };
  const row = coverageRow(constructId);
  if (!row) return { candidateKnowledge: null, certifiedKnowledge: null };
  const certified = row.construct.liveStatus === "Certified" || row.construct.liveStatus === "Published";
  return {
    candidateKnowledge: row.candidate ? { id: row.candidate.id, claim: row.candidate.claim, status: row.candidate.status } : null,
    certifiedKnowledge: certified ? { name: row.construct.name } : null,
  };
}

export function getKnowledgeItemDetail(id: string): KnowledgeItemDetail | undefined {
  if (id.startsWith("skill-")) {
    const skill = getSkill(id);
    if (!skill) return undefined;
    const constructId = skill.relatedConstructId ?? constructByExactName(skill.name)?.id;
    const { candidateKnowledge, certifiedKnowledge } = candidateAndCertifiedFor(constructId);
    const relatedTerms = domainTerms.filter((t) => t.skillIds.includes(id)).slice(0, 8);
    const relatedSkills = skills
      .filter((s) => s.id !== id && s.evaluationIds.some((eid) => skill.evaluationIds.includes(eid)))
      .slice(0, 4);
    return {
      id: skill.id,
      name: skill.name,
      type: "Skill",
      description: skill.description,
      status: skill.status,
      workerNames: knowledgeItemWorkerNames({ type: "Skill", id }),
      topics: skillTopics(id),
      relatedDomainLanguage: relatedTerms.map((t) => ({ id: t.id, name: t.term })),
      relatedEvents: events.filter((e) => e.relatedSkillIds.includes(id)).map((e) => ({ id: e.id, name: e.name })),
      relatedSMEs: smes.filter((s) => s.relatedSkillIds.includes(id)).map((s) => ({ id: s.id, name: s.name })),
      relatedSkills: relatedSkills.map((s) => ({ id: s.id, name: s.name })),
      learning: skillLearningSignal(id),
      recentObservations: recentObservationsForConstruct(constructId),
      candidateKnowledge,
      certifiedKnowledge,
      learningFocusId: constructId ?? null,
    };
  }
  if (id.startsWith("term-")) {
    const term = getDomainTerm(id);
    if (!term) return undefined;
    const constructId = constructByExactName(term.term)?.id;
    const { candidateKnowledge, certifiedKnowledge } = candidateAndCertifiedFor(constructId);
    const relatedSkills = skills.filter((s) => term.skillIds.includes(s.id));
    return {
      id: term.id,
      name: term.term,
      type: "Domain Language",
      description: term.description,
      status: `${term.ruleCount} rule${term.ruleCount === 1 ? "" : "s"}`,
      workerNames: knowledgeItemWorkerNames({ type: "Domain Language", id }),
      topics: termTopics(id),
      relatedDomainLanguage: domainTerms.filter((t) => t.id !== id && t.domainGroup === term.domainGroup).slice(0, 6).map((t) => ({ id: t.id, name: t.term })),
      relatedEvents: events.filter((e) => e.relatedSkillIds.some((sid) => term.skillIds.includes(sid))).map((e) => ({ id: e.id, name: e.name })),
      relatedSMEs: smes.filter((s) => s.relatedDomainTermIds.includes(id)).map((s) => ({ id: s.id, name: s.name })),
      relatedSkills: relatedSkills.map((s) => ({ id: s.id, name: s.name })),
      learning: domainTermLearningSignal(id),
      recentObservations: recentObservationsForConstruct(constructId),
      candidateKnowledge,
      certifiedKnowledge,
      learningFocusId: constructId ?? null,
    };
  }
  if (id.startsWith("event-")) {
    const event = getEvent(id);
    if (!event) return undefined;
    const relatedSkills = skills.filter((s) => event.relatedSkillIds.includes(s.id));
    return {
      id: event.id,
      name: event.name,
      type: "Event",
      description: event.description,
      status: event.category,
      workerNames: knowledgeItemWorkerNames({ type: "Event", id }),
      topics: event.topics,
      relatedDomainLanguage: domainTerms.filter((t) => relatedSkills.some((s) => t.skillIds.includes(s.id))).slice(0, 6).map((t) => ({ id: t.id, name: t.term })),
      relatedEvents: events.filter((e) => e.id !== id && e.category === event.category).map((e) => ({ id: e.id, name: e.name })),
      relatedSMEs: smes.filter((s) => s.relatedSkillIds.some((sid) => event.relatedSkillIds.includes(sid))).map((s) => ({ id: s.id, name: s.name })),
      relatedSkills: relatedSkills.map((s) => ({ id: s.id, name: s.name })),
      learning: eventLearningSignal(id),
      recentObservations: [],
      candidateKnowledge: null,
      certifiedKnowledge: null,
      learningFocusId: null,
    };
  }
  if (id.startsWith("sme-")) {
    const sme = getSME(id);
    if (!sme) return undefined;
    const relatedSkills = skills.filter((s) => sme.relatedSkillIds.includes(s.id));
    return {
      id: sme.id,
      name: sme.name,
      type: "SME",
      description: sme.areaOfExpertise,
      status: `${sme.contributions} contribution${sme.contributions === 1 ? "" : "s"}`,
      workerNames: knowledgeItemWorkerNames({ type: "SME", id }),
      topics: [],
      relatedDomainLanguage: domainTerms.filter((t) => sme.relatedDomainTermIds.includes(t.id)).map((t) => ({ id: t.id, name: t.term })),
      relatedEvents: events.filter((e) => e.relatedSkillIds.some((sid) => sme.relatedSkillIds.includes(sid))).map((e) => ({ id: e.id, name: e.name })),
      relatedSMEs: smes.filter((s) => s.id !== id && s.relatedSkillIds.some((sid) => sme.relatedSkillIds.includes(sid))).map((s) => ({ id: s.id, name: s.name })),
      relatedSkills: relatedSkills.map((s) => ({ id: s.id, name: s.name })),
      learning: smeLearningSignal(id),
      recentObservations: [],
      candidateKnowledge: null,
      certifiedKnowledge: null,
      learningFocusId: null,
    };
  }
  return undefined;
}
