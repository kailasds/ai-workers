import {
  workers,
  skills,
  domainTerms,
  evaluations,
  models,
  agents,
  tools,
  policies,
  connectors,
  capabilities,
  workflows,
  getSkill,
  getAgent,
  getTool,
  getEvaluation,
  getModel,
  getPolicy,
  getConnector,
  getCapability,
  getWorkflow,
  getDomainTerm,
  domainGroupsForWorker,
} from "./data";
import { observationsForWorker, allRuns, getConstructLive } from "../knowledge/service";

export {
  workers,
  skills,
  domainTerms,
  evaluations,
  models,
  agents,
  tools,
  policies,
  connectors,
  capabilities,
  workflows,
  getSkill,
  getAgent,
  getTool,
  getEvaluation,
  getModel,
  getPolicy,
  getConnector,
  getCapability,
  getWorkflow,
  getDomainTerm,
  domainGroupsForWorker,
};

export function getCapabilityWorker(id: string) {
  return workers.find((w) => w.id === id);
}

export function shortWorkerName(name: string): string {
  const match = name.match(/#(\d+)/);
  return match ? `${name.split("·")[0].trim()} #${match[1]}` : name;
}

function forWorker<T extends { workerIds: string[] }>(list: T[], workerId: string): T[] {
  return list.filter((x) => x.workerIds.includes(workerId));
}

export function skillsForWorker(workerId: string) {
  return forWorker(skills, workerId);
}
export function agentsForWorker(workerId: string) {
  return forWorker(agents, workerId);
}
export function toolsForWorker(workerId: string) {
  return forWorker(tools, workerId);
}
export function evaluationsForWorker(workerId: string) {
  return forWorker(evaluations, workerId);
}
export function modelsForWorker(workerId: string) {
  return forWorker(models, workerId);
}
export function policiesForWorker(workerId: string) {
  return forWorker(policies, workerId);
}
export function connectorsForWorker(workerId: string) {
  return forWorker(connectors, workerId);
}
export function capabilitiesForWorker(workerId: string) {
  return forWorker(capabilities, workerId);
}
export function workflowsForWorker(workerId: string) {
  return forWorker(workflows, workerId);
}
export function domainTermsForWorker(workerId: string) {
  return forWorker(domainTerms, workerId);
}

export function workersUsing<T extends { workerIds: string[] }>(entity: T | undefined) {
  if (!entity) return [];
  return entity.workerIds.map((id) => getCapabilityWorker(id)).filter((w): w is NonNullable<typeof w> => !!w);
}

export interface WorkerBrainInventory {
  skills: number;
  domainLanguageRules: number;
  evaluations: number;
  models: number;
  agents: number;
  tools: number;
  policies: number;
  connectors: number;
  capabilities: number;
  workflows: number;
  runs: number;
  observations: number;
  constructs: number;
}

export function workerBrainInventory(workerId: string): WorkerBrainInventory {
  const obs = observationsForWorker(workerId);
  const runCount = allRuns.filter((r) => r.workerId === workerId).length;
  const constructIds = new Set(obs.map((o) => o.constructId));
  const domainRuleCount = domainTermsForWorker(workerId).reduce((sum, t) => sum + t.ruleCount, 0);
  return {
    skills: skillsForWorker(workerId).length,
    domainLanguageRules: domainRuleCount,
    evaluations: evaluationsForWorker(workerId).length,
    models: modelsForWorker(workerId).length,
    agents: agentsForWorker(workerId).length,
    tools: toolsForWorker(workerId).length,
    policies: policiesForWorker(workerId).length,
    connectors: connectorsForWorker(workerId).length,
    capabilities: capabilitiesForWorker(workerId).length,
    workflows: workflowsForWorker(workerId).length,
    runs: runCount,
    observations: obs.length,
    constructs: constructIds.size,
  };
}

export function capabilityLandscapeStats() {
  return {
    workers: workers.length,
    skills: skills.length,
    agents: agents.length,
    tools: tools.length,
    evaluations: evaluations.length,
    connectors: connectors.length,
    policies: policies.length,
    capabilities: capabilities.length,
    workflows: workflows.length,
  };
}

export function skillLearningSignal(skillId: string) {
  const skill = getSkill(skillId);
  if (!skill || !skill.relatedConstructId) return null;
  const construct = getConstructLive(skill.relatedConstructId);
  if (!construct) return null;
  return { construct };
}
