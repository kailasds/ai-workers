import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="pb-10">
      <PageHeader title="Settings" subtitle="Organization, billing, and platform preferences." />

      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Basic details about your workspace.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[12px] text-ink-mute">Organization name</label>
              <Input defaultValue="Meridian Capital" className="mt-1.5" />
            </div>
            <div>
              <label className="text-[12px] text-ink-mute">Primary contact</label>
              <Input defaultValue="kailasds2001@gmail.com" className="mt-1.5" />
            </div>
            <Button size="sm" className="mt-1">
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>What the platform should alert you about.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow label="Escalations requiring approval" defaultChecked />
            <ToggleRow label="Budget threshold warnings" defaultChecked />
            <ToggleRow label="Weekly performance digest" defaultChecked />
            <ToggleRow label="New learning candidates" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Credentials used by connected tools and integrations.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <ApiKeyRow name="Production" value="sk-live-••••••••8f21" />
            <ApiKeyRow name="Sandbox" value="sk-test-••••••••3c04" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Plan & Billing</CardTitle>
              <CardDescription>Enterprise plan, billed annually.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-[12px] bg-card-sunken px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Enterprise</p>
                <p className="text-[11.5px] text-ink-mute">Up to 50 AI Workers · renews 2027-01-14</p>
              </div>
              <Button size="sm" variant="secondary">
                Manage plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ApiKeyRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border px-3.5 py-2.5">
      <div>
        <p className="text-[13px] text-ink">{name}</p>
        <p className="text-[11.5px] font-mono text-ink-mute">{value}</p>
      </div>
      <Button size="sm" variant="ghost">
        Rotate
      </Button>
    </div>
  );
}
