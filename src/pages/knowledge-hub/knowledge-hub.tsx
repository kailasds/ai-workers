import { useMemo, useState } from "react";
import {
  Library,
  Search,
  ChevronRight,
  ChevronDown,
  Cpu,
  Users2,
  FileCode2,
  Layers,
  CheckCircle2,
  Sparkles,
  Braces,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/shared/kpi-card";
import { DonutChart, DonutLegend } from "@/components/shared/donut-chart";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;
import {
  skillStats,
  skillsByGroup,
  skills,
  dslStats,
  businessAreas,
  type BusinessArea,
  evalCounts,
  evalPlaybooks,
  definitionOfDoneCriteria,
  slmFarmStats,
  slmFarmModels,
} from "@/lib/knowledge-hub-data";

const tagTones: BadgeProps["variant"][] = ["blue", "purple", "amber", "green"];
function tagTone(tag: string): BadgeProps["variant"] {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) % tagTones.length;
  return tagTones[hash];
}

export default function KnowledgeHub() {
  return (
    <div className="pb-12">
      <PageHeader title="Knowledge" subtitle="What Workers can draw on: skills, languages, evaluations and models." icon={Library} tone="accent" />

      <div className="px-8">
        <Tabs defaultValue="skills">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="dsl">Domain Specific Language</TabsTrigger>
            <TabsTrigger value="evals">EVAL Playbooks</TabsTrigger>
            <TabsTrigger value="dod">Definition of Done</TabsTrigger>
            <TabsTrigger value="slm">SLM Farm</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <SkillsTab />
          </TabsContent>
          <TabsContent value="dsl">
            <DslTab />
          </TabsContent>
          <TabsContent value="evals">
            <EvalsTab />
          </TabsContent>
          <TabsContent value="dod">
            <DodTab />
          </TabsContent>
          <TabsContent value="slm">
            <SlmTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatStrip({ items, className }: { items: { label: string; value: string | number; icon?: Icon }[]; className?: string }) {
  return (
    <div className={cn("mb-5 grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {items.map((s) => (
        <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
      ))}
    </div>
  );
}

function SkillsTab() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      skills.filter(
        (s) =>
          (group === "all" || s.group === group) &&
          (!query.trim() || s.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, group]
  );
  const groups = Array.from(new Set(skills.map((s) => s.group)));

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 lg:grid-cols-[340px_repeat(4,1fr)] gap-4 items-stretch">
        <div className="rounded-card border border-border bg-card shadow-card p-5 flex flex-row items-center gap-5">
          <DonutChart data={skillsByGroup} centerValue={skillStats.total} centerLabel="Skills" size={96} thickness={13} />
          <div className="min-w-0 flex-1">
            <h3 className="mb-1.5 text-[12.5px] font-bold text-ink">Skills by group</h3>
            <DonutLegend data={skillsByGroup} />
          </div>
        </div>
        <KpiCard label="Skills" value={skillStats.total} icon={FileCode2} />
        <KpiCard label="Categories" value={skillStats.categories} icon={Layers} />
        <KpiCard label="Live" value={skillStats.live} icon={CheckCircle2} />
        <KpiCard label="TCS authored" value={skillStats.tcsAuthored} icon={Sparkles} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setGroup("all")}
          className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors", group === "all" ? "bg-accent text-white" : "bg-card-sunken text-ink-mute hover:text-ink")}
        >
          Every group · {skills.length}
        </button>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors", group === g ? "bg-accent text-white" : "bg-card-sunken text-ink-mute hover:text-ink")}
          >
            {g}
          </button>
        ))}
        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.9} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills" className="pl-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setExpanded(isExpanded ? null : s.id)}
              className="rounded-[12px] border border-border bg-card p-3.5 text-left shadow-card transition-shadow hover:shadow-float"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12.5px] font-semibold leading-snug text-ink">{s.name}</p>
                <Badge variant={s.origin === "TCS" ? "accent" : "neutral"} className="shrink-0">
                  {s.origin}
                </Badge>
              </div>
              <p className={cn("mt-1.5 text-[11.5px] leading-relaxed text-ink-mute", !isExpanded && "line-clamp-2")}>{s.description}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {s.tags.map((t) => (
                  <Badge key={t} variant={tagTone(t)}>
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-[10.5px] text-ink-faint">
                <Users2 className="h-3 w-3" strokeWidth={1.9} />
                In {s.usedByWorkers} Workers
              </p>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full py-8 text-center text-[12.5px] text-ink-mute">No skills match “{query}”.</p>}
      </div>
    </div>
  );
}

function DslTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["bfsi"]));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <StatStrip
        items={[
          { label: "Languages published", value: dslStats.languagesPublished, icon: Braces },
          { label: "Business areas holding one", value: dslStats.businessAreasWithOne, icon: Building2 },
        ]}
      />
      <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
        {businessAreas.map((area) => (
          <AreaNode key={area.id} area={area} depth={0} expanded={expanded} toggle={toggle} />
        ))}
      </div>
    </div>
  );
}

function AreaNode({ area, depth, expanded, toggle }: { area: BusinessArea; depth: number; expanded: Set<string>; toggle: (id: string) => void }) {
  const isOpen = expanded.has(area.id);
  const hasContent = (area.children && area.children.length > 0) || (area.dsls && area.dsls.length > 0);

  return (
    <div>
      <button
        onClick={() => hasContent && toggle(area.id)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-card-sunken"
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        {hasContent ? (
          isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-mute" strokeWidth={2} />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className={cn("text-[13px]", depth === 0 ? "font-bold text-ink" : "font-medium text-ink-soft")}>{area.name}</span>
        {area.dsls && area.dsls.length > 0 && <Badge variant="outline">{area.dsls.length} DSL{area.dsls.length === 1 ? "" : "s"}</Badge>}
      </button>

      {isOpen && (
        <div className="pb-2 animate-in fade-in-0 duration-150">
          {area.children?.map((child) => (
            <AreaNode key={child.id} area={child} depth={depth + 1} expanded={expanded} toggle={toggle} />
          ))}
          {area.dsls?.map((d) => (
            <div key={d.id} className="mx-4 mb-2 rounded-[10px] bg-card-sunken p-3.5" style={{ marginLeft: `${16 + (depth + 1) * 20}px` }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12.5px] font-semibold text-ink">{d.name}</p>
                <Badge variant={d.available ? "green" : "neutral"} dot>
                  {d.available ? "Available to Workers" : "Not yet available"}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {d.scope.map((sc) => (
                  <Badge key={sc} variant="purple">
                    {sc}
                  </Badge>
                ))}
              </div>
              <p className="mt-1.5 text-[10.5px] text-ink-faint">
                {d.axioms} axioms · {d.measures} measures · {d.entities} entities · {d.hybridRules} hybrid rules · v{d.version}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const categoryTone: Record<string, BadgeProps["variant"]> = {
  Engineering: "blue",
  Security: "red",
  Compliance: "purple",
  Domain: "amber",
};

const categoryDotClass: Record<string, string> = {
  Engineering: "bg-status-blue",
  Security: "bg-status-red",
  Compliance: "bg-status-purple",
  Domain: "bg-status-amber",
};

function EvalsTab() {
  const [openCategory, setOpenCategory] = useState<string | null>("Engineering");
  const categories = Object.keys(evalCounts) as (keyof typeof evalCounts)[];

  return (
    <div>
      <StatStrip items={categories.map((c) => ({ label: c, value: evalCounts[c], icon: ClipboardCheck }))} />
      <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
        {categories.map((cat) => {
          const isOpen = openCategory === cat;
          const items = evalPlaybooks.filter((e) => e.category === cat);
          return (
            <div key={cat}>
              <button
                onClick={() => setOpenCategory(isOpen ? null : cat)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-card-sunken"
              >
                <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-ink-mute" strokeWidth={2} /> : <ChevronRight className="h-3.5 w-3.5 text-ink-mute" strokeWidth={2} />}
                  <span className={cn("h-2 w-2 rounded-full", categoryDotClass[cat])} />
                  {cat}
                </span>
                <Badge variant={categoryTone[cat]}>{items.length} shown</Badge>
              </button>
              {isOpen && (
                <div className="divide-y divide-border animate-in fade-in-0 duration-150">
                  {items.length === 0 && <p className="px-4 py-3 text-[12px] text-ink-mute">No representative entries loaded for this category yet.</p>}
                  {items.map((e) => (
                    <div key={e.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12.5px] font-semibold text-ink">{e.name}</p>
                        <Badge variant={e.threshold >= 95 ? "green" : e.threshold >= 80 ? "blue" : "amber"}>{e.threshold}% threshold</Badge>
                      </div>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-mute">{e.description}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant="neutral">{e.kind}</Badge>
                        <p className="font-mono text-[10.5px] text-ink-faint">{e.filedAs}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DodTab() {
  return (
    <div>
      <StatStrip
        items={[
          { label: "Criteria", value: definitionOfDoneCriteria.length, icon: ShieldCheck },
          { label: "Graded", value: definitionOfDoneCriteria.filter((d) => d.graded).length, icon: CheckCircle2 },
        ]}
      />
      <div className="rounded-card border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-ink-mute">
              <th className="px-4 py-3 font-semibold">Worker type</th>
              <th className="px-3 py-3 font-semibold">Criterion</th>
              <th className="px-3 py-3 font-semibold text-right">Threshold</th>
              <th className="px-3 py-3 font-semibold">Cleared</th>
              <th className="px-4 py-3 font-semibold">Measured by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {definitionOfDoneCriteria.map((d) => (
              <tr key={d.id} className={cn(!d.graded && "opacity-60")}>
                <td className="px-4 py-3 text-ink-mute">{d.workerType}</td>
                <td className="px-3 py-3 font-medium text-ink">{d.name}</td>
                <td className="px-3 py-3 text-right">
                  <Badge variant={d.clearedRate >= 85 ? "green" : d.clearedRate >= 50 ? "amber" : "neutral"}>{d.clearedRate}%</Badge>
                </td>
                <td className="px-3 py-3">
                  {d.graded ? (
                    <Badge variant="blue" dot>
                      {d.runsCleared} of {d.runsTotal}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Not graded</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-mute">{d.measuredBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlmTab() {
  return (
    <div>
      <StatStrip
        items={[
          { label: "Fine-tuned models", value: slmFarmStats.fineTunedModels, icon: Cpu },
          { label: "Business domains served", value: slmFarmStats.businessDomainsServed, icon: Building2 },
          { label: "In the catalogue", value: slmFarmStats.catalogue, icon: Boxes },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {slmFarmModels.map((m) => (
          <div key={m.id} className="rounded-card border border-border bg-card shadow-card p-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-status-purple-soft text-status-purple">
                <Cpu className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <p className="text-[13px] font-semibold text-ink">{m.name}</p>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-mute">{m.description}</p>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-[11.5px]">
              <div className="flex justify-between items-center"><span className="text-ink-mute">Domain</span><Badge variant="purple">{m.domain}</Badge></div>
              <div className="flex justify-between"><span className="text-ink-mute">Size</span><span className="font-medium text-ink">{m.parameters}</span></div>
              <div className="flex justify-between"><span className="text-ink-mute">Memory</span><span className="font-medium text-ink">{m.memory}</span></div>
              <div className="flex justify-between"><span className="text-ink-mute">Base model</span><span className="font-medium text-ink truncate max-w-[140px]">{m.baseModel}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
