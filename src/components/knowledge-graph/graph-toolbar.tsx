import { useState } from "react";
import { Search, SlidersHorizontal, ZoomIn, ZoomOut, Maximize2, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { workers, topics } from "@/lib/knowledge/service";
import type { GraphFilters, GraphMode } from "@/lib/knowledge/graph-types";
import { defaultFilters } from "@/lib/knowledge/graph-types";
import { searchGraph } from "@/lib/knowledge/graph-builder";
import type { KnowledgeGraphNode } from "@/lib/knowledge/graph-types";

const modeOptions: { key: GraphMode; label: string }[] = [
  { key: "landscape", label: "Landscape" },
  { key: "evidence", label: "Evidence" },
  { key: "flow", label: "Knowledge Flow" },
];

const lifecycleOptions: GraphFilters["lifecycle"][] = ["all", "Observed", "Corroborated", "Certified", "Published", "Reused", "Contradictory"];

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

export function GraphToolbar({
  mode,
  onModeChange,
  filters,
  onFiltersChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onReset,
  onSelectNode,
  disabled,
}: {
  mode: GraphMode;
  onModeChange: (m: GraphMode) => void;
  filters: GraphFilters;
  onFiltersChange: (f: GraphFilters) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  onSelectNode: (nodeId: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const results: KnowledgeGraphNode[] = query.trim() ? searchGraph(query) : [];

  const activeFilterCount =
    (filters.worker ? 1 : 0) + (filters.topic ? 1 : 0) + (filters.kind !== "all" ? 1 : 0) + (filters.lifecycle !== "all" ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
      <div className="inline-flex items-center rounded-full bg-card-sunken p-1">
        {modeOptions.map((m) => (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            disabled={disabled}
            className={cn(
              "rounded-full px-3.5 h-7 text-[12px] font-semibold transition-colors",
              mode === m.key ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

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
            placeholder="Search Workers, constructs, packs…"
            className="h-8 w-64 pl-8 text-[12.5px]"
          />
        </div>
        {showResults && results.length > 0 && (
          <div className="absolute left-0 top-9 z-20 w-80 max-h-72 overflow-y-auto rounded-card border border-border bg-card shadow-float p-1.5">
            {results.map((r) => (
              <button
                key={r.id}
                onMouseDown={() => {
                  onSelectNode(r.id);
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
            {activeFilterCount > 0 && <Badge variant="accent">{activeFilterCount}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">Knowledge type</p>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "worker", "topic", "construct", "observation", "evidence", "candidate", "pack"] as const).map((k) => (
                  <FilterChip key={k} label={k === "all" ? "All" : k[0].toUpperCase() + k.slice(1) + "s"} active={filters.kind === k} onClick={() => onFiltersChange({ ...filters, kind: k })} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">Lifecycle status</p>
              <div className="flex flex-wrap gap-1.5">
                {lifecycleOptions.map((l) => (
                  <FilterChip key={l} label={l === "all" ? "All" : l} active={filters.lifecycle === l} onClick={() => onFiltersChange({ ...filters, lifecycle: l })} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">Topic</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip label="All topics" active={!filters.topic} onClick={() => onFiltersChange({ ...filters, topic: null })} />
                {topics.map((t) => (
                  <FilterChip key={t.id} label={t.name} active={filters.topic === t.id} onClick={() => onFiltersChange({ ...filters, topic: t.id })} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5">Worker</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip label="All Workers" active={!filters.worker} onClick={() => onFiltersChange({ ...filters, worker: null })} />
                {workers.map((w) => (
                  <FilterChip key={w.id} label={`#${w.runNumber}`} active={filters.worker === w.id} onClick={() => onFiltersChange({ ...filters, worker: w.id })} />
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => onFiltersChange(defaultFilters)} className="flex items-center gap-1 text-[12px] font-medium text-accent-ink hover:underline">
                <X className="h-3 w-3" strokeWidth={2} />
                Clear filters
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom out"><ZoomOut className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom in"><ZoomIn className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onFitView} title="Fit to view"><Maximize2 className="h-4 w-4" strokeWidth={1.75} /></Button>
        <Button variant="ghost" size="icon" onClick={onReset} title="Reset view"><RotateCcw className="h-4 w-4" strokeWidth={1.75} /></Button>
      </div>
    </div>
  );
}
