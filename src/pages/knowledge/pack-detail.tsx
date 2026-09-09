import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPack, getCandidate, getConstruct, getWorker, packUsage } from "@/lib/knowledge/service";
import { cn } from "@/lib/utils";

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function PackDetail() {
  const { id } = useParams();
  const pack = getPack(id ?? "");

  if (!pack) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Pack not found.</p>
      </div>
    );
  }

  const usage = packUsage(pack.id);
  const workerIds = Array.from(new Set(usage.map((u) => u.workerId)));
  const items = pack.knowledgeItemIds.map((cid) => getCandidate(cid)).filter(Boolean);

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/knowledge/packs" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Packs
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant={pack.status === "Published" ? "green" : pack.status === "Blocked" ? "red" : "neutral"}>{pack.status}</Badge>
          <Badge variant="outline">v{pack.version}</Badge>
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-ink">{pack.name}</h1>
        <p className="mt-1 text-[13px] text-ink-mute">
          {pack.context} · Published {timeAgo(pack.publishedAt)}
          {pack.publishedBy && ` by ${pack.publishedBy}`}
        </p>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div
            className={cn(
              "rounded-card border p-5",
              pack.regressionGate.status === "Passed" ? "border-status-green/25 bg-status-green-soft" : "border-status-red/25 bg-status-red-soft"
            )}
          >
            <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              {pack.regressionGate.status === "Passed" ? (
                <ShieldCheck className="h-4 w-4 text-status-green" strokeWidth={2.25} />
              ) : (
                <ShieldAlert className="h-4 w-4 text-status-red" strokeWidth={2.25} />
              )}
              Regression {pack.regressionGate.status === "Passed" ? "passed" : "blocked"}
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Items tested" value={`${pack.regressionGate.itemsTested} / ${pack.regressionGate.itemsTotal}`} />
              <Field label="Previous pass rate" value={pack.regressionGate.previousPassRate === null ? "Not measured" : `${pack.regressionGate.previousPassRate}%`} />
              <Field label="Contradictions" value={String(pack.regressionGate.contradictions)} />
              <Field label="Required evidence" value={pack.regressionGate.requiredEvidenceComplete ? "Complete" : "Incomplete"} />
            </div>
            {pack.regressionGate.blockingItemIds.length > 0 && (
              <div className="mt-3 pt-3 border-t border-status-red/20">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-status-red mb-1.5">Blocked by</p>
                <div className="flex flex-wrap gap-1.5">
                  {pack.regressionGate.blockingItemIds.map((cid) => {
                    const c = getCandidate(cid);
                    return (
                      <Link key={cid} to={`/knowledge/candidates/${cid}`}>
                        <Badge variant="red" className="hover:opacity-80 cursor-pointer">
                          <Eye className="h-3 w-3" strokeWidth={2} />
                          {c?.claim.slice(0, 40)}…
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Section title="Knowledge Included">
            {items.length === 0 ? (
              <p className="text-[12.5px] text-ink-mute">No knowledge items yet.</p>
            ) : (
              <div className="space-y-1.5">
                {items.map((item) => {
                  const construct = getConstruct(item!.constructId);
                  return (
                    <Link
                      key={item!.id}
                      to={`/knowledge/candidates/${item!.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5 transition hover:bg-card-sunken"
                    >
                      <span className="min-w-0">
                        <span className="block text-[12.5px] text-ink truncate">{item!.claim}</span>
                        <span className="block text-[11px] text-ink-mute">{construct?.name}</span>
                      </span>
                      <Badge variant="outline" className="shrink-0">
                        {item!.type}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>

          {pack.limitations.length > 0 && (
            <Section title="Known Limitations">
              <ul className="space-y-1.5">
                {pack.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Version History">
            <div className="space-y-1.5">
              {pack.versions.map((v) => (
                <div key={v.version} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium text-ink">v{v.version}</span>
                    <span className="block text-[11px] text-ink-mute truncate">{v.summary}</span>
                  </span>
                  <Badge variant={v.status === "Published" ? "green" : v.status === "Blocked" ? "red" : "neutral"} className="shrink-0">
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Pack Impact</p>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <MiniStat label="Knowledge retrieved" value={usage.length} />
              <MiniStat label="Workers using it" value={workerIds.length} />
              <MiniStat label="Runs influenced" value={usage.length} />
              <MiniStat label="Successful outcomes" value={usage.filter((u) => u.outcome === "Met").length} />
            </div>
          </div>

          {workerIds.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Workers Using It</p>
              <div className="space-y-1.5">
                {workerIds.map((wid) => (
                  <p key={wid} className="text-[12px] text-ink-soft">
                    {getWorker(wid)?.name}
                  </p>
                ))}
              </div>
            </div>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card-sunken px-3 py-2">
      <p className="text-[10.5px] text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[14px] font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
