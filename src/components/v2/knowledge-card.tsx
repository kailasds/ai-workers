import { BookOpen, ClipboardList, FileCode2, Lightbulb, ShieldCheck } from "lucide-react";
import { KnowledgeStatusBadge } from "@/components/v2/status-badge";
import { KnowledgeActionBar } from "@/components/v2/knowledge-actions";
import { useV2, workerById } from "@/lib/v2/store";
import { cn } from "@/lib/utils";
import type { Knowledge, KnowledgeKind } from "@/lib/v2/types";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export const kindMeta: Record<KnowledgeKind, { label: string; icon: Icon }> = {
  skill: { label: "Skill", icon: FileCode2 },
  company: { label: "Company knowledge", icon: BookOpen },
  rule: { label: "Rule", icon: ClipboardList },
  safety: { label: "Safety", icon: ShieldCheck },
  pattern: { label: "Pattern", icon: Lightbulb },
};

export function usedByLabel(k: Knowledge, workerNames: (string | undefined)[]) {
  const names = workerNames.filter(Boolean) as string[];
  if (k.usedByWorkerIds.length === 0) return "No Workers";
  if (k.usedByWorkerIds.length === 1) return names[0] ?? "1 Worker";
  return `${k.usedByWorkerIds.length} Workers`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">{label}</dt>
      <dd className="mt-0.5 text-[12px] font-medium text-ink">{children}</dd>
    </div>
  );
}

/** One knowledge item. The title opens the preview; actions sit above the click target. */
export function KnowledgeCard({ k, onOpen }: { k: Knowledge; onOpen: (id: string) => void }) {
  const state = useV2();
  const kind = kindMeta[k.kind];
  const source = workerById(state, k.sourceWorkerId);
  const dim = k.status === "revoked" || k.status === "replaced" || k.status === "retired" || k.status === "rejected";

  return (
    <div className={cn("relative flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-card hover:shadow-float", dim && "bg-card-sunken/60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center text-ink-soft">
            <kind.icon className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onOpen(k.id)}
              className={cn("text-left text-[14px] font-semibold leading-snug text-ink after:absolute after:inset-0 after:content-[''] after:rounded-card", dim && "text-ink-soft")}
            >
              {k.title}
            </button>
            <p className="mt-0.5 text-[12px] text-ink-mute">{kind.label}</p>
          </div>
        </div>
        <KnowledgeStatusBadge k={k} className="shrink-0" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3.5">
        {k.scope === "assigned" && (
          <>
            <Field label="Used by">{k.usedByWorkerIds.length} Workers</Field>
            <Field label="Source">Assigned during Compose</Field>
          </>
        )}
        {k.scope === "gained" && (
          <>
            <Field label="Learned by">{source?.name ?? "A Worker"}</Field>
            <Field label="Scope">{k.sharedAsId ? "Shared with platform" : (k.availableTo[0] ?? "This Worker")}</Field>
          </>
        )}
        {k.scope === "platform" && (
          <>
            <Field label="Available to">{k.availableTo.join(", ")}</Field>
            <Field label="Used by">{k.usedByWorkerIds.length === 0 ? "No Workers" : "Relevant Workers"}</Field>
          </>
        )}
      </dl>

      {k.scope === "gained" && k.status === "active" && !k.sharedAsId && (
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
          <KnowledgeActionBar k={k} size="sm" />
        </div>
      )}
    </div>
  );
}
