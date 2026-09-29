import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Library, Search, Layers, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/v2/empty-state";
import { KnowledgeCard } from "@/components/v2/knowledge-card";
import { KnowledgeDetailPanel } from "@/components/v2/knowledge-detail-panel";
import { KnowledgeScopeContent, KnowledgeScopeTabs, scopeMeta } from "@/components/v2/knowledge-scope-tabs";
import { useV2, workerById } from "@/lib/v2/store";
import type { Knowledge, KnowledgeKind, KnowledgeScope } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

const scopes: KnowledgeScope[] = ["assigned", "gained", "platform"];

interface Filter {
  id: string;
  label: string;
  test: (k: Knowledge) => boolean;
}

const kindFilter = (kind: KnowledgeKind, label: string): Filter => ({ id: kind, label, test: (k) => k.kind === kind });
const isHistorical = (k: Knowledge) => ["revoked", "replaced", "retired", "rejected"].includes(k.status);

const filtersByScope: Record<KnowledgeScope, Filter[]> = {
  assigned: [
    kindFilter("skill", "Skills"),
    kindFilter("company", "Company knowledge"),
    kindFilter("rule", "Rules"),
    kindFilter("safety", "Safety"),
  ],
  gained: [
    { id: "review", label: "Under review", test: (k) => k.status === "under-review" },
    { id: "kept", label: "Kept by Worker", test: (k) => k.status === "active" && !k.sharedAsId },
    { id: "shared", label: "Shared with platform", test: (k) => !!k.sharedAsId },
  ],
  platform: [
    { id: "trusted", label: "Trusted", test: (k) => k.status === "active" && !k.health },
    { id: "attention", label: "Needs review", test: (k) => k.status === "active" && !!k.health },
    { id: "historical", label: "Revoked or replaced", test: isHistorical },
  ],
};

const emptyCopy: Record<KnowledgeScope, { title: string; description: string }> = {
  assigned: { title: "No assigned knowledge", description: "Knowledge is given to a Worker when you compose it." },
  gained: { title: "No Gained Knowledge", description: "This Worker hasn't gained reusable knowledge yet." },
  platform: { title: "No Platform Knowledge", description: "No knowledge has been shared with the platform yet." },
};

export default function KnowledgePage() {
  const state = useV2();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filterId, setFilterId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const tabParam = params.get("tab");
  const scope: KnowledgeScope = scopes.includes(tabParam as KnowledgeScope) ? (tabParam as KnowledgeScope) : "assigned";
  const workerId = params.get("worker");
  const worker = workerById(state, workerId ?? undefined);

  function setScope(next: KnowledgeScope) {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    setParams(p, { replace: true });
    setFilterId(null);
    setQuery("");
  }
  function clearWorker() {
    const p = new URLSearchParams(params);
    p.delete("worker");
    setParams(p, { replace: true });
  }

  const inScope = useMemo(
    () =>
      state.knowledge.filter((k) => {
        if (k.scope !== scope) return false;
        if (!workerId) return true;
        return scope === "gained" ? k.sourceWorkerId === workerId : k.usedByWorkerIds.includes(workerId) || k.sourceWorkerId === workerId;
      }),
    [state.knowledge, scope, workerId]
  );

  const counts = useMemo(() => {
    const c: Record<KnowledgeScope, number> = { assigned: 0, gained: 0, platform: 0 };
    for (const k of state.knowledge) if (!workerId || k.usedByWorkerIds.includes(workerId) || k.sourceWorkerId === workerId) c[k.scope]++;
    return c;
  }, [state.knowledge, workerId]);

  const activeFilter = filtersByScope[scope].find((f) => f.id === filterId);
  const rows = inScope
    .filter((k) => (!activeFilter || activeFilter.test(k)) && (!query.trim() || k.title.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => Number(isHistorical(a)) - Number(isHistorical(b)));

  return (
    <div className="pb-12">
      <PageHeader
        title="Knowledge"
        subtitle="What Workers know, where it came from, and who can use it."
        icon={Library}
        tone="accent"
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/knowledge/catalogue">
              <Layers className="h-3.5 w-3.5" strokeWidth={2} />
              Browse catalogue
            </Link>
          </Button>
        }
      />

      <div className="px-8">
        <KnowledgeScopeTabs value={scope} onChange={setScope} counts={counts}>
          {scopes.map((s) => (
            <KnowledgeScopeContent key={s} value={s} className="mt-5 focus-visible:outline-none">
              <p className="text-[14px] text-ink-mute">{scopeMeta[s].heading}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <FilterChip active={!filterId} onClick={() => setFilterId(null)}>
                  All · {inScope.length}
                </FilterChip>
                {filtersByScope[s].map((f) => (
                  <FilterChip key={f.id} active={filterId === f.id} onClick={() => setFilterId(f.id)}>
                    {f.label} · {inScope.filter(f.test).length}
                  </FilterChip>
                ))}
                {worker && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-card px-2.5 py-1 text-[12px] font-medium text-ink-soft">
                    {worker.name}
                    <button type="button" onClick={clearWorker} aria-label="Clear Worker filter" className="grid h-4 w-4 place-items-center rounded-full hover:bg-card-sunken">
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </span>
                )}
                <div className="relative ml-auto w-60">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge" className="pl-8" aria-label="Search knowledge" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((k) => (
                  <KnowledgeCard key={k.id} k={k} onOpen={setOpenId} />
                ))}
              </div>
              {rows.length === 0 && (
                <EmptyState
                  icon={Library}
                  title={query.trim() || filterId ? "Nothing matches" : emptyCopy[s].title}
                  description={query.trim() || filterId ? "Try a different filter or search." : emptyCopy[s].description}
                />
              )}
            </KnowledgeScopeContent>
          ))}
        </KnowledgeScopeTabs>
      </div>

      <KnowledgeDetailPanel id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-[12px] font-medium",
        active ? "bg-onyx text-white" : "bg-card-sunken text-ink-mute hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
