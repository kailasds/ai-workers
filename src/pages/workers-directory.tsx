import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpRight, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
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
import { cn } from "@/lib/utils";

const departments = Array.from(new Set(workers.map((w) => w.department)));

type SortKey = "performance" | "cost" | "name";

export default function WorkersDirectory() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("performance");

  const filtered = useMemo(() => {
    let list = workers.filter((w) => {
      const matchesQuery =
        query.trim() === "" ||
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.role.toLowerCase().includes(query.toLowerCase());
      const matchesDept = department === "all" || w.department === department;
      const matchesStatus = status === "all" || w.status === status;
      return matchesQuery && matchesDept && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      if (sort === "performance") return b.performance - a.performance;
      if (sort === "cost") return a.costPerTask - b.costPerTask;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [query, department, status, sort]);

  return (
    <div className="pb-10">
      <PageHeader
        title="AI Workers"
        subtitle="Your organization's digital workforce."
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
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workers…"
              className="rounded-full pl-9"
            />
          </div>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="review">Awaiting Review</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setSort(sort === "performance" ? "cost" : sort === "cost" ? "name" : "performance")}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3.5 text-[12.5px] font-medium text-ink-soft transition hover:bg-card-sunken ml-auto"
          >
            <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sort: {sort === "performance" ? "Performance" : sort === "cost" ? "Cost" : "Name"}
          </button>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-[2.2fr_1.3fr_1fr_1.6fr_1fr_0.9fr_auto] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
            <span>Worker</span>
            <span>Department</span>
            <span>Status</span>
            <span>Current Work</span>
            <span>Performance</span>
            <span>Cost</span>
            <span />
          </div>

          {filtered.map((w) => (
            <Link
              key={w.id}
              to={`/workers/${w.id}`}
              className="grid grid-cols-[2.2fr_1.3fr_1fr_1.6fr_1fr_0.9fr_auto] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
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
              <span className="truncate text-[12.5px] text-ink-soft">{w.department}</span>
              <Badge
                variant={
                  w.status === "blocked"
                    ? "red"
                    : w.status === "review"
                    ? "amber"
                    : w.status === "completed"
                    ? "green"
                    : w.status === "paused"
                    ? "neutral"
                    : "blue"
                }
                dot
              >
                {w.statusLabel}
              </Badge>
              <span className="truncate text-[12.5px] text-ink-soft">{w.currentTask ?? "—"}</span>
              <span
                className={cn(
                  "text-[13px] font-medium tabular-nums",
                  w.performance >= 95 ? "text-status-green" : w.performance >= 90 ? "text-ink" : "text-status-amber"
                )}
              >
                {w.performance}%
              </span>
              <span className="text-[12.5px] tabular-nums text-ink-soft">${w.costPerTask}</span>
              <ArrowUpRight className="h-4 w-4 text-ink-faint" strokeWidth={1.5} />
            </Link>
          ))}

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
