import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Database, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getWorker, getMemory, observationsForWorker } from "@/lib/knowledge/service";

export default function WorkerMemoryDetail() {
  const { id } = useParams();
  const worker = getWorker(id ?? "");
  const memory = getMemory(id ?? "");

  if (!worker || !memory) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Worker not found.</p>
      </div>
    );
  }

  const obs = observationsForWorker(worker.id);

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/knowledge" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Knowledge Hub
        </Link>

        <h1 className="mt-3 text-[22px] font-bold tracking-[-0.01em] text-ink">{worker.name}</h1>
        <p className="mt-1 text-[13px] text-ink-mute">Worker memory</p>
      </div>

      <div className="px-8 mt-5 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink mb-2">
              <Database className="h-4 w-4 text-accent" strokeWidth={1.9} />
              Memory Engine
            </p>
            <p className="text-[13px] leading-relaxed text-ink-soft">{memory.note}</p>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <Field label="Engine" value={memory.engine} />
              <Field label="Status" value={memory.status} />
              <Field label="Documents" value={String(memory.documents)} />
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Storage</p>
              <p className="text-[12.5px] text-ink-soft leading-relaxed">
                Memory is on task-local storage and is destroyed every time the task is replaced.
              </p>
            </div>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card p-5">
            <p className="text-[13.5px] font-bold text-ink mb-1">What this Worker could not tell us</p>
            <p className="text-[12px] text-ink-mute mb-3">Limitations of the available runtime telemetry — not a system failure.</p>
            <div className="space-y-2.5">
              {memory.unavailable.map((u) => (
                <div key={u.field} className="flex items-start gap-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-ink-faint shrink-0 mt-0.5" strokeWidth={1.9} />
                  <p className="text-[12.5px] text-ink-soft">
                    <span className="font-mono font-medium text-ink">{u.field}</span> — {u.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {obs.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2 px-1">Observations Backing This Memory</p>
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                {obs.map((o) => (
                  <Link
                    key={o.id}
                    to={`/knowledge/observations/${o.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition hover:bg-card-sunken/60"
                  >
                    <span className="text-[12.5px] text-ink truncate">{o.summary}</span>
                    <Badge variant="outline" className="shrink-0">
                      {o.outcome}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5">
          <Field label="Bounded context" value={worker.boundedContext} />
          <div className="mt-3 pt-3 border-t border-border">
            <Field label="Observations recorded" value={String(obs.length)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-medium text-ink">{value}</p>
    </div>
  );
}
