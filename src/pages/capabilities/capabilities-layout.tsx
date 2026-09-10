import { NavLink, Outlet } from "react-router-dom";
import { Blocks } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const capabilitiesTabs = [
  { to: "/capabilities", label: "Capability Landscape", end: true },
  { to: "/capabilities/workers", label: "Worker Registry" },
];

export function CapabilitiesLayout() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Capabilities"
        subtitle="Explore how Workers are composed and what capabilities are registered to them."
        icon={Blocks}
        tone="blue"
      />

      <div className="px-8">
        <div className="border-b border-border mb-5">
          <div className="flex items-center gap-6">
            {capabilitiesTabs.map((t) => (
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
