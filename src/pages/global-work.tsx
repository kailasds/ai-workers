import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { allCurrentWork, allWorkHistory } from "@/lib/data";
import { taskStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "active", label: "Active" },
  { key: "certified-complete", label: "Certified Complete" },
  { key: "needs-review", label: "Needs Review" },
  { key: "failed", label: "Failed" },
];

export default function GlobalWork() {
  const [tab, setTab] = useState("active");

  return (
    <div className="pb-10">
      <PageHeader
        title="Work"
        subtitle="What the entire AI Workforce is performing right now."
        actions={
          <Button asChild>
            <Link to="/work/assign">
              <ClipboardList className="h-4 w-4" strokeWidth={2} />
              Assign Work
            </Link>
          </Button>
        }
      />

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
                {t.key === "active" ? allCurrentWork.length : allWorkHistory.filter((w) => w.status === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {tab === "active" ? (
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1.8fr_1.2fr_0.9fr_0.9fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
              <span>Worker</span>
              <span>Work</span>
              <span>Progress</span>
              <span>Cost</span>
              <span>Started</span>
            </div>
            {allCurrentWork.map(({ worker, work }) => (
              <Link
                key={worker.id}
                to={`/workers/${worker.id}/operations`}
                className="grid grid-cols-[1.6fr_1.8fr_1.2fr_0.9fr_0.9fr] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
              >
                <span className="truncate text-[13px] font-medium text-ink">{worker.name}</span>
                <span className="truncate text-[12.5px] text-ink-soft">{work.title}</span>
                <div className="flex items-center gap-2">
                  <Progress value={work.progress} className="h-1" />
                  <span className="text-[11px] text-ink-mute tabular-nums shrink-0">{work.progress}%</span>
                </div>
                <span className="text-[12px] tabular-nums text-ink-soft">${work.cost.toFixed(0)}</span>
                <span className="text-[12px] tabular-nums text-ink-mute">
                  {new Date(work.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            ))}
            {allCurrentWork.length === 0 && (
              <div className="px-5 py-14 text-center">
                <p className="text-[13px] text-ink-mute">No active work right now.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1.8fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
              <span>Worker</span>
              <span>Work</span>
              <span>Definition of Done</span>
              <span>Cost</span>
              <span>Completed</span>
            </div>
            {allWorkHistory
              .filter((w) => w.status === tab)
              .map((w) => {
                const meta = taskStatusMeta[w.status];
                return (
                  <Link
                    key={w.id}
                    to={`/workers/${w.workerId}/work-history/${w.id}`}
                    className="grid grid-cols-[1.6fr_1.8fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 transition-colors hover:bg-card-sunken/50"
                  >
                    <span className="truncate text-[13px] font-medium text-ink">{w.workerName}</span>
                    <span className="truncate text-[12.5px] text-ink-soft">{w.title}</span>
                    <Badge variant={meta.color} dot>
                      {w.dodPassed} / {w.dodTotal} passed
                    </Badge>
                    <span className="text-[12px] tabular-nums text-ink-soft">${w.cost}</span>
                    <span className="text-[12px] tabular-nums text-ink-mute">{w.completedAt}</span>
                  </Link>
                );
              })}
            {allWorkHistory.filter((w) => w.status === tab).length === 0 && (
              <div className="px-5 py-14 text-center">
                <p className="text-[13px] text-ink-mute">No {tabs.find((t) => t.key === tab)?.label.toLowerCase()} work items.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
