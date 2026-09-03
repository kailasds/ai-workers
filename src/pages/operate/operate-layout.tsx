import { NavLink, Link, Outlet } from "react-router-dom";
import { Radio, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const operateTabs = [
  { to: "/operations", label: "Deployments", end: true },
  { to: "/operations/customer-workers", label: "Customer Workers" },
  { to: "/operations/worker-configuration", label: "Worker Configuration" },
  { to: "/operations/versions-rollouts", label: "Versions & Rollouts" },
  { to: "/operations/monitoring", label: "Monitoring" },
];

export function OperateLayout() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Operate"
        subtitle="Deploy, configure, and manage AI Workers across customer environments."
        icon={Radio}
        tone="blue"
        actions={
          <Button asChild>
            <Link to="/operations/deploy">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Deploy Worker
            </Link>
          </Button>
        }
      />

      <div className="px-8">
        <div className="border-b border-border mb-5">
          <div className="flex items-center gap-6">
            {operateTabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn(
                    "relative pb-3 text-[13.5px] font-medium transition-colors",
                    isActive ? "text-accent-ink" : "text-ink-mute hover:text-ink"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {t.label}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-accent" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
