import { useState } from "react";
import {
  FileSliders,
  Link2,
  CircleDot,
  ArrowLeftRight,
  ToggleLeft,
  Bell,
  ShieldCheck,
  Users,
  Settings2,
  Pencil,
  History,
  Info,
  Eye,
  EyeOff,
  Copy,
  Plug,
  RefreshCw,
  Check,
  X as XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { changeLog } from "./script";
import type { ComposeState, ConfigControl } from "./types";
import { cn } from "@/lib/utils";

const rowIcons: Record<string, typeof FileSliders> = {
  "Business rules & thresholds": FileSliders,
  "Data sources & connections": Link2,
  "Model selection": CircleDot,
  "Monthly budget": ArrowLeftRight,
  "Automation limits": ToggleLeft,
  "Notifications & alerts": Bell,
  "Safety rules": ShieldCheck,
  "Core agents & capabilities": Users,
};

const controlColumns: { value: ConfigControl; label: string }[] = [
  { value: "platform", label: "Platform controlled" },
  { value: "view", label: "Customer can view" },
  { value: "customer", label: "Customer can configure" },
];

export function CustomerConfigStep({
  compose,
  update,
}: {
  compose: ComposeState;
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void;
}) {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  function setControl(id: string, control: ConfigControl) {
    update(
      "customerConfig",
      compose.customerConfig.map((c) => (c.id === id ? { ...c, control } : c))
    );
  }

  function toggleApproval(id: string) {
    update(
      "customerConfig",
      compose.customerConfig.map((c) => (c.id === id ? { ...c, requiresApproval: !c.requiresApproval } : c))
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[15px] font-bold text-ink">Customer configuration and connection</p>
        <p className="mt-0.5 text-[12.5px] text-ink-mute">Define how this Worker connects to customer environments and what they can configure.</p>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-3">Connection overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <p className="text-[11px] text-ink-mute">Connection type</p>
            <div className="mt-1 flex items-center gap-1.5">
              <Plug className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
              <span className="text-[12.5px] font-medium text-ink">Secure Agent</span>
              <Badge variant="green">Connected</Badge>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ink-mute">Connected customer</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[12.5px] font-medium text-ink">Acme Corporation</span>
              <button className="text-[11px] font-medium text-accent-ink hover:underline">Change</button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ink-mute">Environment</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[12.5px] font-medium text-ink">Production</span>
              <button className="text-[11px] font-medium text-accent-ink hover:underline">Change</button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ink-mute">Last sync</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-status-green" />2 mins ago
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ink-mute">Configuration version</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[12.5px] font-medium text-ink">v2.4.1</span>
              <button className="text-[11px] font-medium text-accent-ink hover:underline">View history</button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-[14px] font-bold text-ink">What can the customer configure?</p>
            <p className="text-[12px] text-ink-mute">Control what settings the customer can view or modify after deployment.</p>
          </div>
          <Button variant="secondary" size="sm">
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Manage configuration policies
          </Button>
        </div>

        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-border bg-card-sunken px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-mute">
          <span>Configuration area</span>
          <span>Platform controlled</span>
          <span>Customer can view</span>
          <span>Customer can configure</span>
          <span>Requires approval</span>
        </div>

        {compose.customerConfig.map((item) => {
          const Icon = rowIcons[item.label] ?? Settings2;
          return (
            <div key={item.id} className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="truncate text-[12.5px] text-ink">{item.label}</span>
              </span>
              {controlColumns.map((col) => (
                <button key={col.value} onClick={() => setControl(item.id, col.value)} className="flex items-center">
                  <RadioDot checked={item.control === col.value} />
                </button>
              ))}
              <button onClick={() => toggleApproval(item.id)} className="flex items-center">
                <RadioDot checked={item.requiresApproval} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-border bg-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-bold text-ink">Integration endpoints</p>
            <p className="text-[12px] text-ink-mute">Endpoint details used for secure communication and configuration sync.</p>
          </div>
          <Button variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit endpoints
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Webhook URL</p>
            <div className="h-9 rounded-lg border border-border bg-card-sunken px-3 flex items-center text-[12.5px] text-ink-soft truncate">
              https://acme.com/webhooks/ai-worker
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">Auth type</p>
            <div className="h-9 rounded-lg border border-border bg-card px-3 flex items-center text-[12.5px] text-ink">Bearer Token</div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-1">API Key / Token</p>
            <div className="h-9 rounded-lg border border-border bg-card-sunken px-3 flex items-center gap-2 text-[12.5px] text-ink-soft">
              <span className="flex-1 truncate font-mono">{showKey ? "sk_live_8f2a91c4e6b0d3f7" : "••••••••••••••••••••"}</span>
              <button onClick={() => setShowKey((s) => !s)} className="text-ink-faint hover:text-ink shrink-0">
                {showKey ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />}
              </button>
              <button className="text-ink-faint hover:text-ink shrink-0">
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green">Verified</Badge>
            <Button variant="secondary" size="sm">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Test connection
            </Button>
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

      <div className="flex items-start gap-2.5 rounded-card border border-accent-border bg-accent-soft px-4 py-3">
        <Info className="h-4 w-4 text-accent-ink shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-[12px] text-accent-ink">
          Everything not marked "Customer can configure" stays fixed by the platform, or requires our approval to change.
        </p>
      </div>
    </div>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
        checked ? "border-accent" : "border-border-strong"
      )}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
    </span>
  );
}
