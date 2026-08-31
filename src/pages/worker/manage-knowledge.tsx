import { Plus, Upload, Link2, Sparkle } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ManageKnowledge() {
  const worker = useWorker();
  const stale = worker.knowledge.find((k) => k.status === "Stale");

  return (
    <div className="pb-10">
      <ConfigHeader
        title="Knowledge & Training"
        subtitle="What guides this worker's decisions."
        actions={
          <>
            <Button size="sm" variant="secondary">
              <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
              Upload Document
            </Button>
            <Button size="sm" variant="secondary">
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Connect Source
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Knowledge
            </Button>
          </>
        }
      />

      {stale && (
        <div className="mb-4 rounded-card border border-accent-border bg-accent-soft p-4 flex items-start gap-3">
          <Sparkle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-accent-ink">
              AI recommends adding the latest <span className="font-medium">Security Architecture Guidelines</span> because
              this worker accesses production-adjacent systems.
            </p>
          </div>
          <Button size="sm" variant="secondary" className="shrink-0">
            Review Recommendation
          </Button>
        </div>
      )}

      {worker.knowledge.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No knowledge sources connected yet.</p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
          {worker.knowledge.map((k) => (
            <div key={k.id} className="flex items-center gap-5 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-medium text-ink">{k.name}</p>
                  <Badge variant="outline">{k.type}</Badge>
                  {k.version && <span className="text-[11.5px] text-ink-mute">v{k.version}</span>}
                </div>
                {k.detail && <p className="mt-1 text-[12px] text-ink-mute">{k.detail}</p>}
              </div>
              <div className="w-32 shrink-0">
                <Badge variant={k.status === "Stale" ? "amber" : "green"} dot>
                  {k.status}
                </Badge>
              </div>
              <div className="w-28 shrink-0 text-right">
                <p className="text-[12px] text-ink-soft tabular-nums">{k.lastUpdated}</p>
                <p className="text-[10.5px] text-ink-mute">updated</p>
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className="text-[16px] tabular-nums text-ink font-display">{k.usageCount.toLocaleString()}</p>
                <p className="text-[10.5px] text-ink-mute">uses</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
