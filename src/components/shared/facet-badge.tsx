import { FileCode2, Braces, ClipboardCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type Facet = "skills" | "languages" | "evals" | "dod";

const facetMeta: Record<Facet, { icon: typeof FileCode2; label: string; classes: string }> = {
  skills: { icon: FileCode2, label: "skills", classes: "bg-status-blue-soft text-status-blue" },
  languages: { icon: Braces, label: "languages", classes: "bg-status-purple-soft text-status-purple" },
  evals: { icon: ClipboardCheck, label: "EVALs", classes: "bg-status-amber-soft text-status-amber" },
  dod: { icon: ShieldCheck, label: "DoD", classes: "bg-status-green-soft text-status-green" },
};

/** A small colored pill carrying a count for one of the four recurring facets (skills / languages / EVALs / DoD). */
export function FacetBadge({ facet, value, className }: { facet: Facet; value: number | string; className?: string }) {
  const meta = facetMeta[facet];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold leading-none whitespace-nowrap", meta.classes, className)}>
      <Icon className="h-3 w-3" strokeWidth={2.25} />
      {value} {meta.label}
    </span>
  );
}

const facetTextTone: Record<Facet, string> = {
  skills: "text-status-blue",
  languages: "text-status-purple",
  evals: "text-status-amber",
  dod: "text-status-green",
};

/** Compact icon + colored number for dense table cells, where a full pill would be too wide. */
export function FacetCell({ facet, value }: { facet: Facet; value: number | string }) {
  const meta = facetMeta[facet];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
      <Icon className={cn("h-3 w-3", facetTextTone[facet])} strokeWidth={2.25} />
      <span className={cn("font-semibold", facetTextTone[facet])}>{value}</span>
    </span>
  );
}
