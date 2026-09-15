import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { FacetBadge } from "@/components/shared/facet-badge";
import { cn } from "@/lib/utils";
import { identities, businessDomains, boundedContexts } from "./script";
import type { ComposeState } from "./types";

export function IdentityStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const identity = identities.find((i) => i.id === compose.identityId);
  const domain = businessDomains.find((d) => d.id === compose.businessDomainId);
  const activeContext = boundedContexts.find((b) => b.id === compose.boundedContextId) ?? boundedContexts[0];
  const [excludedOpen, setExcludedOpen] = useState(false);

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Step 1 of 5</p>
      <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Assign identity and select bounded context</h2>

      <div className="mt-5">
        <p className="text-[13.5px] font-bold text-ink">Assign identity</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">
          The identity decides which scopes this Worker may be bound to. A business domain decides which Skills, Domain Specific
          Languages and EVALs come with it, and can be left out.
        </p>

        <div className="mt-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Identity</label>
          <IdentityPicker
            selectedId={compose.identityId}
            onSelect={(id) => update("identityId", id)}
          />
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            identity ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Business domain</label>
            <DomainPicker selectedId={compose.businessDomainId} onSelect={(id) => update("businessDomainId", id)} />
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
              Optional. Without one, no domain language binds and Skills come from cross-cutting practice and the conversion itself.
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          identity ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-[13.5px] font-bold text-ink mb-3">Select bounded context</p>
          <div className="space-y-2.5">
            {boundedContexts.map((b) => {
              const selected = b.id === compose.boundedContextId;
              return (
                <button
                  key={b.id}
                  onClick={() => update("boundedContextId", b.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[12px] border p-4 text-left transition-colors",
                    selected ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong hover:bg-card-sunken"
                  )}
                >
                  <div className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2", selected ? "border-accent" : "border-border-strong")}>
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </div>
                  <b.icon className={cn("mt-0.5 h-4 w-4 shrink-0", selected ? "text-accent-ink" : "text-ink-mute")} strokeWidth={1.9} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{b.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-mute">{b.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[12px] bg-card-sunken p-4">
            <p className="text-[13px] font-bold text-ink">{activeContext.description}</p>
            <div className="mt-2.5 space-y-2 text-[12px]">
              <div className="flex gap-3">
                <span className="w-20 shrink-0 text-ink-mute">Produces</span>
                <span className="text-ink-soft leading-relaxed">{activeContext.produces}</span>
              </div>
              <div className="flex gap-3">
                <span className="w-20 shrink-0 text-ink-mute">Procedure</span>
                <span className="text-ink-soft">
                  {activeContext.procedureLabel} · {activeContext.procedureStages} stages
                </span>
              </div>
            </div>
            <button
              onClick={() => setExcludedOpen((v) => !v)}
              className="mt-3 flex items-center gap-1 text-[11.5px] font-medium text-ink-mute hover:text-ink"
            >
              {excludedOpen ? <ChevronDown className="h-3 w-3" strokeWidth={2.5} /> : <ChevronRight className="h-3 w-3" strokeWidth={2.5} />}
              {activeContext.excludedActions.length} excluded actions
            </button>
            {excludedOpen && (
              <ul className="mt-2 space-y-1 pl-4 text-[11.5px] text-ink-mute animate-in fade-in-0 slide-in-from-top-1 duration-150">
                {activeContext.excludedActions.map((a) => (
                  <li key={a} className="list-disc">
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="mt-4 flex items-start gap-2.5 rounded-[12px] border border-accent-border bg-accent-soft p-3.5 cursor-pointer">
            <Checkbox checked={compose.autoAssemblePreset} onCheckedChange={(v) => update("autoAssemblePreset", !!v)} className="mt-0.5" />
            <span>
              <span className="block text-[12.5px] font-semibold text-ink">Auto-assemble preset</span>
              <span className="block text-[11.5px] text-ink-mute">Continue through configured checkpoints. Assembly pauses for input, errors and deployment actions.</span>
            </span>
          </label>
        </div>
      </div>

      {domain && (
        <p className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-ink-faint">
          <FacetBadge facet="skills" value={domain.skillCount} />
          <FacetBadge facet="languages" value={domain.dslCount} />
        </p>
      )}
    </div>
  );
}

function IdentityPicker({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = identities.find((i) => i.id === selectedId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="mt-1 flex h-11 w-full items-center justify-between rounded-lg border border-border-strong bg-card px-3.5 text-left text-[13px] text-ink transition hover:border-accent-border">
          {selected ? (
            <span>
              <span className="block font-semibold">{selected.name}</span>
              <span className="block text-[11.5px] font-normal text-ink-mute">{selected.description}</span>
            </span>
          ) : (
            <span className="text-ink-faint">Choose an identity</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-1.5" align="start">
        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 mb-1">
          <Search className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          <span className="text-[12px] text-ink-faint">Type to narrow the list</span>
        </div>
        {identities.map((i) => (
          <button
            key={i.id}
            onClick={() => {
              if (!i.available) return;
              onSelect(i.id);
              setOpen(false);
            }}
            disabled={!i.available}
            className={cn(
              "flex w-full items-start justify-between gap-3 rounded-[8px] px-2.5 py-2.5 text-left transition-colors",
              i.available ? "hover:bg-card-sunken" : "cursor-not-allowed opacity-60",
              i.id === selectedId && "bg-accent-soft"
            )}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                {i.name}
                {i.id === selectedId && <Check className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2.5} />}
              </span>
              <span className="block text-[11.5px] leading-snug text-ink-mute">{i.description}</span>
              {!i.available && <span className="text-[10.5px] text-status-amber">Available later. No bounded context is admitted for it yet.</span>}
            </span>
            {i.available && <span className="shrink-0 text-[11px] text-ink-faint">{i.scopeCount} scopes</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function DomainPicker({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const selected = businessDomains.find((d) => d.id === selectedId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="mt-1 flex h-11 w-full items-center justify-between rounded-lg border border-border-strong bg-card px-3.5 text-left text-[13px] text-ink transition hover:border-accent-border">
          {selected ? (
            <span>
              <span className="block font-semibold">{selected.name}</span>
              <span className="block text-[11.5px] font-normal text-ink-mute">{selected.description}</span>
            </span>
          ) : (
            <span className="text-ink-faint">No business domain</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[440px] p-1.5 max-h-80 overflow-y-auto" align="start">
        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 mb-1">
          <Search className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          <span className="text-[12px] text-ink-faint">Type to narrow the list</span>
        </div>
        {businessDomains.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              onSelect(d.id);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-start justify-between gap-3 rounded-[8px] px-2.5 py-2.5 text-left transition-colors hover:bg-card-sunken",
              d.id === selectedId && "bg-accent-soft"
            )}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                {d.name}
                {d.id === selectedId && <Check className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2.5} />}
              </span>
              <span className="block text-[11.5px] leading-snug text-ink-mute">{d.description}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-ink-faint">
              {d.skillCount} Skills{d.dslCount > 0 ? ` · ${d.dslCount} DSLs` : ""}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
