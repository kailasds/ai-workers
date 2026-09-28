import { useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText, Brain, ClipboardCheck, ShieldCheck, Loader2, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { businessDomains, boundedContexts, identities, autonomyLevels } from "./script";
import type { ComposeState, StepId } from "./types";

function workerIdentifier(compose: ComposeState) {
  const identity = compose.identityId ?? "…";
  const domain = compose.businessDomainId ?? "…";
  const context = compose.boundedContextId
    ? boundedContexts.find((b) => b.id === compose.boundedContextId)?.description.toLowerCase().replace(/\s+/g, "-")
    : "…";
  return `spiffe://tcs.ai/worker/modernization/${identity}/${domain}/${context}/…`;
}

export function IdentityPanel({
  compose,
  onJumpTo,
}: {
  compose: ComposeState;
  onJumpTo: (id: StepId) => void;
}) {
  const identity = identities.find((i) => i.id === compose.identityId);
  const domain = businessDomains.find((d) => d.id === compose.businessDomainId);
  const boundedContext = boundedContexts.find((b) => b.id === compose.boundedContextId);

  const headingParts = [identity?.name, domain?.name].filter(Boolean);
  const heading = headingParts.length ? headingParts.join(" · ") : "Not yet assigned";

  if (!compose.identityConfirmed) {
    const status = boundedContext && identity ? "Ready to issue" : "Assigning";
    return (
      <div className="rounded-card card-hero p-5 text-white h-fit sticky top-6 shadow-float">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
            <Fingerprint className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              status === "Ready to issue" ? "bg-status-green/25 text-white" : "bg-white/15 text-white"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status === "Ready to issue" ? "bg-status-green" : "bg-white/70 animate-pulse")} />
            {status}
          </span>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-white/60">Worker identity</p>
        <p className="mt-1 text-[19px] font-bold leading-snug tracking-[-0.01em] font-display">{heading}</p>

        <div className="mt-4 divide-y divide-white/15 border-t border-b border-white/15 text-[12.5px]">
          <IdentityRow label="Identity" value={identity?.name ?? "Not assigned"} />
          <IdentityRow label="Business domain" value={domain?.name ?? "None"} />
          <IdentityRow label="Bounded context" value={boundedContext?.description ?? "Not assigned"} />
          <div className="py-3">
            <p className="text-white/60">Worker identifier</p>
            <p className="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-white/80">{workerIdentifier(compose)}</p>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-white/60">
          {status === "Ready to issue"
            ? "The identity is reserved when you confirm. Everything after this attaches to it."
            : "Assign an identity to see which scopes it entitles."}
        </p>
      </div>
    );
  }

  return <ConfirmedRail compose={compose} heading={heading} identifier={workerIdentifier(compose)} onJumpTo={onJumpTo} />;
}

function ConfirmedRail({
  compose,
  heading,
  identifier,
  onJumpTo,
}: {
  compose: ComposeState;
  heading: string;
  identifier: string;
  onJumpTo: (id: StepId) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const domain = businessDomains.find((d) => d.id === compose.businessDomainId);
  const autonomy = autonomyLevels.find((a) => a.level === compose.autonomyLevel);

  const confirmedCount = [
    compose.intentConfirmed,
    compose.brain.status === "done",
    compose.dodConfirmed,
    compose.autonomyConfirmed,
  ].filter(Boolean).length;

  return (
    <div className="rounded-card border border-border bg-card shadow-float h-fit sticky top-6 overflow-hidden">
      {/* Hero header band — this identity is what the Worker comprises, it should read first */}
      <button onClick={() => onJumpTo("identity")} className="block w-full card-hero p-5 text-left text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15">
            <Fingerprint className="h-4.5 w-4.5" strokeWidth={1.9} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
            Revision {compose.revision}
          </span>
        </div>
        <p className="mt-3 text-[17px] font-bold leading-snug tracking-[-0.01em] font-display">{heading}</p>
        {compose.boundedContextId && (
          <p className="mt-0.5 text-[12px] text-white/70">{boundedContexts.find((b) => b.id === compose.boundedContextId)?.description}</p>
        )}
      </button>

      <div className="p-5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[11.5px] font-medium text-ink-mute hover:text-ink"
        >
          {expanded ? <ChevronDown className="h-3 w-3" strokeWidth={2.5} /> : <ChevronRight className="h-3 w-3" strokeWidth={2.5} />}
          Identity detail
        </button>
        {expanded && (
          <div className="mt-2 space-y-1.5 rounded-[10px] bg-card-sunken p-3 text-[11.5px] animate-in fade-in-0 slide-in-from-top-1 duration-150">
            <p className="text-ink-soft">Business domain — {domain?.name ?? "None"}</p>
            <p className="break-all font-mono text-[10px] text-ink-mute">{identifier}</p>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">Package progress</p>
            <span className="text-[12px] font-semibold tabular-nums text-ink">{confirmedCount} of 4 sections confirmed</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${(confirmedCount / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-3 -mx-1.5 divide-y divide-border">
          <SectionRow
            icon={FileText}
            title="Worker intent"
            detail={`${compose.workerIntent.agentCount} Agent · ${compose.workerIntent.harnessLabel} · Preset Tools`}
            done={compose.intentConfirmed}
            onClick={() => onJumpTo("intent")}
          />
          <BrainSectionRow compose={compose} onClick={() => onJumpTo("brain")} />
          <SectionRow
            icon={ClipboardCheck}
            title="Definition of Done"
            detail="3 release gates, all gating"
            done={compose.dodConfirmed}
            onClick={() => onJumpTo("dod")}
          />
          <SectionRow
            icon={ShieldCheck}
            title="Autonomy"
            detail={compose.autonomyConfirmed ? `Level ${autonomy?.level} · ${autonomy?.name}` : "Not yet resolved"}
            done={compose.autonomyConfirmed}
            onClick={() => onJumpTo("autonomy")}
          />
        </div>
      </div>
    </div>
  );
}

function SectionRow({
  icon: Icon,
  title,
  detail,
  done,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  detail: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 px-1.5 py-3 text-left transition-colors hover:bg-card-sunken">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="truncate text-[11px] text-ink-mute">{detail}</p>
      </div>
      <div
        className={cn(
          "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full",
          done ? "bg-status-green text-white" : "border border-border-strong"
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </div>
    </button>
  );
}

function BrainSectionRow({ compose, onClick }: { compose: ComposeState; onClick: () => void }) {
  const assembling = compose.brain.status === "assembling";
  const done = compose.brain.status === "done";
  const detail = !compose.brain.status || compose.brain.status === "idle"
    ? "Not yet assembled"
    : assembling
    ? "Assembling…"
    : `${compose.brain.skillsCount} skills · ${compose.brain.dslsCount} DSLs · ${compose.brain.evalsCount} EVALs`;

  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 px-1.5 py-3 text-left transition-colors hover:bg-card-sunken">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
        <Brain className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">Worker Brain</p>
        <p className="truncate text-[11px] text-ink-mute">{detail}</p>
      </div>
      <div
        className={cn(
          "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full",
          done ? "bg-status-green text-white" : assembling ? "text-accent" : "border border-border-strong"
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
        {assembling && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />}
      </div>
    </button>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-white/60 shrink-0">{label}</span>
      <span className="font-medium text-right truncate text-white">{value}</span>
    </div>
  );
}
