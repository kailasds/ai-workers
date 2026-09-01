import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X as XIcon, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AutonomyBadge } from "@/components/shared/autonomy-badge";
import { workers } from "@/lib/data";
import { cn } from "@/lib/utils";

const steps = ["Select Worker", "Describe Outcome", "Provide Inputs", "Review Scope", "Definition of Done", "Assign"];

export default function AssignWork() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("");
  const [inputs, setInputs] = useState("");

  const worker = workers.find((w) => w.id === workerId);
  const allowedActions = worker?.governance.approvalMatrix.filter((r) => r.autonomy === "Allowed") ?? [];
  const blockedActions = worker?.governance.approvalMatrix.filter((r) => r.autonomy !== "Allowed") ?? [];
  const dodRequirements = worker?.definitionOfDone.sections.flatMap((s) => s.requirements) ?? [];

  const canAdvance = (step === 0 && !!worker) || (step === 1 && outcome.trim().length > 0) || step === 2 || step === 3 || step === 4;

  return (
    <div className="pb-14">
      <PageHeader title="Assign Work" subtitle="Assign a bounded outcome to an AI Worker — accountable, not just prompted." />

      <div className="px-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-1 flex-wrap">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium",
                  i === step ? "bg-accent text-white" : i < step ? "bg-status-green-soft text-status-green" : "bg-card-sunken text-ink-mute"
                )}
              >
                {i < step ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <span className="tabular-nums">{i + 1}</span>}
                {s}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-ink-faint" strokeWidth={1.5} />}
            </div>
          ))}
        </div>

        <div className="rounded-card border border-border bg-card shadow-card p-6 min-h-[320px]">
          {step === 0 && (
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-1">Select AI Worker</h3>
              <p className="text-[12.5px] text-ink-mute mb-4">Choose the worker accountable for this outcome.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWorkerId(w.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-[12px] border p-3.5 text-left transition-colors",
                      workerId === w.id ? "border-accent bg-accent-soft" : "border-border hover:bg-card-sunken"
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{w.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink truncate">{w.name}</p>
                      <p className="text-[11.5px] text-ink-mute truncate">{w.role}</p>
                    </div>
                    <AutonomyBadge level={w.autonomy} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-1">Describe the Business Outcome</h3>
              <p className="text-[12.5px] text-ink-mute mb-4">
                Describe what {worker?.name} should own — not the steps to take, the outcome it's accountable for.
              </p>
              <Textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={5}
                placeholder="e.g. Modernize the Customer Batch Processing module from COBOL to Java with functional equivalence proven."
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-1">Provide Inputs</h3>
              <p className="text-[12.5px] text-ink-mute mb-4">Attach or reference the source material this work depends on.</p>
              <Input value={inputs} onChange={(e) => setInputs(e.target.value)} placeholder="Repository path, file references, ticket link…" />
              {worker && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Typical inputs for this worker</p>
                  <div className="flex flex-wrap gap-1.5">
                    {worker.responsibility.inputs.map((i) => (
                      <span key={i} className="rounded-full bg-card-sunken px-2.5 py-1 text-[11.5px] text-ink-soft">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && worker && (
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-1">Review Worker Scope</h3>
              <p className="text-[12.5px] text-ink-mute mb-4">This is what {worker.name} can and cannot do while completing this work.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-status-green mb-2">The worker can do</p>
                  <ul className="space-y-1.5">
                    {allowedActions.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                        <Check className="h-3.5 w-3.5 text-status-green shrink-0" strokeWidth={2.5} />
                        {a.action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-status-red mb-2">The worker cannot do</p>
                  <ul className="space-y-1.5">
                    {blockedActions.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                        <XIcon className="h-3.5 w-3.5 text-status-red shrink-0" strokeWidth={2.5} />
                        {a.action} <span className="text-[11px] text-ink-mute">({a.autonomy})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 4 && worker && (
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-1">Review Definition of Done</h3>
              <p className="text-[12.5px] text-ink-mute mb-4">
                This work will only be considered complete when the following are satisfied:
              </p>
              <ul className="space-y-1.5">
                {dodRequirements.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <Check className="h-3.5 w-3.5 text-status-green shrink-0" strokeWidth={2.5} />
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 5 && worker && (
            <div className="text-center py-8">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-status-green-soft text-status-green mb-4">
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-[16px] font-bold text-ink">Ready to assign</h3>
              <p className="mt-1.5 max-w-md mx-auto text-[13px] text-ink-soft">
                <span className="font-medium text-ink">{worker.name}</span> will own this outcome and is accountable for
                satisfying its Definition of Done before it can be marked complete.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={!canAdvance}>
              Continue
            </Button>
          ) : (
            <Button onClick={() => navigate(`/workers/${worker?.id}/operations`)}>Assign Work</Button>
          )}
        </div>
      </div>
    </div>
  );
}
