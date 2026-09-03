import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkle,
  ArrowRight,
  Check,
  X as XIcon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getRecommendation, getLearning, hubWorker, experienceEvents } from "@/lib/experience-hub-data";
import { cn } from "@/lib/utils";

const rolloutOptions = ["Apply Immediately", "Validate in Sandbox", "Limited Rollout", "Schedule for Later"] as const;

export default function UpdateReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const update = getRecommendation(id ?? "");
  const [customizing, setCustomizing] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Record<string, boolean>>(
    Object.fromEntries((update?.customizableParts ?? []).map((p) => [p.id, p.defaultOn]))
  );
  const [rollout, setRollout] = useState<(typeof rolloutOptions)[number]>("Validate in Sandbox");
  const [applied, setApplied] = useState(false);

  if (!update) {
    return (
      <div className="px-8 py-10">
        <p className="text-[13px] text-ink-mute">Update not found.</p>
        <Link to="/experience-hub" className="text-[13px] text-accent-ink hover:underline">
          Back to Recommended Updates
        </Link>
      </div>
    );
  }

  const target = hubWorker(update.targetWorkerId);
  const learning = getLearning(update.sourceLearningId);
  const sourceExperiences = experienceEvents.filter((e) => learning?.sourceExperienceIds.includes(e.id));

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <Link to="/experience-hub" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Recommended Updates
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">{update.title}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="accent">{update.status}</Badge>
              <span className="text-[12.5px] text-ink-mute">
                Target Worker: <span className="font-medium text-ink-soft">{target.name}</span>
              </span>
              <span className="text-ink-faint">·</span>
              <span className="text-[12.5px] text-ink-mute">Recommended by: Experience Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      {applied ? (
        <div className="px-8 mt-6">
          <div className="rounded-card border border-status-green/25 bg-status-green-soft p-8 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-status-green mb-3">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] font-semibold text-ink">Update scheduled for rollout</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              {target.name} will begin {rollout.toLowerCase()} — this update will now appear under Update History for monitoring.
            </p>
            <Button className="mt-4" onClick={() => navigate("/experience-hub/history")}>
              View Update History
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-8 mt-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
          <div className="min-w-0 space-y-5">
            <Section title="Why this update is recommended">
              <div className="flex items-start gap-2.5 rounded-lg bg-accent-soft px-4 py-3.5">
                <Sparkle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
                <p className="text-[13px] leading-relaxed text-accent-ink">{update.aiSummary}</p>
              </div>
            </Section>

            <Section title="Experience Origin">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <Field label="Source Worker" value={learning?.observedIn[0]?.split(" — ")[0] ?? target.name} />
                <Field label="Experience Stage" value="Production Operations" />
                <Field label="Observed Across" value={`${update.observedAcross} scenarios`} />
                <Field label="Applicable To" value={`${update.applicableToCount} similar workers`} />
              </div>
              <p className="text-[12.5px] text-ink-soft leading-relaxed">
                <span className="font-medium text-ink">Pattern:</span> {learning?.whatWasLearned}
              </p>
              {learning && (
                <Link to={`/experience-hub/library/${learning.id}`} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline">
                  View Related Experiences
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              )}
            </Section>

            <Section title="Evidence Timeline">
              <div className="space-y-0">
                {update.evidenceTimeline.map((step, i) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                        {i + 1}
                      </span>
                      {i < update.evidenceTimeline.length - 1 && <span className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink">{step.label}</p>
                      <p className="text-[12.5px] text-ink-soft leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-status-green text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-status-green">Validated Learning</p>
                    <p className="text-[12.5px] text-ink-soft italic">"{learning?.whatWasLearned}"</p>
                  </div>
                </div>
              </div>
              {sourceExperiences.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sourceExperiences.map((e) => (
                    <Link key={e.id} to={`/experience-hub/stream/${e.id}`}>
                      <Badge variant="outline" className="hover:bg-card-sunken cursor-pointer">
                        {e.title}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Section>

            {(update.currentBehavior.length > 0 || update.comparisonTable.length > 0) && (
              <Section title="What Will Change">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Current Worker Behavior</p>
                    <FlowSteps steps={update.currentBehavior} tone="neutral" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Recommended Behavior</p>
                    <FlowSteps steps={update.recommendedBehavior} tone="accent" />
                  </div>
                </div>

                {update.comparisonTable.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-[1fr_1.3fr_1.3fr] gap-3 bg-card-sunken px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                      <span>Component</span>
                      <span>Current</span>
                      <span>Recommended</span>
                    </div>
                    {update.comparisonTable.map((row) => (
                      <div key={row.component} className="grid grid-cols-[1fr_1.3fr_1.3fr] gap-3 border-t border-border px-4 py-2.5 text-[12.5px]">
                        <span className="font-medium text-ink">{row.component}</span>
                        <span className="text-ink-mute">{row.current}</span>
                        <span className="text-accent-ink font-medium">{row.recommended}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            <Section title="Expected Impact">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Field label="Improves" value="Successful completion in similar scenarios" />
                <Field label="Reduces" value={update.consistentOutcome} />
                <Field label="Based on" value={`${update.observedAcross} observed executions`} />
              </div>
              <div className="rounded-lg border border-border-strong px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={update.impactLevel === "High" ? "green" : update.impactLevel === "Medium" ? "amber" : "neutral"}>
                    {update.impactLevel} Impact
                  </Badge>
                  <Badge variant="outline">{update.riskLevel}</Badge>
                </div>
                <p className="text-[12.5px] text-ink-soft leading-relaxed">{update.impactReason}</p>
              </div>
            </Section>

            <Section title="Compatibility & Dependencies">
              <div className="space-y-2">
                {update.compatibility.map((c) => (
                  <div key={c.label} className="flex items-start gap-2.5">
                    {c.ok ? (
                      <Check className="h-4 w-4 text-status-green shrink-0 mt-0.5" strokeWidth={2.5} />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-status-amber shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <div>
                      <p className={cn("text-[12.5px]", c.ok ? "text-ink" : "text-status-amber font-medium")}>{c.label}</p>
                      {c.note && <p className="text-[11.5px] text-ink-mute mt-0.5">{c.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="AI Recommended Rollout">
              <p className="text-[12.5px] text-ink-soft mb-3">Test this update on a controlled environment before applying it to production.</p>
              <div className="flex flex-wrap items-center gap-2">
                {update.rolloutSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="rounded-lg border border-border-strong bg-card-sunken px-3 py-1.5 text-[12px] font-medium text-ink-soft">{step}</span>
                    {i < update.rolloutSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Choose rollout strategy</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rolloutOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRollout(opt)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-[12px] font-medium transition-colors",
                      rollout === opt ? "border-accent bg-accent-soft text-accent-ink" : "border-border text-ink-soft hover:bg-card-sunken"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Section>

            {customizing && update.customizableParts.length > 0 && (
              <Section title="Customize Update">
                <div className="space-y-2">
                  {update.customizableParts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-card-sunken cursor-pointer">
                      <Checkbox
                        checked={selectedParts[p.id]}
                        onCheckedChange={(v) => setSelectedParts((s) => ({ ...s, [p.id]: v === true }))}
                      />
                      <span className="text-[12.5px] text-ink-soft">{p.label}</span>
                    </label>
                  ))}
                </div>
                <Button className="mt-3" size="sm" onClick={() => setApplied(true)}>
                  Apply Selected Changes
                </Button>
              </Section>
            )}
          </div>

          <div className="rounded-card border border-border bg-card shadow-card p-5 xl:sticky xl:top-5 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Actions</p>
            <Button className="w-full" onClick={() => setApplied(true)}>
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Apply Update
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setCustomizing((c) => !c)}>
              Customize Update
            </Button>
            <Button variant="secondary" className="w-full">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              Save for Later
            </Button>
            <Button variant="ghost" className="w-full text-status-red hover:bg-status-red-soft hover:text-status-red">
              <XIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Dismiss Recommendation
            </Button>

            <div className="pt-3 mt-3 border-t border-border">
              <p className="flex items-center gap-1.5 text-[11.5px] text-ink-mute">
                <ShieldCheck className="h-3.5 w-3.5 text-status-green" strokeWidth={1.75} />
                Human review required before rollout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5">
      <p className="text-[13.5px] font-bold text-ink mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-medium text-ink">{value}</p>
    </div>
  );
}

function FlowSteps({ steps, tone }: { steps: string[]; tone: "neutral" | "accent" }) {
  return (
    <div className="space-y-1.5">
      {steps.map((step, i) => (
        <div key={step}>
          {i > 0 && <div className="pl-3 text-ink-faint text-[11px]">↓</div>}
          <span
            className={cn(
              "block rounded-lg border px-3 py-2 text-[12px] font-medium",
              tone === "accent" ? "border-accent-border bg-accent-soft text-accent-ink" : "border-border bg-card-sunken text-ink-soft"
            )}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
