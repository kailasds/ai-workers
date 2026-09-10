import { Link } from "react-router-dom";
import { X, Route, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CapabilityGraphNode } from "@/lib/capabilities/graph-types";
import {
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
  getCapabilityWorker,
  workerBrainInventory,
  skillLearningSignal,
  shortWorkerName,
} from "@/lib/capabilities/service";

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">{title}</p>
      {children}
    </div>
  );
}

export function CapabilityDetailPanel({
  node,
  onClose,
  onTrace,
}: {
  node: CapabilityGraphNode;
  onClose: () => void;
  onTrace: (nodeId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">{node.kind === "brainCategory" ? "category" : node.kind}</p>
          <p className="mt-0.5 text-[13.5px] font-bold leading-snug text-ink">{node.label}</p>
        </div>
        <button onClick={onClose} className="shrink-0 grid h-7 w-7 place-items-center rounded-full text-ink-mute hover:bg-card-sunken hover:text-ink">
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5">
        {node.kind === "worker" && <WorkerPanel refId={node.refId} />}
        {node.kind === "skill" && <SkillPanel refId={node.refId} />}
        {node.kind === "domainLanguage" && <DomainTermPanel refId={node.refId} />}
        {node.kind === "evaluation" && <EvaluationPanel refId={node.refId} />}
        {node.kind === "model" && <ModelPanel refId={node.refId} />}
        {node.kind === "agent" && <AgentPanel refId={node.refId} />}
        {node.kind === "tool" && <ToolPanel refId={node.refId} />}
        {node.kind === "policy" && <PolicyPanel refId={node.refId} />}
        {node.kind === "connector" && <ConnectorPanel refId={node.refId} />}
        {node.kind === "capability" && <CapabilityPanel refId={node.refId} />}
        {node.kind === "workflow" && <WorkflowPanel refId={node.refId} />}
        {node.kind === "brainCategory" && (
          <p className="text-[12.5px] text-ink-mute leading-relaxed">Click this category to expand its registered entities.</p>
        )}
      </div>

      {node.kind !== "brainCategory" && (
        <div className="border-t border-border px-4 py-3">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => onTrace(node.id)}>
            <Route className="h-3.5 w-3.5" strokeWidth={2} />
            Trace composition
          </Button>
        </div>
      )}
    </div>
  );
}

function WorkersList({ workerIds }: { workerIds: string[] }) {
  return (
    <p className="text-[12px] text-ink-mute">
      {workerIds
        .map((id) => {
          const w = getCapabilityWorker(id);
          return w ? shortWorkerName(w.name) : undefined;
        })
        .filter(Boolean)
        .join(", ") || "No Workers yet"}
    </p>
  );
}

function WorkerPanel({ refId }: { refId: string }) {
  const worker = getCapabilityWorker(refId);
  const inv = workerBrainInventory(refId);
  if (!worker) return null;
  return (
    <div>
      <PanelSection title="Worker">
        <p className="text-[12.5px] text-ink">{worker.boundedContext}</p>
      </PanelSection>
      <PanelSection title="Brain inventory">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px]">
          <span className="text-ink-mute">{inv.skills} Skills</span>
          <span className="text-ink-mute">{inv.domainLanguageRules} Domain rules</span>
          <span className="text-ink-mute">{inv.evaluations} Evaluations</span>
          <span className="text-ink-mute">{inv.models} SLMs</span>
          <span className="text-ink-mute">{inv.agents} Agents</span>
          <span className="text-ink-mute">{inv.tools} Tools</span>
          <span className="text-ink-mute">{inv.policies} Policies</span>
          <span className="text-ink-mute">{inv.connectors} Connectors</span>
        </div>
      </PanelSection>
      <PanelSection title="Learning">
        <p className="text-[12.5px] text-ink">
          {inv.runs} Run{inv.runs === 1 ? "" : "s"} · {inv.observations} Observation{inv.observations === 1 ? "" : "s"} · {inv.constructs} Construct{inv.constructs === 1 ? "" : "s"}
        </p>
      </PanelSection>
      <Link to={`/knowledge?worker=${refId}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View learning
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

function SkillPanel({ refId }: { refId: string }) {
  const skill = getSkill(refId);
  const signal = skillLearningSignal(refId);
  if (!skill) return null;
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{skill.description}</p>
      </PanelSection>
      <PanelSection title="Status">
        <Badge variant="green">{skill.status}</Badge>
      </PanelSection>
      <PanelSection title="Composition">
        <p className="text-[12.5px] text-ink">
          Used by {skill.workerIds.length} Worker{skill.workerIds.length === 1 ? "" : "s"} · {skill.agentIds.length} Agent{skill.agentIds.length === 1 ? "" : "s"} · {skill.toolIds.length} Tool
          {skill.toolIds.length === 1 ? "" : "s"} · {skill.evaluationIds.length} Evaluation{skill.evaluationIds.length === 1 ? "" : "s"}
        </p>
      </PanelSection>
      <PanelSection title="Workers">
        <WorkersList workerIds={skill.workerIds} />
      </PanelSection>
      {signal && (
        <PanelSection title="Learning signal">
          <p className="text-[11.5px] text-ink-mute leading-relaxed">
            This registered capability has produced learning activity: <span className="font-medium text-ink">{signal.construct.liveStatus}</span>.
          </p>
          <Link to={`/knowledge?focus=${skill.relatedConstructId}`} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
            Explore in Knowledge
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </Link>
        </PanelSection>
      )}
    </div>
  );
}

function DomainTermPanel({ refId }: { refId: string }) {
  const term = getDomainTerm(refId);
  if (!term) return null;
  const relatedSkills = term.skillIds.map((id) => getSkill(id)).filter(Boolean);
  return (
    <div>
      <PanelSection title="Definition">
        <p className="text-[12.5px] text-ink leading-relaxed">{term.description}</p>
      </PanelSection>
      <PanelSection title="Domain">
        <Badge variant="purple">{term.domainGroup}</Badge>
        <span className="ml-2 text-[11.5px] text-ink-mute">{term.ruleCount} rule{term.ruleCount === 1 ? "" : "s"}</span>
      </PanelSection>
      <PanelSection title="Used by">
        <p className="text-[12px] text-ink-mute">{relatedSkills.map((s) => s!.name).join(", ") || "—"}</p>
      </PanelSection>
    </div>
  );
}

function EvaluationPanel({ refId }: { refId: string }) {
  const ev = getEvaluation(refId);
  if (!ev) return null;
  return (
    <div>
      <PanelSection title="Purpose">
        <p className="text-[12.5px] text-ink leading-relaxed">{ev.purpose}</p>
      </PanelSection>
      <PanelSection title="Configuration">
        <div className="flex items-center gap-2">
          <Badge variant={ev.hardGate ? "red" : "neutral"}>{ev.hardGate ? "Hard gate" : "Advisory"}</Badge>
          {ev.threshold && <span className="text-[11.5px] text-ink-mute">Threshold: {ev.threshold}</span>}
        </div>
      </PanelSection>
      <PanelSection title="Used by">
        <WorkersList workerIds={ev.workerIds} />
      </PanelSection>
      <p className="mt-3 text-[11px] text-ink-faint leading-relaxed">
        Actual measured results belong to Learning — see Run evidence for a specific Worker.
      </p>
    </div>
  );
}

function ModelPanel({ refId }: { refId: string }) {
  const model = getModel(refId);
  if (!model) return null;
  return (
    <div>
      <PanelSection title="Purpose">
        <p className="text-[12.5px] text-ink leading-relaxed">{model.purpose}</p>
      </PanelSection>
      <PanelSection title="Status">
        <Badge variant="green">{model.status}</Badge>
      </PanelSection>
      <PanelSection title="Used by">
        <p className="text-[12.5px] text-ink">{model.agentIds.length} Agent{model.agentIds.length === 1 ? "" : "s"}</p>
        <WorkersList workerIds={model.workerIds} />
      </PanelSection>
    </div>
  );
}

function AgentPanel({ refId }: { refId: string }) {
  const agent = getAgent(refId);
  if (!agent) return null;
  const model = agent.modelId ? getModel(agent.modelId) : undefined;
  const skillNames = agent.skillIds.map((id) => getSkill(id)?.name).filter(Boolean);
  const toolNames = agent.toolIds.map((id) => getTool(id)?.name).filter(Boolean);
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{agent.description}</p>
      </PanelSection>
      <PanelSection title="Skills">
        <p className="text-[12px] text-ink-mute">{skillNames.join(", ") || "—"}</p>
      </PanelSection>
      <PanelSection title="Tools">
        <p className="text-[12px] text-ink-mute">{toolNames.join(", ") || "—"}</p>
      </PanelSection>
      {model && (
        <PanelSection title="Model">
          <p className="text-[12.5px] text-ink">{model.name}</p>
        </PanelSection>
      )}
      <PanelSection title="Workers">
        <WorkersList workerIds={agent.workerIds} />
      </PanelSection>
      <Link to={`/knowledge?worker=${agent.workerIds[0] ?? ""}`} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
        View learning impact
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

function ToolPanel({ refId }: { refId: string }) {
  const tool = getTool(refId);
  if (!tool) return null;
  return (
    <div>
      <PanelSection title="Category">
        <Badge variant="neutral">{tool.category}</Badge>
      </PanelSection>
      <PanelSection title="Used by">
        <p className="text-[12.5px] text-ink">{tool.agentIds.length} Agent{tool.agentIds.length === 1 ? "" : "s"}</p>
        <WorkersList workerIds={tool.workerIds} />
      </PanelSection>
    </div>
  );
}

function PolicyPanel({ refId }: { refId: string }) {
  const policy = getPolicy(refId);
  if (!policy) return null;
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{policy.description}</p>
      </PanelSection>
      <PanelSection title="Applies to">
        <WorkersList workerIds={policy.workerIds} />
      </PanelSection>
    </div>
  );
}

function ConnectorPanel({ refId }: { refId: string }) {
  const connector = getConnector(refId);
  if (!connector) return null;
  const toolNames = connector.toolIds.map((id) => getTool(id)?.name).filter(Boolean);
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{connector.description}</p>
      </PanelSection>
      {toolNames.length > 0 && (
        <PanelSection title="Related tools">
          <p className="text-[12px] text-ink-mute">{toolNames.join(", ")}</p>
        </PanelSection>
      )}
      <PanelSection title="Used by">
        <WorkersList workerIds={connector.workerIds} />
      </PanelSection>
    </div>
  );
}

function CapabilityPanel({ refId }: { refId: string }) {
  const capability = getCapability(refId);
  if (!capability) return null;
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{capability.description}</p>
      </PanelSection>
      <PanelSection title="Composition">
        <p className="text-[12.5px] text-ink">
          {capability.skillIds.length} Skill{capability.skillIds.length === 1 ? "" : "s"} · {capability.agentIds.length} Agent{capability.agentIds.length === 1 ? "" : "s"} · {capability.toolIds.length} Tool
          {capability.toolIds.length === 1 ? "" : "s"}
        </p>
      </PanelSection>
      <PanelSection title="Workers">
        <WorkersList workerIds={capability.workerIds} />
      </PanelSection>
    </div>
  );
}

function WorkflowPanel({ refId }: { refId: string }) {
  const workflow = getWorkflow(refId);
  if (!workflow) return null;
  const capNames = workflow.capabilityIds.map((id) => getCapability(id)?.name).filter(Boolean);
  return (
    <div>
      <PanelSection title="Description">
        <p className="text-[12.5px] text-ink leading-relaxed">{workflow.description}</p>
      </PanelSection>
      <PanelSection title="Composed of">
        <p className="text-[12px] text-ink-mute">{capNames.join(", ") || "—"}</p>
      </PanelSection>
      <PanelSection title="Workers">
        <WorkersList workerIds={workflow.workerIds} />
      </PanelSection>
    </div>
  );
}
