import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function Sentinel() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Sentinel"
        subtitle="System protection and governance"
        icon={ShieldAlert}
        tone="red"
      />
      <div className="px-8">
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border bg-card px-8 text-center">
          <p className="text-[13px] font-medium text-ink-soft">No Sentinel controls have been configured yet.</p>
          <p className="max-w-md text-[12px] text-ink-faint">
            Sentinel will surface drift, policy violations, anomalies, risk, governance and Worker health signals across the platform as they're defined.
          </p>
        </div>
      </div>
    </div>
  );
}
