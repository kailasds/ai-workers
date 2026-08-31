import { Link } from "react-router-dom";
import {
  Target,
  Sparkles,
  BrainCircuit,
  Users2,
  Plug,
  ShieldHalf,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { useWorker } from "./use-worker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ConfigurationHub() {
  const worker = useWorker();

  return (
    <div className="pb-10 space-y-5">
      <ConfigCard
        to="."
        icon={Target}
        iconTone="accent"
        title="Identity & Mission"
        description="Define who this worker is and what it is responsible for."
        wide
      >
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Role</p>
            <p className="mt-1 text-[13.5px] text-ink">{worker.role}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Mission</p>
            <p className="mt-1 text-[13.5px] text-ink line-clamp-2">{worker.mission}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Responsibilities</p>
            <p className="mt-1 text-[13.5px] text-ink">{worker.responsibilities.length} configured</p>
          </div>
        </div>
      </ConfigCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ConfigCard
          to="skills"
          icon={Sparkles}
          iconTone="purple"
          title="Skills & Capabilities"
          description="Define what the worker knows how to do."
        >
          <p className="text-[13px] text-ink-soft">{worker.skills.length} skills configured</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {worker.skills.slice(0, 4).map((s) => (
              <Badge key={s.id} variant="neutral">
                {s.name}
              </Badge>
            ))}
            {worker.skills.length === 0 && <span className="text-[12px] text-ink-faint">None yet</span>}
          </div>
        </ConfigCard>

        <ConfigCard
          to="knowledge"
          icon={BrainCircuit}
          iconTone="purple"
          title="Knowledge & Training"
          description="Define what guides the worker."
        >
          <p className="text-[13px] text-ink-soft">{worker.knowledge.length} knowledge sources connected</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {worker.knowledge.slice(0, 4).map((k) => (
              <Badge key={k.id} variant="neutral">
                {k.name}
              </Badge>
            ))}
            {worker.knowledge.length === 0 && <span className="text-[12px] text-ink-faint">None yet</span>}
          </div>
        </ConfigCard>

        <ConfigCard
          to="agents"
          icon={Users2}
          iconTone="blue"
          title="Agent Team"
          description="Define the specialized agents available."
        >
          <p className="text-[13px] text-ink-soft">{worker.agents.length} agents configured</p>
        </ConfigCard>

        <ConfigCard
          to="tools"
          icon={Plug}
          iconTone="blue"
          title="Tools & Access"
          description="Define systems the worker can interact with."
        >
          <p className="text-[13px] text-ink-soft">{worker.tools.length} tools connected</p>
        </ConfigCard>

        <ConfigCard
          to="governance"
          icon={ShieldHalf}
          iconTone="green"
          title="Governance"
          description="Define policies, restrictions, and escalation rules."
        >
          <p className="text-[13px] text-ink-soft">{worker.policies.length} policies applied</p>
        </ConfigCard>

        <ConfigCard
          to="budget"
          icon={Wallet}
          iconTone="amber"
          title="Budget & Limits"
          description="Define execution spending limits."
        >
          <p className="text-[13px] text-ink-soft">
            Monthly: <span className="tabular-nums font-medium text-ink">${worker.budget.used.toLocaleString()}</span> / $
            {worker.budget.monthly.toLocaleString()}
          </p>
        </ConfigCard>
      </div>

      <ConfigCard
        to="completion"
        icon={CheckCircle2}
        iconTone="green"
        title="Success Criteria"
        description="Define when work can be considered complete."
        wide
      >
        <p className="text-[13px] text-ink-soft">
          {worker.completionContract.filter((c) => c.required).length} required checkpoints — work cannot be marked complete
          until every checkpoint passes.
        </p>
      </ConfigCard>
    </div>
  );
}

const toneMap = {
  accent: "bg-accent-soft text-accent-ink",
  purple: "bg-status-purple-soft text-status-purple",
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
};

function ConfigCard({
  to,
  icon: Icon,
  iconTone,
  title,
  description,
  wide,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconTone: keyof typeof toneMap;
  title: string;
  description: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group block rounded-card border border-border bg-card shadow-card p-5 transition-colors hover:border-border-strong",
        wide && "md:p-6"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[10px]", toneMap[iconTone])}>
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-medium text-ink">{title}</h3>
            <p className="text-[12px] text-ink-mute">{description}</p>
          </div>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-strong text-ink-mute transition group-hover:bg-onyx group-hover:text-white group-hover:border-onyx">
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </Link>
  );
}
