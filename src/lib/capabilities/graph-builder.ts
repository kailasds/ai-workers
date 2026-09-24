import {
  getCapabilityWorker,
  skillsForWorker,
  domainTermsForWorker,
  evaluationsForWorker,
  modelsForWorker,
  agentsForWorker,
  toolsForWorker,
  policiesForWorker,
  connectorsForWorker,
  capabilitiesForWorker,
  workflowsForWorker,
  getSkill,
  getAgent,
  getTool,
  getEvaluation,
  getModel,
  getCapability,
  getWorkflow,
  getDomainTerm,
  workerBrainInventory,
  domainTerms,
  skills,
  agents,
  capabilities,
  workflows,
} from "./service";
import type { CapabilityGraphData, CapabilityGraphNode, CapabilityGraphEdge, BrainCategoryKey } from "./graph-types";
import { categoryLabel, primaryCategories, secondaryCategories } from "./graph-types";

export function nodeKey(kind: string, refId: string): string {
  return `${kind}:${refId}`;
}
export function kindOf(nodeId: string): string {
  return nodeId.split(":")[0];
}
export function refOf(nodeId: string): string {
  return nodeId.slice(nodeId.indexOf(":") + 1);
}

const categoryCountFns: Record<BrainCategoryKey, (workerId: string) => number> = {
  skills: (w) => skillsForWorker(w).length,
  domainLanguage: (w) => domainTermsForWorker(w).length,
  evaluations: (w) => evaluationsForWorker(w).length,
  models: (w) => modelsForWorker(w).length,
  agents: (w) => agentsForWorker(w).length,
  tools: (w) => toolsForWorker(w).length,
  policies: (w) => policiesForWorker(w).length,
  connectors: (w) => connectorsForWorker(w).length,
  capabilities: (w) => capabilitiesForWorker(w).length,
  workflows: (w) => workflowsForWorker(w).length,
};

function categoryChildren(category: BrainCategoryKey, workerId: string): { kind: string; refId: string; label: string; subtitle: string }[] {
  switch (category) {
    case "skills":
      return skillsForWorker(workerId).map((s) => ({ kind: "skill", refId: s.id, label: s.name, subtitle: s.status }));
    case "domainLanguage":
      return domainTermsForWorker(workerId).map((t) => ({ kind: "domainLanguage", refId: t.id, label: t.term, subtitle: `${t.ruleCount} rule${t.ruleCount === 1 ? "" : "s"}` }));
    case "evaluations":
      return evaluationsForWorker(workerId).map((e) => ({ kind: "evaluation", refId: e.id, label: e.name, subtitle: e.hardGate ? "Hard gate" : "Advisory" }));
    case "models":
      return modelsForWorker(workerId).map((m) => ({ kind: "model", refId: m.id, label: m.name, subtitle: m.purpose }));
    case "agents":
      return agentsForWorker(workerId).map((a) => ({ kind: "agent", refId: a.id, label: a.name, subtitle: a.status }));
    case "tools":
      return toolsForWorker(workerId).map((t) => ({ kind: "tool", refId: t.id, label: t.name, subtitle: t.category }));
    case "policies":
      return policiesForWorker(workerId).map((p) => ({ kind: "policy", refId: p.id, label: p.name, subtitle: p.status }));
    case "connectors":
      return connectorsForWorker(workerId).map((c) => ({ kind: "connector", refId: c.id, label: c.name, subtitle: c.status }));
    case "capabilities":
      return capabilitiesForWorker(workerId).map((c) => ({ kind: "capability", refId: c.id, label: c.name, subtitle: c.status }));
    case "workflows":
      return workflowsForWorker(workerId).map((w) => ({ kind: "workflow", refId: w.id, label: w.name, subtitle: w.status }));
  }
}

export function buildWorkerCapabilityGraph(workerId: string, expandedIds: Set<string>): CapabilityGraphData {
  const worker = getCapabilityWorker(workerId);
  if (!worker) return { nodes: [], edges: [] };

  const nodes: CapabilityGraphNode[] = [];
  const edges: CapabilityGraphEdge[] = [];
  const inventory = workerBrainInventory(workerId);

  nodes.push({ id: nodeKey("worker", workerId), kind: "worker", label: worker.name, refId: workerId, data: { worker, inventory } });

  const allCategories: BrainCategoryKey[] = [...primaryCategories, ...secondaryCategories];
  for (const cat of allCategories) {
    const count = categoryCountFns[cat](workerId);
    if (count === 0) continue;
    const catNodeId = nodeKey("brainCategory", `${workerId}:${cat}`);
    nodes.push({
      id: catNodeId,
      kind: "brainCategory",
      label: categoryLabel[cat],
      refId: cat,
      data: { category: cat, count, primary: primaryCategories.includes(cat), workerId },
    });
    edges.push({ id: `e-${catNodeId}`, source: nodeKey("worker", workerId), target: catNodeId, label: "has" });

    if (!expandedIds.has(catNodeId)) continue;

    for (const child of categoryChildren(cat, workerId)) {
      const childId = nodeKey(child.kind, child.refId);
      if (!nodes.some((n) => n.id === childId)) {
        nodes.push({ id: childId, kind: child.kind as CapabilityGraphNode["kind"], label: child.label, refId: child.refId, data: { subtitle: child.subtitle } });
      }
      edges.push({ id: `e-${catNodeId}-${childId}`, source: catNodeId, target: childId, label: "registers" });

      if (expandedIds.has(childId)) {
        const deps = getCapabilityDependencies(childId);
        for (const dn of deps.nodes) if (!nodes.some((n) => n.id === dn.id)) nodes.push(dn);
        for (const de of deps.edges) if (!edges.some((e) => e.id === de.id)) edges.push(de);
      }
    }
  }

  return { nodes, edges };
}

export function getCapabilityDependencies(nodeId: string): CapabilityGraphData {
  const kind = kindOf(nodeId);
  const ref = refOf(nodeId);
  const nodes: CapabilityGraphNode[] = [];
  const edges: CapabilityGraphEdge[] = [];

  function addAgent(agentId: string, fromId: string) {
    const a = getAgent(agentId);
    if (!a) return;
    const id = nodeKey("agent", a.id);
    nodes.push({ id, kind: "agent", label: a.name, refId: a.id, data: { subtitle: a.status } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "uses" });
  }
  function addTool(toolId: string, fromId: string) {
    const t = getTool(toolId);
    if (!t) return;
    const id = nodeKey("tool", t.id);
    nodes.push({ id, kind: "tool", label: t.name, refId: t.id, data: { subtitle: t.category } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "uses" });
  }
  function addEvaluation(evalId: string, fromId: string) {
    const e = getEvaluation(evalId);
    if (!e) return;
    const id = nodeKey("evaluation", e.id);
    nodes.push({ id, kind: "evaluation", label: e.name, refId: e.id, data: { subtitle: e.hardGate ? "Hard gate" : "Advisory" } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "measured by" });
  }
  function addModel(modelId: string, fromId: string) {
    const m = getModel(modelId);
    if (!m) return;
    const id = nodeKey("model", m.id);
    nodes.push({ id, kind: "model", label: m.name, refId: m.id, data: { subtitle: m.purpose } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "runs on" });
  }
  function addSkill(skillId: string, fromId: string) {
    const s = getSkill(skillId);
    if (!s) return;
    const id = nodeKey("skill", s.id);
    nodes.push({ id, kind: "skill", label: s.name, refId: s.id, data: { subtitle: s.status } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "requires" });
  }
  function addCapability(capId: string, fromId: string) {
    const c = getCapability(capId);
    if (!c) return;
    const id = nodeKey("capability", c.id);
    nodes.push({ id, kind: "capability", label: c.name, refId: c.id, data: { subtitle: c.status } });
    edges.push({ id: `e-dep-${fromId}-${id}`, source: fromId, target: id, label: "composes" });
  }
  if (kind === "skill") {
    const s = getSkill(ref);
    if (s) {
      for (const aid of s.agentIds) addAgent(aid, nodeId);
      for (const tid of s.toolIds) addTool(tid, nodeId);
      for (const eid of s.evaluationIds) addEvaluation(eid, nodeId);
    }
  } else if (kind === "agent") {
    const a = getAgent(ref);
    if (a) {
      for (const tid of a.toolIds) addTool(tid, nodeId);
      if (a.modelId) addModel(a.modelId, nodeId);
    }
  } else if (kind === "capability") {
    const c = getCapability(ref);
    if (c) for (const sid of c.skillIds) addSkill(sid, nodeId);
  } else if (kind === "workflow") {
    const w = getWorkflow(ref);
    if (w) for (const cid of w.capabilityIds) addCapability(cid, nodeId);
  } else if (kind === "domainLanguage") {
    const t = getDomainTerm(ref);
    if (t) for (const sid of t.skillIds) addSkill(sid, nodeId);
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Trace Composition — how does the Worker actually do this?
// ---------------------------------------------------------------------------

function resolveRepresentativeSkill(kind: string, refId: string) {
  if (kind === "skill") return getSkill(refId);
  if (kind === "agent") return skills.find((s) => s.agentIds.includes(refId));
  if (kind === "tool") return skills.find((s) => s.toolIds.includes(refId));
  if (kind === "evaluation") return skills.find((s) => s.evaluationIds.includes(refId));
  if (kind === "capability") {
    const cap = getCapability(refId);
    return cap ? getSkill(cap.skillIds[0]) : undefined;
  }
  if (kind === "workflow") {
    const wf = getWorkflow(refId);
    const cap = wf ? getCapability(wf.capabilityIds[0]) : undefined;
    return cap ? getSkill(cap.skillIds[0]) : undefined;
  }
  if (kind === "domainLanguage") {
    const t = getDomainTerm(refId);
    return t ? getSkill(t.skillIds[0]) : undefined;
  }
  if (kind === "worker") return skillsForWorker(refId)[0];
  return undefined;
}

export function buildCapabilityTrace(nodeId: string): CapabilityGraphData {
  const kind = kindOf(nodeId);
  const ref = refOf(nodeId);
  const nodes: CapabilityGraphNode[] = [];
  const edges: CapabilityGraphEdge[] = [];

  const skill = resolveRepresentativeSkill(kind, ref);
  if (!skill) return { nodes, edges };

  const workerId = kind === "worker" ? ref : skill.workerIds[0];
  const worker = workerId ? getCapabilityWorker(workerId) : undefined;
  if (!worker) return { nodes, edges };

  const capability = capabilities.find((c) => c.skillIds.includes(skill.id) && c.workerIds.includes(worker.id));
  const agent = skill.agentIds[0] ? getAgent(skill.agentIds[0]) : undefined;
  const tool = agent?.toolIds[0] ? getTool(agent.toolIds[0]) : skill.toolIds[0] ? getTool(skill.toolIds[0]) : undefined;
  const evaluation = skill.evaluationIds[0] ? getEvaluation(skill.evaluationIds[0]) : undefined;

  const workerNodeId = nodeKey("worker", worker.id);
  nodes.push({ id: workerNodeId, kind: "worker", label: worker.name, refId: worker.id, data: {} });

  let prev = workerNodeId;
  if (capability) {
    const id = nodeKey("capability", capability.id);
    nodes.push({ id, kind: "capability", label: capability.name, refId: capability.id, data: { subtitle: capability.status } });
    edges.push({ id: `e-trace-${prev}-${id}`, source: prev, target: id, label: "composes" });
    prev = id;
  }

  const skillNodeId = nodeKey("skill", skill.id);
  nodes.push({ id: skillNodeId, kind: "skill", label: skill.name, refId: skill.id, data: { subtitle: skill.status } });
  edges.push({ id: `e-trace-${prev}-${skillNodeId}`, source: prev, target: skillNodeId, label: "requires" });
  prev = skillNodeId;

  if (agent) {
    const id = nodeKey("agent", agent.id);
    nodes.push({ id, kind: "agent", label: agent.name, refId: agent.id, data: { subtitle: agent.status } });
    edges.push({ id: `e-trace-${prev}-${id}`, source: prev, target: id, label: "performed by" });
    prev = id;
  }

  if (tool) {
    const id = nodeKey("tool", tool.id);
    nodes.push({ id, kind: "tool", label: tool.name, refId: tool.id, data: { subtitle: tool.category } });
    edges.push({ id: `e-trace-${prev}-${id}`, source: prev, target: id, label: "uses" });
    prev = id;
  }

  if (evaluation) {
    const id = nodeKey("evaluation", evaluation.id);
    nodes.push({ id, kind: "evaluation", label: evaluation.name, refId: evaluation.id, data: { subtitle: evaluation.hardGate ? "Hard gate" : "Advisory" } });
    edges.push({ id: `e-trace-${prev}-${id}`, source: prev, target: id, label: "measured by" });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface CapabilitySearchResult {
  id: string;
  kind: string;
  label: string;
  workerId?: string;
}

export function searchCapabilities(query: string): CapabilitySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: CapabilitySearchResult[] = [];

  const push = (kind: string, refId: string, label: string, workerIds: string[]) => {
    if (label.toLowerCase().includes(q)) results.push({ id: nodeKey(kind, refId), kind, label, workerId: workerIds[0] });
  };

  for (const s of skills) push("skill", s.id, s.name, s.workerIds);
  for (const t of domainTerms) push("domainLanguage", t.id, t.term, t.workerIds);
  for (const a of agents) push("agent", a.id, a.name, a.workerIds);
  for (const c of capabilities) push("capability", c.id, c.name, c.workerIds);
  for (const w of workflows) push("workflow", w.id, w.name, w.workerIds);

  return results.slice(0, 20);
}
