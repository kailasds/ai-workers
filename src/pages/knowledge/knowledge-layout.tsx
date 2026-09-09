import { NavLink, Outlet } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const knowledgeTabs = [
  { to: "/knowledge", label: "Learning Landscape", end: true },
  { to: "/knowledge/coverage", label: "Coverage" },
  { to: "/knowledge/candidates", label: "Candidate Decisions" },
  { to: "/knowledge/packs", label: "Packs" },
];

export function KnowledgeLayout() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Knowledge"
        subtitle="What AI Workers are learning while migrating TIBCO BusinessWorks to Java Spring Boot, and what's trusted enough to reuse."
        icon={BookOpen}
        tone="purple"
      />

      <div className="px-8">
        <div className="border-b border-border mb-5">
          <div className="flex items-center gap-6">
            {knowledgeTabs.map((t) => (
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
