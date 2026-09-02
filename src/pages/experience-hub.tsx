import { useState } from "react";
import { Share2, Layers, GitBranch, ShieldCheck, Users, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExperienceTransferModal } from "@/components/shared/experience-transfer-modal";
import { experienceAssets, experienceMetrics, experienceGraph, type ExperienceAsset } from "@/lib/experience-data";
import { cn } from "@/lib/utils";

const compatibilityVariant: Record<ExperienceAsset["compatibility"], "green" | "amber" | "neutral"> = {
  High: "green",
  Medium: "amber",
  Low: "neutral",
};

export default function ExperienceHub() {
  const [reviewing, setReviewing] = useState<ExperienceAsset | null>(null);
  const [transferring, setTransferring] = useState<ExperienceAsset | null>(null);

  return (
    <div className="pb-16">
      <PageHeader
        title="Experience Hub"
        subtitle="Controlled transfer of validated experience between AI Workers."
        icon={Share2}
        tone="accent"
      />

      <div className="px-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard label="Total Experience Assets" value={experienceMetrics.totalAssets} icon={Layers} />
          <MetricCard label="Transferable Assets" value={experienceMetrics.transferableAssets} icon={ShieldCheck} tone="green" />
          <MetricCard label="Validated Patterns" value={experienceMetrics.validatedPatterns} icon={GitBranch} tone="blue" />
          <MetricCard label="Workers Contributing" value={experienceMetrics.contributingWorkers} icon={Users} />
        </div>

        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <p className="text-[13.5px] font-semibold text-ink">Experience Library</p>
              <p className="text-[12px] text-ink-mute">Validated decision patterns, workflows, and domain knowledge available to share.</p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {experienceAssets.map((asset) => (
              <div key={asset.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-ink">{asset.name}</p>
                    <Badge variant="outline">{asset.category}</Badge>
                    <Badge variant={compatibilityVariant[asset.compatibility]} dot>
                      {asset.compatibility} compatibility
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">{asset.description}</p>
                  <p className="mt-1.5 text-[11px] text-ink-mute">
                    From <span className="font-medium text-ink-soft">{asset.sourceWorkerName}</span> · {asset.validatedCases} validated cases
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <Button size="sm" variant="secondary" onClick={() => setReviewing(asset)}>
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Review
                  </Button>
                  <Button size="sm" disabled={asset.compatibility === "Low"} onClick={() => setTransferring(asset)}>
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Transfer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {reviewing && (
          <div className="rounded-card border border-accent-border bg-accent-soft px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-accent-ink">{reviewing.name}</p>
              <button onClick={() => setReviewing(null)} className="text-[11px] text-ink-mute hover:text-ink">
                Close
              </button>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">{reviewing.description}</p>
            <p className="mt-2 text-[11.5px] text-ink-mute">
              Source: {reviewing.sourceWorkerName} · Category: {reviewing.category} · {reviewing.validatedCases} validated cases · {reviewing.compatibility} compatibility
            </p>
          </div>
        )}

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <p className="text-[13.5px] font-semibold text-ink">Worker Experience Relationships</p>
          <p className="mt-1 text-[12px] text-ink-mute">Workers currently contributing validated experience to the library.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {experienceGraph.map((w, i) => (
              <div key={w.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border-strong bg-card-sunken px-3 py-1.5">
                  <span className={cn("h-2 w-2 rounded-full", "bg-accent")} />
                  <span className="text-[12px] font-medium text-ink-soft">{w.name}</span>
                  <span className="text-[10.5px] text-ink-faint">
                    {experienceAssets.filter((a) => a.sourceWorkerId === w.id).length} assets
                  </span>
                </div>
                {i < experienceGraph.length - 1 && <span className="h-px w-6 bg-border-strong" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {transferring && <ExperienceTransferModal asset={transferring} onClose={() => setTransferring(null)} />}
    </div>
  );
}

const metricIconTone: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
};

function MetricCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: "blue" | "green";
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-ink-mute">{label}</p>
        {Icon && (
          <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", tone ? metricIconTone[tone] : "bg-card-sunken text-ink-soft")}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[26px] leading-none font-bold tracking-[-0.01em] tabular-nums font-display text-ink">
        {value}
      </p>
    </div>
  );
}
