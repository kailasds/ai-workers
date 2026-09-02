import { useState } from "react";
import { Building2, Plug, Sliders, Cpu, ToggleLeft, Database, RefreshCw, History, Check, X as XIcon, Eye } from "lucide-react";
import { EditableSelect, type SelectOption } from "@/components/shared/editable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { changeLog } from "./script";
import type { ComposeState, ConfigControl } from "./types";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, typeof Building2> = {
  "Business Configuration": Building2,
  "Integration Configuration": Plug,
  "Worker Behaviour": Sliders,
  "Model Configuration": Cpu,
  "Feature Configuration": ToggleLeft,
  "Data Configuration": Database,
};

const controlOptions: SelectOption[] = [
  { value: "platform", label: "Platform Controlled", description: "Fixed by us — the customer cannot change this." },
  { value: "customer", label: "Customer Configurable", description: "The customer can change this directly in their portal." },
  { value: "request", label: "Request Required", description: "The customer must submit a request for us to approve." },
];

const controlTone: Record<ConfigControl, "neutral" | "green" | "amber"> = {
  platform: "neutral",
  customer: "green",
  request: "amber",
};

const syncOptions: SelectOption[] = [
  { value: "webhook", label: "Webhook", description: "Customer environment pushes changes to us in real time." },
  { value: "polling", label: "Polling", description: "We poll the customer environment on a schedule." },
  { value: "event-driven", label: "Event-Driven", description: "Changes flow through an event bus between environments." },
];

export function CustomerConfigStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const categories = Array.from(new Set(compose.customerConfig.map((c) => c.category)));
  const [reviewing, setReviewing] = useState<string | null>(null);

  function setControl(id: string, control: ConfigControl) {
    update(
      "customerConfig",
      compose.customerConfig.map((c) => (c.id === id ? { ...c, control } : c))
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-border bg-card shadow-card p-4">
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          Define what a customer can configure once this Worker is deployed to their environment. Everything not marked
          "Customer Configurable" stays fixed by the platform, or requires our approval to change.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category] ?? Sliders;
          const items = compose.customerConfig.filter((c) => c.category === category);
          return (
            <div key={category} className="rounded-card border border-border bg-card shadow-card overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-border bg-card-sunken px-4 py-2.5">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                </div>
                <p className="text-[12.5px] font-semibold text-ink">{category}</p>
              </div>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="text-[12.5px] text-ink-soft">{item.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={controlTone[item.control]}>{controlOptions.find((o) => o.value === item.control)?.label}</Badge>
                      <EditableSelect value={item.control} aiValue={item.control} options={controlOptions} onChange={(v) => setControl(item.id, v as ConfigControl)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw className="h-4 w-4 text-accent" strokeWidth={1.9} />
          <p className="text-[14px] font-bold text-ink">Configuration Sync &amp; Change Management</p>
        </div>
        <p className="text-[12px] text-ink-mute mb-4">
          The Worker stays connected to our control plane even after deployment — customer changes flow back for review.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Sync Method</p>
            <EditableSelect value={compose.syncMethod} aiValue="webhook" options={syncOptions} onChange={(v) => update("syncMethod", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SyncStat label="Connection Status" value="Connected" tone="green" />
            <SyncStat label="Last Sync" value="2 min ago" />
            <SyncStat label="Config Version" value="v1.0" />
            <SyncStat label="Pending Changes" value={String(changeLog.filter((c) => c.status === "Pending Review").length)} tone="amber" />
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border bg-card-sunken px-4 py-2.5">
          <History className="h-3.5 w-3.5 text-ink-soft" strokeWidth={1.9} />
          <p className="text-[12.5px] font-semibold text-ink">Configuration Change Log</p>
        </div>
        <div className="divide-y divide-border">
          {changeLog.map((c) => (
            <div key={c.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] text-ink">
                    <span className="font-medium">{c.setting}</span>: {c.from} → {c.to}
                  </p>
                  <p className="text-[11px] text-ink-mute">
                    Changed by {c.changedBy} · {new Date(c.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={c.status === "Approved" ? "green" : c.status === "Rejected" ? "red" : "amber"} className="shrink-0">
                  {c.status}
                </Badge>
              </div>
              {c.status === "Pending Review" && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setReviewing(reviewing === c.id ? null : c.id)}>
                    <Eye className="h-3 w-3" strokeWidth={2} /> View Difference
                  </Button>
                  <Button size="sm">
                    <Check className="h-3 w-3" strokeWidth={2.5} /> Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XIcon className="h-3 w-3" strokeWidth={2.5} /> Reject
                  </Button>
                </div>
              )}
              {reviewing === c.id && (
                <div className="mt-2 rounded-[8px] bg-card-sunken px-3 py-2 text-[11.5px]">
                  <span className="text-status-red line-through">{c.from}</span>
                  <span className="mx-1.5 text-ink-faint">→</span>
                  <span className="text-status-green font-medium">{c.to}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SyncStat({ label, value, tone }: { label: string; value: string; tone?: "green" | "amber" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-mute">{label}</p>
      <p className={cn("mt-0.5 text-[13px] font-semibold tabular-nums", tone === "green" ? "text-status-green" : tone === "amber" ? "text-status-amber" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}
