import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { workers } from "@/lib/data";

const orgPolicies = [
  {
    id: "gp-1",
    name: "Enterprise Security Policy",
    appliesTo: "All AI Workers",
    version: "5.1",
    lastUpdated: "2026-07-01",
    status: "Enforced" as const,
    affected: workers.length,
  },
  {
    id: "gp-2",
    name: "Data Privacy Policy",
    appliesTo: "Workers handling customer information",
    version: "3.1",
    lastUpdated: "2026-04-09",
    status: "Enforced" as const,
    affected: workers.filter((w) => ["Claims", "Insurance", "Finance", "Customer Success"].includes(w.department)).length,
  },
  {
    id: "gp-3",
    name: "Production Access Policy",
    appliesTo: "Engineering Workers",
    version: "2.0",
    lastUpdated: "2026-03-18",
    status: "Enforced" as const,
    affected: workers.filter((w) => w.department === "Engineering Transformation").length,
  },
  {
    id: "gp-4",
    name: "Vendor Data Sharing Policy",
    appliesTo: "Procurement and Legal Workers",
    version: "1.4",
    lastUpdated: "2026-06-22",
    status: "Exception" as const,
    affected: workers.filter((w) => ["Procurement", "Legal"].includes(w.department)).length,
  },
];

export default function GlobalGovernance() {
  return (
    <div className="pb-10">
      <PageHeader
        title="Governance"
        subtitle="The rules that govern your AI Workforce."
        actions={
          <Button>
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Policy
          </Button>
        }
      />

      <div className="px-8">
        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_0.8fr_1fr] items-center gap-4 border-b border-border bg-card-sunken/60 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
            <span>Policy</span>
            <span>Applies To</span>
            <span>Workers Affected</span>
            <span>Version</span>
            <span>Status</span>
          </div>
          {orgPolicies.map((p) => (
            <div key={p.id} className="grid grid-cols-[2fr_2fr_1fr_0.8fr_1fr] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
              <div>
                <p className="text-[13.5px] font-medium text-ink">{p.name}</p>
                <p className="text-[11.5px] text-ink-mute">Updated {p.lastUpdated}</p>
              </div>
              <span className="text-[12.5px] text-ink-soft">{p.appliesTo}</span>
              <span className="text-[13px] tabular-nums text-ink">{p.affected}</span>
              <span className="text-[12.5px] text-ink-mute">v{p.version}</span>
              <Badge variant={p.status === "Enforced" ? "green" : "amber"} dot>
                {p.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
