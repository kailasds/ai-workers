import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, FileBarChart, Map as MapIcon, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/v2/empty-state";
import { EvolutionHistory, EvolutionPath } from "@/components/v2/evolution-path";
import { KnowledgeCard } from "@/components/v2/knowledge-card";
import { KnowledgeDetailPanel } from "@/components/v2/knowledge-detail-panel";
import { LearningEventItem } from "@/components/v2/learning-event";
import { MaturityTag } from "@/components/v2/maturity-tag";
import { useV2 } from "@/lib/v2/store";
import type { LearningEvent } from "@/lib/v2/types";

function dayGroup(iso: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t = new Date(iso).getTime();
  if (t >= start.getTime()) return "Today";
  if (t >= start.getTime() - 86_400_000) return "Yesterday";
  return "Earlier";
}

export default function LearningPage() {
  return (
    <div className="pb-12">
      <PageHeader
        title="Learning"
        subtitle="See what Workers are discovering, keeping, sharing, and using."
        icon={BrainCircuit}
        tone="accent"
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link to="/learning/reports">
                <FileBarChart className="h-3.5 w-3.5" strokeWidth={2} />
                Detailed reports
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/learning/map">
                <MapIcon className="h-3.5 w-3.5" strokeWidth={2} />
                Explore map
              </Link>
            </Button>
          </>
        }
      />

      <div className="px-8">
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="gained">Knowledge gained</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <ActivityFeed />
          </TabsContent>
          <TabsContent value="gained">
            <GainedList />
          </TabsContent>
          <TabsContent value="evolution">
            <EvolutionList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const state = useV2();
  const events = [...state.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const groups = new Map<string, LearningEvent[]>();
  for (const e of events) {
    const g = dayGroup(e.timestamp);
    groups.set(g, [...(groups.get(g) ?? []), e]);
  }
  if (events.length === 0) {
    return <EmptyState icon={BrainCircuit} title="No learning activity yet" description="When Workers notice useful patterns, they will show up here." />;
  }
  return (
    <div className="space-y-6">
      {(["Today", "Yesterday", "Earlier"] as const)
        .filter((g) => groups.has(g))
        .map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-mute">{g}</h2>
            <div className="divide-y divide-border rounded-card border border-border bg-card px-5 shadow-card">
              {groups.get(g)!.map((e) => (
                <div key={e.id} className="py-4">
                  <LearningEventItem event={e} />
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function GainedList() {
  const state = useV2();
  const [openId, setOpenId] = useState<string | null>(null);
  const gained = state.knowledge.filter((k) => k.scope === "gained");
  return (
    <div>
      <p className="mb-4 text-[14px] text-ink-mute">Knowledge learned by Workers through experience. It belongs to the Worker unless it is shared.</p>
      {gained.length === 0 ? (
        <EmptyState icon={BrainCircuit} title="No Gained Knowledge" description="This Worker hasn't gained reusable knowledge yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gained.map((k) => (
            <KnowledgeCard key={k.id} k={k} onOpen={setOpenId} />
          ))}
        </div>
      )}
      <KnowledgeDetailPanel id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function EvolutionList() {
  const state = useV2();
  const pending = (workerId: string) => state.reviews.find((r) => r.type === "evolution" && r.subjectId === workerId && r.status === "needs-review");
  const workers = state.workers.filter((w) => w.status !== "draft" || w.evolution.enabled);
  return (
    <div>
      <p className="mb-4 max-w-2xl text-[14px] text-ink-mute">Learning makes a Worker better informed. Evolution makes it capable of doing more. Evolution decisions are governed by Platform Sentinel.</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {workers.map((w) => {
          const p = pending(w.id);
          return (
            <div key={w.id} className="rounded-card border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/workers/${w.id}`} className="text-[14px] font-bold text-ink font-display hover:underline underline-offset-2">
                    {w.name}
                  </Link>
                  <div className="mt-1">
                    <MaturityTag maturity={w.maturity} />
                  </div>
                </div>
                {p && (
                  <Link to="/sentinel" className="shrink-0 text-[12px] font-medium text-status-amber hover:underline underline-offset-2">
                    Awaiting approval
                  </Link>
                )}
              </div>

              {w.evolution.enabled ? (
                <div className="mt-4">
                  <EvolutionPath current={w.evolution.currentCapability} upcoming={w.evolution.availablePaths} pendingCapability={p?.proposedCapability} />
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-ink-mute">Evolution is off for this Worker.</p>
              )}

              {w.evolution.enabled && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-mute">Evolution history</p>
                  {w.evolution.history.length > 0 ? (
                    <EvolutionHistory history={w.evolution.history} />
                  ) : (
                    <EmptyState icon={TrendingUp} title="No evolution" description="This Worker hasn't evolved yet." className="py-6" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
