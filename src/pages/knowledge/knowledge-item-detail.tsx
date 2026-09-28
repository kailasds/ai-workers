import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getKnowledgeItemDetail } from "@/lib/knowledge-repo/service";
import { KnowledgeRelationGraph, type RelationItem } from "@/components/knowledge-repo/knowledge-relation-graph";
import { cn } from "@/lib/utils";

export function KnowledgeItemDetail() {
  const { id = "" } = useParams();
  const item = getKnowledgeItemDetail(id);

  if (!item) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Knowledge item not found.</p>
        <Link to="/knowledge" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Knowledge
        </Link>
      </div>
    );
  }

  const related: RelationItem[] = [
    ...item.relatedSkills.map((r) => ({ ...r, kind: "Skill" as const })),
    ...item.relatedDomainLanguage.map((r) => ({ ...r, kind: "Domain Language" as const })),
    ...item.relatedEvents.map((r) => ({ ...r, kind: "Event" as const })),
    ...item.relatedSMEs.map((r) => ({ ...r, kind: "SME" as const })),
  ];

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/knowledge" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Knowledge
        </Link>
      </div>

      <div className="px-8 pt-3 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink mb-1.5">{item.type}</p>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold leading-[1.15] tracking-[-0.01em] text-ink font-display">{item.name}</h1>
            <p className="mt-1.5 max-w-2xl text-[13px] text-ink-mute">{item.description}</p>
          </div>
          {item.learningFocusId && (
            <Link
              to={`/learning?focus=${item.learningFocusId}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 h-9 text-[12.5px] font-semibold text-white hover:bg-brand-800"
            >
              View learning
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Status" value={item.status} />
            <Stat label="Workers using" value={String(item.workerNames.length)} />
            <Stat label="Learning" value={item.learning.label} muted={item.learning.label === "Not measured"} />
          </div>

          {item.topics.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {item.topics.map((t) => (
                  <Badge key={t} variant="neutral">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {item.workerNames.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Workers using this</p>
              <div className="flex flex-wrap gap-1.5">
                {item.workerNames.map((n) => (
                  <Badge key={n} variant="blue">{n}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Relationships</p>
            </div>
            <div className="h-[320px]">
              <KnowledgeRelationGraph centerLabel={item.name} related={related} />
            </div>
          </div>

          {(item.candidateKnowledge || item.certifiedKnowledge) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.candidateKnowledge && (
                <div className="rounded-card border border-status-amber-soft bg-status-amber-soft/40 p-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-status-amber mb-1">Candidate knowledge</p>
                  <p className="text-[12.5px] font-medium text-ink">{item.candidateKnowledge.claim}</p>
                  <Badge variant="amber" className="mt-2">{item.candidateKnowledge.status}</Badge>
                </div>
              )}
              {item.certifiedKnowledge && (
                <div className="rounded-card border border-status-green-soft bg-status-green-soft/40 p-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-status-green mb-1">Certified / published knowledge</p>
                  <p className="text-[12.5px] font-medium text-ink">{item.certifiedKnowledge.name}</p>
                </div>
              )}
            </div>
          )}

          {item.recentObservations.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Recent observations</p>
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                {item.recentObservations.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
                    <div className="min-w-0 flex items-start gap-2">
                      <Eye className="h-3.5 w-3.5 shrink-0 mt-0.5 text-ink-faint" strokeWidth={2} />
                      <p className="text-[12.5px] text-ink truncate">{o.summary}</p>
                    </div>
                    <Badge variant="neutral" className="shrink-0">{o.outcome}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <RelatedList title="Related Skills" items={item.relatedSkills} />
          <RelatedList title="Related Domain Language" items={item.relatedDomainLanguage} />
          <RelatedList title="Related Events" items={item.relatedEvents} />
          <RelatedList title="Related SMEs" items={item.relatedSMEs} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card px-4 py-3">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={cn("mt-1 text-[14.5px] font-bold", muted ? "text-ink-faint" : "text-ink")}>{value}</p>
    </div>
  );
}

function RelatedList({ title, items }: { title: string; items: { id: string; name: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{title}</p>
      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        {items.map((r) => (
          <Link
            key={r.id}
            to={`/knowledge/${r.id}`}
            className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 last:border-b-0 transition-colors hover:bg-card-sunken/60"
          >
            <span className="min-w-0 truncate text-[12.5px] font-medium text-ink">{r.name}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={2} />
          </Link>
        ))}
      </div>
    </div>
  );
}
