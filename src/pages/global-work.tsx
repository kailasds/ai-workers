import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { workers } from "@/lib/data";
import { taskStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "running", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Blocked" },
  { key: "scheduled", label: "Scheduled" },
];

const rows = workers.flatMap((w) => w.tasks.map((t) => ({ ...t, workerName: w.name, workerInitials: w.avatarInitials })));

export default function GlobalWork() {
  const [tab, setTab] = useState("running");
  const filtered = rows.filter((r) => (tab === "failed" ? r.status === "failed" || r.status === "awaiting-approval" : r.status === tab));

  return (
    <div className="pb-10">
      <PageHeader title="Work" subtitle="What the entire AI Workforce is performing right now." />

      <div className="px-8 space-y-4">
        <div className="inline-flex items-center gap-1 rounded-full bg-card-sunken p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors",
                tab === t.key ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
              )}
            >
              {t.label}
              <span className={cn("text-[11px] tabular-nums", tab === t.key ? "text-white/60" : "text-ink-faint")}>
                {rows.filter((r) => (t.key === "failed" ? r.status === "failed" || r.status === "awaiting-approval" : r.status === t.key)).length}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1.8fr_1fr_1.2fr_0.9fr_0.9fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
            <span>Worker</span>
            <span>Task</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Cost</span>
            <span>Started</span>
          </div>

          {filtered.map((t) => {
            const meta = taskStatusMeta[t.status];
            return (
              <Link
                key={t.id}
                to={`/workers/${t.workerId}/work/${t.id}`}
                className="grid grid-cols-[1.6fr_1.8fr_1fr_1.2fr_0.9fr_0.9fr] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
              >
                <span className="truncate text-[13px] font-medium text-ink">{t.workerName}</span>
                <span className="truncate text-[12.5px] text-ink-soft">{t.title}</span>
                <Badge variant={meta.color} dot>
                  {meta.label}
                </Badge>
                <div className="flex items-center gap-2">
                  <Progress value={t.progress} className="h-1" />
                  <span className="text-[11px] text-ink-mute tabular-nums shrink-0">{t.progress}%</span>
                </div>
                <span className="text-[12px] tabular-nums text-ink-soft">${t.cost.toFixed(0)}</span>
                <span className="text-[12px] tabular-nums text-ink-mute">
                  {new Date(t.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="text-[13px] text-ink-mute">No {tabs.find((t) => t.key === tab)?.label.toLowerCase()} work right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
