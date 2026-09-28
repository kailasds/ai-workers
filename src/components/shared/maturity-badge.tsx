import { Award } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { WorkerMaturity } from "@/lib/registry/maturity";
import { maturityMeaning } from "@/lib/registry/maturity";
import { cn } from "@/lib/utils";

const tierVariant: Record<WorkerMaturity["tier"], BadgeProps["variant"]> = {
  Silver: "neutral",
  Gold: "amber",
  Platinum: "onyx",
};

/** Compact maturity tier pill that opens a "Why {tier}?" evidence popover on click — the §7 interaction, usable inline on cards/rows without navigating away. */
export function MaturityBadge({ maturity }: { maturity: WorkerMaturity }) {
  const { tier, evidence, measured } = maturity;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" onClick={(e) => e.stopPropagation()} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Badge variant={tierVariant[tier]} className="cursor-pointer gap-1">
            <Award className="h-3 w-3" strokeWidth={2} />
            {tier}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" onClick={(e) => e.stopPropagation()} className="w-80">
        <p className="text-[13px] font-bold text-ink">Why {tier}?</p>
        <p className="mt-1 text-[11.5px] text-ink-mute">
          {measured ? "Learning maturity is based on evidence of how effectively this Worker turns experience into reusable knowledge." : "Not yet measured — no evaluation or learning history recorded yet."}
        </p>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">{maturityMeaning(tier)}</p>

        <div className="mt-3 space-y-3 text-[11.5px]">
          <EvidenceGroup title="Evaluation">
            <Row label="Historical pass rate" value={evidence.evaluation.passRate === null ? "Not measured" : `${Math.round(evidence.evaluation.passRate * 100)}%`} />
            <Row label="Gates passed" value={evidence.evaluation.gatesTotal === 0 ? "Not measured" : `${evidence.evaluation.gatesPassed} / ${evidence.evaluation.gatesTotal}`} />
          </EvidenceGroup>
          <EvidenceGroup title="Learning">
            <Row label="Observations" value={String(evidence.learning.observations)} />
            <Row label="Corroborated" value={String(evidence.learning.corroborated)} />
            <Row label="Certified" value={String(evidence.learning.certified)} />
            <Row label="Reused by other Workers" value={String(evidence.learning.reused)} />
          </EvidenceGroup>
          <EvidenceGroup title="Governance">
            <Row label="Status" value={evidence.governance.note} />
          </EvidenceGroup>
        </div>

        <p className="mt-3 border-t border-border pt-2.5 text-[10.5px] text-ink-faint">Silver → Gold → Platinum</p>
      </PopoverContent>
    </Popover>
  );
}

function EvidenceGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-1">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-ink-mute")}>{label}</span>
      <span className="font-medium text-ink tabular-nums text-right">{value}</span>
    </div>
  );
}
