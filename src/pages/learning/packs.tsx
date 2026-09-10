import { Link } from "react-router-dom";
import { Package, Users2, GitCommitHorizontal, Sparkle, ChevronRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { getPacks, packSummary, packUsage } from "@/lib/knowledge/service";

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function Packs() {
  const packs = getPacks();
  const summary = packSummary();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Published packs" value={summary.publishedPacks} icon={Package} tone="purple" />
        <StatCard label="Knowledge items" value={summary.knowledgeItems} icon={GitCommitHorizontal} tone="blue" />
        <StatCard label="Workers using packs" value={summary.workersUsing} icon={Users2} tone="green" />
        <StatCard label="Runs influenced" value={summary.runsInfluenced} icon={Sparkle} tone="accent" />
        <StatCard label="Latest publication" value={summary.latestPublication ? timeAgo(summary.latestPublication) : "—"} icon={ShieldCheck} tone="neutral" />
      </div>

      {packs.length === 0 ? (
        <div className="rounded-card border border-border bg-card shadow-card p-10 text-center">
          <p className="text-[14px] font-semibold text-ink">No published packs</p>
          <p className="mt-1 text-[12.5px] text-ink-mute">A pack appears only after its regression gate passes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((p) => {
            const usage = packUsage(p.id);
            const workersUsing = new Set(usage.map((u) => u.workerId)).size;
            return (
              <Link
                key={p.id}
                to={`/learning/packs/${p.id}`}
                className="flex rounded-card border border-border bg-card shadow-card overflow-hidden transition hover:bg-card-sunken/30"
              >
                <span className={p.status === "Published" ? "w-1 shrink-0 bg-status-green" : p.status === "Blocked" ? "w-1 shrink-0 bg-status-red" : "w-1 shrink-0 bg-border-strong"} />
                <div className="flex-1 min-w-0 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-bold text-ink">{p.name}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-mute">
                        v{p.version} · {p.context}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={p.status === "Published" ? "green" : p.status === "Blocked" ? "red" : "neutral"}>{p.status}</Badge>
                      <Badge variant={p.regressionGate.status === "Passed" ? "green" : "red"}>
                        {p.regressionGate.status === "Passed" ? (
                          <>
                            <ShieldCheck className="h-3 w-3" strokeWidth={2.5} /> Regression passed
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3 w-3" strokeWidth={2.5} /> Regression blocked
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-[11.5px] text-ink-mute">
                    <span>{p.knowledgeItemIds.length} knowledge items</span>
                    <span>{workersUsing} Workers using it</span>
                    <span>Last published {timeAgo(p.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center pr-5">
                  <ChevronRight className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
