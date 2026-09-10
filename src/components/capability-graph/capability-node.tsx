import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  User,
  Sparkles,
  Languages,
  Target,
  Cpu,
  Bot,
  Wrench,
  Shield,
  Plug,
  Component,
  GitBranch,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapabilityNodeKind } from "@/lib/capabilities/graph-types";

export interface CapabilityNodeData extends Record<string, unknown> {
  kind: CapabilityNodeKind;
  label: string;
  refId: string;
  payload: Record<string, unknown>;
  state: "normal" | "selected" | "highlighted" | "dimmed";
  expandable?: boolean;
  expanded?: boolean;
}

const kindMeta: Record<CapabilityNodeKind, { icon: typeof User; iconBg: string; iconColor: string }> = {
  worker: { icon: User, iconBg: "bg-onyx", iconColor: "text-white" },
  brainCategory: { icon: Component, iconBg: "bg-accent", iconColor: "text-white" },
  skill: { icon: Sparkles, iconBg: "bg-status-blue-soft", iconColor: "text-status-blue" },
  domainLanguage: { icon: Languages, iconBg: "bg-status-purple-soft", iconColor: "text-status-purple" },
  evaluation: { icon: Target, iconBg: "bg-status-amber-soft", iconColor: "text-status-amber" },
  model: { icon: Cpu, iconBg: "bg-status-green-soft", iconColor: "text-status-green" },
  agent: { icon: Bot, iconBg: "bg-accent-soft", iconColor: "text-accent-ink" },
  tool: { icon: Wrench, iconBg: "bg-card-sunken", iconColor: "text-ink-soft" },
  policy: { icon: Shield, iconBg: "bg-status-red-soft", iconColor: "text-status-red" },
  connector: { icon: Plug, iconBg: "bg-card-sunken", iconColor: "text-ink-soft" },
  capability: { icon: Component, iconBg: "bg-status-blue-soft", iconColor: "text-status-blue" },
  workflow: { icon: GitBranch, iconBg: "bg-status-purple-soft", iconColor: "text-status-purple" },
};

function CapabilityNodeImpl({ data }: NodeProps) {
  const d = data as unknown as CapabilityNodeData;
  const meta = kindMeta[d.kind];
  const Icon = meta.icon;
  const isCategory = d.kind === "brainCategory";
  const isWorker = d.kind === "worker";
  const p = d.payload as Record<string, any>;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-card transition-all duration-150",
        isWorker ? "w-[240px] border-2 border-onyx px-4 py-3" : isCategory ? "w-[200px] px-3.5 py-3" : "w-[196px] px-3 py-2.5",
        isCategory && p.primary && "border-accent-border bg-accent-soft/60",
        isCategory && !p.primary && "border-border-strong",
        !isCategory && !isWorker && "border-border",
        d.state === "selected" && "ring-2 ring-accent border-accent shadow-float",
        d.state === "highlighted" && "border-accent-border",
        d.state === "dimmed" && "opacity-30",
        d.state === "normal" && "opacity-100"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-border-strong !w-1.5 !h-1.5 !border-0" />

      <div className="flex items-start gap-2">
        <div className={cn("grid shrink-0 place-items-center rounded-md", isWorker ? "h-8 w-8" : "h-6 w-6", meta.iconBg)}>
          <Icon className={cn(isWorker ? "h-4 w-4" : "h-3.5 w-3.5", meta.iconColor)} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("leading-snug text-ink line-clamp-2", isWorker ? "text-[13px] font-bold" : isCategory ? "text-[12px] font-bold uppercase tracking-wide" : "text-[11.5px] font-semibold")}>
            {d.label}
          </p>
          {isCategory ? (
            <p className="mt-0.5 text-[10.5px] font-medium text-ink-mute">{p.count} registered</p>
          ) : isWorker ? (
            <p className="mt-0.5 text-[10.5px] text-ink-mute">{p.worker?.boundedContext}</p>
          ) : (
            p.subtitle && <p className="mt-0.5 text-[10.5px] text-ink-mute truncate">{p.subtitle}</p>
          )}
        </div>
        {d.expandable && (
          <div className="shrink-0 text-ink-faint mt-0.5">
            {d.expanded ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />}
          </div>
        )}
      </div>
    </div>
  );
}

export const CapabilityNode = memo(CapabilityNodeImpl);

export const capabilityNodeTypes = {
  worker: CapabilityNode,
  brainCategory: CapabilityNode,
  skill: CapabilityNode,
  domainLanguage: CapabilityNode,
  evaluation: CapabilityNode,
  model: CapabilityNode,
  agent: CapabilityNode,
  tool: CapabilityNode,
  policy: CapabilityNode,
  connector: CapabilityNode,
  capability: CapabilityNode,
  workflow: CapabilityNode,
};
