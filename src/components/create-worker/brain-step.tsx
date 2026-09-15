import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Sparkles, FileCode2, Braces, ClipboardCheck, ShieldCheck, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { assemblyLog } from "./script";
import type { AssemblyLogEntry, BrainFacet, ComposeState } from "./types";

const TARGET = { read: 356, bound: 13, screenedOut: 343, skills: 7, dsls: 4 };
const TICK_MS = 420;

const facetIcon: Record<BrainFacet, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  skill: FileCode2,
  dsl: Braces,
  eval: ClipboardCheck,
  meta: FolderOpen,
};

const facetTone: Record<BrainFacet, string> = {
  skill: "bg-status-blue-soft text-status-blue",
  dsl: "bg-status-purple-soft text-status-purple",
  eval: "bg-status-amber-soft text-status-amber",
  meta: "bg-card-sunken text-ink-soft",
};

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function BrainStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [revealed, setRevealed] = useState(compose.brain.status === "done" ? assemblyLog.length : 0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Guard on status (not a ref) so this is safe under React 18 StrictMode's
    // dev-only mount → cleanup → mount cycle: both invocations read the same
    // "idle" closure and schedule fresh timers; the first run's timers are
    // cancelled by its cleanup, and only the second (real) run's timers fire.
    if (compose.brain.status === "done") return;
    update("brain", { ...compose.brain, status: "assembling" });

    const scheduled: number[] = [];
    assemblyLog.forEach((_, i) => {
      const id = window.setTimeout(() => {
        setRevealed(i + 1);
      }, TICK_MS * (i + 1));
      scheduled.push(id);
    });

    const finishId = window.setTimeout(() => {
      update("brain", {
        status: "done",
        read: TARGET.read,
        bound: TARGET.bound,
        screenedOut: TARGET.screenedOut,
        skillsCount: TARGET.skills,
        dslsCount: TARGET.dsls,
        evalsCount: 5,
        sentinelState: "Watching",
      });
    }, TICK_MS * (assemblyLog.length + 1));
    scheduled.push(finishId);

    return () => {
      scheduled.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drive interim counters off `revealed` while assembling
  useEffect(() => {
    if (compose.brain.status !== "assembling") return;
    const t = easeOut(revealed / assemblyLog.length);
    update("brain", {
      ...compose.brain,
      read: Math.round(TARGET.read * t),
      bound: Math.round(TARGET.bound * t),
      screenedOut: Math.round(TARGET.screenedOut * t),
      skillsCount: Math.round(TARGET.skills * t),
      dslsCount: Math.round(TARGET.dsls * t),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed]);

  const done = compose.brain.status === "done";
  const visibleEntries = assemblyLog.slice(0, revealed);

  return (
    <div className="rounded-card border border-border bg-card shadow-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">Step 3 of 5</p>
      <h2 className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-ink font-display">Worker Brain</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-mute">Every part of it, and what is inside each one.</p>

      <div className="mt-5 rounded-[14px] border border-border bg-card-sunken/60 p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span className={cn("h-2 w-2 rounded-full", done ? "bg-status-green" : "bg-accent animate-pulse")} />
            {done ? "Worker Brain assembled" : "Assembling the Worker Brain"}
          </p>
          {!done && (
            <div className="flex items-center gap-3 text-[11px] tabular-nums text-ink-mute">
              <span>
                Read <span className="font-semibold text-ink">{compose.brain.read}</span>
              </span>
              <span>
                Bound <span className="font-semibold text-ink">{compose.brain.bound}</span>
              </span>
              <span>
                Screened out <span className="font-semibold text-ink">{compose.brain.screenedOut}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <BrainTile label="Skills" value={done ? `${compose.brain.skillsCount}` : String(compose.brain.skillsCount)} sub={done ? undefined : "assembling"} tone="blue" />
          <BrainTile label="DSLs" value={done ? `${compose.brain.dslsCount}` : String(compose.brain.dslsCount)} sub={done ? undefined : "assembling"} tone="purple" />
          <BrainTile label="EVALs" value={String(compose.brain.evalsCount)} tone="amber" />
          <BrainTile label="Memory" value={done ? "Configured" : "—"} sub={done ? undefined : "Configuring"} tone="neutral" />
          <BrainTile label="Sentinel" value={done ? "Watching" : "Resolving"} tone="neutral" />
        </div>

        {!done && (
          <div ref={logRef} className="mt-4 max-h-56 space-y-1.5 overflow-y-auto rounded-[10px] border border-border bg-card p-2.5">
            {visibleEntries.map((entry, i) => (
              <LogRow key={entry.id} entry={entry} isNew={i === visibleEntries.length - 1} />
            ))}
            {visibleEntries.length === 0 && <p className="px-2 py-3 text-[11.5px] text-ink-faint">Reading the bounded context…</p>}
          </div>
        )}

        <FacetAccordion compose={compose} />
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Sparkles className="h-3 w-3" strokeWidth={2} />
        The Definition of Done and the autonomy level are not in here. Neither is something the Worker knows or learns — both are the
        bar it is held to, and it does not set its own.
      </p>
    </div>
  );
}

function BrainTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "blue" | "purple" | "amber" | "neutral" }) {
  const toneClasses: Record<string, string> = {
    blue: "text-status-blue",
    purple: "text-status-purple",
    amber: "text-status-amber",
    neutral: "text-ink-soft",
  };
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={cn("mt-0.5 text-[16px] font-bold tabular-nums font-display", toneClasses[tone])}>{value}</p>
      {sub && <p className="text-[10px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function LogRow({ entry, isNew }: { entry: AssemblyLogEntry; isNew: boolean }) {
  const Icon = facetIcon[entry.facet];
  return (
    <div className={cn("flex items-start gap-2 rounded-[8px] px-2 py-1.5", isNew && "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
      <div className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full", facetTone[entry.facet])}>
        <Icon className="h-2.5 w-2.5" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
          <Check className="h-2.5 w-2.5 shrink-0 text-status-green" strokeWidth={3} />
          <span className="truncate">{entry.label}</span>
        </p>
        <p className="truncate pl-4 text-[10.5px] text-ink-mute">{entry.detail}</p>
      </div>
    </div>
  );
}

function FacetAccordion({ compose }: { compose: ComposeState }) {
  const [open, setOpen] = useState<string | null>(null);
  const done = compose.brain.status === "done";

  const skillNames = assemblyLog.filter((e) => e.facet === "skill").map((e) => e.label);
  const dslNames = assemblyLog.filter((e) => e.facet === "dsl").map((e) => e.label);
  const evalNames = assemblyLog.filter((e) => e.facet === "eval").map((e) => e.label);

  const rows: {
    id: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    status: string;
    detail: React.ReactNode;
  }[] = [
    {
      id: "skills",
      icon: FileCode2,
      label: "Skills added",
      status: done ? `${compose.brain.skillsCount} skills` : "Selecting Skills",
      detail: <NameList items={skillNames} empty="Still selecting — nothing bound yet." />,
    },
    {
      id: "dsl",
      icon: Braces,
      label: "Domain Specific Language (DSL)",
      status: done && compose.brain.dslsCount > 0 ? `${compose.brain.dslsCount} bound` : "None bound",
      detail: <NameList items={dslNames} empty="No languages bound yet." />,
    },
    {
      id: "evals",
      icon: ClipboardCheck,
      label: "EVALs",
      status: String(compose.brain.evalsCount),
      detail: <NameList items={evalNames} empty="Not started." />,
    },
    {
      id: "gbrain",
      icon: FolderOpen,
      label: "GBrain",
      status: done ? "Configured" : "Configuring memory and learning",
      detail: (
        <ul className="space-y-1 text-[11.5px] text-ink-soft">
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-ink-faint" />
            Keeps 90 days
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-ink-faint" />
            Agrees after 3 runs
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-ink-faint" />8 learning passes
          </li>
        </ul>
      ),
    },
    {
      id: "sentinel",
      icon: ShieldCheck,
      label: "Sentinel",
      status: done ? "Watching" : "Resolving",
      detail: (
        <p className="text-[11.5px] leading-relaxed text-ink-soft">
          Not something the Worker knows or learns — it is the bar it is held to, and it does not set its own.
        </p>
      ),
    },
  ];

  return (
    <div className="mt-4 rounded-[12px] border border-border divide-y divide-border overflow-hidden">
      {rows.map((row) => {
        const isOpen = open === row.id;
        return (
          <div key={row.id}>
            <button
              onClick={() => setOpen(isOpen ? null : row.id)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-card-sunken"
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
              )}
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card-sunken text-ink-soft">
                <row.icon className="h-3.5 w-3.5" strokeWidth={1.9} />
              </div>
              <span className="flex-1 text-[12.5px] font-medium text-ink">{row.label}</span>
              <span className="text-[11.5px] font-semibold text-ink-mute">{row.status}</span>
            </button>
            {isOpen && (
              <div className="px-3.5 pb-3.5 pl-[52px] animate-in fade-in-0 slide-in-from-top-1 duration-150">{row.detail}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NameList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-[11.5px] text-ink-faint">{empty}</p>;
  return (
    <ul className="space-y-1">
      {items.map((n) => (
        <li key={n} className="flex items-start gap-1.5 text-[11.5px] text-ink-soft">
          <Check className="mt-0.5 h-3 w-3 shrink-0 text-status-green" strokeWidth={2.5} />
          <span>{n}</span>
        </li>
      ))}
    </ul>
  );
}
