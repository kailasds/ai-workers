import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Circle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coverageRow, getWorker } from "@/lib/knowledge/service";
import type { ConstructStatus } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const statusTone: Record<ConstructStatus, "neutral" | "blue" | "amber" | "green" | "purple"> = {
  "Nothing yet": "neutral",
  Observed: "blue",
  Corroborated: "amber",
  Certified: "green",
  Published: "purple",
};

const stages: ConstructStatus[] = ["Observed", "Corroborated", "Certified", "Published"];

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function ConstructDetail() {
  const { id } = useParams();
  const row = coverageRow(id ?? "");

  if (!row) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Construct not found.</p>
      </div>
    );
  }

  const { construct } = row;
  const idx = stages.indexOf(construct.liveStatus);
  const workerIds = Array.from(new Set(row.observations.map((o) => o.workerId)));

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/knowledge/coverage" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Coverage
          </Link>
          <Button asChild variant="secondary" size="sm">
            <Link to={`/knowledge?focus=${construct.id}`}>
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Focus in graph
            </Link>
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{construct.category}</Badge>
          <Badge variant={statusTone[construct.liveStatus]}>{construct.liveStatus}</Badge>
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-ink">{construct.name}</h1>
        <p className="mt-1 text-[12.5px] font-mono text-ink-faint">{construct.technicalKey}</p>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <Row label="Supporting Workers">
              <div className="flex flex-wrap gap-1.5">
                {workerIds.length === 0 && <span className="text-[12.5px] text-ink-mute">None yet.</span>}
                {workerIds.map((wid) => (
                  <Badge key={wid} variant="outline">
                    {getWorker(wid)?.name}
                  </Badge>
                ))}
              </div>
            </Row>
            <Row label="Supporting observations">
              <div className="space-y-1.5">
                {row.observations.map((o) => (
                  <Link
                    key={o.id}
                    to={`/knowledge/observations/${o.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition hover:bg-card-sunken"
                  >
                    <span className="text-[12px] text-ink truncate">{o.summary}</span>
                    <Badge variant={o.contradicts && o.contradicts.length > 0 ? "amber" : "neutral"} className="shrink-0">
                      {o.outcome}
                    </Badge>
                  </Link>
                ))}
                {row.observations.length === 0 && <p className="text-[12.5px] text-ink-mute">No observations recorded yet.</p>}
              </div>
            </Row>
            {row.contradictions > 0 && (
              <Row label="Contradictions" highlight>
                <p className="text-[12.5px] text-status-amber font-medium">
                  {row.contradictions} observation{row.contradictions === 1 ? "" : "s"} conflict with another recorded observation for this construct.
                </p>
              </Row>
            )}
            <Row label="Last observed">
              <p className="text-[12.5px] text-ink">{timeAgo(row.lastObserved)}</p>
            </Row>
          </div>

          {construct.blockingReason && (
            <div className="rounded-card border border-status-amber/25 bg-status-amber-soft p-4">
              <p className="text-[12.5px] text-ink font-medium">{construct.blockingReason}</p>
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-3">Evidence Maturity</p>
            <div className="space-y-0">
              {stages.map((s, i) => (
                <div key={s} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                        i <= idx ? "bg-accent text-white" : "border border-border-strong bg-card"
                      )}
                    >
                      {i <= idx ? <Check className="h-3 w-3" strokeWidth={3} /> : <Circle className="h-1.5 w-1.5 fill-current text-ink-faint" />}
                    </span>
                    {i < stages.length - 1 && <span className={cn("w-px flex-1 my-0.5", i < idx ? "bg-accent" : "bg-border")} style={{ minHeight: 18 }} />}
                  </div>
                  <p className={cn("text-[12.5px] pb-3.5", i === idx ? "font-semibold text-ink" : i < idx ? "text-ink-soft" : "text-ink-faint")}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-2.5">
            <Field label="Mappings" value={String(row.mappingCount)} />
            <Field label="Pitfalls" value={String(row.pitfallCount)} />
            <Field label="Awaiting evidence" value={String(row.awaitingCount)} />
            <Field label="Runs" value={String(row.runCount)} />
          </div>

          {row.candidate && (
            <div className="pt-3 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Candidate Decision</p>
              <Link to={`/knowledge/candidates/${row.candidate.id}`} className="text-[12.5px] font-medium text-accent-ink hover:underline">
                {row.candidate.type}: {row.candidate.claim.slice(0, 60)}…
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("px-5 py-3.5 border-b border-border last:border-b-0", highlight && "bg-status-amber-soft/40")}>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11.5px] text-ink-mute">{label}</span>
      <span className="text-[12.5px] font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}
