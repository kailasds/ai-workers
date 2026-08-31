import { Check, X as XIcon, TriangleAlert } from "lucide-react";
import { useWorker } from "./use-worker";
import { ConfigHeader } from "@/components/shared/config-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkerGovernance() {
  const worker = useWorker();
  const orgPolicies = worker.policies.filter((p) => p.scope === "Organization");
  const workerPolicies = worker.policies.filter((p) => p.scope === "Worker-Specific");

  return (
    <div className="pb-10 space-y-5">
      <ConfigHeader title="Worker Governance" subtitle="The rules that govern this specific worker." />

      <Card>
        <CardHeader>
          <CardTitle>Applied Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Organization Policies · inherited</p>
            <div className="space-y-1.5">
              {orgPolicies.map((p) => (
                <PolicyRow key={p.id} name={p.name} status={p.status} version={p.version} appliesTo={p.appliesTo} />
              ))}
              {orgPolicies.length === 0 && <p className="text-[12px] text-ink-faint">None inherited yet.</p>}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-mute mb-2">Worker-Specific Policies</p>
            <div className="space-y-1.5">
              {workerPolicies.map((p) => (
                <PolicyRow key={p.id} name={p.name} status={p.status} version={p.version} />
              ))}
              {workerPolicies.length === 0 && <p className="text-[12px] text-ink-faint">None configured yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Worker Authority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-status-green mb-2">The worker can</p>
              <ul className="space-y-1.5">
                {worker.authority.allowed.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <Check className="h-3.5 w-3.5 text-status-green shrink-0" strokeWidth={2.5} />
                    {a}
                  </li>
                ))}
                {worker.authority.allowed.length === 0 && <p className="text-[12px] text-ink-faint">Not configured yet.</p>}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-status-red mb-2">The worker cannot</p>
              <ul className="space-y-1.5">
                {worker.authority.forbidden.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <XIcon className="h-3.5 w-3.5 text-status-red shrink-0" strokeWidth={2.5} />
                    {a}
                  </li>
                ))}
                {worker.authority.forbidden.length === 0 && <p className="text-[12px] text-ink-faint">Not configured yet.</p>}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escalation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[12px] text-ink-mute mb-3">Escalate to humans when:</p>
            <ul className="space-y-2">
              {worker.escalationRules.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13px] text-ink-soft">
                  <TriangleAlert className="h-3.5 w-3.5 mt-0.5 text-status-amber shrink-0" strokeWidth={1.5} />
                  {r}
                </li>
              ))}
              {worker.escalationRules.length === 0 && <p className="text-[12px] text-ink-faint">No escalation rules configured yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PolicyRow({
  name,
  status,
  version,
  appliesTo,
}: {
  name: string;
  status: "Enforced" | "Exception";
  version?: string;
  appliesTo?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] text-ink truncate">{name}</p>
        {appliesTo && <p className="text-[11px] text-ink-mute">Applies to: {appliesTo}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {version && <span className="text-[11px] text-ink-mute">v{version}</span>}
        <Badge variant={status === "Enforced" ? "green" : "amber"} dot>
          {status}
        </Badge>
      </div>
    </div>
  );
}
