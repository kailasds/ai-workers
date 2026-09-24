import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Users2,
  Layers,
  Puzzle,
  PlayCircle,
  Eye,
  FileCheck2,
  Scale,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GraphNodeKind } from "@/lib/knowledge/graph-types";
import type { Construct, Outcome, CandidateStatus, PackStatus } from "@/lib/knowledge/types";

export interface GraphNodeData extends Record<string, unknown> {
  kind: GraphNodeKind;
  label: string;
  refId: string;
  payload: Record<string, unknown>;
  state: "normal" | "selected" | "highlighted" | "dimmed";
}

const outcomeTone: Record<Outcome, "green" | "amber" | "blue" | "neutral" | "red"> = {
  Met: "green",
  "Not met": "red",
  "Awaiting evidence": "amber",
  "Not adjudicable": "neutral",
  "Not measured": "neutral",
};

const constructTone: Record<Construct["status"], "neutral" | "blue" | "amber" | "green"> = {
  "Nothing yet": "neutral",
  Observed: "blue",
  Corroborated: "amber",
  Certified: "green",
  Published: "green",
};

const candidateTone: Record<CandidateStatus, "neutral" | "blue" | "amber" | "green" | "red" | "purple"> = {
  Pending: "neutral",
  "Ready to Certify": "blue",
  Contradictory: "red",
  Deferred: "purple",
  Accepted: "green",
  Rejected: "red",
};

const packTone: Record<PackStatus, "green" | "red" | "neutral"> = {
  Published: "green",
  Blocked: "red",
  Draft: "neutral",
};

const kindMeta: Record<GraphNodeKind, { icon: typeof Users2; accent: string; iconBg: string; iconColor: string }> = {
  worker: { icon: Users2, accent: "border-l-status-blue", iconBg: "bg-status-blue-soft", iconColor: "text-status-blue" },
  topic: { icon: Layers, accent: "border-l-status-purple", iconBg: "bg-status-purple-soft", iconColor: "text-status-purple" },
  construct: { icon: Puzzle, accent: "border-l-accent", iconBg: "bg-accent-soft", iconColor: "text-accent-ink" },
  run: { icon: PlayCircle, accent: "border-l-ink-faint", iconBg: "bg-card-sunken", iconColor: "text-ink-mute" },
  observation: { icon: Eye, accent: "border-l-status-blue", iconBg: "bg-status-blue-soft", iconColor: "text-status-blue" },
  evidence: { icon: FileCheck2, accent: "border-l-ink-faint", iconBg: "bg-card-sunken", iconColor: "text-ink-soft" },
  candidate: { icon: Scale, accent: "border-l-status-amber", iconBg: "bg-status-amber-soft", iconColor: "text-status-amber" },
  certified: { icon: ShieldCheck, accent: "border-l-status-green", iconBg: "bg-status-green-soft", iconColor: "text-status-green" },
  pack: { icon: Package, accent: "border-l-onyx", iconBg: "bg-onyx", iconColor: "text-white" },
};

// Explicit type label per kind so the graph never depends on the legend to
// tell entity types apart — always distinct from the status badge below it.
export const kindLabel: Record<GraphNodeKind, string> = {
  worker: "Worker",
  topic: "Topic",
  construct: "Knowledge Construct",
  run: "Run",
  observation: "Observation",
  evidence: "Evidence",
  candidate: "Candidate Knowledge",
  certified: "Certified Knowledge",
  pack: "Knowledge Pack",
};

function Subtitle({ data }: { data: GraphNodeData }) {
  const p = data.payload as Record<string, any>;
  switch (data.kind) {
    case "worker":
      return (
        <p className="text-[10.5px] text-ink-mute">
          {p.observationCount} observation{p.observationCount === 1 ? "" : "s"} recorded
        </p>
      );
    case "topic":
      return (
        <p className="text-[10.5px] text-ink-mute">
          {p.observationCount} observations · {p.workerCount} Workers
        </p>
      );
    case "construct": {
      const status: Construct["status"] = p.construct?.liveStatus ?? p.construct?.status ?? "Nothing yet";
      return (
        <div className="mt-1 flex items-center gap-1.5">
          <Badge variant={constructTone[status]}>{status}</Badge>
          <span className="text-[10.5px] text-ink-mute">{p.observationCount ?? 0} obs</span>
        </div>
      );
    }
    case "run":
      return <div className="mt-1"><Badge variant={outcomeTone[p.run?.outcome as Outcome] ?? "neutral"}>{p.run?.outcome}</Badge></div>;
    case "observation":
      return <div className="mt-1"><Badge variant={outcomeTone[p.observation?.outcome as Outcome] ?? "neutral"}>{p.observation?.outcome}</Badge></div>;
    case "evidence":
      return <p className="text-[10.5px] text-ink-mute">From {p.worker?.name?.split("·")[0]?.trim() ?? "Worker run"}</p>;
    case "candidate": {
      const status: CandidateStatus = p.candidate?.liveStatus ?? p.candidate?.status;
      return <div className="mt-1"><Badge variant={candidateTone[status]}>{status}</Badge></div>;
    }
    case "certified":
      return <div className="mt-1"><Badge variant="green">Certified</Badge></div>;
    case "pack": {
      const status: PackStatus = p.pack?.status;
      return <div className="mt-1"><Badge variant={packTone[status]}>{status}</Badge></div>;
    }
    default:
      return null;
  }
}

function nodeTitle(d: GraphNodeData): { title: string; runTag: string | null } {
  if (d.kind === "worker") {
    const match = d.label.match(/#(\d+)/);
    if (match) {
      return { title: d.label.split("·")[0].trim(), runTag: `#${match[1]}` };
    }
  }
  return { title: d.label, runTag: null };
}

function GraphNodeImpl({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;
  const meta = kindMeta[d.kind];
  const Icon = meta.icon;
  const { title, runTag } = nodeTitle(d);

  return (
    <div
      className={cn(
        "w-[220px] rounded-lg border border-l-4 bg-card shadow-card px-3 py-2.5 transition-all duration-150",
        meta.accent,
        d.state === "selected" && "ring-2 ring-accent border-accent shadow-float",
        d.state === "highlighted" && "border-accent-border bg-accent-soft/40",
        d.state === "dimmed" && "opacity-30",
        d.state === "normal" && "opacity-100"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />
      <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-ink-faint">{kindLabel[d.kind]}</p>
      <div className="flex items-start gap-2">
        <div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", meta.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", meta.iconColor)} strokeWidth={2} />
        </div>
        <span className="min-w-0">
          <span className="block line-clamp-2 text-[11.5px] font-semibold leading-snug text-ink">{title}</span>
          {runTag && <span className="text-[10px] font-medium text-ink-mute">{runTag}</span>}
        </span>
      </div>
      <Subtitle data={d} />
    </div>
  );
}

export const GraphNode = memo(GraphNodeImpl);

export const graphNodeTypes = {
  worker: GraphNode,
  topic: GraphNode,
  construct: GraphNode,
  run: GraphNode,
  observation: GraphNode,
  evidence: GraphNode,
  candidate: GraphNode,
  certified: GraphNode,
  pack: GraphNode,
};
