import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkle, Check, X as XIcon, Pencil, ArrowUpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approvals } from "@/lib/data";
import { cn } from "@/lib/utils";

const riskTone = { Low: "green", Medium: "amber", High: "red" } as const;

export default function GlobalApprovals() {
  const [expanded, setExpanded] = useState<string | null>(approvals[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});

  return (
    <div className="pb-10">
      <PageHeader title="Approval Center" subtitle="Human intervention queue for your AI Workforce." />

      <div className="px-8 space-y-3">
        {approvals.map((a) => {
          const isOpen = expanded === a.id;
          const outcome = resolved[a.id];
          return (
            <div key={a.id} className={cn("rounded-card border bg-card shadow-card overflow-hidden", isOpen ? "border-border-strong" : "border-border")}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(isOpen ? null : a.id)}
                onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : a.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13.5px] font-medium text-ink">{a.type}</p>
                    <Badge variant={riskTone[a.risk]}>{a.risk} risk</Badge>
                    {outcome && (
                      <Badge variant={outcome === "approved" ? "green" : "red"}>
                        {outcome === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink-mute">{a.workerName}</p>
                  <p className="mt-1 text-[12.5px] text-ink-soft">{a.summary}</p>
                </div>
                {!outcome && (
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft">
                    {isOpen ? "Collapse" : "Review"}
                  </span>
                )}
              </div>

              {isOpen && !outcome && (
                <div className="border-t border-border px-5 py-4 space-y-4">
                  <div className="rounded-[12px] bg-accent-soft px-4 py-3 flex items-start gap-2.5">
                    <Sparkle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-[12.5px] text-accent-ink">{a.aiRecommendation}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Evidence</p>
                      <ul className="space-y-1.5">
                        {a.evidence.map((e) => (
                          <li key={e} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Policy</p>
                        <p className="text-[12.5px] text-ink-soft">{a.policy}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Impact</p>
                        <p className="text-[12.5px] text-ink-soft">{a.impact}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-1">Alternatives considered</p>
                        <p className="text-[12.5px] text-ink-soft">{a.alternatives[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button size="sm" onClick={() => setResolved((r) => ({ ...r, [a.id]: "approved" }))}>
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Edit then Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setResolved((r) => ({ ...r, [a.id]: "rejected" }))}>
                      <XIcon className="h-3.5 w-3.5" strokeWidth={2} />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ArrowUpCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Escalate
                    </Button>
                    <Link
                      to={`/workers/${a.workerId}`}
                      className="ml-auto text-[12px] text-ink-mute hover:text-ink transition-colors"
                    >
                      View worker →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
