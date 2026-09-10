import { useMemo, useState } from "react";
import { ChevronDown, Search, GitBranch as TreeIcon, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CapabilityTree } from "@/components/capability-graph/capability-tree";
import {
  workers,
  skills,
  domainTerms,
  evaluations,
  models,
  agents,
  tools,
  policies,
  connectors,
  capabilities,
  workflows,
  getCapabilityWorker,
  shortWorkerName,
} from "@/lib/capabilities/service";
import { nodeKey } from "@/lib/capabilities/graph-builder";
import { cn } from "@/lib/utils";

interface RegistryRow {
  id: string;
  name: string;
  type: string;
  workerIds: string[];
  status: string;
  dependencies: number;
}

function buildRows(): RegistryRow[] {
  const rows: RegistryRow[] = [];
  for (const s of skills) rows.push({ id: nodeKey("skill", s.id), name: s.name, type: "Skill", workerIds: s.workerIds, status: s.status, dependencies: s.agentIds.length + s.toolIds.length + s.evaluationIds.length });
  for (const t of domainTerms) rows.push({ id: nodeKey("domainLanguage", t.id), name: t.term, type: "Domain Language", workerIds: t.workerIds, status: `${t.ruleCount} rules`, dependencies: t.skillIds.length });
  for (const e of evaluations) rows.push({ id: nodeKey("evaluation", e.id), name: e.name, type: "Evaluation", workerIds: e.workerIds, status: e.hardGate ? "Hard gate" : "Advisory", dependencies: e.workerIds.length });
  for (const m of models) rows.push({ id: nodeKey("model", m.id), name: m.name, type: "SLM", workerIds: m.workerIds, status: m.status, dependencies: m.agentIds.length });
  for (const a of agents) rows.push({ id: nodeKey("agent", a.id), name: a.name, type: "Agent", workerIds: a.workerIds, status: a.status, dependencies: a.skillIds.length + a.toolIds.length });
  for (const t of tools) rows.push({ id: nodeKey("tool", t.id), name: t.name, type: "Tool", workerIds: t.workerIds, status: t.status, dependencies: t.agentIds.length });
  for (const p of policies) rows.push({ id: nodeKey("policy", p.id), name: p.name, type: "Policy", workerIds: p.workerIds, status: p.status, dependencies: 0 });
  for (const c of connectors) rows.push({ id: nodeKey("connector", c.id), name: c.name, type: "Connector", workerIds: c.workerIds, status: c.status, dependencies: c.toolIds.length });
  for (const c of capabilities) rows.push({ id: nodeKey("capability", c.id), name: c.name, type: "Capability", workerIds: c.workerIds, status: c.status, dependencies: c.skillIds.length + c.agentIds.length + c.toolIds.length });
  for (const w of workflows) rows.push({ id: nodeKey("workflow", w.id), name: w.name, type: "Workflow", workerIds: w.workerIds, status: w.status, dependencies: w.capabilityIds.length });
  return rows;
}

const allRows = buildRows();
const typeOptions = ["All", "Skill", "Domain Language", "Evaluation", "SLM", "Agent", "Tool", "Policy", "Connector", "Capability", "Workflow"];

export default function WorkerRegistry() {
  const [view, setView] = useState<"tree" | "registry">("tree");
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0].id);
  const [focusNodeId, setFocusNodeId] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState("All");
  const [workerFilter, setWorkerFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      allRows
        .filter((r) => typeFilter === "All" || r.type === typeFilter)
        .filter((r) => workerFilter === "All" || r.workerIds.includes(workerFilter))
        .filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
    [typeFilter, workerFilter, query]
  );

  function focusRow(row: RegistryRow) {
    const targetWorker = row.workerIds[0] ?? selectedWorkerId;
    setSelectedWorkerId(targetWorker);
    setFocusNodeId(row.id);
    setView("tree");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Worker</span>
          <Select
            value={selectedWorkerId}
            onValueChange={(v) => {
              setSelectedWorkerId(v);
              setFocusNodeId(undefined);
            }}
          >
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workers.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="inline-flex items-center rounded-full bg-card-sunken p-1">
          <button
            onClick={() => setView("tree")}
            className={cn("flex items-center gap-1.5 rounded-full px-3.5 h-8 text-[12.5px] font-semibold transition-colors", view === "tree" ? "bg-accent text-white" : "text-ink-mute hover:text-ink")}
          >
            <TreeIcon className="h-3.5 w-3.5" strokeWidth={2} />
            Tree
          </button>
          <button
            onClick={() => setView("registry")}
            className={cn("flex items-center gap-1.5 rounded-full px-3.5 h-8 text-[12.5px] font-semibold transition-colors", view === "registry" ? "bg-accent text-white" : "text-ink-mute hover:text-ink")}
          >
            <Table2 className="h-3.5 w-3.5" strokeWidth={2} />
            Registry
          </button>
        </div>
      </div>

      {view === "tree" ? (
        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="h-[600px]">
            <CapabilityTree key={`${selectedWorkerId}-${focusNodeId ?? ""}`} workerId={selectedWorkerId} focusNodeId={focusNodeId} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-9 w-64 text-ink-faint">
              <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search registry…"
                className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
            </div>
            <div className="relative">
              <select
                value={workerFilter}
                onChange={(e) => setWorkerFilter(e.target.value)}
                className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken max-w-[220px]"
              >
                <option value="All">Worker: All</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
            </div>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[1.8fr_1fr_1.6fr_0.9fr_0.7fr_0.7fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                  <span>Name</span>
                  <span>Type</span>
                  <span>Worker</span>
                  <span>Status</span>
                  <span>Dependencies</span>
                  <span>Last updated</span>
                </div>
                {rows.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => focusRow(r)}
                    className="grid w-full grid-cols-[1.8fr_1fr_1.6fr_0.9fr_0.7fr_0.7fr] items-center gap-3 border-b border-border px-5 py-3 text-left last:border-b-0 transition-colors hover:bg-card-sunken/60"
                  >
                    <span className="min-w-0 truncate text-[13px] font-medium text-ink">{r.name}</span>
                    <span><Badge variant="neutral">{r.type}</Badge></span>
                    <span className="min-w-0 truncate text-[12px] text-ink-mute">
                      {r.workerIds.length === 1
                        ? (() => {
                            const w = getCapabilityWorker(r.workerIds[0]);
                            return w ? shortWorkerName(w.name) : "—";
                          })()
                        : `${r.workerIds.length} Workers`}
                    </span>
                    <span className="text-[12px] text-ink-soft">{r.status}</span>
                    <span className="text-[12px] tabular-nums text-ink-soft">{r.dependencies}</span>
                    <span className="text-[11.5px] text-ink-faint">—</span>
                  </button>
                ))}
                {rows.length === 0 && <p className="px-5 py-8 text-[12.5px] text-ink-mute">No entities match these filters.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
