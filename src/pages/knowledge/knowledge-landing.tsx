import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Library } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { getAllKnowledgeItems, knowledgeTypeCounts } from "@/lib/knowledge-repo/service";
import type { KnowledgeItemType } from "@/lib/knowledge-repo/types";
import { cn } from "@/lib/utils";

const typeChips: (KnowledgeItemType | "All")[] = ["All", "Skill", "Domain Language", "Event", "SME", "Concept", "Pattern", "Rule"];

const typeTone: Record<KnowledgeItemType, "blue" | "purple" | "amber" | "accent" | "green" | "neutral"> = {
  Skill: "blue",
  "Domain Language": "purple",
  Event: "amber",
  SME: "accent",
  Concept: "neutral",
  Pattern: "neutral",
  Rule: "neutral",
};

export function KnowledgeLanding() {
  const [searchParams] = useSearchParams();
  const workerFilter = searchParams.get("worker");
  const initialType = (searchParams.get("type") as KnowledgeItemType | null) ?? "All";
  const [type, setType] = useState<KnowledgeItemType | "All">(typeChips.includes(initialType) ? initialType : "All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => knowledgeTypeCounts(), []);
  const allItems = useMemo(() => getAllKnowledgeItems(), []);

  const rows = useMemo(() => {
    let items = allItems;
    if (type !== "All") items = items.filter((r) => r.type === type);
    if (workerFilter) items = items.filter((r) => r.workerIds.includes(workerFilter));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q));
    }
    return items;
  }, [allItems, type, workerFilter, query]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Knowledge"
        subtitle="What the platform knows — skills, domain language, events, subject-matter expertise and other knowledge the organization has accumulated."
        icon={Library}
        tone="blue"
      />

      <div className="px-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-9 w-64 text-ink-faint">
            <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search knowledge…"
              className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
            />
          </div>
          {workerFilter && (
            <Badge variant="accent">
              Filtered to 1 Worker
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {typeChips.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full px-3.5 h-8 text-[12.5px] font-semibold transition-colors",
                type === t ? "bg-accent text-white" : "bg-card-sunken text-ink-mute hover:text-ink"
              )}
            >
              {t} <span className={cn("tabular-nums", type === t ? "text-white/70" : "text-ink-faint")}>{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1.6fr_1.2fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                <span>Knowledge item</span>
                <span>Type</span>
                <span>Workers using</span>
                <span>Topics</span>
                <span>Learning</span>
              </div>
              {rows.map((r) => (
                <Link
                  key={r.id}
                  to={`/knowledge/${r.id}`}
                  className="grid w-full grid-cols-[2fr_1fr_1fr_1.6fr_1.2fr] items-center gap-3 border-b border-border px-5 py-3 text-left last:border-b-0 transition-colors hover:bg-card-sunken/60"
                >
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink">{r.name}</span>
                  <span><Badge variant={typeTone[r.type]}>{r.type}</Badge></span>
                  <span className="text-[12px] tabular-nums text-ink-soft">{r.workersUsingCount}</span>
                  <span className="min-w-0 truncate text-[12px] text-ink-mute">{r.topics.length > 0 ? r.topics.join(", ") : "—"}</span>
                  <span className={cn("text-[12px]", r.learningLabel === "Not measured" ? "text-ink-faint" : "text-ink-soft")}>{r.learningLabel}</span>
                </Link>
              ))}
              {rows.length === 0 && (
                <p className="px-5 py-8 text-[12.5px] text-ink-mute">No knowledge items match these filters.</p>
              )}
            </div>
          </div>
        </div>
        <p className="px-1 text-[11.5px] text-ink-faint">
          Concepts, Patterns and Rules are supported knowledge types with no items recorded yet.
        </p>
      </div>
    </div>
  );
}
