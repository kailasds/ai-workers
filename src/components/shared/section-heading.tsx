import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  blue: "bg-status-blue-soft text-status-blue",
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
  red: "bg-status-red-soft text-status-red",
  purple: "bg-status-purple-soft text-status-purple",
  accent: "bg-accent-soft text-accent-ink",
  neutral: "bg-card-sunken text-ink-soft",
};

export function SectionHeading({
  icon: Icon,
  tone = "neutral",
  title,
  subtitle,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: keyof typeof toneClasses;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 mb-3.5", className)}>
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", toneClasses[tone])}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[16px] font-bold text-ink leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-mute">{subtitle}</p>}
      </div>
    </div>
  );
}
