import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Search, Package, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FacetBadge } from "@/components/shared/facet-badge";
import { readyToDeliver, deliveredHistory, type DeliveryRecipient } from "@/lib/registry-data";

const stateTone: Record<DeliveryRecipient["state"], BadgeProps["variant"]> = {
  Prepared: "blue",
  Shared: "amber",
  Acknowledged: "green",
};

export default function CustomerDelivery() {
  const [query, setQuery] = useState("");

  const filteredHistory = deliveredHistory.filter(
    (d) =>
      !query.trim() ||
      d.customer.toLowerCase().includes(query.toLowerCase()) ||
      d.workerLabel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pb-12">
      <PageHeader
        title="Customer delivery"
        subtitle="Prepare a packaged Worker for a customer context."
        icon={Send}
        tone="accent"
        actions={
          <Button asChild variant="secondary">
            <Link to="/packaging">
              <Package className="h-3.5 w-3.5" strokeWidth={1.9} />
              Packaging
            </Link>
          </Button>
        }
      />

      <div className="px-8 space-y-6">
        <section>
          <h2 className="text-[15px] font-bold text-ink mb-0.5">Ready to deliver</h2>
          <p className="text-[12px] text-ink-mute mb-3">Packaged Workers with no delivery yet.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readyToDeliver.map((c) => (
              <div key={c.id} className="rounded-card border border-border bg-card shadow-card p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                    <Building2 className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{c.identityLabel}</p>
                    <p className="text-[11.5px] text-ink-mute truncate">{c.boundedContextLabel}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <FacetBadge facet="skills" value={c.skills} />
                  <FacetBadge facet="languages" value={c.languages} />
                  <FacetBadge facet="evals" value={c.evals} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10.5px] text-ink-faint">Revision {c.revision}</span>
                  <Button size="sm">Prepare for a customer</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-ink">Already delivered</h2>
              <p className="text-[12px] text-ink-mute">What went out, to whom, and the digest they received.</p>
            </div>
            <div className="relative w-64 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.9} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Worker or customer" className="pl-8" />
            </div>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">State</th>
                  <th className="px-3 py-3 font-semibold">Expires</th>
                  <th className="px-4 py-3 font-semibold">Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHistory.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-card-sunken">
                    <td className="px-4 py-3 font-medium text-ink">{d.workerLabel}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5 text-ink-soft">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.9} />
                        {d.customer}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={stateTone[d.state]} dot>
                        {d.state}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-ink-mute">{d.expires}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{d.digest}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-mute">
                      No deliveries match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
