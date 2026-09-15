import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Activity, RefreshCw, ShieldAlert, Boxes, Sparkles, Brain, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/shared/kpi-card";
import { registryStats, tcsManagedWorkers, customerPackages, type RegistryCard, type CustomerPackageRow } from "@/lib/registry-data";
import { cn } from "@/lib/utils";

const statusTone: Record<RegistryCard["status"], "blue" | "amber" | "green"> = {
  New: "blue",
  Evolving: "amber",
  Learning: "green",
};

const statusIconTone: Record<RegistryCard["status"], string> = {
  New: "bg-status-blue-soft text-status-blue",
  Evolving: "bg-status-amber-soft text-status-amber",
  Learning: "bg-status-green-soft text-status-green",
};

const distributionTone = ["bg-status-blue-soft text-status-blue", "bg-status-purple-soft text-status-purple", "bg-status-amber-soft text-status-amber"];

const packageStateTone: Record<CustomerPackageRow["state"], BadgeProps["variant"]> = {
  Prepared: "blue",
  Shared: "amber",
  Acknowledged: "green",
};

export default function WorkerRegistryList() {
  const [query, setQuery] = useState("");

  const filteredWorkers = useMemo(
    () => tcsManagedWorkers.filter((w) => !query.trim() || w.identityLabel.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const filteredPackages = useMemo(
    () => customerPackages.filter((p) => !query.trim() || p.destination.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="pb-12">
      <PageHeader title="Worker Registry" subtitle="Manage deployed Workers and customer-ready packages." icon={Users} tone="accent" />

      <div className="px-8 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Workers" value={registryStats.workers} icon={Boxes} />
          <KpiCard
            label="Serving now"
            value={registryStats.servingNow}
            icon={Activity}
            trend={{ direction: "up", label: `${registryStats.servingNow} of ${registryStats.workers} live` }}
          />
          <KpiCard label="Ready revision" value={registryStats.readyRevision} icon={RefreshCw} />
          <KpiCard
            label="Needs attention"
            value={registryStats.needsAttention}
            icon={ShieldAlert}
            trend={registryStats.needsAttention > 0 ? { direction: "up", label: "Review recommended", goodWhenUp: false } : { direction: "flat", label: "Nothing flagged" }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {registryStats.boundedContextDistribution.map((d, i) => (
            <span
              key={d.label}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold leading-none",
                distributionTone[i % distributionTone.length]
              )}
            >
              <span className="truncate">{d.label}</span>
              <span className="tabular-nums">{d.value}</span>
            </span>
          ))}
        </div>

        <Tabs defaultValue="managed">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="managed">TCS-managed Workers</TabsTrigger>
              <TabsTrigger value="packages">Customer packages</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.9} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, owner or context" className="pl-8" />
            </div>
          </div>

          <TabsContent value="managed">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredWorkers.map((w) => (
                <Link
                  key={w.id}
                  to={`/workers/${w.id}`}
                  className="rounded-card border border-border bg-card shadow-card p-4 transition-shadow hover:shadow-float"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={statusTone[w.status]} dot>
                      {w.status}
                    </Badge>
                    <span className="text-[10.5px] text-ink-faint">r{w.revision}</span>
                  </div>
                  <div className="mt-2.5 flex items-start gap-2.5">
                    <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", statusIconTone[w.status])}>
                      <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold leading-snug text-ink">{w.identityLabel}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-mute truncate">{w.boundedContextLabel}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[11px] text-ink-mute">{w.owner}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-status-purple-soft px-2 py-1 text-[11px] font-semibold text-status-purple">
                      <Brain className="h-3 w-3" strokeWidth={2.25} />
                      {w.gbrainMemories}
                    </span>
                  </div>
                </Link>
              ))}
              {filteredWorkers.length === 0 && <EmptyRow query={query} />}
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                    <th className="px-4 py-3 font-semibold">Worker</th>
                    <th className="px-3 py-3 font-semibold">Destination</th>
                    <th className="px-3 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPackages.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-card-sunken">
                      <td className="px-4 py-3 font-medium text-ink">{p.workerLabel}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 text-ink-soft">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.9} />
                          {p.destination}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={packageStateTone[p.state]} dot>
                          {p.state}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{p.digest}</td>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyRow({ query }: { query: string }) {
  return <div className="col-span-full rounded-card border border-dashed border-border-strong py-10 text-center text-[12.5px] text-ink-mute">No Workers match “{query}”.</div>;
}
