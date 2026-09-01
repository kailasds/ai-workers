import { useState } from "react";
import { Sparkle, ArrowUp, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const suggestions = [
  "What workers need attention?",
  "Why did the COBOL Modernization Worker pause?",
  "Which workers are Autonomous?",
  "What is the COBOL Modernization Worker's Definition of Done status?",
];

const canned: Record<string, string> = {
  "What workers need attention?":
    "4 items need attention: an AI Sentinel intervention on COBOL Modernization Worker (data reconciliation variance), a Needs Review work item, and 2 pending approvals — Underwriting Analyst and a learning candidate awaiting governed review.",
  "Why did the COBOL Modernization Worker pause?":
    "AI Sentinel paused execution after a data reconciliation variance was detected on 3 of 1,240 replayed transactions — a rounding tolerance issue on the Data Integrity checkpoint. It's awaiting human review before resuming.",
  "Which workers are Autonomous?":
    "None yet — every worker in this workforce is currently Guarded or Supervised. Autonomous status is only granted after sustained certification history.",
  "What is the COBOL Modernization Worker's Definition of Done status?":
    "Ready for Review — 12 of 17 checkpoints have passed across Functional Equivalence, Validation, Code Quality, Data Integrity and Governance. Data Integrity is the section still outstanding.",
};

export function AskWorkforceAI() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  function ask(q: string) {
    setQuery(q);
    setThinking(true);
    setAnswer(null);
    window.setTimeout(() => {
      setThinking(false);
      setAnswer(canned[q] ?? "I looked across your workforce and didn't find anything matching that yet — try one of the suggested questions.");
    }, 650);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQuery("");
          setAnswer(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft transition hover:border-accent-border hover:text-accent-ink",
            open && "border-accent-border text-accent-ink"
          )}
        >
          <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ask Workforce AI
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-full border border-border-strong bg-card-sunken px-3.5 h-9">
            <Sparkle className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={1.5} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && query.trim() && ask(query.trim())}
              placeholder="Ask about your workforce…"
              className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              onClick={() => query.trim() && ask(query.trim())}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-30"
              disabled={!query.trim()}
            >
              <ArrowUp className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        </div>

        {(thinking || answer) && (
          <div className="border-t border-border px-4 py-3.5">
            {thinking ? (
              <div className="flex items-center gap-2 text-[12.5px] text-ink-mute">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                Checking workforce state…
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-ink">{answer}</p>
            )}
          </div>
        )}

        {!query && !answer && (
          <div className="border-t border-border p-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="block w-full rounded-[10px] px-2.5 py-2 text-left text-[12.5px] text-ink-soft transition hover:bg-card-sunken hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
