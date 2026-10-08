import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bot, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/v2/empty-state";
import { PlatformDecisionCard } from "@/components/v2/platform-decision-card";
import { SentinelReviewCard } from "@/components/v2/sentinel-review-card";
import { useV2 } from "@/lib/v2/store";

type Area = "reviews" | "decisions" | "health";

function Count({ n }: { n: number }) {
  return (
    <span className="ml-2 tabular-nums opacity-80" aria-label={`${n} items`}>
      {n}
    </span>
  );
}

export default function Sentinel() {
  const state = useV2();
  const [area, setArea] = useState<Area>("reviews");

  // Worker Sentinel reviews still wait for a decision; Platform Sentinel decides on its own.
  const pending = state.reviews.filter((r) => r.level === "worker" && (r.status === "needs-review" || r.status === "held"));
  const decisions = state.reviews
    .filter((r) => r.level === "platform" && r.decision)
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));
  const platform = state.knowledge.filter((k) => k.scope === "platform" && k.status === "active");
  const attention = platform.filter((k) => k.health);
  const fine = platform.filter((k) => !k.health);

  return (
    <div className="pb-12">
      <PageHeader title="Sentinel" subtitle="Keeps Workers, knowledge, and evolution within their boundaries." icon={ShieldCheck} tone="accent" />

      <div className="space-y-6 px-8">
        <div className="flex items-start gap-3 rounded-card border border-border bg-card-sunken/60 p-5">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-ai" strokeWidth={2} />
          <p className="text-[14px] leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Platform Sentinel decides on its own</span> what to share and which Workers may evolve. You are not asked to approve. Every decision is recorded here with its reason, and you can override it.
          </p>
        </div>

        <Tabs value={area} onValueChange={(v) => setArea(v as Area)}>
          <TabsList aria-label="Sentinel areas">
            <TabsTrigger value="reviews">
              Worker reviews <Count n={pending.length} />
            </TabsTrigger>
            <TabsTrigger value="decisions">
              Platform decisions <Count n={decisions.length} />
            </TabsTrigger>
            <TabsTrigger value="health">
              Knowledge health <Count n={attention.length} />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {area === "reviews" && (
          <div className="space-y-4">
            <p className="text-[14px] text-ink-mute">Worker Sentinel asks: should this Worker learn this? Once it does, Platform Sentinel decides whether to share it.</p>
            {pending.map((r) => (
              <SentinelReviewCard key={r.id} review={r} />
            ))}
            {pending.length === 0 && <EmptyState icon={CheckCircle2} title="Everything is up to date" description="No learning is waiting for a decision." />}
          </div>
        )}

        {area === "decisions" && (
          <div className="space-y-4">
            <p className="text-[14px] text-ink-mute">What Platform Sentinel has decided, newest first.</p>
            {decisions.map((r) => (
              <PlatformDecisionCard key={r.id} review={r} />
            ))}
            {decisions.length === 0 && <EmptyState icon={Bot} title="No decisions yet" description="When a Worker's learning is ready to share, Platform Sentinel decides here." />}
          </div>
        )}

        {area === "health" && (
          <div className="space-y-4">
            <p className="text-[14px] text-ink-mute">Shared knowledge that may no longer hold. Open one to confirm it, restrict it, or revoke it.</p>
            {attention.map((k) => (
              <Link
                key={k.id}
                to={`/knowledge/${k.id}`}
                className="flex items-center gap-3 rounded-card border border-border bg-card p-5 shadow-card hover:shadow-float"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-status-amber-soft text-status-amber">
                  <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-status-amber">{k.health === "contradictory" ? "Contradictory evidence" : "Knowledge may be outdated"}</p>
                  <p className="truncate text-[14px] font-semibold text-ink">{k.title}</p>
                  {k.healthNote && <p className="truncate text-[12px] text-ink-mute">{k.healthNote}</p>}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={2} />
              </Link>
            ))}
            {attention.length === 0 && <EmptyState icon={CheckCircle2} title="Everything is up to date" description="No shared knowledge needs attention." />}
            {fine.length > 0 && (
              <div className="flex items-center gap-3 rounded-card border border-border bg-card-sunken/60 p-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-status-green" strokeWidth={2} />
                <div>
                  <p className="text-[14px] font-semibold text-ink">No action needed</p>
                  <p className="text-[12px] text-ink-mute">{fine.length} other knowledge items</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
