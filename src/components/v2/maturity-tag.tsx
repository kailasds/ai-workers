import { Check, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Maturity } from "@/lib/v2/types";

export const maturityMeta: Record<Maturity, { label: string; description: string; tone: string }> = {
  silver: { label: "Silver", description: "Emerging learner", tone: "border-border-strong bg-card-sunken text-ink-soft" },
  gold: { label: "Gold", description: "Proven learner", tone: "border-status-amber/30 bg-status-amber-soft text-status-amber" },
  platinum: { label: "Platinum", description: "High-maturity learner", tone: "border-brand-300 bg-brand-100 text-brand-600" },
};

/** Learning maturity: a supporting signal, not a ranking. */
export function MaturityTag({ maturity, withDescription, className }: { maturity?: Maturity; withDescription?: boolean; className?: string }) {
  if (!maturity) return <span className={cn("text-[12px] font-medium text-ink-faint", className)}>Not yet rated</span>;
  const m = maturityMeta[maturity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      <span className={cn("rounded-full border px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider", m.tone)}>{m.label}</span>
      {withDescription && <span className="text-[12px] text-ink-mute">{m.description}</span>}
    </span>
  );
}

export function MaturityWhy({ maturity, reasons }: { maturity?: Maturity; reasons: string[] }) {
  if (!maturity) return null;
  const m = maturityMeta[maturity];
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 rounded-full text-[12px] font-medium text-accent-ink hover:underline underline-offset-2">
        <HelpCircle className="h-3 w-3" strokeWidth={2} />
        Why?
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="text-[12px] font-bold uppercase tracking-wider text-ink-mute">{m.label}</p>
        <p className="text-[14px] font-semibold text-ink">{m.description}</p>
        <ul className="mt-3 space-y-1.5">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2} />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-border pt-2 text-[12px] text-ink-mute">Learning maturity shows how well this Worker learns from experience. It is not a performance ranking.</p>
      </PopoverContent>
    </Popover>
  );
}
