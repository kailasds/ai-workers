import { NavLink, Outlet } from "react-router-dom";
import { Sparkle, Search, SlidersHorizontal, RefreshCw, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const hubTabs = [
  { to: "/experience-hub", label: "Recommended Updates", end: true },
  { to: "/experience-hub/stream", label: "Experience Stream" },
  { to: "/experience-hub/library", label: "Experience Library" },
  { to: "/experience-hub/history", label: "Update History" },
];

export function ExperienceHubLayout() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Experience Hub"
        subtitle="AI continuously analyzes operational experiences across deployed workers and identifies improvements that can be safely applied."
        icon={Lightbulb}
        tone="accent"
        actions={
          <>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border-strong bg-card text-ink-mute transition hover:bg-card-sunken hover:text-ink">
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border-strong bg-card text-ink-mute transition hover:bg-card-sunken hover:text-ink">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-card px-3 h-9 text-[11.5px] text-ink-mute">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Updated 4 min ago
            </div>
          </>
        }
      />

      <div className="px-8">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent-border bg-accent-soft px-3.5 py-2 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <Sparkle className="h-3.5 w-3.5 text-accent-ink" strokeWidth={1.9} />
          <p className="text-[12px] font-medium text-accent-ink">AI is analyzing recent experiences</p>
        </div>

        <div className="border-b border-border mb-5">
          <div className="flex items-center gap-6">
            {hubTabs.map((t) => (
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
