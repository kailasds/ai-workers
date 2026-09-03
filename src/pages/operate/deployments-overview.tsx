import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Users, Sparkle, Share2, AlertTriangle, Search, ChevronDown, MoreVertical } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  deployments,
  deploymentStats,
  deploymentCustomers,
  deployableWorkers,
  deploymentWorkerName,
  deploymentCustomerName,
  type DeploymentStatus,
} from "@/lib/deployments-data";
import { cn } from "@/lib/utils";

const statusTone: Record<DeploymentStatus, "green" | "amber" | "red" | "blue"> = {
  Healthy: "green",
  "Needs Attention": "amber",
  Degraded: "red",
  Provisioning: "blue",
};

const experienceSharingTone: Record<string, "green" | "neutral" | "amber"> = {
  "Shared Learnings Enabled": "green",
  "Private Learnings": "neutral",
  "Learning Review Required": "amber",
};

export default function DeploymentsOverview() {
  const [query, setQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [workerFilter, setWorkerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | "All">("All");

  const filtered = deployments.filter((d) => {
    const workerName = deploymentWorkerName(d);
    const customerName = deploymentCustomerName(d);
    return (
      (query === "" || workerName.toLowerCase().includes(query.toLowerCase()) || customerName.toLowerCase().includes(query.toLowerCase())) &&
      (customerFilter === "All" || d.customerId === customerFilter) &&
      (workerFilter === "All" || d.workerId === workerFilter) &&
      (statusFilter === "All" || d.status === statusFilter)
    );
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Deployments" value={deploymentStats.total} icon={LayoutGrid} tone="accent" />
        <StatCard label="Active Customers" value={deploymentStats.activeCustomers} icon={Users} tone="blue" />
        <StatCard label="Updates Available" value={deploymentStats.withUpdatesAvailable} icon={Sparkle} tone="purple" />
        <StatCard label="Experience Sharing Enabled" value={deploymentStats.experienceSharingEnabled} icon={Share2} tone="green" />
        <StatCard label="Needing Attention" value={deploymentStats.needingAttention} icon={AlertTriangle} tone="amber" />
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card-sunken px-3 h-9 w-56 text-ink-faint">
            <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deployments…"
              className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
            />
          </div>
          <SelectPill label="Customer" value={customerFilter} onChange={setCustomerFilter} options={[{ value: "All", label: "All" }, ...deploymentCustomers.map((c) => ({ value: c.id, label: c.name }))]} />
          <SelectPill label="Worker" value={workerFilter} onChange={setWorkerFilter} options={[{ value: "All", label: "All" }, ...deployableWorkers.map((w) => ({ value: w.id, label: w.name }))]} />
          <SelectPill
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as DeploymentStatus | "All")}
            options={[{ value: "All", label: "All" }, ...(["Healthy", "Needs Attention", "Degraded", "Provisioning"] as DeploymentStatus[]).map((s) => ({ value: s, label: s }))]}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.9fr_0.9fr_1.1fr_1.2fr_0.9fr_0.9fr_0.4fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
              <span>Worker Name</span>
              <span>Customer</span>
              <span>Version</span>
              <span>Environment</span>
              <span>Status</span>
              <span>Performance Tier</span>
              <span>Experience Sharing</span>
              <span>Budget</span>
              <span>Last Updated</span>
              <span />
            </div>

            {filtered.map((d) => (
              <Link
                key={d.id}
                to={`/operations/deployments/${d.id}`}
                className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.9fr_0.9fr_1.1fr_1.2fr_0.9fr_0.9fr_0.4fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/60"
              >
                <span className="truncate text-[13px] font-medium text-ink">{deploymentWorkerName(d)}</span>
                <span className="truncate text-[12px] text-ink-soft">{deploymentCustomerName(d)}</span>
                <span className="text-[12px] tabular-nums text-ink-mute">{d.version}</span>
                <span className="text-[12px] text-ink-soft">{d.environment}</span>
                <Badge variant={statusTone[d.status]} dot>
                  {d.status}
                </Badge>
                <span className="text-[12px] text-ink-soft">{d.performanceProfile} Profile</span>
                <Badge variant={experienceSharingTone[d.experienceSharing]}>{d.experienceSharing}</Badge>
                <span className="text-[12px] tabular-nums text-ink-soft">${d.budgetUsed.toLocaleString()} / ${d.budgetMonthly.toLocaleString()}</span>
                <span className="text-[11.5px] text-ink-mute">
                  {new Date(d.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <MoreVertical className="h-4 w-4 text-ink-faint justify-self-end" strokeWidth={1.75} />
              </Link>
            ))}
            {filtered.length === 0 && <p className="px-5 py-8 text-[12.5px] text-ink-mute">No deployments match these filters.</p>}
          </div>
        </div>
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
        className={cn("appearance-none rounded-lg border border-border bg-card pl-3 pr-8 h-9 text-[12.5px] font-medium text-ink-soft outline-none hover:bg-card-sunken")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
    </div>
  );
}
