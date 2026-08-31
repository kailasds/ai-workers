import { useState } from "react";
import { Sparkle, ArrowUp, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const suggestions = [
  "What workers need attention?",
  "Why is the Modernization Worker blocked?",
  "Show workers with the highest cost.",
  "Which workers have declining performance?",
];

const canned: Record<string, string> = {
  "What workers need attention?":
    "4 items need attention: a policy conflict on Legacy Modernization Engineer, a budget threshold on Claims Investigation Worker, and 2 pending approvals — Underwriting Specialist and Code Security Reviewer.",
  "Why is the Modernization Worker blocked?":
    "Legacy Modernization Engineer isn't blocked — it's actively working (62% through ClaimsService.cbl). Code Security Reviewer is the worker currently blocked, on an unresolved permission request.",
  "Show workers with the highest cost.":
    "By cost per task: Regulatory Filing Assistant ($28), Claims Investigation Worker ($31), Legacy Modernization Engineer ($37) — all within budget targets.",
  "Which workers have declining performance?":
    "None are declining this week. Legacy Modernization Engineer's human intervention rate improved from 16% to 11% over the last 7 cycles.",
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
