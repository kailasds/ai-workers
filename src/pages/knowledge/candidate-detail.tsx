import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkle, Check, X as XIcon, Clock, GitCommitHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCandidateDecisionLive, getConstruct, getObservation, getWorker } from "@/lib/knowledge/service";
import { acceptCandidate, rejectCandidate, deferCandidate, useKnowledgeOverlayVersion } from "@/lib/knowledge/store";
import type { CandidateStatus } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const statusTone: Record<CandidateStatus, "neutral" | "blue" | "amber" | "green" | "red" | "purple"> = {
  Pending: "blue",
  "Ready to Certify": "purple",
  Contradictory: "amber",
  Deferred: "neutral",
  Accepted: "green",
  Rejected: "red",
};

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function CandidateDetail() {
  useKnowledgeOverlayVersion();
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = getCandidateDecisionLive(id ?? "");

  if (!candidate) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Candidate decision not found.</p>
      </div>
    );
  }

  const construct = getConstruct(candidate.constructId);
  const supporting = candidate.supportingObservationIds.map((oid) => getObservation(oid)).filter(Boolean);
  const contradicting = candidate.contradictingObservationIds.map((oid) => getObservation(oid)).filter(Boolean);
  const workerIds = Array.from(new Set(supporting.map((o) => o!.workerId)));
  const runIds = Array.from(new Set(supporting.map((o) => o!.runId)));
  const decided = candidate.liveStatus === "Accepted" || candidate.liveStatus === "Rejected" || candidate.liveStatus === "Deferred";

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/knowledge/candidates" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Candidate Decisions
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{candidate.type}</Badge>
          <Badge variant={statusTone[candidate.liveStatus]}>{candidate.liveStatus}</Badge>
        </div>
        <h1 className="mt-1.5 text-[22px] font-bold tracking-[-0.02em] text-ink leading-snug">{candidate.claim}</h1>
        {construct && (
          <p className="mt-1 text-[13px] text-ink-mute">
            Construct: <Link to={`/knowledge/constructs/${construct.id}`} className="text-accent-ink hover:underline">{construct.name}</Link>
          </p>
        )}
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-card bg-accent-soft border border-accent-border p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink mb-1.5">
              <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
              AI Recommendation
            </p>
            <p className="text-[13px] leading-relaxed text-ink">{candidate.aiRecommendation}</p>
            <div className="mt-3 pt-3 border-t border-accent-border/70 flex flex-wrap gap-1.5">
              {workerIds.map((wid) => (
                <Badge key={wid} variant="outline">
                  {getWorker(wid)?.name.split(" · ")[1] ?? getWorker(wid)?.name}
                </Badge>
              ))}
              {runIds.map((rid) => (
                <Badge key={rid} variant="outline" className="font-mono">
                  run {rid.slice(0, 8)}
                </Badge>
              ))}
            </div>
          </div>

          <Section title="Supporting Evidence">
            {supporting.length === 0 ? (
              <p className="text-[12.5px] text-ink-mute">No supporting observations recorded yet.</p>
            ) : (
              <div className="space-y-1.5">
                {supporting.map((o) => (
                  <Link
                    key={o!.id}
                    to={`/knowledge/observations/${o!.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5 transition hover:bg-card-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block text-[12.5px] text-ink truncate">{o!.summary}</span>
                      <span className="block text-[11px] text-ink-mute">{getWorker(o!.workerId)?.name}</span>
                    </span>
                    <Badge variant="green" className="shrink-0">
                      {o!.outcome}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {contradicting.length > 0 && (
            <Section title="Contradicting Evidence">
              <div className="space-y-1.5">
                {contradicting.map((o) => (
                  <Link
                    key={o!.id}
                    to={`/knowledge/observations/${o!.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-status-amber/25 bg-status-amber-soft px-3.5 py-2.5 transition hover:bg-status-amber-soft/70"
                  >
                    <span className="text-[12.5px] text-ink truncate">{o!.summary}</span>
                    <Badge variant="amber" className="shrink-0">
                      Conflicting
                    </Badge>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          <Section title="Decision History">
            <div className="space-y-0">
              {candidate.liveHistory.map((h, i) => (
                <div key={`${h.stage}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1" />
                    {i < candidate.liveHistory.length - 1 && <span className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3.5 min-w-0">
                    <p className="text-[12.5px] text-ink">{h.stage}</p>
                    {h.note && <p className="text-[11.5px] text-ink-mute">{h.note}</p>}
                    <p className="text-[11px] text-ink-faint">{timeAgo(h.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Decision</p>
          {decided ? (
            <div className={cn("rounded-lg px-3.5 py-3", candidate.liveStatus === "Accepted" ? "bg-status-green-soft" : candidate.liveStatus === "Rejected" ? "bg-status-red-soft" : "bg-card-sunken")}>
              <p className="text-[12.5px] font-medium text-ink">
                This candidate has been {candidate.liveStatus.toLowerCase()}
                {candidate.liveStatus === "Accepted" && construct ? ` — ${construct.name} is now certified.` : "."}
              </p>
            </div>
          ) : (
            <>
              <Button className="w-full" onClick={() => acceptCandidate(candidate.id)}>
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                Accept
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => deferCandidate(candidate.id)}>
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                Defer
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => rejectCandidate(candidate.id)}>
                <XIcon className="h-3.5 w-3.5" strokeWidth={2} />
                Reject
              </Button>
            </>
          )}

          <div className="pt-3 mt-1 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1 text-ink-mute">
                <GitCommitHorizontal className="h-3 w-3" strokeWidth={2} />
                Supporting observations
              </span>
              <span className="font-semibold text-ink tabular-nums">{supporting.length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-mute">Contributing Workers</span>
              <span className="font-semibold text-ink tabular-nums">{workerIds.length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-mute">Supporting runs</span>
              <span className="font-semibold text-ink tabular-nums">{runIds.length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-mute">Contradicting</span>
              <span className={cn("font-semibold tabular-nums", contradicting.length > 0 ? "text-status-amber" : "text-ink")}>{contradicting.length}</span>
            </div>
          </div>

          {candidate.liveStatus === "Accepted" && (
            <Button variant="secondary" className="w-full mt-1" onClick={() => navigate("/knowledge/packs")}>
              Add to draft pack
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <p className="text-[13.5px] font-bold text-ink mb-3">{title}</p>
      {children}
    </div>
  );
}
