import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpDown, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workers } from "@/lib/data";
import { dodStatusMeta, workerStatusColor } from "@/lib/status";

const domains = Array.from(new Set(workers.map((w) => w.domain)));
const environments = Array.from(new Set(workers.map((w) => w.identity.environment)));

type SortKey = "name" | "cost";

export default function WorkersDirectory() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [autonomy, setAutonomy] = useState<string>("all");
  const [environment, setEnvironment] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    let list = workers.filter((w) => {
      const matchesQuery =
        query.trim() === "" ||
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.role.toLowerCase().includes(query.toLowerCase());
      const matchesDomain = domain === "all" || w.domain === domain;
      const matchesStatus = status === "all" || w.status === status;
      const matchesAutonomy = autonomy === "all" || w.autonomy === autonomy;
      const matchesEnv = environment === "all" || w.identity.environment === environment;
      return matchesQuery && matchesDomain && matchesStatus && matchesAutonomy && matchesEnv;
    });
    list = [...list].sort((a, b) => (sort === "cost" ? a.costPerTask - b.costPerTask : a.name.localeCompare(b.name)));
    return list;
  }, [query, domain, status, autonomy, environment, sort]);

  return (
    <div className="pb-10">
      <PageHeader
        title="AI Workers"
        subtitle="Your organization's digital workforce — provisioned identities accountable for an outcome."
        actions={
          <Button asChild>
            <Link to="/workers/new">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create AI Worker
            </Link>
          </Button>
        }
      />

      <div className="px-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workers…"
              className="rounded-full pl-9"
            />
          </div>

          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="review">Needs Review</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
            </SelectContent>
          </Select>

          <Select value={autonomy} onValueChange={setAutonomy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Autonomy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All autonomy levels</SelectItem>
              <SelectItem value="supervised">Supervised</SelectItem>
              <SelectItem value="guarded">Guarded</SelectItem>
              <SelectItem value="autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>

          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              {environments.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => setSort(sort === "name" ? "cost" : "name")}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft transition hover:bg-card-sunken ml-auto"
          >
            <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sort: {sort === "name" ? "Name" : "Cost"}
          </button>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-[2.2fr_1fr_1fr_1.6fr_1.3fr_1fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
            <span>Worker</span>
            <span>Status</span>
            <span>Autonomy</span>
            <span>Active Work</span>
            <span>Definition of Done</span>
            <span>Governance</span>
          </div>

          {filtered.map((w) => {
            const dod = dodStatusMeta[w.definitionOfDone.overallStatus];
            return (
              <Link
                key={w.id}
                to={`/workers/${w.id}`}
                className="grid grid-cols-[2.2fr_1fr_1fr_1.6fr_1.3fr_1fr] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{w.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink">{w.name}</p>
                    <p className="truncate text-[12px] text-ink-mute">{w.role}</p>
                  </div>
                </div>
                <Badge variant={workerStatusColor[w.status]} dot>
                  {w.statusLabel}
                </Badge>
                <AutonomyBadge level={w.autonomy} />
                <span className="truncate text-[12.5px] text-ink-soft">{w.currentWork?.title ?? "—"}</span>
                <Badge variant={dod.color}>{dod.label}</Badge>
                <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                  <ShieldCheck className="h-3.5 w-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
                  {w.governance.policies.length > 0 ? `${w.governance.policies.length} policies` : "Not configured"}
                </span>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="text-[13px] text-ink-mute">No workers match these filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
