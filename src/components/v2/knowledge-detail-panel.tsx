import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Archive, Ban, Repeat2 } from "lucide-react";
import { SidePanel, SidePanelContent, SidePanelDescription, SidePanelTitle } from "@/components/ui/side-panel";
import { Button } from "@/components/ui/button";
import { KnowledgeActionBar } from "@/components/v2/knowledge-actions";
import { KnowledgeStatusBadge } from "@/components/v2/status-badge";
import { kindMeta } from "@/components/v2/knowledge-card";
import { knowledgeById, useV2, workerById } from "@/lib/v2/store";
import type { Knowledge } from "@/lib/v2/types";

/** Explains why knowledge is no longer recommended, and what replaced it. */
export function LifecycleNotice({ k }: { k: Knowledge }) {
  const state = useV2();
  const replacement = knowledgeById(state, k.replacementKnowledgeId);
  const config =
    k.status === "revoked"
      ? { icon: Ban, title: "Revoked", body: "This knowledge is no longer recommended.", tone: "border-status-red/25 bg-status-red-soft/50 text-status-red" }
      : k.status === "replaced"
        ? { icon: Repeat2, title: "Replaced", body: "Newer knowledge has taken its place.", tone: "border-border-strong bg-card-sunken text-ink-soft" }
        : k.status === "retired"
          ? { icon: Archive, title: "Retired", body: "No longer recommended for future use.", tone: "border-border-strong bg-card-sunken text-ink-soft" }
          : k.status === "rejected"
            ? { icon: Ban, title: "Rejected", body: "This learning was not kept.", tone: "border-status-red/25 bg-status-red-soft/50 text-status-red" }
            : null;
  if (!config) return null;
  return (
    <div className={`rounded-control border p-3.5 ${config.tone}`}>
      <p className="flex items-center gap-1.5 text-[12px] font-bold">
        <config.icon className="h-3.5 w-3.5" strokeWidth={2} />
        {config.title}
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">{config.body}</p>
      {(k.reasonContext || k.reason) && (
        <p className="mt-2 text-[12px] text-ink-soft">
          <span className="font-semibold text-ink">Reason</span> · {k.reasonContext || k.reason}
        </p>
      )}
      {replacement && (
        <p className="mt-1 text-[12px] text-ink-soft">
          <span className="font-semibold text-ink">Replaced by</span> ·{" "}
          <Link to={`/knowledge/${replacement.id}`} className="font-medium text-accent-ink underline-offset-2 hover:underline">
            {replacement.title}
          </Link>
        </p>
      )}
    </div>
  );
}

export function HealthNotice({ k }: { k: Knowledge }) {
  if (!k.health || k.status !== "active") return null;
  return (
    <div className="rounded-control border border-status-amber/25 bg-status-amber-soft/50 p-3.5">
      <p className="flex items-center gap-1.5 text-[12px] font-bold text-status-amber">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
        {k.health === "contradictory" ? "Contradictory evidence" : "May be outdated"}
      </p>
      {k.healthNote && <p className="mt-1 text-[12px] text-ink-soft">{k.healthNote}</p>}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-ink">{children}</dd>
    </div>
  );
}

/** Preview of a knowledge item in a side panel. The full page holds the rest. */
export function KnowledgeDetailPanel({ id, onClose }: { id: string | null; onClose: () => void }) {
  const state = useV2();
  const k = knowledgeById(state, id ?? undefined);
  const source = workerById(state, k?.sourceWorkerId);
  return (
    <SidePanel open={!!k} onOpenChange={(o) => !o && onClose()}>
      <SidePanelContent>
        {k && (
          <div className="space-y-5">
            <div className="pr-8">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">{kindMeta[k.kind].label}</p>
              <SidePanelTitle className="mt-1 text-[22px] font-bold leading-snug tracking-[-0.01em] text-ink font-display">{k.title}</SidePanelTitle>
              <div className="mt-2">
                <KnowledgeStatusBadge k={k} />
              </div>
            </div>
            <SidePanelDescription className="text-[14px] leading-relaxed text-ink-soft">{k.summary}</SidePanelDescription>

            <LifecycleNotice k={k} />
            <HealthNotice k={k} />

            <dl className="space-y-3.5 border-t border-border pt-4">
              <Fact label="Scope">{k.scope === "assigned" ? `${k.usedByWorkerIds.length} Workers` : k.availableTo.join(", ") || "This Worker"}</Fact>
              <Fact label="Source">
                {k.scope === "assigned" ? "Assigned during Compose" : source ? `Learned by ${source.name}` : "Learned by a Worker"}
              </Fact>
              {k.validation && k.validation.length > 0 && (
                <Fact label="Validation">
                  {k.validation.map((v) => (
                    <span key={v} className="block">
                      {v}
                    </span>
                  ))}
                </Fact>
              )}
            </dl>

            <KnowledgeActionBar k={k} size="sm" />

            <Button asChild variant="secondary" className="w-full">
              <Link to={`/knowledge/${k.id}`}>
                View full detail
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </Button>
          </div>
        )}
      </SidePanelContent>
    </SidePanel>
  );
}
