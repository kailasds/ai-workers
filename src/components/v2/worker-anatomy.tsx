import { Brain, ClipboardCheck, FileText, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export type AnatomyPart = "intent" | "brain" | "evolution" | "dod";

/** A visual summary of a Worker: identity on top, three parts beneath, one definition of done. */
export function WorkerAnatomy({
  name,
  parts,
  active,
  onSelect,
}: {
  name: string;
  parts: Record<AnatomyPart, string>;
  active?: AnatomyPart | null;
  onSelect?: (part: AnatomyPart) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-full items-center gap-2 rounded-full border border-border-strong bg-card-sunken px-4 py-2">
        <Users className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
        <span className="truncate text-[14px] font-bold text-ink">{name}</span>
      </div>

      <Connector />
      <div className="relative w-full max-w-2xl">
        <div className="absolute left-[16.66%] right-[16.66%] top-0 hidden h-px bg-border-strong sm:block" aria-hidden />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Part icon={FileText} label="Intent" detail={parts.intent} id="intent" active={active} onSelect={onSelect} />
          <Part icon={Brain} label="Brain" detail={parts.brain} id="brain" active={active} onSelect={onSelect} />
          <Part icon={TrendingUp} label="Evolution" detail={parts.evolution} id="evolution" active={active} onSelect={onSelect} />
        </div>
      </div>

      <Connector />
      <Part icon={ClipboardCheck} label="Definition of Done" detail={parts.dod} id="dod" active={active} onSelect={onSelect} className="w-full max-w-xs" />
    </div>
  );
}

function Connector() {
  return <div className="h-4 w-px bg-border-strong" aria-hidden />;
}

function Part({
  icon: Icon,
  label,
  detail,
  id,
  active,
  onSelect,
  className,
}: {
  icon: Icon;
  label: string;
  detail: string;
  id: AnatomyPart;
  active?: AnatomyPart | null;
  onSelect?: (part: AnatomyPart) => void;
  className?: string;
}) {
  const isActive = active === id;
  const body = (
    <>
      <div className="grid h-8 w-8 shrink-0 place-items-center text-ink-soft">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{label}</p>
        <p className="line-clamp-2 text-[12px] leading-snug text-ink-mute">{detail}</p>
      </div>
    </>
  );
  const cls = cn(
    "flex items-start gap-2.5 rounded-card border bg-card p-3 text-left shadow-card",
    isActive ? "border-brand-500" : "border-border",
    onSelect && " hover:border-brand-300",
    className
  );
  return onSelect ? (
    <button type="button" onClick={() => onSelect(id)} aria-pressed={isActive} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
