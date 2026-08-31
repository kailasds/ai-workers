import type { ReactNode } from "react";
import { FileText, ShieldCheck, Bot, Zap, Flag, Check } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const evidenceItems = [
  {
    source: "Legacy Application Analysis",
    ref: "ClaimsService.cbl",
    note: "Transaction architecture matches Pattern B.",
  },
  {
    source: "Enterprise Architecture Guideline",
    ref: "Version 4.2",
    note: "Pattern B is the recommended approach for this transaction shape.",
  },
  {
    source: "Historical Approved Decision",
    ref: "Claims Platform Modernization, 2026-03",
    note: "Pattern B was used successfully on a comparable module.",
  },
];

export function DecisionEvidenceDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Why did the worker choose this architecture?</DialogTitle>
          <DialogDescription>Auditable decision evidence — not a reconstructed chain of thought.</DialogDescription>
        </DialogHeader>

        <div className="space-y-0">
          <EvidenceStage label="Decision" icon={Flag} tone="accent">
            <p className="text-[14px] font-medium text-ink">Selected: Enterprise Java Pattern B</p>
          </EvidenceStage>

          <EvidenceStage label="Evidence" icon={FileText} tone="blue">
            <div className="space-y-2.5">
              {evidenceItems.map((e) => (
                <div key={e.source} className="rounded-[10px] border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-medium text-ink">{e.source}</p>
                    <span className="text-[11px] text-ink-mute">{e.ref}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-soft">{e.note}</p>
                </div>
              ))}
            </div>
          </EvidenceStage>

          <EvidenceStage label="Policy" icon={ShieldCheck} tone="purple">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-ink">Enterprise Architecture Policy</p>
              <Badge variant="green">
                <Check className="h-3 w-3" strokeWidth={2.5} />
                Compliant
              </Badge>
            </div>
          </EvidenceStage>

          <EvidenceStage label="Agent" icon={Bot} tone="green">
            <p className="text-[13px] text-ink">Architecture Agent</p>
          </EvidenceStage>

          <EvidenceStage label="Action" icon={Zap} tone="amber">
            <p className="text-[13px] text-ink">Migration strategy updated</p>
          </EvidenceStage>

          <EvidenceStage label="Outcome" icon={Check} tone="green" last>
            <p className="text-[13px] text-ink">Java architecture plan generated</p>
          </EvidenceStage>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const toneMap = {
  accent: "bg-accent-soft text-accent-ink",
  blue: "bg-status-blue-soft text-status-blue",
  purple: "bg-status-purple-soft text-status-purple",
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
};

function EvidenceStage({
  label,
  icon: Icon,
  tone,
  last,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: keyof typeof toneMap;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
        {!last && <div className="w-px flex-1 bg-border my-1" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "pb-1" : "pb-5"}`}>
        <p className="text-[10.5px] uppercase tracking-wider text-ink-mute mb-1.5">{label}</p>
        {children}
      </div>
    </div>
  );
}
