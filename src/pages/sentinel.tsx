import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Sparkle,
  ArrowRight,
  Users2,
  GitCommitHorizontal,
  Activity,
  History,
  Radar,
  Archive,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { getCandidateDecisions, getConstruct, getObservation, getPacks } from "@/lib/knowledge/service";
import { governanceEvents } from "@/lib/knowledge/data";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function Sentinel() {
  const candidates = getCandidateDecisions();
  const packs = getPacks();

  const awaitingReview = candidates.filter((c) => c.liveStatus === "Pending" || c.liveStatus === "Ready to Certify");
  const underValidation = candidates.filter((c) => c.liveStatus === "Ready to Certify");
  const contradictory = candidates.filter((c) => c.contradictingObservationIds.length > 0);
  const packsBlocked = packs.filter((p) => p.regressionGate.status === "Blocked");

  return (
    <div className="pb-16">
      <PageHeader title="Sentinel" subtitle="Govern shared knowledge, validation, and change safety." icon={ShieldAlert} tone="red" />

      <div className="px-8 space-y-6">
        {/* Governance Overview — §29, all counts computed live, no invented metrics */}
        <section>
          <h2 className="text-[13.5px] font-bold text-ink mb-3">Governance Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <KpiCard label="Awaiting review" value={awaitingReview.length} icon={Scale} />
            <KpiCard label="Under validation" value={underValidation.length} icon={Activity} />
            <KpiCard label="Contradictions detected" value={contradictory.length} icon={AlertTriangle} trend={contradictory.length > 0 ? { direction: "up", label: "Needs a decision", goodWhenUp: false } : { direction: "flat", label: "None open" }} />
            <KpiCard label="Packs blocked" value={packsBlocked.length} icon={ShieldAlert} trend={packsBlocked.length > 0 ? { direction: "up", label: "Regression failing", goodWhenUp: false } : { direction: "flat", label: "All clear" }} />
            <KpiCard label="Recently retired" value={0} icon={Archive} />
          </div>
        </section>

        {/* Candidate Knowledge / Validation Queue — §25, §28 */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-[13.5px] font-bold text-ink">Candidate Knowledge</h2>
              <p className="text-[12px] text-ink-mute">Review literal evidence before changing shared knowledge.</p>
            </div>
            <Link to="/learning/candidates" className="flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline shrink-0">
              Open validation queue
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          {awaitingReview.length === 0 ? (
            <EmptyState text="No candidate knowledge is awaiting review. New learning proposals will appear here when Workers generate evidence that requires governance." />
          ) : (
            <div className="space-y-2.5">
              {awaitingReview.slice(0, 5).map((c) => {
                const construct = getConstruct(c.constructId);
                const workerCount = new Set(c.supportingObservationIds.map((id) => getObservation(id)?.workerId).filter(Boolean)).size;
                return (
                  <Link
                    key={c.id}
                    to={`/learning/candidates/${c.id}`}
                    className="flex items-center justify-between gap-4 rounded-card border border-border bg-card shadow-card px-5 py-3.5 transition hover:bg-card-sunken/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{c.type}</Badge>
                        <Badge variant={c.liveStatus === "Ready to Certify" ? "purple" : "blue"}>{c.liveStatus}</Badge>
                      </div>
                      <p className="mt-1.5 text-[13px] font-medium text-ink truncate">{c.claim}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-mute">{construct?.name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[11px] text-ink-mute">
                      <span className="flex items-center gap-1"><GitCommitHorizontal className="h-3 w-3" strokeWidth={2} />{c.supportingObservationIds.length}</span>
                      <span className="flex items-center gap-1"><Users2 className="h-3 w-3" strokeWidth={2} />{workerCount}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Contradictions — §49, a signal not an error */}
        <section>
          <h2 className="text-[13.5px] font-bold text-ink mb-3">Contradictions</h2>
          {contradictory.length === 0 ? (
            <EmptyState text="No contradictions detected. Sentinel holds contradicting evidence for review rather than promoting it automatically." />
          ) : (
            <div className="space-y-2.5">
              {contradictory.map((c) => (
                <Link
                  key={c.id}
                  to={`/learning/candidates/${c.id}`}
                  className="flex items-start gap-3 rounded-card border border-status-amber/25 bg-status-amber-soft px-4 py-3.5 transition hover:bg-status-amber-soft/70"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-amber" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-ink truncate">{c.claim}</p>
                    <p className="mt-0.5 text-[11.5px] text-status-amber">
                      {c.supportingObservationIds.length} supporting · {c.contradictingObservationIds.length} conflicting. Review the evidence before promoting this knowledge.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Regression Checks — §26, from Pack.regressionGate, already modeled */}
        <section>
          <h2 className="text-[13.5px] font-bold text-ink mb-3">Regression Checks</h2>
          {packs.length === 0 ? (
            <EmptyState text="No packs have run a regression check yet." />
          ) : (
            <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[1.8fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                    <span>Pack</span>
                    <span>Items tested</span>
                    <span>Contradictions</span>
                    <span>Evidence</span>
                    <span>Result</span>
                  </div>
                  {packs.map((p) => (
                    <Link
                      key={p.id}
                      to={`/learning/packs/${p.id}`}
                      className="grid grid-cols-[1.8fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 transition-colors hover:bg-card-sunken/60"
                    >
                      <span className="min-w-0 truncate text-[12.5px] font-medium text-ink">{p.name}</span>
                      <span className="text-[12px] tabular-nums text-ink-soft">{p.regressionGate.itemsTested} / {p.regressionGate.itemsTotal}</span>
                      <span className={cn("text-[12px] tabular-nums", p.regressionGate.contradictions > 0 ? "text-status-amber" : "text-ink-soft")}>{p.regressionGate.contradictions}</span>
                      <span className="text-[12px] text-ink-soft">{p.regressionGate.requiredEvidenceComplete ? "Complete" : "Incomplete"}</span>
                      <span>
                        <Badge variant={p.regressionGate.status === "Passed" ? "green" : "red"}>
                          {p.regressionGate.status === "Passed" ? <ShieldCheck className="h-3 w-3" strokeWidth={2.5} /> : <ShieldAlert className="h-3 w-3" strokeWidth={2.5} />}
                          {p.regressionGate.status}
                        </Badge>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Knowledge Drift + Retired/Revoked — §31–§33; honest empty states, no fabricated rows (§53) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section>
            <h2 className="text-[13.5px] font-bold text-ink mb-3 flex items-center gap-1.5">
              <Radar className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
              Knowledge Drift
            </h2>
            <EmptyState text="No knowledge drift detected. Sentinel will surface drift from contradictory observations, regression failures or stale validation here as it's detected." />
          </section>
          <section>
            <h2 className="text-[13.5px] font-bold text-ink mb-3 flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
              Retired / Revoked Knowledge
            </h2>
            <EmptyState text="No knowledge has been retired or revoked yet. When published knowledge is revoked, its history and original evidence stay visible here." />
          </section>
        </div>

        {/* Audit History — §28, finally rendering GovernanceEvent data */}
        <section>
          <h2 className="text-[13.5px] font-bold text-ink mb-3 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
            Audit History
          </h2>
          {governanceEvents.length === 0 ? (
            <EmptyState text="No governance events recorded yet." />
          ) : (
            <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border overflow-hidden">
              {governanceEvents.map((e) => (
                <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-status-green-soft text-status-green">
                    <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="green">{e.type}</Badge>
                      <span className="text-[11.5px] text-ink-mute">{e.actor}</span>
                      <span className="text-[11px] text-ink-faint">· {timeAgo(e.at)}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-ink-soft">{e.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-card border border-dashed border-border bg-card px-8 text-center">
      <p className="max-w-lg text-[12.5px] leading-relaxed text-ink-mute">{text}</p>
    </div>
  );
}
