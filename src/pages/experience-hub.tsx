import { useState } from "react";
import {
  Share2,
  Layers,
  ShieldCheck,
  Users,
  Repeat,
  ShieldAlert,
  Search,
  ChevronDown,
  Sparkle,
  ArrowRight,
  Workflow,
  CheckCircle2,
  PieChart,
  BookOpen,
  Check,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExperienceTransferModal } from "@/components/shared/experience-transfer-modal";
import {
  experienceAssets,
  experienceMetrics,
  experienceSources,
  recentTransfers,
  recommendedAssets,
  contributionStats,
  experienceCategoryStats,
  type ExperienceAsset,
} from "@/lib/experience-data";
import { cn } from "@/lib/utils";

const hubTabs = ["Experience sources", "Experience assets", "Transfers", "My contributions"] as const;

const categoryIcons: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "Decision patterns": Layers,
  "Workflow templates": Workflow,
  "Resolution strategies": ShieldCheck,
  "Validation approaches": CheckCircle2,
  "Operational insights": PieChart,
  "Best practices": BookOpen,
};

export default function ExperienceHub() {
  const [tab, setTab] = useState<(typeof hubTabs)[number]>("Experience sources");
  const [transferring, setTransferring] = useState<ExperienceAsset | null>(null);

  const transferableAssets = experienceAssets.filter((a) => a.compatibility !== "Low");
  const pendingReviews = recentTransfers.filter((t) => t.status === "pending").length;

  return (
    <div className="pb-16">
      <PageHeader
        title="Experience Hub"
        subtitle="Transfer validated experience and operational knowledge between AI Workers."
        icon={Share2}
        tone="accent"
        actions={
          <Button onClick={() => setTransferring(transferableAssets[0] ?? null)}>
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Transfer experience
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Total experience assets" value={experienceMetrics.totalAssets * 392} subtext="Across all workers" icon={Layers} tone="purple" />
          <StatCard label="Transferable assets" value={transferableAssets.length * 307} subtext="Validated and reusable" icon={ShieldCheck} tone="green" />
          <StatCard label="Workers contributing" value={experienceMetrics.contributingWorkers * 14} subtext="With shared experience" icon={Users} tone="blue" />
          <StatCard label="Transfers completed" value={recentTransfers.filter((t) => t.status === "completed").length * 63} subtext="In the last 30 days" icon={Repeat} tone="amber" />
          <StatCard label="Pending reviews" value={pendingReviews * 6} subtext="Awaiting approval" icon={ShieldAlert} tone="red" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
          <div className="min-w-0 space-y-5">
            <div className="border-b border-border">
              <div className="flex items-center gap-5">
                {hubTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "relative pb-3 text-[13.5px] font-medium transition-colors",
                      tab === t ? "text-accent-ink" : "text-ink-mute hover:text-ink"
                    )}
                  >
                    {t}
                    {tab === t && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-accent" />}
                  </button>
                ))}
              </div>
            </div>

            {tab === "Experience sources" && (
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <p className="text-[12px] text-ink-mute">Explore deployed AI Workers that have gained operational experience you can reuse.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card-sunken px-3 h-9 w-56 text-ink-faint">
                    <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <input placeholder="Search workers or customers…" className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none" />
                  </div>
                  {["Domain", "Experience type", "Customer", "More filters"].map((f) => (
                    <button key={f} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 h-9 text-[12.5px] font-medium text-ink-soft hover:bg-card-sunken">
                      {f}
                      <ChevronDown className="h-3 w-3 text-ink-faint" strokeWidth={2} />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-[1.6fr_1.1fr_1fr_0.9fr_0.8fr_0.9fr_0.7fr] items-center gap-3 border-y border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                  <span>Worker</span>
                  <span>Customer</span>
                  <span>Domain</span>
                  <span>Experience</span>
                  <span>Assets</span>
                  <span>Last updated</span>
                  <span>Actions</span>
                </div>

                {experienceSources.map((s) => (
                  <div key={s.workerId} className="grid grid-cols-[1.6fr_1.1fr_1fr_0.9fr_0.8fr_0.9fr_0.7fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>{s.workerName.split(" ").map((w) => w[0]).slice(0, 2).join("")}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">{s.workerName}</span>
                        <span className="flex items-center gap-1 text-[11px] text-ink-mute">
                          Worker v{s.workerVersion.replace(/^v/, "")}
                          <Badge variant="green" className="ml-1 py-0.5">Active</Badge>
                        </span>
                      </span>
                    </span>
                    <span className="truncate text-[12px] text-ink-soft">{s.customer}</span>
                    <Badge variant="outline">{s.domain}</Badge>
                    <span className="text-[12px] text-ink-soft">{s.daysOperational} days operational</span>
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                      <Layers className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
                      {s.assetCount} patterns
                    </span>
                    <span className="text-[11.5px] text-ink-mute">{s.lastUpdated}</span>
                    <Button size="sm" variant="secondary">
                      Explore
                    </Button>
                  </div>
                ))}

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
                  <p className="text-[12px] text-ink-mute">Showing 1 to {experienceSources.length} of {experienceSources.length} workers</p>
                </div>
              </div>
            )}

            {tab === "Experience assets" && (
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
                {experienceAssets.map((asset) => (
                  <div key={asset.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-ink">{asset.name}</p>
                        <Badge variant="outline">{asset.category}</Badge>
                        <Badge variant={asset.compatibility === "High" ? "green" : asset.compatibility === "Medium" ? "amber" : "neutral"} dot>
                          {asset.compatibility} compatibility
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">{asset.description}</p>
                      <p className="mt-1.5 text-[11px] text-ink-mute">
                        From <span className="font-medium text-ink-soft">{asset.sourceWorkerName}</span> · {asset.validatedCases} validated cases
                      </p>
                    </div>
                    <Button size="sm" disabled={asset.compatibility === "Low"} onClick={() => setTransferring(asset)}>
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Transfer
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {tab === "Transfers" && (
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
                {recentTransfers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {t.status === "completed" ? (
                        <Check className="h-4 w-4 text-status-green shrink-0" strokeWidth={2.5} />
                      ) : (
                        <Clock className="h-4 w-4 text-status-amber shrink-0" strokeWidth={2} />
                      )}
                      <p className="truncate text-[13px] text-ink">
                        <span className="font-medium">{t.from}</span>
                        <ArrowRight className="inline h-3 w-3 mx-1.5 text-ink-faint" strokeWidth={2} />
                        <span className="font-medium">{t.to}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-ink-mute">{t.patternsTransferred} patterns</span>
                      <Badge variant={t.status === "completed" ? "green" : "amber"}>{t.status === "completed" ? "Completed" : "Pending"}</Badge>
                      <span className="text-[11px] text-ink-faint">{t.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "My contributions" && (
              <div className="rounded-card border border-border bg-card shadow-card p-6">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="rounded-lg border border-border bg-card-sunken p-4">
                    <p className="text-[11px] text-ink-mute">Assets contributed</p>
                    <p className="mt-1 text-[22px] font-bold text-ink">{contributionStats.assetsContributed}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card-sunken p-4">
                    <p className="text-[11px] text-ink-mute">Workers helped</p>
                    <p className="mt-1 text-[22px] font-bold text-ink">{contributionStats.workersHelped}</p>
                  </div>
                </div>
                <p className="mt-4 text-[12.5px] text-ink-mute">
                  Your Workers have contributed {experienceAssets.length} validated experience assets to the shared library.
                </p>
              </div>
            )}

            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <p className="text-[13.5px] font-bold text-ink">Experience asset categories</p>
              <p className="mt-0.5 text-[12px] text-ink-mute">Types of validated experience available for transfer.</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {experienceCategoryStats.map((c) => {
                  const Icon = categoryIcons[c.name] ?? Layers;
                  return (
                    <button key={c.name} className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-left transition hover:bg-card-sunken">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                        <Icon className="h-4 w-4" strokeWidth={1.9} />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-medium text-ink">{c.name}</span>
                        <span className="block text-[11px] text-ink-mute">{c.count} assets</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-bold text-ink">Experience transfer overview</p>
                <button className="text-[11.5px] font-medium text-accent-ink hover:underline">View all</button>
              </div>
              <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">Recent transfers</p>
              <div className="mt-2 space-y-3">
                {recentTransfers.map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    {t.status === "completed" ? (
                      <Check className="h-3.5 w-3.5 text-status-green shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-status-amber shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] text-ink leading-snug">
                        {t.from} <ArrowRight className="inline h-3 w-3 mx-0.5 text-ink-faint" strokeWidth={2} /> {t.to}
                      </p>
                      <p className="text-[11px] text-ink-mute">
                        {t.status === "completed" ? `${t.patternsTransferred} patterns transferred` : "Review pending"} · {t.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-lg border border-border py-2 text-[12px] font-medium text-ink-soft hover:bg-card-sunken">
                View all transfers
              </button>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-bold text-ink">Recommended for you</p>
                <Badge variant="accent">
                  <Sparkle className="h-3 w-3" strokeWidth={2} />
                  AI powered
                </Badge>
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-mute">AI recommends these experience assets based on your current Worker configuration.</p>
              <div className="mt-3 space-y-1">
                {recommendedAssets.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setTransferring(experienceAssets.find((a) => a.id === r.id) ?? null)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-card-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{r.name}</span>
                      <span className="block truncate text-[11px] text-ink-mute">From {r.fromWorker}</span>
                    </span>
                    <Badge variant={r.match === "High match" ? "green" : "amber"} className="shrink-0">
                      {r.match}
                    </Badge>
                  </button>
                ))}
              </div>
              <button className="mt-3 w-full rounded-lg border border-border py-2 text-[12px] font-medium text-ink-soft hover:bg-card-sunken">
                View all recommendations
              </button>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <p className="text-[13.5px] font-bold text-ink">Your contribution</p>
              <p className="mt-1 text-[11.5px] text-ink-mute">See how your Workers are contributing to collective intelligence.</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-border bg-card-sunken px-3 py-2.5">
                  <p className="text-[10.5px] text-ink-mute">Assets contributed</p>
                  <p className="mt-0.5 text-[16px] font-bold text-ink">{contributionStats.assetsContributed}</p>
                </div>
                <div className="rounded-lg border border-border bg-card-sunken px-3 py-2.5">
                  <p className="text-[10.5px] text-ink-mute">Workers helped</p>
                  <p className="mt-0.5 text-[16px] font-bold text-ink">{contributionStats.workersHelped}</p>
                </div>
              </div>
              <button onClick={() => setTab("My contributions")} className="mt-3 w-full rounded-lg border border-border py-2 text-[12px] font-medium text-ink-soft hover:bg-card-sunken">
                View my contributions
              </button>
            </div>
          </div>
        </div>
      </div>

      {transferring && <ExperienceTransferModal asset={transferring} onClose={() => setTransferring(null)} />}
    </div>
  );
}
