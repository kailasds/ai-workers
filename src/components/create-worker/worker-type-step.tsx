import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { workerTypes } from "./script";

const typeTone: Record<string, { icon: string; blob: string; hover: string }> = {
  modernization: {
    icon: "bg-status-blue-soft text-status-blue",
    blob: "bg-status-blue/10",
    hover: "hover:border-status-blue/40 hover:bg-status-blue-soft/25",
  },
  fullstack: {
    icon: "bg-status-purple-soft text-status-purple",
    blob: "bg-status-purple/10",
    hover: "hover:border-status-purple/40 hover:bg-status-purple-soft/25",
  },
  quality: {
    icon: "bg-status-amber-soft text-status-amber",
    blob: "bg-status-amber/10",
    hover: "hover:border-status-amber/40 hover:bg-status-amber-soft/25",
  },
};

export function WorkerTypeStep({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-4 text-[12px] font-medium text-accent-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Choosing the kind of work
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-10">
        <div className="text-center">
          <h2 className="text-[22px] font-bold tracking-[-0.01em] text-ink font-display">Choose a Worker type</h2>
          <p className="mt-1.5 text-[13px] text-ink-mute">Select the work category. The next step assigns its identity.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {workerTypes.map((t) => {
            const tone = typeTone[t.id] ?? typeTone.modernization;
            return (
              <button
                key={t.id}
                onClick={() => t.available && onSelect(t.id)}
                disabled={!t.available}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[16px] border p-5 text-left transition-all",
                  t.available
                    ? cn("border-border", tone.hover, "hover:-translate-y-0.5 hover:shadow-float")
                    : "border-border opacity-60 cursor-not-allowed"
                )}
              >
                <div
                  aria-hidden
                  className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-110", tone.blob)}
                />

                <div className="relative flex items-start justify-between gap-2">
                  <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-[14px]", t.available ? tone.icon : "bg-card-sunken text-ink-faint")}>
                    <t.icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  {t.available ? (
                    <Badge variant="green" dot className="shrink-0">
                      Available now
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="shrink-0">
                      Available later
                    </Badge>
                  )}
                </div>

                <p className={cn("relative mt-4 text-[15.5px] font-bold leading-snug", t.available ? "text-ink" : "text-ink-mute")}>{t.name}</p>
                <p className="relative mt-1.5 text-[12px] leading-relaxed text-ink-mute">{t.description}</p>

                {t.available && (
                  <div className="relative mt-4 flex items-center gap-1.5 border-t border-border pt-3.5 text-[12px] font-semibold text-accent-ink">
                    Start building
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
