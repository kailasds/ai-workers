import { useState } from "react";
import { Award, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkerMaturity } from "@/lib/registry/maturity";
import { maturityMeaning } from "@/lib/registry/maturity";

const tierClass: Record<WorkerMaturity["tier"], string> = {
  Silver: "bg-card-sunken text-ink-soft",
  Gold: "bg-status-amber-soft text-status-amber",
  Platinum: "bg-onyx text-white",
};

export function MaturityCard({ maturity }: { maturity: WorkerMaturity }) {
  const [open, setOpen] = useState(false);
  const { tier, evidence, measured } = maturity;

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <div className="flex items-center gap-2">
        <div className={cn("grid h-8 w-8 place-items-center rounded-full", tierClass[tier])}>
          <Award className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-ink">{tier} maturity</h3>
          <p className="text-[11px] text-ink-mute">{measured ? "Evidence-based readiness tier" : "Not yet measured"}</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-mute">{maturityMeaning(tier)}</p>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-ink-soft hover:bg-card-sunken"
      >
        Why {tier}?
        {open ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-[12px]">
          <EvidenceGroup title="Evaluation">
            <EvidenceRow label="Historical pass rate" value={evidence.evaluation.passRate === null ? "Not measured" : `${Math.round(evidence.evaluation.passRate * 100)}%`} />
            <EvidenceRow label="Gates passed" value={evidence.evaluation.gatesTotal === 0 ? "Not measured" : `${evidence.evaluation.gatesPassed} / ${evidence.evaluation.gatesTotal}`} />
          </EvidenceGroup>
          <EvidenceGroup title="Learning">
            <EvidenceRow label="Observations" value={String(evidence.learning.observations)} />
            <EvidenceRow label="Corroborated" value={String(evidence.learning.corroborated)} />
            <EvidenceRow label="Certified" value={String(evidence.learning.certified)} />
            <EvidenceRow label="Reused" value={String(evidence.learning.reused)} />
          </EvidenceGroup>
          <EvidenceGroup title="Outcomes">
            <EvidenceRow label="Successful outcomes" value={String(evidence.outcomes.successful)} />
            <EvidenceRow label="Total runs" value={String(evidence.outcomes.total)} />
          </EvidenceGroup>
          <EvidenceGroup title="Governance">
            <EvidenceRow label="Status" value={evidence.governance.note} />
          </EvidenceGroup>
        </div>
      )}
    </div>
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

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-mute">{label}</span>
      <span className="font-medium text-ink tabular-nums">{value}</span>
    </div>
  );
}
