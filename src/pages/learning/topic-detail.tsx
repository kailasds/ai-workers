import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { topics, topicSummary, observationsForTopic, getWorker, getConstruct } from "@/lib/knowledge/service";
import type { Outcome } from "@/lib/knowledge/types";

const outcomeTone: Record<Outcome, "green" | "amber" | "blue" | "neutral" | "red"> = {
  Met: "green",
  "Not met": "red",
  "Awaiting evidence": "amber",
  "Not adjudicable": "neutral",
  "Not measured": "neutral",
};

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function TopicDetail() {
  const { id } = useParams();
  const topic = topics.find((t) => t.id === id);
  const summary = topicSummary(id ?? "");
  const obs = observationsForTopic(id ?? "").sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  if (!topic) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Topic not found.</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Learning Landscape
        </Link>

        <h1 className="mt-3 text-[22px] font-bold tracking-[-0.01em] text-ink">{topic.name}</h1>
        <p className="mt-1 flex items-center gap-3 text-[13px] text-ink-mute">
          <span>{summary.observationCount} observations</span>
          <span>·</span>
          <span>{summary.workerCount} Workers</span>
          <Badge variant="amber">Lost on restart</Badge>
        </p>
      </div>

      <div className="px-8 mt-5">
        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          {obs.map((o) => {
            const worker = getWorker(o.workerId);
            const construct = getConstruct(o.constructId);
            return (
              <Link
                key={o.id}
                to={`/learning/observations/${o.id}`}
                className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-b-0 transition hover:bg-card-sunken/60"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] text-ink truncate">{o.summary}</p>
                  <p className="mt-0.5 text-[11px] text-ink-mute">
                    {worker?.name} · {construct?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={outcomeTone[o.outcome]}>{o.outcome}</Badge>
                  <span className="text-[11px] text-ink-faint">{timeAgo(o.recordedAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
