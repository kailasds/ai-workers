import { useNavigate } from "react-router-dom";
import { Blocks, Sparkles, Bot, Wrench, Target, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { workers, capabilityLandscapeStats, workerBrainInventory } from "@/lib/capabilities/service";

export default function CapabilityLandscape() {
  const navigate = useNavigate();
  const stats = capabilityLandscapeStats();

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-accent-border bg-accent-soft p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink mb-1.5">
          <Blocks className="h-3.5 w-3.5" strokeWidth={2} />
          What can Workers do?
        </p>
        <p className="text-[13px] leading-relaxed text-ink">
          {stats.workers} Workers are registered with {stats.skills} Skills, {stats.agents} Agents and {stats.tools} Tools across the platform. Select a
          Worker to explore its full Brain Tree.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Workers" value={stats.workers} icon={Blocks} tone="accent" />
        <StatCard label="Skills" value={stats.skills} icon={Sparkles} tone="blue" />
        <StatCard label="Agents" value={stats.agents} icon={Bot} tone="purple" />
        <StatCard label="Tools" value={stats.tools} icon={Wrench} tone="neutral" />
        <StatCard label="Evaluations" value={stats.evaluations} icon={Target} tone="amber" />
      </div>

      <div>
        <p className="text-[13.5px] font-bold text-ink mb-3 px-1">Worker Landscape</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {workers.map((w) => {
            const inv = workerBrainInventory(w.id);
            return (
              <button
                key={w.id}
                onClick={() => navigate(`/capabilities/worker/${w.id}`)}
                className="flex items-center justify-between gap-4 rounded-card border border-border bg-card shadow-card px-5 py-4 text-left transition hover:border-accent-border hover:bg-card-sunken/60"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink truncate">{w.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-mute">{w.boundedContext}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Badge variant="blue">{inv.skills} Skills</Badge>
                    <Badge variant="purple">{inv.agents} Agents</Badge>
                    <Badge variant="neutral">{inv.tools} Tools</Badge>
                    {inv.observations > 0 && <Badge variant="green">{inv.observations} Observations</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
