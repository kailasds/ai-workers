import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { workerTypes } from "./script";

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
          {workerTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => t.available && onSelect(t.id)}
              disabled={!t.available}
              className={cn(
                "group flex flex-col rounded-[14px] border p-5 text-left transition-all",
                t.available
                  ? "border-border hover:border-accent-border hover:bg-accent-soft/40 hover:-translate-y-0.5 hover:shadow-float"
                  : "border-border opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn("grid h-10 w-10 place-items-center rounded-[10px]", t.available ? "bg-accent-soft text-accent-ink" : "bg-card-sunken text-ink-faint")}>
                  <t.icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                {t.available && (
                  <ArrowRight className="h-4 w-4 text-ink-faint opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" strokeWidth={2} />
                )}
              </div>
              <p className={cn("mt-4 text-[15px] font-bold", t.available ? "text-ink" : "text-ink-mute")}>{t.name}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mute">{t.description}</p>
              {!t.available && (
                <Badge variant="neutral" className="mt-3 w-fit">
                  Available later
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
