import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, ChevronRight, Library } from "lucide-react";
import { EmptyState } from "@/components/v2/empty-state";
import { KnowledgeActionBar } from "@/components/v2/knowledge-actions";
import { kindMeta } from "@/components/v2/knowledge-card";
import { HealthNotice, LifecycleNotice } from "@/components/v2/knowledge-detail-panel";
import { KnowledgeTimeline } from "@/components/v2/knowledge-timeline";
import { KnowledgeStatusBadge, knowledgeStatusLabel } from "@/components/v2/status-badge";
import { Button } from "@/components/ui/button";
import { clearHealth, knowledgeById, useV2, workerById } from "@/lib/v2/store";
import type { Knowledge } from "@/lib/v2/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card">
      <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">{title}</h2>
      <div className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const state = useV2();
  const k = knowledgeById(state, id);
  const [showEvidence, setShowEvidence] = useState(false);

  if (!k) {
    return (
      <div className="px-8 py-10">
        <BackLink />
        <EmptyState icon={Library} title="Knowledge not found" description="It may have been removed from this view, or the link is out of date." className="mt-4" />
      </div>
    );
  }

  const source = workerById(state, k.sourceWorkerId);
  const kind = kindMeta[k.kind];
  const derivedFrom = knowledgeById(state, k.derivedFromId);
  const sharedAs = knowledgeById(state, k.sharedAsId);
  const users = k.usedByWorkerIds.map((w) => workerById(state, w)).filter(Boolean);

  return (
    <div className="pb-12">
      <div className="px-8 pt-6">
        <BackLink tab={k.scope} />
      </div>

      <div className="px-8 pt-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
          {kind.label} · {k.scope === "assigned" ? "Assigned" : k.scope === "gained" ? "Gained" : "Platform"}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink font-display">{k.title}</h1>
          <KnowledgeStatusBadge k={k} />
        </div>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-mute">{k.summary}</p>
        <div className="mt-4">
          <KnowledgeActionBar k={k} />
        </div>

        <div className="mt-5 space-y-3">
          <LifecycleNotice k={k} />
          <HealthNotice k={k} />
          {k.health && k.status === "active" && (
            <Button size="sm" variant="secondary" onClick={() => clearHealth(k.id)}>
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Still valid, no action needed
            </Button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Section title="Where did it come from?">
              {k.scope === "assigned" ? (
                <p>Assigned during Compose.</p>
              ) : (
                <p>
                  Learned by <span className="font-medium text-ink">{source?.name ?? "a Worker"}</span>.
                </p>
              )}
              {derivedFrom && (
                <p className="mt-1">
                  Shared from{" "}
                  <Link to={`/knowledge/${derivedFrom.id}`} className="font-medium text-accent-ink underline-offset-2 hover:underline">
                    {derivedFrom.title}
                  </Link>
                  .
                </p>
              )}
              {sharedAs && (
                <p className="mt-1">
                  Shared with the platform as{" "}
                  <Link to={`/knowledge/${sharedAs.id}`} className="font-medium text-accent-ink underline-offset-2 hover:underline">
                    {sharedAs.title}
                  </Link>
                  .
                </p>
              )}
            </Section>

            <Section title="Who can use it?">
              {k.scope === "assigned" ? (
                <UsedBy workers={users.map((w) => ({ id: w!.id, name: w!.name }))} />
              ) : (
                <>
                  <p className="text-[12px] font-medium text-ink">This knowledge is suitable for:</p>
                  <ul className="mt-1 space-y-1">
                    {(k.availableTo.length ? k.availableTo : ["This Worker"]).map((a) => (
                      <li key={a} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2} />
                        {a}
                      </li>
                    ))}
                  </ul>
                  {k.notRecommendedFor && k.notRecommendedFor.length > 0 && (
                    <>
                      <p className="mt-3 text-[12px] font-medium text-ink">Not recommended for:</p>
                      <ul className="mt-1 space-y-1 text-ink-mute">
                        {k.notRecommendedFor.map((a) => (
                          <li key={a} className="flex items-center gap-1.5">
                            <span className="grid h-3.5 w-3.5 place-items-center">
                              <span className="h-2 w-2 rounded-full border border-border-strong" />
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {k.scope === "platform" && users.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-[12px] font-medium text-ink">Used by</p>
                      <UsedBy workers={users.map((w) => ({ id: w!.id, name: w!.name }))} />
                    </div>
                  )}
                </>
              )}
            </Section>

            {k.scope !== "assigned" && (
              <Section title="Why is it trusted?">
                {k.validation && k.validation.length > 0 ? (
                  <ul className="space-y-1">
                    {k.validation.map((v) => (
                      <li key={v} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2} />
                        {v}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No validation has been recorded yet.</p>
                )}
                {k.evidence && k.evidence.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => setShowEvidence((v) => !v)}
                      aria-expanded={showEvidence}
                      className="flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2"
                    >
                      {showEvidence ? <ChevronDown className="h-3 w-3" strokeWidth={2} /> : <ChevronRight className="h-3 w-3" strokeWidth={2} />}
                      View evidence
                    </button>
                    {showEvidence && <EvidenceList k={k} />}
                  </div>
                )}
              </Section>
            )}

            <Section title="Is it still valid?">
              <p>{validityText(k)}</p>
            </Section>
          </div>

          <aside className="h-fit rounded-card border border-border bg-card p-5 shadow-card lg:sticky lg:top-6">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">History</h2>
            <div className="mt-4">
              <KnowledgeTimeline events={k.history} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function validityText(k: Knowledge) {
  if (k.status === "revoked") return "No. This knowledge was revoked and is no longer recommended. Its history is kept.";
  if (k.status === "replaced") return "No. Newer knowledge has replaced it.";
  if (k.status === "retired") return "It is retired: not wrong, but no longer recommended for future use.";
  if (k.status === "rejected") return "It was never kept. The learning was rejected.";
  if (k.status === "under-review") return "Not yet decided. It is waiting for review.";
  if (k.health === "contradictory") return "Being questioned. Newer evidence disagrees with it, so it needs a decision.";
  if (k.health === "outdated") return "It may be outdated. It was validated against a runtime that has since changed.";
  return `Yes. Currently ${knowledgeStatusLabel(k).toLowerCase()}.`;
}

function BackLink({ tab }: { tab?: string }) {
  return (
    <Link to={tab ? `/knowledge?tab=${tab}` : "/knowledge"} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
      Knowledge
    </Link>
  );
}

function UsedBy({ workers }: { workers: { id: string; name: string }[] }) {
  return (
    <ul className="mt-1 space-y-1">
      {workers.map((w) => (
        <li key={w.id}>
          <Link to={`/workers/${w.id}`} className="text-accent-ink underline-offset-2 hover:underline">
            {w.name}
          </Link>
        </li>
      ))}
      {workers.length === 0 && <li className="text-ink-mute">No Workers are using it.</li>}
    </ul>
  );
}

function EvidenceList({ k }: { k: Knowledge }) {
  const state = useV2();
  return (
    <ul className="mt-2 space-y-1.5 rounded-control bg-card-sunken p-3">
      {k.evidence!.map((e) => (
        <li key={e.workerId} className="flex items-center justify-between gap-3 text-[12px]">
          <span className="truncate text-ink-soft">{workerById(state, e.workerId)?.name ?? e.workerId}</span>
          {e.result === "ok" ? (
            <span className="flex shrink-0 items-center gap-1 text-status-green">
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Agrees
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 text-status-amber">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
              Mixed result
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
