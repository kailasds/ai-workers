import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkle,
  Check,
  ChevronRight,
  ArrowRight,
  Rocket,
  AlertTriangle,
  Info,
  Lock,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deployableWorkers,
  deploymentCustomers,
  performanceProfiles,
  deployments,
  type DeployableWorker,
  type DeploymentCustomer,
  type PerformanceProfile,
} from "@/lib/deployments-data";
import { cn } from "@/lib/utils";

const steps = [
  { id: "worker", label: "Select Worker" },
  { id: "customer", label: "Select Customer" },
  { id: "package", label: "Configure Package" },
  { id: "experience", label: "Experience & Learning" },
  { id: "budget", label: "Budget & Limits" },
  { id: "review", label: "Review & Deploy" },
] as const;

type StepId = (typeof steps)[number]["id"];

const capabilitiesCatalog = [
  { id: "extraction", name: "Document Extraction", description: "Extracts structured data from source documents.", customerConfigurable: true },
  { id: "confidence", name: "Confidence Validation", description: "Validates extraction confidence before handoff.", customerConfigurable: false },
  { id: "fallback", name: "Fallback Processing", description: "Falls back to an alternate strategy when primary extraction fails.", customerConfigurable: false },
  { id: "escalation", name: "Manual Review Escalation", description: "Escalates low-confidence results to a human reviewer.", customerConfigurable: true },
];

const packageTabs = ["Capabilities", "Models", "Tools & Integrations", "Safety", "Performance Profile", "Customer Controls"] as const;

const toolsCatalog = [
  { name: "Salesforce", access: "Customer Configurable" as const },
  { name: "Internal Knowledge API", access: "Platform Controlled" as const },
  { name: "Document Storage", access: "Customer Configurable" as const },
];

const customerControlRows = [
  { label: "Model Selection", value: "Primary Model", view: true, modify: false, platform: true },
  { label: "Confidence Threshold", value: "85%", view: true, modify: true, platform: false },
  { label: "Fallback Tool", value: "OCR Tool B", view: true, modify: false, platform: true },
  { label: "Monthly Budget", value: "$4,500", view: true, modify: true, platform: false },
  { label: "Safety Policy", value: "Enterprise Policy", view: true, modify: false, platform: true },
  { label: "Experience Updates", value: "Manual Approval", view: true, modify: true, platform: false },
];

export default function DeployWorker() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>("worker");
  const [worker, setWorker] = useState<DeployableWorker | null>(null);
  const [customer, setCustomer] = useState<DeploymentCustomer | null>(null);
  const [packageTab, setPackageTab] = useState<(typeof packageTabs)[number]>("Capabilities");
  const [profile, setProfile] = useState<PerformanceProfile>("Standard");
  const [capabilities, setCapabilities] = useState<Record<string, boolean>>(Object.fromEntries(capabilitiesCatalog.map((c) => [c.id, true])));
  const [experienceCollection, setExperienceCollection] = useState<"Enabled" | "Limited" | "Disabled">("Enabled");
  const [experienceSharing, setExperienceSharing] = useState<"Private" | "Anonymous Contribution" | "Approved Sharing">("Anonymous Contribution");
  const [recommendedUpdates, setRecommendedUpdates] = useState(true);
  const [updateApproval, setUpdateApproval] = useState<"Automatic Recommendations" | "Manual Approval Required" | "Automatic Rollout for Low-Risk Updates">("Manual Approval Required");
  const [monthlyBudget, setMonthlyBudget] = useState(4500);
  const [deployed, setDeployed] = useState(false);

  const stepIndex = steps.findIndex((s) => s.id === step);
  const existingForCustomer = worker && customer ? deployments.find((d) => d.workerId === worker.id && d.customerId === customer.id) : null;

  function goTo(id: StepId) {
    setStep(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function next() {
    if (stepIndex < steps.length - 1) goTo(steps[stepIndex + 1].id);
  }
  function back() {
    if (stepIndex > 0) goTo(steps[stepIndex - 1].id);
  }

  const canProceed = step === "worker" ? !!worker : step === "customer" ? !!customer : true;

  if (deployed && worker && customer) {
    return (
      <div className="px-8 py-14 max-w-lg mx-auto text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-status-green-soft text-status-green mb-4">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-[20px] font-bold text-ink">Deployment created</h1>
        <p className="mt-2 text-[13px] text-ink-mute">
          {worker.name} is being provisioned for {customer.name}. You can track its status from the deployment detail page.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="secondary" onClick={() => navigate("/operations")}>
            Back to Deployments
          </Button>
          <Button onClick={() => navigate("/operations/deployments/dep-1")}>View Deployment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="px-8 pt-6">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink">Deploy Worker</h1>
        <p className="mt-1 text-[13px] text-ink-mute">Configure and deploy an AI Worker to a customer environment.</p>

        <div className="mt-4 flex items-start gap-2.5 rounded-card border border-accent-border bg-accent-soft px-4 py-3.5">
          <Sparkle className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
          <div className="flex-1">
            <p className="text-[12.5px] text-accent-ink">
              AI has prepared a recommended deployment configuration based on this worker's successful deployments.
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm">Apply Recommended Configuration</Button>
              <Button size="sm" variant="secondary">
                Customize Manually
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex overflow-x-auto rounded-card border border-border bg-card shadow-card">
          {steps.map((s, i) => {
            const isCurrent = s.id === step;
            const isDone = i < stepIndex;
            return (
              <button
                key={s.id}
                onClick={() => i <= stepIndex && goTo(s.id)}
                className={cn(
                  "flex min-w-[130px] flex-1 items-center gap-2 border-b-2 px-3.5 py-2.5 text-left transition-colors",
                  isCurrent ? "border-accent bg-accent-soft" : "border-transparent hover:bg-card-sunken"
                )}
              >
                <div
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold",
                    isCurrent ? "bg-accent text-white" : isDone ? "bg-status-green text-white" : "bg-card-sunken text-ink-mute"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </div>
                <p className={cn("text-[11.5px] font-medium truncate", isCurrent ? "text-accent-ink" : "text-ink")}>{s.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 mt-5">
        {step === "worker" && (
          <div className="space-y-3">
            {deployableWorkers.map((w) => (
              <button
                key={w.id}
                onClick={() => setWorker(w)}
                className={cn(
                  "w-full text-left rounded-card border p-4 transition-colors",
                  worker?.id === w.id ? "border-accent bg-accent-soft" : "border-border bg-card hover:bg-card-sunken"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{w.name}</p>
                    <p className="text-[12.5px] text-ink-mute mt-0.5">{w.purpose}</p>
                  </div>
                  {worker?.id === w.id && <Check className="h-4 w-4 text-accent-ink shrink-0" strokeWidth={2.5} />}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-4 text-[11.5px]">
                  <Field label="Version" value={w.version} />
                  <Field label="Deployed To" value={`${w.deployedToCount} customers`} />
                  <Field label="Experience Level" value={w.experienceLevel} />
                  <Field label="Validated Learnings" value={String(w.validatedLearnings)} />
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "customer" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deploymentCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCustomer(c)}
                  className={cn(
                    "text-left rounded-card border p-4 transition-colors",
                    customer?.id === c.id ? "border-accent bg-accent-soft" : "border-border bg-card hover:bg-card-sunken"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13.5px] font-semibold text-ink">{c.name}</p>
                    {customer?.id === c.id && <Check className="h-3.5 w-3.5 text-accent-ink" strokeWidth={2.5} />}
                  </div>
                  <p className="mt-1 text-[11.5px] text-ink-mute">
                    {c.industry} · {c.region} · {c.portal}
                  </p>
                </button>
              ))}
            </div>

            {customer && worker && (
              <div className="rounded-card border border-accent-border bg-accent-soft p-4">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-ink mb-2">
                  <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
                  AI Insight — {customer.name}
                </p>
                {existingForCustomer ? (
                  <p className="text-[12.5px] text-ink">
                    {customer.name} already has {worker.name} deployed at {existingForCustomer.version}. Deploying again will create a new,
                    independent deployment — consider using Versions &amp; Rollouts to upgrade the existing one instead.
                  </p>
                ) : (
                  <p className="text-[12.5px] text-ink">
                    No version conflicts detected. {customer.name} has no existing deployment of {worker.name} — this will be a new deployment
                    with the platform-recommended configuration.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {step === "package" && worker && (
          <div className="space-y-4">
            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Worker Base Version" value={`${worker.name} ${worker.version}`} />
                <Field label="Configuration Source" value="Platform Default" />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-border pb-0">
              {packageTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setPackageTab(t)}
                  className={cn(
                    "rounded-t-lg px-3.5 py-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors",
                    packageTab === t ? "border-accent text-accent-ink" : "border-transparent text-ink-mute hover:text-ink"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {packageTab === "Capabilities" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 rounded-lg bg-accent-soft px-3.5 py-2.5">
                  <Sparkle className="h-3.5 w-3.5 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.9} />
                  <p className="text-[12px] text-accent-ink">Based on similar customer deployments, these {capabilitiesCatalog.length} capabilities are recommended.</p>
                </div>
                <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
                  {capabilitiesCatalog.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{c.name}</p>
                        <p className="text-[11.5px] text-ink-mute">{c.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={c.customerConfigurable ? "green" : "neutral"}>
                          {c.customerConfigurable ? "Customer configurable" : "Platform controlled"}
                        </Badge>
                        <Toggle checked={capabilities[c.id]} onChange={(v) => setCapabilities((s) => ({ ...s, [c.id]: v }))} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {packageTab === "Models" && (
              <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
                <ConfigRow label="Primary Model" value="Claude Sonnet 5" owner="Platform Controlled" />
                <ConfigRow label="Fallback Model" value="Claude Haiku 4.5" owner="Platform Controlled" />
                <ConfigRow label="Model Selection Strategy" value="Fixed routing" owner="Platform Controlled" />
                <ConfigRow label="Context Limits" value="200K tokens" owner="Customer Configurable" />
                <ConfigRow label="Inference Limits" value="30 req/min" owner="Customer Configurable" />
              </div>
            )}

            {packageTab === "Tools & Integrations" && (
              <div className="rounded-card border border-border bg-card shadow-card divide-y divide-border">
                {toolsCatalog.map((t) => (
                  <div key={t.name} className="flex items-center justify-between gap-4 px-4 py-3">
                    <p className="text-[13px] font-medium text-ink">{t.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="green">Enabled</Badge>
                      <Badge variant={t.access === "Customer Configurable" ? "green" : "neutral"}>{t.access}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {packageTab === "Safety" && (
              <div className="space-y-3">
                <div className="rounded-card border border-border bg-card shadow-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Platform Safety Policies</p>
                  <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
                    <li>Production deployment requires human approval.</li>
                    <li>Sensitive data access is masked by default.</li>
                    <li>All decisions are logged for audit.</li>
                  </ul>
                </div>
                <div className="rounded-card border border-border bg-card shadow-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Customer-Specific Safety Configuration</p>
                  <ConfigRow label="Approval Requirements" value="Required for production changes" owner="Customer Configurable" flat />
                  <ConfigRow label="Escalation Rules" value="Escalate after 2 consecutive failures" owner="Customer Configurable" flat />
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <Lock className="h-3 w-3" strokeWidth={2} />
                    Platform safety rules always override customer configuration.
                  </p>
                </div>
              </div>
            )}

            {packageTab === "Performance Profile" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(performanceProfiles) as PerformanceProfile[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfile(p)}
                      className={cn(
                        "text-left rounded-card border p-3.5 transition-colors",
                        profile === p ? "border-accent bg-accent-soft" : "border-border bg-card hover:bg-card-sunken"
                      )}
                    >
                      <p className={cn("text-[13px] font-semibold", profile === p ? "text-accent-ink" : "text-ink")}>{p}</p>
                      <p className="mt-1 text-[11.5px] text-ink-mute leading-snug">{performanceProfiles[p].description}</p>
                    </button>
                  ))}
                </div>
                <div className="rounded-card border border-border bg-card shadow-card p-4">
                  <p className="text-[13px] font-bold text-ink mb-2">{profile.toUpperCase()} PROFILE</p>
                  <div className="grid grid-cols-3 gap-4 text-[12.5px]">
                    <Field label="Validated Experience Access" value={performanceProfiles[profile].experienceAccess} />
                    <Field label="Optimization Patterns" value={performanceProfiles[profile].optimizationPatterns} />
                    <Field label="Advanced Strategies" value={performanceProfiles[profile].advancedStrategies} />
                  </div>
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] text-ink-mute">
                    <Info className="h-3 w-3 shrink-0 mt-0.5" strokeWidth={2} />
                    Expected performance range is based on comparable deployments — actual outcomes depend on customer data, environment,
                    integrations, and usage.
                  </p>
                </div>
              </div>
            )}

            {packageTab === "Customer Controls" && (
              <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr] gap-3 bg-card-sunken px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
                  <span>Configuration</span>
                  <span>Current Value</span>
                  <span>View</span>
                  <span>Modify</span>
                  <span>Platform Controlled</span>
                </div>
                {customerControlRows.map((r) => (
                  <div key={r.label} className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr] items-center gap-3 border-t border-border px-4 py-2.5 text-[12.5px]">
                    <span className="font-medium text-ink">{r.label}</span>
                    <span className="text-ink-soft">{r.value}</span>
                    <span>{r.view ? <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2.5} /> : "—"}</span>
                    <span>{r.modify ? <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2.5} /> : "—"}</span>
                    <span>{r.platform ? <Check className="h-3.5 w-3.5 text-status-green" strokeWidth={2.5} /> : "—"}</span>
                  </div>
                ))}
                <p className="px-4 py-2.5 border-t border-border text-[11px] text-ink-mute">The platform controls which settings are exposed to the customer.</p>
              </div>
            )}
          </div>
        )}

        {step === "experience" && (
          <div className="space-y-4">
            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <p className="text-[13px] font-bold text-ink mb-1">Experience Collection</p>
              <p className="text-[11.5px] text-ink-mute mb-2">Should experiences from this deployment be sent back to the central platform?</p>
              <SegmentedControl options={["Enabled", "Limited", "Disabled"]} value={experienceCollection} onChange={(v) => setExperienceCollection(v as typeof experienceCollection)} />
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <p className="text-[13px] font-bold text-ink mb-1">Experience Sharing</p>
              <p className="text-[11.5px] text-ink-mute mb-2">Can validated learnings from this customer contribute to the global Experience Library?</p>
              <SegmentedControl
                options={["Private", "Anonymous Contribution", "Approved Sharing"]}
                value={experienceSharing}
                onChange={(v) => setExperienceSharing(v as typeof experienceSharing)}
              />
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-bold text-ink">Recommended Updates</p>
                <Toggle checked={recommendedUpdates} onChange={setRecommendedUpdates} />
              </div>
              {recommendedUpdates && (
                <>
                  <p className="text-[11.5px] text-ink-mute mb-2">
                    The Experience Hub will analyze validated learnings and recommend compatible improvements. Updates will not be applied
                    automatically unless automatic rollout is configured.
                  </p>
                  <SegmentedControl
                    options={["Automatic Recommendations", "Manual Approval Required", "Automatic Rollout for Low-Risk Updates"]}
                    value={updateApproval}
                    onChange={(v) => setUpdateApproval(v as typeof updateApproval)}
                  />
                </>
              )}
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <p className="text-[13px] font-bold text-ink mb-3">Experience Privacy &amp; Isolation</p>
              <div className="flex flex-wrap items-center gap-2">
                {["Customer Data", "Private Experience", "Anonymization / Sanitization", "Pattern Extraction", "Validation", "Global Experience Library"].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="rounded-lg border border-border bg-card-sunken px-3 py-1.5 text-[11.5px] font-medium text-ink-soft">{s}</span>
                    {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />}
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-ink-mute">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-status-green" strokeWidth={2} />
                Private experience remains isolated to this customer unless explicitly approved for anonymization and pattern extraction.
              </p>
            </div>
          </div>
        )}

        {step === "budget" && (
          <div className="space-y-4">
            <div className="rounded-card border border-accent-border bg-accent-soft p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-ink mb-1">
                <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
                Recommended Monthly Budget: ${monthlyBudget.toLocaleString()}
              </p>
              <p className="text-[12px] text-accent-ink">Based on the expected workload and usage pattern of similar deployments.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => setMonthlyBudget(4500)}>
                  Apply AI Recommendation
                </Button>
                <Button size="sm" variant="secondary">
                  Customize
                </Button>
              </div>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField label="Monthly Budget (USD)" value={monthlyBudget} onChange={setMonthlyBudget} />
              <NumberField label="Inference Budget (USD)" value={3000} />
              <NumberField label="Maximum Requests / day" value={5000} />
              <NumberField label="Token Limits / request" value={200000} />
              <NumberField label="Tool Usage Limits / day" value={1500} />
              <NumberField label="Rate Limit (req/min)" value={30} />
              <NumberField label="Auto-Pause Threshold (%)" value={95} />
              <NumberField label="Budget Alert Threshold (%)" value={80} />
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Projected Usage</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-card-sunken">
                <div className="h-full rounded-full bg-accent" style={{ width: "62%" }} />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-mute">Projected at 62% of monthly budget based on comparable deployments.</p>
            </div>
          </div>
        )}

        {step === "review" && worker && customer && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
            <div className="min-w-0 space-y-4">
              <div className="rounded-card border border-border bg-card shadow-card p-5">
                <p className="text-[13.5px] font-bold text-ink mb-3">Deployment Summary</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Worker" value={worker.name} />
                  <Field label="Customer" value={customer.name} />
                  <Field label="Base Version" value={worker.version} />
                  <Field label="Performance Profile" value={profile} />
                  <Field label="Experience Collection" value={experienceCollection} />
                  <Field label="Experience Sharing" value={experienceSharing} />
                  <Field label="Recommended Updates" value={recommendedUpdates ? updateApproval : "Disabled"} />
                  <Field label="Monthly Budget" value={`$${monthlyBudget.toLocaleString()}`} />
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-card border border-status-amber/25 bg-status-amber-soft px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-status-amber shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[12px] text-ink">
                  This will deploy a new worker instance to production for {customer.name}. Review the configuration above before confirming.
                </p>
              </div>
            </div>

            <div className="rounded-card border border-border bg-card shadow-card p-5">
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink mb-3">
                <Users2 className="h-4 w-4 text-accent" strokeWidth={1.9} />
                Ready to deploy
              </p>
              <Button className="w-full" onClick={() => setDeployed(true)}>
                <Rocket className="h-3.5 w-3.5" strokeWidth={2} />
                Deploy Worker
              </Button>
            </div>
          </div>
        )}

        {step !== "review" && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" disabled={stepIndex === 0} onClick={back}>
              Back
            </Button>
            <Button disabled={!canProceed} onClick={next}>
              Continue
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          </div>
        )}
        {step === "review" && (
          <div className="mt-6">
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
          </div>
        )}
      </div>
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

function ConfigRow({ label, value, owner, flat }: { label: string; value: string; owner: string; flat?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", flat ? "py-1.5" : "px-4 py-3")}>
      <div>
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-[11.5px] text-ink-mute">{value}</p>
      </div>
      <Badge variant={owner === "Platform Controlled" ? "neutral" : "green"}>{owner}</Badge>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-border-strong")}
    >
      <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform", checked && "translate-x-[18px]")} />
    </button>
  );
}

function SegmentedControl<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-card-sunken p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
            value === o ? "bg-card text-accent-ink shadow-card" : "text-ink-mute hover:text-ink"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange?: (v: number) => void }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        disabled={!onChange}
        className="h-9 w-full rounded-lg border border-border bg-card-sunken px-3 text-[12.5px] text-ink outline-none disabled:opacity-70"
      />
    </div>
  );
}
