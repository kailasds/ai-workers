import { NavLink, Outlet } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const learningTabs = [
  { to: "/learning", label: "Learning Landscape", end: true },
  { to: "/learning/coverage", label: "Coverage" },
  { to: "/learning/candidates", label: "Candidate Decisions" },
  { to: "/learning/packs", label: "Packs" },
];

export function LearningLayout() {
  return (
    <div className="pb-16">
      <PageHeader
        title="Learning"
        subtitle="How AI Workers are learning while migrating TIBCO BusinessWorks to Java Spring Boot, and how mature and trustworthy that learning is."
        icon={BrainCircuit}
        tone="purple"
      />

      <div className="px-8">
        <div className="border-b border-border mb-5">
          <div className="flex items-center gap-6">
            {learningTabs.map((t) => (
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
