import { Link } from "react-router-dom";
import { Package, Boxes, ShieldCheck, Plus, Send, Clock, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacetBadge, FacetCell } from "@/components/shared/facet-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { readyToPackage, alreadyPackaged, assemblingCount } from "@/lib/registry-data";

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Packaging() {
  return (
    <div className="pb-12">
      <PageHeader
        title="Packaging"
        subtitle="Seal a composed Worker into a signed artefact."
        icon={Package}
        tone="accent"
        actions={
          <Button asChild>
            <Link to="/workers/new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Compose a Worker
            </Link>
          </Button>
        }
      />

      <div className="px-8 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Ready to package" value={readyToPackage.length} icon={ShieldCheck} />
          <KpiCard label="Still assembling" value={assemblingCount} icon={Package} />
          <KpiCard label="Already sealed" value={alreadyPackaged.length} icon={Boxes} />
        </div>

        {/* Ready to package — horizontal row of compact cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-ink">Ready to package</h2>
              <p className="text-[12px] text-ink-mute">Assembly finished and every readiness check clear.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readyToPackage.map((c) => (
              <div key={c.id} className="rounded-card border border-status-green/25 bg-status-green-soft/25 shadow-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{c.identityLabel}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-mute truncate">{c.boundedContextLabel}</p>
                  </div>
                  <Badge variant="green" className="shrink-0">
                    r{c.revision}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <FacetBadge facet="skills" value={c.skills} />
                  <FacetBadge facet="languages" value={c.languages} />
                  <FacetBadge facet="evals" value={c.evals} />
                  <FacetBadge facet="dod" value={c.dodCount} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1 text-[10.5px] text-ink-faint">
                    <Clock className="h-3 w-3" strokeWidth={1.9} />
                    Composed {fmt(c.composedAt)}
                  </span>
                  <Button size="sm">
                    <Package className="h-3 w-3" strokeWidth={2} />
                    Package
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-ink-faint">{assemblingCount} compositions are still being assembled.</p>
        </section>

        {/* Already packaged — dense table, deliberately a different shape than the cards above */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-ink">Already packaged</h2>
              <p className="text-[12px] text-ink-mute">A row marked with the revision it was sealed at may have been edited since.</p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link to="/delivery">
                <Send className="h-3.5 w-3.5" strokeWidth={1.9} />
                Customer delivery
              </Link>
            </Button>
          </div>

          <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-3 py-3 font-semibold">Bounded context</th>
                  <th className="px-3 py-3 font-semibold text-right">Skills</th>
                  <th className="px-3 py-3 font-semibold text-right">Langs</th>
                  <th className="px-3 py-3 font-semibold text-right">EVALs</th>
                  <th className="px-3 py-3 font-semibold text-right">DoD</th>
                  <th className="px-3 py-3 font-semibold">Sealed</th>
                  <th className="px-4 py-3 font-semibold text-right">Runs on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alreadyPackaged.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-card-sunken">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-status-blue-soft text-status-blue">
                          <Boxes className="h-3.5 w-3.5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">{c.identityLabel}</p>
                          <p className="text-[11px] text-ink-mute">r{c.revision}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[220px] truncate text-ink-soft">{c.boundedContextLabel}</td>
                    <td className="px-3 py-3 text-right"><FacetCell facet="skills" value={c.skills} /></td>
                    <td className="px-3 py-3 text-right"><FacetCell facet="languages" value={c.languages} /></td>
                    <td className="px-3 py-3 text-right"><FacetCell facet="evals" value={c.evals} /></td>
                    <td className="px-3 py-3 text-right"><FacetCell facet="dod" value={c.dodCount} /></td>
                    <td className="px-3 py-3">
                      {c.sealedAt ? (
                        <Badge variant="green" dot>
                          {fmt(c.sealedAt)}
                        </Badge>
                      ) : (
                        <span className="text-ink-mute">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint">
                        <Layers className="h-3 w-3" strokeWidth={1.9} />
                        {c.runsOn}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
