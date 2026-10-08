import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Bot, BrainCircuit, CheckCircle2, ChevronDown, ChevronRight, Gauge, Library, Share2, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LearningEventItem } from "@/components/v2/learning-event";
import { MaturityTag } from "@/components/v2/maturity-tag";
import { MetricCard } from "@/components/v2/metric-card";
import { WorkerStatusBadge } from "@/components/v2/status-badge";
import { givenTo, knowledgeById, learnedBy, needsAttentionCount, useV2 } from "@/lib/v2/store";
import DeliveryOverview from "@/pages/overview";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function Dashboard() {
  const state = useV2();
  const [showDelivery, setShowDelivery] = useState(false);

  const active = state.workers.filter((w) => w.status === "active").length;
  const gained = state.knowledge.filter((k) => k.scope === "gained" && k.status === "active").length;
  const underReview = state.knowledge.filter((k) => k.scope === "gained" && k.status === "under-review").length;
  const shared = state.knowledge.filter((k) => k.scope === "platform" && k.status === "active").length;
  const attention = needsAttentionCount(state);
  const decisions = state.reviews
    .filter((r) => r.level === "platform" && r.decision)
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));
  const recent = [...state.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 4);

  // Learning events per day for the last seven days.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const next = d.getTime() + 86_400_000;
    const count = state.events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= d.getTime() && t < next;
    }).length;
    return { label: d.toLocaleDateString(undefined, { weekday: "short" }), count };
  });
  const peak = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="pb-12">
      <PageHeader title="Dashboard" subtitle={`${greeting()}. Here's what's happening across your Workers.`} icon={Gauge} tone="accent" />

      <div className="space-y-6 px-8">
        {attention > 0 && (
          <Link to="/sentinel" className="flex items-center gap-3 rounded-card border border-status-amber/25 bg-status-amber-soft/50 px-5 py-3.5 hover:bg-status-amber-soft">
            <AlertTriangle className="h-4 w-4 shrink-0 text-status-amber" strokeWidth={2} />
            <p className="flex-1 text-[14px] font-medium text-ink">
              {attention} {attention === 1 ? "item needs" : "items need"} a look in Sentinel.
            </p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-accent-ink">
              Open Sentinel
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard icon={Users} label="Active Workers" value={`${active} of ${state.workers.length}`} hint={`${state.workers.length - active} not active yet`} />
          <MetricCard icon={BrainCircuit} label="Knowledge gained" ai value={gained} hint={underReview > 0 ? `${underReview} under review` : "Nothing waiting"} />
          <MetricCard icon={Library} label="Shared with platform" value={shared} hint={`${decisions.length} decisions made by Sentinel`} />
          <MetricCard icon={AlertTriangle} label="Needs attention" value={attention} hint={attention === 0 ? "Everything is up to date" : "In Sentinel"} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-card border border-border bg-card p-5 shadow-card lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-ink font-display">Learning activity</h2>
                <p className="text-[12px] text-ink-mute">Events across all Workers, last 7 days</p>
              </div>
              <Link to="/learning" className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
                See learning
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </div>

            <div className="mt-5 flex h-32 items-end gap-3" role="img" aria-label={`Learning events per day: ${days.map((d) => `${d.label} ${d.count}`).join(", ")}`}>
              {days.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[12px] font-semibold tabular-nums text-ink-mute">{d.count}</span>
                  <div
                    className={d.count === peak && d.count > 0 ? "w-full rounded-t-control bg-ai" : "w-full rounded-t-control bg-ai-soft"}
                    style={{ height: `${Math.max((d.count / peak) * 72, 4)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3 border-t border-border pt-2">
              {days.map((d, i) => (
                <span key={i} className="flex-1 text-center text-[12px] text-ink-faint">
                  {d.label}
                </span>
              ))}
            </div>

            <h3 className="mb-3 mt-6 text-[12px] font-bold uppercase tracking-wider text-ink-mute">Recent</h3>
            <div className="space-y-4">
              {recent.map((e) => (
                <LearningEventItem key={e.id} event={e} />
              ))}
            </div>
          </section>

          <section className="flex flex-col rounded-card border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-ai" strokeWidth={2} />
              <h2 className="text-[15px] font-bold text-ink font-display">Platform Sentinel</h2>
            </div>
            <p className="mt-1 text-[12px] text-ink-mute">Decides on its own. You can override.</p>

            <ul className="mt-4 flex-1 divide-y divide-border">
              {decisions.slice(0, 4).map((r) => {
                const isEvolution = r.type === "evolution";
                const title = isEvolution ? state.workers.find((w) => w.id === r.subjectId)?.name : knowledgeById(state, r.subjectId)?.title;
                const Icon = isEvolution ? TrendingUp : r.decision === "Shared with platform" ? Share2 : CheckCircle2;
                return (
                  <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ai" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-ink">{r.decision}</p>
                      <p className="truncate text-[12px] text-ink-mute">{title}</p>
                    </div>
                    <span className="shrink-0 text-[12px] text-ink-faint">{timeAgo(r.decidedAt)}</span>
                  </li>
                );
              })}
              {decisions.length === 0 && <li className="text-[12px] text-ink-mute">No decisions yet.</li>}
            </ul>
            <Link to="/sentinel" className="mt-4 inline-flex items-center gap-1 self-start text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
              See all decisions
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </section>
        </div>

        <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 p-5 pb-4">
            <div>
              <h2 className="text-[15px] font-bold text-ink font-display">Workers</h2>
              <p className="text-[12px] text-ink-mute">What each Worker knows and can do</p>
            </div>
            <Link to="/workers" className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
              Open Registry
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="border-y border-border text-[12px] uppercase tracking-wider text-ink-mute">
                  <th className="px-5 py-2.5 font-semibold">Worker</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Capability</th>
                  <th className="px-3 py-2.5 font-semibold">Maturity</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Assigned</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Learned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.workers.map((w) => (
                  <tr key={w.id} className="hover:bg-card-sunken">
                    <td className="px-5 py-3">
                      <Link to={`/workers/${w.id}`} className="font-medium text-ink hover:underline underline-offset-2">
                        {w.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <WorkerStatusBadge status={w.status} />
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{w.evolution.currentCapability}</td>
                    <td className="px-3 py-3">
                      <MaturityTag maturity={w.maturity} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{givenTo(state, w).length}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{learnedBy(state, w.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setShowDelivery((v) => !v)}
            aria-expanded={showDelivery}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-soft hover:text-ink"
          >
            {showDelivery ? <ChevronDown className="h-4 w-4" strokeWidth={2} /> : <ChevronRight className="h-4 w-4" strokeWidth={2} />}
            Delivery and operations
          </button>
          <p className="mt-1 pl-[22px] text-[12px] text-ink-mute">What Workers have delivered, what runs cost, and readiness.</p>
          {showDelivery && (
            <div className="mt-5">
              <DeliveryOverview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
