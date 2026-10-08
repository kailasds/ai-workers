import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Building2, ChevronDown, Plus, CircleDot, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/v2/empty-state";
import { WorkerCard } from "@/components/v2/worker-card";
import { MetricCard } from "@/components/v2/metric-card";
import { customerPackages, type CustomerPackageRow } from "@/lib/registry-data";
import { givenTo, learnedBy, useV2 } from "@/lib/v2/store";

const packageStateTone: Record<CustomerPackageRow["state"], BadgeProps["variant"]> = {
  Prepared: "blue",
  Shared: "amber",
  Acknowledged: "green",
};

type SortKey = "name" | "knowledge";

export default function WorkerRegistryList() {
  const state = useV2();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capabilityFilter, setCapabilityFilter] = useState("all");
  const [maturityFilter, setMaturityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const capabilityOptions = useMemo(() => Array.from(new Set(state.workers.map((w) => w.evolution.currentCapability))), [state.workers]);

  const rows = useMemo(() => {
    const filtered = state.workers.filter((w) => {
      if (query.trim() && !`${w.name} ${w.purpose}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (capabilityFilter !== "all" && w.evolution.currentCapability !== capabilityFilter) return false;
      if (maturityFilter === "none" && w.maturity) return false;
      if (maturityFilter !== "all" && maturityFilter !== "none" && w.maturity !== maturityFilter) return false;
      return true;
    });
    const knowledgeCount = (id: string) => {
      const w = state.workers.find((x) => x.id === id)!;
      return givenTo(state, w).length + learnedBy(state, id).length;
    };
    return [...filtered].sort((a, b) => (sortKey === "knowledge" ? knowledgeCount(b.id) - knowledgeCount(a.id) : a.name.localeCompare(b.name)));
  }, [state, query, statusFilter, capabilityFilter, maturityFilter, sortKey]);

  const filteredPackages = useMemo(
    () => customerPackages.filter((p) => !query.trim() || p.destination.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const active = state.workers.filter((w) => w.status === "active").length;
  const assignedTotal = state.workers.reduce((n, w) => n + givenTo(state, w).length, 0);
  const learnedTotal = state.workers.reduce((n, w) => n + learnedBy(state, w.id).length, 0);
  const underReview = state.knowledge.filter((k) => k.scope === "gained" && k.status === "under-review").length;
  const canEvolve = state.workers.filter((w) => w.evolution.enabled).length;
  const evolved = state.workers.filter((w) => w.evolution.history.length > 0).length;
  const filtersOn = query.trim() || statusFilter !== "all" || capabilityFilter !== "all" || maturityFilter !== "all";

  return (
    <div className="pb-12">
      <PageHeader
        title="Registry"
        subtitle="The Workers you have, what they know, and what they can do."
        icon={Users}
        tone="accent"
        actions={
          <Button asChild size="sm">
            <Link to="/workers/new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Compose a Worker
            </Link>
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        <Tabs defaultValue="managed">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="managed">Workers</TabsTrigger>
              <TabsTrigger value="packages">Customer packages</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Workers" aria-label="Search Workers" className="pl-8" />
            </div>
          </div>

          <TabsContent value="managed" className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard icon={Users} label="Workers" value={state.workers.length} hint={`${state.workers.length - active} not active yet`} />
              <MetricCard icon={CircleDot} label="Active" value={active} hint="Doing work now" />
              <MetricCard icon={BookOpen} label="Assigned knowledge" value={assignedTotal} hint="Given in Compose" />
              <MetricCard icon={Lightbulb} label="Learned knowledge" value={learnedTotal} hint={underReview > 0 ? `${underReview} under review` : "Nothing waiting"} />
            </div>
            <p className="flex items-center gap-2 text-[12px] text-ink-mute">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
              {canEvolve} of {state.workers.length} Workers can evolve, and {evolved} already {evolved === 1 ? "has" : "have"}.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <SelectPill
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                  { value: "draft", label: "Draft" },
                ]}
              />
              <SelectPill
                label="Capability"
                value={capabilityFilter}
                onChange={setCapabilityFilter}
                options={[{ value: "all", label: "All" }, ...capabilityOptions.map((c) => ({ value: c, label: c }))]}
              />
              <SelectPill
                label="Learning maturity"
                value={maturityFilter}
                onChange={setMaturityFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "silver", label: "Silver" },
                  { value: "gold", label: "Gold" },
                  { value: "platinum", label: "Platinum" },
                  { value: "none", label: "Not yet rated" },
                ]}
              />
              <SelectPill
                label="Sort"
                value={sortKey}
                onChange={(v) => setSortKey(v as SortKey)}
                options={[
                  { value: "name", label: "Name" },
                  { value: "knowledge", label: "Most knowledge" },
                ]}
              />
              <span className="ml-auto whitespace-nowrap text-[12px] font-medium text-ink-mute">
                {filtersOn ? `${rows.length} of ${state.workers.length} Workers` : `${state.workers.length} Workers · ${active} active`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((w) => (
                <WorkerCard key={w.id} worker={w} assigned={givenTo(state, w).length} learned={learnedBy(state, w.id).length} />
              ))}
            </div>
            {rows.length === 0 && (
              <EmptyState
                icon={Users}
                title={filtersOn ? "No Workers match" : "No Workers yet"}
                description={filtersOn ? "Try a different search or filter." : "Compose a Worker to see it here."}
              />
            )}
          </TabsContent>

          <TabsContent value="packages">
            <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border text-[12px] uppercase tracking-wider text-ink-mute">
                    <th className="px-4 py-3 font-semibold">Worker</th>
                    <th className="px-3 py-3 font-semibold">Destination</th>
                    <th className="px-3 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPackages.map((p) => (
                    <tr key={p.id} className=" hover:bg-card-sunken">
                      <td className="px-4 py-3 font-medium text-ink">{p.workerLabel}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 text-ink-soft">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={2} />
                          {p.destination}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={packageStateTone[p.state]} dot>
                          {p.state}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink-faint">{p.digest}</td>
                    </tr>
                  ))}
                  {filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ink-mute">
                        No packages match “{query}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
              <Link to="/packaging" className="font-medium text-accent-ink hover:underline underline-offset-2">
                Seal composed Workers
              </Link>
              <Link to="/delivery" className="font-medium text-accent-ink hover:underline underline-offset-2">
                Prepare a customer delivery
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SelectPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 cursor-pointer appearance-none rounded-control border border-border-strong bg-card pl-3 pr-8 text-[12px] font-medium text-ink-soft outline-none hover:bg-card-sunken"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
    </div>
  );
}
