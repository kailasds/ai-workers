import { useState } from "react";
import { Check, Package, Layers, Search, Info } from "lucide-react";
import { EditableChipList } from "@/components/shared/editable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AiPrepCard } from "./worker-brief";
import { availablePackages, draftWorker } from "./script";
import type { ComposeState, ImportedPackage } from "./types";
import { cn } from "@/lib/utils";

const skillDescriptions: Record<string, string> = Object.fromEntries(draftWorker.skills.map((s) => [s.name, s.description]));

export function CapabilitiesStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-1 rounded-full bg-card-sunken p-1">
        <button
          onClick={() => update("capabilitiesMode", "build")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 h-9 text-[13px] font-semibold transition-colors",
            compose.capabilitiesMode === "build" ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
          )}
        >
          <Layers className="h-3.5 w-3.5" strokeWidth={2} />
          Build from Capabilities
        </button>
        <button
          onClick={() => update("capabilitiesMode", "import")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 h-9 text-[13px] font-semibold transition-colors",
            compose.capabilitiesMode === "import" ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
          )}
        >
          <Package className="h-3.5 w-3.5" strokeWidth={2} />
          Import Package
        </button>
      </div>

      {compose.capabilitiesMode === "build" ? (
        <BuildTab compose={compose} update={update} />
      ) : (
        <ImportTab compose={compose} update={update} />
      )}
    </div>
  );
}

function BuildTab({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-5">
      <AiPrepCard title="Based on your Worker's purpose, AI recommends these capabilities.">
        <p className="text-[12px] leading-relaxed text-ink">
          Recommended capabilities are pre-selected below — deselect anything you don't need, or search for more.
        </p>
      </AiPrepCard>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search capabilities…" className="rounded-full pl-9" />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Agent Team</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {draftWorker.agentMesh
            .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
            .map((a) => (
              <div key={a.id} className="rounded-[10px] border border-border px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-ink truncate">{a.name}</p>
                  {a.isOrchestrator ? (
                    <Badge variant="accent">Primary</Badge>
                  ) : (
                    <Badge variant="green">
                      <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> AI
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[10.5px] text-ink-mute line-clamp-1">{a.role}</p>
              </div>
            ))}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Skills</p>
        <EditableChipList items={compose.skills} onChange={(items) => update("skills", items)} addLabel="Add skill" chipTone="green" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {compose.skills
            .filter((s) => skillDescriptions[s])
            .map((s) => (
              <Popover key={s}>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1 text-[10.5px] text-ink-mute hover:text-accent-ink">
                    <Info className="h-2.5 w-2.5" strokeWidth={2} />
                    Why "{s}"?
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-[12px] leading-relaxed text-ink-soft">
                  <p className="mb-1 text-[11px] font-semibold text-ink">Why this skill?</p>
                  {skillDescriptions[s]}
                </PopoverContent>
              </Popover>
            ))}
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Tools &amp; Access</p>
        <EditableChipList items={compose.tools} onChange={(items) => update("tools", items)} addLabel="Add tool" />
      </div>
    </div>
  );
}

function ImportTab({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [previewing, setPreviewing] = useState<ImportedPackage | null>(null);

  function importPackage(pkg: ImportedPackage) {
    update("importedPackage", pkg);
    update("skills", pkg.skills);
    update("tools", pkg.tools);
  }

  if (compose.importedPackage) {
    const pkg = compose.importedPackage;
    return (
      <div className="space-y-4">
        <AiPrepCard title={`${pkg.name} imported.`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-ink">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {pkg.agents} Agents</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {pkg.skills.length} Skills</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {pkg.tools.length} Tools</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-status-green" strokeWidth={2.5} /> {pkg.apis} APIs</span>
          </div>
        </AiPrepCard>

        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-ink">{pkg.name}</p>
              <p className="text-[11.5px] text-ink-mute">
                {pkg.team} · v{pkg.version}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => update("importedPackage", null)}>
              Remove package
            </Button>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">
            Skills <Badge variant="accent" className="ml-1">Imported</Badge>
          </p>
          <EditableChipList items={compose.skills} onChange={(items) => update("skills", items)} addLabel="Add skill" chipTone="green" />

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">
            Tools <Badge variant="accent" className="ml-1">Imported</Badge>
          </p>
          <EditableChipList items={compose.tools} onChange={(items) => update("tools", items)} addLabel="Add tool" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-ink-mute">
        Build this Worker from a package another team has already created — agents, skills, tools and configuration come with it.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availablePackages.map((pkg) => (
          <div key={pkg.id} className="rounded-card border border-border bg-card shadow-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink truncate">{pkg.name}</p>
                <p className="text-[11.5px] text-ink-mute">
                  {pkg.team} · v{pkg.version}
                </p>
              </div>
              <Badge variant={pkg.compatibility === "Compatible" ? "green" : "amber"} dot className="shrink-0">
                {pkg.compatibility}
              </Badge>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-mute">
              <span>{pkg.agents} agents</span>
              <span>{pkg.skills.length} skills</span>
              <span>{pkg.tools.length} tools</span>
              <span>{pkg.apis} APIs</span>
              <span>Updated {pkg.lastUpdated}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => importPackage(pkg)}>
                Import package
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPreviewing(pkg)}>
                Preview
              </Button>
            </div>
          </div>
        ))}
      </div>

      {previewing && (
        <div className="rounded-card border border-accent-border bg-accent-soft p-4">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-accent-ink">{previewing.name} — contents</p>
            <button onClick={() => setPreviewing(null)} className="text-[11px] text-ink-mute hover:text-ink">
              Close
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...previewing.skills, ...previewing.tools].map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
