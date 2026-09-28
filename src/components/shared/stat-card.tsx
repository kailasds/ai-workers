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

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "accent",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-4">
      <div className="flex items-center gap-2.5">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <p className="text-[12.5px] font-medium text-ink-soft leading-tight">{label}</p>
      </div>
      <p className="mt-3 text-[24px] leading-none font-bold tracking-[-0.01em] tabular-nums text-ink">{value}</p>
      {subtext && <p className="mt-1.5 text-[11.5px] text-ink-mute">{subtext}</p>}
    </div>
  );
}
