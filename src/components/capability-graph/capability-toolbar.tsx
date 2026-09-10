import { useState } from "react";
import { Search, SlidersHorizontal, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BrainCategoryKey } from "@/lib/capabilities/graph-types";
import { categoryLabel, primaryCategories, secondaryCategories } from "@/lib/capabilities/graph-types";
import { searchCapabilities } from "@/lib/capabilities/graph-builder";

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
        active ? "bg-accent text-white" : "bg-card-sunken text-ink-soft hover:bg-border/60"
      )}
    >
      {label}
    </button>
  );
}

export function CapabilityToolbar({
  categoryFilter,
  onCategoryFilterChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onReset,
  onSelectResult,
  disabled,
}: {
  categoryFilter: BrainCategoryKey | "all";
  onCategoryFilterChange: (c: BrainCategoryKey | "all") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  onSelectResult: (nodeId: string, workerId?: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const results = query.trim() ? searchCapabilities(query) : [];
  const allCategories = [...primaryCategories, ...secondaryCategories];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Search Skills, Agents, Tools…"
            className="h-8 w-64 pl-8 text-[12.5px]"
          />
        </div>
        {showResults && results.length > 0 && (
          <div className="absolute left-0 top-9 z-20 w-80 max-h-72 overflow-y-auto rounded-card border border-border bg-card shadow-float p-1.5">
            {results.map((r) => (
              <button
                key={r.id}
                onMouseDown={() => {
                  onSelectResult(r.id, r.workerId);
                  setQuery("");
                  setShowResults(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-card-sunken"
              >
                <span className="min-w-0 truncate text-[12px] text-ink">{r.label}</span>
                <Badge variant="neutral" className="shrink-0">{r.kind}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="sm">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
            Filters
            {categoryFilter !== "all" && <Badge variant="accent">1</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">Brain category</p>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip label="All" active={categoryFilter === "all"} onClick={() => onCategoryFilterChange("all")} />
            {allCategories.map((c) => (
              <FilterChip key={c} label={categoryLabel[c]} active={categoryFilter === c} onClick={() => onCategoryFilterChange(c)} />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom out" disabled={disabled}><ZoomOut className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom in" disabled={disabled}><ZoomIn className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onFitView} title="Fit to view" disabled={disabled}><Maximize2 className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onReset} title="Reset view" disabled={disabled}><RotateCcw className="h-4 w-4" strokeWidth={1.75} /></Button>
      </div>
    </div>
  );
}
