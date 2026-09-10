import {
  workers,
  topics,
  runs as allRuns,
  observations,
  getWorker,
  getObservation,
  getRun,
  getConstructs,
  getConstructLive,
  getCandidateDecisions,
  getCandidateDecisionLive,
  getPacks,
  observationsFor,
  observationsForTopic,
} from "./service";
import { knowledgeUsage } from "./data";
import type { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphEdge, GraphFilters } from "./graph-types";
import { PRIMARY_CONTEXT } from "./graph-types";

export function nodeKey(kind: string, refId: string): string {
  return `${kind}:${refId}`;
}

export function kindOf(nodeId: string): string {
  return nodeId.split(":")[0];
}

export function refOf(nodeId: string): string {
  return nodeId.slice(nodeId.indexOf(":") + 1);
}

function evidenceLabel(runId: string): string {
  const run = getRun(runId);
  if (!run) return "Evidence";
  const metric = run.metrics.find((m) => m.status === "Not measured");
  if (metric) return "Run metrics (partial)";
  return "Run metrics & DoD result";
}

// ---------------------------------------------------------------------------
// Full graph — every entity for the given context, edges fully connected.
// ---------------------------------------------------------------------------

export function buildFullGraph(contextId: string): KnowledgeGraphData {
  if (contextId !== PRIMARY_CONTEXT) return { nodes: [], edges: [] };

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const liveConstructs = getConstructs();
  const liveCandidates = getCandidateDecisions();
  const packs = getPacks();

  for (const w of workers) {
    const obsCount = observations.filter((o) => o.workerId === w.id).length;
    nodes.push({
      id: nodeKey("worker", w.id),
      kind: "worker",
      label: w.name,
      refId: w.id,
      data: { worker: w, observationCount: obsCount },
    });
  }

  for (const t of topics) {
    const obs = observationsForTopic(t.id);
    nodes.push({
      id: nodeKey("topic", t.id),
      kind: "topic",
      label: t.name,
      refId: t.id,
      data: { topic: t, observationCount: obs.length, workerCount: new Set(obs.map((o) => o.workerId)).size },
    });
  }

  for (const c of liveConstructs) {
    const obs = observationsFor(c.id);
    if (obs.length === 0) continue;
    nodes.push({
      id: nodeKey("construct", c.id),
      kind: "construct",
      label: c.name,
      refId: c.id,
      data: { construct: c, observationCount: obs.length, workerCount: new Set(obs.map((o) => o.workerId)).size },
    });
  }

  for (const r of allRuns) {
    const producedObs = observations.filter((o) => o.runId === r.id);
    if (producedObs.length === 0) continue;
    nodes.push({
      id: nodeKey("run", r.id),
      kind: "run",
      label: `Run · ${getWorker(r.workerId)?.name.split("#").pop()?.trim() ?? r.id.slice(0, 6)}`,
      refId: r.id,
      data: { run: r, worker: getWorker(r.workerId) },
    });
    edges.push({
      id: `e-${r.id}-executed`,
      source: nodeKey("worker", r.workerId),
      target: nodeKey("run", r.id),
      relation: "executed",
      label: "executed",
    });
  }

  for (const o of observations) {
    nodes.push({
      id: nodeKey("observation", o.id),
      kind: "observation",
      label: o.summary,
      refId: o.id,
      data: { observation: o, worker: getWorker(o.workerId), run: getRun(o.runId) },
    });
    edges.push({
      id: `e-${o.id}-produced`,
      source: nodeKey("run", o.runId),
      target: nodeKey("observation", o.id),
      relation: "produced",
      label: "produced",
    });
    edges.push({
      id: `e-${o.id}-supports`,
      source: nodeKey("observation", o.id),
      target: nodeKey("construct", o.constructId),
      relation: "supports",
      label: "supports",
    });

    nodes.push({
      id: nodeKey("evidence", o.id),
      kind: "evidence",
      label: evidenceLabel(o.runId),
      refId: o.id,
      data: { observation: o, run: getRun(o.runId) },
    });
    edges.push({
      id: `e-${o.id}-supported_by`,
      source: nodeKey("observation", o.id),
      target: nodeKey("evidence", o.id),
      relation: "supported_by",
      label: "supported by",
    });

    if (o.contradicts) {
      for (const otherId of o.contradicts) {
        const other = getObservation(otherId);
        if (!other) continue;
        edges.push({
          id: `e-${o.id}-contradicts-${otherId}`,
          source: nodeKey("observation", o.id),
          target: nodeKey("observation", otherId),
          relation: "contradicts",
          label: "contradicts",
          contradiction: true,
        });
      }
    }
  }

  for (const cand of liveCandidates) {
    nodes.push({
      id: nodeKey("candidate", cand.id),
      kind: "candidate",
      label: cand.claim,
      refId: cand.id,
      data: { candidate: cand },
    });
    edges.push({
      id: `e-${cand.id}-proposed_as`,
      source: nodeKey("construct", cand.constructId),
      target: nodeKey("candidate", cand.id),
      relation: "proposed_as",
      label: "proposed as",
    });
    for (const obsId of cand.supportingObservationIds) {
      edges.push({
        id: `e-${cand.id}-informs-${obsId}`,
        source: nodeKey("evidence", obsId),
        target: nodeKey("candidate", cand.id),
        relation: "informs",
        label: "informs",
      });
    }
    for (const obsId of cand.contradictingObservationIds) {
      edges.push({
        id: `e-${cand.id}-informs-contra-${obsId}`,
        source: nodeKey("evidence", obsId),
        target: nodeKey("candidate", cand.id),
        relation: "informs",
        label: "contradicts",
        contradiction: true,
      });
    }

    if (cand.liveStatus === "Accepted") {
      const construct = getConstructLive(cand.constructId);
      nodes.push({
        id: nodeKey("certified", cand.id),
        kind: "certified",
        label: `${construct?.name ?? "Knowledge"} — Certified`,
        refId: cand.id,
        data: { candidate: cand, construct },
      });
      edges.push({
        id: `e-${cand.id}-certified_as`,
        source: nodeKey("candidate", cand.id),
        target: nodeKey("certified", cand.id),
        relation: "certified_as",
        label: "certified as",
      });
    }
  }

  for (const p of packs) {
    nodes.push({
      id: nodeKey("pack", p.id),
      kind: "pack",
      label: `${p.name.split("→").pop()?.trim() ?? p.name} · v${p.version}`,
      refId: p.id,
      data: { pack: p },
    });
    for (const itemId of p.knowledgeItemIds) {
      const cand = liveCandidates.find((c) => c.id === itemId);
      if (!cand || cand.liveStatus !== "Accepted") continue;
      edges.push({
        id: `e-${p.id}-included-${itemId}`,
        source: nodeKey("certified", itemId),
        target: nodeKey("pack", p.id),
        relation: "included_in",
        label: "included in",
      });
    }
  }

  for (const u of knowledgeUsage) {
    edges.push({
      id: `e-usage-${u.id}`,
      source: nodeKey("pack", u.packId),
      target: nodeKey("worker", u.workerId),
      relation: "used_by",
      label: "used by",
    });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Landscape mode — topic-centric overview, progressive disclosure.
// ---------------------------------------------------------------------------

export function buildLandscapeGraph(contextId: string): KnowledgeGraphData {
  if (contextId !== PRIMARY_CONTEXT) return { nodes: [], edges: [] };

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const liveConstructs = getConstructs().filter((c) => observationsFor(c.id).length > 0);
  const liveCandidates = getCandidateDecisions();
  const packs = getPacks();

  for (const t of topics) {
    const obs = observationsForTopic(t.id);
    nodes.push({
      id: nodeKey("topic", t.id),
      kind: "topic",
      label: t.name,
      refId: t.id,
      data: { topic: t, observationCount: obs.length, workerCount: new Set(obs.map((o) => o.workerId)).size },
    });
  }

  const contributingWorkerIds = new Set(observations.map((o) => o.workerId));
  for (const w of workers) {
    if (!contributingWorkerIds.has(w.id)) continue;
    const obsCount = observations.filter((o) => o.workerId === w.id).length;
    nodes.push({
      id: nodeKey("worker", w.id),
      kind: "worker",
      label: w.name,
      refId: w.id,
      data: { worker: w, observationCount: obsCount },
    });
    for (const topicId of new Set(observations.filter((o) => o.workerId === w.id).map((o) => o.topicId))) {
      edges.push({
        id: `e-land-${w.id}-${topicId}`,
        source: nodeKey("worker", w.id),
        target: nodeKey("topic", topicId),
        relation: "recorded",
        label: "contributed to",
      });
    }
  }

  for (const c of liveConstructs) {
    nodes.push({
      id: nodeKey("construct", c.id),
      kind: "construct",
      label: c.name,
      refId: c.id,
      data: { construct: c, observationCount: observationsFor(c.id).length, workerCount: new Set(observationsFor(c.id).map((o) => o.workerId)).size },
    });
    for (const topicId of new Set(observationsFor(c.id).map((o) => o.topicId))) {
      edges.push({
        id: `e-land-${c.id}-${topicId}`,
        source: nodeKey("topic", topicId),
        target: nodeKey("construct", c.id),
        relation: "supports",
        label: "surfaced",
      });
    }
  }

  for (const cand of liveCandidates) {
    if (!liveConstructs.some((c) => c.id === cand.constructId)) continue;
    nodes.push({ id: nodeKey("candidate", cand.id), kind: "candidate", label: cand.claim, refId: cand.id, data: { candidate: cand } });
    edges.push({
      id: `e-land-proposed-${cand.id}`,
      source: nodeKey("construct", cand.constructId),
      target: nodeKey("candidate", cand.id),
      relation: "proposed_as",
      label: "proposed as",
    });

    if (cand.liveStatus === "Accepted") {
      const construct = getConstructLive(cand.constructId);
      nodes.push({
        id: nodeKey("certified", cand.id),
        kind: "certified",
        label: `${construct?.name ?? "Knowledge"} — Certified`,
        refId: cand.id,
        data: { candidate: cand, construct },
      });
      edges.push({
        id: `e-land-certified-${cand.id}`,
        source: nodeKey("candidate", cand.id),
        target: nodeKey("certified", cand.id),
        relation: "certified_as",
        label: "certified as",
      });
      for (const p of packs) {
        if (!p.knowledgeItemIds.includes(cand.id)) continue;
        if (!nodes.some((n) => n.id === nodeKey("pack", p.id))) {
          nodes.push({ id: nodeKey("pack", p.id), kind: "pack", label: `${p.name.split("→").pop()?.trim() ?? p.name} · v${p.version}`, refId: p.id, data: { pack: p } });
        }
        edges.push({
          id: `e-land-included-${p.id}-${cand.id}`,
          source: nodeKey("certified", cand.id),
          target: nodeKey("pack", p.id),
          relation: "included_in",
          label: "included in",
        });
      }
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Evidence mode — one construct's full evidentiary picture.
// ---------------------------------------------------------------------------

export function buildEvidenceGraph(contextId: string, focusConstructId: string): KnowledgeGraphData {
  if (contextId !== PRIMARY_CONTEXT) return { nodes: [], edges: [] };

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const construct = getConstructLive(focusConstructId);
  if (!construct) return { nodes, edges };

  nodes.push({ id: nodeKey("construct", construct.id), kind: "construct", label: construct.name, refId: construct.id, data: { construct, observationCount: observationsFor(construct.id).length } });

  const obs = observationsFor(construct.id);
  const seenWorkers = new Set<string>();
  for (const o of obs) {
    nodes.push({ id: nodeKey("observation", o.id), kind: "observation", label: o.summary, refId: o.id, data: { observation: o, worker: getWorker(o.workerId), run: getRun(o.runId) } });
    edges.push({ id: `e-ev-supports-${o.id}`, source: nodeKey("observation", o.id), target: nodeKey("construct", construct.id), relation: "supports", label: "supports" });

    nodes.push({ id: nodeKey("evidence", o.id), kind: "evidence", label: evidenceLabel(o.runId), refId: o.id, data: { observation: o, run: getRun(o.runId) } });
    edges.push({ id: `e-ev-supported_by-${o.id}`, source: nodeKey("observation", o.id), target: nodeKey("evidence", o.id), relation: "supported_by", label: "supported by" });

    if (!seenWorkers.has(o.workerId)) {
      seenWorkers.add(o.workerId);
      const w = getWorker(o.workerId)!;
      nodes.push({ id: nodeKey("worker", w.id), kind: "worker", label: w.name, refId: w.id, data: { worker: w, observationCount: observations.filter((x) => x.workerId === w.id).length } });
    }
    edges.push({ id: `e-ev-recorded-${o.id}`, source: nodeKey("worker", o.workerId), target: nodeKey("observation", o.id), relation: "recorded", label: "recorded" });

    if (o.contradicts) {
      for (const otherId of o.contradicts) {
        edges.push({ id: `e-ev-contra-${o.id}-${otherId}`, source: nodeKey("observation", o.id), target: nodeKey("observation", otherId), relation: "contradicts", label: "contradicts", contradiction: true });
      }
    }
  }

  const candidate = getCandidateDecisions().find((c) => c.constructId === construct.id);
  if (candidate) {
    nodes.push({ id: nodeKey("candidate", candidate.id), kind: "candidate", label: candidate.claim, refId: candidate.id, data: { candidate } });
    edges.push({ id: `e-ev-proposed-${candidate.id}`, source: nodeKey("construct", construct.id), target: nodeKey("candidate", candidate.id), relation: "proposed_as", label: "proposed as" });
    for (const obsId of candidate.supportingObservationIds) {
      edges.push({ id: `e-ev-informs-${candidate.id}-${obsId}`, source: nodeKey("evidence", obsId), target: nodeKey("candidate", candidate.id), relation: "informs", label: "informs" });
    }
    for (const obsId of candidate.contradictingObservationIds) {
      edges.push({ id: `e-ev-informs-contra-${candidate.id}-${obsId}`, source: nodeKey("evidence", obsId), target: nodeKey("candidate", candidate.id), relation: "informs", label: "contradicts", contradiction: true });
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Knowledge flow mode — construct -> certified -> pack -> worker reuse.
// ---------------------------------------------------------------------------

export function buildKnowledgeFlowGraph(contextId: string): KnowledgeGraphData {
  if (contextId !== PRIMARY_CONTEXT) return { nodes: [], edges: [] };

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const liveCandidates = getCandidateDecisions().filter((c) => c.liveStatus === "Accepted");
  const packs = getPacks();

  for (const cand of liveCandidates) {
    const construct = getConstructLive(cand.constructId);
    if (!construct) continue;
    nodes.push({ id: nodeKey("construct", construct.id), kind: "construct", label: construct.name, refId: construct.id, data: { construct } });
    nodes.push({ id: nodeKey("certified", cand.id), kind: "certified", label: `${construct.name} — Certified`, refId: cand.id, data: { candidate: cand, construct } });
    edges.push({ id: `e-flow-certified-${cand.id}`, source: nodeKey("construct", construct.id), target: nodeKey("certified", cand.id), relation: "certified_as", label: "certified as" });

    for (const p of packs) {
      if (!p.knowledgeItemIds.includes(cand.id)) continue;
      if (!nodes.some((n) => n.id === nodeKey("pack", p.id))) {
        nodes.push({ id: nodeKey("pack", p.id), kind: "pack", label: `${p.name.split("→").pop()?.trim() ?? p.name} · v${p.version}`, refId: p.id, data: { pack: p } });
      }
      edges.push({ id: `e-flow-included-${p.id}-${cand.id}`, source: nodeKey("certified", cand.id), target: nodeKey("pack", p.id), relation: "included_in", label: "included in" });

      for (const u of knowledgeUsage.filter((x) => x.packId === p.id)) {
        const w = getWorker(u.workerId);
        if (!w) continue;
        if (!nodes.some((n) => n.id === nodeKey("worker", w.id))) {
          nodes.push({ id: nodeKey("worker", w.id), kind: "worker", label: w.name, refId: w.id, data: { worker: w, observationCount: observations.filter((o) => o.workerId === w.id).length } });
        }
        edges.push({ id: `e-flow-used-${u.id}`, source: nodeKey("pack", p.id), target: nodeKey("worker", w.id), relation: "used_by", label: "used by" });
      }
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Trace — single-strand lineage (backward) and downstream usage (forward).
// ---------------------------------------------------------------------------

function representativeObservationFor(constructId: string): typeof observations[number] | undefined {
  const obs = observationsFor(constructId);
  if (obs.length === 0) return undefined;
  return [...obs].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())[0];
}

export function getLineage(nodeId: string): KnowledgeGraphData {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const kind = kindOf(nodeId);
  const ref = refOf(nodeId);

  let observation: typeof observations[number] | undefined;
  let candidate: ReturnType<typeof getCandidateDecisionLive> | undefined;

  if (kind === "observation" || kind === "evidence") {
    observation = getObservation(ref);
  } else if (kind === "construct") {
    observation = representativeObservationFor(ref);
    candidate = getCandidateDecisions().find((c) => c.constructId === ref);
  } else if (kind === "candidate" || kind === "certified") {
    candidate = getCandidateDecisionLive(ref);
    observation = candidate ? representativeObservationFor(candidate.constructId) : undefined;
  } else if (kind === "pack") {
    const pack = getPacks().find((p) => p.id === ref);
    const certifiedItemId = pack?.knowledgeItemIds.find((id) => getCandidateDecisionLive(id)?.liveStatus === "Accepted");
    candidate = certifiedItemId ? getCandidateDecisionLive(certifiedItemId) : undefined;
    observation = candidate ? representativeObservationFor(candidate.constructId) : undefined;
  }

  if (!observation) return { nodes, edges };

  const run = getRun(observation.runId);
  const worker = getWorker(observation.workerId);
  const construct = getConstructLive(observation.constructId);
  if (!candidate) candidate = getCandidateDecisions().find((c) => c.constructId === observation!.constructId);

  if (worker) nodes.push({ id: nodeKey("worker", worker.id), kind: "worker", label: worker.name, refId: worker.id, data: { worker } });
  if (run) {
    nodes.push({ id: nodeKey("run", run.id), kind: "run", label: `Run · ${worker?.name.split("#").pop()?.trim() ?? run.id.slice(0, 6)}`, refId: run.id, data: { run, worker } });
    if (worker) edges.push({ id: `e-trace-executed-${run.id}`, source: nodeKey("worker", worker.id), target: nodeKey("run", run.id), relation: "executed", label: "executed" });
  }
  nodes.push({ id: nodeKey("observation", observation.id), kind: "observation", label: observation.summary, refId: observation.id, data: { observation, worker, run } });
  if (run) edges.push({ id: `e-trace-produced-${observation.id}`, source: nodeKey("run", run.id), target: nodeKey("observation", observation.id), relation: "produced", label: "produced" });

  nodes.push({ id: nodeKey("evidence", observation.id), kind: "evidence", label: evidenceLabel(observation.runId), refId: observation.id, data: { observation, run } });
  edges.push({ id: `e-trace-supported_by-${observation.id}`, source: nodeKey("observation", observation.id), target: nodeKey("evidence", observation.id), relation: "supported_by", label: "supported by" });

  if (construct) {
    nodes.push({ id: nodeKey("construct", construct.id), kind: "construct", label: construct.name, refId: construct.id, data: { construct } });
    edges.push({ id: `e-trace-supports-${observation.id}`, source: nodeKey("observation", observation.id), target: nodeKey("construct", construct.id), relation: "supports", label: "supports" });
  }

  if (candidate) {
    const liveCand = getCandidateDecisionLive(candidate.id)!;
    nodes.push({ id: nodeKey("candidate", liveCand.id), kind: "candidate", label: liveCand.claim, refId: liveCand.id, data: { candidate: liveCand } });
    edges.push({ id: `e-trace-informs-${liveCand.id}`, source: nodeKey("evidence", observation.id), target: nodeKey("candidate", liveCand.id), relation: "informs", label: "informs" });
    if (construct) edges.push({ id: `e-trace-proposed-${liveCand.id}`, source: nodeKey("construct", construct.id), target: nodeKey("candidate", liveCand.id), relation: "proposed_as", label: "proposed as" });

    if (liveCand.liveStatus === "Accepted") {
      nodes.push({ id: nodeKey("certified", liveCand.id), kind: "certified", label: `${construct?.name ?? "Knowledge"} — Certified`, refId: liveCand.id, data: { candidate: liveCand, construct } });
      edges.push({ id: `e-trace-certified-${liveCand.id}`, source: nodeKey("candidate", liveCand.id), target: nodeKey("certified", liveCand.id), relation: "certified_as", label: "certified as" });

      const pack = getPacks().find((p) => p.knowledgeItemIds.includes(liveCand.id));
      if (pack) {
        nodes.push({ id: nodeKey("pack", pack.id), kind: "pack", label: `${pack.name.split("→").pop()?.trim() ?? pack.name} · v${pack.version}`, refId: pack.id, data: { pack } });
        edges.push({ id: `e-trace-included-${pack.id}`, source: nodeKey("certified", liveCand.id), target: nodeKey("pack", pack.id), relation: "included_in", label: "included in" });
      }
    }
  }

  return { nodes, edges };
}

export function getDownstreamUsage(nodeId: string): KnowledgeGraphData {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const kind = kindOf(nodeId);
  const ref = refOf(nodeId);

  let pack: ReturnType<typeof getPacks>[number] | undefined;

  if (kind === "pack") {
    pack = getPacks().find((p) => p.id === ref);
  } else if (kind === "certified" || kind === "candidate") {
    pack = getPacks().find((p) => p.knowledgeItemIds.includes(ref));
  } else if (kind === "construct") {
    const cand = getCandidateDecisions().find((c) => c.constructId === ref && c.liveStatus === "Accepted");
    pack = cand ? getPacks().find((p) => p.knowledgeItemIds.includes(cand.id)) : undefined;
  }

  if (!pack) return { nodes, edges };

  nodes.push({ id: nodeKey("pack", pack.id), kind: "pack", label: `${pack.name.split("→").pop()?.trim() ?? pack.name} · v${pack.version}`, refId: pack.id, data: { pack } });

  const usage = knowledgeUsage.filter((u) => u.packId === pack!.id).sort((a, b) => new Date(a.retrievedAt).getTime() - new Date(b.retrievedAt).getTime());
  const first = usage[usage.length - 1] ?? usage[0];
  if (!first) return { nodes, edges };

  const worker = getWorker(first.workerId);
  const run = getRun(first.runId);
  if (worker) {
    nodes.push({ id: nodeKey("worker", worker.id), kind: "worker", label: worker.name, refId: worker.id, data: { worker } });
    edges.push({ id: `e-usage-used-${first.id}`, source: nodeKey("pack", pack.id), target: nodeKey("worker", worker.id), relation: "used_by", label: "used by" });
  }
  if (run && worker) {
    nodes.push({ id: nodeKey("run", run.id), kind: "run", label: `Run · ${worker.name.split("#").pop()?.trim() ?? run.id.slice(0, 6)}`, refId: run.id, data: { run, worker } });
    edges.push({ id: `e-usage-executed-${run.id}`, source: nodeKey("worker", worker.id), target: nodeKey("run", run.id), relation: "executed", label: "executed" });

    const producedObs = observations.filter((o) => o.runId === run.id);
    for (const o of producedObs) {
      nodes.push({ id: nodeKey("observation", o.id), kind: "observation", label: o.summary, refId: o.id, data: { observation: o, worker, run } });
      edges.push({ id: `e-usage-produced-${o.id}`, source: nodeKey("run", run.id), target: nodeKey("observation", o.id), relation: "produced", label: "produced" });
    }
  }

  return { nodes, edges };
}

export function mergeGraphs(...graphs: KnowledgeGraphData[]): KnowledgeGraphData {
  const nodeMap = new Map<string, KnowledgeGraphNode>();
  const edgeMap = new Map<string, KnowledgeGraphEdge>();
  for (const g of graphs) {
    for (const n of g.nodes) nodeMap.set(n.id, n);
    for (const e of g.edges) edgeMap.set(e.id, e);
  }
  return { nodes: [...nodeMap.values()], edges: [...edgeMap.values()] };
}

// ---------------------------------------------------------------------------
// Neighbors / filtering / search
// ---------------------------------------------------------------------------

export function getNeighborIds(nodeId: string, edges: KnowledgeGraphEdge[]): Set<string> {
  const ids = new Set<string>();
  for (const e of edges) {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  }
  return ids;
}

export function filterGraph(graph: KnowledgeGraphData, filters: GraphFilters): KnowledgeGraphData {
  let nodes = graph.nodes;

  if (filters.kind !== "all") {
    const kept = new Set(nodes.filter((n) => n.kind === filters.kind).map((n) => n.id));
    const withNeighbors = new Set(kept);
    for (const id of kept) for (const nb of getNeighborIds(id, graph.edges)) withNeighbors.add(nb);
    nodes = nodes.filter((n) => withNeighbors.has(n.id));
  }

  if (filters.worker) {
    nodes = nodes.filter((n) => {
      if (n.kind === "worker") return n.refId === filters.worker;
      const w = (n.data as { worker?: { id: string } }).worker;
      if (w) return w.id === filters.worker;
      return true;
    });
  }

  if (filters.topic) {
    nodes = nodes.filter((n) => {
      if (n.kind === "topic") return n.refId === filters.topic;
      const obs = (n.data as { observation?: { topicId: string } }).observation;
      if (obs) return obs.topicId === filters.topic;
      return true;
    });
  }

  if (filters.lifecycle !== "all") {
    nodes = nodes.filter((n) => {
      if (n.kind === "construct") {
        const c = (n.data as { construct?: { liveStatus?: string } }).construct;
        if (filters.lifecycle === "Contradictory") return false;
        return c?.liveStatus === filters.lifecycle;
      }
      if (n.kind === "candidate" || n.kind === "certified") {
        const cand = (n.data as { candidate?: { liveStatus?: string } }).candidate;
        if (filters.lifecycle === "Contradictory") return cand?.liveStatus === "Contradictory";
        if (filters.lifecycle === "Certified") return cand?.liveStatus === "Accepted";
        return true;
      }
      return true;
    });
  }

  const ids = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  return { nodes, edges };
}

export function searchGraph(query: string): KnowledgeGraphNode[] {
  const full = buildFullGraph(PRIMARY_CONTEXT);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return full.nodes.filter((n) => n.label.toLowerCase().includes(q) || n.refId.toLowerCase().includes(q)).slice(0, 20);
}
