import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getObservation, getRun, getWorker, getConstruct, topics } from "@/lib/knowledge/service";
import type { Outcome } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

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

export default function ObservationDetail() {
  const { id } = useParams();
  const observation = getObservation(id ?? "");

  if (!observation) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Observation not found.</p>
      </div>
    );
  }

  const run = getRun(observation.runId)!;
  const worker = getWorker(observation.workerId)!;
  const construct = getConstruct(observation.constructId);
  const topic = topics.find((t) => t.id === observation.topicId);

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/knowledge" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Knowledge Hub
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant={outcomeTone[observation.outcome]}>{observation.outcome}</Badge>
          {topic && <Badge variant="outline">{topic.name}</Badge>}
        </div>
        <h1 className="mt-1.5 text-[20px] font-bold tracking-[-0.01em] text-ink leading-snug">{observation.summary}</h1>
        <p className="mt-1 text-[13px] text-ink-mute">
          {worker.name} · {timeAgo(observation.recordedAt)}
        </p>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <Section title="Result">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border -mx-5 -mb-5 mt-2">
              {run.metrics.map((m) => (
                <div key={m.label} className="px-5 py-3">
                  <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{m.label}</p>
                  <p className="mt-1 text-[20px] font-bold tabular-nums text-ink">{m.value === null ? "—" : `${m.value}%`}</p>
                  <p className="mt-0.5 text-[11px] text-ink-mute">Target ≥{m.target}%</p>
                  <Badge variant={outcomeTone[m.status]} className="mt-1.5">
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>

          {run.note && (
            <div className="rounded-card border border-status-amber/25 bg-status-amber-soft p-4">
              <p className="text-[12.5px] text-ink font-medium">{run.note}</p>
            </div>
          )}

          <Section title="Source Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Source technology" value="TIBCO BusinessWorks" />
              <Field label="Target technology" value="Java Spring Boot" />
              <Field label="Bounded context" value="Service orchestration" />
              <Field label="Worker" value={worker.name} />
              <Field label="Run ID" value={run.id} mono />
              <Field label="Observation ID" value={observation.id} mono />
            </div>
          </Section>

          <Section title="Citations">
            <div className="space-y-1.5">
              {run.metrics.map((m) => (
                <div key={m.label} className="flex items-start gap-2.5 rounded-lg border border-border px-3.5 py-2.5">
                  <Quote className="h-3.5 w-3.5 text-ink-faint shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="text-[12px] text-ink-soft">
                    <span className="font-medium text-ink">{m.status} · TIBCO → Java Spring Boot</span> — {m.label.toLowerCase()} result from run {run.id.slice(0, 8)}.
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Evidence Timeline">
            <div className="space-y-0">
              {run.timeline.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1" />
                    {i < run.timeline.length - 1 && <span className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3.5 min-w-0">
                    <p className="text-[12.5px] text-ink">{step.label}</p>
                    <p className="text-[11px] text-ink-faint">{timeAgo(step.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Definition of Done</p>
            <div className="space-y-2">
              {run.dodChecks.map((d) => (
                <div key={d.label}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink-soft">{d.label}</span>
                    <Badge variant={outcomeTone[d.status]}>{d.status}</Badge>
                  </div>
                  {d.note && <p className="mt-0.5 text-[11px] text-ink-mute">{d.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {construct && (
            <div className="pt-3 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1.5">Contributes To</p>
              <Link to={`/knowledge/constructs/${construct.id}`} className="text-[12.5px] font-medium text-accent-ink hover:underline">
                {construct.name}
              </Link>
            </div>
          )}

          {observation.contradicts && observation.contradicts.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-status-amber mb-1.5">Contradicts</p>
              {observation.contradicts.map((oid) => (
                <Link key={oid} to={`/knowledge/observations/${oid}`} className="block text-[12px] text-accent-ink hover:underline truncate">
                  {getObservation(oid)?.summary}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <Link to={`/knowledge/memory/${worker.id}`} className="text-[12px] font-medium text-accent-ink hover:underline">
              View {worker.name.split(" · ")[1] ?? worker.name} memory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <p className="text-[13.5px] font-bold text-ink mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={cn("mt-0.5 text-[12.5px] font-medium text-ink truncate", mono && "font-mono text-[11.5px]")}>{value}</p>
    </div>
  );
}
